import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTestimonials() {
      const { data } = await supabase.from('testimonials').select('*').eq('active', true)
      setTestimonials(data || [])
      setLoading(false)
    }
    fetchTestimonials()
  }, [])

  return { testimonials, loading }
}