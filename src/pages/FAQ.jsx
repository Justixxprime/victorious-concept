import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'How do I place an order?', a: 'PLACEHOLDER: explain the ordering process.' },
  { q: 'What payment methods are accepted?', a: 'PLACEHOLDER: confirm actual payment options once decided.' },
  { q: 'How long does delivery take?', a: 'PLACEHOLDER: confirm real delivery timelines.' },
  { q: 'Can I return or exchange an item?', a: 'PLACEHOLDER: confirm the real returns policy.' },
  { q: 'Are your products authentic?', a: 'PLACEHOLDER: confirm sourcing and authenticity details.' },
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