import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/formatPrice'
import { Package } from 'lucide-react'

function OrderHistory() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

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
                <div className="flex flex-col gap-1 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between font-sans text-sm text-espresso/70 dark:text-cream/70">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-display italic font-semibold text-espresso dark:text-cream border-t border-gold/20 pt-3">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default OrderHistory