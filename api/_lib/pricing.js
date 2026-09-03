/**
 * Pure functions with no database or network calls — the actual business
 * rules behind pricing, discounts, and validation. api/create-order.js
 * fetches real data from Supabase, then hands it to these functions.
 * Kept separate specifically so they can be unit tested directly.
 *
 * Type-checked via JSDoc + tsconfig.json (checkJs) as a deliberately
 * narrow pilot — see item 17 in the project history for why this file
 * specifically, and why the rest of the codebase isn't included yet.
 */

/**
 * @typedef {Object} RequestedItem
 * @property {string|number} id
 * @property {string|number} [variantId]
 * @property {number|string} quantity
 * @property {string} [size]
 */

/**
 * @typedef {Object} Product
 * @property {string|number} id
 * @property {string} name
 * @property {number} price
 * @property {number} stock
 * @property {string} [status]
 * @property {string} [category]
 */

/**
 * @typedef {Object} Variant
 * @property {string|number} id
 * @property {number} stock
 * @property {number} [price_override]
 */

/**
 * @typedef {Object} OrderItem
 * @property {string|number} id
 * @property {string|number|null} variantId
 * @property {string} name
 * @property {number} price
 * @property {number} quantity
 * @property {string|null} size
 * @property {string|null} category
 */

/**
 * @typedef {Object} Coupon
 * @property {string} code
 * @property {'percent'|'fixed'|'free_shipping'} [discount_type]
 * @property {number} [percent_off]
 * @property {number} [fixed_amount_off]
 * @property {string|null} [applies_to_category]
 * @property {string|null} [expires_at]
 * @property {number|null} [max_uses]
 * @property {number} [used_count]
 * @property {number|null} [min_order_amount]
 */

/**
 * @param {Date} [date]
 * @param {number} [random]
 * @returns {string}
 */
export function generateOrderNumber(date = new Date(), random = Math.floor(100000 + Math.random() * 900000)) {
  const y = date.getFullYear().toString().slice(-2)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `VC-${y}${m}${d}-${random}`
}

/**
 * Validates one requested cart line against real product/variant data.
 * Returns { orderItem } on success or { error } on failure — never throws.
 *
 * @param {RequestedItem} requested
 * @param {Product|null|undefined} product
 * @param {Variant|null|undefined} variant
 * @returns {{ ok: true, orderItem: OrderItem, error?: undefined } | { ok: false, orderItem?: undefined, error: string }}
 */
export function buildOrderItem(requested, product, variant) {
  const quantity = Number(requested.quantity)

  if (!product) {
    return { ok: false, error: `Product ${requested.id} no longer exists` }
  }
  if (requested.variantId && !variant) {
    return { ok: false, error: `Selected option for ${product.name} no longer exists` }
  }
  if (product.status === 'hidden') {
    return { ok: false, error: `${product.name} is not currently available` }
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, error: `Invalid quantity for ${product.name}` }
  }

  const availableStock = variant ? variant.stock : product.stock
  if (product.status !== 'preorder' && availableStock < quantity) {
    return { ok: false, error: `Not enough stock for ${product.name}` }
  }

  const unitPrice = variant?.price_override || product.price

  return {
    ok: true,
    orderItem: {
      id: product.id,
      variantId: variant?.id || null,
      name: product.name,
      price: unitPrice,
      quantity,
      size: requested.size || null,
      // Kept on the line item specifically so a category-restricted coupon
      // can be validated both in the cart preview and again, independently,
      // when the real order is created server-side.
      category: product.category || null,
    },
  }
}

/**
 * @param {OrderItem[]} orderItems
 * @returns {number}
 */
export function calculateSubtotal(orderItems) {
  return orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

/**
 * Decides whether a coupon is currently valid for this cart, and if so,
 * how much discount it gives. Supports three discount types:
 *   - 'percent' (default, backward compatible with existing coupons):
 *     percent_off of the eligible subtotal
 *   - 'fixed': a flat fixed_amount_off, capped at the eligible subtotal
 *     so a discount can never make a line item negative
 *   - 'free_shipping': waives the shipping fee entirely
 *
 * If coupon.applies_to_category is set, only line items in that category
 * count toward a percent/fixed discount, and free_shipping only applies
 * if the cart contains at least one item from that category. The minimum
 * order amount (if any) is always checked against the FULL cart subtotal,
 * not just the eligible portion — "spend at least X" should mean the whole
 * order, not just the discounted category.
 *
 * Returns { discount: 0, shippingDiscount: 0, coupon: null } for any
 * invalid/expired/exhausted/below-minimum/non-matching-category coupon —
 * callers should treat that as "no discount applied", not as an error.
 *
 * @param {Coupon|null|undefined} coupon
 * @param {OrderItem[]} orderItems
 * @param {number} [shippingFee]
 * @param {Date} [now]
 * @returns {{ discount: number, shippingDiscount: number, coupon: Coupon|null }}
 */
export function calculateCouponDiscount(coupon, orderItems, shippingFee = 0, now = new Date()) {
  if (!coupon) return { discount: 0, shippingDiscount: 0, coupon: null }

  const subtotal = calculateSubtotal(orderItems)

  const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > now
  const underUsageLimit = !coupon.max_uses || (coupon.used_count ?? 0) < coupon.max_uses
  const meetsMinOrder = !coupon.min_order_amount || subtotal >= coupon.min_order_amount

  if (!notExpired || !underUsageLimit || !meetsMinOrder) {
    return { discount: 0, shippingDiscount: 0, coupon: null }
  }

  const eligibleItems = coupon.applies_to_category
    ? orderItems.filter((i) => i.category === coupon.applies_to_category)
    : orderItems

  // A category-restricted coupon that doesn't match anything in the cart
  // is the same as an invalid coupon for this order — no partial credit.
  if (coupon.applies_to_category && eligibleItems.length === 0) {
    return { discount: 0, shippingDiscount: 0, coupon: null }
  }

  if (coupon.discount_type === 'free_shipping') {
    return { discount: 0, shippingDiscount: shippingFee, coupon }
  }

  const eligibleSubtotal = calculateSubtotal(eligibleItems)

  if (coupon.discount_type === 'fixed') {
    const discount = Math.min(coupon.fixed_amount_off || 0, eligibleSubtotal)
    return { discount, shippingDiscount: 0, coupon }
  }

  // 'percent', or unset — unset is what every coupon created before this
  // feature existed still has, so it must keep behaving as percent-off.
  const discount = Math.round(eligibleSubtotal * ((coupon.percent_off || 0) / 100))
  return { discount, shippingDiscount: 0, coupon }
}

/**
 * @param {number} subtotal
 * @param {number} discount
 * @param {number} shippingFee
 * @param {number} [shippingDiscount]
 * @returns {number}
 */
export function calculateTotal(subtotal, discount, shippingFee, shippingDiscount = 0) {
  return subtotal - discount + Math.max(0, shippingFee - shippingDiscount)
}