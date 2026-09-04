import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const BusinessSettingsContext = createContext(null)

const SETTINGS_KEY = 'business_contact'

// The real values are confirmed saved in Supabase's site_settings table
// now (under the 'business_contact' key) — these blank defaults are only
// a brief starting point before that fetch resolves, not a fallback with
// real business info baked into the shipped JS bundle. WhatsAppButton and
// Footer both check for an empty whatsappNumber before rendering their
// WhatsApp link, so a blank value here never shows a broken link.
const DEFAULTS = {
  whatsappNumber: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankName: '',
}

export function BusinessSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', SETTINGS_KEY)
        .maybeSingle()
      if (data?.value) {
        setSettings({ ...DEFAULTS, ...data.value })
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  async function updateSettings(newValues) {
    const merged = { ...settings, ...newValues }
    setSettings(merged)
    await supabase.from('site_settings').upsert({ key: SETTINGS_KEY, value: merged })
  }

  return (
    <BusinessSettingsContext.Provider value={{ ...settings, loading, updateSettings }}>
      {children}
    </BusinessSettingsContext.Provider>
  )
}

export function useBusinessSettings() {
  return useContext(BusinessSettingsContext)
}