import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useTopReviews(limit = 3) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTopReviews() {
      const { data } = await supabase
        .from('reviews')
        .select('*, products(name)')
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(limit)
      setReviews(data || [])
      setLoading(false)
    }
    fetchTopReviews()
  }, [limit])

  return { reviews, loading }
}