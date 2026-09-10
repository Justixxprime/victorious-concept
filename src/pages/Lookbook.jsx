import SEO from '../components/SEO'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProducts } from '../hooks/useProducts'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { formatPrice } from '../utils/formatPrice'
import RevealImage from '../components/RevealImage'
import { useSiteImages } from '../hooks/useSiteImages'
import { ArrowUpRight } from 'lucide-react'
import { useEditorialCursor } from '../context/CursorContext'

// Editorial rhythm for the main grid: a repeating pattern of column spans
// and aspect ratios so the grid doesn't feel like a flat, repetitive
// catalog. Cycles rather than a single fixed "every Nth tile" rule.
const TILE_PATTERN = [
  { span: 1, aspect: 'aspect-[4/5]' },
  { span: 1, aspect: 'aspect-square' },
  { span: 2, aspect: 'aspect-[16/9]' },
  { span: 1, aspect: 'aspect-[4/5]' },
  { span: 1, aspect: 'aspect-[3/4]' },
  { span: 1, aspect: 'aspect-square' },
]

// Where, in the flattened tile sequence, to break the grid with a full-bleed
// editorial image. Placed once, roughly a third of the way through.
const MOMENT_BREAK_AFTER = 9

function StyledLook({ look, products, cursor }) {
  const lookProducts = look.productIds
    .map((id) => products.find((p) => String(p.id) === String(id)))
    .filter(Boolean)

  if (lookProducts.length < 2) return null

  return (
    <div className="max-w-6xl mx-auto mb-16 px-6">
      <div className="text-center mb-8">
        <p className="font-sans text-xs uppercase tracking-widest text-gold-deep dark:text-gold mb-3">
          Styled Look
        </p>
        <h2 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream mb-3">
          {look.title}
        </h2>
        {look.description && (
          <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 max-w-lg mx-auto">
            {look.description}
          </p>
        )}
      </div>
      <div className={`grid gap-4 ${lookProducts.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
        {lookProducts.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            onMouseEnter={() => cursor.show('View')}
            onMouseLeave={cursor.hide}
            className="group block"
          >
            <RevealImage
              src={product.image}
              alt={product.name}
              className="aspect-[4/5] rounded-2xl mb-3"
            />
            <div className="flex items-center justify-between">
              <h3 className="font-display italic text-base text-espresso dark:text-cream group-hover:text-gold-deep dark:group-hover:text-gold transition-colors">
                {product.name}
              </h3>
              <span className="font-sans text-xs text-gold-deep dark:text-gold">
                {formatPrice(product.price)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function Lookbook() {
  const { products } = useProducts()
  const { value: looks } = useSiteSettings('lookbook_looks')
  const { siteImages } = useSiteImages()
  const cursor = useEditorialCursor()

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-16 px-6 min-h-screen">
      <SEO title="Lookbook" description="Editorial styling from Victorious Concept." />

      <div className="max-w-5xl mx-auto text-center mb-16">
        <p className="font-sans text-xs uppercase tracking-widest text-gold-deep dark:text-gold mb-4">Editorial</p>
        <h1 className="font-display italic font-semibold text-5xl md:text-6xl text-espresso dark:text-cream mb-6">
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

      {(looks || []).map((look, i) => (
        <StyledLook key={i} look={look} products={products} cursor={cursor} />
      ))}

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {products.map((product, i) => {
          const tile = TILE_PATTERN[i % TILE_PATTERN.length]
          const showMoment = i === MOMENT_BREAK_AFTER

          return (
            <Fragment key={product.id}>
              {showMoment && (
                <motion.div
                  key="moment-break"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="col-span-2 md:col-span-3 relative rounded-2xl overflow-hidden aspect-[21/9]"
                >
                  <RevealImage
                    src={siteImages.aboutMosaic2}
                    alt="Victorious Concept, styled"
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-end p-8 bg-gradient-to-t from-espresso/70 via-transparent to-transparent">
                    <p className="font-display italic text-xl md:text-2xl text-cream max-w-md">
                      Sourced with intent, styled with the same instinct that started it all.
                    </p>
                  </div>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: (i % 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className={tile.span === 2 ? 'col-span-2' : ''}
              >
                <Link
                  to={`/product/${product.id}`}
                  onMouseEnter={() => cursor.show('View')}
                  onMouseLeave={cursor.hide}
                  className="group block"
                >
                  <div className={`relative rounded-2xl overflow-hidden ${tile.aspect}`}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
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
                    <h3 className="font-display italic text-lg text-espresso dark:text-cream group-hover:text-gold-deep dark:text-gold transition-colors">
                      {product.name}
                    </h3>
                    <span className="font-sans text-sm text-gold-deep dark:text-gold-deep dark:text-gold">{formatPrice(product.price)}</span>
                  </div>
                </Link>
              </motion.div>
            </Fragment>
          )
        })}
      </div>
    </section>
  )
}

export default Lookbook
