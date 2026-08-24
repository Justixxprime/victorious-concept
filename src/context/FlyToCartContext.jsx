import { createContext, useContext, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const FlyToCartContext = createContext()

export function FlyToCartProvider({ children }) {
  const [flying, setFlying] = useState(null)
  const cartIconRef = useRef(null)

  function registerCartIcon(el) {
    cartIconRef.current = el
  }

  function fly(imageSrc, startRect) {
    if (!cartIconRef.current) return
    const endRect = cartIconRef.current.getBoundingClientRect()
    setFlying({
      id: Date.now(),
      imageSrc,
      start: startRect,
      end: endRect,
    })
  }

  return (
    <FlyToCartContext.Provider value={{ fly, registerCartIcon }}>
      {children}
      <AnimatePresence>
        {flying && (
          <motion.img
            key={flying.id}
            src={flying.imageSrc}
            className="fixed rounded-xl object-cover z-[70] pointer-events-none shadow-2xl"
            style={{ width: flying.start.width, height: flying.start.height }}
            initial={{
              top: flying.start.top,
              left: flying.start.left,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              top: flying.end.top + flying.end.height / 2 - 12,
              left: flying.end.left + flying.end.width / 2 - 12,
              width: 24,
              height: 24,
              opacity: 0.3,
              scale: 0.3,
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