import { supabase } from '../lib/supabaseClient'

/**
 * Records an admin action to the audit_logs table. Best-effort: logging
 * failures are swallowed (never block or fail the actual admin action just
 * because the log write didn't go through), but are surfaced to the
 * console so they're not silently invisible during development.
 *
 * @param {string} action - short verb phrase, e.g. 'order_status_changed'
 * @param {string} entity - the table/domain the action affects, e.g. 'order'
 * @param {string|number} entityId - the affected row's id
 * @param {object} [metadata] - any extra structured detail worth keeping
 */
export async function logAdminAction(action, entity, entityId, metadata = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
      actor_email: user?.email || null,
      action,
      entity,
      entity_id: String(entityId),
      metadata,
    })
  } catch (err) {
    console.error('audit log write failed', err)
  }
}
