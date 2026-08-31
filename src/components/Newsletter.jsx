import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Check } from 'lucide-react'

function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/submit-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        return
      }
      setStatus(data.alreadySubscribed ? 'already' : 'success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-espresso text-cream py-20 px-6">
      <div className="max-w-lg mx-auto text-center flex flex-col items-center gap-5">
        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
          <Mail className="w-5 h-5 text-gold-light" />
        </div>
        <h2 className="font-display italic font-semibold text-3xl md:text-4xl leading-tight">
          Be first to know
        </h2>
        <p className="font-sans text-sm text-cream/70">
          New arrivals, drops, and the occasional honest thought from us. No spam, ever.
        </p>

        {status === 'success' ? (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 font-sans text-sm text-gold-light"
          >
            <Check className="w-4 h-4" /> You're on the list. Welcome.
          </motion.p>
        ) : status === 'already' ? (
          <p className="font-sans text-sm text-gold-light">You're already subscribed.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-cream/10 border border-cream/20 rounded-full px-5 py-3 font-sans text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors disabled:opacity-50 flex-shrink-0"
            >
              Subscribe
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="font-sans text-xs text-red-400">Something went wrong, please try again.</p>
        )}
      </div>
    </section>
  )
}

export default Newsletter