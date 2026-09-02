import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/formatPrice'
import { useBusinessSettings } from '../context/BusinessSettingsContext'
import { Package } from 'lucide-react'

const statusStyles = {
  pending_payment: 'bg-gold/20 text-gold',
  processing: 'bg-blue-500/10 text-blue-500',
  shipped: 'bg-purple-500/10 text-purple-500',
  delivered: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500',
  return_requested: 'bg-gold/20 text-gold',
  returned: 'bg-espresso/10 text-espresso/60 dark:bg-cream/10 dark:text-cream/60',
  refund_pending: 'bg-gold/20 text-gold',
  refunded: 'bg-purple-500/10 text-purple-500',
}

const orderStatusLabels = {
  pending_payment: 'Pending Payment',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_requested: 'Return Requested',
  returned: 'Returned',
  refund_pending: 'Refund Pending',
  refunded: 'Refunded',
}

const paymentBadgeStyles = {
  paid: 'bg-green-500/10 text-green-600',
  pending: 'bg-gold/20 text-gold',
  unpaid: 'bg-espresso/10 text-espresso/60 dark:bg-cream/10 dark:text-cream/60',
  failed: 'bg-red-500/10 text-red-500',
  refunded: 'bg-purple-500/10 text-purple-500',
}

const paymentStatusLabels = {
  paid: 'Paid',
  pending: 'Awaiting Verification',
  unpaid: 'Unpaid',
  failed: 'Failed',
  refunded: 'Refunded',
}

function OrderHistory() {
  const { user, loading: authLoading } = useAuth()
  const { whatsappNumber } = useBusinessSettings()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [returningOrderId, setReturningOrderId] = useState(null)
  const [returnReason, setReturnReason] = useState('')
  const [returnItemIds, setReturnItemIds] = useState([])
  const [submittingReturn, setSubmittingReturn] = useState(false)

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setLoading(false)
    }

    if (!authLoading) fetchOrders()
  }, [user, authLoading])

  function startReturn(order) {
    setReturningOrderId(order.id)
    // Default to every line item selected — one tap still gets you the old
    // "return the whole order" behavior, but a customer only unhappy with
    // one item out of several can uncheck the rest.
    setReturnItemIds(order.items.map((item) => item.id))
  }

  function toggleReturnItem(itemId) {
    setReturnItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  async function submitReturnRequest(order) {
    if (!returnReason.trim() || returnItemIds.length === 0) return
    setSubmittingReturn(true)
    const itemsToReturn = order.items.filter((item) => returnItemIds.includes(item.id))
    const { error } = await supabase.from('return_requests').insert({
      order_id: order.id,
      user_id: user.id,
      reason: returnReason.trim(),
      items: itemsToReturn,
    })
    if (!error) {
      await supabase.from('orders').update({ order_status: 'return_requested' }).eq('id', order.id)
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, order_status: 'return_requested' } : o))
      )
      setReturningOrderId(null)
      setReturnReason('')
      setReturnItemIds([])
    }
    setSubmittingReturn(false)
  }

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
          Sign in to view your orders
        </h1>
        <Link
          to="/account"
          className="mt-4 bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-16 px-6">
      <SEO title="My Orders" description="Your Victorious Concept order history." />
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display italic font-semibold text-3xl text-espresso dark:text-cream mb-10">
          My Orders
        </h1>

        {loading ? (
          <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Package className="w-10 h-10 text-gold" />
            <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
              No orders yet. Once you check out, they will appear here.
            </p>
            <Link to="/shop" className="text-gold hover:underline font-sans text-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-gold/20 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-sans text-sm font-medium text-espresso dark:text-cream">
                    {order.order_number}
                  </span>
                  <span className="font-sans text-xs text-espresso/50 dark:text-cream/50">
                    {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-block font-sans text-xs px-3 py-1 rounded-full capitalize ${paymentBadgeStyles[order.payment_status] || paymentBadgeStyles.unpaid}`}>
                    {paymentStatusLabels[order.payment_status] || order.payment_status || 'Unpaid'}
                  </span>
                  <span className={`inline-block font-sans text-xs px-3 py-1 rounded-full capitalize ${statusStyles[order.order_status] || statusStyles.pending_payment}`}>
                    {orderStatusLabels[order.order_status] || order.order_status || 'Pending Payment'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between font-sans text-sm text-espresso/70 dark:text-cream/70">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-display italic font-semibold text-espresso dark:text-cream border-t border-gold/20 pt-3 mb-3">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-sans text-espresso/50 dark:text-cream/50">
                  <span className="capitalize">
                    Paid via {order.payment_method === 'card' ? 'Card' : order.payment_method === 'bank_transfer' ? 'Bank Transfer' : order.payment_method === 'whatsapp' ? 'WhatsApp' : 'Unknown'}
                  </span>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I need help with my order ${order.order_number}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    Need help with this order?
                  </a>
                </div>

                {order.order_status === 'delivered' && (
                  <div className="border-t border-gold/10 mt-4 pt-4">
                    {returningOrderId === order.id ? (
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">
                            Which item(s) are you returning?
                          </p>
                          <div className="flex flex-col gap-1.5">
                            {order.items.map((item) => (
                              <label key={item.id} className="flex items-center gap-2 font-sans text-xs text-espresso/80 dark:text-cream/80">
                                <input
                                  type="checkbox"
                                  checked={returnItemIds.includes(item.id)}
                                  onChange={() => toggleReturnItem(item.id)}
                                />
                                <span className="flex-1">{item.name} x{item.quantity}</span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                              </label>
                            ))}
                          </div>
                          {returnItemIds.length > 0 && (
                            <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mt-2">
                              Estimated refund: {formatPrice(order.items.filter((i) => returnItemIds.includes(i.id)).reduce((sum, i) => sum + i.price * i.quantity, 0) + (returnItemIds.length === order.items.length ? order.shipping_fee : 0))}
                              {returnItemIds.length === order.items.length ? ' (includes delivery fee, since this returns the whole order)' : ' — delivery fee isn\'t refunded on a partial return'}
                            </p>
                          )}
                        </div>
                        <textarea
                          placeholder="Why would you like to return this order?"
                          rows={2}
                          value={returnReason}
                          onChange={(e) => setReturnReason(e.target.value)}
                          className="bg-transparent border border-gold/30 rounded-xl px-3 py-2 font-sans text-xs text-espresso dark:text-cream outline-none focus:border-gold resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => submitReturnRequest(order)}
                            disabled={!returnReason.trim() || returnItemIds.length === 0 || submittingReturn}
                            className="bg-gold text-espresso font-sans text-xs font-medium px-4 py-2 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
                          >
                            {submittingReturn ? 'Submitting...' : 'Submit Request'}
                          </button>
                          <button
                            onClick={() => { setReturningOrderId(null); setReturnReason(''); setReturnItemIds([]) }}
                            className="font-sans text-xs text-espresso/50 dark:text-cream/50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startReturn(order)}
                        className="font-sans text-xs text-gold hover:underline"
                      >
                        Request a return
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default OrderHistory