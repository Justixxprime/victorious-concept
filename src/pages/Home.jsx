import SEO from '../components/SEO'
import Hero from '../components/Hero'
import NewArrivals from '../components/NewArrivals'
import CategoryGrid from '../components/CategoryGrid'
import EditorialFeature from '../components/EditorialFeature'
import FounderTeaser from '../components/FounderTeaser'
import FeaturedProducts from '../components/FeaturedProducts'
import CustomerLove from '../components/CustomerLove'
import ShopTheLook from '../components/ShopTheLook'
import SourceTeaser from '../components/SourceTeaser'
import TrackOrderTeaser from '../components/TrackOrderTeaser'
import Newsletter from '../components/Newsletter'
import { useProducts } from '../hooks/useProducts'

function Home() {
  const { products } = useProducts()
  const lookProducts = products.slice(0, 3)
  const featuredForSpotlight = products.filter((p) => p.isFeatured)
  const spotlightProduct = featuredForSpotlight.length > 0
    ? [...featuredForSpotlight].sort((a, b) => b.price - a.price)[0]
    : null

  return (
    <>
      <SEO
        title="Home"
        description="Sourced with intention. Worn with confidence. Shop bags, shoes, clothing, perfumes and accessories."
      />
      <Hero />
      <NewArrivals />
      <CategoryGrid />
      {spotlightProduct && <EditorialFeature product={spotlightProduct} />}
      <FounderTeaser />
      <FeaturedProducts />
      <CustomerLove />
      {lookProducts.length > 0 && <ShopTheLook products={lookProducts} />}
      <SourceTeaser />
      <TrackOrderTeaser />
      <Newsletter />
    </>
  )
}

export default Home