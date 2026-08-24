import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../hooks/useTheme'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import logoDark from '../assets/logo/logo-dark-text.png'
import logoCream from '../assets/logo/logo-cream-text.png'
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import SearchOverlay from './SearchOverlay'
import { useFlyToCart } from '../context/FlyToCartContext'

const links = [
  { label: 'New In', to: '/shop?new=true' },
  { label: 'Shop', to: '/shop' },
  { label: 'Lookbook', to: '/lookbook' },
  { label: 'Journal', to: '/journal' },
  { label: 'Source It', to: '/source' },
  { label: 'About', to: '/about' },
]

function Navbar() {
  const [mode] = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { totalItems } = useCart()
  const { registerCartIcon } = useFlyToCart()
  const { items: wishlistItems } = useWishlist()
  const isDark = document.documentElement.classList.contains('dark')

  return (
    <header className="w-full bg-cream dark:bg-espresso border-b border-gold/20 transition-colors sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <Link to="/" className="relative group flex-shrink-0">
          <div className="absolute -inset-3 bg-gold/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <motion.img
            src={isDark ? logoCream : logoDark}
            alt="Victorious Concept"
            className="relative h-12 sm:h-16 md:h-20 w-auto"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.03 }}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-sans text-sm uppercase tracking-wide text-espresso dark:text-cream">
          {links.map((link) => (
            <Link key={link.label} to={link.to} className="hover:text-gold transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4 md:gap-5 text-espresso dark:text-cream">
          <Search
            onClick={() => setSearchOpen(true)}
            className="hidden sm:block w-5 h-5 cursor-pointer hover:text-gold transition-colors"
          />
          <Link to="/account">
            <User className="w-5 h-5 cursor-pointer hover:text-gold transition-colors" />
          </Link>
          <Link to="/wishlist" className="relative">
            <Heart className="w-5 h-5 cursor-pointer hover:text-gold transition-colors" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-espresso text-[10px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative" ref={registerCartIcon}>
            <ShoppingBag className="w-5 h-5 cursor-pointer hover:text-gold transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-espresso text-[10px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 bg-cream dark:bg-espresso z-50 flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-10">
            <img src={isDark ? logoCream : logoDark} alt="Victorious Concept" className="h-14 w-auto" />
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X className="w-7 h-7 text-espresso dark:text-cream" />
            </button>
          </div>

          <nav className="flex flex-col gap-6 font-display italic text-3xl text-espresso dark:text-cream mb-8">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gold/20">
            <button
              onClick={() => { setSearchOpen(true); setMenuOpen(false) }}
              className="flex items-center gap-2 font-sans text-sm text-espresso dark:text-cream"
            >
              <Search className="w-5 h-5" /> Search
            </button>
            <ThemeToggle />
          </div>
        </div>
      )}

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  )
}

export default Navbar