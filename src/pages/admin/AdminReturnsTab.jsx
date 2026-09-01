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
  )
}
