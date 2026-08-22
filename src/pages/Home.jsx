import SEO from '../components/SEO'
import Hero from '../components/Hero'
import NewArrivals from '../components/NewArrivals'
import CategoryGrid from '../components/CategoryGrid'
import FounderTeaser from '../components/FounderTeaser'
import FeaturedProducts from '../components/FeaturedProducts'
import SourceTeaser from '../components/SourceTeaser'
import Newsletter from '../components/Newsletter'
import ShopTheLook from '../components/ShopTheLook'
import { useProducts } from '../hooks/useProducts'

function Home() {
  const { products } = useProducts()
  const lookProducts = products.slice(0, 3)

  return (
    <>
      <SEO
        title="Home"
        description="Sourced with intention. Worn with confidence. Shop bags, shoes, clothing, perfumes and accessories."
      />
      <Hero />
      <NewArrivals />
      <CategoryGrid />
      <FounderTeaser />
      <FeaturedProducts />
      <ShopTheLook products={lookProducts} />
      <SourceTeaser />
      <Newsletter />
    </>
  )
}

export default Home