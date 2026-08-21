import SEO from '../components/SEO'
import Hero from '../components/Hero'
import NewArrivals from '../components/NewArrivals'
import CategoryGrid from '../components/CategoryGrid'
import FounderTeaser from '../components/FounderTeaser'
import FeaturedProducts from '../components/FeaturedProducts'
import SourceTeaser from '../components/SourceTeaser'

function Home() {
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
      <SourceTeaser />
    </>
  )
}

export default Home