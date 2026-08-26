import { useState, useEffect } from 'react'
import SEO from '../components/SEO'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useCollections } from '../hooks/useCollections'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { supabase } from '../lib/supabaseClient'
import { formatPrice } from '../utils/formatPrice'
import {
    Trash2,
    Pencil,
    Plus,
    Package,
    Upload,
    Tag as TagIcon,
    ClipboardList,
    Tags,
    LayoutDashboard,
    BarChart3,
    TrendingUp,
    ShoppingBag as BagIcon,
    AlertTriangle,
    DollarSign,
    Layers,
    Percent,
    Users,
    MessageCircle,
    Mail,
} from 'lucide-react'

function Admin() {
    const isAdmin = useIsAdmin()

    const {
        products,
        loading,
        error,
    } = useProducts({
        includeHidden: true,
    })

    const { categories } = useCategories()

    const {
        collections,
        refetch: refetchCollections,
    } = useCollections()

    const {
        value: heroValue,
        updateSetting: updateHero,
    } = useSiteSettings('hero')

    const [heroForm, setHeroForm] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [editing, setEditing] = useState(null)
    const [tab, setTab] = useState('products')

    const [orders, setOrders] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(true)

    const [messages, setMessages] = useState([])

    const [coupons, setCoupons] = useState([])

    const [couponForm, setCouponForm] = useState({
        code: '',
        percent_off: '',
        active: true,
    })

    const [collectionForm, setCollectionForm] = useState({
        name: '',
        slug: '',
        description: '',
        image: '',
        product_ids: [],
    })

    const [editingCollection, setEditingCollection] = useState(null)

    const [form, setForm] = useState({
        name: '',
        price: '',
        category: 'bags',
        image: '',
        imagesText: '',
        video_url: '',
        stock: 5,
        status: 'active',
        is_new: false,
        is_featured: false,
    })

    const [saving, setSaving] = useState(false)

    const [newCategoryName, setNewCategoryName] = useState('')

    /*
     * FETCH ORDERS
     */

    useEffect(() => {
        async function fetchAllOrders() {
            const { data } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', {
                    ascending: false,
                })

            setOrders(data || [])
            setOrdersLoading(false)
        }

        if (isAdmin) {
            fetchAllOrders()
        }
    }, [isAdmin])

    /*
     * FETCH COUPONS
     */

    useEffect(() => {
        async function fetchCoupons() {
            const { data } = await supabase
                .from('coupons')
                .select('*')
                .order('code')

            setCoupons(data || [])
        }

        if (isAdmin) {
            fetchCoupons()
        }
    }, [isAdmin])

    /*
     * FETCH CONTACT MESSAGES
     */

    useEffect(() => {
        async function fetchMessages() {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', {
                    ascending: false,
                })

            if (error) {
                console.error(
                    'Unable to load contact messages:',
                    error
                )
                setMessages([])
                return
            }

            setMessages(data || [])
        }

        if (isAdmin) {
            fetchMessages()
        }
    }, [isAdmin])

    /*
     * HERO FORM
     */

    useEffect(() => {
        if (heroValue && !heroForm) {
            setHeroForm(heroValue)
        }
    }, [heroValue, heroForm])

    /*
     * CUSTOMER AGGREGATION
     *
     * Customers are derived directly from real orders.
     */

    const customerMap = {}

    orders.forEach((o) => {
        const key = o.customer_phone

        if (!key) return

        if (!customerMap[key]) {
            customerMap[key] = {
                name: o.customer_name,
                phone: o.customer_phone,
                orderCount: 0,
                totalSpent: 0,
            }
        }

        customerMap[key].orderCount += 1
        customerMap[key].totalSpent += Number(o.total) || 0
    })

    const customersList = Object.values(customerMap).sort(
        (a, b) => b.totalSpent - a.totalSpent
    )

    const unreadMessages = messages.filter(
        (message) => !message.read
    ).length

    /*
     * ADMIN ACCESS
     */

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
                <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
                    This page is for the Victorious Concept team only
                </h1>
            </div>
        )
    }

    /*
     * GENERIC PRODUCT FORM UPDATE
     */

    function update(field, value) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    /*
     * START EDITING PRODUCT
     */

    function startEdit(product) {
        setEditing(product.id)

        setForm({
            name: product.name || '',
            price: product.price || '',
            category: product.category || 'bags',
            image: product.image || '',
            imagesText: (
                product.images ||
                [product.image]
            )
                .filter(Boolean)
                .join(', '),
            video_url: product.video_url || '',
            stock: product.stock ?? 5,
            status: product.status || 'active',
            is_new: Boolean(
                product.is_new ??
                product.isNew
            ),
            is_featured: Boolean(
                product.is_featured ??
                product.isFeatured
            ),
        })

        setTab('products')
    }

    /*
     * RESET PRODUCT FORM
     */

    function resetForm() {
        setEditing(null)

        setForm({
            name: '',
            price: '',
            category: 'bags',
            image: '',
            imagesText: '',
            video_url: '',
            stock: 5,
            status: 'active',
            is_new: false,
            is_featured: false,
        })
    }

    /*
     * PRODUCT IMAGE UPLOAD
     */

    async function handleFileUpload(e) {
        const files = Array.from(e.target.files || [])

        if (files.length === 0) return

        const uploadedUrls = []

        for (const file of files) {
            const fileName = `${Date.now()}-${file.name}`

            const {
                error: uploadError,
            } = await supabase.storage
                .from('product-images')
                .upload(
                    fileName,
                    file
                )

            if (!uploadError) {
                const {
                    data,
                } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(
                        fileName
                    )

                if (data?.publicUrl) {
                    uploadedUrls.push(
                        data.publicUrl
                    )
                }
            } else {
                console.error(
                    'Image upload error:',
                    uploadError
                )
            }
        }

        if (uploadedUrls.length > 0) {
            const existing = form.imagesText
                ? form.imagesText
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : []

            const combined = [
                ...existing,
                ...uploadedUrls,
            ]

            update(
                'imagesText',
                combined.join(', ')
            )

            if (!form.image) {
                update(
                    'image',
                    combined[0]
                )
            }
        }

        e.target.value = ''
    }

    /*
     * SAVE PRODUCT
     */

    async function handleSave() {
        if (!form.name.trim() || !form.price) {
            return
        }

        setSaving(true)

        const imagesArray = form.imagesText
            ? form.imagesText
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : form.image
                ? [form.image]
                : []

        const payload = {
            name: form.name.trim(),
            price: Number(form.price),
            category: form.category,
            image: form.image,
            images: imagesArray,
            video_url:
                form.video_url?.trim() || null,
            stock: Number(form.stock) || 0,
            status: form.status,
            is_new: form.is_new,
            is_featured: form.is_featured,
        }

        let result

        if (editing) {
            result = await supabase
                .from('products')
                .update(payload)
                .eq('id', editing)
        } else {
            result = await supabase
                .from('products')
                .insert(payload)
        }

        if (result.error) {
            console.error(
                'Product save error:',
                result.error
            )

            alert(
                `Unable to save product: ${result.error.message}`
            )

            setSaving(false)
            return
        }

        setSaving(false)
        resetForm()
        setRefreshKey((k) => k + 1)

        window.location.reload()
    }

    /*
     * DELETE PRODUCT
     */

    async function handleDelete(id) {
        if (
            !confirm(
                'Delete this product permanently?'
            )
        ) {
            return
        }

        const {
            error: deleteError,
        } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (deleteError) {
            alert(
                `Unable to delete product: ${deleteError.message}`
            )
            return
        }

        window.location.reload()
    }

    /*
     * ADD CATEGORY
     */

    async function addCategory() {
        if (!newCategoryName.trim()) {
            return
        }

        const id = newCategoryName
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')

        const {
            error: categoryError,
        } = await supabase
            .from('categories')
            .insert({
                id,
                name: newCategoryName.trim(),
                sort_order:
                    categories.length + 1,
            })

        if (categoryError) {
            alert(
                `Unable to add category: ${categoryError.message}`
            )
            return
        }

        setNewCategoryName('')

        window.location.reload()
    }

    /*
     * DELETE CATEGORY
     */

    async function deleteCategory(id) {
        if (
            !confirm(
                'Delete this category? Products in it will keep their category tag but it will no longer appear as a filter.'
            )
        ) {
            return
        }

        const {
            error: categoryError,
        } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (categoryError) {
            alert(
                `Unable to delete category: ${categoryError.message}`
            )
            return
        }

        window.location.reload()
    }

    /*
     * ADD COUPON
     */

    async function addCoupon() {
        if (
            !couponForm.code ||
            !couponForm.percent_off
        ) {
            return
        }

        const {
            error: couponError,
        } = await supabase
            .from('coupons')
            .insert({
                code: couponForm.code
                    .trim()
                    .toUpperCase(),
                percent_off: Number(
                    couponForm.percent_off
                ),
                active: true,
            })

        if (couponError) {
            alert(
                `Unable to create discount code: ${couponError.message}`
            )
            return
        }

        setCouponForm({
            code: '',
            percent_off: '',
            active: true,
        })

        const {
            data,
        } = await supabase
            .from('coupons')
            .select('*')
            .order('code')

        setCoupons(data || [])
    }

    /*
     * TOGGLE COUPON
     */

    async function toggleCoupon(
        id,
        active
    ) {
        const {
            error: couponError,
        } = await supabase
            .from('coupons')
            .update({
                active: !active,
            })
            .eq('id', id)

        if (couponError) {
            alert(
                `Unable to update discount code: ${couponError.message}`
            )
            return
        }

        const {
            data,
        } = await supabase
            .from('coupons')
            .select('*')
            .order('code')

        setCoupons(data || [])
    }

    /*
     * DELETE COUPON
     */

    async function deleteCoupon(id) {
        if (
            !confirm(
                'Delete this discount code?'
            )
        ) {
            return
        }

        const {
            error: couponError,
        } = await supabase
            .from('coupons')
            .delete()
            .eq('id', id)

        if (couponError) {
            alert(
                `Unable to delete discount code: ${couponError.message}`
            )
            return
        }

        const {
            data,
        } = await supabase
            .from('coupons')
            .select('*')
            .order('code')

        setCoupons(data || [])
    }

    /*
     * COLLECTION PRODUCT SELECTION
     */

    function toggleProductInCollection(
        productId
    ) {
        setCollectionForm((prev) => {
            const id = String(productId)

            const existingIds = (
                prev.product_ids || []
            ).map((p) => String(p))

            const exists =
                existingIds.includes(id)

            return {
                ...prev,
                product_ids: exists
                    ? existingIds.filter(
                        (p) => p !== id
                    )
                    : [
                        ...existingIds,
                        id,
                    ],
            }
        })
    }

    /*
     * SAVE COLLECTION
     */

    async function saveCollection() {
        if (
            !collectionForm.name.trim()
        ) {
            return
        }

        const slug =
            collectionForm.slug.trim() ||
            collectionForm.name
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '-')

        const payload = {
            ...collectionForm,
            name:
                collectionForm.name.trim(),
            slug,
            product_ids: (
                collectionForm.product_ids ||
                []
            ).map((id) =>
                String(id)
            ),
        }

        let result

        if (editingCollection) {
            result = await supabase
                .from('collections')
                .update(payload)
                .eq(
                    'id',
                    editingCollection
                )
        } else {
            result = await supabase
                .from('collections')
                .insert(payload)
        }

        if (result.error) {
            alert(
                `Unable to save collection: ${result.error.message}`
            )
            return
        }

        setCollectionForm({
            name: '',
            slug: '',
            description: '',
            image: '',
            product_ids: [],
        })

        setEditingCollection(null)

        refetchCollections()
    }

    /*
     * EDIT COLLECTION
     */

    function startEditCollection(
        col
    ) {
        setEditingCollection(col.id)

        setCollectionForm({
            name: col.name || '',
            slug: col.slug || '',
            description:
                col.description || '',
            image: col.image || '',
            product_ids: (
                col.product_ids || []
            ).map((id) =>
                String(id)
            ),
        })

        setTab('collections')
    }

    /*
     * RESET COLLECTION
     */

    function resetCollectionForm() {
        setEditingCollection(null)

        setCollectionForm({
            name: '',
            slug: '',
            description: '',
            image: '',
            product_ids: [],
        })
    }

    /*
     * DELETE COLLECTION
     */

    async function deleteCollection(
        id
    ) {
        if (
            !confirm(
                'Delete this collection?'
            )
        ) {
            return
        }

        const {
            error: collectionError,
        } = await supabase
            .from('collections')
            .delete()
            .eq('id', id)

        if (collectionError) {
            alert(
                `Unable to delete collection: ${collectionError.message}`
            )
            return
        }

        refetchCollections()

        if (
            editingCollection === id
        ) {
            resetCollectionForm()
        }
    }

    /*
     * MARK MESSAGE READ
     */

    async function markRead(id) {
        const {
            error: messageError,
        } = await supabase
            .from('contact_messages')
            .update({
                read: true,
            })
            .eq('id', id)

        if (messageError) {
            alert(
                `Unable to mark message as read: ${messageError.message}`
            )
            return
        }

        setMessages((prev) =>
            prev.map((m) =>
                m.id === id
                    ? {
                        ...m,
                        read: true,
                    }
                    : m
            )
        )
    }

    /*
     * TAB BUTTON STYLE
     */

    const tabButtonClass = (
        tabName
    ) =>
        `group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-sans uppercase tracking-wide border transition-all duration-300 whitespace-nowrap ${
            tab === tabName
                ? 'bg-gold text-espresso border-gold shadow-[0_0_24px_rgba(212,175,55,0.18)]'
                : 'border-gold/30 text-espresso dark:text-cream hover:border-gold/60 hover:bg-gold/5'
        }`

    return (
        <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-12 px-6">
            <SEO
                title="Admin"
                description="Victorious Concept admin dashboard."
            />

            <div className="max-w-5xl mx-auto">

                {/* ADMIN HEADER */}

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">
                            Victorious Concept
                        </p>

                        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream">
                            Admin Dashboard
                        </h1>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-gold/10 rounded-full px-4 py-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />

                        <span className="font-sans text-xs text-espresso dark:text-cream">
                            Live
                        </span>
                    </div>
                </div>

                {/* TABS */}

                <div className="flex gap-2 mb-10 overflow-x-auto pb-2">

                    <button
                        onClick={() =>
                            setTab(
                                'products'
                            )
                        }
                        className={tabButtonClass(
                            'products'
                        )}
                    >
                        <Package className="w-3.5 h-3.5" />
                        Products
                    </button>

                    <button
                        onClick={() =>
                            setTab(
                                'orders'
                            )
                        }
                        className={tabButtonClass(
                            'orders'
                        )}
                    >
                        <ClipboardList className="w-3.5 h-3.5" />
                        Orders ({orders.length})
                    </button>

                    <button
                        onClick={() =>
                            setTab(
                                'content'
                            )
                        }
                        className={tabButtonClass(
                            'content'
                        )}
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Homepage
                    </button>

                    <button
                        onClick={() =>
                            setTab(
                                'categories'
                            )
                        }
                        className={tabButtonClass(
                            'categories'
                        )}
                    >
                        <Tags className="w-3.5 h-3.5" />
                        Categories
                    </button>

                    <button
                        onClick={() =>
                            setTab(
                                'collections'
                            )
                        }
                        className={tabButtonClass(
                            'collections'
                        )}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        Collections
                    </button>

                    {/* MESSAGES */}

                    <button
                        onClick={() =>
                            setTab(
                                'messages'
                            )
                        }
                        className={tabButtonClass(
                            'messages'
                        )}
                    >
                        <Mail className="w-3.5 h-3.5" />

                        Messages

                        {unreadMessages >
                            0 && (
                                <span className="ml-1">
                                    (
                                    {
                                        unreadMessages
                                    }
                                    )
                                </span>
                            )}
                    </button>

                    {/* CUSTOMERS */}

                    <button
                        onClick={() =>
                            setTab(
                                'customers'
                            )
                        }
                        className={tabButtonClass(
                            'customers'
                        )}
                    >
                        <Users className="w-3.5 h-3.5" />
                        Customers
                    </button>

                    {/* DISCOUNTS */}

                    <button
                        onClick={() =>
                            setTab(
                                'discounts'
                            )
                        }
                        className={tabButtonClass(
                            'discounts'
                        )}
                    >
                        <Percent className="w-3.5 h-3.5" />
                        Discounts
                    </button>

                    {/* ANALYTICS */}

                    <button
                        onClick={() =>
                            setTab(
                                'analytics'
                            )
                        }
                        className={tabButtonClass(
                            'analytics'
                        )}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Analytics
                    </button>

                </div>

                {/* =====================================================
                    ANALYTICS
                ===================================================== */}

                {tab === 'analytics' &&
                    (() => {
                        const totalRevenue =
                            orders.reduce(
                                (
                                    sum,
                                    o
                                ) =>
                                    sum +
                                    (Number(
                                        o.total
                                    ) || 0),
                                0
                            )

                        const totalOrders =
                            orders.length

                        const lowStock =
                            products.filter(
                                (p) =>
                                    p.stock >
                                    0 &&
                                    p.stock <=
                                    2
                            )

                        const outOfStock =
                            products.filter(
                                (p) =>
                                    p.stock <=
                                    0
                            )

                        const avgOrderValue =
                            totalOrders >
                            0
                                ? Math.round(
                                    totalRevenue /
                                    totalOrders
                                )
                                : 0

                        return (
                            <div className="flex flex-col gap-8">

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                                    <div className="relative overflow-hidden bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-5 border border-gold/10">
                                        <DollarSign className="w-5 h-5 text-gold mb-3" />

                                        <p className="font-display italic font-semibold text-2xl text-espresso dark:text-cream">
                                            {formatPrice(
                                                totalRevenue
                                            )}
                                        </p>

                                        <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">
                                            Total Revenue
                                        </p>
                                    </div>

                                    <div className="relative overflow-hidden bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-5 border border-gold/10">
                                        <BagIcon className="w-5 h-5 text-gold mb-3" />

                                        <p className="font-display italic font-semibold text-2xl text-espresso dark:text-cream">
                                            {
                                                totalOrders
                                            }
                                        </p>

                                        <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">
                                            Total Orders
                                        </p>
                                    </div>

                                    <div className="relative overflow-hidden bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-5 border border-gold/10">
                                        <TrendingUp className="w-5 h-5 text-gold mb-3" />

                                        <p className="font-display italic font-semibold text-2xl text-espresso dark:text-cream">
                                            {formatPrice(
                                                avgOrderValue
                                            )}
                                        </p>

                                        <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">
                                            Avg Order Value
                                        </p>
                                    </div>

                                    <div className="relative overflow-hidden bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-5 border border-gold/10">
                                        <AlertTriangle className="w-5 h-5 text-gold mb-3" />

                                        <p className="font-display italic font-semibold text-2xl text-espresso dark:text-cream">
                                            {
                                                lowStock.length +
                                                outOfStock.length
                                            }
                                        </p>

                                        <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">
                                            Stock Alerts
                                        </p>
                                    </div>

                                </div>

                                {(lowStock.length >
                                    0 ||
                                    outOfStock.length >
                                    0) && (
                                    <div>
                                        <h3 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">
                                            Needs Attention
                                        </h3>

                                        <div className="flex flex-col gap-2">

                                            {outOfStock.map(
                                                (p) => (
                                                    <div
                                                        key={
                                                            p.id
                                                        }
                                                        className="flex justify-between items-center bg-red-500/5 rounded-xl px-4 py-3"
                                                    >
                                                        <span className="font-sans text-sm text-espresso dark:text-cream">
                                                            {
                                                                p.name
                                                            }
                                                        </span>

                                                        <span className="font-sans text-xs text-red-500">
                                                            Out of stock
                                                        </span>
                                                    </div>
                                                )
                                            )}

                                            {lowStock.map(
                                                (p) => (
                                                    <div
                                                        key={
                                                            p.id
                                                        }
                                                        className="flex justify-between items-center bg-gold/10 rounded-xl px-4 py-3"
                                                    >
                                                        <span className="font-sans text-sm text-espresso dark:text-cream">
                                                            {
                                                                p.name
                                                            }
                                                        </span>

                                                        <span className="font-sans text-xs text-gold">
                                                            Only{' '}
                                                            {
                                                                p.stock
                                                            }{' '}
                                                            left
                                                        </span>
                                                    </div>
                                                )
                                            )}

                                        </div>
                                    </div>
                                )}

                            </div>
                        )
                    })()}

                {/* =====================================================
                    MESSAGES
                ===================================================== */}

                {tab === 'messages' && (
                    <div className="max-w-2xl flex flex-col gap-4">

                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="font-sans text-sm uppercase tracking-widest text-gold">
                                    Customer Messages
                                </h2>

                                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mt-1">
                                    {messages.length}{' '}
                                    message
                                    {messages.length !==
                                    1
                                        ? 's'
                                        : ''}{' '}
                                    ·{' '}
                                    {
                                        unreadMessages
                                    }{' '}
                                    unread
                                </p>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <Mail className="w-4 h-4 text-gold" />
                            </div>
                        </div>

                        {messages.length ===
                        0 ? (
                            <div className="border border-gold/10 rounded-2xl p-8 text-center">

                                <Mail className="w-8 h-8 text-gold mx-auto mb-3" />

                                <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
                                    No messages yet.
                                </p>

                                <p className="font-sans text-xs text-espresso/40 dark:text-cream/40 mt-1">
                                    Customer contact form submissions will appear here.
                                </p>

                            </div>
                        ) : (
                            messages.map(
                                (m) => (
                                    <div
                                        key={
                                            m.id
                                        }
                                        className={`border rounded-2xl p-5 transition-colors ${
                                            m.read
                                                ? 'border-gold/10'
                                                : 'border-gold/40 bg-gold/5'
                                        }`}
                                    >

                                        <div className="flex justify-between items-start gap-4 mb-3">

                                            <div className="min-w-0">
                                                <p className="font-sans text-sm font-medium text-espresso dark:text-cream">
                                                    {m.name ||
                                                        'Customer'}
                                                </p>

                                                <p className="font-sans text-xs text-gold mt-1 break-all">
                                                    {
                                                        m.email
                                                    }
                                                </p>

                                                {m.created_at && (
                                                    <p className="font-sans text-[11px] text-espresso/40 dark:text-cream/40 mt-1">
                                                        {new Date(
                                                            m.created_at
                                                        ).toLocaleString(
                                                            'en-NG',
                                                            {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                            }
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            {!m.read && (
                                                <button
                                                    onClick={() =>
                                                        markRead(
                                                            m.id
                                                        )
                                                    }
                                                    className="font-sans text-xs text-gold hover:underline whitespace-nowrap"
                                                >
                                                    Mark read
                                                </button>
                                            )}

                                        </div>

                                        <div className="border-t border-gold/10 pt-3">
                                            <p className="font-sans text-sm leading-6 text-espresso/70 dark:text-cream/70 whitespace-pre-wrap">
                                                {
                                                    m.message
                                                }
                                            </p>
                                        </div>

                                    </div>
                                )
                            )
                        )}

                    </div>
                )}

                {/* =====================================================
                    CUSTOMERS
                ===================================================== */}

                {tab === 'customers' && (
                    <div className="max-w-2xl">

                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="font-sans text-sm uppercase tracking-widest text-gold">
                                    Customers
                                </h2>

                                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mt-1">
                                    {
                                        customersList.length
                                    }{' '}
                                    unique customer
                                    {customersList.length !==
                                    1
                                        ? 's'
                                        : ''}{' '}
                                    from real orders
                                </p>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <Users className="w-4 h-4 text-gold" />
                            </div>
                        </div>

                        {customersList.length ===
                        0 ? (
                            <div className="border border-gold/10 rounded-2xl p-8 text-center">

                                <Users className="w-8 h-8 text-gold mx-auto mb-3" />

                                <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
                                    No customers yet.
                                </p>

                                <p className="font-sans text-xs text-espresso/40 dark:text-cream/40 mt-1">
                                    Real customer data will appear here once orders start coming in.
                                </p>

                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">

                                {customersList.map(
                                    (c) => (
                                        <div
                                            key={
                                                c.phone
                                            }
                                            className="flex items-center gap-4 border border-gold/20 rounded-xl p-4"
                                        >

                                            <div className="flex-1 min-w-0">
                                                <p className="font-sans text-sm text-espresso dark:text-cream truncate">
                                                    {c.name ||
                                                        'Customer'}
                                                </p>

                                                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 truncate">
                                                    {
                                                        c.phone
                                                    }
                                                </p>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">
                                                    {
                                                        c.orderCount
                                                    }{' '}
                                                    order
                                                    {c.orderCount >
                                                    1
                                                        ? 's'
                                                        : ''}
                                                </p>

                                                <p className="font-display italic font-semibold text-espresso dark:text-cream">
                                                    {formatPrice(
                                                        c.totalSpent
                                                    )}
                                                </p>
                                            </div>

                                            <a
                                                href={`https://wa.me/${c.phone.replace(
                                                    /\D/g,
                                                    ''
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="Message on WhatsApp"
                                                className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold/20 transition-colors flex-shrink-0"
                                            >
                                                <MessageCircle className="w-4 h-4 text-gold" />
                                            </a>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                    </div>
                )}

                {/* =====================================================
                    DISCOUNTS
                ===================================================== */}

                {tab === 'discounts' && (
                    <div className="max-w-lg flex flex-col gap-8">

                        <div className="bg-gold/5 rounded-2xl p-6">

                            <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">
                                New Discount Code
                            </h2>

                            <div className="flex gap-3 mb-4">

                                <input
                                    type="text"
                                    placeholder="CODE (e.g. WELCOME10)"
                                    value={
                                        couponForm.code
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setCouponForm(
                                            {
                                                ...couponForm,
                                                code: e
                                                    .target
                                                    .value,
                                            }
                                        )
                                    }
                                    className="flex-1 bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />

                                <input
                                    type="number"
                                    placeholder="% off"
                                    min="1"
                                    max="100"
                                    value={
                                        couponForm.percent_off
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setCouponForm(
                                            {
                                                ...couponForm,
                                                percent_off:
                                                    e
                                                        .target
                                                        .value,
                                            }
                                        )
                                    }
                                    className="w-24 bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />

                            </div>

                            <button
                                onClick={
                                    addCoupon
                                }
                                className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors"
                            >
                                Create Code
                            </button>

                        </div>

                        <div>

                            <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">
                                All Codes
                            </h2>

                            <div className="flex flex-col gap-2">

                                {coupons.map(
                                    (c) => (
                                        <div
                                            key={
                                                c.id
                                            }
                                            className="flex items-center gap-3 border border-gold/20 rounded-xl p-4"
                                        >

                                            <span className="flex-1 font-sans text-sm text-espresso dark:text-cream">
                                                {
                                                    c.code
                                                }{' '}
                                                <span className="text-gold">
                                                    (
                                                    {
                                                        c.percent_off
                                                    }
                                                    % off)
                                                </span>
                                            </span>

                                            <button
                                                onClick={() =>
                                                    toggleCoupon(
                                                        c.id,
                                                        c.active
                                                    )
                                                }
                                                className={`text-xs font-sans px-3 py-1 rounded-full ${
                                                    c.active
                                                        ? 'bg-green-500/10 text-green-500'
                                                        : 'bg-gold/10 text-espresso/50 dark:text-cream/50'
                                                }`}
                                            >
                                                {c.active
                                                    ? 'Active'
                                                    : 'Disabled'}
                                            </button>

                                            <button
                                                onClick={() =>
                                                    deleteCoupon(
                                                        c.id
                                                    )
                                                }
                                                aria-label="Delete code"
                                            >
                                                <Trash2 className="w-4 h-4 text-espresso/40 dark:text-cream/40 hover:text-red-500" />
                                            </button>

                                        </div>
                                    )
                                )}

                                {coupons.length ===
                                    0 && (
                                    <div className="border border-gold/10 rounded-xl p-6 text-center">

                                        <Percent className="w-6 h-6 text-gold mx-auto mb-2" />

                                        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
                                            No discount codes yet.
                                        </p>

                                    </div>
                                )}

                            </div>

                        </div>

                    </div>
                )}

                {/* =====================================================
                    COLLECTIONS
                ===================================================== */}

                {tab === 'collections' && (
                    <div className="max-w-2xl flex flex-col gap-8">

                        <div className="bg-gold/5 rounded-2xl p-6">

                            <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">
                                {editingCollection
                                    ? 'Edit Collection'
                                    : 'New Collection'}
                            </h2>

                            <div className="flex flex-col gap-3 mb-4">

                                <input
                                    type="text"
                                    placeholder="Collection name (e.g. Gift Ideas)"
                                    value={
                                        collectionForm.name
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setCollectionForm(
                                            {
                                                ...collectionForm,
                                                name: e
                                                    .target
                                                    .value,
                                            }
                                        )
                                    }
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />

                                <input
                                    type="text"
                                    placeholder="Slug (optional, e.g. gift-ideas)"
                                    value={
                                        collectionForm.slug
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setCollectionForm(
                                            {
                                                ...collectionForm,
                                                slug: e
                                                    .target
                                                    .value,
                                            }
                                        )
                                    }
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />

                                <textarea
                                    placeholder="Short description"
                                    rows={2}
                                    value={
                                        collectionForm.description
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setCollectionForm(
                                            {
                                                ...collectionForm,
                                                description:
                                                    e
                                                        .target
                                                        .value,
                                            }
                                        )
                                    }
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none"
                                />

                                <input
                                    type="text"
                                    placeholder="Cover image URL (optional)"
                                    value={
                                        collectionForm.image
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setCollectionForm(
                                            {
                                                ...collectionForm,
                                                image: e
                                                    .target
                                                    .value,
                                            }
                                        )
                                    }
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />

                            </div>

                            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">
                                Select Products
                            </p>

                            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">

                                {products.length ===
                                0 ? (
                                    <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 py-4">
                                        No products available yet.
                                    </p>
                                ) : (
                                    products.map(
                                        (p) => {
                                            const selected =
                                                (
                                                    collectionForm.product_ids ||
                                                    []
                                                )
                                                    .map(
                                                        (
                                                            id
                                                        ) =>
                                                            String(
                                                                id
                                                            )
                                                    )
                                                    .includes(
                                                        String(
                                                            p.id
                                                        )
                                                    )

                                            return (
                                                <label
                                                    key={
                                                        p.id
                                                    }
                                                    className="flex items-center gap-3 border border-gold/10 rounded-lg p-2 cursor-pointer hover:border-gold/30 transition-colors"
                                                >

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            selected
                                                        }
                                                        onChange={() =>
                                                            toggleProductInCollection(
                                                                p.id
                                                            )
                                                        }
                                                    />

                                                    <img
                                                        src={
                                                            p.image
                                                        }
                                                        alt={
                                                            p.name
                                                        }
                                                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                                                    />

                                                    <span className="font-sans text-xs text-espresso dark:text-cream truncate">
                                                        {
                                                            p.name
                                                        }
                                                    </span>

                                                </label>
                                            )
                                        }
                                    )
                                )}

                            </div>

                            <div className="flex items-center gap-3">

                                <button
                                    onClick={
                                        saveCollection
                                    }
                                    disabled={
                                        !collectionForm.name.trim()
                                    }
                                    className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
                                >
                                    {editingCollection
                                        ? 'Save Changes'
                                        : 'Create Collection'}
                                </button>

                                {editingCollection && (
                                    <button
                                        onClick={
                                            resetCollectionForm
                                        }
                                        className="font-sans text-sm text-espresso/60 dark:text-cream/60 hover:text-gold"
                                    >
                                        Cancel
                                    </button>
                                )}

                            </div>

                        </div>

                        <div>

                            <div className="flex items-center justify-between mb-4">

                                <h2 className="font-sans text-sm uppercase tracking-widest text-gold">
                                    Existing Collections
                                </h2>

                                <span className="font-sans text-xs text-espresso/40 dark:text-cream/40">
                                    {
                                        collections.length
                                    }{' '}
                                    total
                                </span>

                            </div>

                            {collections.length ===
                            0 ? (
                                <div className="border border-gold/10 rounded-2xl p-8 text-center">

                                    <Layers className="w-8 h-8 text-gold mx-auto mb-3" />

                                    <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
                                        No collections created yet.
                                    </p>

                                    <p className="font-sans text-xs text-espresso/40 dark:text-cream/40 mt-1">
                                        Create your first curated product collection above.
                                    </p>

                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">

                                    {collections.map(
                                        (
                                            col
                                        ) => (
                                            <div
                                                key={
                                                    col.id
                                                }
                                                className="flex items-center gap-3 border border-gold/20 rounded-xl p-4"
                                            >

                                                {col.image ? (
                                                    <img
                                                        src={
                                                            col.image
                                                        }
                                                        alt={
                                                            col.name
                                                        }
                                                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                                        <Layers className="w-4 h-4 text-gold" />
                                                    </div>
                                                )}

                                                <span className="flex-1 font-sans text-sm text-espresso dark:text-cream min-w-0 truncate">

                                                    {
                                                        col.name
                                                    }

                                                    <span className="text-espresso/40 dark:text-cream/40 ml-1">
                                                        (
                                                        {
                                                            col.product_ids?.length ||
                                                            0
                                                        }{' '}
                                                        items)
                                                    </span>

                                                </span>

                                                <button
                                                    onClick={() =>
                                                        startEditCollection(
                                                            col
                                                        )
                                                    }
                                                    aria-label="Edit collection"
                                                >
                                                    <Pencil className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-gold" />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteCollection(
                                                            col.id
                                                        )
                                                    }
                                                    aria-label="Delete collection"
                                                >
                                                    <Trash2 className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-red-500" />
                                                </button>

                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                        </div>

                    </div>
                )}

                {/* =====================================================
                    HOMEPAGE
                ===================================================== */}

                {tab === 'content' &&
                    heroForm && (
                        <div className="max-w-lg flex flex-col gap-4">

                            <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">
                                Hero Section
                            </h2>

                            <input
                                type="text"
                                placeholder="Small label (e.g. The Next Chapter)"
                                value={
                                    heroForm.label
                                }
                                onChange={(
                                    e
                                ) =>
                                    setHeroForm(
                                        {
                                            ...heroForm,
                                            label: e
                                                .target
                                                .value,
                                        }
                                    )
                                }
                                className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                            />

                            <textarea
                                placeholder="Headline"
                                rows={2}
                                value={
                                    heroForm.headline
                                }
                                onChange={(
                                    e
                                ) =>
                                    setHeroForm(
                                        {
                                            ...heroForm,
                                            headline:
                                                e
                                                    .target
                                                    .value,
                                        }
                                    )
                                }
                                className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none"
                            />

                            <textarea
                                placeholder="Supporting text"
                                rows={2}
                                value={
                                    heroForm.subtext
                                }
                                onChange={(
                                    e
                                ) =>
                                    setHeroForm(
                                        {
                                            ...heroForm,
                                            subtext:
                                                e
                                                    .target
                                                    .value,
                                        }
                                    )
                                }
                                className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none"
                            />

                            <input
                                type="text"
                                placeholder="Backdrop image URL"
                                value={
                                    heroForm.backdropImage
                                }
                                onChange={(
                                    e
                                ) =>
                                    setHeroForm(
                                        {
                                            ...heroForm,
                                            backdropImage:
                                                e
                                                    .target
                                                    .value,
                                        }
                                    )
                                }
                                className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                            />

                            <button
                                onClick={() =>
                                    updateHero(
                                        heroForm
                                    )
                                }
                                className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors self-start"
                            >
                                Save Homepage Hero
                            </button>

                        </div>
                    )}

                {/* =====================================================
                    CATEGORIES
                ===================================================== */}

                {tab === 'categories' && (
                    <div className="max-w-lg">

                        <div className="flex gap-2 mb-8">

                            <input
                                type="text"
                                placeholder="New category name (e.g. Sale, New In)"
                                value={
                                    newCategoryName
                                }
                                onChange={(
                                    e
                                ) =>
                                    setNewCategoryName(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="flex-1 bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                            />

                            <button
                                onClick={
                                    addCategory
                                }
                                className="flex items-center gap-2 bg-gold text-espresso font-sans font-medium px-5 rounded-full hover:bg-gold-light transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>

                        </div>

                        <div className="flex flex-col gap-3">

                            {categories.map(
                                (cat) => (
                                    <div
                                        key={
                                            cat.id
                                        }
                                        className="border border-gold/20 rounded-xl p-4"
                                    >

                                        <div className="flex items-center gap-3 mb-2">

                                            <TagIcon className="w-4 h-4 text-gold flex-shrink-0" />

                                            <span className="flex-1 font-sans text-sm text-espresso dark:text-cream">
                                                {
                                                    cat.name
                                                }
                                            </span>

                                            <button
                                                onClick={() =>
                                                    deleteCategory(
                                                        cat.id
                                                    )
                                                }
                                                aria-label="Delete category"
                                            >
                                                <Trash2 className="w-4 h-4 text-espresso/40 dark:text-cream/40 hover:text-red-500" />
                                            </button>

                                        </div>

                                        <textarea
                                            placeholder="Short introduction for this category page (optional)"
                                            rows={2}
                                            defaultValue={
                                                cat.description ||
                                                ''
                                            }
                                            onBlur={async (
                                                e
                                            ) => {
                                                await supabase
                                                    .from(
                                                        'categories'
                                                    )
                                                    .update(
                                                        {
                                                            description:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                    .eq(
                                                        'id',
                                                        cat.id
                                                    )
                                            }}
                                            className="w-full bg-transparent border border-gold/20 rounded-lg px-3 py-2 font-sans text-xs text-espresso dark:text-cream outline-none focus:border-gold resize-none"
                                        />

                                    </div>
                                )
                            )}

                        </div>

                    </div>
                )}

                {/* =====================================================
                    ORDERS
                ===================================================== */}

                {tab === 'orders' && (
                    <div className="flex flex-col gap-4">

                        {ordersLoading ? (
                            <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
                                Loading orders...
                            </p>
                        ) : orders.length ===
                        0 ? (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">

                                <Package className="w-8 h-8 text-gold" />

                                <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
                                    No orders yet.
                                </p>

                            </div>
                        ) : (
                            orders.map(
                                (
                                    order
                                ) => (
                                    <div
                                        key={
                                            order.id
                                        }
                                        className="border border-gold/20 rounded-2xl p-5"
                                    >

                                        <div className="flex flex-wrap justify-between gap-2 mb-3">

                                            <span className="font-sans text-sm font-medium text-espresso dark:text-cream">
                                                {
                                                    order.order_number
                                                }
                                            </span>

                                            <span className="font-sans text-xs text-espresso/50 dark:text-cream/50">
                                                {new Date(
                                                    order.created_at
                                                ).toLocaleDateString(
                                                    'en-NG',
                                                    {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    }
                                                )}
                                            </span>

                                        </div>

                                        <select
                                            value={
                                                order.status ||
                                                'pending'
                                            }
                                            onChange={async (
                                                e
                                            ) => {
                                                const newStatus =
                                                    e
                                                        .target
                                                        .value

                                                const {
                                                    error: statusError,
                                                } = await supabase
                                                    .from(
                                                        'orders'
                                                    )
                                                    .update(
                                                        {
                                                            status: newStatus,
                                                        }
                                                    )
                                                    .eq(
                                                        'id',
                                                        order.id
                                                    )

                                                if (
                                                    statusError
                                                ) {
                                                    alert(
                                                        statusError.message
                                                    )
                                                    return
                                                }

                                                setOrders(
                                                    (
                                                        prev
                                                    ) =>
                                                        prev.map(
                                                            (
                                                                o
                                                            ) =>
                                                                o.id ===
                                                                order.id
                                                                    ? {
                                                                        ...o,
                                                                        status: newStatus,
                                                                    }
                                                                    : o
                                                        )
                                                )
                                            }}
                                            className="bg-transparent border border-gold/30 rounded-full px-3 py-1 font-sans text-xs text-espresso dark:text-cream outline-none focus:border-gold mb-3"
                                        >

                                            <option value="pending">
                                                Pending
                                            </option>

                                            <option value="confirmed">
                                                Confirmed
                                            </option>

                                            <option value="shipped">
                                                Shipped
                                            </option>

                                            <option value="delivered">
                                                Delivered
                                            </option>

                                        </select>

                                        <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 mb-1">
                                            {
                                                order.customer_name
                                            }{' '}
                                            ·{' '}
                                            {
                                                order.customer_phone
                                            }
                                        </p>

                                        <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-3">
                                            {
                                                order.customer_address
                                            }
                                        </p>

                                        <div className="flex flex-col gap-1 mb-3 border-t border-gold/10 pt-3">

                                            {order.items?.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <div
                                                        key={
                                                            item.id ||
                                                            index
                                                        }
                                                        className="flex justify-between font-sans text-xs text-espresso/60 dark:text-cream/60"
                                                    >

                                                        <span>
                                                            {
                                                                item.name
                                                            }{' '}
                                                            x{' '}
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>

                                                        <span>
                                                            {formatPrice(
                                                                Number(
                                                                    item.price
                                                                ) *
                                                                Number(
                                                                    item.quantity
                                                                )
                                                            )}
                                                        </span>

                                                    </div>
                                                )
                                            )}

                                        </div>

                                        <div className="flex justify-between font-display italic font-semibold text-espresso dark:text-cream">

                                            <span>
                                                Total
                                            </span>

                                            <span>
                                                {formatPrice(
                                                    order.total
                                                )}
                                            </span>

                                        </div>

                                    </div>
                                )
                            )
                        )}

                    </div>
                )}

                {/* =====================================================
                    PRODUCTS
                ===================================================== */}

                {tab === 'products' && (
                    <>

                        <div className="bg-gold/5 rounded-2xl p-6 mb-12">

                            <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">
                                {editing
                                    ? 'Edit Product'
                                    : 'Add New Product'}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                                <input
                                    type="text"
                                    placeholder="Product name"
                                    value={
                                        form.name
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        update(
                                            'name',
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />

                                <input
                                    type="number"
                                    placeholder="Price (Naira)"
                                    value={
                                        form.price
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        update(
                                            'price',
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />

                                <input
                                    type="number"
                                    placeholder="Stock quantity"
                                    value={
                                        form.stock
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        update(
                                            'stock',
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />

                                <select
                                    value={
                                        form.status
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        update(
                                            'status',
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                >

                                    <option value="active">
                                        Active (visible, normal sale)
                                    </option>

                                    <option value="preorder">
                                        Preorder (visible, orderable even at 0 stock)
                                    </option>

                                    <option value="hidden">
                                        Hidden (not shown anywhere on the site)
                                    </option>

                                </select>

                                <select
                                    value={
                                        form.category
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        update(
                                            'category',
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                >

                                    {categories.map(
                                        (
                                            c
                                        ) => (
                                            <option
                                                key={
                                                    c.id
                                                }
                                                value={
                                                    c.id
                                                }
                                            >
                                                {
                                                    c.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                                <input
                                    type="text"
                                    placeholder="Main Image URL"
                                    value={
                                        form.image
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        update(
                                            'image',
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                                />

                            </div>

                            {/* IMAGE URLS */}

                            <textarea
                                placeholder="All image URLs, separated by commas (leave blank to just use the main image above)"
                                rows={2}
                                value={
                                    form.imagesText
                                }
                                onChange={(
                                    e
                                ) =>
                                    update(
                                        'imagesText',
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="w-full bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none mb-3"
                            />

                            {/* VIDEO URL */}

                            <input
                                type="text"
                                placeholder="Video URL (optional, .mp4)"
                                value={
                                    form.video_url ||
                                    ''
                                }
                                onChange={(
                                    e
                                ) =>
                                    update(
                                        'video_url',
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="w-full bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold mb-4"
                            />

                            {/* IMAGE UPLOAD */}

                            <label className="flex items-center gap-2 justify-center border-2 border-dashed border-gold/30 rounded-xl px-4 py-4 cursor-pointer hover:border-gold transition-colors mb-4">

                                <Upload className="w-4 h-4 text-gold" />

                                <span className="font-sans text-sm text-espresso dark:text-cream">
                                    Or upload photos directly from your phone or computer
                                </span>

                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={
                                        handleFileUpload
                                    }
                                    className="hidden"
                                />

                            </label>

                            {/* FLAGS */}

                            <div className="flex gap-6 mb-4">

                                <label className="flex items-center gap-2 font-sans text-sm text-espresso dark:text-cream">

                                    <input
                                        type="checkbox"
                                        checked={
                                            form.is_new
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            update(
                                                'is_new',
                                                e
                                                    .target
                                                    .checked
                                            )
                                        }
                                    />

                                    New Arrival

                                </label>

                                <label className="flex items-center gap-2 font-sans text-sm text-espresso dark:text-cream">

                                    <input
                                        type="checkbox"
                                        checked={
                                            form.is_featured
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            update(
                                                'is_featured',
                                                e
                                                    .target
                                                    .checked
                                            )
                                        }
                                    />

                                    Featured

                                </label>

                            </div>

                            {/* SAVE */}

                            <div className="flex gap-3">

                                <button
                                    onClick={
                                        handleSave
                                    }
                                    disabled={
                                        saving ||
                                        !form.name.trim() ||
                                        !form.price
                                    }
                                    className="flex items-center gap-2 bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
                                >

                                    <Plus className="w-4 h-4" />

                                    {saving
                                        ? 'Saving...'
                                        : editing
                                            ? 'Save Changes'
                                            : 'Add Product'}

                                </button>

                                {editing && (
                                    <button
                                        onClick={
                                            resetForm
                                        }
                                        className="font-sans text-sm text-espresso/60 dark:text-cream/60 hover:text-gold"
                                    >
                                        Cancel
                                    </button>
                                )}

                            </div>

                        </div>

                        {/* PRODUCT LIST */}

                        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">
                            All Products (
                            {
                                products.length
                            }
                            )
                        </h2>

                        {loading ? (
                            <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
                                Loading...
                            </p>
                        ) : error ? (
                            <p className="font-sans text-sm text-red-500">
                                Unable to load products.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">

                                {products.map(
                                    (
                                        product
                                    ) => (
                                        <div
                                            key={
                                                product.id
                                            }
                                            className="flex items-center gap-4 border border-gold/20 rounded-xl p-4"
                                        >

                                            <img
                                                src={
                                                    product.image
                                                }
                                                alt={
                                                    product.name
                                                }
                                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                            />

                                            <div className="flex-1 min-w-0">

                                                <p className="font-sans text-sm text-espresso dark:text-cream truncate">
                                                    {
                                                        product.name
                                                    }
                                                </p>

                                                <p className="font-sans text-xs text-gold">

                                                    {formatPrice(
                                                        product.price
                                                    )}

                                                    {' · '}

                                                    {
                                                        product.category
                                                    }

                                                    {product.status &&
                                                        product.status !==
                                                        'active' && (
                                                            <span className="ml-2 uppercase tracking-wide text-[10px] opacity-70">
                                                                ·{' '}
                                                                {
                                                                    product.status
                                                                }
                                                            </span>
                                                        )}

                                                    {product.video_url && (
                                                        <span className="ml-2 uppercase tracking-wide text-[10px] opacity-70">
                                                            · video
                                                        </span>
                                                    )}

                                                </p>

                                            </div>

                                            <button
                                                onClick={() =>
                                                    startEdit(
                                                        product
                                                    )
                                                }
                                                aria-label="Edit"
                                            >
                                                <Pencil className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-gold" />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        product.id
                                                    )
                                                }
                                                aria-label="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-red-500" />
                                            </button>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                    </>
                )}

            </div>
        </section>
    )
}

export default Admin