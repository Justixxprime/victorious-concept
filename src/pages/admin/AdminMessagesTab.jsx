import { supabase } from '../../lib/supabaseClient'
import { useAdminWrite } from '../../hooks/useAdminWrite'

export default function AdminMessagesTab({ messages, setMessages }) {
  const runWrite = useAdminWrite()

  async function markRead(id) {
    const ok = await runWrite(supabase.from('contact_messages').update({ read: true }).eq('id', id), 'Marking message read')
    if (!ok) return
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
  }

  return (
    <div className="max-w-2xl flex flex-col gap-3">
      {messages.length === 0 ? (
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">No messages yet.</p>
      ) : (
        messages.map((m) => (
          <div key={m.id} className={`border rounded-xl p-4 ${m.read ? 'border-gold/10' : 'border-gold/40 bg-gold/5'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-sans text-sm text-espresso dark:text-cream">{m.name}</p>
                <p className="font-sans text-xs text-gold">{m.email}</p>
              </div>
              {!m.read && <button onClick={() => markRead(m.id)} className="font-sans text-xs text-gold hover:underline">Mark read</button>}
            </div>
            <p className="font-sans text-sm text-espresso/70 dark:text-cream/70">{m.message}</p>
          </div>
        ))
      )}
    </div>
  )
}
