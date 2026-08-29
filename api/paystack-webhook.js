import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { sendConfirmationEmail } from './_lib/sendConfirmationEmail.js'

// This must stay server-only. Vercel needs the raw request body (not
// pre-parsed JSON) to check Paystack's signature correctly.
export const config = {
  api: {
    bodyParser: false,
  },
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const rawBody = await readRawBody(req)

  // --- Confirm this request really came from Paystack ---
  const signature = req.headers['x-paystack-signature']
  const expectedSignature = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex')

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  const event = JSON.parse(rawBody)

  // We only act on successful charges. Everything else is acknowledged and ignored.
  if (event.event !== 'charge.success') {
    return res.status(200).json({ received: true })
  }

  const reference = event.data.reference

  try {
    // --- Find the order this payment belongs to ---
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', reference)
      .maybeSingle()

    if (!order) {
      // Nothing to do — reference doesn't match any order we created.
      return res.status(200).json({ received: true })
    }

    // --- Log every genuinely-signed event we receive, for audit/debugging ---
    await supabase.from('payment_events').insert({
      provider_reference: reference,
      event_type: event.event,
      raw_payload: event,
    })

    // --- Double-check with Paystack's own servers, not just this webhook payload ---
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    )
    const verifyJson = await verifyRes.json()
    const tx = verifyJson.data

    const expectedAmountKobo = Math.round(order.total * 100)
    const paymentIsValid =
      tx &&
      tx.status === 'success' &&
      tx.currency === 'NGN' &&
      tx.amount === expectedAmountKobo &&
      tx.reference === order.order_number

    if (!paymentIsValid) {
      // Amount/currency/reference didn't match what we expect — do not mark paid.
      return res.status(400).json({ error: 'Payment verification failed' })
    }

    // --- Claim this payment reference. The UNIQUE constraint on
    // provider_reference makes this race-safe even if Paystack sends the
    // same webhook twice at the exact same instant — only one insert wins. ---
    const { error: paymentInsertError } = await supabase.from('payments').insert({
      order_id: order.id,
      provider: 'paystack',
      provider_reference: reference,
      amount: tx.amount,
      currency: tx.currency,
      status: 'paid',
      paid_at: new Date().toISOString(),
      metadata: { channel: tx.channel, gateway_response: tx.gateway_response },
    })

    if (paymentInsertError) {
      // Most likely a duplicate reference — this webhook was already processed.
      return res.status(200).json({ received: true })
    }

    // --- Snapshot each line item permanently, so a later product-price change
    // never rewrites what this customer actually paid ---
    const orderItemRows = order.items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      variant_id: item.variantId || null,
      product_name: item.name,
      unit_price: item.price,
      quantity: item.quantity,
      line_total: item.price * item.quantity,
    }))
    await supabase.from('order_items').insert(orderItemRows)

    // --- Reduce stock for each item now that payment is genuinely confirmed ---
    for (const item of order.items) {
      if (item.variantId) {
        await supabase.rpc('decrement_variant_stock', { variant_id: item.variantId, qty: item.quantity })
      } else {
        await supabase.rpc('decrement_stock', { product_id: item.id, qty: item.quantity })
      }
    }

    // --- Mark the order paid, based on our own verification, not the client ---
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        order_status: 'processing',
        payment_reference: reference,
      })
      .eq('order_number', reference)

    await supabase
      .from('payment_events')
      .update({ processed: true })
      .eq('provider_reference', reference)
      .eq('event_type', event.event)

    await sendConfirmationEmail({
      email: order.customer_email,
      orderNumber: order.order_number,
      items: order.items,
      total: order.total,
    })

    return res.status(200).json({ received: true })
  } catch {
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}