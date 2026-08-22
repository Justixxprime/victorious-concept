import { MessageCircle, Mail, Phone } from 'lucide-react'
import RevealImage from '../components/RevealImage'
import { siteImages } from '../data/siteImages'

function Contact() {
  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-20 px-6">
            <div className="max-w-2xl mx-auto">
        <RevealImage
          src={siteImages.contactBanner}
          alt="Victorious Concept"
          className="w-full aspect-[16/7] rounded-2xl mb-10"
        />
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4">
          Get In Touch
        </p>
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-8">
          We would love to hear from you
        </h1>

        <div className="flex flex-col gap-5 mb-12">
          <a href="#" className="flex items-center gap-4 font-sans text-espresso dark:text-cream hover:text-gold transition-colors">
            <MessageCircle className="w-5 h-5 text-gold" />
            PLACEHOLDER: WhatsApp number
          </a>
          <a href="#" className="flex items-center gap-4 font-sans text-espresso dark:text-cream hover:text-gold transition-colors">
            <Mail className="w-5 h-5 text-gold" />
            PLACEHOLDER: email address
          </a>
          <a href="#" className="flex items-center gap-4 font-sans text-espresso dark:text-cream hover:text-gold transition-colors">
            <Phone className="w-5 h-5 text-gold" />
            PLACEHOLDER: phone number
          </a>
        </div>

        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your name"
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
          />
          <input
            type="email"
            placeholder="Your email"
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
          />
          <textarea
            placeholder="Your message"
            rows={5}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold resize-none"
          />
          <button
            type="button"
            className="bg-gold text-espresso font-sans font-medium px-8 py-3 rounded-full hover:bg-gold-light transition-colors self-start"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  )
}

export default Contact