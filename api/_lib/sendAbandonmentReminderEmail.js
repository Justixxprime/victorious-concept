/**
 * A gentle nudge for a checkout that was started but never paid — distinct
 * tone from the order confirmation email, since this order isn't actually
 * confirmed yet.
 *
 * @param {{ email: string, orderNumber: string, total: number }} options
 * @returns {Promise<void>}
 */
export async function sendAbandonmentReminderEmail({ email, orderNumber, total }) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #3a2318;">
      <h1 style="font-style: italic; color: #3a2318;">Still want this?</h1>
      <p>You started an order with us but haven't completed payment yet. It's still
      waiting for you, nothing's been cancelled.</p>
      <p style="color: #888; font-size: 14px;">Order Number: <strong>${orderNumber}</strong></p>
      <p style="font-size: 18px; font-weight: bold;">Total: ₦${total.toLocaleString()}</p>
      <p style="color: #888; font-size: 13px; margin-top: 24px;">
        Need help finishing up, or has something changed? Just WhatsApp us at
        +234 812 247 0435 and we'll sort it out.
      </p>
    </div>
  `

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Victorious Concept <onboarding@resend.dev>',
        to: email,
        subject: `Your order ${orderNumber} is still waiting`,
        html,
      }),
    })
  } catch {
    // Same rule as every other email helper — never break the caller.
  }
}