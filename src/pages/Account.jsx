import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { useAddresses } from '../hooks/useAddresses'
import { supabase } from '../lib/supabaseClient'
import { Mail, Lock, MapPin, Trash2, Plus } from 'lucide-react'

function Account() {
  const { user, signUp, signIn, signOut } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    if (mode === 'signup') {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else setInfo('Account created. Check your email to confirm, then sign in.')
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else navigate('/')
    }
  }

  if (user) {
    return <LoggedInAccount user={user} signOut={signOut} />
  }

  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-20 px-6">
      <SEO title={mode === 'signin' ? 'Sign In' : 'Create Account'} description="Sign in to your Victorious Concept account." />
      <div className="max-w-sm mx-auto">
        <h1 className="font-display italic font-semibold text-3xl text-espresso dark:text-cream mb-2 text-center">
          {mode === 'signin' ? 'Welcome back' : 'Join Victorious Concept'}
        </h1>
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 text-center mb-8">
          {mode === 'signin' ? 'Sign in to continue' : 'Create your account'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 border border-gold/30 rounded-xl px-4 py-3">
            <Mail className="w-4 h-4 text-gold" />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none"
            />
          </div>
          <div className="flex items-center gap-3 border border-gold/30 rounded-xl px-4 py-3">
            <Lock className="w-4 h-4 text-gold" />
            <input
              type="password"
              placeholder="Password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none"
            />
          </div>
          {error && <p className="font-sans text-xs text-red-500">{error}</p>}
          {info && <p className="font-sans text-xs text-gold">{info}</p>}
          <button
            type="submit"
            className="bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors mt-2"
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full text-center font-sans text-sm text-gold hover:underline mt-6"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </section>
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

  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-20 px-6">
      <SEO title="My Account" description="Manage your Victorious Concept account." />
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display italic font-semibold text-3xl text-espresso dark:text-cream mb-2">
            Welcome back{profileForm.full_name ? `, ${profileForm.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
            Signed in as {user.email}
          </p>
        </div>
        <div className="mb-10">
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
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-gold text-espresso font-sans text-sm font-medium px-6 py-2 rounded-full hover:bg-gold-light transition-colors self-start disabled:opacity-50"
            >
              {profileSaved ? 'Saved!' : 'Save Profile'}
            </button>
          </form>
        </div>
        <div className="flex flex-col gap-3 mb-10">
          <Link
            to="/orders"
            className="bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors text-center"
          >
            View My Orders
          </Link>
          <button
            onClick={signOut}
            className="border border-gold/30 text-espresso dark:text-cream font-sans font-medium px-8 py-3 rounded-full hover:border-gold transition-colors"
          >
            Sign Out
          </button>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-sm uppercase tracking-widest text-gold">
              Saved Addresses
            </h2>
            <button onClick={() => setShowForm(!showForm)} className="text-gold" aria-label="Add address">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {showForm && (
            <form onSubmit={handleAdd} className="bg-gold/5 rounded-2xl p-5 flex flex-col gap-3 mb-4">
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
            </form>
          )}
          {loading ? (
            <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">Loading...</p>
          ) : addresses.length === 0 ? (
            <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
              No saved addresses yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="flex items-start gap-3 border border-gold/20 rounded-xl p-4">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Account