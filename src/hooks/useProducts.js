import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        const formatted = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          image: p.image,
          images: p.images && p.images.length > 0 ? p.images : [p.image],
          isNew: p.is_new,
          isFeatured: p.is_featured,
        }))
        setProducts(formatted)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return { products, loading, error }
}