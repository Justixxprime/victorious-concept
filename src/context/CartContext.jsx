import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

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

  function addToCart(product) {
    setItems((prev) => {
      const existing = prev.find((item) => String(item.id) === String(product.id))
      if (existing) {
        return prev.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  function removeFromCart(id) {
    setItems((prev) => prev.filter((item) => String(item.id) !== String(id)))
  }

  function updateQuantity(id, quantity) {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, quantity } : item))
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
    } else {
      setCoupon(data)
    }
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
  const discount = coupon ? Math.round(subtotal * (coupon.percent_off / 100)) : 0
  const totalPrice = subtotal - discount

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