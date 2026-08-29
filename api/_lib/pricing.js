/**
 * Pure functions with no database or network calls — the actual business
 * rules behind pricing, discounts, and validation. api/create-order.js
 * fetches real data from Supabase, then hands it to these functions.
 * Kept separate specifically so they can be unit tested directly.
 */

export function generateOrderNumber(date = new Date(), random = Math.floor(1000 + Math.random() * 9000)) {
  const y = date.getFullYear().toString().slice(-2)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `VC-${y}${m}${d}-${random}`
}

/**
 * Validates one requested cart line against real product/variant data.
 * Returns { orderItem } on success or { error } on failure — never throws.
 */
export function buildOrderItem(requested, product, variant) {
  const quantity = Number(requested.quantity)

  if (!product) {
    return { error: `Product ${requested.id} no longer exists` }
  }
  if (requested.variantId && !variant) {
    return { error: `Selected option for ${product.name} no longer exists` }
  }
  if (product.status === 'hidden') {
    return { error: `${product.name} is not currently available` }
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { error: `Invalid quantity for ${product.name}` }
  }

  const availableStock = variant ? variant.stock : product.stock
  if (product.status !== 'preorder' && availableStock < quantity) {
    return { error: `Not enough stock for ${product.name}` }
  }

  const unitPrice = variant?.price_override || product.price

  return {
    orderItem: {
      id: product.id,
      variantId: variant?.id || null,
      name: product.name,
      price: unitPrice,
      quantity,
      size: requested.size || null,
    },
  }
}

export function calculateSubtotal(orderItems) {
  return orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

/**
 * Decides whether a coupon is currently valid for this subtotal, and if so,
 * how much discount it gives. Returns { discount: 0, coupon: null } for any
 * invalid/expired/exhausted/below-minimum coupon — callers should treat that
 * as "no discount applied", not as an error.
 */
export function calculateCouponDiscount(coupon, subtotal, now = new Date()) {
  if (!coupon) return { discount: 0, coupon: null }

  const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > now
  const underUsageLimit = !coupon.max_uses || coupon.used_count < coupon.max_uses
  const meetsMinOrder = !coupon.min_order_amount || subtotal >= coupon.min_order_amount

  if (!notExpired || !underUsageLimit || !meetsMinOrder) {
    return { discount: 0, coupon: null }
  }

  return {
    discount: Math.round(subtotal * (coupon.percent_off / 100)),
    coupon,
  }
}

export function calculateTotal(subtotal, discount, shippingFee) {
  return subtotal - discount + shippingFee
}