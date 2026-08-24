import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/ProductCard'
import { Heart } from 'lucide-react'

function Wishlist() {
  const { items } = useWishlist()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Heart className="w-10 h-10 text-gold" />
        <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
          Your wishlist is empty
        </h1>
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
          Save items you love by tapping the heart icon.
        </p>
        <Link
          to="/shop"
          className="mt-4 bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-12 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream mb-10">
          Your Wishlist
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Wishlist