import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PageHero from '../components/PageHero'
import { siteImages } from '../data/siteImages'
import { supabase } from '../lib/supabaseClient'
import { formatPrice } from '../utils/formatPrice'
import { Search } from 'lucide-react'

const statusStyles = {
  pending: 'bg-gold/20 text-gold',
  confirmed: 'bg-blue-500/10 text-blue-500',
  shipped: 'bg-purple-500/10 text-purple-500',
  delivered: 'bg-green-500/10 text-green-500',
}

function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    setNotFound(false)
    setResult(null)

    const { data } = await supabase.rpc('get_order_by_reference', {
      order_num: orderNumber.trim(),
      phone: phone.trim(),
    })

    if (data && data.length > 0) {
      setResult(data[0])
    } else {
      setNotFound(true)
    }
    setLoading(false)
  }

  return (
    <>
      <SEO title="Track Order" description="Track your Victorious Concept order." />
      <PageHero
        label="Order Tracking"
        title="Where's my order?"
        subtitle="Enter your order number and phone to see live status."
        image={siteImages.shippingBanner}
        compact
      />
      <section className="bg-cream dark:bg-espresso transition-colors py-16 px-6">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-8">
          <input
            type="text"
            placeholder="Order number (e.g. VC-260821-4732)"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
          />
          <input
            type="text"
            placeholder="Phone number used at checkout"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" /> {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {notFound && (
          <p className="font-sans text-sm text-center text-espresso/60 dark:text-cream/60">
            We couldn't find an order matching those details. Double check your order number and phone number, or message us on WhatsApp for help.
          </p>
        )}

        {result && (
          <div className="border border-gold/20 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-sans text-sm font-medium text-espresso dark:text-cream">
                {result.order_number}
              </span>
              <span className={`font-sans text-xs px-3 py-1 rounded-full capitalize ${statusStyles[result.status] || statusStyles.pending}`}>
                {result.status || 'pending'}
              </span>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              {(result.items || []).map((item) => (
                <div key={item.id} className="flex justify-between font-sans text-xs text-espresso/60 dark:text-cream/60">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-display italic font-semibold text-espresso dark:text-cream border-t border-gold/10 pt-3 mb-3">
              <span>Total</span>
              <span>{formatPrice(result.total)}</span>
            </div>
            <a
              href={`https://wa.me/2348122470435?text=${encodeURIComponent(`Hi, I need help with my order ${result.order_number}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 font-sans text-xs text-gold hover:underline"
            >
              Need help with this order?
            </a>
          </div>
        )}

        <p className="font-sans text-xs text-espresso/40 dark:text-cream/40 text-center mt-8">
          Have an account? <Link to="/account" className="text-gold hover:underline">Sign in</Link> to see all your orders at once.
        </p>
      </div>
      </section>
    </>
  )
}

export default TrackOrder