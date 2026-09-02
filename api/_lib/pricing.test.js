import { describe, it, expect } from 'vitest'
import {
  generateOrderNumber,
  buildOrderItem,
  calculateSubtotal,
  calculateCouponDiscount,
  calculateTotal,
} from './pricing.js'

describe('generateOrderNumber', () => {
  it('formats as VC-YYMMDD-XXXX', () => {
    const date = new Date('2026-08-28T12:00:00Z')
    expect(generateOrderNumber(date, 1234)).toBe('VC-260828-1234')
  })
})

describe('buildOrderItem', () => {
  const product = { id: 1, name: 'Off White Bag', price: 24000, stock: 5, status: 'active' }

  it('builds a valid line item using the server price, ignoring nothing from the client but id/qty/size', () => {
    const { orderItem, error } = buildOrderItem({ id: 1, quantity: 2, size: 'M' }, product, null)
    expect(error).toBeUndefined()
    expect(orderItem).toEqual({ id: 1, variantId: null, name: 'Off White Bag', price: 24000, quantity: 2, size: 'M', category: null })
  })

  it('rejects a product that no longer exists', () => {
    const { error } = buildOrderItem({ id: 999, quantity: 1 }, undefined, null)
    expect(error).toMatch(/no longer exists/)
  })

  it('rejects a hidden product even if the id is valid', () => {
    const hidden = { ...product, status: 'hidden' }
    const { error } = buildOrderItem({ id: 1, quantity: 1 }, hidden, null)
    expect(error).toMatch(/not currently available/)
  })

  it('rejects zero quantity', () => {
    const { error } = buildOrderItem({ id: 1, quantity: 0 }, product, null)
    expect(error).toMatch(/Invalid quantity/)
  })

  it('rejects negative quantity', () => {
    const { error } = buildOrderItem({ id: 1, quantity: -5 }, product, null)
    expect(error).toMatch(/Invalid quantity/)
  })

  it('rejects a non-integer quantity', () => {
    const { error } = buildOrderItem({ id: 1, quantity: 1.5 }, product, null)
    expect(error).toMatch(/Invalid quantity/)
  })

  it('rejects quantity exceeding stock', () => {
    const { error } = buildOrderItem({ id: 1, quantity: 999 }, product, null)
    expect(error).toMatch(/Not enough stock/)
  })

  it('allows exceeding stock for a preorder product', () => {
    const preorder = { ...product, stock: 0, status: 'preorder' }
    const { orderItem, error } = buildOrderItem({ id: 1, quantity: 10 }, preorder, null)
    expect(error).toBeUndefined()
    expect(orderItem.quantity).toBe(10)
  })

  it('ignores a client-supplied price entirely — always uses the server product price', () => {
    const { orderItem } = buildOrderItem({ id: 1, quantity: 1, price: 1 }, product, null)
    expect(orderItem.price).toBe(24000)
  })

  it('carries the product category onto the line item, for category-restricted coupons', () => {
    const categorized = { ...product, category: 'bags' }
    const { orderItem } = buildOrderItem({ id: 1, quantity: 1 }, categorized, null)
    expect(orderItem.category).toBe('bags')
  })

  describe('with a variant', () => {
    const variant = { id: 55, stock: 3, price_override: 26000, size: 'L', color: 'Black' }

    it('uses the variant price and stock instead of the product base values', () => {
      const { orderItem } = buildOrderItem({ id: 1, variantId: 55, quantity: 2 }, product, variant)
      expect(orderItem.price).toBe(26000)
      expect(orderItem.variantId).toBe(55)
    })

    it('rejects when the requested variant no longer exists', () => {
      const { error } = buildOrderItem({ id: 1, variantId: 999, quantity: 1 }, product, null)
      expect(error).toMatch(/no longer exists/)
    })

    it('rejects quantity exceeding the variant\'s own stock even if the base product has plenty', () => {
      const { error } = buildOrderItem({ id: 1, variantId: 55, quantity: 5 }, product, variant)
      expect(error).toMatch(/Not enough stock/)
    })

    it('falls back to the product price when a variant has no price override', () => {
      const noOverride = { ...variant, price_override: null }
      const { orderItem } = buildOrderItem({ id: 1, variantId: 55, quantity: 1 }, product, noOverride)
      expect(orderItem.price).toBe(24000)
    })
  })
})

describe('calculateSubtotal', () => {
  it('sums price * quantity across all lines', () => {
    const items = [
      { price: 24000, quantity: 2 },
      { price: 15000, quantity: 1 },
    ]
    expect(calculateSubtotal(items)).toBe(63000)
  })

  it('returns 0 for an empty cart', () => {
    expect(calculateSubtotal([])).toBe(0)
  })
})

describe('calculateCouponDiscount', () => {
  const now = new Date('2026-08-28T00:00:00Z')
  const items = [{ id: 1, price: 10000, quantity: 1, category: 'bags' }]

  it('applies no discount when there is no coupon', () => {
    expect(calculateCouponDiscount(null, items, 0, now)).toEqual({ discount: 0, shippingDiscount: 0, coupon: null })
  })

  it('applies the percentage discount for a valid coupon', () => {
    const coupon = { discount_type: 'percent', percent_off: 10, expires_at: null, max_uses: null, min_order_amount: null }
    expect(calculateCouponDiscount(coupon, items, 0, now).discount).toBe(1000)
  })

  it('treats a coupon with no discount_type set as percent, for backward compatibility with existing codes', () => {
    const coupon = { percent_off: 10, expires_at: null, max_uses: null, min_order_amount: null }
    expect(calculateCouponDiscount(coupon, items, 0, now).discount).toBe(1000)
  })

  it('rounds the discount to the nearest whole naira', () => {
    const coupon = { discount_type: 'percent', percent_off: 15, expires_at: null, max_uses: null, min_order_amount: null }
    // 15% of 9999 = 1499.85 -> rounds to 1500
    const nineNineNineNine = [{ id: 1, price: 9999, quantity: 1, category: 'bags' }]
    expect(calculateCouponDiscount(coupon, nineNineNineNine, 0, now).discount).toBe(1500)
  })

  it('rejects an expired coupon, applying no discount', () => {
    const coupon = { discount_type: 'percent', percent_off: 20, expires_at: '2026-01-01T00:00:00Z', max_uses: null, min_order_amount: null }
    expect(calculateCouponDiscount(coupon, items, 0, now)).toEqual({ discount: 0, shippingDiscount: 0, coupon: null })
  })

  it('accepts a coupon that has not yet expired', () => {
    const coupon = { discount_type: 'percent', percent_off: 20, expires_at: '2026-12-31T00:00:00Z', max_uses: null, min_order_amount: null }
    expect(calculateCouponDiscount(coupon, items, 0, now).discount).toBe(2000)
  })

  it('rejects a coupon that has hit its usage limit', () => {
    const coupon = { discount_type: 'percent', percent_off: 20, expires_at: null, max_uses: 5, used_count: 5, min_order_amount: null }
    expect(calculateCouponDiscount(coupon, items, 0, now)).toEqual({ discount: 0, shippingDiscount: 0, coupon: null })
  })

  it('accepts a coupon that is under its usage limit', () => {
    const coupon = { discount_type: 'percent', percent_off: 20, expires_at: null, max_uses: 5, used_count: 4, min_order_amount: null }
    expect(calculateCouponDiscount(coupon, items, 0, now).discount).toBe(2000)
  })

  it('rejects a coupon when the order is below the minimum', () => {
    const coupon = { discount_type: 'percent', percent_off: 20, expires_at: null, max_uses: null, min_order_amount: 20000 }
    expect(calculateCouponDiscount(coupon, items, 0, now)).toEqual({ discount: 0, shippingDiscount: 0, coupon: null })
  })

  it('accepts a coupon when the order exactly meets the minimum', () => {
    const coupon = { discount_type: 'percent', percent_off: 20, expires_at: null, max_uses: null, min_order_amount: 10000 }
    expect(calculateCouponDiscount(coupon, items, 0, now).discount).toBe(2000)
  })

  describe('fixed-amount discounts', () => {
    it('subtracts a flat amount instead of a percentage', () => {
      const coupon = { discount_type: 'fixed', fixed_amount_off: 1500, expires_at: null, max_uses: null, min_order_amount: null }
      expect(calculateCouponDiscount(coupon, items, 0, now).discount).toBe(1500)
    })

    it('caps a fixed discount at the eligible subtotal — it can never go negative', () => {
      const coupon = { discount_type: 'fixed', fixed_amount_off: 50000, expires_at: null, max_uses: null, min_order_amount: null }
      expect(calculateCouponDiscount(coupon, items, 0, now).discount).toBe(10000)
    })
  })

  describe('free shipping', () => {
    it('waives the shipping fee and applies zero product discount', () => {
      const coupon = { discount_type: 'free_shipping', expires_at: null, max_uses: null, min_order_amount: null }
      const result = calculateCouponDiscount(coupon, items, 1500, now)
      expect(result.discount).toBe(0)
      expect(result.shippingDiscount).toBe(1500)
    })
  })

  describe('category restriction', () => {
    const mixedCart = [
      { id: 1, price: 10000, quantity: 1, category: 'bags' },
      { id: 2, price: 5000, quantity: 1, category: 'shoes' },
    ]

    it('only discounts items in the matching category', () => {
      const coupon = { discount_type: 'percent', percent_off: 10, applies_to_category: 'bags', expires_at: null, max_uses: null, min_order_amount: null }
      // 10% of just the bags line (10000), not the whole 15000 cart
      expect(calculateCouponDiscount(coupon, mixedCart, 0, now).discount).toBe(1000)
    })

    it('checks the minimum order amount against the full cart, not just the eligible category', () => {
      const coupon = { discount_type: 'percent', percent_off: 10, applies_to_category: 'bags', expires_at: null, max_uses: null, min_order_amount: 12000 }
      // Full cart (15000) clears the minimum even though the bags line alone (10000) would not
      expect(calculateCouponDiscount(coupon, mixedCart, 0, now).discount).toBe(1000)
    })

    it('rejects the coupon entirely if the cart has nothing in the required category', () => {
      const coupon = { discount_type: 'percent', percent_off: 10, applies_to_category: 'perfumes', expires_at: null, max_uses: null, min_order_amount: null }
      expect(calculateCouponDiscount(coupon, mixedCart, 0, now)).toEqual({ discount: 0, shippingDiscount: 0, coupon: null })
    })
  })
})

describe('calculateTotal', () => {
  it('adds shipping and subtracts discount from subtotal', () => {
    expect(calculateTotal(20000, 2000, 1500)).toBe(19500)
  })

  it('handles zero discount and zero shipping', () => {
    expect(calculateTotal(20000, 0, 0)).toBe(20000)
  })

  it('applies a shipping discount on top of a product discount', () => {
    expect(calculateTotal(20000, 2000, 1500, 1500)).toBe(18000)
  })

  it('never lets a shipping discount push the shipping portion negative', () => {
    // shippingDiscount larger than the fee itself should floor at 0, not go negative
    expect(calculateTotal(20000, 0, 1000, 5000)).toBe(20000)
  })
})