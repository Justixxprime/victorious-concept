import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { accessToken, returnRequestId, decision, adminNotes } = req.body

  if (!accessToken) {
    return res.status(401).json({ error: 'Not signed in' })
  }
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision' })
  }

  // --- Verify the caller is really an admin, using the exact same is_admin()
  // function the database itself trusts — not a separate list that could drift. ---
  const callerClient = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  )
  const { data: isAdmin } = await callerClient.rpc('is_admin')
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  try {
    const { data: returnRequest } = await supabaseAdmin
      .from('return_requests')
      .select('*, orders(*)')
      .eq('id', returnRequestId)
      .maybeSingle()

    if (!returnRequest) {
      return res.status(404).json({ error: 'Return request not found' })
    }
    if (returnRequest.status !== 'requested' && returnRequest.status !== 'received') {
      return res.status(400).json({ error: 'This request has already been decided' })
    }

    const order = returnRequest.orders

    if (decision === 'reject') {
      // A single conditional update IS the atomic decision here — no
      // external side-effect follows it, so nothing more is needed to make
      // this race-safe against a second simultaneous request.
      const { data: rejected } = await supabaseAdmin
        .from('return_requests')
        .update({ status: 'rejected', admin_notes: adminNotes || null, updated_at: new Date().toISOString() })
        .eq('id', returnRequestId)
        .in('status', ['requested', 'received'])
        .select()
        .maybeSingle()

      if (!rejected) {
        return res.status(409).json({ error: 'This request was just decided by someone else' })
      }
      return res.status(200).json({ status: 'rejected' })
    }

    // --- decision === 'approve': issue a real refund via Paystack ---
    if (order.payment_method !== 'card' || order.payment_status !== 'paid') {
      return res.status(400).json({
        error: 'Only paid card orders can be refunded automatically. For bank transfer/WhatsApp orders, refund the customer directly and mark this resolved manually.',
      })
    }

    // --- Recompute the refund amount from the ORIGINAL order, not from
    // return_requests.items. The RLS policy for inserting a return request
    // only checks that the order belongs to the requesting customer — it
    // does not validate price or quantity inside the items field. So we
    // treat that field as "which lines, how much quantity" intent only,
    // and look up the real price and cap the quantity against the order
    // that was actually paid for. This is what makes partial-item refunds
    // safe to support at all. ---
    const orderItems = order.items || []
    const requestedItems = returnRequest.items || []
    let refundAmount = 0
    let returnedQuantity = 0
    for (const requested of requestedItems) {
      const original = orderItems.find((oi) => oi.id === requested.id)
      if (!original) continue // not a real line item on this order — ignored, not trusted
      const safeQuantity = Math.min(Math.max(0, Number(requested.quantity) || 0), original.quantity)
      refundAmount += original.price * safeQuantity
      returnedQuantity += safeQuantity
    }
    const totalOrderedQuantity = orderItems.reduce((sum, i) => sum + i.quantity, 0)
    const isFullOrderReturn = totalOrderedQuantity > 0 && returnedQuantity >= totalOrderedQuantity
    if (isFullOrderReturn) refundAmount += order.shipping_fee || 0
    // Final sanity ceiling — the refund can never exceed what was actually
    // paid, no matter what the math above produced.
    refundAmount = Math.min(refundAmount, order.total)

    if (refundAmount <= 0) {
      return res.status(400).json({ error: 'Nothing in this request matches real, paid line items on the order' })
    }

    // --- Atomically claim this return request before calling Paystack. If
    // two admins click Approve at the same instant, only one of these
    // updates can match the WHERE clause — the other gets zero rows back
    // and stops here, before any refund is actually issued. ---
    const { data: claimed } = await supabaseAdmin
      .from('return_requests')
      .update({ status: 'refund_processing', updated_at: new Date().toISOString() })
      .eq('id', returnRequestId)
      .in('status', ['requested', 'received'])
      .select()
      .maybeSingle()

    if (!claimed) {
      return res.status(409).json({ error: 'This request is already being processed' })
    }

    const refundRes = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: order.payment_reference,
        // Omitting `amount` would tell Paystack to refund the FULL original
        // transaction regardless of what was actually approved here — so a
        // partial return must always pass an explicit amount, in kobo.
        amount: Math.round(refundAmount * 100),
      }),
    })
    const refundJson = await refundRes.json()

    if (!refundRes.ok || !refundJson.status) {
      // We already own this claim, so it's safe to hand it back for a retry
      // rather than leaving it stuck in "processing" forever.
      await supabaseAdmin
        .from('return_requests')
        .update({ status: 'requested', admin_notes: `Refund attempt failed: ${refundJson.message || 'unknown error'}`, updated_at: new Date().toISOString() })
        .eq('id', returnRequestId)
      return res.status(502).json({ error: refundJson.message || 'Paystack refund failed' })
    }

    await supabaseAdmin
      .from('return_requests')
      .update({
        status: 'refunded',
        refund_amount: refundAmount,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', returnRequestId)

    // A partial return leaves the order itself still delivered/paid — only
    // a full-order return moves the order's own status to refunded.
    if (isFullOrderReturn) {
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'refunded', order_status: 'refunded' })
        .eq('id', order.id)
    }

    return res.status(200).json({ status: 'refunded', refundAmount })
  } catch {
    return res.status(500).json({ error: 'Unexpected server error' })
  }
}