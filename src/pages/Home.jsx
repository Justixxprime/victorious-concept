import Hero from '../components/Hero'
import NewArrivals from '../components/NewArrivals'
import CategoryGrid from '../components/CategoryGrid'
import FounderTeaser from '../components/FounderTeaser'
import FeaturedProducts from '../components/FeaturedProducts'

function Home() {
  return (
    <>
      <Hero />
      <NewArrivals />
      <CategoryGrid />
      <FounderTeaser />
      <FeaturedProducts />
    </>
  )
}

export default Home