import { createClient } from '@supabase/supabase-js'

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

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }
    if (!customer?.name || !customer?.phone || !customer?.address) {
      return res.status(400).json({ error: 'Missing customer details' })
    }
    if (!['card', 'bank_transfer', 'whatsapp'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' })
    }

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
        price: product.price,
        quantity,
        size: requested.size || null,
      })
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    let discount = 0
    let appliedCouponCode = null
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('active', true)
        .maybeSingle()

      if (coupon) {
        discount = Math.round(subtotal * (coupon.percent_off / 100))
        appliedCouponCode = coupon.code
      }
    }

    const total = subtotal - discount
    const orderNumber = generateOrderNumber()
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

    return res.status(200).json({
      orderNumber: order.order_number,
      total: order.total,
      items: order.items,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' })
  }
}