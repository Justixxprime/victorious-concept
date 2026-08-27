import SEO from '../components/SEO'
import PageHero from '../components/PageHero'
import { siteImages } from '../data/siteImages'
import { RefreshCw, ShieldCheck, MessageCircle } from 'lucide-react'

function Returns() {
  return (
    <>
      <SEO title="Returns" description="Returns and exchange policy for Victorious Concept." />
      <PageHero
        label="Policy"
        title="Returns & Exchanges"
        subtitle="A real 7 day window and a real conversation, not a ticket system."
        image={siteImages.shippingBanner}
        compact
      />
      <section className="bg-cream dark:bg-espresso transition-colors py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex gap-4">
            <RefreshCw className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-sans text-sm font-medium text-espresso dark:text-cream mb-1">
                7 day return window
              </h3>
              <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
                You have 7 days from the day your order arrives to request a return or exchange.
                We would genuinely rather you love what you ordered, and this window exists so you
                actually have room to decide.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <ShieldCheck className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-sans text-sm font-medium text-espresso dark:text-cream mb-1">
                Condition
              </h3>
              <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
                Items should be unused and in the same condition you received them, with any
                original packaging where possible, so we can process your return smoothly.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <MessageCircle className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-sans text-sm font-medium text-espresso dark:text-cream mb-1">
                How to start a return
              </h3>
              <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
                Message us on WhatsApp with your order number and the reason for the return, and
                we will guide you through the rest personally, no ticket system, just a real
                conversation.
              </p>
            </div>
          </div>
        </div>
      </div>
      </section>
    </>
  )
}

export default Returns