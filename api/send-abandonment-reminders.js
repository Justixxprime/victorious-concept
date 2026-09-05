import { createClient } from '@supabase/supabase-js'
import { sendAbandonmentReminderEmail } from './_lib/sendAbandonmentReminderEmail.js'
import { requireEnv } from './_lib/env.js'
import { captureServerException } from './_lib/monitoring.js'

const supabase = createClient(
  requireEnv(process.env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL'),
  requireEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY')
)

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  // Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically for
  // scheduled cron invocations when CRON_SECRET is set in the project's env
  // vars. Rejecting anything else matters here — this endpoint sends real
  // emails to real customers, so it can't be left open to the public internet.
  const expected = process.env.CRON_SECRET
  if (expected && req.headers.authorization !== `Bearer ${expected}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // payment_status IN ('unpaid', 'pending') specifically — NOT just
  // "!= 'paid'" — because a refunded order also has payment_status !=
  // 'paid' (it's 'refunded'), and a refunded order was already completed,
  // not abandoned. Reminding a refunded customer to "finish paying" would
  // be a real, visible mistake.
  const { data: abandoned, error } = await supabase
    .from('orders')
    .select('id, order_number, total, customer_email')
    .in('payment_status', ['unpaid', 'pending'])
    .neq('order_status', 'cancelled')
    .lt('created_at', oneDayAgo)
    .is('abandonment_reminder_sent_at', null)
    .not('customer_email', 'is', null)

  if (error) {
    captureServerException(error)
    return res.status(500).json({ error: 'Could not fetch abandoned orders' })
  }

  let sent = 0
  for (const order of abandoned || []) {
    await sendAbandonmentReminderEmail({
      email: order.customer_email,
      orderNumber: order.order_number,
      total: order.total,
    })
    // Marked right after sending, one order at a time, so a crash partway
    // through this loop never re-sends to someone already emailed on a
    // retry — worst case, a couple of orders wait for tomorrow's run.
    await supabase
      .from('orders')
      .update({ abandonment_reminder_sent_at: new Date().toISOString() })
      .eq('id', order.id)
    sent++
  }

  return res.status(200).json({ remindersSent: sent })
}