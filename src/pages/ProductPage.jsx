import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingBag, Truck, RefreshCw, ShieldCheck, MessageCircle } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { formatPrice } from '../utils/formatPrice'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabaseClient'
import { useBusinessSettings } from '../context/BusinessSettingsContext'
import { useWishlist } from '../context/WishlistContext'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { useFlyToCart } from '../context/FlyToCartContext'
import SEO from '../components/SEO'
import ProductGallery from '../components/ProductGallery'
import Breadcrumbs from '../components/Breadcrumbs'
import ProductCard from '../components/ProductCard'
import Reviews from '../components/Reviews'

const categoryIconLabel = {
  bags: 'bags', shoes: 'shoes', slippers: 'slippers',
  clothing: 'clothing', perfumes: 'perfumes', accessories: 'accessories',
}

function getDescription(product) {
  const descriptions = {
    bags: `Sourced directly from Lagos Island for someone who treats an outfit like a full sentence, not an afterthought. The ${product.name} carries the kind of structure that holds its shape through a long day and still looks composed by evening.`,
    shoes: `Sourced for the days that ask more of you. The ${product.name} is built for real movement, real weather, and real Lagos pavement, without giving up an inch of presence.`,
    slippers: `Off duty does not mean off style. The ${product.name} is the pair you reach for when comfort matters just as much as looking like you tried.`,
    clothing: `A piece chosen the way Victoria chooses everything, with an eye for what actually gets worn, not just what looks good hanging up.`,
    perfumes: `A scent sourced with the same instinct that built this whole business, something that says more about you before you've said a word.`,
    accessories: `The small detail that changes the whole look. Sourced because the finishing touch was never actually optional.`,
  }
  return descriptions[product.category] || `Sourced with intention by Victorious Concept.`
}

