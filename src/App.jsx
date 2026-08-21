import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProductPage from './pages/ProductPage'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Cart from './pages/Cart'
import { WishlistProvider } from './context/WishlistContext'
import Wishlist from './pages/Wishlist'
import About from './pages/About'
import CategoryPage from './pages/CategoryPage'
import NotFound from './pages/NotFound'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Delivery from './pages/Delivery'
import Returns from './pages/Returns'
import Lookbook from './pages/Lookbook'


function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen bg-cream dark:bg-espresso transition-colors">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/about" element={<About />} />
              <Route path="/lookbook" element={<Lookbook />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/contact" element={<Contact />} />
              
<Route path="/faq" element={<FAQ />} />
<Route path="/delivery" element={<Delivery />} />
<Route path="/returns" element={<Returns />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App