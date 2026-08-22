import SEO from '../components/SEO'
import { Truck, Globe, Package } from 'lucide-react'

function Delivery() {
  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-20 px-6">
      <SEO title="Delivery" description="Delivery information for Victorious Concept orders." />
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-10">
          Delivery
        </h1>

        <div className="flex flex-col gap-8">
          <div className="flex gap-4">
            <Truck className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-sans text-sm font-medium text-espresso dark:text-cream mb-1">
                Nationwide delivery
              </h3>
              <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
                We deliver to every state across Nigeria. Once your order is confirmed, we will
                coordinate delivery details directly with you through WhatsApp or the contact
                information you provide at checkout.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Globe className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-sans text-sm font-medium text-espresso dark:text-cream mb-1">
                International delivery
              </h3>
              <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
                Victorious Concept also ships internationally. If you are ordering from outside
                Nigeria, reach out to us on WhatsApp before or after checkout so we can confirm
                shipping costs and timelines for your location.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Package className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-sans text-sm font-medium text-espresso dark:text-cream mb-1">
                Order tracking and support
              </h3>
              <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
                Every order is confirmed personally, not left to guesswork. If anything about your
                delivery is unclear at any point, message us on WhatsApp and we will sort it out
                directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Delivery