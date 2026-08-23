import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/formatPrice'

function CartReminder() {
  const { items, totalPrice } = useCart()
  const location = useLocation()
  const [dismissed, setDismissed] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      setShow(false)
      return
    }
    const timer = setTimeout(() => setShow(true), 15000)
    return () => clearTimeout(timer)
  }, [items.length])

  const hideOn = ['/cart', '/checkout']
  if (hideOn.includes(location.pathname)) return null
  if (!show || dismissed || items.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 left-4 sm:left-6 z-40 bg-espresso text-cream rounded-2xl p-4 pr-3 flex items-center gap-3 shadow-xl max-w-xs"
      >
        <ShoppingBag className="w-5 h-5 text-gold flex-shrink-0" />
        <div className="flex-1">
          <p className="font-sans text-xs text-cream/70">
            {items.length} item{items.length > 1 ? 's' : ''} waiting in your cart
          </p>
          <Link
            to="/cart"
            onClick={() => setDismissed(true)}
            className="font-sans text-sm text-gold hover:underline"
          >
            Complete checkout · {formatPrice(totalPrice)}
          </Link>
        </div>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="flex-shrink-0">
          <X className="w-4 h-4 text-cream/50 hover:text-cream" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

export default CartReminder