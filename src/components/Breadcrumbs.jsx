import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

function Breadcrumbs({ items }) {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.to ? `https://victorious-concept.vercel.app${item.to}` : undefined,
    })),
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-sans text-xs text-espresso/50 dark:text-cream/50 mb-6 flex-wrap">
        {items.map((item, i) => (
          <span key={item.label} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="w-3 h-3" />}
            {item.to ? (
              <Link to={item.to} className="hover:text-gold transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-espresso dark:text-cream">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}

export default Breadcrumbs