import SEO from '../components/SEO'

function About() {
  const timeline = [
    { label: 'University', text: 'PLACEHOLDER: where and what she studied.' },
    { label: 'First Products', text: 'PLACEHOLDER: how sourcing began.' },
    { label: 'First Customers', text: 'PLACEHOLDER: how the first sales happened.' },
    { label: 'Growing Business', text: 'PLACEHOLDER: how the business grew on campus.' },
    { label: 'Graduation', text: 'PLACEHOLDER: completing university.' },
    { label: 'The Next Chapter', text: 'PLACEHOLDER: the vision for Victorious Concept now.' },
  ]

  return (
    <section className="bg-cream dark:bg-espresso transition-colors">
     <SEO title="About" description="The Victorious Concept story, from university to the next chapter." />   
      <div className="max-w-4xl mx-auto px-6 py-20">
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4">
          Our Story
        </p>
        <h1 className="font-display italic font-semibold text-4xl md:text-5xl text-espresso dark:text-cream mb-8">
          Built at university. Built to last.
        </h1>
        <p className="font-sans text-base text-espresso/70 dark:text-cream/70 leading-relaxed max-w-2xl">
          PLACEHOLDER: the founder's honest story in her own words, how
          Victorious Concept started small while she was still a student,
          and why she has decided to grow it into something bigger.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="flex flex-col gap-10">
          {timeline.map((step, i) => (
            <div key={step.label} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-gold flex-shrink-0" />
                {i !== timeline.length - 1 && (
                  <div className="w-px flex-1 bg-gold/30 mt-2" />
                )}
              </div>
              <div className="pb-4">
                <h3 className="font-sans text-xs uppercase tracking-widest text-gold mb-2">
                  {step.label}
                </h3>
                <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 max-w-xl">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About