import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useProducts({ includeHidden = false } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProducts() {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!includeHidden) {
        query = query.neq('status', 'hidden')
      }

      const { data, error } = await query

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
          sizes: p.sizes || null,
          stock: p.stock ?? 0,
          status: p.status || 'active',
          videoUrl: p.video_url || null,
          isNew: p.is_new,
          isFeatured: p.is_featured,
        }))
        setProducts(formatted)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [includeHidden])

  return { products, loading, error }
}