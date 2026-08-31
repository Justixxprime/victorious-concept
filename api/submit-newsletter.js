import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body
  if (!email?.trim()) {
    return res.status(400).json({ error: 'Please enter your email' })
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count } = await supabase
    .from('subscribers')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', oneHourAgo)

  if (ip !== 'unknown' && (count || 0) >= 10) {
    return res.status(429).json({ error: 'Too many signups from this connection recently. Please try again later.' })
  }

  const { error } = await supabase.from('subscribers').insert({ email: email.trim(), ip_address: ip })

  if (error) {
    if (error.code === '23505') {
      return res.status(200).json({ success: true, alreadySubscribed: true })
    }
    return res.status(500).json({ error: 'Could not subscribe right now' })
  }

  return res.status(200).json({ success: true })
}