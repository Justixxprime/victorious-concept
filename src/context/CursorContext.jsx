import { createContext, useContext, useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const CursorContext = createContext(null)

/**
 * Renders a small floating pill that trails the pointer, shown only when a
 * component explicitly asks for it via useEditorialCursor(). Deliberately
 * does NOT hide or replace the native system cursor anywhere — that's a
 * real accessibility risk for screen-magnifier and assistive-pointer users.
 * This is purely additive, and disables itself entirely on touch devices
 * and when the user has requested reduced motion.
 */
export function CursorProvider({ children }) {
  const [label, setLabel] = useState(null)
  const [enabled, setEnabled] = useState(false)

  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)
  const springX = useSpring(mouseX, { damping: 28, stiffness: 320, mass: 0.4 })
  const springY = useSpring(mouseY, { damping: 28, stiffness: 320, mass: 0.4 })

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(fine && !reducedMotion)
  }, [])

  useEffect(() => {
    if (!enabled) return undefined

    function handleMove(e) {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [enabled, mouseX, mouseY])

  return (
    <CursorContext.Provider value={{ setLabel, enabled }}>
      {children}
      {enabled && (
        <motion.div
          aria-hidden="true"
          style={{ x: springX, y: springY }}
          className="pointer-events-none fixed top-0 left-0 z-[200]"
        >
          <motion.span
            initial={false}
            animate={{ opacity: label ? 1 : 0, scale: label ? 1 : 0.7 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-espresso dark:bg-cream text-cream dark:text-espresso font-sans text-xs uppercase tracking-widest px-4 py-2 shadow-lg"
          >
            {label}
          </motion.span>
        </motion.div>
      )}
    </CursorContext.Provider>
  )
}

/**
 * Returns { show(text), hide() }. Call show() on mouse enter of an element
 * you want the editorial cursor to label, hide() on mouse leave. Safe to
 * call even outside a CursorProvider (no-ops) and safe to call when
 * disabled (fine-pointer/reduced-motion check happens inside the provider).
 */
export function useEditorialCursor() {
  const ctx = useContext(CursorContext)
  if (!ctx) return { show: () => {}, hide: () => {} }
  const { setLabel, enabled } = ctx
  return {
    show: (text) => {
      if (enabled) setLabel(text)
    },
    hide: () => setLabel(null),
  }
}
