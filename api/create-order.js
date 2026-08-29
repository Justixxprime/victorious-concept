import { createClient } from '@supabase/supabase-js'
import { sendConfirmationEmail } from './_lib/sendConfirmationEmail.js'

// This runs on Vercel's servers only — it uses the secret service-role key,
// which must NEVER be exposed to the browser. Do not import this file or its
// env vars into anything under src/.
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function generateOrderNumber() {
  const date = new Date()
  const y = date.getFullYear().toString().slice(-2)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `VC-${y}${m}${d}-${random}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { items, couponCode, customer, userId, email, paymentMethod } = req.body

    // --- Basic input validation ---
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }
    if (!customer?.name || !customer?.phone || !customer?.address) {
      return res.status(400).json({ error: 'Missing customer details' })
    }
    if (!['card', 'bank_transfer', 'whatsapp'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' })
    }

    // --- Look up REAL product data. The client only sends id + quantity + size;
    // price and availability always come from the database, never the request body. ---
    const ids = items.map((i) => i.id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock, status')
      .in('id', ids)

    if (productsError) {
      return res.status(500).json({ error: 'Could not verify products' })
    }

    const orderItems = []
    for (const requested of items) {
      const product = products.find((p) => String(p.id) === String(requested.id))
      const quantity = Number(requested.quantity)

      if (!product) {
        return res.status(400).json({ error: `Product ${requested.id} no longer exists` })
      }
      if (product.status === 'hidden') {
        return res.status(400).json({ error: `${product.name} is not currently available` })
      }
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: `Invalid quantity for ${product.name}` })
      }
      if (product.status !== 'preorder' && product.stock < quantity) {
        return res.status(400).json({ error: `Not enough stock for ${product.name}` })
      }

      orderItems.push({
        id: product.id,
        name: product.name,
        price: product.price, // server price, ignoring anything the client sent
        quantity,
        size: requested.size || null,
      })
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    // --- Coupon: re-validated server-side, never trusting a client-computed discount ---
    let discount = 0
    let appliedCouponCode = null
    let matchedCoupon = null
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('active', true)
        .maybeSingle()

      const now = new Date()
      const notExpired = !coupon?.expires_at || new Date(coupon.expires_at) > now
      const underUsageLimit = !coupon?.max_uses || coupon.used_count < coupon.max_uses
      const meetsMinOrder = !coupon?.min_order_amount || subtotal >= coupon.min_order_amount

      if (coupon && notExpired && underUsageLimit && meetsMinOrder) {
        discount = Math.round(subtotal * (coupon.percent_off / 100))
        appliedCouponCode = coupon.code
        matchedCoupon = coupon
      }
      // If the code is invalid, expired, exhausted, or below the minimum order
      // amount, we silently apply no discount rather than failing the whole order.
    }

    const total = subtotal - discount
    const orderNumber = generateOrderNumber()

    // Card payments stay unpaid until the Paystack webhook confirms them.
    // Bank transfer / WhatsApp orders are "pending" — a human at Victorious Concept
    // verifies these manually, per your existing process.
    const paymentStatus = paymentMethod === 'card' ? 'unpaid' : 'pending'

    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        order_number: orderNumber,
        items: orderItems,
        total,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_email: email || null,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        order_status: 'pending_payment',
        coupon_code: appliedCouponCode,
      })
      .select()
      .single()

    if (insertError) {
      return res.status(500).json({ error: 'Could not create order' })
    }

    if (matchedCoupon) {
      await supabase.rpc('increment_coupon_usage', { coupon_id: matchedCoupon.id })
    }

    // Card orders get their confirmation email from the webhook, once payment
    // is genuinely verified. Bank transfer / WhatsApp orders get it now, as an
    // "we've received your order" notice, since there's no webhook for them.
    if (paymentMethod !== 'card') {
      await sendConfirmationEmail({
        email: order.customer_email,
        orderNumber: order.order_number,
        items: order.items,
        total: order.total,
      })
    }

    return res.status(200).json({
      orderNumber: order.order_number,
      total: order.total,
      items: order.items,
    })
  } catch {
    return res.status(500).json({ error: 'Unexpected server error' })
  }
}