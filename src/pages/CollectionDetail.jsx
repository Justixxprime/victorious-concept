import { useParams, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PageHero from '../components/PageHero'
import { useCollections } from '../hooks/useCollections'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import { siteImages } from '../data/siteImages'

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
    <>
      <SEO title={collection.name} description={collection.description || `${collection.name} collection`} />
      <PageHero
        label="Collection"
        title={collection.name}
        subtitle={collection.description}
        image={collection.image || siteImages.lookbookHero}
        compact
      />
      <section className="bg-cream dark:bg-espresso transition-colors py-16 px-6">
      <div className="max-w-7xl mx-auto">
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
    </>
  )
}

export default CollectionDetail