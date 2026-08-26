import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Footprints, Shirt, Droplet, Gem, Tag, ArrowRight } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { siteImages } from '../data/siteImages'

const iconMap = {
  bags: ShoppingBag,
  shoes: Footprints,
  slippers: Footprints,
  clothing: Shirt,
  perfumes: Droplet,
  accessories: Gem,
}

function MegaMenu({ open }) {
  const { categories } = useCategories()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 right-0 top-full bg-cream dark:bg-espresso border-b border-gold/20 shadow-xl z-40"
        >
          <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-3 gap-10">
            <div className="col-span-2">
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-5">
                Shop by Category
              </p>
              <div className="grid grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const Icon = iconMap[cat.id] || Tag
                  return (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gold/10 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-gold flex-shrink-0" />
                      <span className="font-sans text-sm text-espresso dark:text-cream">{cat.name}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="flex gap-6 mt-8 pt-6 border-t border-gold/10">
                <Link to="/shop?new=true" className="font-sans text-sm text-gold hover:underline flex items-center gap-1">
                  New Arrivals <ArrowRight className="w-3 h-3" />
                </Link>
                <Link to="/shop" className="font-sans text-sm text-gold hover:underline flex items-center gap-1">
                  Best Sellers <ArrowRight className="w-3 h-3" />
                </Link>
                <Link to="/lookbook" className="font-sans text-sm text-gold hover:underline flex items-center gap-1">
                  Lookbook <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <Link to="/shop" className="relative rounded-2xl overflow-hidden group block">
              <img
                src={siteImages.heroBackdrop}
                alt="Shop the collection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="font-display italic font-semibold text-xl text-cream">
                  Shop the Collection
                </p>
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MegaMenu