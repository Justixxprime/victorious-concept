import { createClient } from '@supabase/supabase-js'

// Read-only public data — the anon key is appropriate here, same as the
// browser already uses to list products.
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const SITE_URL = 'https://victorious-concept.vercel.app'

const STATIC_PAGES = [
  '',
  'shop',
  'about',
  'lookbook',
  'journal',
  'source',
  'contact',
  'faq',
  'delivery',
  'returns',
  'collections',
]

// Journal posts are code-defined content (src/data/journalPosts.js), not
// admin-editable via the database, so their slugs are listed here directly
// alongside the other static pages rather than fetched live.
const JOURNAL_SLUGS = [
  'from-lagos-island-to-your-doorstep',
  'how-to-style-one-bag-three-ways',
  'why-we-source-instead-of-just-stock',
]

export default async function handler(req, res) {
  const [{ data: products }, { data: categories }, { data: collections }] = await Promise.all([
    supabase.from('products').select('id, created_at, status').neq('status', 'hidden'),
    // Fetched live rather than hardcoded, so a category added via Admin
    // shows up here automatically, without needing a code change.
    supabase.from('categories').select('id'),
    supabase.from('collections').select('slug'),
  ])

  const urls = [
    ...STATIC_PAGES.map((path) => `${SITE_URL}/${path}`),
    ...JOURNAL_SLUGS.map((slug) => `${SITE_URL}/journal/${slug}`),
    ...(categories || []).map((c) => `${SITE_URL}/category/${c.id}`),
    ...(collections || []).map((c) => `${SITE_URL}/collection/${c.slug}`),
    ...(products || []).map((p) => ({
      loc: `${SITE_URL}/product/${p.id}`,
      lastmod: p.created_at,
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) =>
    typeof u === 'string'
      ? `  <url><loc>${u}</loc></url>`
      : `  <url><loc>${u.loc}</loc><lastmod>${new Date(u.lastmod).toISOString().split('T')[0]}</lastmod></url>`
  )
  .join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
  return res.status(200).send(xml)
}