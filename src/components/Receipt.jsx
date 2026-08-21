import { forwardRef } from 'react'
import logoDark from '../assets/logo/logo-dark-text.png'
import { formatPrice } from '../utils/formatPrice'

const Receipt = forwardRef(function Receipt({ order }, ref) {
  return (
    <div ref={ref} className="bg-cream text-espresso p-8 rounded-2xl max-w-md mx-auto border border-gold/20">
      <div className="flex flex-col items-center text-center mb-6">
        <img src={logoDark} alt="Victorious Concept" className="h-14 mb-4" />
        <p className="font-sans text-xs uppercase tracking-widest text-gold">
          Order Confirmation
        </p>
      </div>

      <div className="flex justify-between font-sans text-sm mb-1">
        <span className="text-espresso/60">Order Number</span>
        <span className="font-medium">{order.id}</span>
      </div>
      <div className="flex justify-between font-sans text-sm mb-6">
        <span className="text-espresso/60">Date</span>
        <span className="font-medium">{order.date}</span>
      </div>

      <div className="flex flex-col gap-3 border-t border-b border-gold/20 py-4 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between font-sans text-sm">
            <span>
              {item.name} <span className="text-espresso/40">x{item.quantity}</span>
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between font-display italic font-semibold text-lg mb-1">
        <span>Total</span>
        <span>{formatPrice(order.total)}</span>
      </div>

      <p className="font-sans text-xs text-espresso/50 text-center mt-6">
        Thank you for shopping with Victorious Concept. We will reach out with delivery details shortly.
      </p>
    </div>
  )
})

export default Receipt