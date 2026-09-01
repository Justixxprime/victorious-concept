import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAdminWrite } from '../../hooks/useAdminWrite'
import { Trash2, Plus, Tag } from 'lucide-react'

export default function AdminCategoriesTab({ categories, refetchCategories }) {
  const runWrite = useAdminWrite()
  const [newCategoryName, setNewCategoryName] = useState('')

  async function addCategory() {
    if (!newCategoryName.trim()) return
    const id = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-')
    const ok = await runWrite(
      supabase.from('categories').insert({ id, name: newCategoryName.trim(), sort_order: categories.length + 1 }),
      'Adding category'
    )
    if (!ok) return
    setNewCategoryName('')
    refetchCategories()
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return
    const ok = await runWrite(supabase.from('categories').delete().eq('id', id), 'Deleting category')
    if (!ok) return
    refetchCategories()
  }

  async function saveCategoryDescription(id, description) {
    await runWrite(supabase.from('categories').update({ description }).eq('id', id), 'Saving category description')
  }

  return (
    <div className="max-w-lg">
      <div className="flex gap-2 mb-8">
        <input type="text" placeholder="New category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1 bg-transparent border border-gold/30 rounded-xl px-4 py-3 font-sans text-sm text-espresso dark:text-cream outline-none focus:border-gold" />
        <button onClick={addCategory} className="flex items-center gap-2 bg-gold text-espresso font-sans font-medium px-5 rounded-full hover:bg-gold-light transition-colors">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="border border-gold/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Tag className="w-4 h-4 text-gold flex-shrink-0" />
              <span className="flex-1 font-sans text-sm text-espresso dark:text-cream">{cat.name}</span>
              <button onClick={() => deleteCategory(cat.id)} aria-label="Delete category"><Trash2 className="w-4 h-4 text-espresso/40 dark:text-cream/40 hover:text-red-500" /></button>
            </div>
            <textarea placeholder="Short introduction (optional)" rows={2} defaultValue={cat.description || ''}
              onBlur={(e) => saveCategoryDescription(cat.id, e.target.value)}
              className="w-full bg-transparent border border-gold/20 rounded-lg px-3 py-2 font-sans text-xs text-espresso dark:text-cream outline-none focus:border-gold resize-none" />
          </div>
        ))}
      </div>
    </div>
  )
}
