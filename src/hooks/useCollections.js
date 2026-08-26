import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useCollections() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchCollections() {
    const { data } = await supabase.from('collections').select('*')
    setCollections(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  return { collections, loading, refetch: fetchCollections }
}