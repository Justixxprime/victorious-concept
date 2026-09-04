import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { compressImage } from '../../utils/compressImage'
import { Upload } from 'lucide-react'

export default function AdminContentTab({ products }) {
  const { value: heroValue, updateSetting: updateHero } = useSiteSettings('hero')
  const [heroForm, setHeroForm] = useState(null)

  const { value: spotlightValue, updateSetting: updateSpotlight } = useSiteSettings('spotlight')
  const [spotlightForm, setSpotlightForm] = useState(null)

  const { value: lookValue, updateSetting: updateLook } = useSiteSettings('shop_the_look')
  const [lookForm, setLookForm] = useState(null)
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false)

  useEffect(() => {
    if (heroValue && !heroForm) setHeroForm(heroValue)
  }, [heroValue])

  useEffect(() => {
    // Both fields are deliberately allowed to stay blank — a blank headline
    // or description means "use the site's normal default copy", set in
    // EditorialFeature.jsx, not an error state.
    if (!spotlightForm) setSpotlightForm(spotlightValue || { productId: '', headline: '', description: '' })
  }, [spotlightValue])

  useEffect(() => {
    if (!lookForm) setLookForm(lookValue || { productIds: ['', '', ''], backdropImage: '' })
  }, [lookValue])

  async function handleBackdropUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingBackdrop(true)
    const compressed = await compressImage(file)
    const fileName = `${Date.now()}-${compressed.name}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, compressed)
    if (!error) {
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
      setLookForm({ ...lookForm, backdropImage: data.publicUrl })
    }
    setUploadingBackdrop(false)
  }

  function updateLookProductId(index, value) {
    const next = [...lookForm.productIds]
    next[index] = value
    setLookForm({ ...lookForm, productIds: next })
  }

  return (
    <div className="max-w-lg flex flex-col gap-12">
      {heroForm && (
        <div>
          <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">Hero Section</h2>
          <div className="flex flex-col gap-4">
            <input type="text" placeholder="Small label" value={heroForm.label} onChange={(e) => setHeroForm({ ...heroForm, label: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
            <textarea placeholder="Headline" rows={2} value={heroForm.headline} onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none" />
            <textarea placeholder="Supporting text" rows={2} value={heroForm.subtext} onChange={(e) => setHeroForm({ ...heroForm, subtext: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none" />
            <input type="text" placeholder="Backdrop image URL" value={heroForm.backdropImage} onChange={(e) => setHeroForm({ ...heroForm, backdropImage: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
            <button onClick={() => updateHero(heroForm)} className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors self-start">
              Save Homepage Hero
            </button>
          </div>
        </div>
      )}

      {spotlightForm && (
        <div>
          <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">The Spotlight</h2>
          <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-4">
            The single featured product on the homepage. Its own photos are what show here — pick
            which product, no separate upload needed. Leave the dropdown on "Auto-select" to fall
            back to whichever Featured product costs the most (the old behavior).
          </p>
          <div className="flex flex-col gap-4">
            <select
              value={spotlightForm.productId}
              onChange={(e) => setSpotlightForm({ ...spotlightForm, productId: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
            >
              <option value="">Auto-select (highest-priced Featured product)</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input type="text" placeholder="Headline (optional — leave blank for the default)" value={spotlightForm.headline}
              onChange={(e) => setSpotlightForm({ ...spotlightForm, headline: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
            <textarea placeholder="Description (optional — leave blank for the default)" rows={3} value={spotlightForm.description}
              onChange={(e) => setSpotlightForm({ ...spotlightForm, description: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none" />
            <button onClick={() => updateSpotlight(spotlightForm)} className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors self-start">
              Save Spotlight
            </button>
          </div>
        </div>
      )}

      {lookForm && (
        <div>
          <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">Shop The Look</h2>
          <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-4">
            Pick up to 3 products to feature together, and a backdrop photo. Leave a product on
            "None" to fall back to the default (the first products in the catalog).
          </p>
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <select
                key={i}
                value={lookForm.productIds[i] || ''}
                onChange={(e) => updateLookProductId(i, e.target.value)}
                className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
              >
                <option value="">Item {i + 1}: None</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            ))}

            <input type="text" placeholder="Backdrop image URL" value={lookForm.backdropImage}
              onChange={(e) => setLookForm({ ...lookForm, backdropImage: e.target.value })}
              className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
            <label className="flex items-center gap-2 justify-center border-2 border-dashed border-gold/30 rounded-xl px-4 py-4 cursor-pointer hover:border-gold transition-colors">
              <Upload className="w-4 h-4 text-gold" />
              <span className="font-sans text-sm text-espresso dark:text-cream">
                {uploadingBackdrop ? 'Uploading…' : 'Or upload a backdrop photo directly'}
              </span>
              <input type="file" accept="image/*" onChange={handleBackdropUpload} className="hidden" disabled={uploadingBackdrop} />
            </label>
            {lookForm.backdropImage && (
              <img src={lookForm.backdropImage} alt="Backdrop preview" className="w-full h-40 object-cover rounded-xl" />
            )}

            <button onClick={() => updateLook(lookForm)} className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors self-start">
              Save Shop The Look
            </button>
          </div>
        </div>
      )}
    </div>
  )
}