import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import NavLogo from './NavLogo'
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import SearchOverlay from './SearchOverlay'
import MegaMenu from './MegaMenu'
import ExploreMenu from './ExploreMenu'
import { useFlyToCart } from '../context/FlyToCartContext'
import {
  Layers,
  BookOpen,
  Sparkles,
  Heart as HeartOutline,
  PackageSearch,
  HelpCircle,
  Truck,
  RotateCcw,
  MessageCircle,
  Image as ImageIcon,
} from 'lucide-react'

const links = [
  { label: 'New In', to: '/shop?new=true' },
  { label: 'Shop', to: '/shop' },
  { label: 'Collections', to: '/collections' },
]

const exploreLinks = [
  { label: 'Lookbook', to: '/lookbook', icon: ImageIcon },
  { label: 'Journal', to: '/journal', icon: BookOpen },
  { label: 'Source It', to: '/source', icon: Sparkles },
  { label: 'About', to: '/about', icon: HeartOutline },
  { label: 'Track Order', to: '/track-order', icon: PackageSearch },
  { label: 'Delivery', to: '/delivery', icon: Truck },
  { label: 'Returns', to: '/returns', icon: RotateCcw },
  { label: 'FAQ', to: '/faq', icon: HelpCircle },
  { label: 'Contact', to: '/contact', icon: MessageCircle },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)

  const { totalItems } = useCart()
  const { registerCartIcon, registerWishlistIcon } = useFlyToCart()
  const { items: wishlistItems } = useWishlist()
  const { user } = useAuth()
  const location = useLocation()

  // On the homepage, the navbar blends directly into the cinematic Hero
  // below it instead of sitting on a mismatched cream/espresso bar.
  const isHome = location.pathname === '/'
  const navTextClass = isHome ? 'text-cream' : 'text-espresso dark:text-cream'

  return (
    <header
      className={`relative w-full transition-colors duration-500 sticky top-0 z-50 ${
        isHome
          ? 'bg-espresso border-b border-cream/10'
          : 'bg-cream dark:bg-espresso border-b border-gold/20'
      }`}
    >

      {/* MAIN NAVBAR */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">

        {/* LOGO */}
        <NavLogo light={isHome} />

        {/* DESKTOP NAVIGATION */}
        <nav className={`hidden md:flex items-center gap-6 font-sans text-sm uppercase tracking-wide ${navTextClass}`}>
          {links.map((link) =>
            link.label === 'Shop' ? (
              <div
                key={link.label}
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <Link
                  to={link.to}
                  className="relative hover:text-gold transition-colors group/nav"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover/nav:w-full transition-all duration-300 ease-out" />
                </Link>
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className="relative hover:text-gold transition-colors group/nav"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover/nav:w-full transition-all duration-300 ease-out" />
              </Link>
            )
          )}
          <div
            onMouseEnter={() => setExploreOpen(true)}
            onMouseLeave={() => setExploreOpen(false)}
          >
            <button className="relative flex items-center gap-1.5 hover:text-gold transition-colors group/nav">
              <Layers className="w-3.5 h-3.5" />
              Explore
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover/nav:w-full transition-all duration-300 ease-out" />
            </button>
          </div>
        </nav>

        {/* ACTIONS */}
        <div className={`flex items-center gap-3 sm:gap-4 md:gap-5 ${navTextClass}`}>

          {/* SEARCH */}
          <motion.button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="hidden sm:block"
            whileHover={{ scale: 1.15, rotate: -8 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Search className="w-5 h-5 cursor-pointer hover:text-gold transition-colors" />
          </motion.button>

          {/* ACCOUNT */}
          <Link to="/account" className="relative" aria-label={user ? 'Your account' : 'Sign in or track an order'}>
            <motion.div
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <User className={`w-5 h-5 cursor-pointer transition-colors ${user ? 'text-gold' : 'hover:text-gold'}`} />
            </motion.div>
            {user && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold ring-2 ring-cream dark:ring-espresso" />
            )}
          </Link>

          {/* WISHLIST */}
          <Link
            to="/wishlist"
            className="relative"
            ref={registerWishlistIcon}
          >
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            >
              <Heart className="w-5 h-5 cursor-pointer hover:text-gold transition-colors" />
            </motion.div>

            {wishlistItems.length > 0 && (
              <motion.span
                key={wishlistItems.length}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                className="absolute -top-2 -right-2 bg-gold text-espresso text-[10px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center"
              >
                {wishlistItems.length}
              </motion.span>
            )}
          </Link>

          {/* CART */}
          <Link
            to="/cart"
            className="relative"
            ref={registerCartIcon}
          >
            <motion.div
              whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            >
              <ShoppingBag className="w-5 h-5 cursor-pointer hover:text-gold transition-colors" />
            </motion.div>

            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                className="absolute -top-2 -right-2 bg-gold text-espresso text-[10px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>

          {/* THEME TOGGLE */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

        </div>
      </div>

      {/* MEGA MENU */}
      <div
        onMouseEnter={() => setMegaMenuOpen(true)}
        onMouseLeave={() => setMegaMenuOpen(false)}
      >
        <MegaMenu open={megaMenuOpen} />
      </div>

      {/* EXPLORE MENU */}
      <div
        onMouseEnter={() => setExploreOpen(true)}
        onMouseLeave={() => setExploreOpen(false)}
      >
        <ExploreMenu open={exploreOpen} onNavigate={() => setExploreOpen(false)} />
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="fixed inset-0 bg-cream dark:bg-espresso z-50 flex flex-col p-6 overflow-y-auto">

          {/* MOBILE MENU HEADER */}
          <div className="flex justify-between items-center mb-10">

            <NavLogo light={false} onClick={() => setMenuOpen(false)} />

            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-7 h-7 text-espresso dark:text-cream" />
            </button>

          </div>

          {/* MOBILE NAVIGATION */}
          <nav className="flex flex-col gap-5 font-display italic text-3xl text-espresso dark:text-cream mb-8">
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

          <div className="h-px bg-gold/20 mb-6" />

          <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-gold mb-4">
            Explore
          </p>
          <nav className="flex flex-col gap-4 mb-8">
            {exploreLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 font-sans text-base text-espresso dark:text-cream hover:text-gold transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 text-gold">
                    <Icon className="w-4 h-4" />
                  </span>
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* MOBILE ACTIONS */}
          <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gold/20">

            <button
              onClick={() => {
                setSearchOpen(true)
                setMenuOpen(false)
              }}
              className="flex items-center gap-2 font-sans text-sm text-espresso dark:text-cream"
            >
              <Search className="w-5 h-5" />
              Search
            </button>

            <ThemeToggle />

          </div>

        </div>
      )}

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <SearchOverlay
          onClose={() => setSearchOpen(false)}
        />
      )}

    </header>
  )
}

export default Navbar