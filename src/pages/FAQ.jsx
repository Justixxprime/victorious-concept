import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'How do I place an order?',
    a: 'Browse the shop, add whatever you love to your cart, and check out directly on the site. You can also use "Source It For Me" if you want something specific found for you.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept bank transfer, WhatsApp arranged payment, and card payments. Whatever is easiest for you, we will work with it.',
  },
  {
    q: 'How long does delivery take?',
    a: 'We deliver nationwide across Nigeria and internationally. Exact timelines depend on your location, we confirm this directly with you once your order is placed.',
  },
  {
    q: 'Can I return or exchange an item?',
    a: 'Yes. You have 7 days from delivery to request a return or exchange, as long as the item is unused and in its original condition. See our full Returns page for details.',
  },
  {
    q: 'Are your products authentic?',
    a: 'Every product is personally sourced by Victoria, the same eye for quality that started this business at Lagos Island market is still behind every item we sell today.',
  },
]

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-10">
          Frequently Asked Questions
        </h1>

        <div className="flex flex-col divide-y divide-gold/20">
          {faqs.map((item, i) => (
            <div key={item.q} className="py-5">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full text-left font-sans text-sm text-espresso dark:text-cream"
              >
                {item.q}
                <ChevronDown
                  className={`w-4 h-4 text-gold transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === i && (
                <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 mt-3">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