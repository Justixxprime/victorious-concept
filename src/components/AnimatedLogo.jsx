import { motion } from 'framer-motion'

function AnimatedLogo({ className = 'w-40' }) {
  return (
    <div className={className}>
      <motion.svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.circle
          cx="100"
          cy="85"
          r="70"
          stroke="url(#ringGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
        <motion.path
          d="M65 65 L100 130 L135 65"
          stroke="url(#ringGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeInOut', delay: 0.6 }}
        />
        <motion.path
          d="M158 28 L162 40 L174 44 L162 48 L158 60 L154 48 L142 44 L154 40 Z"
          fill="#e8c490"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 1, 0.4, 1], scale: 1 }}
          transition={{ duration: 2, delay: 1.6, repeat: Infinity, repeatDelay: 2.5 }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="200" y2="200">
            <stop offset="0%" stopColor="#a5713c" />
            <stop offset="100%" stopColor="#e8c490" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  )
}

export default AnimatedLogo