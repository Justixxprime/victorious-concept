import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatPrice } from '../utils/formatPrice'
import RevealImage from './RevealImage'
import { siteImages } from '../data/siteImages'

function ShopTheLook({ products, backdropImage }) {
  if (!products || products.length === 0) return null

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3 text-center">
          Styled Together
        </p>
        <h2 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream text-center mb-12">
          Shop The Look
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <RevealImage
            src={backdropImage || siteImages.lookbookHero}
            alt="Styled outfit"
            className="aspect-[4/5] rounded-2xl"
          />

          <div className="flex flex-col gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group flex items-center gap-4 bg-gold/5 hover:bg-gold/10 rounded-2xl p-4 transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                >
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </motion.div>
                <div className="flex-1">
                  <p className="font-sans text-sm text-espresso dark:text-cream group-hover:text-gold transition-colors">
                    {product.name}
                  </p>
                  <p className="font-sans text-xs text-gold mt-0.5">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ShopTheLook