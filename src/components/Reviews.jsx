import { useState } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useReviews } from '../hooks/useReviews'
import { BadgeCheck } from 'lucide-react'
import { Camera } from 'lucide-react'

function Reviews({ productId }) {
  const { user } = useAuth()
  const { reviews, loading, submitReview, average } = useReviews(productId)
  const existingReview = reviews.find((r) => r.user_id === user?.id)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  function handleImageSelect(e) {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    await submitReview({
      userId: user.id,
      customerName: name || user.email.split('@')[0],
      rating,
      comment,
      imageFile,
    })
    setComment('')
    setImageFile(null)
    setImagePreview(null)
    setSubmitting(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-16">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="font-display italic font-semibold text-2xl text-espresso dark:text-cream">
          Reviews
        </h2>
        {average && (
          <span className="flex items-center gap-1 font-sans text-sm text-gold">
            <Star className="w-4 h-4 fill-gold" /> {average} ({reviews.length})
          </span>
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="bg-gold/5 rounded-2xl p-6 mb-8 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                aria-label={`Rate ${n} stars`}
              >
                <Star className={`w-6 h-6 ${n <= rating ? 'fill-gold text-gold' : 'text-gold/20'}`} />
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
          />
          <textarea
            placeholder="Share your thoughts on this product"
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none"
          />
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <Camera className="w-4 h-4 text-gold" />
            <span className="font-sans text-xs text-espresso/60 dark:text-cream/60">
              {imagePreview ? 'Photo attached' : 'Add a photo (optional)'}
            </span>
            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </label>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
          )}
          <button
            type="submit"
            disabled={submitting}
            className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors self-start disabled:opacity-50"
          >
            {existingReview ? 'Update Your Review' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 mb-8">
          Sign in to leave a review.
        </p>
      )}

      {loading ? (
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
          No reviews yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-gold/10 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`w-4 h-4 ${n <= r.rating ? 'fill-gold text-gold' : 'text-gold/20'}`} />
                  ))}
                </div>
                <span className="font-sans text-xs text-espresso/50 dark:text-cream/50">
                  {r.customer_name}
                </span>
                {r.verified_purchase && (
                  <span className="flex items-center gap-1 font-sans text-xs text-gold">
                    <BadgeCheck className="w-3 h-3" /> Verified Purchase
                  </span>
                )}
              </div>
              <p className="font-sans text-sm text-espresso/80 dark:text-cream/80 mb-3">{r.comment}</p>
              {r.image_url && (
                <img src={r.image_url} alt="Customer photo" className="w-24 h-24 rounded-xl object-cover" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reviews