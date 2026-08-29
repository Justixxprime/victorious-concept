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
]

const CATEGORIES = ['bags', 'shoes', 'clothing', 'perfumes', 'slippers', 'accessories']

export default async function handler(req, res) {
  const { data: products } = await supabase
    .from('products')
    .select('id, created_at, status')
    .neq('status', 'hidden')

  const urls = [
    ...STATIC_PAGES.map((path) => `${SITE_URL}/${path}`),
    ...CATEGORIES.map((cat) => `${SITE_URL}/category/${cat}`),
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