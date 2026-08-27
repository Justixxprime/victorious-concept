import SEO from '../components/SEO'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProducts } from '../hooks/useProducts'
import { formatPrice } from '../utils/formatPrice'
import RevealImage from '../components/RevealImage'
import { siteImages } from '../data/siteImages'
import { ArrowUpRight } from 'lucide-react'

function Lookbook() {
  const { products } = useProducts()

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-16 px-6 min-h-screen">
      <SEO title="Lookbook" description="Editorial styling from Victorious Concept." />

      <div className="max-w-5xl mx-auto text-center mb-16">
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4">Editorial</p>
        <h1 className="font-display italic font-semibold text-4xl md:text-6xl text-espresso dark:text-cream mb-6">
          The Lookbook
        </h1>
        <p className="font-sans text-sm md:text-base text-espresso/60 dark:text-cream/60 max-w-xl mx-auto mb-10">
          Not just what we sell, how it actually gets worn. A visual record of every piece,
          styled the way it's meant to be seen.
        </p>
        <RevealImage
          src={siteImages.lookbookHero}
          alt="Victorious Concept editorial"
          className="w-full aspect-[21/9] rounded-2xl"
        />
      </div>

      <div className="max-w-3xl mx-auto text-center mb-16 px-6">
        <p className="font-display italic text-2xl md:text-3xl text-espresso dark:text-cream leading-relaxed">
          "Every piece here started the same way the business did, a search, a find, a piece
          worth carrying."
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {products.map((product, i) => {
          // Editorial rhythm: every 5th tile spans two columns for visual variety
          const isFeature = i % 5 === 0
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className={isFeature ? 'col-span-2' : ''}
            >
              <Link to={`/product/${product.id}`} className="group block">
                <div className={`relative rounded-2xl overflow-hidden ${isFeature ? 'aspect-[16/9]' : 'aspect-[4/5]'}`}>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gold/10 flex items-center justify-center">
                      <span className="font-sans text-xs text-espresso/40 dark:text-cream/40 uppercase tracking-wide">
                        Photo coming soon
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-cream/90 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 text-espresso" />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <h3 className="font-display italic text-lg text-espresso dark:text-cream group-hover:text-gold transition-colors">
                    {product.name}
                  </h3>
                  <span className="font-sans text-sm text-gold">{formatPrice(product.price)}</span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default Lookbook