function ProductPage() {
  const { id } = useParams()
  const { products, loading: productsLoading } = useProducts()
  const product = products.find((p) => String(p.id) === id)

  const { addToCart } = useCart()
  const { whatsappNumber } = useBusinessSettings()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { viewed, addViewed } = useRecentlyViewed()
  const { fly } = useFlyToCart()
  const [selectedSize, setSelectedSize] = useState(null)
  const [variants, setVariants] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [frequentlyBoughtWith, setFrequentlyBoughtWith] = useState([])
  const galleryRef = useRef(null)

  useEffect(() => {
    if (product) addViewed(product)
  }, [product])

  useEffect(() => {
    async function fetchFrequentlyBought() {
      const { data } = await supabase.rpc('get_frequently_bought_with', {
        p_product_id: product.id,
        p_limit: 4,
      })
      if (!data) return
      // The RPC only returns aggregated ids + counts (never raw order/customer
      // data) — the actual product details come from what's already loaded,
      // no extra fetch needed.
      const items = data
        .map((row) => products.find((p) => String(p.id) === String(row.product_id)))
        .filter(Boolean)
      setFrequentlyBoughtWith(items)
    }
    if (product?.id) fetchFrequentlyBought()
  }, [product?.id, products])

  useEffect(() => {
    if (!product) return
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id)
      .then(({ data }) => setVariants(data || []))
  }, [product])

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
          Product not found
        </h1>
        <Link to="/shop" className="text-gold hover:underline">
          Back to Shop
        </Link>
      </div>
    )
  }

  const saved = isWishlisted(product.id)
  const isPreorder = product.status === 'preorder'
  const hasVariants = variants.length > 0
  const effectiveStock = hasVariants ? (selectedVariant?.stock ?? 0) : product.stock
  const effectivePrice = selectedVariant?.price_override || product.price
  const outOfStock = hasVariants
    ? selectedVariant && effectiveStock <= 0 && !isPreorder
    : product.stock <= 0 && !isPreorder

  function handleAddToCart() {
    if (galleryRef.current) {
      fly(product.image, galleryRef.current.getBoundingClientRect())
    }
    if (hasVariants) {
      addToCart(
        { ...product, price: effectivePrice, size: [selectedVariant.size, selectedVariant.color].filter(Boolean).join(' / ') },
        selectedVariant.id
      )
    } else {
      addToCart({ ...product, size: selectedSize })
    }
  }

  function handleWishlist() {
    if (!saved && galleryRef.current) {
      fly(product.image, galleryRef.current.getBoundingClientRect(), 'wishlist')
    }
    toggleWishlist(product)
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  const recentlyViewed = (viewed || []).filter((p) => p.id !== product.id).slice(0, 4)

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-12 px-6 pb-24 md:pb-12 min-h-screen">
      <SEO
        title={product.name}
        description={getDescription(product)}
        image={product.images?.[0] || product.image}
        url={`https://victorious-concept.vercel.app/product/${product.id}`}
        jsonLd={{
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: product.name,
          image: product.images,
          description: getDescription(product),
          offers: {
            '@type': 'Offer',
            priceCurrency: 'NGN',
            price: product.price,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        }}
      />

      <div className="max-w-7xl mx-auto mb-2 px-0">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Shop', to: '/shop' },
            { label: product.category, to: `/category/${product.category}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div ref={galleryRef}>
          <ProductGallery images={product.images} alt={product.name} videoUrl={product.videoUrl} />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">
              {product.category}
            </p>
            <h1 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream">
              {product.name}
            </h1>
            <p className="font-sans text-xl text-gold mt-3">
              {formatPrice(effectivePrice)}
            </p>
          </div>

          <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
            {getDescription(product)}
          </p>

          {hasVariants ? (
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-espresso/60 dark:text-cream/60 mb-3">
                Select Option
              </p>
              <div className="flex gap-2 flex-wrap">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stock <= 0 && !isPreorder}
                    className={`px-4 h-12 rounded-full border font-sans text-sm transition-colors disabled:opacity-30 ${
                      selectedVariant?.id === v.id
                        ? 'bg-gold border-gold text-espresso'
                        : 'border-gold/30 text-espresso dark:text-cream hover:border-gold'
                    }`}
                  >
                    {[v.size, v.color].filter(Boolean).join(' / ') || 'Option'}
                    {v.stock <= 0 && !isPreorder && ' (Out of stock)'}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-espresso/60 dark:text-cream/60 mb-3">
                  Select Size
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full border font-sans text-sm transition-colors ${
                        selectedSize === size
                          ? 'bg-gold border-gold text-espresso'
                          : 'border-gold/30 text-espresso dark:text-cream hover:border-gold'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={
                hasVariants
                  ? !selectedVariant || outOfStock
                  : outOfStock || (product.sizes && product.sizes.length > 0 && !selectedSize)
              }
              className="flex-1 bg-gold text-espresso font-sans font-medium px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-gold-light transition-colors disabled:opacity-40"
            >
              <ShoppingBag className="w-4 h-4" /> {isPreorder ? 'Preorder' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center hover:border-gold transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart className={`w-5 h-5 ${saved ? 'fill-gold text-gold' : 'text-espresso dark:text-cream'}`} />
            </button>
          </div>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I have a question about the ${product.name} (${formatPrice(product.price)})`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 font-sans text-sm text-gold hover:underline"
          >
            <MessageCircle className="w-4 h-4" /> Ask a question about this piece
          </a>

          <div className="flex flex-col gap-3 pt-4 border-t border-gold/20">
            <div className="flex items-center gap-3 text-sm font-sans text-espresso/70 dark:text-cream/70">
              <Truck className="w-4 h-4 text-gold flex-shrink-0" />
              Nationwide and international delivery, coordinated directly with you after checkout
            </div>
            <div className="flex items-center gap-3 text-sm font-sans text-espresso/70 dark:text-cream/70">
              <RefreshCw className="w-4 h-4 text-gold flex-shrink-0" />
              Free returns and exchanges within 7 days of delivery
            </div>
            <div className="flex items-center gap-3 text-sm font-sans text-espresso/70 dark:text-cream/70">
              <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
              Personally sourced and checked by Victoria before it ships
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gold/20">
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">Category</p>
              <p className="font-sans text-sm text-espresso dark:text-cream capitalize">{product.category}</p>
            </div>
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">Availability</p>
              <p className="font-sans text-sm text-espresso dark:text-cream">
                {isPreorder ? 'Available for preorder' : product.stock > 0 ? 'In stock, ready to ship' : 'Currently unavailable'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gold/20">
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">
              Care & Handling
            </p>
            <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
              Keep away from prolonged direct sunlight and moisture. Store in a cool, dry place
              when not in use, ideally in a dust bag or soft cloth. Wipe clean with a soft, dry
              cloth, avoid harsh chemicals or solvents. A little care goes a long way.
            </p>
          </div>
        </div>
      </div>

      {(frequentlyBoughtWith.length > 0 || related.length > 0 || recentlyViewed.length > 0) && (
        <div className="max-w-7xl mx-auto px-0 pt-16 pb-8 flex flex-col gap-16">
          {frequentlyBoughtWith.length > 0 && (
            <div>
              <h2 className="font-display italic font-semibold text-2xl text-espresso dark:text-cream mb-6">
                Frequently Bought Together
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {frequentlyBoughtWith.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
          {related.length > 0 && (
            <div>
              <h2 className="font-display italic font-semibold text-2xl text-espresso dark:text-cream mb-6">
                You might also like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {related.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
          {recentlyViewed.length > 0 && (
            <div>
              <h2 className="font-display italic font-semibold text-2xl text-espresso dark:text-cream mb-6">
                Recently Viewed
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recentlyViewed.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <Reviews productId={product.id} />

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-cream dark:bg-espresso border-t border-gold/20 px-4 py-3 flex items-center justify-between gap-3 z-40">
        <div>
          <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">{product.name}</p>
          <p className="font-display italic font-semibold text-lg text-espresso dark:text-cream">
            {formatPrice(product.price)}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gold-light transition-colors flex-shrink-0 disabled:opacity-40"
        >
          <ShoppingBag className="w-4 h-4" /> {isPreorder ? 'Preorder' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </section>
  )
}

export default ProductPage