import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { siteImages } from '../data/siteImages'
import {
  BookOpen,
  Sparkles,
  Heart,
  PackageSearch,
  HelpCircle,
  Truck,
  RotateCcw,
  MessageCircle,
  Image as ImageIcon,
} from 'lucide-react'

const pages = [
  { label: 'Lookbook', to: '/lookbook', icon: ImageIcon, blurb: 'Editorial and styling' },
  { label: 'Journal', to: '/journal', icon: BookOpen, blurb: 'Stories from the road' },
  { label: 'Source It', to: '/source', icon: Sparkles, blurb: 'Can\'t find it? We will' },
  { label: 'About', to: '/about', icon: Heart, blurb: 'The founder story' },
  { label: 'Track Order', to: '/track-order', icon: PackageSearch, blurb: 'Where is my order' },
  { label: 'Delivery', to: '/delivery', icon: Truck, blurb: 'Shipping and timelines' },
  { label: 'Returns', to: '/returns', icon: RotateCcw, blurb: 'Easy, honest returns' },
  { label: 'FAQ', to: '/faq', icon: HelpCircle, blurb: 'Quick answers' },
  { label: 'Contact', to: '/contact', icon: MessageCircle, blurb: 'Talk to a real person' },
]

function ExploreMenu({ open, onNavigate }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 right-0 top-full w-full bg-espresso text-cream border-t border-gold/20 shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0">
            <img src={siteImages.megaMenuBackdrop} alt="" className="w-full h-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-espresso/93 backdrop-blur-md" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
            <motion.div
              className="absolute top-6 left-[20%] w-1 h-1 rounded-full bg-gold-light"
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-8 right-[25%] w-1 h-1 rounded-full bg-gold"
              animate={{ opacity: [0.15, 0.6, 0.15] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
          </div>

          <div className="relative max-w-5xl mx-auto px-8 py-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="font-sans text-[11px] uppercase tracking-[0.3em] text-gold-light mb-6"
            >
              Explore Victorious Concept
            </motion.p>
            <div className="grid grid-cols-3 gap-x-8 gap-y-5">
              {pages.map((page, i) => {
                const Icon = page.icon
                return (
                  <motion.div
                    key={page.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.04 * i, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={page.to}
                      onClick={onNavigate}
                      className="group flex items-center gap-3 py-1.5"
                    >
                      <span className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold group-hover:text-espresso text-gold transition-colors duration-300">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span>
                        <span className="block font-display italic text-base leading-tight group-hover:text-gold-light transition-colors">
                          {page.label}
                        </span>
                        <span className="block font-sans text-[11px] text-cream/40">
                          {page.blurb}
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ExploreMenu