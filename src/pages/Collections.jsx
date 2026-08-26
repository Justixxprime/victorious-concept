import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { useCollections } from '../hooks/useCollections'
import RevealImage from '../components/RevealImage'
import { siteImages } from '../data/siteImages'

function Collections() {
  const { collections, loading } = useCollections()

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-16 px-6 min-h-screen">
      <SEO title="Collections" description="Curated collections from Victorious Concept." />
      <div className="max-w-6xl mx-auto">
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3 text-center">
          Curated
        </p>
        <h1 className="font-display italic font-semibold text-4xl md:text-5xl text-espresso dark:text-cream text-center mb-16">
          Collections
        </h1>

        {loading ? (
          <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 text-center">Loading...</p>
        ) : collections.length === 0 ? (
          <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 text-center">
            New collections are on the way. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collections.map((col) => (
              <Link key={col.id} to={`/collection/${col.slug}`} className="group block">
                <RevealImage
                  src={col.image || siteImages.lookbookHero}
                  alt={col.name}
                  className="aspect-[4/3] rounded-2xl"
                />
                <h2 className="font-display italic text-2xl text-espresso dark:text-cream mt-4 group-hover:text-gold transition-colors">
                  {col.name}
                </h2>
                {col.description && (
                  <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 mt-1">
                    {col.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Collections