import { useState, useEffect } from 'react'
import SEO from '../components/SEO'
import { products } from '../data/products'
import { categories } from '../data/categories'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'

function Shop() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  let filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory)

  let sorted = [...filtered]
  if (sortBy === 'price-low') sorted.sort((a, b) => a.price - b.price)
  if (sortBy === 'price-high') sorted.sort((a, b) => b.price - a.price)

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-12 px-6 min-h-screen">
      <SEO title="Shop All" description="Browse the full Victorious Concept collection." />
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-8">
          Shop All
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-sans uppercase tracking-wide border transition-colors ${
                activeCategory === 'all'
                  ? 'bg-gold text-espresso border-gold'
                  : 'border-gold/30 text-espresso dark:text-cream hover:border-gold'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-sans uppercase tracking-wide border transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-gold text-espresso border-gold'
                    : 'border-gold/30 text-espresso dark:text-cream hover:border-gold'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border border-gold/30 rounded-full px-4 py-2 text-xs font-sans uppercase tracking-wide text-espresso dark:text-cream outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 text-center py-20">
            No products match this filter yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Shop