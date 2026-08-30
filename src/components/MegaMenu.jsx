import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Footprints, Shirt, Droplet, Gem, Tag, ArrowRight, Sparkles, TrendingUp } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import { categoryImages, siteImages } from '../data/siteImages'
import { formatPrice } from '../utils/formatPrice'

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
  const { products } = useProducts()
  const trending = products.filter((p) => p.isFeatured).slice(0, 3)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 right-0 top-full max-h-[calc(100vh-80px)] overflow-y-auto shadow-2xl z-40 border-b border-gold/30"
        >
          {/* Full cinematic background */}
          <div className="absolute inset-0">
            <img
              src={siteImages.megaMenuBackdrop}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-espresso/92 backdrop-blur-md" />
            <div className="absolute inset-0 bg-gradient-to-br from-espresso via-espresso/95 to-espresso/85" />
            {/* Soft gold glow along the top seam, ties visually into the navbar above */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-12 grid grid-cols-3 gap-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-gold-light" />
                <p className="font-sans text-xs uppercase tracking-[0.25em] text-gold-light">
                  Shop by Category
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {categories.map((cat, i) => {
                  const Icon = iconMap[cat.id] || Tag
                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        to={`/category/${cat.id}`}
                        className="group relative flex flex-col justify-end h-28 rounded-xl overflow-hidden border border-cream/10 hover:border-gold/60 transition-colors"
                      >
                        {categoryImages[cat.id] && (
                          <img
                            src={categoryImages[cat.id]}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-transparent" />
                        <div className="relative flex items-center gap-2 p-3">
                          <Icon className="w-4 h-4 text-gold-light flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="font-sans text-sm text-cream group-hover:text-gold-light transition-colors">
                            {cat.name}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* TRENDING NOW - real live products, not decoration */}
              {trending.length > 0 && (
                <div className="mt-8 pt-6 border-t border-cream/10">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-3.5 h-3.5 text-gold-light" />
                    <p className="font-sans text-xs uppercase tracking-[0.25em] text-gold-light">
                      Trending Now
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {trending.map((product, i) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link to={`/product/${product.id}`} className="group flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-cream/10">
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-sans text-xs text-cream truncate group-hover:text-gold-light transition-colors">
                              {product.name}
                            </p>
                            <p className="font-sans text-[11px] text-gold">{formatPrice(product.price)}</p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-6 mt-8 pt-6 border-t border-cream/10">
                <Link to="/shop?new=true" className="font-sans text-sm text-gold-light hover:text-gold transition-colors flex items-center gap-1">
                  New Arrivals <ArrowRight className="w-3 h-3" />
                </Link>
                <Link to="/shop" className="font-sans text-sm text-gold-light hover:text-gold transition-colors flex items-center gap-1">
                  Best Sellers <ArrowRight className="w-3 h-3" />
                </Link>
                <Link to="/lookbook" className="font-sans text-sm text-gold-light hover:text-gold transition-colors flex items-center gap-1">
                  Lookbook <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to="/shop" className="relative rounded-2xl overflow-hidden group block h-full min-h-[280px] border border-gold/20">
                <img
                  src={siteImages.lookbookHero}
                  alt="Shop the collection"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="font-sans text-[10px] uppercase tracking-widest text-gold-light mb-1">
                    Featured
                  </p>
                  <p className="font-display italic font-semibold text-2xl text-cream leading-tight mb-3">
                    Shop the Collection
                  </p>
                  <span className="inline-flex items-center gap-1 font-sans text-xs text-cream/80 group-hover:text-gold-light transition-colors">
                    Explore now <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MegaMenu