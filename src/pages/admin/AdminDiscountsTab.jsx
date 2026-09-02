import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice } from '../../utils/formatPrice'
import { useAdminWrite } from '../../hooks/useAdminWrite'
import { Trash2 } from 'lucide-react'

const EMPTY_FORM = {
  code: '', discount_type: 'percent', percent_off: '', fixed_amount_off: '',
  applies_to_category: '', expires_at: '', max_uses: '', min_order_amount: '',
}

export default function AdminDiscountsTab({ categories }) {
  const runWrite = useAdminWrite()
  const [coupons, setCoupons] = useState([])
  const [couponForm, setCouponForm] = useState(EMPTY_FORM)

  async function refetch() {
    const { data } = await supabase.from('coupons').select('*').order('code')
    setCoupons(data || [])
  }

  useEffect(() => {
    refetch()
  }, [])

  function describeCoupon(c) {
    const base =
      c.discount_type === 'fixed' ? `${formatPrice(c.fixed_amount_off)} off`
      : c.discount_type === 'free_shipping' ? 'Free delivery'
      : `${c.percent_off}% off`
    return c.applies_to_category ? `${base} · ${c.applies_to_category} only` : base
  }

  async function addCoupon() {
    if (!couponForm.code) return
    if (couponForm.discount_type === 'percent' && !couponForm.percent_off) return
    if (couponForm.discount_type === 'fixed' && !couponForm.fixed_amount_off) return

    const ok = await runWrite(
      supabase.from('coupons').insert({
        code: couponForm.code.trim().toUpperCase(),
        discount_type: couponForm.discount_type,
        percent_off: couponForm.discount_type === 'percent' ? Number(couponForm.percent_off) : null,
        fixed_amount_off: couponForm.discount_type === 'fixed' ? Number(couponForm.fixed_amount_off) : null,
        applies_to_category: couponForm.applies_to_category || null,
        active: true,
        expires_at: couponForm.expires_at || null,
        max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : null,
        min_order_amount: couponForm.min_order_amount ? Number(couponForm.min_order_amount) : null,
      }),
      'Adding discount code'
    )
    if (!ok) return
    setCouponForm(EMPTY_FORM)
    refetch()
  }

  async function toggleCoupon(id, active) {
    const ok = await runWrite(
      supabase.from('coupons').update({ active: !active }).eq('id', id),
      'Updating discount code'
    )
    if (!ok) return
    refetch()
  }

  async function deleteCoupon(id) {
    if (!confirm('Delete this discount code?')) return
    const ok = await runWrite(supabase.from('coupons').delete().eq('id', id), 'Deleting discount code')
    if (!ok) return
    refetch()
  }

  return (
    <div className="max-w-lg flex flex-col gap-8">
      <div className="bg-gold/5 rounded-2xl p-6">
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">New Discount Code</h2>

        <div className="flex flex-col gap-3 mb-3">
          <input type="text" placeholder="CODE" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />

          <select value={couponForm.discount_type} onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold">
            <option value="percent">Percentage off</option>
            <option value="fixed">Fixed amount off</option>
            <option value="free_shipping">Free delivery</option>
          </select>

          {couponForm.discount_type === 'percent' && (
            <input type="number" placeholder="% off (e.g. 10)" value={couponForm.percent_off} onChange={(e) => setCouponForm({ ...couponForm, percent_off: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
          )}
          {couponForm.discount_type === 'fixed' && (
            <input type="number" placeholder="Amount off, in Naira (e.g. 2000)" value={couponForm.fixed_amount_off} onChange={(e) => setCouponForm({ ...couponForm, fixed_amount_off: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
          )}

          <select value={couponForm.applies_to_category} onChange={(e) => setCouponForm({ ...couponForm, applies_to_category: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold">
            <option value="">Applies to the whole order</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>Only on {cat.name}</option>
            ))}
          </select>
          {couponForm.discount_type === 'free_shipping' && couponForm.applies_to_category && (
            <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 -mt-1">
              With free delivery, this just means the order needs at least one item from this category to qualify — the whole delivery fee is still waived.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <label className="font-sans text-xs text-espresso/50 dark:text-cream/50">
            Expires on (optional — leave blank for no expiry)
          </label>
          <input type="date" value={couponForm.expires_at} onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
          <label className="font-sans text-xs text-espresso/50 dark:text-cream/50 mt-2">
            Maximum total uses (optional — leave blank for unlimited)
          </label>
          <input type="number" placeholder="e.g. 50" value={couponForm.max_uses} onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
          <label className="font-sans text-xs text-espresso/50 dark:text-cream/50 mt-2">
            Minimum order amount, in Naira (optional) — checked against the whole cart, even for a category-restricted code
          </label>
          <input type="number" placeholder="e.g. 20000" value={couponForm.min_order_amount} onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
        </div>
        <button onClick={addCoupon} className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors">Create Code</button>
      </div>
      <div>
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">All Codes</h2>
        <div className="flex flex-col gap-2">
          {coupons.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 border border-gold/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="flex-1 font-sans text-sm text-espresso dark:text-cream">{c.code} <span className="text-gold">({describeCoupon(c)})</span></span>
                <button onClick={() => toggleCoupon(c.id, c.active)} className={`text-xs font-sans px-3 py-1 rounded-full ${c.active ? 'bg-green-500/10 text-green-500' : 'bg-gold/10 text-espresso/50 dark:text-cream/50'}`}>
                  {c.active ? 'Active' : 'Disabled'}
                </button>
                <button onClick={() => deleteCoupon(c.id)} aria-label="Delete code"><Trash2 className="w-4 h-4 text-espresso/40 dark:text-cream/40 hover:text-red-500" /></button>
              </div>
              <div className="flex flex-wrap gap-x-4 font-sans text-xs text-espresso/50 dark:text-cream/50">
                <span>Used {c.used_count || 0}{c.max_uses ? ` / ${c.max_uses}` : ' times'}</span>
                {c.expires_at && <span>Expires {new Date(c.expires_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                {c.min_order_amount && <span>Min order {formatPrice(c.min_order_amount)}</span>}
              </div>
            </div>
          ))}
          {coupons.length === 0 && (
            <p className="font-sans text-sm text-espresso/50 dark:text-cream/50">No discount codes yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}