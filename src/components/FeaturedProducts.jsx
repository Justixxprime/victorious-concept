import { useProducts } from '../hooks/useProducts'
import ProductCard from './ProductCard'

function FeaturedProducts() {
  const { products } = useProducts()
  const featured = products.filter((p) => p.isFeatured)

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream mb-10">
          Featured
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts