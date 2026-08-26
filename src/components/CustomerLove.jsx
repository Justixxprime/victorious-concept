import { Star } from 'lucide-react'
import { useTopReviews } from '../hooks/useTopReviews'

function CustomerLove() {
  const { reviews, loading } = useTopReviews(3)

  if (loading || reviews.length === 0) return null

  return (
    <section className="bg-gold/5 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3 text-center">
          Real Words, Real Customers
        </p>
        <h2 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream text-center mb-12">
          Customer Love
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-cream dark:bg-espresso rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${n <= review.rating ? 'fill-gold text-gold' : 'text-gold/20'}`}
                  />
                ))}
              </div>
              <p className="font-display italic text-lg text-espresso dark:text-cream leading-relaxed flex-1">
                "{review.comment}"
              </p>
              <div>
                <p className="font-sans text-xs font-medium text-espresso dark:text-cream">
                  {review.customer_name}
                </p>
                {review.products?.name && (
                  <p className="font-sans text-xs text-gold/70">
                    on {review.products.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CustomerLove