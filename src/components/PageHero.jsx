import { motion } from 'framer-motion'

function PageHero({ label, title, subtitle, image, compact = false }) {
  return (
    <section className="relative bg-espresso text-cream overflow-hidden">
      <div className="absolute inset-0">
        <motion.img
          src={image}
          alt=""
          className="w-full h-full object-cover opacity-30"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/85 to-espresso/50" />
      </div>

      <div className={`relative max-w-4xl mx-auto px-6 ${compact ? 'py-16 md:py-20' : 'py-24 md:py-32'} flex flex-col items-start gap-4`}>
        {label && (
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-sans uppercase tracking-[0.3em] text-xs text-gold-light"
          >
            {label}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`font-display italic font-semibold leading-tight ${compact ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl'} max-w-2xl`}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-cream/70 max-w-lg text-base md:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  )
}

export default PageHero
