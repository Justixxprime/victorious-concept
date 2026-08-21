import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

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
    return (
      <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-20 px-6">
        <SEO title="My Account" description="Manage your Victorious Concept account." />
        <div className="max-w-md mx-auto text-center">
          <h1 className="font-display italic font-semibold text-3xl text-espresso dark:text-cream mb-4">
            Welcome back
          </h1>
          <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 mb-8">
            Signed in as {user.email}
          </p>
          <div className="flex flex-col gap-3">
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
        </div>
      </section>
    )
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

export default Account