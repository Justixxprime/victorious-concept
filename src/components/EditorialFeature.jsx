import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import RevealImage from './RevealImage'
import { formatPrice } from '../utils/formatPrice'

function EditorialFeature({ product }) {
  if (!product) return null

  return (
    <section className="bg-espresso text-cream py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <p className="font-sans text-xs uppercase tracking-widest text-gold-light mb-3 text-center">
          The Spotlight
        </p>
        <h2 className="font-display italic font-semibold text-3xl md:text-5xl text-center mb-16 max-w-2xl mx-auto leading-tight">
          One piece worth stopping the scroll for
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <RevealImage
            src={product.images?.[0] || product.image}
            alt={product.name}
            className="aspect-[4/5] rounded-2xl"
          />

          <div className="flex flex-col gap-6">
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2 capitalize">
                {product.category}
              </p>
              <h3 className="font-display italic font-semibold text-3xl md:text-4xl leading-tight">
                {product.name}
              </h3>
            </div>

            <p className="font-sans text-cream/70 leading-relaxed">
              This is the piece that earns its place, the one that gets asked about, the one that
              was worth the trip to Lagos Island to find. Sourced with the same instinct that
              started this whole business, chosen because it deserved to be chosen, not because it
              needed to fill a rack.
            </p>

            <div className="flex items-center justify-between border-t border-cream/10 pt-6">
              <span className="font-display italic text-2xl text-gold-light">
                {formatPrice(product.price)}
              </span>
              <Link
                to={`/product/${product.id}`}
                className="flex items-center gap-2 bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors"
              >
                View Piece <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-2 gap-4 mt-10">
            {product.images.slice(1, 3).map((img, i) => (
              <RevealImage
                key={i}
                src={img}
                alt={`${product.name} detail`}
                className="aspect-square rounded-2xl"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default EditorialFeature