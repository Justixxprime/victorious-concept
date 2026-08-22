import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, Heart, Check } from 'lucide-react'

const ToastContext = createContext()

const icons = { cart: ShoppingBag, wishlist: Heart, success: Check }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2600)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 sm:right-6 z-[60] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type] || Check
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 40, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 bg-espresso dark:bg-cream text-cream dark:text-espresso pl-4 pr-5 py-3 rounded-full shadow-xl"
              >
                <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-espresso" fill={toast.type === 'wishlist' ? 'currentColor' : 'none'} />
                </div>
                <span className="font-sans text-sm whitespace-nowrap">{toast.message}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}