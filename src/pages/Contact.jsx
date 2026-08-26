import { MessageCircle, Mail, Phone } from 'lucide-react'
import RevealImage from '../components/RevealImage'
import { siteImages } from '../data/siteImages'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    const { error } = await supabase.from('contact_messages').insert(form)
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    }
  }

  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-20 px-6">
            <div className="max-w-2xl mx-auto">
        <RevealImage
          src={siteImages.contactBanner}
          alt="Victorious Concept"
          className="w-full aspect-[16/7] rounded-2xl mb-10"
        />
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4">
          Get In Touch
        </p>
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-8">
          We would love to hear from you
        </h1>

        <div className="flex flex-col gap-5 mb-12">
          <a href="#" className="flex items-center gap-4 font-sans text-espresso dark:text-cream hover:text-gold transition-colors">
            <MessageCircle className="w-5 h-5 text-gold" />
            PLACEHOLDER: WhatsApp number
          </a>
          <a href="#" className="flex items-center gap-4 font-sans text-espresso dark:text-cream hover:text-gold transition-colors">
            <Mail className="w-5 h-5 text-gold" />
            PLACEHOLDER: email address
          </a>
          <a href="#" className="flex items-center gap-4 font-sans text-espresso dark:text-cream hover:text-gold transition-colors">
            <Phone className="w-5 h-5 text-gold" />
            PLACEHOLDER: phone number
          </a>
        </div>

        {status === 'success' ? (
          <div className="bg-gold/5 rounded-2xl p-8 text-center">
            <p className="font-display italic text-xl text-espresso dark:text-cream mb-2">
              Message sent
            </p>
            <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
              We'll get back to you soon, or feel free to WhatsApp us for a faster reply.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
            />
            <input
              type="email"
              placeholder="Your email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
            />
            <textarea
              placeholder="Your message"
              rows={5}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold resize-none"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors self-start disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'error' && (
              <p className="font-sans text-xs text-red-500">Something went wrong, please try again or message us on WhatsApp.</p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}

export default Contact