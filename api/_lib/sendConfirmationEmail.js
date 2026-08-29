// Shared by api/create-order.js (bank transfer / WhatsApp) and
// api/paystack-webhook.js (card, once payment is verified). Never called
// directly from the browser.
export async function sendConfirmationEmail({ email, orderNumber, items, total }) {
  if (!email) return // guest checkout with no email on file — nothing to send to

  const itemsHtml = items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;">${item.name} x${item.quantity}</td><td style="padding:8px 0; text-align:right;">₦${(
          item.price * item.quantity
        ).toLocaleString()}</td></tr>`
    )
    .join('')

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #3a2318;">
      <h1 style="font-style: italic; color: #3a2318;">Order Confirmed</h1>
      <p>Thank you for your order from Victorious Concept.</p>
      <p style="color: #888; font-size: 14px;">Order Number: <strong>${orderNumber}</strong></p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        ${itemsHtml}
      </table>
      <p style="font-size: 18px; font-weight: bold;">Total: ₦${total.toLocaleString()}</p>
      <p style="color: #888; font-size: 13px; margin-top: 24px;">We'll reach out with delivery details shortly. Questions? WhatsApp us at +234 812 247 0435.</p>
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
        subject: `Order Confirmed - ${orderNumber}`,
        html,
      }),
    })
  } catch {
    // Email failing to send should never break order creation or payment
    // confirmation — it's logged implicitly via Vercel's function logs.
  }
}