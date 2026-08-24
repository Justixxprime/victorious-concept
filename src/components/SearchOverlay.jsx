import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Search as SearchIcon, Clock, TrendingUp } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { formatPrice } from '../utils/formatPrice'

const RECENT_KEY = 'vc-recent-searches'

function SearchOverlay({ onClose }) {
  const { products } = useProducts()
  const { categories } = useCategories()
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem(RECENT_KEY)
    return saved ? JSON.parse(saved) : []
  })

  const results = query.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : []

  function saveSearch(term) {
    if (!term.trim()) return
    setRecentSearches((prev) => {
      const updated = [term, ...prev.filter((t) => t !== term)].slice(0, 5)
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
      return updated
    })
  }

  function handleResultClick() {
    saveSearch(query)
    onClose()
  }

  function clearRecent() {
    setRecentSearches([])
    localStorage.removeItem(RECENT_KEY)
  }

  const featured = products.filter((p) => p.isFeatured).slice(0, 4)

  return (
    <div className="fixed inset-0 bg-cream dark:bg-espresso z-50 flex flex-col px-6 pt-6 pb-10 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 flex-1 border-b border-gold/30 pb-3">
            <SearchIcon className="w-5 h-5 text-gold" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveSearch(query)}
              placeholder="Search products"
              className="flex-1 bg-transparent outline-none font-sans text-lg text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40"
            />
          </div>
          <button onClick={onClose} className="ml-4" aria-label="Close search">
            <X className="w-6 h-6 text-espresso dark:text-cream" />
          </button>
        </div>

        {query.trim() === '' && (
          <div className="flex flex-col gap-10">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-sans text-xs uppercase tracking-widest text-gold flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Recent Searches
                  </p>
                  <button onClick={clearRecent} className="font-sans text-xs text-espresso/40 dark:text-cream/40 hover:text-gold">
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 rounded-full text-xs font-sans border border-gold/30 text-espresso dark:text-cream hover:border-gold transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3 flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> Popular Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    onClick={onClose}
                    className="px-4 py-2 rounded-full text-xs font-sans border border-gold/30 text-espresso dark:text-cream hover:border-gold transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {query.trim() !== '' && results.length === 0 && (
          <div>
            <p className="font-sans text-sm text-espresso/50 dark:text-cream/50 mb-6">
              No products found for "{query}". You might like these instead:
            </p>
            <div className="flex flex-col gap-4">
              {featured.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-4 hover:opacity-70 transition-opacity"
                >
                  <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  <div>
                    <p className="font-sans text-sm text-espresso dark:text-cream">{product.name}</p>
                    <p className="font-sans text-xs text-gold">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-4">
          {results.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              onClick={handleResultClick}
              className="flex items-center gap-4 hover:opacity-70 transition-opacity"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-sans text-sm text-espresso dark:text-cream">
                  {product.name}
                </p>
                <p className="font-sans text-xs text-gold">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchOverlay