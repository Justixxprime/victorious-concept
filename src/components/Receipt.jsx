import { forwardRef } from 'react'
import { CheckCircle2 } from 'lucide-react'
import AnimatedLogo from './AnimatedLogo'
import { formatPrice } from '../utils/formatPrice'

const Receipt = forwardRef(function Receipt({ order }, ref) {
  return (
    <div
      ref={ref}
      className="relative bg-cream text-espresso rounded-2xl max-w-sm mx-auto border border-gold/20 shadow-xl overflow-hidden print:shadow-none print:border-0 print:max-w-full"
    >
      {/* Gold accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-gold via-gold-light to-gold" />

      <div className="p-7">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 mb-2">
            <AnimatedLogo className="w-full h-full" />
          </div>
          <span className="font-display italic font-semibold text-lg text-espresso">Victorious</span>
          <span className="font-sans text-[9px] uppercase tracking-[0.35em] text-gold -mt-0.5">Concept</span>

          <div className="flex items-center gap-1.5 mt-4 bg-green-500/10 text-green-700 rounded-full px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-sans text-xs font-medium">Order Confirmed</span>
          </div>
        </div>

        <div className="flex justify-between font-sans text-xs mb-1">
          <span className="text-espresso/50">Order Number</span>
          <span className="font-medium">{order.id}</span>
        </div>
        <div className="flex justify-between font-sans text-xs mb-5">
          <span className="text-espresso/50">Date</span>
          <span className="font-medium">{order.date}</span>
        </div>

        {/* Ticket-style dashed divider */}
        <div className="border-t border-dashed border-gold/40 mb-4" />

        <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto print:max-h-none print:overflow-visible">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 font-sans text-xs">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-9 h-9 rounded-md object-cover flex-shrink-0 border border-gold/10"
                />
              )}
              <span className="flex-1 min-w-0 truncate">
                {item.name} <span className="text-espresso/40">x{item.quantity}</span>
              </span>
              <span className="flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gold/40 mb-4" />

        <div className="flex justify-between font-display italic font-semibold text-lg mb-1">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>

        <p className="font-sans text-[11px] text-espresso/50 text-center mt-6 leading-relaxed">
          Thank you for shopping with Victorious Concept.
          <br />
          We will reach out with delivery details shortly.
        </p>
      </div>
    </div>
  )
})

export default Receipt