import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice } from '../../utils/formatPrice'
import { useAdminWrite } from '../../hooks/useAdminWrite'
import { Trash2 } from 'lucide-react'

const EMPTY_FORM = { name: '', fee: '', estimated_days: '', is_variable: false }

export default function AdminShippingTab() {
  const runWrite = useAdminWrite()
  const [shippingZones, setShippingZones] = useState([])
  const [shippingForm, setShippingForm] = useState(EMPTY_FORM)

  async function refetch() {
    const { data } = await supabase.from('shipping_zones').select('*').order('fee')
    setShippingZones(data || [])
  }

  useEffect(() => {
    refetch()
  }, [])

  async function addShippingZone() {
    if (!shippingForm.name) return
    const ok = await runWrite(
      supabase.from('shipping_zones').insert({
        name: shippingForm.name.trim(),
        fee: Number(shippingForm.fee) || 0,
        estimated_days: shippingForm.estimated_days || null,
        is_variable: shippingForm.is_variable,
        active: true,
      }),
      'Adding shipping zone'
    )
    if (!ok) return
    setShippingForm(EMPTY_FORM)
    refetch()
  }

  async function toggleShippingZone(id, active) {
    const ok = await runWrite(
      supabase.from('shipping_zones').update({ active: !active }).eq('id', id),
      'Updating shipping zone'
    )
    if (!ok) return
    refetch()
  }

  async function deleteShippingZone(id) {
    if (!confirm('Delete this shipping zone?')) return
    const ok = await runWrite(supabase.from('shipping_zones').delete().eq('id', id), 'Deleting shipping zone')
    if (!ok) return
    refetch()
  }

  return (
    <div className="max-w-lg flex flex-col gap-8">
      <div className="bg-gold/5 rounded-2xl p-6">
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">New Shipping Zone</h2>
        <div className="flex flex-col gap-3 mb-3">
          <input type="text" placeholder="Zone name (e.g. Lagos, Interstate by road, By air)" value={shippingForm.name} onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
          <input type="number" placeholder={shippingForm.is_variable ? 'Estimated fee, optional (leave blank if unknown)' : 'Delivery fee (Naira)'} value={shippingForm.fee} onChange={(e) => setShippingForm({ ...shippingForm, fee: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
          <input type="text" placeholder="Estimated delivery (e.g. 1-2 days)" value={shippingForm.estimated_days} onChange={(e) => setShippingForm({ ...shippingForm, estimated_days: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
        </div>
        <label className="flex items-start gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={shippingForm.is_variable}
            onChange={(e) => setShippingForm({ ...shippingForm, is_variable: e.target.checked })}
            className="mt-1 accent-gold"
          />
          <span className="font-sans text-xs text-espresso/70 dark:text-cream/70">
            Fee varies (e.g. road dispatch or flights where the rider/courier only quotes a price at the time). Customers can still pay by card for the order itself — you'll arrange the exact delivery cost with them directly via WhatsApp or bank transfer.
          </span>
        </label>
        <button onClick={addShippingZone} className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors">Add Zone</button>
      </div>
      <div>
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">All Zones</h2>
        <div className="flex flex-col gap-2">
          {shippingZones.map((z) => (
            <div key={z.id} className="flex items-center gap-3 border border-gold/20 rounded-xl p-4">
              <div className="flex-1">
                <span className="font-sans text-sm text-espresso dark:text-cream">{z.name}</span>
                <span className="font-sans text-xs text-gold ml-2">
                  {z.is_variable ? (z.fee > 0 ? `From ${formatPrice(z.fee)} · confirmed via WhatsApp` : 'Confirmed via WhatsApp') : formatPrice(z.fee)}
                </span>
                {z.estimated_days && <span className="font-sans text-xs text-espresso/50 dark:text-cream/50 ml-2">{z.estimated_days}</span>}
              </div>
              <button onClick={() => toggleShippingZone(z.id, z.active)} className={`text-xs font-sans px-3 py-1 rounded-full ${z.active ? 'bg-green-500/10 text-green-500' : 'bg-gold/10 text-espresso/50 dark:text-cream/50'}`}>
                {z.active ? 'Active' : 'Disabled'}
              </button>
              <button onClick={() => deleteShippingZone(z.id)} aria-label="Delete zone"><Trash2 className="w-4 h-4 text-espresso/40 dark:text-cream/40 hover:text-red-500" /></button>
            </div>
          ))}
          {shippingZones.length === 0 && (
            <p className="font-sans text-sm text-espresso/50 dark:text-cream/50">No shipping zones yet — checkout won't be able to calculate delivery until at least one is added.</p>
          )}
        </div>
      </div>
    </div>
  )
}
