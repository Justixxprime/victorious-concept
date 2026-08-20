import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display italic font-semibold text-7xl text-gold">404</p>
      <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
        This page took a wrong turn
      </h1>
      <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 max-w-sm">
        The page you are looking for does not exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-4 bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}

export default NotFound