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
      body: JSON.stringify({ transaction: order.payment_reference }),
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
        refund_amount: order.total,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', returnRequestId)

    await supabaseAdmin
      .from('orders')
      .update({ payment_status: 'refunded', order_status: 'refunded' })
      .eq('id', order.id)

    return res.status(200).json({ status: 'refunded' })
  } catch {
    return res.status(500).json({ error: 'Unexpected server error' })
  }
}