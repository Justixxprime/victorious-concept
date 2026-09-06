import { useEffect } from 'react'
import { usePaystackPayment } from 'react-paystack'

/**
 * Deliberately has no visible UI of its own — mounting it is what
 * triggers Paystack's popup, via the effect below. The parent
 * (Checkout.jsx) only renders this component at all once a card order
 * has actually been created server-side, and does so through
 * React.lazy(), so the entire react-paystack SDK is excluded from every
 * other checkout flow (bank transfer, WhatsApp) and from the initial
 * checkout page load entirely.
 */
function PaystackCheckoutTrigger({ reference, email, amount, publicKey, onSuccess, onClose }) {
  const initializePayment = usePaystackPayment({ reference, email, amount, publicKey })

  useEffect(() => {
    initializePayment({ onSuccess, onClose })
    // Intentionally runs once, when this component mounts — the parent
    // controls *whether* this component exists at all, not this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default PaystackCheckoutTrigger