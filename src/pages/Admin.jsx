import { useState, useEffect } from 'react'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useCollections } from '../hooks/useCollections'
import { supabase } from '../lib/supabaseClient'
import {
  Tags, LayoutDashboard, BarChart3, Percent, Users, Mail,
  Quote, Layers, Package, Truck, RotateCcw, Settings,
} from 'lucide-react'
import AdminProductsTab from './admin/AdminProductsTab'
import AdminOrdersTab from './admin/AdminOrdersTab'
import AdminCustomersTab from './admin/AdminCustomersTab'
import AdminCategoriesTab from './admin/AdminCategoriesTab'
import AdminCollectionsTab from './admin/AdminCollectionsTab'
import AdminDiscountsTab from './admin/AdminDiscountsTab'
import AdminShippingTab from './admin/AdminShippingTab'
import AdminReturnsTab from './admin/AdminReturnsTab'
import AdminMessagesTab from './admin/AdminMessagesTab'
import AdminTestimonialsTab from './admin/AdminTestimonialsTab'
import AdminContentTab from './admin/AdminContentTab'
import AdminBusinessTab from './admin/AdminBusinessTab'
import AdminAnalyticsTab from './admin/AdminAnalyticsTab'

function Admin() {
  const isAdmin = useIsAdmin()
  const { products, loading } = useProducts({ includeHidden: true })
  const { categories, refetch: refetchCategories } = useCategories()
  const { collections, refetch: refetchCollections } = useCollections()

  const [tab, setTab] = useState('products')

  // Orders, messages, and returns are fetched eagerly here (not lazily
  // per-tab) because their counts feed the always-visible tab badges below,
  // regardless of which tab is currently open.
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [returns, setReturns] = useState([])
  const [messages, setMessages] = useState([])

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
          This page is for the Victorious Concept team only
        </h1>
      </div>
    )
  }

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

        {tab === 'products' && <AdminProductsTab products={products} loading={loading} categories={categories} />}
        {tab === 'orders' && <AdminOrdersTab orders={orders} ordersLoading={ordersLoading} setOrders={setOrders} />}
        {tab === 'customers' && <AdminCustomersTab orders={orders} />}
        {tab === 'categories' && <AdminCategoriesTab categories={categories} refetchCategories={refetchCategories} />}
        {tab === 'collections' && <AdminCollectionsTab collections={collections} refetchCollections={refetchCollections} products={products} />}
        {tab === 'discounts' && <AdminDiscountsTab />}
        {tab === 'shipping' && <AdminShippingTab />}
        {tab === 'returns' && <AdminReturnsTab returns={returns} setReturns={setReturns} />}
        {tab === 'messages' && <AdminMessagesTab messages={messages} setMessages={setMessages} />}
        {tab === 'testimonials' && <AdminTestimonialsTab />}
        {tab === 'content' && <AdminContentTab />}
        {tab === 'business' && <AdminBusinessTab />}
        {tab === 'analytics' && <AdminAnalyticsTab products={products} orders={orders} />}
      </div>
    </section>
  )
}

export default Admin