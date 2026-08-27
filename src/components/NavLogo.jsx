import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedLogo from './AnimatedLogo'

function NavLogo({ light = false, onClick, iconClassName = 'w-9 h-9 sm:w-11 sm:h-11' }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="relative group flex items-center gap-2.5 flex-shrink-0"
    >
      <div className="absolute -inset-3 bg-gold/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <motion.div
        className={`relative ${iconClassName}`}
        initial={{ opacity: 0, rotate: -8 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.06 }}
      >
        <AnimatedLogo className="w-full h-full" />
      </motion.div>

      <motion.div
        className="relative flex flex-col leading-none"
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          className={`font-display italic font-semibold text-lg sm:text-xl ${
            light ? 'text-cream' : 'text-espresso dark:text-cream'
          }`}
        >
          Victorious
        </span>
        <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-gold">
          Concept
        </span>
      </motion.div>
    </Link>
  )
}

export default NavLogo
