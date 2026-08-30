import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

function SourceTeaser() {
  return (
    <section className="bg-gold/5 py-20 px-6">
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-5">
        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-gold" />
        </div>
        <h2 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream max-w-xl leading-tight">
          Can't find exactly what you want?
        </h2>
        <p className="font-sans text-sm md:text-base text-espresso/70 dark:text-cream/70 max-w-md">
          This is literally how Victorious Concept started. Tell us what you are looking for,
          anywhere in Nigeria or the world, and we will go find it — Trade Fair, Lagos Island,
          wherever it takes.
        </p>
        <Link
          to="/source"
          className="mt-2 flex items-center gap-2 bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors"
        >
          Source It For Me <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}

export default SourceTeaser