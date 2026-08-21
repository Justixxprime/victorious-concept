import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { useCart } from '../context/CartContext'
import { generateOrderId } from '../utils/generateOrderId'
import Receipt from '../components/Receipt'
import { Printer } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const receiptRef = useRef(null)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function placeOrder() {
    const orderNumber = generateOrderId()
    const newOrder = {
      id: orderNumber,
      date: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }),
      items,
      total: totalPrice,
      customer: form,
    }

    if (user) {
      await supabase.from('orders').insert({
        user_id: user.id,
        order_number: orderNumber,
        items: items,
        total: totalPrice,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address,
      })
    }

    setOrder(newOrder)
    clearCart()
  }

  function handlePrint() {
    window.print()
  }

  if (items.length === 0 && !order) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
          Your cart is empty
        </h1>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors"
        >
          Start Shopping
        </button>
      </div>
    )
  }

  if (order) {
    return (
      <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-16 px-6">
        <SEO title="Order Confirmed" description="Your Victorious Concept order confirmation." />
        <div className="max-w-md mx-auto text-center mb-8">
          <h1 className="font-display italic font-semibold text-3xl text-espresso dark:text-cream mb-2">
            Order confirmed
          </h1>
          <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
            Here is your receipt. Save it or print it for your records.
          </p>
        </div>

        <Receipt ref={receiptRef} order={order} />

        <div className="max-w-md mx-auto flex justify-center mt-6">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-espresso dark:bg-cream text-cream dark:text-espresso font-sans font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-16 px-6">
      <SEO title="Checkout" description="Complete your Victorious Concept order." />
      <div className="max-w-md mx-auto">
        <h1 className="font-display italic font-semibold text-3xl text-espresso dark:text-cream mb-8">
          Checkout
        </h1>

        <div className="flex flex-col gap-4 mb-8">
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
          />
          <input
            type="text"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
          />
          <textarea
            placeholder="Delivery address"
            rows={3}
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold resize-none"
          />
        </div>

        <div className="flex justify-between items-center border-t border-gold/20 pt-4 mb-6">
          <span className="font-sans text-espresso dark:text-cream">Total</span>
          <span className="font-display italic font-semibold text-xl text-espresso dark:text-cream">
            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(totalPrice)}
          </span>
        </div>

        <button
          onClick={placeOrder}
          disabled={!form.name || !form.phone || !form.address}
          className="w-full bg-gold text-espresso font-sans font-medium px-8 py-4 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
        >
          Place Order
        </button>

        <p className="font-sans text-xs text-espresso/40 dark:text-cream/40 text-center mt-4">
          Payment integration is coming soon. Placing an order now confirms your details and generates your receipt.
        </p>
      </div>
    </section>
  )
}

export default Checkout