import { useState, useEffect } from 'react'
import SEO from '../components/SEO'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { useProducts } from '../hooks/useProducts'
import { supabase } from '../lib/supabaseClient'
import { categories } from '../data/categories'
import { formatPrice } from '../utils/formatPrice'
import { Trash2, Pencil, Plus, Package } from 'lucide-react'

function Admin() {
    const isAdmin = useIsAdmin()
    const { products, loading, error } = useProducts()
    const [refreshKey, setRefreshKey] = useState(0)
    const [editing, setEditing] = useState(null)
    const [tab, setTab] = useState('products')
    const [orders, setOrders] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(true)
    const [form, setForm] = useState({
        name: '', price: '', category: 'bags', image: '', imagesText: '', stock: 5, is_new: false, is_featured: false,
    })

    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function fetchAllOrders() {
            const { data } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
            setOrders(data || [])
            setOrdersLoading(false)
        }
        if (isAdmin) fetchAllOrders()
    }, [isAdmin])

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
                <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
                    This page is for the Victorious Concept team only
                </h1>
            </div>
        )
    }

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
            is_new: product.isNew,
            is_featured: product.isFeatured,
        })
    }

    function resetForm() {
        setEditing(null)
        setForm({ name: '', price: '', category: 'bags', image: '', imagesText: '', is_new: false, is_featured: false })
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
            is_new: form.is_new,
            is_featured: form.is_featured,
        }
        if (editing) {
            await supabase.from('products').update(payload).eq('id', editing)
        } else {
            await supabase.from('products').insert(payload)
        }
        setSaving(false)
        resetForm()
        setRefreshKey((k) => k + 1)
        window.location.reload()
    }

    async function handleDelete(id) {
        if (!confirm('Delete this product permanently?')) return
        await supabase.from('products').delete().eq('id', id)
        window.location.reload()
    }

    return (
        <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-12 px-6">
            <SEO title="Admin" description="Victorious Concept admin dashboard." />
            <div className="max-w-5xl mx-auto">
                <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-6">
                    Admin Dashboard
                </h1>

                <div className="flex gap-2 mb-10">
                    <button
                        onClick={() => setTab('products')}
                        className={`px-5 py-2 rounded-full text-xs font-sans uppercase tracking-wide border transition-colors ${tab === 'products'
                            ? 'bg-gold text-espresso border-gold'
                            : 'border-gold/30 text-espresso dark:text-cream'
                            }`}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => setTab('orders')}
                        className={`px-5 py-2 rounded-full text-xs font-sans uppercase tracking-wide border transition-colors ${tab === 'orders'
                            ? 'bg-gold text-espresso border-gold'
                            : 'border-gold/30 text-espresso dark:text-cream'
                            }`}
                    >
                        Orders ({orders.length})
                    </button>
                </div>

                {/* ========== ORDERS TAB ========== */}
                {tab === 'orders' && (
                    <div className="flex flex-col gap-4">
                        {ordersLoading ? (
                            <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
                                Loading orders...
                            </p>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <Package className="w-8 h-8 text-gold" />
                                <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
                                    No orders yet.
                                </p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="border border-gold/20 rounded-2xl p-5">
                                    <div className="flex flex-wrap justify-between gap-2 mb-3">
                                        <span className="font-sans text-sm font-medium text-espresso dark:text-cream">
                                            {order.order_number}
                                        </span>
                                        <span className="font-sans text-xs text-espresso/50 dark:text-cream/50">
                                            {new Date(order.created_at).toLocaleDateString('en-NG', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 mb-1">
                                        {order.customer_name} · {order.customer_phone}
                                    </p>
                                    <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-3">
                                        {order.customer_address}
                                    </p>
                                    <div className="flex flex-col gap-1 mb-3 border-t border-gold/10 pt-3">
                                        {order.items?.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between font-sans text-xs text-espresso/60 dark:text-cream/60"
                                            >
                                                <span>
                                                    {item.name} x{item.quantity}
                                                </span>
                                                <span>{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between font-display italic font-semibold text-espresso dark:text-cream">
                                        <span>Total</span>
                                        <span>{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ========== PRODUCTS TAB ========== */}
                {tab === 'products' && (
                    <>
                        <div className="bg-gold/5 rounded-2xl p-6 mb-12">
                            <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">
                                {editing ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Product name"
                                    value={form.name}
                                    onChange={(e) => update('name', e.target.value)}
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />
                                <input
                                    type="number"
                                    placeholder="Price (Naira)"
                                    value={form.price}
                                    onChange={(e) => update('price', e.target.value)}
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />

                                <input
                                    type="number"
                                    placeholder="Stock quantity"
                                    value={form.stock}
                                    onChange={(e) => update('stock', e.target.value)}
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />
                                <select
                                    value={form.category}
                                    onChange={(e) => update('category', e.target.value)}
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Main Image URL"
                                    value={form.image}
                                    onChange={(e) => update('image', e.target.value)}
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />
                            </div>
                            <textarea
                                placeholder="All image URLs, separated by commas (leave blank to just use the main image above)"
                                rows={2}
                                value={form.imagesText}
                                onChange={(e) => update('imagesText', e.target.value)}
                                className="w-full bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none mb-4"
                            />
                            <div className="flex gap-6 mb-4">
                                <label className="flex items-center gap-2 font-sans text-sm text-espresso dark:text-cream">
                                    <input type="checkbox" checked={form.is_new} onChange={(e) => update('is_new', e.target.checked)} />
                                    New Arrival
                                </label>
                                <label className="flex items-center gap-2 font-sans text-sm text-espresso dark:text-cream">
                                    <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} />
                                    Featured
                                </label>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !form.name || !form.price}
                                    className="flex items-center gap-2 bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
                                >
                                    <Plus className="w-4 h-4" /> {editing ? 'Save Changes' : 'Add Product'}
                                </button>
                                {editing && (
                                    <button
                                        onClick={resetForm}
                                        className="font-sans text-sm text-espresso/60 dark:text-cream/60 hover:text-gold"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">
                            All Products ({products.length})
                        </h2>
                        {loading ? (
                            <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">Loading...</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {products.map((product) => (
                                    <div key={product.id} className="flex items-center gap-4 border border-gold/20 rounded-xl p-4">
                                        <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="font-sans text-sm text-espresso dark:text-cream">{product.name}</p>
                                            <p className="font-sans text-xs text-gold">{formatPrice(product.price)} · {product.category}</p>
                                        </div>
                                        <button onClick={() => startEdit(product)} aria-label="Edit">
                                            <Pencil className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-gold" />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} aria-label="Delete">
                                            <Trash2 className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    )
}

export default Admin