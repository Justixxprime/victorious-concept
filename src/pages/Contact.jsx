import { MessageCircle, Mail, Phone, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { siteImages } from '../data/siteImages'
import { useState } from 'react'
import { useBusinessSettings } from '../context/BusinessSettingsContext'

function Contact() {
  const { whatsappNumber } = useBusinessSettings()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/submit-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error || 'Could not send your message')
        setStatus('error')
        return
      }
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setErrorMessage('Could not reach the server')
      setStatus('error')
    }
  }

  return (
    <>
      <SEO title="Contact" description="Get in touch with Victorious Concept — WhatsApp, email, or send us a message directly." />

      {/* CINEMATIC HERO */}
      <section className="relative bg-espresso text-cream overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={siteImages.contactBanner}
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/85 to-espresso/50" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-28 md:py-36 flex flex-col items-start gap-6">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-sans uppercase tracking-[0.3em] text-xs text-gold-light"
          >
            Get In Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display italic font-semibold text-5xl md:text-6xl leading-tight max-w-2xl"
          >
            We would love to hear from you
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-cream/70 max-w-lg text-base md:text-lg"
          >
            Questions about an order, styling advice, or a custom sourcing request — reach us
            however's easiest for you.
          </motion.p>
        </div>
      </section>

      {/* CONTACT CHANNELS + FORM */}
      <section className="bg-cream dark:bg-espresso transition-colors py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14">

          {/* LEFT: direct channels */}
          <div className="flex flex-col gap-4">
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">
              Reach Us Directly
            </p>

            <motion.a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group flex items-center gap-4 bg-gold/5 hover:bg-gold/10 rounded-2xl p-5 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1">
                <p className="font-sans text-sm text-espresso dark:text-cream font-medium">WhatsApp</p>
                <p className="font-sans text-xs text-espresso/60 dark:text-cream/60">+234 812 247 0435 — fastest reply</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </motion.a>

            <motion.a
              href="mailto:Victoriaobioma31@yahoo.com"
              whileHover={{ x: 6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group flex items-center gap-4 bg-gold/5 hover:bg-gold/10 rounded-2xl p-5 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1">
                <p className="font-sans text-sm text-espresso dark:text-cream font-medium">Email</p>
                <p className="font-sans text-xs text-espresso/60 dark:text-cream/60">Victoriaobioma31@yahoo.com</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </motion.a>

            <motion.a
              href="tel:+2348022470435"
              whileHover={{ x: 6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group flex items-center gap-4 bg-gold/5 hover:bg-gold/10 rounded-2xl p-5 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-gold" />
              </div>
              <div className="flex-1">
                <p className="font-sans text-sm text-espresso dark:text-cream font-medium">Phone</p>
                <p className="font-sans text-xs text-espresso/60 dark:text-cream/60">0802 247 0435</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </motion.a>

            <div className="mt-4 rounded-2xl overflow-hidden aspect-video">
              <img src={siteImages.contactBanner} alt="Victorious Concept" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* RIGHT: form */}
          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4">
              Or Send A Message
            </p>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gold/5 rounded-2xl p-8 text-center"
              >
                <p className="font-display italic text-xl text-espresso dark:text-cream mb-2">
                  Message sent
                </p>
                <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
                  We'll get back to you soon, or feel free to WhatsApp us for a faster reply.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label htmlFor="contact-name" className="sr-only">Your name</label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Your name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold transition-colors"
                />
                <label htmlFor="contact-email" className="sr-only">Your email</label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="Your email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold transition-colors"
                />
                <label htmlFor="contact-message" className="sr-only">Your message</label>
                <textarea
                  id="contact-message"
                  placeholder="Your message"
                  rows={6}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold resize-none transition-colors"
                />
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors self-start disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </motion.button>
                {status === 'error' && (
                  <p className="font-sans text-xs text-red-500">{errorMessage || 'Something went wrong, please try again or message us on WhatsApp.'}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact