import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice } from '../../utils/formatPrice'
import { useAdminWrite } from '../../hooks/useAdminWrite'
import { Trash2 } from 'lucide-react'

const EMPTY_FORM = { code: '', percent_off: '', expires_at: '', max_uses: '', min_order_amount: '' }

export default function AdminDiscountsTab() {
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

  async function addCoupon() {
    if (!couponForm.code || !couponForm.percent_off) return
    const ok = await runWrite(
      supabase.from('coupons').insert({
        code: couponForm.code.trim().toUpperCase(),
        percent_off: Number(couponForm.percent_off),
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
        <div className="flex gap-3 mb-3">
          <input type="text" placeholder="CODE" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
            className="flex-1 bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
          <input type="number" placeholder="% off" value={couponForm.percent_off} onChange={(e) => setCouponForm({ ...couponForm, percent_off: e.target.value })}
            className="w-24 bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
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
            Minimum order amount, in Naira (optional)
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
                <span className="flex-1 font-sans text-sm text-espresso dark:text-cream">{c.code} <span className="text-gold">({c.percent_off}% off)</span></span>
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
        </div>
      </div>
    </div>
  )
}
