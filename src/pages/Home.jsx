import SEO from '../components/SEO'
import Hero from '../components/Hero'
import NewArrivals from '../components/NewArrivals'
import CategoryGrid from '../components/CategoryGrid'
import FounderTeaser from '../components/FounderTeaser'
import FeaturedProducts from '../components/FeaturedProducts'
import SourceTeaser from '../components/SourceTeaser'
import Newsletter from '../components/Newsletter'
import ShopTheLook from '../components/ShopTheLook'
import CustomerLove from '../components/CustomerLove'
import { useProducts } from '../hooks/useProducts'
import EditorialFeature from '../components/EditorialFeature'

function Home() {
  const { products } = useProducts()
  const lookProducts = products.slice(0, 3)
  const spotlightProduct = [...products].filter((p) => p.isFeatured).sort((a, b) => b.price - a.price)[0]

  return (
    <>
     <SEO
        title="Home"
        description="Sourced with intention. Worn with confidence. Shop bags, shoes, clothing, perfumes and accessories."
      />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org/',
          '@type': 'Organization',
          name: 'Victorious Concept',
          url: 'https://victorious-concept.vercel.app',
          logo: 'https://victorious-concept.vercel.app/favicon.png',
          sameAs: [],
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+2348122470435',
            contactType: 'customer service',
          },
        })}
      </script>
      <Hero />
      <NewArrivals />
      <CategoryGrid />
      <EditorialFeature product={spotlightProduct} />
      <FounderTeaser />
      <FeaturedProducts />
      <CustomerLove />
      <ShopTheLook products={lookProducts} />
      <SourceTeaser />
      <Newsletter />
    </>
  )
}

export default Home