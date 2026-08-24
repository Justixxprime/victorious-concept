import SEO from '../components/SEO'
import RevealImage from '../components/RevealImage'

const posts = [
  {
    title: 'PLACEHOLDER: How It All Started',
    excerpt: 'PLACEHOLDER: a short excerpt about the founder journey.',
    topic: 'Founder Journey',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'PLACEHOLDER: Styling Your Everyday Bag',
    excerpt: 'PLACEHOLDER: a short styling tips excerpt.',
    topic: 'Style Tips',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'PLACEHOLDER: Behind the Sourcing',
    excerpt: 'PLACEHOLDER: a short excerpt about how products are sourced.',
    topic: 'Behind the Brand',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1200&q=80',
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
              <RevealImage
                src={post.image}
                alt={post.title}
                className="aspect-video rounded-2xl mb-5"
              />
              <span className="inline-block font-sans text-xs uppercase tracking-widest text-gold mb-3">
                {post.topic}
              </span>
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