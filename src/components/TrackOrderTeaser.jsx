import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, PackageSearch } from 'lucide-react'

function TrackOrderTeaser() {
  return (
    <section className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto text-center flex flex-col items-center gap-5"
      >
        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
          <PackageSearch className="w-5 h-5 text-gold" />
        </div>
        <h2 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream max-w-xl leading-tight">
          Already ordered?
        </h2>
        <p className="font-sans text-sm md:text-base text-espresso/70 dark:text-cream/70 max-w-md">
          Drop in your order number and phone number to see exactly where things stand,
          no account needed.
        </p>
        <Link
          to="/track-order"
          className="mt-2 flex items-center gap-2 border border-gold text-espresso dark:text-cream font-sans font-medium px-8 py-3 rounded-full hover:bg-gold hover:text-espresso transition-colors"
        >
          Track My Order <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </section>
  )
}

export default TrackOrderTeaser