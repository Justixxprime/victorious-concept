import { formatPrice } from '../../utils/formatPrice'
import { DollarSign, Package, TrendingUp, AlertTriangle } from 'lucide-react'

export default function AdminAnalyticsTab({ products, orders }) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 2)
  const outOfStock = products.filter((p) => p.stock <= 0)
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  return (
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
  )
}
