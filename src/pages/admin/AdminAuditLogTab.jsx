import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice } from '../../utils/formatPrice'

const ACTION_LABELS = {
  order_status_changed: 'Order status changed',
  order_marked_paid: 'Order marked paid',
  order_payment_undone: 'Payment undone',
  order_deleted: 'Order deleted',
  coupon_created: 'Discount code created',
  coupon_enabled: 'Discount code enabled',
  coupon_disabled: 'Discount code disabled',
  coupon_deleted: 'Discount code deleted',
  return_approved_refunded: 'Return approved, refund issued',
  return_rejected: 'Return rejected',
  product_created: 'Product created',
  product_deleted: 'Product deleted',
  product_price_changed: 'Product price changed',
  product_stock_changed: 'Product stock changed',
}

function describeMetadata(action, metadata) {
  if (!metadata) return null
  if (action === 'product_price_changed') return `${metadata.name}: ${formatPrice(metadata.from)} \u2192 ${formatPrice(metadata.to)}`
  if (action === 'product_stock_changed') return `${metadata.name}: ${metadata.from} \u2192 ${metadata.to} in stock`
  if (action === 'order_status_changed') return `${metadata.order_number}: ${metadata.from || 'none'} \u2192 ${metadata.to}`
  if (action === 'order_marked_paid') return `${metadata.order_number}, ${formatPrice(metadata.amount)} via ${metadata.method}`
  if (metadata.order_number) return metadata.order_number
  if (metadata.name) return metadata.name
  return null
}

export default function AdminAuditLogTab() {
  const [logs, setLogs] = useState(null)

  useEffect(() => {
    let active = true
    supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (active) setLogs(data || [])
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">
        A record of sensitive admin actions: order status changes, payments marked or undone,
        refunds, discount code changes, and product price or stock edits. Most recent 200 shown.
      </p>

      {logs === null ? (
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
          No admin actions recorded yet. This log fills in as orders, coupons, refunds, and
          product edits happen from here on.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-gold/10 border border-gold/20 rounded-xl overflow-hidden">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-sans text-sm text-espresso dark:text-cream">
                  {ACTION_LABELS[log.action] || log.action}
                </p>
                {describeMetadata(log.action, log.metadata) && (
                  <p className="font-sans text-xs text-espresso/60 dark:text-cream/60 mt-1">
                    {describeMetadata(log.action, log.metadata)}
                  </p>
                )}
                <p className="font-sans text-xs text-espresso/40 dark:text-cream/40 mt-1">
                  {log.actor_email || 'Unknown admin'}
                </p>
              </div>
              <span className="font-sans text-xs text-espresso/40 dark:text-cream/40 flex-shrink-0 whitespace-nowrap">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
