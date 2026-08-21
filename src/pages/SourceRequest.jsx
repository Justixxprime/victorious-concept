import { useState } from 'react'
import SEO from '../components/SEO'
import { ArrowRight, ArrowLeft, Upload, Check } from 'lucide-react'

const steps = ['What', 'References', 'Budget', 'You']

function SourceRequest() {
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
    window.open(`https://wa.me/2348122470435?text=${message}`, '_blank')
  }

  const canNext =
    (step === 0 && form.item.trim() !== '') ||
    step === 1 ||
    (step === 2 && form.budgetMin && form.budgetMax && form.location.trim() !== '') ||
    (step === 3 && form.name.trim() !== '' && form.contact.trim() !== '')

  return (
    <section className="bg-cream dark:bg-espresso transition-colors min-h-screen py-16 px-6">
      <SEO
        title="Source It For Me"
        description="Tell us what you want. We will find it for you, anywhere in Nigeria or the world."
      />
      <div className="max-w-xl mx-auto">
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4 text-center">
          A Private Request
        </p>
        <h1 className="font-display italic font-semibold text-4xl md:text-5xl text-espresso dark:text-cream text-center leading-tight mb-4">
          Can't find it? We'll go find it.
        </h1>
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 text-center max-w-md mx-auto mb-12">
          This is exactly how Victorious Concept started, sourcing the exact piece someone wanted, wherever it was.
          Tell us what you're after and we'll do the hunting.
        </p>

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
    </section>
  )
}

export default SourceRequest