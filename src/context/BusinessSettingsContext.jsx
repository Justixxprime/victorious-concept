import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const BusinessSettingsContext = createContext(null)

const SETTINGS_KEY = 'business_contact'

// These match what's already configured for the business today. Once an
// admin saves changes in the Settings panel, the database value takes over —
// these are just the safe starting point so nothing breaks in the meantime.
const DEFAULTS = {
  whatsappNumber: '2348122470435',
  bankAccountName: 'Sopuruchi Victoria Obioma',
  bankAccountNumber: '8122470435',
  bankName: 'Opay',
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