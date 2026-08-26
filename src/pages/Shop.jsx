import { useState } from 'react'
import SEO from '../components/SEO'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import Breadcrumbs from '../components/Breadcrumbs'
import { useSearchParams } from 'react-router-dom'

function Shop() {
  const { products, loading, error } = useProducts()
  const { categories } = useCategories()
  const [searchParams, setSearchParams] = useSearchParams()
  const newOnly = searchParams.get('new') === 'true'
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [maxPrice, setMaxPrice] = useState('')
  const [sizeFilter, setSizeFilter] = useState('')

  let filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory)

  if (newOnly) {
    filtered = filtered.filter((p) => p.isNew)
  }

  if (maxPrice) {
    filtered = filtered.filter((p) => p.price <= Number(maxPrice))
  }

  if (sizeFilter) {
    filtered = filtered.filter((p) => p.sizes && p.sizes.includes(sizeFilter))
  }

  const allSizes = [...new Set(products.flatMap((p) => p.sizes || []))].sort()

  let sorted = [...filtered]
  if (sortBy === 'price-low') sorted.sort((a, b) => a.price - b.price)
  if (sortBy === 'price-high') sorted.sort((a, b) => b.price - a.price)

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-12 px-6 min-h-screen">
      <SEO title="Shop All" description="Browse the full Victorious Concept collection." />
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} />
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-8">
          {newOnly ? 'New In' : 'Shop All'}
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

          <button
            onClick={() => setSearchParams(newOnly ? {} : { new: 'true' })}
            className={`px-4 py-2 rounded-full text-xs font-sans uppercase tracking-wide border transition-colors ${
              newOnly ? 'bg-gold text-espresso border-gold' : 'border-gold/30 text-espresso dark:text-cream hover:border-gold'
            }`}
          >
            New Only
          </button>

          <div className="flex flex-wrap gap-2">
            {allSizes.length > 0 && (
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="bg-transparent border border-gold/30 rounded-full px-4 py-2 text-xs font-sans uppercase tracking-wide text-espresso dark:text-cream outline-none focus:border-gold"
              >
                <option value="">All Sizes</option>
                {allSizes.map((size) => (
                  <option key={size} value={size}>Size {size}</option>
                ))}
              </select>
            )}

            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-transparent border border-gold/30 rounded-full px-4 py-2 text-xs font-sans uppercase tracking-wide text-espresso dark:text-cream outline-none focus:border-gold"
            >
              <option value="">Any Price</option>
              <option value="15000">Under ₦15,000</option>
              <option value="25000">Under ₦25,000</option>
              <option value="40000">Under ₦40,000</option>
              <option value="60000">Under ₦60,000</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-gold/30 rounded-full px-4 py-2 text-xs font-sans uppercase tracking-wide text-espresso dark:text-cream outline-none focus:border-gold"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="font-sans text-sm text-red-500 text-center py-10">
            Something went wrong loading products: {error}
          </p>
        )}

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