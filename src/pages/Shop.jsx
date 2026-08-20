import { products } from '../data/products'
import ProductCard from '../components/ProductCard'

function Shop() {
  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-16 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-10">
          Shop All
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Shop