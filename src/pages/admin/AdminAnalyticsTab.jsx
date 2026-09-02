import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice } from '../../utils/formatPrice'
import { DollarSign, Package, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react'

const GOLD = '#c58b52'
const ESPRESSO = '#3a2318'

function buildLastNDays(n, from) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export default function AdminAnalyticsTab({ products, orders }) {
  const [orderItems, setOrderItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  // Computed once per mount rather than inline during render, so this
  // doesn't count as an impure call on every re-render.
  const [now] = useState(() => new Date())

  useEffect(() => {
    async function fetchOrderItems() {
      // order_items only gets a row once a payment is actually confirmed
      // (see confirm_paid_order / confirm_manual_payment), so this
      // reflects real, paid sales — not abandoned-cart attempts.
      const { data } = await supabase.from('order_items').select('product_name, quantity, line_total, created_at')
      setOrderItems(data || [])
      setLoadingItems(false)
    }
    fetchOrderItems()
  }, [])

  const paidOrders = orders.filter((o) => o.payment_status === 'paid')
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 2)
  const outOfStock = products.filter((p) => p.stock <= 0)
  const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0

  // --- Revenue by day, last 14 days — only counts confirmed, paid orders ---
  const last14Days = buildLastNDays(14, now)
  const revenueByDay = last14Days.map((day) => {
    const dayRevenue = paidOrders
      .filter((o) => o.created_at?.slice(0, 10) === day)
      .reduce((sum, o) => sum + o.total, 0)
    return { day: day.slice(5), revenue: dayRevenue }
  })

  // --- Top products by real paid revenue ---
  const productTotals = {}
  for (const item of orderItems) {
    if (!productTotals[item.product_name]) {
      productTotals[item.product_name] = { name: item.product_name, quantity: 0, revenue: 0 }
    }
    productTotals[item.product_name].quantity += item.quantity
    productTotals[item.product_name].revenue += item.line_total
  }
  const topProducts = Object.values(productTotals)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // --- Checkout funnel: the only real, honest funnel this data supports.
  // There's no event tracking for product views or add-to-cart actions —
  // the only two hard signals that exist are "an order row got created"
  // and "that order later got paid". A richer funnel would need real
  // analytics events wired in first, not fabricated numbers here. ---
  const paidCount = paidOrders.length
  const conversionRate = totalOrders > 0 ? Math.round((paidCount / totalOrders) * 100) : 0

  // --- Abandoned checkouts: orders still unpaid after 24+ hours ---
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const abandoned = orders.filter(
    (o) => o.payment_status !== 'paid' && new Date(o.created_at) < oneDayAgo
  )

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-5 border border-gold/10">
          <DollarSign className="w-5 h-5 text-gold mb-3" />
          <p className="font-display italic font-semibold text-2xl text-espresso dark:text-cream">{formatPrice(totalRevenue)}</p>
          <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">Revenue (paid orders)</p>
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

      <div>
        <h3 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">Revenue, Last 14 Days</h3>
        <div className="h-56 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${ESPRESSO}15`} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: ESPRESSO, opacity: 0.5 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: ESPRESSO, opacity: 0.5 }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
              <Tooltip
                formatter={(value) => formatPrice(value)}
                contentStyle={{ background: '#fbf3e7', border: `1px solid ${GOLD}40`, borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">Top Products by Revenue</h3>
        {loadingItems ? (
          <p className="font-sans text-sm text-espresso/50 dark:text-cream/50">Loading...</p>
        ) : topProducts.length === 0 ? (
          <p className="font-sans text-sm text-espresso/50 dark:text-cream/50">No paid orders yet — this fills in once orders are confirmed.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 bg-gold/5 rounded-xl px-4 py-3">
                <span className="font-display italic text-gold text-sm w-5">{i + 1}</span>
                <span className="flex-1 font-sans text-sm text-espresso dark:text-cream">{p.name}</span>
                <span className="font-sans text-xs text-espresso/50 dark:text-cream/50">{p.quantity} sold</span>
                <span className="font-sans text-sm text-gold">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">Checkout Funnel</h3>
        <p className="font-sans text-xs text-espresso/40 dark:text-cream/40 mb-4">
          The only two real signals this data supports — order created, order paid. Product views and
          add-to-cart events aren't tracked server-side, so a fuller funnel isn't available yet.
        </p>
        <div className="flex items-center gap-4 bg-gold/5 rounded-2xl p-5">
          <div className="text-center">
            <p className="font-display italic font-semibold text-2xl text-espresso dark:text-cream">{totalOrders}</p>
            <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">Orders created</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gold flex-shrink-0" />
          <div className="text-center">
            <p className="font-display italic font-semibold text-2xl text-espresso dark:text-cream">{paidCount}</p>
            <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">Orders paid</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-display italic font-semibold text-2xl text-gold">{conversionRate}%</p>
            <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">Conversion</p>
          </div>
        </div>
      </div>

      {abandoned.length > 0 && (
        <div>
          <h3 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">
            Abandoned Checkouts ({abandoned.length})
          </h3>
          <p className="font-sans text-xs text-espresso/40 dark:text-cream/40 mb-3">
            Orders created more than 24 hours ago that still haven't been paid — worth a WhatsApp
            follow-up, from the Orders tab.
          </p>
          <div className="flex flex-col gap-2">
            {abandoned.slice(0, 5).map((o) => (
              <div key={o.id} className="flex justify-between items-center bg-red-500/5 rounded-xl px-4 py-3">
                <span className="font-sans text-sm text-espresso dark:text-cream">{o.order_number} · {o.customer_name}</span>
                <span className="font-sans text-xs text-red-500">{formatPrice(o.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
  )
}