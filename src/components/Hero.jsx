import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedLogo from './AnimatedLogo'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { siteImages } from '../data/siteImages'

const defaults = {
  label: 'The Next Chapter',
  headline: "Victorious isn't a size. It's a state of mind.",
  subtext: 'Sourced with intention, worn with confidence. Bags, shoes, clothing and accessories for the next chapter.',
  backdropImage: siteImages.heroBackdrop,
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
  }),
}

function Hero() {
  const { value } = useSiteSettings('hero')
  const hero = value || defaults

  return (
    <section className="relative bg-espresso text-cream overflow-hidden min-h-[92vh] flex items-center">
      {/* CINEMATIC BACKDROP with slow Ken Burns zoom */}
      <div className="absolute inset-0">
        <motion.img
          src={hero.backdropImage}
          alt=""
          className="w-full h-full object-cover opacity-40"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 14, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/70 to-espresso/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/60 via-transparent to-espresso/60" />
      </div>

      {/* Floating ambient sparkles */}
      <motion.div
        className="absolute top-1/4 right-[15%] w-1.5 h-1.5 rounded-full bg-gold-light"
        animate={{ opacity: [0.2, 0.9, 0.2], y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/3 right-[28%] w-1 h-1 rounded-full bg-gold"
        animate={{ opacity: [0.1, 0.7, 0.1], y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      />
      <motion.div
        className="absolute top-1/3 left-[10%] w-1 h-1 rounded-full bg-gold-light"
        animate={{ opacity: [0.15, 0.8, 0.15], y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-24 flex flex-col items-start gap-8 w-full">
        <motion.div initial="hidden" animate="show" custom={0}>
          <AnimatedLogo className="w-24 md:w-28" />
        </motion.div>

        <motion.span
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.5}
          className="font-sans uppercase tracking-[0.3em] text-xs text-gold-light"
        >
          {hero.label}
        </motion.span>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.65}
          className="font-display italic font-semibold text-5xl md:text-7xl leading-tight max-w-3xl"
        >
          {hero.headline}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.8}
          className="font-sans text-cream/80 max-w-xl text-base md:text-lg"
        >
          {hero.subtext}
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.95}
          className="flex gap-4 pt-4"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/shop"
              className="bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full flex items-center gap-2 hover:bg-gold-light transition-colors"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/lookbook"
              className="border border-cream/40 text-cream font-sans font-medium px-8 py-3 rounded-full hover:border-cream transition-colors block"
            >
              Explore
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-cream/50">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-cream/50 to-transparent" />
      </motion.div>
    </section>
  )
}

export default Hero