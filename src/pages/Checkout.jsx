import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePaystackPayment } from 'react-paystack'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useAddresses } from '../hooks/useAddresses'
import { supabase } from '../lib/supabaseClient'
import { formatPrice } from '../utils/formatPrice'
import { siteImages } from '../data/siteImages'
import { useBusinessSettings } from '../context/BusinessSettingsContext'
import Receipt from '../components/Receipt'
import { Printer, CreditCard, Landmark, MessageCircle, Copy, Check, PartyPopper, Loader2 } from 'lucide-react'

function Checkout() {
  const { items, coupon, clearCart } = useCart()
  const { user } = useAuth()
  const { addresses } = useAddresses()
  const { whatsappNumber, bankAccountName, bankAccountNumber, bankName } = useBusinessSettings()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [pendingOrder, setPendingOrder] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
    address: '',
  })
  const [method, setMethod] = useState('card')
  const [copied, setCopied] = useState(false)
  const [guestEmail] = useState(() => `${Date.now()}@guest.victoriousconcept.com`)
  const [shippingZones, setShippingZones] = useState([])
  const [shippingZoneId, setShippingZoneId] = useState(null)
  const receiptRef = useRef(null)

  useEffect(() => {
    supabase
      .from('shipping_zones')
      .select('*')
      .eq('active', true)
      .order('fee')
      .then(({ data }) => setShippingZones(data || []))
  }, [])

  const selectedZone = shippingZones.find((z) => z.id === shippingZoneId)

  const paystackConfig = {
    reference: pendingOrder?.orderNumber || '',
    email: user?.email || guestEmail,
    amount: pendingOrder ? Math.round(pendingOrder.total * 100) : 0,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  }
  const initializePayment = usePaystackPayment(paystackConfig)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function createOrderOnServer(paymentMethod) {
    setErrorMessage('')
    setCreatingOrder(true)
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, variantId: i.variantId || null, quantity: i.quantity, size: i.size || null })),
          couponCode: coupon?.code || null,
          customer: form,
          userId: user?.id || null,
          email: user?.email || null,
          paymentMethod,
          shippingZoneId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error || 'Something went wrong creating your order.')
        return null
      }
      return data
    } catch {
      setErrorMessage('Could not reach the server. Check your connection and try again.')
      return null
    } finally {
      setCreatingOrder(false)
    }
  }

  function buildReceiptOrder(data) {
    return {
      id: data.orderNumber,
      date: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }),
      items: data.items,
      total: data.total,
      customer: form,
    }
  }

  async function handleCardPay() {
    const data = await createOrderOnServer('card')
    if (data) setPendingOrder(data)
  }

  async function pollForPaymentConfirmation(orderNumber, attempt = 0) {
    const { data } = await supabase.rpc('get_order_by_reference', {
      order_num: orderNumber,
      phone: form.phone.trim(),
    })
    const found = data && data[0]

    if (found && found.payment_status === 'paid') {
      setConfirming(false)
      setOrder({
        id: found.order_number,
        date: new Date(found.created_at || Date.now()).toLocaleDateString('en-NG', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        items: found.items,
        total: found.total,
        customer: form,
      })
      clearCart()
      return
    }

    if (attempt >= 15) {
      setConfirming(false)
      setErrorMessage(
        "We're still confirming your payment. If it was successful, you'll see it in your order history shortly. No need to pay again."
      )
      return
    }

    setTimeout(() => pollForPaymentConfirmation(orderNumber, attempt + 1), 2000)
  }

  useEffect(() => {
    if (pendingOrder) {
      initializePayment({
        onSuccess: () => {
          setConfirming(true)
          pollForPaymentConfirmation(pendingOrder.orderNumber)
        },
        onClose: () => {
          setPendingOrder(null)
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOrder])

  async function handleBankTransferConfirm() {
    const data = await createOrderOnServer('bank_transfer')
    if (data) {
      setOrder(buildReceiptOrder(data))
      clearCart()
    }
  }

  async function handleWhatsAppOrder() {
    const data = await createOrderOnServer('whatsapp')
    if (!data) return

    const lines = [
      `Hi Victorious Concept, I'd like to arrange payment for an order.`,
      ``,
      `Order Reference: ${data.orderNumber}`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Address: ${form.address}`,
      ``,
      `Items:`,
      ...data.items.map((i) => `${i.name} x${i.quantity}: ${formatPrice(i.price * i.quantity)}`),
      ``,
      `Delivery (${data.shippingZone}): ${data.shippingIsVariable ? 'To be confirmed' : formatPrice(data.shippingFee)}`,
      `Total: ${formatPrice(data.total)}`,
    ]
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
    setOrder(buildReceiptOrder(data))
    clearCart()
  }

  function copyAccount() {
    navigator.clipboard.writeText(bankAccountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint() {
    window.print()
  }

  const canProceed = form.name && form.phone && form.address && shippingZoneId

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

  if (confirming) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <h1 className="font-display italic text-2xl text-espresso dark:text-cream">
          Confirming your payment
        </h1>
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 max-w-xs">
          This only takes a moment. Please don't close this page.
        </p>
      </div>
    )
  }

  if (order) {
    return (
      <section className="relative min-h-screen py-16 px-6 overflow-hidden print:min-h-0 print:py-6 print:bg-white">
        <SEO title="Order Confirmed" description="Your Victorious Concept order confirmation." />

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
          <label htmlFor="checkout-name" className="sr-only">Full name</label>
          <input
            id="checkout-name"
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
          />
          <label htmlFor="checkout-phone" className="sr-only">Phone number</label>
          <input
            id="checkout-phone"
            type="text"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
          />
          <label htmlFor="checkout-address" className="sr-only">Delivery address</label>
          <textarea
            id="checkout-address"
            placeholder="Delivery address"
            rows={3}
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold resize-none"
          />
        </div>

        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">
          Delivery Location
        </p>
        <div className="flex flex-col gap-2 mb-8">
          {shippingZones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setShippingZoneId(zone.id)}
              className={`flex items-center justify-between text-left rounded-xl border px-4 py-3 transition-colors ${
                shippingZoneId === zone.id ? 'bg-gold border-gold text-espresso' : 'border-gold/30 text-espresso dark:text-cream hover:border-gold'
              }`}
            >
              <span className="font-sans text-sm">
                {zone.name}
                {zone.estimated_days && <span className="opacity-60"> · {zone.estimated_days}</span>}
              </span>
              <span className="font-sans text-sm font-medium text-right">
                {zone.is_variable
                  ? zone.fee > 0
                    ? `From ${formatPrice(zone.fee)}`
                    : 'Confirmed via WhatsApp'
                  : formatPrice(zone.fee)}
              </span>
            </button>
          ))}
          {shippingZones.length === 0 && (
            <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">
              Delivery locations aren't set up yet. Please check back shortly.
            </p>
          )}
        </div>

        {selectedZone && (
          <div className="bg-gold/5 rounded-2xl p-5 flex flex-col gap-2 mb-6">
            <div className="flex justify-between font-sans text-sm text-espresso/70 dark:text-cream/70">
              <span>Subtotal</span>
              <span>{formatPrice(items.reduce((sum, i) => sum + i.price * i.quantity, 0))}</span>
            </div>
            <div className="flex justify-between font-sans text-sm text-espresso/70 dark:text-cream/70">
              <span>Delivery ({selectedZone.name})</span>
              <span>
                {selectedZone.is_variable
                  ? selectedZone.fee > 0
                    ? `From ${formatPrice(selectedZone.fee)}`
                    : 'To be confirmed'
                  : formatPrice(selectedZone.fee)}
              </span>
            </div>
            {selectedZone.is_variable && (
              <p className="font-sans text-xs text-gold">
                {selectedZone.variable_note ||
                  "Delivery for this option is arranged directly with you on WhatsApp once we have a rider/courier quote. You can still pay for your order by card now."}
              </p>
            )}
            <p className="font-sans text-xs text-espresso/40 dark:text-cream/40">
              Final total (including any discount code) is confirmed on the next step.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="font-sans text-xs text-red-500">{errorMessage}</p>
          </div>
        )}

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
            onClick={() => canProceed && handleCardPay()}
            disabled={!canProceed || creatingOrder}
            className="w-full flex items-center justify-center gap-2 bg-gold text-espresso font-sans font-medium px-8 py-4 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
          >
            {creatingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
            {creatingOrder ? 'Preparing your order…' : 'Continue to Payment'}
          </button>
        )}

        {method === 'bank' && (
          <div className="flex flex-col gap-4">
            {bankAccountNumber ? (
              <div className="bg-gold/5 rounded-2xl p-5 flex flex-col gap-2">
                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">Account Name</p>
                <p className="font-sans text-sm text-espresso dark:text-cream">{bankAccountName}</p>
                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mt-2">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="font-sans text-sm text-espresso dark:text-cream">{bankAccountNumber}</p>
                  <button onClick={copyAccount} className="text-gold" aria-label="Copy account number">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mt-2">Bank</p>
                <p className="font-sans text-sm text-espresso dark:text-cream">{bankName}</p>
              </div>
            ) : (
              <div className="bg-gold/5 rounded-2xl p-5">
                <p className="font-sans text-sm text-espresso/70 dark:text-cream/70">
                  Bank transfer details aren't set up yet. Please choose WhatsApp instead and we'll sort payment directly.
                </p>
              </div>
            )}
            <button
              onClick={handleBankTransferConfirm}
              disabled={!canProceed || creatingOrder || !bankAccountNumber}
              className="w-full flex items-center justify-center gap-2 bg-gold text-espresso font-sans font-medium px-8 py-4 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
            >
              {creatingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
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
              disabled={!canProceed || creatingOrder}
              className="w-full flex items-center justify-center gap-2 bg-gold text-espresso font-sans font-medium px-8 py-4 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
            >
              {creatingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
              Continue on WhatsApp
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default Checkout