import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, message } = req.body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Please fill in all fields' })
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message is too long' })
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('email', email.trim())
    .gte('created_at', oneHourAgo)

  if ((count || 0) >= 3) {
    return res.status(429).json({
      error: 'Too many messages sent recently from this email. Please try again later, or reach us on WhatsApp.',
    })
  }

  const { error } = await supabase.from('contact_messages').insert({
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  })

  if (error) {
    return res.status(500).json({ error: 'Could not send your message' })
  }

  return res.status(200).json({ success: true })
}
