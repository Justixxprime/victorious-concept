import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, MapPin, Package } from 'lucide-react'
import RevealImage from './RevealImage'
import { siteImages } from '../data/siteImages'

const steps = [
  {
    icon: MessageCircle,
    label: 'You tell us',
    text: 'A screenshot, a description, a "find me something like this", however you want to say it.',
  },
  {
    icon: MapPin,
    label: 'We go source it',
    text: 'Lagos Island, Trade Fair, wherever it takes. The same market this business was built on.',
  },
  {
    icon: Package,
    label: 'It gets to you',
    text: 'Anywhere in Nigeria, or beyond, the same way every other order does.',
  },
]

function SourceStorySection() {
  return (
    <section className="relative bg-espresso text-cream py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="flex flex-col gap-6 order-2 lg:order-1">
          <span className="font-sans uppercase tracking-[0.3em] text-xs text-gold-light">
            How This Business Started
          </span>
          <h2 className="font-display italic font-semibold text-3xl md:text-5xl leading-tight">
            Can't find exactly what you want?
          </h2>
          <p className="font-sans text-sm md:text-base text-cream/70 leading-relaxed max-w-lg">
            This is literally how Victorious Concept started. A friend on campus needed a bag
            for an event, had no time to travel home to source it herself, and Victoria said yes.
            She grew up in Lagos, around the market, the real one, Lagos Island and Trade Fair,
            loud and chaotic and full of treasure if you know where to look. That one favor became
            a habit, the habit became a business, and the same instinct still runs it today.
          </p>

          <div className="flex flex-col gap-5 mt-2">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-4 h-4 text-gold-light" />
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-cream">{step.label}</p>
                  <p className="font-sans text-xs text-cream/60 leading-relaxed">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            <Link
              to="/source"
              className="flex items-center gap-2 bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors"
            >
              Source It For Me <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="font-sans text-sm uppercase tracking-wide text-gold-light hover:text-gold transition-colors"
            >
              Read Our Story
            </Link>
          </div>
        </div>

        <RevealImage
          src={siteImages.sourceStoryBackdrop}
          alt="Lagos Island market, where Victorious Concept's sourcing story began"
          className="aspect-[4/5] rounded-2xl order-1 lg:order-2"
        />
      </div>
    </section>
  )
}

export default SourceStorySection