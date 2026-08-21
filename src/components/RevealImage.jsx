import { motion } from 'framer-motion'

function RevealImage({ src, alt, className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute inset-0 bg-espresso"
        style={{ transformOrigin: 'top' }}
        initial={{ scaleY: 1 }}
        whileInView={{ scaleY: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.83, 0, 0.17, 1], delay: 0.15 }}
      />
    </div>
  )
}

export default RevealImage