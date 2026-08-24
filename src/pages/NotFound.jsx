import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import AnimatedLogo from '../components/AnimatedLogo'

function NotFound() {
  return (
    <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-6 px-6 text-center py-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatedLogo className="w-20" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="font-display italic font-semibold text-7xl md:text-8xl text-gold"
      >
        404
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col items-center gap-3"
      >
        <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
          This page took a wrong turn
        </h1>
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 max-w-sm">
          The page you are looking for does not exist or may have moved. Let's get you back
          somewhere worth being.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 mt-2"
      >
        <Link
          to="/"
          className="flex items-center justify-center gap-2 bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors"
        >
          Back to Home <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/shop"
          className="flex items-center justify-center gap-2 border border-gold/30 text-espresso dark:text-cream font-sans font-medium px-8 py-3 rounded-full hover:border-gold transition-colors"
        >
          <ShoppingBag className="w-4 h-4" /> Shop Products
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound