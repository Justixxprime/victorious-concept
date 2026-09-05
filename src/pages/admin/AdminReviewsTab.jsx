import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAdminWrite } from '../../hooks/useAdminWrite'
import { Trash2, Star } from 'lucide-react'

export default function AdminReviewsTab() {
  const runWrite = useAdminWrite()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  async function refetch() {
    // Now that reviews.product_id is a real bigint foreign key to
    // products.id, this embedded join resolves correctly (it silently
    // failed before that fix, which is what made reviews not show up
    // anywhere on the homepage even when real ones existed).
    const { data } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  useEffect(() => {
    refetch()
  }, [])

  async function deleteReview(id) {
    if (!confirm('Delete this review permanently? This cannot be undone.')) return
    const ok = await runWrite(supabase.from('reviews').delete().eq('id', id), 'Deleting review')
    if (!ok) return
    refetch()
  }

  if (loading) {
    return <p className="font-sans text-sm text-espresso/50 dark:text-cream/50">Loading...</p>
  }

  return (
    <div className="max-w-2xl flex flex-col gap-3">
      {reviews.length === 0 ? (
        <p className="font-sans text-sm text-espresso/50 dark:text-cream/50">No reviews yet.</p>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="border border-gold/20 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-sans text-sm text-espresso dark:text-cream font-medium">{r.customer_name}</p>
                <p className="font-sans text-xs text-gold">{r.products?.name || 'Product no longer exists'}</p>
              </div>
              <button onClick={() => deleteReview(r.id)} aria-label="Delete review">
                <Trash2 className="w-4 h-4 text-espresso/40 dark:text-cream/40 hover:text-red-500" />
              </button>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'text-gold fill-gold' : 'text-espresso/20 dark:text-cream/20'}`} />
              ))}
              {r.verified_purchase && (
                <span className="font-sans text-xs text-green-500 ml-2">Verified purchase</span>
              )}
            </div>
            <p className="font-sans text-sm text-espresso/70 dark:text-cream/70">{r.comment}</p>
            {r.image_url && (
              <img src={r.image_url} alt="Review attachment" className="w-20 h-20 rounded-lg object-cover mt-3" />
            )}
          </div>
        ))
      )}
    </div>
  )
}