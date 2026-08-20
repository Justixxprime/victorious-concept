import { Helmet } from 'react-helmet-async'

function SEO({ title, description }) {
  const fullTitle = title
    ? `${title} | Victorious Concept`
    : 'Victorious Concept'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || 'Victorious Concept: bags, shoes, clothing, perfumes, slippers and accessories.'} />
    </Helmet>
  )
}

export default SEO