import SEO from '../components/SEO'

function TermsOfService() {
  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-20 px-6">
      <SEO title="Terms of Service" description="Terms for using Victorious Concept." />
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-8">
          Terms of Service
        </h1>
        <div className="flex flex-col gap-6 font-sans text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
          <p>
            By using this website and placing an order with Victorious Concept, you agree to the
            following terms.
          </p>
          <div>
            <h2 className="font-sans font-medium text-espresso dark:text-cream mb-2">Orders</h2>
            <p>
              All orders are subject to availability. We reserve the right to cancel or refuse any
              order if a product is out of stock or if there is an issue verifying payment.
            </p>
          </div>
          <div>
            <h2 className="font-sans font-medium text-espresso dark:text-cream mb-2">Pricing</h2>
            <p>
              Prices are listed in Nigerian Naira and may change without notice. The price shown
              at checkout is the price you pay for that order.
            </p>
          </div>
          <div>
            <h2 className="font-sans font-medium text-espresso dark:text-cream mb-2">Delivery</h2>
            <p>
              We deliver nationwide across Nigeria and internationally. Delivery timelines vary by
              location and are confirmed directly with you after your order is placed. See our
              Delivery page for more details.
            </p>
          </div>
          <div>
            <h2 className="font-sans font-medium text-espresso dark:text-cream mb-2">Returns and exchanges</h2>
            <p>
              Returns and exchanges are accepted within 7 days of delivery, as described on our
              Returns page.
            </p>
          </div>
          <div>
            <h2 className="font-sans font-medium text-espresso dark:text-cream mb-2">Changes to these terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the site after changes
              means you accept the updated terms.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TermsOfService