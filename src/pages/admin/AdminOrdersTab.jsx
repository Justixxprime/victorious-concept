import { supabase } from '../../lib/supabaseClient'
import { formatPrice } from '../../utils/formatPrice'
import { useToast } from '../../context/ToastContext'
import { useAdminWrite } from '../../hooks/useAdminWrite'
import { Trash2, Undo2 } from 'lucide-react'

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

export default function AdminOrdersTab({ orders, ordersLoading, setOrders }) {
  const { showToast } = useToast()
  const runWrite = useAdminWrite()

  async function deleteOrder(id) {
    if (!confirm('Delete this order permanently? This cannot be undone.')) return
    const ok = await runWrite(supabase.from('orders').delete().eq('id', id), 'Deleting order')
    if (!ok) return
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }

  async function markPaid(order) {
    // One atomic call — records the manual payment, snapshots line items,
    // protects stock, counts any coupon usage, and marks the order paid,
    // all together or not at all. Also naturally guards against a
    // double-click: if this order's reference was already confirmed, it's
    // a no-op.
    const { error } = await supabase.rpc('confirm_manual_payment', {
      p_order_id: order.id,
      p_reference: order.order_number,
      p_amount: order.total,
      p_verified_via: order.payment_method,
      p_items: order.items,
    })

    if (error) {
      showToast('Could not confirm this payment — please try again', 'error')
      return
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, payment_status: 'paid', order_status: 'processing' } : o
      )
    )
    showToast('Order marked paid', 'success')
  }

  async function undoMarkPaid(order) {
    if (!confirm(`Undo "paid" for ${order.order_number}? This restores stock, reverses any coupon usage, and puts the order back to unpaid/pending. Only do this if it was marked paid by mistake.`)) return

    const { data, error } = await supabase.rpc('undo_manual_payment', { p_order_id: order.id })

    if (error || data === 'no_manual_payment_found') {
      showToast('Could not undo this — please try again', 'error')
      return
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, payment_status: 'unpaid', order_status: 'pending_payment' } : o
      )
    )
    showToast('Payment undone — order is back to pending', 'success')
  }

  async function updateStatus(order, newStatus) {
    const ok = await runWrite(
      supabase.from('orders').update({ order_status: newStatus }).eq('id', order.id),
      'Updating order status'
    )
    if (!ok) return
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, order_status: newStatus } : o)))
  }

  return (
    <div className="flex flex-col gap-4">
      {ordersLoading ? (
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">No orders yet.</p>
      ) : (
        orders.map((order) => {
          const currentPaymentStatus = order.payment_status || 'unpaid'
          const canManuallyVerify = order.payment_method !== 'card' && currentPaymentStatus !== 'paid'

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
                    onClick={() => markPaid(order)}
                    className="font-sans text-xs font-medium bg-gold/20 hover:bg-gold/30 text-gold rounded-full px-3 py-1 transition-colors"
                  >
                    Mark as paid
                  </button>
                )}
                {order.payment_method !== 'card' && currentPaymentStatus === 'paid' && ['processing', 'pending_payment'].includes(order.order_status) && (
                  <button
                    onClick={() => undoMarkPaid(order)}
                    className="flex items-center gap-1 font-sans text-xs font-medium text-espresso/50 dark:text-cream/50 hover:text-red-500 rounded-full px-3 py-1 transition-colors"
                  >
                    <Undo2 className="w-3 h-3" /> Undo
                  </button>
                )}
              </div>

              <select
                value={order.order_status || 'pending_payment'}
                onChange={(e) => updateStatus(order, e.target.value)}
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
  )
}