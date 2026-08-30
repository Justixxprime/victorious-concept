import { useState } from 'react'
import SEO from '../components/SEO'
import { ArrowRight, ArrowLeft, Upload, Check } from 'lucide-react'
import { siteImages } from '../data/siteImages'
import { useBusinessSettings } from '../context/BusinessSettingsContext'

const steps = ['What', 'References', 'Budget', 'You']

function SourceRequest() {
  const { whatsappNumber } = useBusinessSettings()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    item: '',
    details: '',
    budgetMin: '',
    budgetMax: '',
    location: '',
    name: '',
    contact: '',
  })
  const [images, setImages] = useState([])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleImages(e) {
    const files = Array.from(e.target.files).slice(0, 4)
    setImages(files.map((file) => URL.createObjectURL(file)))
  }

  function buildMessage() {
    const lines = [
      `Hi Victorious Concept, I would like something sourced.`,
      ``,
      `Item: ${form.item || 'Not specified'}`,
      `Details: ${form.details || 'Not specified'}`,
      `Budget: ${form.budgetMin || '?'} to ${form.budgetMax || '?'} Naira`,
      `Where I am: ${form.location || 'Not specified'}`,
      `My name: ${form.name || 'Not specified'}`,
      `Best way to reach me: ${form.contact || 'Not specified'}`,
    ]
    if (images.length > 0) {
      lines.push('', 'I have reference photos I will attach in this chat.')
    }
    return encodeURIComponent(lines.join('\n'))
  }

  function submit() {
    const message = buildMessage()
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  const canNext =
    (step === 0 && form.item.trim() !== '') ||
    step === 1 ||
    (step === 2 && form.budgetMin && form.budgetMax && form.location.trim() !== '') ||
    (step === 3 && form.name.trim() !== '' && form.contact.trim() !== '')

  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen">
      <SEO
        title="Source It For Me"
        description="Tell us what you want. We will find it for you at Trade Fair, Lagos Island, anywhere in Nigeria or the world."
      />

      <div className="relative bg-espresso text-cream overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={siteImages.aboutStory}
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-espresso/60 via-espresso/85 to-espresso" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 py-24 md:py-32 text-center flex flex-col items-center gap-6">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold-light">
            A Private Request
          </p>
          <h1 className="font-display italic font-semibold text-4xl md:text-6xl leading-tight">
            Can't find it? We'll go find it.
          </h1>
          <p className="font-sans text-sm md:text-base text-cream/70 max-w-lg">
            Before there was a website, there was Victoria, a description, a screenshot, a friend
            who needed something specific, and a trip to Trade Fair or Lagos Island to find it.
            This page is that same promise, just with better lighting.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gold/10">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="font-display italic text-3xl text-gold">01</span>
          <h3 className="font-sans text-sm font-medium text-espresso dark:text-cream">Tell us what you want</h3>
          <p className="font-sans text-xs text-espresso/60 dark:text-cream/60 leading-relaxed">
            A description, a photo, a vibe, whatever you've got is enough to start.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="font-display italic text-3xl text-gold">02</span>
          <h3 className="font-sans text-sm font-medium text-espresso dark:text-cream">We go looking</h3>
          <p className="font-sans text-xs text-espresso/60 dark:text-cream/60 leading-relaxed">
            The same market instinct that started this business, now working for you specifically.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="font-display italic text-3xl text-gold">03</span>
          <h3 className="font-sans text-sm font-medium text-espresso dark:text-cream">It reaches you</h3>
          <p className="font-sans text-xs text-espresso/60 dark:text-cream/60 leading-relaxed">
            Confirmed, priced, and delivered, the exact same way every other order works.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-16">

        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-sans font-medium transition-colors ${
                  i < step
                    ? 'bg-gold text-espresso'
                    : i === step
                    ? 'bg-espresso text-cream dark:bg-cream dark:text-espresso'
                    : 'bg-gold/10 text-espresso/40 dark:text-cream/40'
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i !== steps.length - 1 && (
                <div className={`w-8 h-px ${i < step ? 'bg-gold' : 'bg-gold/20'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[280px]">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display italic text-2xl text-espresso dark:text-cream mb-2">
                What are you looking for?
              </h2>
              <input
                type="text"
                placeholder="e.g. A cream Polene style bag"
                value={form.item}
                onChange={(e) => update('item', e.target.value)}
                className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
              />
              <textarea
                placeholder="Any details, color, style, size, occasion, anything that helps us find the right one"
                rows={4}
                value={form.details}
                onChange={(e) => update('details', e.target.value)}
                className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold resize-none"
              />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display italic text-2xl text-espresso dark:text-cream mb-2">
                Have a picture in mind?
              </h2>
              <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 mb-2">
                Optional, but it helps a lot. A screenshot, a Pinterest find, anything.
              </p>
              <label className="border-2 border-dashed border-gold/30 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-gold transition-colors">
                <Upload className="w-6 h-6 text-gold" />
                <span className="font-sans text-sm text-espresso/60 dark:text-cream/60">
                  Tap to upload up to 4 images
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImages}
                  className="hidden"
                />
              </label>
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Reference ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
              <p className="font-sans text-xs text-espresso/40 dark:text-cream/40">
                You will attach these directly in WhatsApp at the final step, this preview is just for you.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display italic text-2xl text-espresso dark:text-cream mb-2">
                Budget and location
              </h2>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Min budget (Naira)"
                  value={form.budgetMin}
                  onChange={(e) => update('budgetMin', e.target.value)}
                  className="flex-1 bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
                />
                <input
                  type="number"
                  placeholder="Max budget (Naira)"
                  value={form.budgetMax}
                  onChange={(e) => update('budgetMax', e.target.value)}
                  className="flex-1 bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
                />
              </div>
              <input
                type="text"
                placeholder="Where are you? e.g. Lagos, Abuja, London"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
              />
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display italic text-2xl text-espresso dark:text-cream mb-2">
                Almost done
              </h2>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
              />
              <input
                type="text"
                placeholder="Best phone number or email to reach you"
                value={form.contact}
                onChange={(e) => update('contact', e.target.value)}
                className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-cream/40 outline-none focus:border-gold"
              />
              <p className="font-sans text-xs text-espresso/40 dark:text-cream/40">
                Tapping "Send Request" opens WhatsApp with everything filled in for you. If you added photos, just attach them in the chat before sending.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-10">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 font-sans text-sm text-espresso dark:text-cream disabled:opacity-0 hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => canNext && setStep((s) => s + 1)}
              disabled={!canNext}
              className="flex items-center gap-2 bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!canNext}
              className="flex items-center gap-2 bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
            >
              Send Request <ArrowRight className="w-4 h-4" />
            </button>
          )}
                </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-gold/5 rounded-2xl p-6">
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">No Middleman Markup</p>
            <p className="font-sans text-xs text-espresso/60 dark:text-cream/60">
              You get Victoria's real sourcing price, not an inflated finder's fee.
            </p>
          </div>
          <div className="bg-gold/5 rounded-2xl p-6">
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">Real Answers Fast</p>
            <p className="font-sans text-xs text-espresso/60 dark:text-cream/60">
              Every request gets a real reply from a real person on WhatsApp.
            </p>
          </div>
          <div className="bg-gold/5 rounded-2xl p-6">
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">Anywhere, Really</p>
            <p className="font-sans text-xs text-espresso/60 dark:text-cream/60">
              Lagos, anywhere in Nigeria, or internationally, if it exists, we'll try.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SourceRequest