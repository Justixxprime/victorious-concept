import { Helmet } from 'react-helmet-async'

function SEO({ title, description, image, url, jsonLd }) {
  const fullTitle = title
    ? `${title} | Victorious Concept`
    : 'Victorious Concept'
  const desc = description || 'Victorious Concept: bags, shoes, clothing, perfumes, slippers and accessories.'
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : undefined)

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={image ? 'product' : 'website'} />
      <meta property="og:site_name" content="Victorious Concept" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}

export default SEO