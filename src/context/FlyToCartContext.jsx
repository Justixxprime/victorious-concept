import { createContext, useContext, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const FlyToCartContext = createContext()

export function FlyToCartProvider({ children }) {
  const [flying, setFlying] = useState(null)
  const cartIconRef = useRef(null)
  const wishlistIconRef = useRef(null)

  function registerCartIcon(el) {
    cartIconRef.current = el
  }

  function registerWishlistIcon(el) {
    wishlistIconRef.current = el
  }

  function fly(imageSrc, startRect, target = 'cart') {
    const iconRef = target === 'wishlist' ? wishlistIconRef : cartIconRef
    if (!iconRef.current) return
    const endRect = iconRef.current.getBoundingClientRect()
    setFlying({
      id: Date.now(),
      imageSrc,
      start: startRect,
      end: endRect,
      target,
    })
  }

  return (
    <FlyToCartContext.Provider value={{ fly, registerCartIcon, registerWishlistIcon }}>
      {children}
      <AnimatePresence>
        {flying && (
          <motion.img
            key={flying.id}
            src={flying.imageSrc}
            className={`fixed object-cover z-[70] pointer-events-none shadow-2xl ${
              flying.target === 'wishlist' ? 'rounded-full' : 'rounded-xl'
            }`}
            style={{ width: flying.start.width, height: flying.start.height }}
            initial={{
              top: flying.start.top,
              left: flying.start.left,
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            animate={{
              top: flying.end.top + flying.end.height / 2 - 12,
              left: flying.end.left + flying.end.width / 2 - 12,
              width: 24,
              height: 24,
              opacity: 0.3,
              scale: 0.3,
              rotate: flying.target === 'wishlist' ? 15 : 0,
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => setFlying(null)}
          />
        )}
      </AnimatePresence>
    </FlyToCartContext.Provider>
  )
}

export function useFlyToCart() {
  return useContext(FlyToCartContext)
}