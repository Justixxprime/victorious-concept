import { useParams, Link } from 'react-router-dom'
import { products } from '../data/products'
import { categories } from '../data/categories'
import ProductCard from '../components/ProductCard'

function CategoryPage() {
  const { categoryId } = useParams()
  const category = categories.find((c) => c.id === categoryId)
  const categoryProducts = products.filter((p) => p.category === categoryId)

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-12 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-2">
          {category ? category.name : 'Category'}
        </h1>
        <p className="font-sans text-sm text-espresso/50 dark:text-cream/50 mb-10">
          {categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'items'}
        </p>

        {categoryProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
              No products in this category yet. Check back soon.
            </p>
            <Link to="/shop" className="text-gold hover:underline font-sans text-sm">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default CategoryPage