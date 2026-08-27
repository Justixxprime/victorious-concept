import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePaystackPayment } from 'react-paystack'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useAddresses } from '../hooks/useAddresses'
import { supabase } from '../lib/supabaseClient'
import { generateOrderId } from '../utils/generateOrderId'
import { formatPrice } from '../utils/formatPrice'
import { bankDetails } from '../data/paymentInfo'
import { siteImages } from '../data/siteImages'
import Receipt from '../components/Receipt'
import { Printer, CreditCard, Landmark, MessageCircle, Copy, Check, PartyPopper } from 'lucide-react'

function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const { addresses } = useAddresses()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
    address: '',
  })
  const [method, setMethod] = useState('card')
  const [copied, setCopied] = useState(false)
  const receiptRef = useRef(null)

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: user?.email || `${Date.now()}@guest.victoriousconcept.com`,
    amount: totalPrice * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  }
  const initializePayment = usePaystackPayment(paystackConfig)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function placeOrder(paymentReference = null, paymentMethod = method) {
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
        payment_reference: paymentReference,
        payment_method: paymentMethod,
      })

      if (user.email) {
        fetch('/api/send-order-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, orderNumber, items, total: totalPrice }),
        }).catch(() => {})
      }
    }

    setOrder(newOrder)
    clearCart()
  }

  function handlePaystackSuccess(reference) {
    placeOrder(reference.reference, 'card')
  }

  function handleBankTransferConfirm() {
    placeOrder(null, 'bank_transfer')
  }

  function handleWhatsAppOrder() {
    const orderNumber = generateOrderId()
    const lines = [
      `Hi Victorious Concept, I'd like to arrange payment for an order.`,
      ``,
      `Order Reference: ${orderNumber}`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Address: ${form.address}`,
      ``,
      `Items:`,
      ...items.map((i) => `${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`),
      ``,
      `Total: ${formatPrice(totalPrice)}`,
    ]
    window.open(`https://wa.me/2348122470435?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
    placeOrder(null, 'whatsapp')
  }

  function copyAccount() {
    navigator.clipboard.writeText(bankDetails.accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint() {
    window.print()
  }

  const canProceed = form.name && form.phone && form.address

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
      <section className="relative min-h-screen py-16 px-6 overflow-hidden print:min-h-0 print:py-6 print:bg-white">
        <SEO title="Order Confirmed" description="Your Victorious Concept order confirmation." />

        {/* Cinematic celebratory backdrop - screen only, never printed */}
        <div className="absolute inset-0 print:hidden">
          <img
            src={siteImages.heroBackdrop}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-espresso via-espresso/95 to-cream dark:to-espresso" />
          <motion.div
            className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-gold-light"
            animate={{ opacity: [0.2, 0.9, 0.2], y: [0, -16, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-gold"
            animate={{ opacity: [0.15, 0.8, 0.15], y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />
        </div>

        <div className="relative print:hidden max-w-md mx-auto text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4"
          >
            <PartyPopper className="w-7 h-7 text-gold-light" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-display italic font-semibold text-3xl text-cream mb-2"
          >
            Order confirmed
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="font-sans text-sm text-cream/70"
          >
            Here is your receipt. Save it or print it for your records.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <Receipt ref={receiptRef} order={order} />
        </motion.div>

        <div className="print:hidden relative max-w-md mx-auto flex justify-center mt-6">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors"
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

        {addresses.length > 0 && (
          <div className="mb-6">
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">
              Use a saved address
            </p>
            <div className="flex flex-col gap-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setForm({ name: addr.full_name, phone: addr.phone, address: addr.address })}
                  className="text-left border border-gold/20 hover:border-gold rounded-xl p-3 font-sans text-xs text-espresso/70 dark:text-cream/70 transition-colors"
                >
                  {addr.label ? `${addr.label}: ` : ''}{addr.full_name}, {addr.address}
                </button>
              ))}
            </div>
          </div>
        )}

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
            {formatPrice(totalPrice)}
          </span>
        </div>

        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">
          Payment Method
        </p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={() => setMethod('card')}
            className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-colors ${
              method === 'card' ? 'bg-gold border-gold text-espresso' : 'border-gold/30 text-espresso dark:text-cream'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="font-sans text-xs">Card</span>
          </button>
          <button
            onClick={() => setMethod('bank')}
            className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-colors ${
              method === 'bank' ? 'bg-gold border-gold text-espresso' : 'border-gold/30 text-espresso dark:text-cream'
            }`}
          >
            <Landmark className="w-5 h-5" />
            <span className="font-sans text-xs">Bank</span>
          </button>
          <button
            onClick={() => setMethod('whatsapp')}
            className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-colors ${
              method === 'whatsapp' ? 'bg-gold border-gold text-espresso' : 'border-gold/30 text-espresso dark:text-cream'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-sans text-xs">WhatsApp</span>
          </button>
        </div>

        {method === 'card' && (
          <button
            onClick={() => canProceed && initializePayment({ onSuccess: handlePaystackSuccess, onClose: () => {} })}
            disabled={!canProceed}
            className="w-full bg-gold text-espresso font-sans font-medium px-8 py-4 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
          >
            Pay {formatPrice(totalPrice)}
          </button>
        )}

        {method === 'bank' && (
          <div className="flex flex-col gap-4">
            <div className="bg-gold/5 rounded-2xl p-5 flex flex-col gap-2">
              <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">Account Name</p>
              <p className="font-sans text-sm text-espresso dark:text-cream">{bankDetails.accountName}</p>
              <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mt-2">Account Number</p>
              <div className="flex items-center justify-between">
                <p className="font-sans text-sm text-espresso dark:text-cream">{bankDetails.accountNumber}</p>
                <button onClick={copyAccount} className="text-gold" aria-label="Copy account number">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mt-2">Bank</p>
              <p className="font-sans text-sm text-espresso dark:text-cream">{bankDetails.bankName}</p>
            </div>
            <button
              onClick={handleBankTransferConfirm}
              disabled={!canProceed}
              className="w-full bg-gold text-espresso font-sans font-medium px-8 py-4 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
            >
              I've Made the Transfer
            </button>
            <p className="font-sans text-xs text-espresso/40 dark:text-cream/40 text-center">
              Your order is confirmed once payment is verified on our end.
            </p>
          </div>
        )}

        {method === 'whatsapp' && (
          <div className="flex flex-col gap-4">
            <p className="font-sans text-sm text-espresso/70 dark:text-cream/70">
              Confirm your order and finish arranging payment directly with us on WhatsApp.
            </p>
            <button
              onClick={() => canProceed && handleWhatsAppOrder()}
              disabled={!canProceed}
              className="w-full bg-gold text-espresso font-sans font-medium px-8 py-4 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
            >
              Continue on WhatsApp
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default Checkout