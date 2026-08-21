import SEO from '../components/SEO'

const posts = [
  {
    title: 'PLACEHOLDER: How It All Started',
    excerpt: 'PLACEHOLDER: a short excerpt about the founder journey.',
  },
  {
    title: 'PLACEHOLDER: Styling Your Everyday Bag',
    excerpt: 'PLACEHOLDER: a short styling tips excerpt.',
  },
  {
    title: 'PLACEHOLDER: Behind the Sourcing',
    excerpt: 'PLACEHOLDER: a short excerpt about how products are sourced.',
  },
]

function Journal() {
  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-16 px-6 min-h-screen">
      <SEO title="Journal" description="Stories, styling tips and updates from Victorious Concept." />
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-12">
          Journal
        </h1>

        <div className="flex flex-col gap-10">
          {posts.map((post) => (
            <article key={post.title} className="border-b border-gold/20 pb-10">
              <div className="aspect-video rounded-2xl bg-gold/10 flex items-center justify-center mb-5">
                <span className="font-sans text-xs text-espresso/40 dark:text-cream/40 uppercase tracking-wide">
                  Image coming soon
                </span>
              </div>
              <h2 className="font-display italic text-2xl text-espresso dark:text-cream mb-2">
                {post.title}
              </h2>
              <p className="font-sans text-sm text-espresso/60 dark:text-cream/60">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Journal