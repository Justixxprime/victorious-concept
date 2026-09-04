import SEO from '../components/SEO'
import Hero from '../components/Hero'
import NewArrivals from '../components/NewArrivals'
import CategoryGrid from '../components/CategoryGrid'
import EditorialFeature from '../components/EditorialFeature'
import FounderTeaser from '../components/FounderTeaser'
import FeaturedProducts from '../components/FeaturedProducts'
import CustomerLove from '../components/CustomerLove'
import ShopTheLook from '../components/ShopTheLook'
import SourceStorySection from '../components/SourceStorySection'
import TrackOrderTeaser from '../components/TrackOrderTeaser'
import Newsletter from '../components/Newsletter'
import { useProducts } from '../hooks/useProducts'
import { useSiteSettings } from '../hooks/useSiteSettings'

function Home() {
  const { products } = useProducts()
  const { value: spotlightSetting } = useSiteSettings('spotlight')
  const { value: lookSetting } = useSiteSettings('shop_the_look')

  // An admin-picked product is used when set and still exists — a product
  // getting deleted or hidden after being picked here falls straight back
  // to the automatic "highest-priced Featured product" behavior, rather
  // than showing a broken/missing product.
  const pickedSpotlight = spotlightSetting?.productId
    ? products.find((p) => String(p.id) === String(spotlightSetting.productId))
    : null
  const featuredForSpotlight = products.filter((p) => p.isFeatured)
  const autoSpotlight = featuredForSpotlight.length > 0
    ? [...featuredForSpotlight].sort((a, b) => b.price - a.price)[0]
    : null
  const spotlightProduct = pickedSpotlight || autoSpotlight

  const pickedLookProducts = (lookSetting?.productIds || [])
    .map((id) => products.find((p) => String(p.id) === String(id)))
    .filter(Boolean)
  const lookProducts = pickedLookProducts.length > 0 ? pickedLookProducts : products.slice(0, 3)

  return (
    <>
      <SEO
        title="Home"
        description="Sourced with intention. Worn with confidence. Shop bags, shoes, clothing, perfumes and accessories."
      />
      <Hero />
      <NewArrivals />
      <CategoryGrid />
      {spotlightProduct && (
        <EditorialFeature
          product={spotlightProduct}
          headline={spotlightSetting?.headline}
          description={spotlightSetting?.description}
        />
      )}
      <FounderTeaser />
      <FeaturedProducts />
      <CustomerLove />
      {lookProducts.length > 0 && (
        <ShopTheLook products={lookProducts} backdropImage={lookSetting?.backdropImage} />
      )}
      <SourceStorySection />
      <TrackOrderTeaser />
      <Newsletter />
    </>
  )
}

export default Home