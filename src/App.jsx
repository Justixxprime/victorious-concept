import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductPage from './pages/ProductPage'
import CategoryPage from './pages/CategoryPage'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Delivery from './pages/Delivery'
import Returns from './pages/Returns'
import Lookbook from './pages/Lookbook'
import Journal from './pages/Journal'
import SourceRequest from './pages/SourceRequest'
import Checkout from './pages/Checkout'
import Account from './pages/Account'
import OrderHistory from './pages/OrderHistory'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import ScrollToTop from './components/ScrollToTop'
import { ToastProvider } from './context/ToastContext'

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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
            <div className="min-h-screen bg-cream dark:bg-espresso transition-colors">
              <ScrollToTop />
              <Navbar />
              <AnimatedRoutes />
              <Footer />
              <WhatsAppButton />
            </div>
          </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App