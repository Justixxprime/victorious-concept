import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

function FounderTeaser() {
  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-20 px-6">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
        <span className="font-sans uppercase tracking-[0.3em] text-xs text-gold">
          The Founder
        </span>
        <h2 className="font-display italic font-semibold text-3xl md:text-5xl text-espresso dark:text-cream max-w-2xl leading-tight">
          Started at university. Built with intention.
        </h2>
        <p className="font-sans text-sm md:text-base text-espresso/70 dark:text-cream/70 max-w-xl">
          It began with friends on campus asking one question — can you find me this? — and
          Victoria saying yes, then heading to Lagos Island market to make it happen.
        </p>
        <Link
          to="/about"
          className="mt-2 flex items-center gap-2 font-sans text-sm uppercase tracking-wide text-gold hover:text-gold-light transition-colors"
        >
          Read Our Story <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}

export default FounderTeaser