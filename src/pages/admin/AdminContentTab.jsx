import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { compressImage } from '../../utils/compressImage'
import { Upload, Plus, Trash2 } from 'lucide-react'

const MAX_LOOKS = 4
const PRODUCTS_PER_LOOK = 3

function emptyLook() {
  return { title: '', description: '', productIds: Array(PRODUCTS_PER_LOOK).fill('') }
}

export default function AdminContentTab({ products }) {
  const { value: heroValue, updateSetting: updateHero } = useSiteSettings('hero')
  const [heroForm, setHeroForm] = useState(null)

  const { value: spotlightValue, updateSetting: updateSpotlight } = useSiteSettings('spotlight')
  const [spotlightForm, setSpotlightForm] = useState(null)

  const { value: lookValue, updateSetting: updateLook } = useSiteSettings('shop_the_look')
  const [lookForm, setLookForm] = useState(null)
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false)

  const { value: looksValue, updateSetting: updateLooks } = useSiteSettings('lookbook_looks')
  const [looksForm, setLooksForm] = useState(null)

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

  useEffect(() => {
    if (!looksForm) setLooksForm(looksValue && looksValue.length ? looksValue : [emptyLook()])
  }, [looksValue])

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

  function updateLookField(lookIndex, field, value) {
    const next = looksForm.map((look, i) => (i === lookIndex ? { ...look, [field]: value } : look))
    setLooksForm(next)
  }

  function updateLookProduct(lookIndex, productIndex, value) {
    const next = looksForm.map((look, i) => {
      if (i !== lookIndex) return look
      const nextProductIds = [...look.productIds]
      nextProductIds[productIndex] = value
      return { ...look, productIds: nextProductIds }
    })
    setLooksForm(next)
  }

  function addLook() {
    if (looksForm.length >= MAX_LOOKS) return
    setLooksForm([...looksForm, emptyLook()])
  }

  function removeLook(index) {
    setLooksForm(looksForm.filter((_, i) => i !== index))
  }

  async function saveLooks() {
    // Drop looks that don't have at least 2 real products picked and a
    // title — a half-filled look isn't worth showing on the live site.
    const validLooks = looksForm.filter(
      (look) => look.title.trim() && look.productIds.filter(Boolean).length >= 2
    )
    await updateLooks(validLooks)
  }

  return (
    <div className="max-w-lg flex flex-col gap-12">
      {heroForm && (
        <div>
          <h2 className="font-sans text-sm uppercase tracking-widest text-gold-deep dark:text-gold mb-2">Hero Section</h2>
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
          <h2 className="font-sans text-sm uppercase tracking-widest text-gold-deep dark:text-gold mb-2">The Spotlight</h2>
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
          <h2 className="font-sans text-sm uppercase tracking-widest text-gold-deep dark:text-gold mb-2">Shop The Look</h2>
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

      {looksForm && (
        <div>
          <h2 className="font-sans text-sm uppercase tracking-widest text-gold-deep dark:text-gold mb-2">Lookbook Styled Looks</h2>
          <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-4">
            Group 2 to 3 real products into a named look (e.g. "The Weekend Look") shown as its
            own featured story on the Lookbook page. A look needs a title and at least 2 products
            picked to appear live. Up to {MAX_LOOKS} looks.
          </p>
          <div className="flex flex-col gap-8">
            {looksForm.map((look, lookIndex) => (
              <div key={lookIndex} className="border border-gold/20 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs uppercase tracking-widest text-espresso/50 dark:text-cream/50">
                    Look {lookIndex + 1}
                  </span>
                  <button
                    onClick={() => removeLook(lookIndex)}
                    aria-label={`Remove look ${lookIndex + 1}`}
                    className="text-espresso/40 dark:text-cream/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Look title (e.g. The Weekend Look)"
                  value={look.title}
                  onChange={(e) => updateLookField(lookIndex, 'title', e.target.value)}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                />
                <textarea
                  placeholder="Short description (optional)"
                  rows={2}
                  value={look.description}
                  onChange={(e) => updateLookField(lookIndex, 'description', e.target.value)}
                  className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none"
                />
                {look.productIds.map((productId, productIndex) => (
                  <select
                    key={productIndex}
                    value={productId}
                    onChange={(e) => updateLookProduct(lookIndex, productIndex, e.target.value)}
                    className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold"
                  >
                    <option value="">Item {productIndex + 1}: None</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                ))}
              </div>
            ))}

            {looksForm.length < MAX_LOOKS && (
              <button
                onClick={addLook}
                className="flex items-center justify-center gap-2 border-2 border-dashed border-gold/30 rounded-xl px-4 py-4 hover:border-gold transition-colors font-sans text-sm text-espresso dark:text-cream"
              >
                <Plus className="w-4 h-4" /> Add another look
              </button>
            )}

            <button onClick={saveLooks} className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors self-start">
              Save Styled Looks
            </button>
          </div>
        </div>
      )}
    </div>
  )
}