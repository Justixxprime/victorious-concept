import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Search as SearchIcon } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { formatPrice } from '../utils/formatPrice'

function SearchOverlay({ onClose }) {
  const { products } = useProducts()
  const [query, setQuery] = useState('')

  const results = query.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : []

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
              placeholder="Search products"
              className="flex-1 bg-transparent outline-none font-sans text-lg text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40"
            />
          </div>
          <button onClick={onClose} className="ml-4" aria-label="Close search">
            <X className="w-6 h-6 text-espresso dark:text-cream" />
          </button>
        </div>

        {query.trim() === '' && (
          <p className="font-sans text-sm text-espresso/50 dark:text-cream/50">
            Try searching bags, shoes, perfumes, or accessories.
          </p>
        )}

        {query.trim() !== '' && results.length === 0 && (
          <p className="font-sans text-sm text-espresso/50 dark:text-cream/50">
            No products found for "{query}".
          </p>
        )}

        <div className="flex flex-col gap-4 mt-4">
          {results.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              onClick={onClose}
              className="flex items-center gap-4 hover:opacity-70 transition-opacity"
            >
              <div className="w-14 h-14 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] text-espresso/40 dark:text-cream/40 text-center">
                  No image
                </span>
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