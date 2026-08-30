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

    // --- Claim + confirm this payment atomically. This single database call
    // either fully succeeds (payment recorded, items snapshotted, stock
    // reduced, coupon counted, order marked paid) or fully fails and rolls
    // back — there's no window where a payment is recorded but inventory
    // or order_items are silently missing. ---
    const { data: result, error: confirmError } = await supabase.rpc('confirm_paid_order', {
      p_order_id: order.id,
      p_reference: reference,
      p_amount: tx.amount,
      p_currency: tx.currency,
      p_channel: tx.channel,
      p_gateway_response: tx.gateway_response,
      p_items: order.items,
    })

    if (confirmError) {
      // The database rejected the confirmation — don't tell Paystack we're
      // done, so it retries the webhook rather than silently losing this.
      return res.status(500).json({ error: 'Could not confirm payment' })
    }

    if (result === 'already_processed') {
      return res.status(200).json({ received: true })
    }

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
      shippingFee: order.shipping_fee,
      shippingZone: order.shipping_zone,
      shippingIsVariable: order.shipping_is_variable,
    })

    return res.status(200).json({ received: true })
  } catch {
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}