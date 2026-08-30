import { Link } from 'react-router-dom'
import logoCream from '../assets/logo/logo-cream-text.png'
import { AtSign, MessageCircle, Mail, ShieldCheck, Truck, CreditCard } from 'lucide-react'
import { useBusinessSettings } from '../context/BusinessSettingsContext'

function Footer() {
  const { whatsappNumber } = useBusinessSettings()
  return (
    <footer className="bg-espresso text-cream">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-12 border-b border-cream/10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-gold-light flex-shrink-0" />
          <div>
            <p className="font-sans text-sm text-cream">Secure Checkout</p>
            <p className="font-sans text-xs text-cream/50">Powered by Paystack</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-gold-light flex-shrink-0" />
          <div>
            <p className="font-sans text-sm text-cream">Nationwide & International</p>
            <p className="font-sans text-xs text-cream/50">Delivered with care</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-gold-light flex-shrink-0" />
          <div>
            <p className="font-sans text-sm text-cream">Flexible Payment</p>
            <p className="font-sans text-xs text-cream/50">Card, transfer, or WhatsApp</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-1">
          <img src={logoCream} alt="Victorious Concept" className="h-14 mb-4" />
          <p className="font-sans text-sm text-cream/60 max-w-xs leading-relaxed">
            Sourced with intention. Worn with confidence. Built from a Lagos market run,
            grown into a name.
          </p>
        </div>

        <div>
          <h4 className="font-sans text-xs uppercase tracking-widest text-gold-light mb-4">Shop</h4>
          <ul className="flex flex-col gap-3 font-sans text-sm text-cream/80">
            <li><Link to="/shop" className="hover:text-gold transition-colors">All Products</Link></li>
            <li><Link to="/shop?new=true" className="hover:text-gold transition-colors">New In</Link></li>
            <li><Link to="/lookbook" className="hover:text-gold transition-colors">Lookbook</Link></li>
            <li><Link to="/wishlist" className="hover:text-gold transition-colors">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-xs uppercase tracking-widest text-gold-light mb-4">Customer Care</h4>
          <ul className="flex flex-col gap-3 font-sans text-sm text-cream/80">
            <li><Link to="/delivery" className="hover:text-gold transition-colors">Delivery</Link></li>
            <li><Link to="/returns" className="hover:text-gold transition-colors">Returns</Link></li>
            <li><Link to="/track-order" className="hover:text-gold transition-colors">Track Order</Link></li>
            <li><Link to="/faq" className="hover:text-gold transition-colors">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-xs uppercase tracking-widest text-gold-light mb-4">The Brand</h4>
          <ul className="flex flex-col gap-3 font-sans text-sm text-cream/80">
            <li><Link to="/about" className="hover:text-gold transition-colors">Our Story</Link></li>
            <li><Link to="/journal" className="hover:text-gold transition-colors">Journal</Link></li>
            <li><Link to="/source" className="hover:text-gold transition-colors">Source It For Me</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-xs uppercase tracking-widest text-gold-light mb-4">Connect</h4>
          <div className="flex gap-4 mb-5">
            <a href="#" aria-label="Instagram" className="hover:text-gold transition-colors">
              <AtSign className="w-5 h-5" />
            </a>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-gold transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="mailto:Victoriaobioma31@yahoo.com" aria-label="Email" className="hover:text-gold transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
          <p className="font-sans text-xs text-cream/40 leading-relaxed">
            Lagos, Nigeria<br />Nationwide & international delivery
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-cream/10 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs text-cream/50">
        <span className="flex items-center gap-4 flex-wrap justify-center">
          © 2026 Victorious Concept. All rights reserved.
          <Link to="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-gold transition-colors">Terms</Link>
        </span>
        <span className="text-cream/30">Built in Lagos.</span>
      </div>
    </footer>
  )
}

export default Footer