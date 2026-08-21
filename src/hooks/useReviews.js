import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useReviews(productId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  async function submitReview({ userId, customerName, rating, comment }) {
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: userId,
      customer_name: customerName,
      rating,
      comment,
    })
    if (!error) fetchReviews()
    return { error }
  }

  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return { reviews, loading, submitReview, average }
}