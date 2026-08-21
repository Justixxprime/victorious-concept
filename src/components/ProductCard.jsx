import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import { useWishlist } from '../context/WishlistContext'

function ProductCard({ product }) {
  const { toggleWishlist, isWishlisted } = useWishlist()
  const saved = isWishlisted(product.id)

  return (
    <div className="group relative">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] rounded-2xl bg-gold/10 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {product.isNew && (
            <span className="absolute top-3 left-3 bg-espresso text-cream text-xs font-sans px-3 py-1 rounded-full">
              New
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={() => toggleWishlist(product)}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-cream/90 flex items-center justify-center hover:bg-cream transition-colors"
        aria-label="Add to wishlist"
      >
        <Heart className={`w-4 h-4 ${saved ? 'fill-gold text-gold' : 'text-espresso'}`} />
      </button>

      <Link to={`/product/${product.id}`} className="block pt-4">
        <h3 className="font-sans text-sm text-espresso dark:text-cream">
          {product.name}
        </h3>
        <p className="font-sans text-sm text-gold mt-1">
          {formatPrice(product.price)}
        </p>
      </Link>
    </div>
  )
}

export default ProductCard