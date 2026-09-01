import { useState, useEffect } from 'react'
import { useSiteSettings } from '../../hooks/useSiteSettings'

export default function AdminContentTab() {
  const { value: heroValue, updateSetting: updateHero } = useSiteSettings('hero')
  const [heroForm, setHeroForm] = useState(null)

  useEffect(() => {
    if (heroValue && !heroForm) setHeroForm(heroValue)
  }, [heroValue])

  if (!heroForm) return null

  return (
    <div className="max-w-lg flex flex-col gap-4">
      <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">Hero Section</h2>
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
  )
}
