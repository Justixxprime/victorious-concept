import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return { categories, loading, refetch: fetchCategories }
}