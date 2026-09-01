import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAdminWrite } from '../../hooks/useAdminWrite'
import { Trash2, Pencil } from 'lucide-react'

const EMPTY_FORM = { name: '', slug: '', description: '', image: '', product_ids: [] }

export default function AdminCollectionsTab({ collections, refetchCollections, products }) {
  const runWrite = useAdminWrite()
  const [collectionForm, setCollectionForm] = useState(EMPTY_FORM)
  const [editingCollection, setEditingCollection] = useState(null)

  function toggleProductInCollection(productId) {
    setCollectionForm((prev) => {
      const id = String(productId)
      const exists = prev.product_ids.includes(id)
      return {
        ...prev,
        product_ids: exists ? prev.product_ids.filter((p) => p !== id) : [...prev.product_ids, id],
      }
    })
  }

  async function saveCollection() {
    const slug = collectionForm.slug || collectionForm.name.toLowerCase().replace(/\s+/g, '-')
    const payload = { ...collectionForm, slug }
    let ok
    if (editingCollection) {
      ok = await runWrite(supabase.from('collections').update(payload).eq('id', editingCollection), 'Saving collection')
    } else {
      ok = await runWrite(supabase.from('collections').insert(payload), 'Adding collection')
    }
    if (!ok) return
    setCollectionForm(EMPTY_FORM)
    setEditingCollection(null)
    refetchCollections()
  }

  function startEditCollection(col) {
    setEditingCollection(col.id)
    setCollectionForm({
      name: col.name,
      slug: col.slug,
      description: col.description || '',
      image: col.image || '',
      product_ids: col.product_ids || [],
    })
  }

  async function deleteCollection(id) {
    if (!confirm('Delete this collection?')) return
    const ok = await runWrite(supabase.from('collections').delete().eq('id', id), 'Deleting collection')
    if (!ok) return
    refetchCollections()
  }

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <div className="bg-gold/5 rounded-2xl p-6">
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">{editingCollection ? 'Edit Collection' : 'New Collection'}</h2>
        <div className="flex flex-col gap-3 mb-4">
          <input type="text" placeholder="Collection name" value={collectionForm.name} onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
          <textarea placeholder="Short description" rows={2} value={collectionForm.description} onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold resize-none" />
          <input type="text" placeholder="Cover image URL (optional)" value={collectionForm.image} onChange={(e) => setCollectionForm({ ...collectionForm, image: e.target.value })}
            className="bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
        </div>
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">Select Products</p>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-3 border border-gold/10 rounded-lg p-2">
              <input type="checkbox" checked={collectionForm.product_ids.includes(String(p.id))} onChange={() => toggleProductInCollection(p.id)} />
              <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
              <span className="font-sans text-xs text-espresso dark:text-cream">{p.name}</span>
            </label>
          ))}
        </div>
        <button onClick={saveCollection} disabled={!collectionForm.name} className="bg-gold text-espresso font-sans font-medium px-6 py-3 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40">
          {editingCollection ? 'Save Changes' : 'Create Collection'}
        </button>
      </div>
      <div>
        <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-4">Existing Collections</h2>
        <div className="flex flex-col gap-2">
          {collections.map((col) => (
            <div key={col.id} className="flex items-center gap-3 border border-gold/20 rounded-xl p-4">
              <span className="flex-1 font-sans text-sm text-espresso dark:text-cream">{col.name} <span className="text-espresso/40 dark:text-cream/40">({col.product_ids?.length || 0} items)</span></span>
              <button onClick={() => startEditCollection(col)} aria-label="Edit collection"><Pencil className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-gold" /></button>
              <button onClick={() => deleteCollection(col.id)} aria-label="Delete collection"><Trash2 className="w-4 h-4 text-espresso/50 dark:text-cream/50 hover:text-red-500" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
