import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import ScrollToTop from './components/ScrollToTop'
import OfflineBanner from './components/OfflineBanner'
import { useEffect } from 'react'
import { useToast } from './context/ToastContext'
import CartReminder from './components/CartReminder'
import { FlyToCartProvider } from './context/FlyToCartContext'
import ErrorBoundary from './components/ErrorBoundary'


const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const Cart = lazy(() => import('./pages/Cart'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Delivery = lazy(() => import('./pages/Delivery'))
const Returns = lazy(() => import('./pages/Returns'))
const Lookbook = lazy(() => import('./pages/Lookbook'))
const Journal = lazy(() => import('./pages/Journal'))
const SourceRequest = lazy(() => import('./pages/SourceRequest'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Account = lazy(() => import('./pages/Account'))
const OrderHistory = lazy(() => import('./pages/OrderHistory'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const Collections = lazy(() => import('./pages/Collections'))
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'))

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-espresso">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/lookbook" element={<Lookbook />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/source" element={<SourceRequest />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/:slug" element={<CollectionDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function WelcomeNudge() {
  const { showToast } = useToast()

  useEffect(() => {
    const seen = localStorage.getItem('vc-welcome-seen')
    if (!seen) {
      const timer = setTimeout(() => {
        showToast('Welcome! Use code WELCOME10 for 10% off your first order', 'success')
        localStorage.setItem('vc-welcome-seen', 'true')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  return null
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <FlyToCartProvider>
                  <div className="min-h-screen bg-cream dark:bg-espresso transition-colors">
                    <ScrollToTop />
                    <WelcomeNudge />
                    <OfflineBanner />
                    <Navbar />
                    <AnimatedRoutes />
                    <Footer />
                    <WhatsAppButton />
                    <CartReminder />
                  </div>
                </FlyToCartProvider>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
