import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import { calculateCouponDiscount, calculateTotal } from '../../api/_lib/pricing.js'

const CartContext = createContext()

// variant_id is stored as '' rather than null for items with no variant —
// matches the database's unique constraint, which treats every null as
// distinct from every other null and would otherwise let duplicate rows
// pile up for simple products. Keep JS-side variantId as null/string as
// before; this is purely a DB storage detail.
function toDbVariantId(variantId) {
  return variantId || ''
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('vc-cart')
    return saved ? JSON.parse(saved) : []
  })
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  // Tracks which signed-in user we've already run the login-time merge
  // for, so it only happens once per login — not on every re-render while
  // signed in.
  const syncedUserId = useRef(null)

  useEffect(() => {
    localStorage.setItem('vc-cart', JSON.stringify(items))
  }, [items])

  // --- Cross-device sync: on login, merge whatever's already saved to this
  // account (from another device or a previous session) with whatever's
  // currently in this browser's local cart, rather than one silently
  // overwriting the other. Matching lines keep the higher quantity, so
  // logging in never loses something you already had queued up either
  // place. The merged result becomes the new baseline in both places. ---
  useEffect(() => {
    if (!user || syncedUserId.current === user.id) return
    syncedUserId.current = user.id

    async function pushAll(list) {
      if (list.length === 0) return
      await supabase.from('cart_items').upsert(
        list.map((item) => ({
          user_id: user.id,
          product_id: String(item.id),
          variant_id: toDbVariantId(item.variantId),
          item,
        })),
        { onConflict: 'user_id,product_id,variant_id' }
      )
    }

    async function mergeOnLogin() {
      const { data: rows } = await supabase.from('cart_items').select('item').eq('user_id', user.id)
      const dbItems = (rows || []).map((r) => r.item)
      if (dbItems.length === 0) {
        // Nothing saved to the account yet — just push whatever's local up,
        // so it's there next time they sign in anywhere else.
        if (items.length > 0) await pushAll(items)
        return
      }

      setItems((currentLocal) => {
        const merged = [...dbItems]
        for (const localItem of currentLocal) {
          const match = merged.find(
            (i) => String(i.id) === String(localItem.id) && (i.variantId || null) === (localItem.variantId || null)
          )
          if (match) {
            match.quantity = Math.max(match.quantity, localItem.quantity)
          } else {
            merged.push(localItem)
          }
        }
        pushAll(merged)
        return merged
      })
    }

    mergeOnLogin()
    // items intentionally omitted — this should only run once per login,
    // reading whatever `items` holds at that moment via the functional
    // setItems updater above, not re-running every time items changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function syncUpsert(item) {
    if (!user) return
    await supabase.from('cart_items').upsert(
      {
        user_id: user.id,
        product_id: String(item.id),
        variant_id: toDbVariantId(item.variantId),
        item,
      },
      { onConflict: 'user_id,product_id,variant_id' }
    )
  }

  async function syncDelete(id, variantId) {
    if (!user) return
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', String(id))
      .eq('variant_id', toDbVariantId(variantId))
  }

  function addToCart(product, variantId = null) {
    setItems((prev) => {
      const existing = prev.find(
        (item) => String(item.id) === String(product.id) && (item.variantId || null) === variantId
      )
      const nextItem = existing
        ? { ...existing, quantity: existing.quantity + 1 }
        : { ...product, quantity: 1, variantId }
      syncUpsert(nextItem)
      return existing
        ? prev.map((item) =>
            String(item.id) === String(product.id) && (item.variantId || null) === variantId ? nextItem : item
          )
        : [...prev, nextItem]
    })
  }

  function removeFromCart(id, variantId = null) {
    syncDelete(id, variantId)
    setItems((prev) =>
      prev.filter((item) => !(String(item.id) === String(id) && (item.variantId || null) === variantId))
    )
  }

  function updateQuantity(id, quantity, variantId = null) {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((item) => {
        if (String(item.id) === String(id) && (item.variantId || null) === variantId) {
          const updated = { ...item, quantity }
          syncUpsert(updated)
          return updated
        }
        return item
      })
    )
  }

  function clearCart() {
    if (user) supabase.from('cart_items').delete().eq('user_id', user.id)
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