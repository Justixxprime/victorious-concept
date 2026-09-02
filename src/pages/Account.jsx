import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { useAddresses } from '../hooks/useAddresses'
import { supabase } from '../lib/supabaseClient'
import { siteImages } from '../data/siteImages'
import { Mail, Lock, MapPin, Trash2, Plus, PackageSearch, ArrowRight, Sparkles, Heart, ScrollText, Gift, Copy, Check } from 'lucide-react'

function Account() {
  const { user, signUp, signIn, signOut } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    if (mode === 'signup') {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else setInfo('Almost there — check your email to confirm your account, then sign in.')
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else navigate('/')
    }
    setSubmitting(false)
  }

  if (user) {
    return <LoggedInAccount user={user} signOut={signOut} />
  }

  return (
    <section className="relative min-h-screen py-20 px-6 overflow-hidden">
      <SEO title={mode === 'signin' ? 'Sign In' : 'Create Account'} description="Sign in to your Victorious Concept account." />

      {/* Cinematic backdrop, matching the rest of the site's premium feel */}
      <div className="absolute inset-0">
        <img src={siteImages.heroBackdrop} alt="" className="w-full h-full object-cover opacity-[0.07] dark:opacity-[0.12]" />
        <div className="absolute inset-0 bg-cream dark:bg-espresso" style={{ maskImage: 'radial-gradient(ellipse at center, transparent 0%, black 75%)' }} />
        <motion.div
          className="absolute top-1/4 left-[15%] w-1.5 h-1.5 rounded-full bg-gold"
          animate={{ opacity: [0.15, 0.7, 0.15], y: [0, -14, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 right-[18%] w-1 h-1 rounded-full bg-gold-light"
          animate={{ opacity: [0.1, 0.6, 0.1], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="relative max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-6"
        >
          <Sparkles className="w-6 h-6 text-gold" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream mb-2 text-center">
              {mode === 'signin' ? 'Welcome back' : 'Join the concept'}
            </h1>
            <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 text-center mb-8 max-w-xs mx-auto">
              {mode === 'signin'
                ? 'Sign in for faster checkout, saved addresses, and your full order history.'
                : 'Create an account to save your addresses, track every order, and check out faster next time.'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex items-center gap-3 border border-gold/30 rounded-xl px-4 py-3 focus-within:border-gold transition-colors">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <label htmlFor="account-email" className="sr-only">Email</label>
                <input
                  id="account-email"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none"
                />
              </div>
              <div className="flex items-center gap-3 border border-gold/30 rounded-xl px-4 py-3 focus-within:border-gold transition-colors">
                <Lock className="w-4 h-4 text-gold flex-shrink-0" />
                <label htmlFor="account-password" className="sr-only">Password</label>
                <input
                  id="account-password"
                  type="password"
                  placeholder="Password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none"
                />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-sans text-xs text-red-500">
                  {error}
                </motion.p>
              )}
              {info && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-sans text-xs text-gold">
                  {info}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gold text-espresso font-sans font-medium px-8 py-3.5 rounded-full hover:bg-gold-light transition-colors mt-2 disabled:opacity-60"
              >
                {submitting ? 'One moment...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </motion.button>
            </form>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo('') }}
          className="w-full text-center font-sans text-sm text-gold hover:underline mt-6"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>

        <div className="flex items-center gap-3 my-8">
          <div className="flex-1 h-px bg-gold/20" />
          <span className="font-sans text-[11px] uppercase tracking-widest text-espresso/40 dark:text-cream/40">or</span>
          <div className="flex-1 h-px bg-gold/20" />
        </div>

        <Link
          to="/track-order"
          className="flex items-center justify-between gap-3 border border-gold/20 hover:border-gold rounded-2xl px-5 py-4 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <PackageSearch className="w-4 h-4 text-gold flex-shrink-0" />
            <div>
              <p className="font-sans text-sm text-espresso dark:text-cream">Just want to track an order?</p>
              <p className="font-sans text-xs text-espresso/50 dark:text-cream/50">No account needed</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gold flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}

function ReferralCard({ user }) {
  const [referral, setReferral] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchCode() {
      const { data: { session } } = await supabase.auth.getSession()
      try {
        const res = await fetch('/api/get-referral-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: session?.access_token }),
        })
        if (res.ok) setReferral(await res.json())
      } catch {
        // Silent — the referral card just won't render its content below;
        // nothing about the rest of the account page depends on this.
      }
      setLoading(false)
    }
    fetchCode()
  }, [user.id])

  function copyCode() {
    if (!referral) return
    navigator.clipboard.writeText(referral.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || !referral) return null

  return (
    <div className="bg-gold/5 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-2 mb-1">
        <Gift className="w-4 h-4 text-gold flex-shrink-0" />
        <span className="font-sans text-sm font-medium text-espresso dark:text-cream">
          Share your code, friends save {referral.percent_off}%
        </span>
      </div>
      <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-3">
        {referral.used_count > 0
          ? `${referral.used_count} order${referral.used_count > 1 ? 's have' : ' has'} used your code so far`
          : "It's yours to share however you like — WhatsApp, Instagram, wherever."}
      </p>
      <button
        onClick={copyCode}
        className="w-full flex items-center justify-between gap-2 bg-cream dark:bg-espresso border border-gold/30 rounded-xl px-4 py-2.5 font-sans text-sm text-espresso dark:text-cream hover:border-gold transition-colors"
      >
        <span className="tracking-wide font-medium">{referral.code}</span>
        {copied ? <Check className="w-4 h-4 text-gold" /> : <Copy className="w-4 h-4 text-gold" />}
      </button>
    </div>
  )
}

function LoggedInAccount({ user, signOut }) {
  const { addresses, loading, addAddress, deleteAddress } = useAddresses()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: '', full_name: '', phone: '', address: '' })
  const [profileForm, setProfileForm] = useState({
    full_name: user.user_metadata?.full_name || '',
    phone: user.user_metadata?.phone || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    await addAddress(form)
    setForm({ label: '', full_name: '', phone: '', address: '' })
    setShowForm(false)
  }

  async function handleProfileSave(e) {
    e.preventDefault()
    setSavingProfile(true)
    await supabase.auth.updateUser({
      data: { full_name: profileForm.full_name, phone: profileForm.phone },
    })
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
  })

  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-20 px-6">
      <SEO title="My Account" description="Manage your Victorious Concept account." />
      <div className="max-w-md mx-auto">
        <motion.div {...fadeUp(0)} className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-gold" />
          </div>
          <h1 className="font-display italic font-semibold text-3xl text-espresso dark:text-cream mb-2">
            Welcome back{profileForm.full_name ? `, ${profileForm.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
            Signed in as {user.email}
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.05)} className="mb-8">
          <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">
            Profile
          </h2>
          <form onSubmit={handleProfileSave} className="bg-gold/5 rounded-2xl p-5 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Full name"
              value={profileForm.full_name}
              onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-2 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
            />
            <input
              type="text"
              placeholder="Phone number"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-2 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={savingProfile}
              className="bg-gold text-espresso font-sans text-sm font-medium px-6 py-2 rounded-full hover:bg-gold-light transition-colors self-start disabled:opacity-50"
            >
              {profileSaved ? 'Saved!' : 'Save Profile'}
            </motion.button>
          </form>
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 gap-3 mb-3">
          <Link
            to="/orders"
            className="flex flex-col items-center gap-2 bg-gold text-espresso font-sans font-medium px-4 py-5 rounded-2xl hover:bg-gold-light transition-colors text-center"
          >
            <ScrollText className="w-5 h-5" />
            <span className="text-sm">My Orders</span>
          </Link>
          <Link
            to="/wishlist"
            className="flex flex-col items-center gap-2 border border-gold/30 text-espresso dark:text-cream font-sans font-medium px-4 py-5 rounded-2xl hover:border-gold transition-colors text-center"
          >
            <Heart className="w-5 h-5" />
            <span className="text-sm">Wishlist</span>
          </Link>
        </motion.div>
        <motion.div {...fadeUp(0.15)}>
          <Link
            to="/track-order"
            className="flex items-center justify-between gap-3 border border-gold/20 hover:border-gold rounded-2xl px-5 py-4 transition-colors mb-3 group"
          >
            <div className="flex items-center gap-3">
              <PackageSearch className="w-4 h-4 text-gold flex-shrink-0" />
              <span className="font-sans text-sm text-espresso dark:text-cream">Track a delivery</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gold flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <motion.div {...fadeUp(0.18)} className="mb-3">
          <ReferralCard user={user} />
        </motion.div>

        <motion.button
          {...fadeUp(0.2)}
          onClick={signOut}
          className="w-full border border-gold/30 text-espresso dark:text-cream font-sans font-medium px-8 py-3 rounded-full hover:border-gold transition-colors mb-10"
        >
          Sign Out
        </motion.button>

        <motion.div {...fadeUp(0.25)}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-sm uppercase tracking-widest text-gold">
              Saved Addresses
            </h2>
            <button onClick={() => setShowForm(!showForm)} className="text-gold" aria-label="Add address">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleAdd}
              className="bg-gold/5 rounded-2xl p-5 flex flex-col gap-3 mb-4 overflow-hidden"
            >
              <input
                type="text"
                placeholder="Label (e.g. Home, Office)"
                value={form.label}
                onChange={(e) => update('label', e.target.value)}
                className="bg-transparent border border-gold/30 rounded-xl px-4 py-2 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
              />
              <input
                type="text"
                placeholder="Full name"
                required
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                className="bg-transparent border border-gold/30 rounded-xl px-4 py-2 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
              />
              <input
                type="text"
                placeholder="Phone"
                required
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="bg-transparent border border-gold/30 rounded-xl px-4 py-2 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
              />
              <textarea
                placeholder="Address"
                required
                rows={2}
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                className="bg-transparent border border-gold/30 rounded-xl px-4 py-2 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none"
              />
              <button
                type="submit"
                className="bg-gold text-espresso font-sans text-sm font-medium px-6 py-2 rounded-full hover:bg-gold-light transition-colors self-start"
              >
                Save Address
              </button>
            </motion.form>
          )}
          {loading ? (
            <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">Loading...</p>
          ) : addresses.length === 0 ? (
            <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
              No saved addresses yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((addr, i) => (
                <motion.div
                  key={addr.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 border border-gold/20 rounded-xl p-4"
                >
                  <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    {addr.label && (
                      <p className="font-sans text-xs uppercase tracking-widest text-gold mb-1">{addr.label}</p>
                    )}
                    <p className="font-sans text-sm text-espresso dark:text-cream">{addr.full_name}</p>
                    <p className="font-sans text-xs text-espresso/60 dark:text-cream/60">{addr.phone}</p>
                    <p className="font-sans text-xs text-espresso/60 dark:text-cream/60">{addr.address}</p>
                  </div>
                  <button onClick={() => deleteAddress(addr.id)} aria-label="Delete address">
                    <Trash2 className="w-4 h-4 text-espresso/40 dark:text-cream/40 hover:text-red-500" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default Account