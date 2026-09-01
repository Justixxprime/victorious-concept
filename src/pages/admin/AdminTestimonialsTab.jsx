import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAdminWrite } from '../../hooks/useAdminWrite'
import { Trash2 } from 'lucide-react'

const EMPTY_FORM = { customer_name: '', quote: '', source: '' }

export default function AdminTestimonialsTab() {
  const runWrite = useAdminWrite()
  const [testimonials, setTestimonials] = useState([])
  const [testimonialForm, setTestimonialForm] = useState(EMPTY_FORM)

  async function refetch() {
    const { data } = await supabase.from('testimonials').select('*')
    setTestimonials(data || [])
  }

  useEffect(() => {
    refetch()
  }, [])

  async function addTestimonial() {
    if (!testimonialForm.customer_name || !testimonialForm.quote) return
    const ok = await runWrite(supabase.from('testimonials').insert(testimonialForm), 'Adding testimonial')
    if (!ok) return
    setTestimonialForm(EMPTY_FORM)
    refetch()
  }

  async function deleteTestimonial(id) {
    if (!confirm('Delete this testimonial?')) return
    const ok = await runWrite(supabase.from('testimonials').delete().eq('id', id), 'Deleting testimonial')
    if (!ok) return
    refetch()
  }

  return (
    <div className="max-w-lg flex flex-col gap-8">
      <div className="bg-gold/5 rounded-2xl p-6">
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">Add a Real Testimonial</h2>
        <div className="flex flex-col gap-3 mb-4">
          <input type="text" placeholder="Customer name" value={testimonialForm.customer_name} onChange={(e) => setTestimonialForm({ ...testimonialForm, customer_name: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
          <textarea placeholder="What they said" rows={3} value={testimonialForm.quote} onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none" />
          <input type="text" placeholder="Source (e.g. Instagram)" value={testimonialForm.source} onChange={(e) => setTestimonialForm({ ...testimonialForm, source: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
        </div>
        <button onClick={addTestimonial} className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors">Add Testimonial</button>
      </div>
      <div className="flex flex-col gap-2">
        {testimonials.map((t) => (
          <div key={t.id} className="border border-gold/20 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-sans text-sm text-espresso dark:text-cream">{t.customer_name}</p>
                <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">"{t.quote}"</p>
              </div>
              <button onClick={() => deleteTestimonial(t.id)} aria-label="Delete"><Trash2 className="w-4 h-4 text-espresso/40 dark:text-cream/40 hover:text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
