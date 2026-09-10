import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { compressImage } from '../../utils/compressImage'
import { siteImages as defaultSiteImages, categoryImages as defaultCategoryImages } from '../../data/siteImages'
import { Upload } from 'lucide-react'

const SITE_IMAGE_FIELDS = [
  { key: 'heroBackdrop', label: 'Homepage hero backdrop' },
  { key: 'aboutStory', label: 'About page, story photo' },
  { key: 'aboutMosaic1', label: 'About page, mosaic photo 1' },
  { key: 'aboutMosaic2', label: 'About page, mosaic photo 2' },
  { key: 'lookbookHero', label: 'Lookbook page hero' },
  { key: 'contactBanner', label: 'Contact page banner' },
  { key: 'categoryBanner', label: 'Category page, default banner' },
  { key: 'megaMenuBackdrop', label: 'Nav mega menu backdrop' },
  { key: 'shopBanner', label: 'Shop page banner' },
  { key: 'faqBanner', label: 'FAQ page banner' },
  { key: 'shippingBanner', label: 'Delivery / Returns / Track Order banner' },
  { key: 'sourceStoryBackdrop', label: 'Homepage sourcing-story backdrop' },
]

const CATEGORY_IMAGE_FIELDS = [
  { key: 'bags', label: 'Bags' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'clothing', label: 'Clothing' },
  { key: 'perfumes', label: 'Perfumes' },
  { key: 'slippers', label: 'Slippers' },
  { key: 'accessories', label: 'Accessories' },
]

function ImageRow({ fieldKey, label, currentUrl, isDefault, onChange, uploadingKey, setUploadingKey }) {
  const uploading = uploadingKey === fieldKey

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingKey(fieldKey)
    const compressed = await compressImage(file)
    const fileName = `site-images/${fieldKey}-${Date.now()}-${compressed.name}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, compressed)
    if (!error) {
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
      onChange(fieldKey, data.publicUrl)
    }
    setUploadingKey(null)
  }

  return (
    <div className="flex items-center gap-4 border border-gold/20 rounded-xl p-3">
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gold/10">
        {currentUrl && <img src={currentUrl} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-sans text-sm text-espresso dark:text-cream">{label}</span>
          {!isDefault && (
            <span className="font-sans text-[10px] uppercase tracking-widest text-gold-deep dark:text-gold flex-shrink-0">
              Custom
            </span>
          )}
        </div>
        <input
          type="text"
          value={currentUrl}
          placeholder="Image URL"
          onChange={(e) => onChange(fieldKey, e.target.value)}
          className="bg-transparent border border-gold/30 rounded-lg px-3 py-2 font-sans text-xs text-espresso dark:text-cream outline-none focus:border-gold"
        />
        <label className="inline-flex items-center gap-2 font-sans text-xs text-gold-deep dark:text-gold cursor-pointer w-fit">
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'Uploading…' : 'Upload photo instead'}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      {!isDefault && (
        <button
          onClick={() => onChange(fieldKey, null)}
          className="font-sans text-xs text-espresso/40 dark:text-cream/40 hover:text-red-500 transition-colors flex-shrink-0"
        >
          Reset
        </button>
      )}
    </div>
  )
}

export default function AdminImagesTab() {
  const { value, updateSetting } = useSiteSettings('site_images')
  const [form, setForm] = useState(null)
  const [uploadingKey, setUploadingKey] = useState(null)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    if (!form) {
      setForm({
        siteImages: (value && value.siteImages) || {},
        categoryImages: (value && value.categoryImages) || {},
      })
    }
  }, [value])

  if (!form) return null

  function updateField(section, fieldKey, newValue) {
    const nextSection = { ...form[section] }
    if (newValue === null || newValue === '') {
      delete nextSection[fieldKey]
    } else {
      nextSection[fieldKey] = newValue
    }
    setForm({ ...form, [section]: nextSection })
  }

  async function handleSave() {
    await updateSetting(form)
    setSavedAt(Date.now())
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold-deep dark:text-gold mb-2">
          Site Backdrops
        </h2>
        <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-4">
          Override any background photo used across the site. Leave blank to use the built-in default.
        </p>
        <div className="flex flex-col gap-3">
          {SITE_IMAGE_FIELDS.map((field) => {
            const override = form.siteImages[field.key]
            return (
              <ImageRow
                key={field.key}
                fieldKey={field.key}
                label={field.label}
                currentUrl={override || defaultSiteImages[field.key] || ''}
                isDefault={!override}
                onChange={(k, v) => updateField('siteImages', k, v)}
                uploadingKey={uploadingKey}
                setUploadingKey={setUploadingKey}
              />
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold-deep dark:text-gold mb-2">
          Category Photos
        </h2>
        <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-4">
          Shown on category pages, the homepage category grid, and the nav mega menu, until real
          product photography replaces them.
        </p>
        <div className="flex flex-col gap-3">
          {CATEGORY_IMAGE_FIELDS.map((field) => {
            const override = form.categoryImages[field.key]
            return (
              <ImageRow
                key={field.key}
                fieldKey={field.key}
                label={field.label}
                currentUrl={override || defaultCategoryImages[field.key] || ''}
                isDefault={!override}
                onChange={(k, v) => updateField('categoryImages', k, v)}
                uploadingKey={uploadingKey}
                setUploadingKey={setUploadingKey}
              />
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors self-start"
        >
          Save Site Images
        </button>
        {savedAt && (
          <span className="font-sans text-xs text-espresso/50 dark:text-cream/50">Saved</span>
        )}
      </div>
    </div>
  )
}
