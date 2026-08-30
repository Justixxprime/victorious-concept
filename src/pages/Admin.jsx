import { useState, useEffect } from 'react'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useCollections } from '../hooks/useCollections'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { supabase } from '../lib/supabaseClient'
import { formatPrice } from '../utils/formatPrice'
import { starterCatalog } from '../data/starterCatalog'
import { useToast } from '../context/ToastContext'
import { useBusinessSettings } from '../context/BusinessSettingsContext'
import { compressImage } from '../utils/compressImage'
import AdminVariantManager from '../components/AdminVariantManager'
import AdminBulkImport from '../components/AdminBulkImport'
import {
  Trash2, Pencil, Plus, Upload, Tag, Tags, LayoutDashboard, BarChart3,
  Percent, Users, MessageCircle, Mail, Quote, Layers, Package,
  TrendingUp, AlertTriangle, DollarSign, Truck, RotateCcw, Settings,
} from 'lucide-react'

function Admin() {
  const isAdmin = useIsAdmin()
  const { products, loading } = useProducts({ includeHidden: true })
  const { categories, refetch: refetchCategories } = useCategories()
  const { collections, refetch: refetchCollections } = useCollections()
  const { value: heroValue, updateSetting: updateHero } = useSiteSettings('hero')
  const { showToast } = useToast()
  const businessSettings = useBusinessSettings()
  const [businessForm, setBusinessForm] = useState(null)
  const [savingBusiness, setSavingBusiness] = useState(false)

  // Runs any Supabase write. On failure, shows the REAL reason why (usually
  // a Row Level Security permission issue) instead of failing silently.
  // On success, ALSO shows a visible confirmation - so every click in this
  // dashboard gives obvious feedback, whether it worked or not.
  async function runWrite(promise, actionLabel, silent = false) {
    const { error } = await promise
    if (error) {
      if (!silent) showToast(`${actionLabel} failed: ${error.message}`, 'error')
      console.error(`${actionLabel} failed:`, error)
      return false
    }
    if (!silent) showToast(`${actionLabel} - done`, 'success')
    return true
  }

  const [tab, setTab] = useState('products')
  const [expandedVariants, setExpandedVariants] = useState(null)

  // Products
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '', price: '', category: 'bags', image: '', imagesText: '',
    stock: 5, status: 'active', video_url: '', is_new: false, is_featured: false,
  })
  const [saving, setSaving] = useState(false)

  // Orders
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  // Categories
  const [newCategoryName, setNewCategoryName] = useState('')

  // Collections
  const [collectionForm, setCollectionForm] = useState({ name: '', slug: '', description: '', image: '', product_ids: [] })
  const [editingCollection, setEditingCollection] = useState(null)

  // Coupons
  const [coupons, setCoupons] = useState([])
  const [couponForm, setCouponForm] = useState({ code: '', percent_off: '', expires_at: '', max_uses: '', min_order_amount: '' })

  // Shipping zones
  const [shippingZones, setShippingZones] = useState([])
  const [shippingForm, setShippingForm] = useState({ name: '', fee: '', estimated_days: '', is_variable: false })

  // Returns
  const [returns, setReturns] = useState([])
  const [processingReturn, setProcessingReturn] = useState(null)

  // Messages
  const [messages, setMessages] = useState([])

  // Testimonials
  const [testimonials, setTestimonials] = useState([])
  const [testimonialForm, setTestimonialForm] = useState({ customer_name: '', quote: '', source: '' })

  // Homepage hero
  const [heroForm, setHeroForm] = useState(null)

  useEffect(() => {
    async function fetchAllOrders() {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      setOrders(data || [])
      setOrdersLoading(false)
    }
    async function fetchMessages() {
      const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      setMessages(data || [])
    }
    async function fetchReturns() {
      const { data } = await supabase
        .from('return_requests')
        .select('*, orders(order_number, total, payment_method, payment_status, payment_reference, customer_name, customer_phone)')
        .order('created_at', { ascending: false })
      setReturns(data || [])
    }
    if (isAdmin) {
      fetchAllOrders()
      fetchMessages()
      fetchReturns()
    }
  }, [isAdmin])

  // Coupons, testimonials, and shipping zones are only used within their own
  // tab (no badge count depends on them elsewhere), so they're fetched lazily
  // the first time that tab is opened rather than on every Admin page load —
  // this meaningfully cuts unnecessary database traffic.
  const [fetchedLazyTabs, setFetchedLazyTabs] = useState({})

  useEffect(() => {
    if (!isAdmin || fetchedLazyTabs[tab]) return

    async function fetchCoupons() {
      const { data } = await supabase.from('coupons').select('*').order('code')
      setCoupons(data || [])
    }
    async function fetchTestimonials() {
      const { data } = await supabase.from('testimonials').select('*')
      setTestimonials(data || [])
    }
    async function fetchShippingZones() {
      const { data } = await supabase.from('shipping_zones').select('*').order('fee')
      setShippingZones(data || [])
    }

    if (tab === 'discounts') fetchCoupons()
    else if (tab === 'testimonials') fetchTestimonials()
    else if (tab === 'shipping') fetchShippingZones()
    else return // no lazy fetch needed for this tab

    setFetchedLazyTabs((prev) => ({ ...prev, [tab]: true }))
  }, [tab, isAdmin])

  useEffect(() => {
    if (heroValue && !heroForm) setHeroForm(heroValue)
  }, [heroValue])

  useEffect(() => {
    if (!businessSettings.loading && !businessForm) {
      setBusinessForm({
        whatsappNumber: businessSettings.whatsappNumber,
        bankAccountName: businessSettings.bankAccountName,
        bankAccountNumber: businessSettings.bankAccountNumber,
        bankName: businessSettings.bankName,
      })
    }
  }, [businessSettings.loading])

  async function saveBusinessSettings() {
    setSavingBusiness(true)
    await businessSettings.updateSettings(businessForm)
    setSavingBusiness(false)
    showToast('Business info updated', 'success')
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

  const [importing, setImporting] = useState(false)

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
          This page is for the Victorious Concept team only
        </h1>
      </div>
    )
  }

  // ---- Products ----
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
    setForm({
      name: '', price: '', category: 'bags', image: '', imagesText: '',
      stock: 5, status: 'active', video_url: '', is_new: false, is_featured: false,
    })
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const uploadedUrls = []
    for (const file of files) {
      const compressed = await compressImage(file)
      const fileName = `${Date.now()}-${compressed.name}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressed)
      if (!uploadError) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
        uploadedUrls.push(data.publicUrl)
      }
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

  // ---- Orders ----
  async function deleteOrder(id) {
    if (!confirm('Delete this order permanently? This cannot be undone.')) return
    const ok = await runWrite(supabase.from('orders').delete().eq('id', id), 'Deleting order')
    if (!ok) return
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }

  // ---- Categories ----
  async function addCategory() {
    if (!newCategoryName.trim()) return
    const id = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-')
    const ok = await runWrite(
      supabase.from('categories').insert({ id, name: newCategoryName.trim(), sort_order: categories.length + 1 }),
      'Adding category'
    )
    if (!ok) return
    setNewCategoryName('')
    refetchCategories()
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return
    const ok = await runWrite(supabase.from('categories').delete().eq('id', id), 'Deleting category')
    if (!ok) return
    refetchCategories()
  }

  async function saveCategoryDescription(id, description) {
    await runWrite(supabase.from('categories').update({ description }).eq('id', id), 'Saving category description')
  }

  // ---- Collections ----
  function toggleProductInCollection(productId) {
    setCollectionForm((prev) => {
      const id = String(productId)
      const exists = prev.product_ids.includes(id)
      return {
        ...prev,
        product_ids: exists ? prev.product_ids.filter((p) => p !== id) : [...prev.product_ids, id],
      }
    })
  }

  async function saveCollection() {
    const slug = collectionForm.slug || collectionForm.name.toLowerCase().replace(/\s+/g, '-')
    const payload = { ...collectionForm, slug }
    let ok
    if (editingCollection) {
      ok = await runWrite(supabase.from('collections').update(payload).eq('id', editingCollection), 'Saving collection')
    } else {
      ok = await runWrite(supabase.from('collections').insert(payload), 'Adding collection')
    }
    if (!ok) return
    setCollectionForm({ name: '', slug: '', description: '', image: '', product_ids: [] })
    setEditingCollection(null)
    refetchCollections()
  }

  function startEditCollection(col) {
    setEditingCollection(col.id)
    setCollectionForm({
      name: col.name,
      slug: col.slug,
      description: col.description || '',
      image: col.image || '',
      product_ids: col.product_ids || [],
    })
  }

  async function deleteCollection(id) {
    if (!confirm('Delete this collection?')) return
    const ok = await runWrite(supabase.from('collections').delete().eq('id', id), 'Deleting collection')
    if (!ok) return
    refetchCollections()
  }

  // ---- Coupons ----
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
    setCouponForm({ code: '', percent_off: '', expires_at: '', max_uses: '', min_order_amount: '' })
    const { data } = await supabase.from('coupons').select('*').order('code')
    setCoupons(data || [])
  }

  async function toggleCoupon(id, active) {
    const ok = await runWrite(
      supabase.from('coupons').update({ active: !active }).eq('id', id),
      'Updating discount code'
    )
    if (!ok) return
    const { data } = await supabase.from('coupons').select('*').order('code')
    setCoupons(data || [])
  }

  async function deleteCoupon(id) {
    if (!confirm('Delete this discount code?')) return
    const ok = await runWrite(supabase.from('coupons').delete().eq('id', id), 'Deleting discount code')
    if (!ok) return
    const { data } = await supabase.from('coupons').select('*').order('code')
    setCoupons(data || [])
  }

  // ---- Shipping zones ----
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
    setShippingForm({ name: '', fee: '', estimated_days: '', is_variable: false })
    const { data } = await supabase.from('shipping_zones').select('*').order('fee')
    setShippingZones(data || [])
  }

  async function toggleShippingZone(id, active) {
    const ok = await runWrite(
      supabase.from('shipping_zones').update({ active: !active }).eq('id', id),
      'Updating shipping zone'
    )
    if (!ok) return
    const { data } = await supabase.from('shipping_zones').select('*').order('fee')
    setShippingZones(data || [])
  }

  async function deleteShippingZone(id) {
    if (!confirm('Delete this shipping zone?')) return
    const ok = await runWrite(supabase.from('shipping_zones').delete().eq('id', id), 'Deleting shipping zone')
    if (!ok) return
    const { data } = await supabase.from('shipping_zones').select('*').order('fee')
    setShippingZones(data || [])
  }

  // ---- Returns ----
  async function decideReturn(returnRequestId, decision) {
    setProcessingReturn(returnRequestId)
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch('/api/process-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: session?.access_token,
          returnRequestId,
          decision,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Could not process this return', 'error')
      } else {
        showToast(decision === 'approve' ? 'Refund issued' : 'Return rejected', 'success')
        const { data: refreshed } = await supabase
          .from('return_requests')
          .select('*, orders(order_number, total, payment_method, payment_status, payment_reference, customer_name, customer_phone)')
          .order('created_at', { ascending: false })
        setReturns(refreshed || [])
      }
    } catch {
      showToast('Could not reach the server', 'error')
    } finally {
      setProcessingReturn(null)
    }
  }

  // ---- Messages ----
  async function markRead(id) {
    const ok = await runWrite(supabase.from('contact_messages').update({ read: true }).eq('id', id), 'Marking message read')
    if (!ok) return
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
  }

  // ---- Testimonials ----
  async function addTestimonial() {
    if (!testimonialForm.customer_name || !testimonialForm.quote) return
    const ok = await runWrite(supabase.from('testimonials').insert(testimonialForm), 'Adding testimonial')
    if (!ok) return
    setTestimonialForm({ customer_name: '', quote: '', source: '' })
    const { data } = await supabase.from('testimonials').select('*')
    setTestimonials(data || [])
  }

  async function deleteTestimonial(id) {
    if (!confirm('Delete this testimonial?')) return
    const ok = await runWrite(supabase.from('testimonials').delete().eq('id', id), 'Deleting testimonial')
    if (!ok) return
    const { data } = await supabase.from('testimonials').select('*')
    setTestimonials(data || [])
  }

  // ---- Customers (derived) ----
  const customerMap = {}
  orders.forEach((o) => {
    const key = o.customer_phone
    if (!key) return
    if (!customerMap[key]) {
      customerMap[key] = { name: o.customer_name, phone: o.customer_phone, orderCount: 0, totalSpent: 0 }
    }
    customerMap[key].orderCount += 1
    customerMap[key].totalSpent += o.total
  })
  const customersList = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent)

  // ---- Analytics (derived) ----
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 2)
  const outOfStock = products.filter((p) => p.stock <= 0)
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: `Orders (${orders.length})`, icon: Layers },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'collections', label: 'Collections', icon: Layers },
    { id: 'discounts', label: 'Discounts', icon: Percent },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'returns', label: `Returns${returns.filter((r) => r.status === 'requested').length > 0 ? ` (${returns.filter((r) => r.status === 'requested').length})` : ''}`, icon: RotateCcw },
    { id: 'messages', label: `Messages${messages.filter((m) => !m.read).length > 0 ? ` (${messages.filter((m) => !m.read).length})` : ''}`, icon: Mail },
    { id: 'testimonials', label: 'Testimonials', icon: Quote },
    { id: 'content', label: 'Homepage', icon: LayoutDashboard },
    { id: 'business', label: 'Business Info', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">Victorious Concept</p>
            <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream">Admin Dashboard</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-sans text-xs text-espresso dark:text-cream">Live</span>
          </div>
        </div>

        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-sans uppercase tracking-wide border whitespace-nowrap transition-colors ${
                tab === t.id ? 'bg-gold text-espresso border-gold' : 'border-gold/30 text-espresso dark:text-cream'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'products' && (
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
        )}

        {tab === 'orders' && (
          <div className="flex flex-col gap-4">
            {ordersLoading ? (
              <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">No orders yet.</p>
            ) : (
              orders.map((order) => {
                const paymentBadgeStyles = {
                  paid: 'bg-green-500/10 text-green-600',
                  pending: 'bg-gold/20 text-gold',
                  unpaid: 'bg-espresso/10 text-espresso/60 dark:bg-cream/10 dark:text-cream/60',
                  failed: 'bg-red-500/10 text-red-500',
                  refunded: 'bg-purple-500/10 text-purple-500',
                }
                const paymentLabels = {
                  paid: 'Paid',
                  pending: 'Awaiting verification',
                  unpaid: 'Unpaid',
                  failed: 'Failed',
                  refunded: 'Refunded',
                }
                const currentPaymentStatus = order.payment_status || 'unpaid'
                const canManuallyVerify = order.payment_method !== 'card' && currentPaymentStatus !== 'paid'

                async function markPaid() {
                  const ok = await runWrite(
                    supabase
                      .from('orders')
                      .update({ payment_status: 'paid', order_status: 'processing' })
                      .eq('id', order.id),
                    'Marking order paid'
                  )
                  if (!ok) return

                  // Record the manual payment, snapshot the line items, and
                  // protect stock — the same steps the card/webhook path does,
                  // now that a human has confirmed the money actually arrived.
                  const { error: paymentInsertError } = await supabase.from('payments').insert({
                    order_id: order.id,
                    provider: 'manual',
                    provider_reference: order.order_number,
                    amount: order.total,
                    currency: 'NGN',
                    status: 'paid',
                    paid_at: new Date().toISOString(),
                    metadata: { verified_via: order.payment_method },
                  })

                  // If this reference was already recorded (e.g. a double-click),
                  // skip re-inserting line items and re-decrementing stock.
                  if (!paymentInsertError) {
                    await supabase.from('order_items').insert(
                      order.items.map((item) => ({
                        order_id: order.id,
                        product_id: item.id,
                        variant_id: item.variantId || null,
                        product_name: item.name,
                        unit_price: item.price,
                        quantity: item.quantity,
                        line_total: item.price * item.quantity,
                      }))
                    )
                    for (const item of order.items) {
                      if (item.variantId) {
                        await supabase.rpc('decrement_variant_stock', { variant_id: item.variantId, qty: item.quantity })
                      } else {
                        await supabase.rpc('decrement_stock', { product_id: item.id, qty: item.quantity })
                      }
                    }
                  }

                  setOrders((prev) =>
                    prev.map((o) =>
                      o.id === order.id ? { ...o, payment_status: 'paid', order_status: 'processing' } : o
                    )
                  )
                }

                return (
                  <div key={order.id} className="border border-gold/20 rounded-2xl p-5">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                      <span className="font-sans text-sm font-medium text-espresso dark:text-cream">{order.order_number}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-sans text-xs text-espresso/50 dark:text-cream/50">
                          {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => deleteOrder(order.id)} aria-label="Delete order">
                          <Trash2 className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`font-sans text-xs font-medium rounded-full px-3 py-1 ${
                          paymentBadgeStyles[currentPaymentStatus] || paymentBadgeStyles.unpaid
                        }`}
                      >
                        {paymentLabels[currentPaymentStatus] || currentPaymentStatus}
                      </span>
                      <span className="font-sans text-xs text-espresso/50 dark:text-cream/50 capitalize">
                        via {order.payment_method === 'card' ? 'Card' : order.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'WhatsApp'}
                      </span>
                      {canManuallyVerify && (
                        <button
                          onClick={markPaid}
                          className="font-sans text-xs font-medium bg-gold/20 hover:bg-gold/30 text-gold rounded-full px-3 py-1 transition-colors"
                        >
                          Mark as paid
                        </button>
                      )}
                    </div>

                    <select
                      value={order.order_status || 'pending_payment'}
                      onChange={async (e) => {
                        const ok = await runWrite(
                          supabase.from('orders').update({ order_status: e.target.value }).eq('id', order.id),
                          'Updating order status'
                        )
                        if (!ok) return
                        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, order_status: e.target.value } : o)))
                      }}
                      className="bg-transparent border border-gold/30 rounded-full px-3 py-1 font-sans text-xs text-espresso dark:text-cream outline-none focus:border-gold mb-3"
                    >
                      <option value="pending_payment">Pending Payment</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 mb-1">{order.customer_name} · {order.customer_phone}</p>
                    <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-3">{order.customer_address}</p>
                    <div className="flex flex-col gap-1 mb-3 border-t border-gold/10 pt-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between font-sans text-xs text-espresso/60 dark:text-cream/60">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-display italic font-semibold text-espresso dark:text-cream">
                      <span>Total</span><span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'customers' && (
          <div className="max-w-2xl">
            {customersList.length === 0 ? (
              <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">No customers yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {customersList.map((c) => (
                  <div key={c.phone} className="flex items-center gap-4 border border-gold/20 rounded-xl p-4">
                    <div className="flex-1">
                      <p className="font-sans text-sm text-espresso dark:text-cream">{c.name}</p>
                      <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">{c.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">{c.orderCount} order{c.orderCount > 1 ? 's' : ''}</p>
                      <p className="font-display italic font-semibold text-espresso dark:text-cream">{formatPrice(c.totalSpent)}</p>
                    </div>
                    <a href={`https://wa.me/${(c.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="Message on WhatsApp">
                      <MessageCircle className="w-4 h-4 text-gold" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'categories' && (
          <div className="max-w-lg">
            <div className="flex gap-2 mb-8">
              <input type="text" placeholder="New category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
              <button onClick={addCategory} className="flex items-center gap-2 bg-gold text-espresso font-sans font-medium px-5 rounded-full hover:bg-gold-light transition-colors">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="border border-gold/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Tag className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="flex-1 font-sans text-sm text-espresso dark:text-cream">{cat.name}</span>
                    <button onClick={() => deleteCategory(cat.id)} aria-label="Delete category"><Trash2 className="w-4 h-4 text-espresso/40 dark:text-cream/40 hover:text-red-500" /></button>
                  </div>
                  <textarea placeholder="Short introduction (optional)" rows={2} defaultValue={cat.description || ''}
                    onBlur={(e) => saveCategoryDescription(cat.id, e.target.value)}
                    className="w-full bg-transparent border border-gold/20 rounded-lg px-3 py-2 font-sans text-xs text-espresso dark:text-cream outline-none focus:border-gold resize-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'collections' && (
          <div className="max-w-2xl flex flex-col gap-8">
            <div className="bg-gold/5 rounded-2xl p-6">
              <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">{editingCollection ? 'Edit Collection' : 'New Collection'}</h2>
              <div className="flex flex-col gap-3 mb-4">
                <input type="text" placeholder="Collection name" value={collectionForm.name} onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
                <textarea placeholder="Short description" rows={2} value={collectionForm.description} onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none" />
                <input type="text" placeholder="Cover image URL (optional)" value={collectionForm.image} onChange={(e) => setCollectionForm({ ...collectionForm, image: e.target.value })}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
              </div>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">Select Products</p>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">
                {products.map((p) => (
                  <label key={p.id} className="flex items-center gap-3 border border-gold/10 rounded-lg p-2">
                    <input type="checkbox" checked={collectionForm.product_ids.includes(String(p.id))} onChange={() => toggleProductInCollection(p.id)} />
                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                    <span className="font-sans text-xs text-espresso dark:text-cream">{p.name}</span>
                  </label>
                ))}
              </div>
              <button onClick={saveCollection} disabled={!collectionForm.name} className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40">
                {editingCollection ? 'Save Changes' : 'Create Collection'}
              </button>
            </div>
            <div>
              <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">Existing Collections</h2>
              <div className="flex flex-col gap-2">
                {collections.map((col) => (
                  <div key={col.id} className="flex items-center gap-3 border border-gold/20 rounded-xl p-4">
                    <span className="flex-1 font-sans text-sm text-espresso dark:text-cream">{col.name} <span className="text-espresso/40 dark:text-cream/40">({col.product_ids?.length || 0} items)</span></span>
                    <button onClick={() => startEditCollection(col)} aria-label="Edit collection"><Pencil className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-gold" /></button>
                    <button onClick={() => deleteCollection(col.id)} aria-label="Delete collection"><Trash2 className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-red-500" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'discounts' && (
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
        )}

        {tab === 'shipping' && (
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
        )}

        {tab === 'returns' && (
          <div className="max-w-2xl flex flex-col gap-3">
            <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">Return Requests</h2>
            {returns.length === 0 && (
              <p className="font-sans text-sm text-espresso/50 dark:text-cream/50">No return requests yet.</p>
            )}
            {returns.map((r) => (
              <div key={r.id} className="border border-gold/20 rounded-2xl p-5">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                  <span className="font-sans text-sm font-medium text-espresso dark:text-cream">
                    {r.orders?.order_number}
                  </span>
                  <span className={`font-sans text-xs px-3 py-1 rounded-full capitalize ${
                    r.status === 'refunded' ? 'bg-purple-500/10 text-purple-500' :
                    r.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                    'bg-gold/20 text-gold'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-2">
                  {r.orders?.customer_name} · {r.orders?.customer_phone} · {formatPrice(r.orders?.total)} · via {r.orders?.payment_method}
                </p>
                <p className="font-sans text-sm text-espresso/80 dark:text-cream/80 mb-3">"{r.reason}"</p>
                {r.status === 'requested' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => decideReturn(r.id, 'approve')}
                      disabled={processingReturn === r.id}
                      className="bg-gold text-espresso font-sans text-xs font-medium px-4 py-2 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
                    >
                      {processingReturn === r.id ? 'Processing...' : 'Approve & Refund'}
                    </button>
                    <button
                      onClick={() => decideReturn(r.id, 'reject')}
                      disabled={processingReturn === r.id}
                      className="border border-gold/30 text-espresso dark:text-cream font-sans text-xs font-medium px-4 py-2 rounded-full hover:border-gold transition-colors disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {r.status === 'refunded' && (
                  <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">
                    Refunded {formatPrice(r.refund_amount)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'messages' && (
          <div className="max-w-2xl flex flex-col gap-3">
            {messages.length === 0 ? (
              <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">No messages yet.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`border rounded-xl p-4 ${m.read ? 'border-gold/10' : 'border-gold/40 bg-gold/5'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-sans text-sm text-espresso dark:text-cream">{m.name}</p>
                      <p className="font-sans text-xs text-gold">{m.email}</p>
                    </div>
                    {!m.read && <button onClick={() => markRead(m.id)} className="font-sans text-xs text-gold hover:underline">Mark read</button>}
                  </div>
                  <p className="font-sans text-sm text-espresso/70 dark:text-cream/70">{m.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'testimonials' && (
          <div className="max-w-lg flex flex-col gap-8">
            <div className="bg-gold/5 rounded-2xl p-6">
              <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">Add a Real Testimonial</h2>
              <div className="flex flex-col gap-3 mb-4">
                <input type="text" placeholder="Customer name" value={testimonialForm.customer_name} onChange={(e) => setTestimonialForm({ ...testimonialForm, customer_name: e.target.value })}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
                <textarea placeholder="What they said" rows={3} value={testimonialForm.quote} onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none" />
                <input type="text" placeholder="Source (e.g. Instagram)" value={testimonialForm.source} onChange={(e) => setTestimonialForm({ ...testimonialForm, source: e.target.value })}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
              </div>
              <button onClick={addTestimonial} className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors">Add Testimonial</button>
            </div>
            <div className="flex flex-col gap-2">
              {testimonials.map((t) => (
                <div key={t.id} className="border border-gold/20 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-sans text-sm text-espresso dark:text-cream">{t.customer_name}</p>
                      <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">"{t.quote}"</p>
                    </div>
                    <button onClick={() => deleteTestimonial(t.id)} aria-label="Delete"><Trash2 className="w-4 h-4 text-espresso/40 dark:text-cream/40 hover:text-red-500" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'business' && businessForm && (
          <div className="max-w-md flex flex-col gap-6">
            <div>
              <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">WhatsApp Number</h2>
              <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-3">
                Used across the whole site — floating button, checkout, product questions, order help. Digits only, with country code, no + or spaces (e.g. 2348122470435).
              </p>
              <input
                type="text"
                value={businessForm.whatsappNumber}
                onChange={(e) => setBusinessForm({ ...businessForm, whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })}
                className="w-full bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
              />
            </div>

            <div>
              <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">Bank Transfer Details</h2>
              <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-3">
                Shown to customers who choose "Bank Transfer" at checkout.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Account name"
                  value={businessForm.bankAccountName}
                  onChange={(e) => setBusinessForm({ ...businessForm, bankAccountName: e.target.value })}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                />
                <input
                  type="text"
                  placeholder="Account number"
                  value={businessForm.bankAccountNumber}
                  onChange={(e) => setBusinessForm({ ...businessForm, bankAccountNumber: e.target.value })}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                />
                <input
                  type="text"
                  placeholder="Bank name"
                  value={businessForm.bankName}
                  onChange={(e) => setBusinessForm({ ...businessForm, bankName: e.target.value })}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                />
              </div>
            </div>

            <button
              onClick={saveBusinessSettings}
              disabled={savingBusiness}
              className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors self-start disabled:opacity-50"
            >
              {savingBusiness ? 'Saving...' : 'Save Business Info'}
            </button>
          </div>
        )}

        {tab === 'content' && heroForm && (
          <div className="max-w-lg flex flex-col gap-4">
            <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">Hero Section</h2>
            <input type="text" placeholder="Small label" value={heroForm.label} onChange={(e) => setHeroForm({ ...heroForm, label: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
            <textarea placeholder="Headline" rows={2} value={heroForm.headline} onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none" />
            <textarea placeholder="Supporting text" rows={2} value={heroForm.subtext} onChange={(e) => setHeroForm({ ...heroForm, subtext: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none" />
            <input type="text" placeholder="Backdrop image URL" value={heroForm.backdropImage} onChange={(e) => setHeroForm({ ...heroForm, backdropImage: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
            <button onClick={() => updateHero(heroForm)} className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors self-start">
              Save Homepage Hero
            </button>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="relative overflow-hidden bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-5 border border-gold/10">
                <DollarSign className="w-5 h-5 text-gold mb-3" />
                <p className="font-display italic font-semibold text-2xl text-espresso dark:text-cream">{formatPrice(totalRevenue)}</p>
                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">Total Revenue</p>
              </div>
              <div className="relative overflow-hidden bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-5 border border-gold/10">
                <Package className="w-5 h-5 text-gold mb-3" />
                <p className="font-display italic font-semibold text-2xl text-espresso dark:text-cream">{totalOrders}</p>
                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">Total Orders</p>
              </div>
              <div className="relative overflow-hidden bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-5 border border-gold/10">
                <TrendingUp className="w-5 h-5 text-gold mb-3" />
                <p className="font-display italic font-semibold text-2xl text-espresso dark:text-cream">{formatPrice(avgOrderValue)}</p>
                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">Avg Order Value</p>
              </div>
              <div className="relative overflow-hidden bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-5 border border-gold/10">
                <AlertTriangle className="w-5 h-5 text-gold mb-3" />
                <p className="font-display italic font-semibold text-2xl text-espresso dark:text-cream">{lowStock.length + outOfStock.length}</p>
                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">Stock Alerts</p>
              </div>
            </div>

            {(lowStock.length > 0 || outOfStock.length > 0) && (
              <div>
                <h3 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">Needs Attention</h3>
                <div className="flex flex-col gap-2">
                  {outOfStock.map((p) => (
                    <div key={p.id} className="flex justify-between items-center bg-red-500/5 rounded-xl px-4 py-3">
                      <span className="font-sans text-sm text-espresso dark:text-cream">{p.name}</span>
                      <span className="font-sans text-xs text-red-500">Out of stock</span>
                    </div>
                  ))}
                  {lowStock.map((p) => (
                    <div key={p.id} className="flex justify-between items-center bg-gold/10 rounded-xl px-4 py-3">
                      <span className="font-sans text-sm text-espresso dark:text-cream">{p.name}</span>
                      <span className="font-sans text-xs text-gold">Only {p.stock} left</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default Admin