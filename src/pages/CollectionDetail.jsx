import { useParams, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { useCollections } from '../hooks/useCollections'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'

function CollectionDetail() {
  const { slug } = useParams()
  const { collections } = useCollections()
  const { products } = useProducts()
  const collection = collections.find((c) => c.slug === slug)
  const collectionProducts = collection
    ? products.filter((p) => collection.product_ids.includes(String(p.id)))
    : []

  if (!collection) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
          Collection not found
        </h1>
        <Link to="/collections" className="text-gold hover:underline">
          Back to Collections
        </Link>
      </div>
    )
  }

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-12 px-6 min-h-screen">
      <SEO title={collection.name} description={collection.description || `${collection.name} collection`} />
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-2">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 max-w-xl mb-10">
            {collection.description}
          </p>
        )}

        {collectionProducts.length === 0 ? (
          <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
            Products for this collection are being added.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default CollectionDetail