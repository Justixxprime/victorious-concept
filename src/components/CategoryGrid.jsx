import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCategories } from '../hooks/useCategories'
import { ShoppingBag, Footprints, Shirt, Droplet, Gem, Tag } from 'lucide-react'
import { categoryImages } from '../data/siteImages'

const iconMap = {
  bags: ShoppingBag,
  shoes: Footprints,
  slippers: Footprints,
  clothing: Shirt,
  perfumes: Droplet,
  accessories: Gem,
}

function CategoryGrid() {
  const { categories } = useCategories()

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream mb-10">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.id] || Tag
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={`/category/${cat.id}`}
                  className="group relative flex flex-col items-center justify-end gap-2 aspect-square rounded-2xl overflow-hidden"
                >
                  {categoryImages[cat.id] && (
                    <img
                      src={categoryImages[cat.id]}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/30 to-espresso/10 group-hover:from-espresso/95 transition-colors duration-500" />

                  <Icon className="relative w-5 h-5 text-gold-light mb-1 group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative font-sans text-xs sm:text-sm uppercase tracking-wide text-cream mb-3 group-hover:text-gold-light transition-colors">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CategoryGrid