import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { formatPrice } from '../utils/formatPrice'
import { Trash2, Plus } from 'lucide-react'

function AdminVariantManager({ productId, basePrice }) {
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ size: '', color: '', sku: '', stock: '', price_override: '' })

  useEffect(() => {
    fetchVariants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  async function fetchVariants() {
    setLoading(true)
    const { data } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('id')
    setVariants(data || [])
    setLoading(false)
  }

  async function addVariant() {
    if (!form.size && !form.color) return
    await supabase.from('product_variants').insert({
      product_id: productId,
      size: form.size || null,
      color: form.color || null,
      sku: form.sku || null,
      stock: Number(form.stock) || 0,
      price_override: form.price_override ? Number(form.price_override) : null,
    })
    setForm({ size: '', color: '', sku: '', stock: '', price_override: '' })
    fetchVariants()
  }

  async function deleteVariant(id) {
    await supabase.from('product_variants').delete().eq('id', id)
    fetchVariants()
  }

  return (
    <div className="border-t border-gold/10 mt-3 pt-3">
      <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">
        Variants {variants.length > 0 && `(${variants.length})`}
      </p>
      <p className="font-sans text-xs text-espresso/40 dark:text-cream/40 mb-3">
        Optional — only add these if this product comes in specific sizes/colors that need their own stock count. Otherwise the product's main stock field above is all that's needed.
      </p>

      {loading ? (
        <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">Loading...</p>
      ) : (
        <div className="flex flex-col gap-2 mb-3">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center gap-2 text-xs font-sans">
              <span className="flex-1 text-espresso dark:text-cream">
                {[v.size, v.color].filter(Boolean).join(' / ') || 'Variant'}
                {v.sku && <span className="text-espresso/40 dark:text-cream/40"> · {v.sku}</span>}
              </span>
              <span className="text-espresso/60 dark:text-cream/60">Stock: {v.stock}</span>
              {v.price_override && <span className="text-gold">{formatPrice(v.price_override)}</span>}
              <button onClick={() => deleteVariant(v.id)} aria-label="Delete variant">
                <Trash2 className="w-3.5 h-3.5 text-espresso/40 dark:text-cream/40 hover:text-red-500" />
              </button>
            </div>
          ))}
          {variants.length === 0 && (
            <p className="font-sans text-xs text-espresso/40 dark:text-cream/40">No variants yet — using the product's main stock field.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-2">
        <input type="text" placeholder="Size (e.g. M)" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
          className="bg-transparent border border-gold/30 rounded-lg px-3 py-2 font-sans text-xs text-espresso dark:text-cream outline-none focus:border-gold" />
        <input type="text" placeholder="Color (optional)" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
          className="bg-transparent border border-gold/30 rounded-lg px-3 py-2 font-sans text-xs text-espresso dark:text-cream outline-none focus:border-gold" />
        <input type="text" placeholder="SKU (optional)" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
          className="bg-transparent border border-gold/30 rounded-lg px-3 py-2 font-sans text-xs text-espresso dark:text-cream outline-none focus:border-gold" />
        <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="bg-transparent border border-gold/30 rounded-lg px-3 py-2 font-sans text-xs text-espresso dark:text-cream outline-none focus:border-gold" />
        <input type="number" placeholder={`Price override (default ${formatPrice(basePrice)})`} value={form.price_override} onChange={(e) => setForm({ ...form, price_override: e.target.value })}
          className="col-span-2 bg-transparent border border-gold/30 rounded-lg px-3 py-2 font-sans text-xs text-espresso dark:text-cream outline-none focus:border-gold" />
      </div>
      <button onClick={addVariant} className="flex items-center gap-1 font-sans text-xs text-gold hover:text-gold-light">
        <Plus className="w-3.5 h-3.5" /> Add Variant
      </button>
    </div>
  )
}

export default AdminVariantManager