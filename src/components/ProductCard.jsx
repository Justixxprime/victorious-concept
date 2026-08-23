import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import RevealImage from './RevealImage'

function ProductCard({ product }) {
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const saved = isWishlisted(product.id)

  function handleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
    showToast(saved ? 'Removed from wishlist' : 'Added to wishlist', 'wishlist')
  }

  const isPreorder = product.status === 'preorder'
  const outOfStock = product.stock <= 0 && !isPreorder

  function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    addToCart(product)
    showToast(`${product.name} added to cart`, 'cart')
  }

  return (
    <div className="group relative">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] rounded-2xl bg-gold/10 overflow-hidden">
          <RevealImage
            src={product.image}
            alt={product.name}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />

          {product.isNew && !outOfStock && (
            <span className="absolute top-3 left-3 bg-espresso text-cream text-xs font-sans px-3 py-1 rounded-full">
              New
            </span>
          )}
          {outOfStock && (
            <span className="absolute top-3 left-3 bg-espresso/80 text-cream text-xs font-sans px-3 py-1 rounded-full">
              Out of Stock
            </span>
          )}
          {isPreorder && (
            <span className="absolute top-3 left-3 bg-gold text-espresso text-xs font-sans px-3 py-1 rounded-full">
              Preorder
            </span>
          )}
          {!outOfStock && product.stock <= 2 && (
            <span className="absolute top-3 left-3 bg-gold text-espresso text-xs font-sans px-3 py-1 rounded-full">
              Only {product.stock} left
            </span>
          )}
        </div>
      </Link>

      <motion.button
        onClick={handleWishlist}
        whileTap={{ scale: 0.8 }}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-cream/90 flex items-center justify-center hover:bg-cream transition-colors"
        aria-label="Add to wishlist"
      >
        <motion.div
          key={saved ? 'saved' : 'unsaved'}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-gold text-gold' : 'text-espresso'}`} />
        </motion.div>
      </motion.button>

      {!outOfStock && (
        <motion.button
          onClick={handleAddToCart}
          whileTap={{ scale: 0.92 }}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-espresso text-cream flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-gold hover:text-espresso"
          aria-label="Quick add to cart"
        >
          <ShoppingBag className="w-4 h-4" />
        </motion.button>
      )}

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