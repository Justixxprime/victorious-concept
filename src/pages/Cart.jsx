import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus, Tag, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/formatPrice'
import { ShoppingBag } from 'lucide-react'

function Cart() {
  const navigate = useNavigate()
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    totalPrice,
    coupon,
    applyCoupon,
    removeCoupon,
    couponError,
  } = useCart()
  const [code, setCode] = useState('')

  function handleApply(e) {
    e.preventDefault()
    applyCoupon(code)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
        <ShoppingBag className="w-10 h-10 text-gold" />
        <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
          Your cart is empty
        </h1>
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
          Looks like you have not added anything yet.
        </p>
        <Link
          to="/shop"
          className="mt-4 bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-12 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream mb-10">
          Your Cart
        </h1>

        <div className="flex flex-col gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b border-gold/20 pb-6"
            >
              <div className="w-20 h-20 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] text-espresso/40 dark:text-cream/40 text-center px-1">
                  No image
                </span>
              </div>

              <div className="flex-1">
                <h3 className="font-sans text-sm text-espresso dark:text-cream">
                  {item.name}{' '}
                  {item.size && (
                    <span className="text-espresso/50 dark:text-cream/50">
                      · Size {item.size}
                    </span>
                  )}
                </h3>
                <p className="font-sans text-sm text-gold mt-1">
                  {formatPrice(item.price)}
                </p>
              </div>

              <div className="flex items-center gap-3 border border-gold/30 rounded-full px-3 py-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3 text-espresso dark:text-cream" />
                </button>
                <span className="font-sans text-sm text-espresso dark:text-cream w-4 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3 text-espresso dark:text-cream" />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                aria-label="Remove item"
                className="text-espresso/40 dark:text-cream/40 hover:text-gold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gold/20">
          {coupon ? (
            <div className="flex items-center justify-between bg-gold/10 rounded-xl px-4 py-3 mb-4">
              <span className="flex items-center gap-2 font-sans text-sm text-espresso dark:text-cream">
                <Tag className="w-4 h-4 text-gold" /> {coupon.code} applied ({coupon.percent_off}% off)
              </span>
              <button onClick={removeCoupon} aria-label="Remove coupon">
                <X className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-gold" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Discount code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-transparent border border-gold/30 rounded-full px-4 py-2 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="border border-gold/30 text-espresso dark:text-cream font-sans text-sm px-5 py-2 rounded-full hover:border-gold transition-colors"
              >
                Apply
              </button>
            </form>
          )}
          {couponError && (
            <p className="font-sans text-xs text-red-500 mb-4">{couponError}</p>
          )}

          <div className="flex justify-between font-sans text-sm text-espresso/70 dark:text-cream/70 mb-2">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between font-sans text-sm text-gold mb-2">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-display italic font-semibold text-2xl text-espresso dark:text-cream">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/checkout')}
          className="w-full mt-6 bg-gold text-espresso font-sans font-medium px-8 py-4 rounded-full hover:bg-gold-light transition-colors"
        >
          Checkout
        </button>
      </div>
    </section>
  )
}

export default Cart