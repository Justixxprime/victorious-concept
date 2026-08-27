import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductCard from './ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'

function FeaturedProducts() {
  const { products, loading } = useProducts()
  const featured = products.filter((p) => p.isFeatured)

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream">
            Featured
          </h2>
          <Link
            to="/shop"
            className="font-sans text-xs uppercase tracking-widest text-gold hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts