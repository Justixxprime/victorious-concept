import { Star } from 'lucide-react'
import { useTopReviews } from '../hooks/useTopReviews'
import { useTestimonials } from '../hooks/useTestimonials'

function CustomerLove() {
  const { reviews, loading: reviewsLoading } = useTopReviews(3)
  const { testimonials, loading: testimonialsLoading } = useTestimonials()

  const loading = reviewsLoading || testimonialsLoading

  const fromReviews = reviews.map((r) => ({
    id: `r-${r.id}`,
    quote: r.comment,
    name: r.customer_name,
    sub: r.products && r.products.name ? `on ${r.products.name}` : null,
    rating: r.rating,
  }))

  const fromTestimonials = testimonials.map((t) => ({
    id: `t-${t.id}`,
    quote: t.quote,
    name: t.customer_name,
    sub: t.source || null,
    rating: null,
  }))

  const combined = [...fromReviews, ...fromTestimonials].slice(0, 3)

  if (loading) return null
  if (combined.length === 0) return null

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
          {combined.map((item) => (
            <div key={item.id} className="bg-cream dark:bg-espresso rounded-2xl p-6 flex flex-col gap-4">
              {item.rating && (
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-4 h-4 ${n <= item.rating ? 'fill-gold text-gold' : 'text-gold/20'}`}
                    />
                  ))}
                </div>
              )}
              <p className="font-display italic text-lg text-espresso dark:text-cream leading-relaxed flex-1">
                "{item.quote}"
              </p>
              <div>
                <p className="font-sans text-xs font-medium text-espresso dark:text-cream">
                  {item.name}
                </p>
                {item.sub && (
                  <p className="font-sans text-xs text-gold/70">
                    {item.sub}
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