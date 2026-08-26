import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { formatPrice } from '../utils/formatPrice'
import { Search, Package, Calendar, CreditCard, HelpCircle } from 'lucide-react'
import SEO from '../components/SEO'

const statusStyles = {
  pending: 'bg-gold/20 text-gold',
  confirmed: 'bg-blue-500/10 text-blue-500',
  shipped: 'bg-purple-500/10 text-purple-500',
  delivered: 'bg-green-500/10 text-green-500',
}

function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!orderNumber.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber.trim())
        .single()

      if (fetchError || !data) {
        setError('Order not found. Please check your order number and try again.')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-16 px-6">
      <SEO title="Track Order" description="Track your Victorious Concept order status in real time." />
      
      <div className="max-w-md mx-auto">
        <h1 className="font-display italic font-semibold text-3xl text-espresso dark:text-cream mb-4 text-center">
          Track Your Order
        </h1>
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 text-center mb-8">
          Enter your order number to look up your purchase details and delivery progress.
        </p>

        {/* Search Input Form */}
        <form onSubmit={handleTrack} className="flex flex-col gap-4 mb-10">
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., VCN-12345"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full bg-transparent border border-gold/30 focus:border-gold rounded-full px-6 py-3 font-sans text-sm text-espresso dark:text-cream placeholder-espresso/40 dark:placeholder-cream/40 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold text-espresso p-2 rounded-full hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          {error && (
            <p className="font-sans text-xs text-red-500 px-4">{error}</p>
          )}
        </form>

        {/* Loading Spinner Fallback */}
        {loading && (
          <p className="font-sans text-sm text-center text-espresso/60 dark:text-cream/60">
            Finding order details...
          </p>
        )}

        {/* Search Result Card Container */}
        {result && (
          <div className="border border-gold/20 rounded-2xl p-6 bg-transparent">
            {/* Header: Order ID & Tracking Timestamp */}
            <div className="flex justify-between items-center mb-4">
              <span className="font-sans text-sm font-medium text-espresso dark:text-cream flex items-center gap-2">
                <Package className="w-4 h-4 text-gold" /> {result.order_number}
              </span>
              <span className="font-sans text-xs text-espresso/50 dark:text-cream/50 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(result.created_at).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Fulfill Status Tracking Badge */}
            <span className={`inline-block font-sans text-xs px-3 py-1 rounded-full mb-4 capitalize ${statusStyles[result.status] || statusStyles.pending}`}>
              {result.status || 'pending'}
            </span>

            {/* Selected Items Array Checklist */}
            <div className="flex flex-col gap-1 mb-4">
              {result.items?.map((item) => (
                <div key={item.id} className="flex justify-between font-sans text-sm text-espresso/70 dark:text-cream/70">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Total Layout Pricing Boundaries */}
            <div className="flex justify-between font-display italic font-semibold text-espresso dark:text-cream border-t border-gold/10 pt-3 mb-3">
              <span>Total</span>
              <span>{formatPrice(result.total)}</span>
            </div>

            {/* WhatsApp Integration Button Target */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Hi Victoria Obioma, I need help with my order ${result.order_number}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 font-sans text-xs text-gold hover:underline mt-4"
            >
              <HelpCircle className="w-4 h-4" /> Need help with this order?
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

export default TrackOrder
