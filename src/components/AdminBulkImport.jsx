import { useState } from 'react'
import Papa from 'papaparse'
import { supabase } from '../lib/supabaseClient'
import { formatPrice } from '../utils/formatPrice'
import { Upload, Check, AlertCircle } from 'lucide-react'

const REQUIRED_COLUMNS = ['name', 'price', 'category', 'image', 'stock']

function AdminBulkImport({ categories, onImported }) {
  const [rows, setRows] = useState([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validated = results.data.map((row, i) => validateRow(row, i))
        setRows(validated)
      },
    })
  }

  function validateRow(row, index) {
    const errors = []
    for (const col of REQUIRED_COLUMNS) {
      if (!row[col] || String(row[col]).trim() === '') {
        errors.push(`Missing ${col}`)
      }
    }
    if (row.price && isNaN(Number(row.price))) errors.push('Price must be a number')
    if (row.stock && isNaN(Number(row.stock))) errors.push('Stock must be a number')
    if (row.category && categories.length > 0 && !categories.some((c) => c.name.toLowerCase() === row.category.toLowerCase())) {
      errors.push(`Unknown category "${row.category}" — check spelling or add it in the Categories tab first`)
    }

    return { index, data: row, errors, valid: errors.length === 0 }
  }

  async function handleImport() {
    const validRows = rows.filter((r) => r.valid)
    if (validRows.length === 0) return

    setImporting(true)
    const payload = validRows.map((r) => ({
      name: r.data.name.trim(),
      price: Number(r.data.price),
      category: r.data.category.trim().toLowerCase(),
      image: r.data.image.trim(),
      images: r.data.image.trim() ? [r.data.image.trim()] : [],
      stock: Number(r.data.stock),
      status: 'active',
      is_new: true,
      is_featured: false,
    }))

    const { error } = await supabase.from('products').insert(payload)
    setImporting(false)

    if (error) {
      setResult({ success: false, message: error.message })
    } else {
      setResult({ success: true, message: `Imported ${validRows.length} product${validRows.length === 1 ? '' : 's'}.` })
      setRows([])
      setFileName('')
      onImported?.()
    }
  }

  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.length - validCount

  return (
    <div className="bg-gold/5 rounded-2xl p-6">
      <h2 className="font-sans text-sm uppercase tracking-widest text-gold mb-2">Bulk Import from CSV</h2>
      <p className="font-sans text-xs text-espresso/50 dark:text-cream/50 mb-4">
        For adding many real products at once. Your CSV needs these columns: <strong>name, price, category, image, stock</strong>.
        The image column should be a direct link to a photo you have the rights to use (e.g. one you've uploaded and copied the link for).
      </p>

      <label className="flex items-center gap-2 border border-dashed border-gold/40 rounded-xl px-4 py-3 cursor-pointer hover:border-gold transition-colors w-fit">
        <Upload className="w-4 h-4 text-gold" />
        <span className="font-sans text-sm text-espresso dark:text-cream">{fileName || 'Choose CSV file'}</span>
        <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
      </label>

      {rows.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1 font-sans text-xs text-green-600">
              <Check className="w-3.5 h-3.5" /> {validCount} ready
            </span>
            {invalidCount > 0 && (
              <span className="flex items-center gap-1 font-sans text-xs text-red-500">
                <AlertCircle className="w-3.5 h-3.5" /> {invalidCount} need fixing
              </span>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto flex flex-col gap-2 mb-4">
            {rows.map((r) => (
              <div
                key={r.index}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-sans ${
                  r.valid ? 'bg-green-500/5' : 'bg-red-500/5'
                }`}
              >
                {r.valid ? <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                <span className="flex-1 text-espresso dark:text-cream truncate">{r.data.name || '(no name)'}</span>
                {r.valid ? (
                  <span className="text-espresso/50 dark:text-cream/50">{formatPrice(Number(r.data.price))} · {r.data.category}</span>
                ) : (
                  <span className="text-red-500">{r.errors.join(', ')}</span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleImport}
            disabled={validCount === 0 || importing}
            className="bg-gold text-espresso font-sans text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
          >
            {importing ? 'Importing...' : `Import ${validCount} Product${validCount === 1 ? '' : 's'}`}
          </button>
        </div>
      )}

      {result && (
        <p className={`font-sans text-xs mt-3 ${result.success ? 'text-green-600' : 'text-red-500'}`}>
          {result.message}
        </p>
      )}
    </div>
  )
}

export default AdminBulkImport