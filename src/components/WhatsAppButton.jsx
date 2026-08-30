import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useBusinessSettings } from '../context/BusinessSettingsContext'

function WhatsAppButton() {
  const { whatsappNumber } = useBusinessSettings()
  return (
    <motion.a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-24 md:bottom-6 right-4 sm:right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.08 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-[#25D366]"
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <MessageCircle className="w-7 h-7 text-white relative" fill="white" />
    </motion.a>
  )
}

export default WhatsAppButton