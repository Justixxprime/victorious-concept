import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSiteSettings(key) {
  const [value, setValue] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchSetting() {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    setValue(data?.value || null)
    setLoading(false)
  }

  useEffect(() => {
    fetchSetting()
  }, [key])

  async function updateSetting(newValue) {
    await supabase.from('site_settings').upsert({ key, value: newValue })
    setValue(newValue)
  }

  return { value, loading, updateSetting }
}