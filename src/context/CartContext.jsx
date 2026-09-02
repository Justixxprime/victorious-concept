import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { calculateCouponDiscount, calculateTotal } from '../../api/_lib/pricing.js'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('vc-cart')
    return saved ? JSON.parse(saved) : []
  })
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')

  useEffect(() => {
    localStorage.setItem('vc-cart', JSON.stringify(items))
  }, [items])

  function addToCart(product, variantId = null) {
    setItems((prev) => {
      const existing = prev.find(
        (item) => String(item.id) === String(product.id) && (item.variantId || null) === variantId
      )
      if (existing) {
        return prev.map((item) =>
          String(item.id) === String(product.id) && (item.variantId || null) === variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1, variantId }]
    })
  }

  function removeFromCart(id, variantId = null) {
    setItems((prev) =>
      prev.filter((item) => !(String(item.id) === String(id) && (item.variantId || null) === variantId))
    )
  }

  function updateQuantity(id, quantity, variantId = null) {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((item) =>
        String(item.id) === String(id) && (item.variantId || null) === variantId
          ? { ...item, quantity }
          : item
      )
    )
  }

  function clearCart() {
    setItems([])
    setCoupon(null)
    setCouponError('')
  }

  async function applyCoupon(code) {
    setCouponError('')
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('active', true)
      .maybeSingle()

    if (!data) {
      setCouponError('That code is not valid')
      setCoupon(null)
      return
    }

    // Run the exact same validation the server will run at checkout
    // (expiry, usage limit, minimum order, category match) so a code that
    // won't actually do anything doesn't show as "applied" here.
    const { coupon: validated } = calculateCouponDiscount(data, items, 0)
    if (!validated) {
      setCouponError(
        data.applies_to_category && !items.some((i) => i.category === data.applies_to_category)
          ? 'This code only applies to a category not in your cart'
          : 'This code has expired, been used up, or your order doesn\'t meet its minimum'
      )
      setCoupon(null)
      return
    }

    setCoupon(data)
  }

  function removeCoupon() {
    setCoupon(null)
    setCouponError('')
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  // Cart page doesn't know the delivery zone yet (that's chosen at
  // checkout), so shipping fee is 0 here — a free_shipping coupon still
  // shows correctly (discount is 0, since there's no shipping cost yet to
  // waive), and the actual delivery discount is applied for real once a
  // zone is selected, by the same shared calculateCouponDiscount logic
  // running again server-side in api/create-order.js.
  const { discount } = calculateCouponDiscount(coupon, items, 0)
  const totalPrice = calculateTotal(subtotal, discount, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        totalPrice,
        coupon,
        applyCoupon,
        removeCoupon,
        couponError,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}