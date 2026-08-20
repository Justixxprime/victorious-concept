import { ArrowRight } from 'lucide-react'

function Hero() {
  return (
    <section className="relative bg-espresso text-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-32 md:py-44 flex flex-col items-start gap-8">
        <span className="font-sans uppercase tracking-[0.3em] text-xs text-gold-light">
          The Next Chapter
        </span>

        <h1 className="font-display italic font-semibold text-5xl md:text-7xl leading-tight max-w-3xl">
          Victorious isn't a size. It's a state of mind.
        </h1>

        <p className="font-sans text-cream/80 max-w-xl text-base md:text-lg">
          Sourced with intention, worn with confidence. Bags, shoes, clothing
          and accessories for the next chapter.
        </p>

        <div className="flex gap-4 pt-4">
          <button className="bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full flex items-center gap-2 hover:bg-gold-light transition-colors">
            Shop Now <ArrowRight className="w-4 h-4" />
          </button>
          <button className="border border-cream/40 text-cream font-sans font-medium px-8 py-3 rounded-full hover:border-cream transition-colors">
            Explore
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero