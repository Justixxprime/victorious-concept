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
    expect(orderItem).toEqual({ id: 1, variantId: null, name: 'Off White Bag', price: 24000, quantity: 2, size: 'M' })
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

  it('applies no discount when there is no coupon', () => {
    expect(calculateCouponDiscount(null, 10000, now)).toEqual({ discount: 0, coupon: null })
  })

  it('applies the percentage discount for a valid coupon', () => {
    const coupon = { percent_off: 10, expires_at: null, max_uses: null, min_order_amount: null }
    expect(calculateCouponDiscount(coupon, 10000, now).discount).toBe(1000)
  })

  it('rounds the discount to the nearest whole naira', () => {
    const coupon = { percent_off: 15, expires_at: null, max_uses: null, min_order_amount: null }
    // 15% of 9999 = 1499.85 -> rounds to 1500
    expect(calculateCouponDiscount(coupon, 9999, now).discount).toBe(1500)
  })

  it('rejects an expired coupon, applying no discount', () => {
    const coupon = { percent_off: 20, expires_at: '2026-01-01T00:00:00Z', max_uses: null, min_order_amount: null }
    expect(calculateCouponDiscount(coupon, 10000, now)).toEqual({ discount: 0, coupon: null })
  })

  it('accepts a coupon that has not yet expired', () => {
    const coupon = { percent_off: 20, expires_at: '2026-12-31T00:00:00Z', max_uses: null, min_order_amount: null }
    expect(calculateCouponDiscount(coupon, 10000, now).discount).toBe(2000)
  })

  it('rejects a coupon that has hit its usage limit', () => {
    const coupon = { percent_off: 20, expires_at: null, max_uses: 5, used_count: 5, min_order_amount: null }
    expect(calculateCouponDiscount(coupon, 10000, now)).toEqual({ discount: 0, coupon: null })
  })

  it('accepts a coupon that is under its usage limit', () => {
    const coupon = { percent_off: 20, expires_at: null, max_uses: 5, used_count: 4, min_order_amount: null }
    expect(calculateCouponDiscount(coupon, 10000, now).discount).toBe(2000)
  })

  it('rejects a coupon when the order is below the minimum', () => {
    const coupon = { percent_off: 20, expires_at: null, max_uses: null, min_order_amount: 20000 }
    expect(calculateCouponDiscount(coupon, 10000, now)).toEqual({ discount: 0, coupon: null })
  })

  it('accepts a coupon when the order exactly meets the minimum', () => {
    const coupon = { percent_off: 20, expires_at: null, max_uses: null, min_order_amount: 10000 }
    expect(calculateCouponDiscount(coupon, 10000, now).discount).toBe(2000)
  })
})

describe('calculateTotal', () => {
  it('adds shipping and subtracts discount from subtotal', () => {
    expect(calculateTotal(20000, 2000, 1500)).toBe(19500)
  })

  it('handles zero discount and zero shipping', () => {
    expect(calculateTotal(20000, 0, 0)).toBe(20000)
  })
})