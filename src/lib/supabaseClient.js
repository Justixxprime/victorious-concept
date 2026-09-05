import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // This is the single most common reason the site loads as a blank white
  // page locally with nothing rendered at all and no visible error on the
  // page itself: without these two values, the Supabase client can't be
  // created, which happens as soon as this file is imported, before React
  // has even mounted anything to the page. On Vercel this never happens
  // because the real values are set in the project's environment
  // variables there.
  //
  // Fix: copy .env.example to .env in the project root, then fill in
  // VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with the real values from
  // Supabase (Project Settings > API), then restart `npm run dev`.
  const message =
    'Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env in the project root and fill in the real ' +
    'values from your Supabase project (Project Settings > API), then ' +
    'restart the dev server.'
  console.error(`[Victorious Concept] ${message}`)
  throw new Error(message)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)