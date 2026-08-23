import { Link } from 'react-router-dom'
import logoCream from '../assets/logo/logo-cream-text.png'
import { AtSign, MessageCircle, Mail } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-espresso text-cream px-6 pt-16 pb-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <img src={logoCream} alt="Victorious Concept" className="h-14 mb-4" />
          <p className="font-sans text-sm text-cream/60 max-w-xs">
            Sourced with intention. Worn with confidence.
          </p>
        </div>

        <div>
          <h4 className="font-sans text-xs uppercase tracking-widest text-gold-light mb-4">Shop</h4>
          <ul className="flex flex-col gap-3 font-sans text-sm text-cream/80">
            <li><Link to="/shop" className="hover:text-gold transition-colors">All Products</Link></li>
            <li><Link to="/wishlist" className="hover:text-gold transition-colors">Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-gold transition-colors">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-xs uppercase tracking-widest text-gold-light mb-4">Customer Care</h4>
          <ul className="flex flex-col gap-3 font-sans text-sm text-cream/80">
            <li><Link to="/delivery" className="hover:text-gold transition-colors">Delivery</Link></li>
            <li><Link to="/track-order" className="hover:text-gold transition-colors">Track Order</Link></li>
            <li><Link to="/faq" className="hover:text-gold transition-colors">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-xs uppercase tracking-widest text-gold-light mb-4">Connect</h4>
          <div className="flex gap-4">
            <a href="#" aria-label="Instagram" className="hover:text-gold transition-colors">
              <AtSign className="w-5 h-5" />
            </a>
            <a href="#" aria-label="WhatsApp" className="hover:text-gold transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Email" className="hover:text-gold transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-cream/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs text-cream/50">
        <span className="flex items-center gap-4">
          © 2026 Victorious Concept. All rights reserved.
          <Link to="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-gold transition-colors">Terms</Link>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold" />
          Shipping to Nigeria, Naira (₦)
        </span>
      </div>
    </footer>
  )
}

export default Footer