import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { categories } from '../data/categories'
import ProductCard from '../components/ProductCard'
import RevealImage from '../components/RevealImage'
import Breadcrumbs from '../components/Breadcrumbs'
import { siteImages } from '../data/siteImages'
import { useCategories } from '../hooks/useCategories'

function CategoryPage() {
  const { categoryId } = useParams()
  const { products } = useProducts()
  const { categories } = useCategories()
  const category = categories.find((c) => c.id === categoryId)
  const categoryProducts = products.filter((p) => p.category === categoryId)
  const relatedCategories = categories.filter((c) => c.id !== categoryId)

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-12 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: category ? category.name : 'Category' }
        ]} />

        <RevealImage
          src={siteImages.categoryBanner}
          alt={category ? category.name : 'Category'}
          className="w-full aspect-[21/6] rounded-2xl mb-8"
        />

        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-2">
          {category ? category.name : 'Category'}
        </h1>
        {category?.description && (
          <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 max-w-xl mb-3">
            {category.description}
          </p>
        )}
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
      {relatedCategories.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gold/20">
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4">
              Explore More
            </p>
            <div className="flex flex-wrap gap-2">
              {relatedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className="px-4 py-2 rounded-full text-xs font-sans uppercase tracking-wide border border-gold/30 text-espresso dark:text-cream hover:border-gold hover:text-gold transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CategoryPage