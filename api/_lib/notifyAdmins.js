/**
 * Sends a plain, quick-glance notification email to both business admins.
 * Not customer-facing, not fancy — this exists so Victoria and Justice
 * actually find out about a new order or message without having to
 * remember to check the dashboard.
 *
 * @param {string} subject
 * @param {string} htmlBody
 * @returns {Promise<void>}
 */
export async function notifyAdmins(subject, htmlBody) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Victorious Concept <onboarding@resend.dev>',
        // Mirrors the admin list in src/hooks/useIsAdmin.js and the
        // database's is_admin() function — if the admin team ever
        // changes, all three need updating together.
        to: ['Victoriaobioma31@yahoo.com', 'justixxchiobi@gmail.com'],
        subject,
        html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #3a2318;">${htmlBody}</div>`,
      }),
    })
  } catch {
    // Same rule as the customer confirmation email — a notification
    // failing to send should never break the order/message flow itself.
  }
}