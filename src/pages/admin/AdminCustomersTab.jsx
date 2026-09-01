import { formatPrice } from '../../utils/formatPrice'
import { MessageCircle } from 'lucide-react'

export default function AdminCustomersTab({ orders }) {
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

  return (
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
  )
}
