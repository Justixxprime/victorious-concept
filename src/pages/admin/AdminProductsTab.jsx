import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice } from '../../utils/formatPrice'
import { starterCatalog } from '../../data/starterCatalog'
import { useToast } from '../../context/ToastContext'
import { useAdminWrite } from '../../hooks/useAdminWrite'
import { compressImage } from '../../utils/compressImage'
import AdminVariantManager from '../../components/AdminVariantManager'
import AdminBulkImport from '../../components/AdminBulkImport'
import { Trash2, Pencil, Plus, Upload } from 'lucide-react'

const EMPTY_FORM = {
  name: '', price: '', category: 'bags', image: '', imagesText: '',
  stock: 5, status: 'active', video_url: '', is_new: false, is_featured: false,
}

export default function AdminProductsTab({ products, loading, categories }) {
  const { showToast } = useToast()
  const runWrite = useAdminWrite()

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [expandedVariants, setExpandedVariants] = useState(null)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function startEdit(product) {
    setEditing(product.id)
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      imagesText: (product.images || [product.image]).join(', '),
      stock: product.stock,
      status: product.status || 'active',
      video_url: product.videoUrl || '',
      is_new: product.isNew,
      is_featured: product.isFeatured,
    })
  }

  function resetForm() {
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const uploadedUrls = []
    const failures = []
    for (const file of files) {
      const compressed = await compressImage(file)
      const fileName = `${Date.now()}-${compressed.name}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressed)
      if (!uploadError) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
        uploadedUrls.push(data.publicUrl)
      } else {
        // Storage now enforces a real size limit and allowed file types
        // server-side (see supabase/bucket_limits.sql), so a rejection here
        // is a genuine "too big" or "wrong type" - worth telling the admin
        // instead of the file just silently vanishing.
        failures.push(`${file.name}: ${uploadError.message}`)
      }
    }

    if (failures.length > 0) {
      showToast(`${failures.length} photo${failures.length > 1 ? 's' : ''} couldn't be uploaded - ${failures[0]}`, 'error')
    }

    if (uploadedUrls.length > 0) {
      const existing = form.imagesText ? form.imagesText.split(',').map((s) => s.trim()).filter(Boolean) : []
      const combined = [...existing, ...uploadedUrls]
      update('imagesText', combined.join(', '))
      if (!form.image) update('image', combined[0])
    }
  }

  async function handleSave() {
    setSaving(true)
    const imagesArray = form.imagesText
      ? form.imagesText.split(',').map((s) => s.trim()).filter(Boolean)
      : [form.image]
    const payload = {
      name: form.name,
      price: form.price,
      category: form.category,
      image: form.image,
      images: imagesArray,
      stock: form.stock,
      status: form.status,
      video_url: form.video_url || null,
      is_new: form.is_new,
      is_featured: form.is_featured,
    }
    let ok
    if (editing) {
      ok = await runWrite(supabase.from('products').update(payload).eq('id', editing), 'Saving product')
    } else {
      ok = await runWrite(supabase.from('products').insert(payload), 'Adding product')
    }
    setSaving(false)
    if (!ok) return
    resetForm()
    window.location.reload()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product permanently?')) return
    const ok = await runWrite(supabase.from('products').delete().eq('id', id), 'Deleting product')
    if (!ok) return
    window.location.reload()
  }

  async function importStarterCatalog() {
    if (!confirm(`This will add ${starterCatalog.length} starter products (bags, shoes, slippers, clothing, perfumes, accessories) with stock photos and Nigerian market pricing. Products with names that already exist will be skipped. Continue?`)) return
    setImporting(true)
    const existingNames = new Set(products.map((p) => p.name.toLowerCase()))
    let added = 0
    let skipped = 0
    for (const item of starterCatalog) {
      if (existingNames.has(item.name.toLowerCase())) {
        skipped++
        continue
      }
      const ok = await runWrite(
        supabase.from('products').insert({ ...item, images: [item.image] }),
        `Adding "${item.name}"`,
        true
      )
      if (ok) added++
    }
    setImporting(false)
    showToast(`Import finished - added ${added}, skipped ${skipped} (already existed)`, added > 0 ? 'success' : 'error')
    window.location.reload()
  }

  return (
    <>
      <AdminBulkImport categories={categories} onImported={() => window.location.reload()} />

      <div className="bg-gold/5 rounded-2xl p-6 mb-6 mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-1">
            Starter Catalog
          </h2>
          <p className="font-sans text-xs text-espresso/60 dark:text-cream/60">
            Add {starterCatalog.length} products across all 6 categories in one click (stock photos + Nigerian market pricing).
          </p>
        </div>
        <button
          onClick={importStarterCatalog}
          disabled={importing}
          className="bg-gold text-espresso font-sans text-sm font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {importing ? 'Importing…' : 'Import Starter Catalog'}
        </button>
      </div>

      <div className="bg-gold/5 rounded-2xl p-6 mb-12">
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">
          {editing ? 'Edit Product' : 'Add New Product'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Product name" value={form.name} onChange={(e) => update('name', e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
          <input type="number" placeholder="Price (Naira)" value={form.price} onChange={(e) => update('price', e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
          <select value={form.category} onChange={(e) => update('category', e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" placeholder="Stock quantity" value={form.stock} onChange={(e) => update('stock', e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
          <select value={form.status} onChange={(e) => update('status', e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold md:col-span-2">
            <option value="active">Active (visible, normal sale)</option>
            <option value="preorder">Preorder (visible, orderable even at 0 stock)</option>
            <option value="hidden">Hidden (not shown anywhere on the site)</option>
          </select>
          <input type="text" placeholder="Main Image URL" value={form.image} onChange={(e) => update('image', e.target.value)}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold md:col-span-2" />
        </div>

        <textarea placeholder="All image URLs, separated by commas" rows={2} value={form.imagesText} onChange={(e) => update('imagesText', e.target.value)}
          className="w-full bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none mb-3" />

        <label className="flex items-center gap-2 justify-center border-2 border-dashed border-gold/30 rounded-xl px-4 py-4 cursor-pointer hover:border-gold transition-colors mb-4">
          <Upload className="w-4 h-4 text-gold" />
          <span className="font-sans text-sm text-espresso dark:text-cream">Or upload photos directly from your phone or computer</span>
          <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
        </label>

        <input type="text" placeholder="Video URL (optional, .mp4)" value={form.video_url} onChange={(e) => update('video_url', e.target.value)}
          className="w-full bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold mb-4" />

        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-2 font-sans text-sm text-espresso dark:text-cream">
            <input type="checkbox" checked={form.is_new} onChange={(e) => update('is_new', e.target.checked)} /> New Arrival
          </label>
          <label className="flex items-center gap-2 font-sans text-sm text-espresso dark:text-cream">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} /> Featured
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving || !form.name || !form.price}
            className="flex items-center gap-2 bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40">
            <Plus className="w-4 h-4" /> {editing ? 'Save Changes' : 'Add Product'}
          </button>
          {editing && (
            <button onClick={resetForm} className="font-sans text-sm text-espresso/60 dark:text-cream/60 hover:text-gold">Cancel</button>
          )}
        </div>
      </div>

      <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">All Products ({products.length})</h2>
      {loading ? (
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">Loading...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((product) => (
            <div key={product.id} className="border border-gold/20 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-sans text-sm text-espresso dark:text-cream">{product.name}</p>
                  <p className="font-sans text-xs text-gold">{formatPrice(product.price)} · {product.category} · {product.status}</p>
                </div>
                <button
                  onClick={() => setExpandedVariants(expandedVariants === product.id ? null : product.id)}
                  className="font-sans text-xs text-espresso/50 dark:text-cream/50 hover:text-gold underline"
                >
                  Variants
                </button>
                <button onClick={() => startEdit(product)} aria-label="Edit"><Pencil className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-gold" /></button>
                <button onClick={() => handleDelete(product.id)} aria-label="Delete"><Trash2 className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-red-500" /></button>
              </div>
              {expandedVariants === product.id && (
                <AdminVariantManager productId={product.id} basePrice={product.price} />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}