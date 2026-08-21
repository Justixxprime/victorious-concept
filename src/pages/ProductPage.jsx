import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingBag, Truck, RefreshCw } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import SEO from '../components/SEO'
import { useEffect } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import ProductCard from '../components/ProductCard'
import Reviews from '../components/Reviews'

function ProductPage() {
  const { id } = useParams()
  const { products } = useProducts()
  const product = products.find((p) => p.id === id)
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { viewed, addViewed } = useRecentlyViewed()

  useEffect(() => {
    if (product) addViewed(product)
  }, [product])

  if (!product) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
          Product not found
        </h1>
        <Link to="/shop" className="text-gold hover:underline">
          Back to Shop
        </Link>
      </div>
    )
  }

  const saved = isWishlisted(product.id)

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-12 px-6 pb-24 md:pb-12 min-h-screen">
      <SEO title={product.name} description={`${product.name}, available now at Victorious Concept.`} />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square rounded-2xl bg-gold/10 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">
              {product.category}
            </p>
            <h1 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream">
              {product.name}
            </h1>
            <p className="font-sans text-xl text-gold mt-3">
              {formatPrice(product.price)}
            </p>
          </div>

          <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
            PLACEHOLDER description. Full product details, materials, and styling notes will be added once available.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => addToCart(product)}
              className="flex-1 bg-gold text-espresso font-sans font-medium px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-gold-light transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center hover:border-gold transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart className={`w-5 h-5 ${saved ? 'fill-gold text-gold' : 'text-espresso dark:text-cream'}`} />
            </button>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-gold/20">
            <div className="flex items-center gap-3 text-sm font-sans text-espresso/70 dark:text-cream/70">
              <Truck className="w-4 h-4 text-gold" />
              Nationwide delivery available
            </div>
            <div className="flex items-center gap-3 text-sm font-sans text-espresso/70 dark:text-cream/70">
              <RefreshCw className="w-4 h-4 text-gold" />
              Returns policy to be confirmed
            </div>
          </div>
        </div>
      </div>

      {/* Related Products + Recently Viewed */}
      {product && (() => {
        const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
        const recentlyViewed = viewed.filter((p) => p.id !== product.id).slice(0, 4)
        return (
          <div className="max-w-7xl mx-auto px-6 pb-16 flex flex-col gap-16">
            {related.length > 0 && (
              <div>
                <h2 className="font-display italic font-semibold text-2xl text-espresso dark:text-cream mb-6">
                  You might also like
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {related.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
            {recentlyViewed.length > 0 && (
              <div>
                <h2 className="font-display italic font-semibold text-2xl text-espresso dark:text-cream mb-6">
                  Recently Viewed
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {recentlyViewed.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Reviews */}
      {product && <Reviews productId={product.id} />}

      {/* Mobile sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-cream dark:bg-espresso border-t border-gold/20 px-4 py-3 flex items-center justify-between gap-3 z-40">
        <div>
          <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">{product.name}</p>
          <p className="font-display italic font-semibold text-lg text-espresso dark:text-cream">
            {formatPrice(product.price)}
          </p>
        </div>
        <button
          onClick={() => addToCart(product)}
          className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gold-light transition-colors flex-shrink-0"
        >
          <ShoppingBag className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </section>
  )
}

export default ProductPage