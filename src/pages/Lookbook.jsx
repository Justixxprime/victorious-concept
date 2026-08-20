import SEO from '../components/SEO'
import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { formatPrice } from '../utils/formatPrice'

function Lookbook() {
  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-16 px-6 min-h-screen">
      <SEO title="Lookbook" description="Editorial styling from Victorious Concept." />
      <div className="max-w-5xl mx-auto text-center mb-16">
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4">Editorial</p>
        <h1 className="font-display italic font-semibold text-4xl md:text-6xl text-espresso dark:text-cream">
          The Lookbook
        </h1>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group block"
          >
            <div className="aspect-[4/5] rounded-2xl bg-gold/10 flex items-center justify-center overflow-hidden">
              <span className="font-sans text-xs text-espresso/40 dark:text-cream/40 uppercase tracking-wide">
                Editorial image coming soon
              </span>
            </div>
            <div className="pt-4 flex items-center justify-between">
              <h3 className="font-display italic text-lg text-espresso dark:text-cream group-hover:text-gold transition-colors">
                {product.name}
              </h3>
              <span className="font-sans text-sm text-gold">{formatPrice(product.price)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Lookbook