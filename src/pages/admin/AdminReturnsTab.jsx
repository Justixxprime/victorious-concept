import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice } from '../../utils/formatPrice'
import { useToast } from '../../context/ToastContext'

export default function AdminReturnsTab({ returns, setReturns }) {
  const { showToast } = useToast()
  const [processingReturn, setProcessingReturn] = useState(null)

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
          .select('*, orders(order_number, total, payment_method, payment_status, payment_reference, customer_name, customer_phone, items, shipping_fee)')
          .order('created_at', { ascending: false })
        setReturns(refreshed || [])
      }
    } catch {
      showToast('Could not reach the server', 'error')
    } finally {
      setProcessingReturn(null)
    }
  }

  return (
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
            {r.orders?.customer_name} · {r.orders?.customer_phone} · via {r.orders?.payment_method}
          </p>
          <div className="flex flex-col gap-1 mb-2 border-y border-gold/10 py-2">
            <p className="font-sans text-xs uppercase tracking-widest text-gold/70">
              Returning {r.items?.length === (r.orders?.items?.length ?? r.items?.length) ? '(whole order)' : '(partial)'}
            </p>
            {(r.items || []).map((item) => (
              <div key={item.id} className="flex justify-between font-sans text-xs text-espresso/70 dark:text-cream/70">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-sans text-xs text-gold pt-1 mt-1 border-t border-gold/10">
              <span>Estimated refund</span>
              <span>
                {formatPrice(
                  (r.items || []).reduce((sum, i) => sum + i.price * i.quantity, 0) +
                  (r.items?.length === (r.orders?.items?.length ?? r.items?.length) ? (r.orders?.shipping_fee || 0) : 0)
                )}
              </span>
            </div>
          </div>
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
  )
}