import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const REFERRAL_PERCENT_OFF = 10

function randomSuffix() {
  return Math.floor(1000 + Math.random() * 9000)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { accessToken } = req.body
  if (!accessToken) {
    return res.status(401).json({ error: 'Not signed in' })
  }

  const callerClient = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  )
  const { data: { user }, error: userError } = await callerClient.auth.getUser()
  if (userError || !user) {
    return res.status(401).json({ error: 'Not signed in' })
  }

  // Already has one? Hand it straight back — a referral code is meant to
  // stay the same for a customer, not regenerate every visit.
  const { data: existing } = await supabaseAdmin
    .from('coupons')
    .select('code, used_count, percent_off')
    .eq('referred_by_user_id', user.id)
    .maybeSingle()

  if (existing) {
    return res.status(200).json(existing)
  }

  // Build a short, readable code from the customer's own name/email, e.g.
  // "JUSTICE4821" — friendlier to share than a fully random string, with a
  // random numeric suffix so two customers with similar names don't collide.
  const namePart = (user.user_metadata?.full_name || user.email || 'FRIEND')
    .split('@')[0]
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 8)
    .toUpperCase() || 'FRIEND'

  let created = null
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    const code = `${namePart}${randomSuffix()}`
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert({
        code,
        discount_type: 'percent',
        percent_off: REFERRAL_PERCENT_OFF,
        active: true,
        referred_by_user_id: user.id,
      })
      .select('code, used_count, percent_off')
      .single()

    if (!error) {
      created = data
    } else if (error.code !== '23505') {
      return res.status(500).json({ error: 'Could not create a referral code' })
    }
  }

  if (!created) {
    return res.status(500).json({ error: 'Could not generate a unique code — please try again' })
  }

  return res.status(200).json(created)
}