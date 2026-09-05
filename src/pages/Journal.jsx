import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import RevealImage from '../components/RevealImage'
import { siteImages, categoryImages } from '../data/siteImages'

const posts = [
  {
    title: 'From Lagos Island to Your Doorstep',
    excerpt:
      'Victorious Concept started the way most real things do. Small, and out of necessity. While still in school, our founder began sourcing bags and shoes from Lagos Island market for friends on campus who wanted something specific and couldn\'t find it themselves. What started as favors between friends grew into a business built on the same instinct: go find the exact thing someone actually wants, and bring it back.',
    topic: 'Founder Journey',
    image: siteImages.aboutStory,
  },
  {
    title: 'How to Style One Bag Three Ways',
    excerpt:
      'A great bag earns its place by working harder than one outfit. Wear it structured with tailored pieces for the office, sling it crossbody over a simple dress for errands, or let it anchor an all-black look for a night out. The trick is choosing a piece with a shape confident enough to move between all three, which is exactly what we look for before anything gets listed.',
    topic: 'Style Tips',
    image: categoryImages.bags,
  },
  {
    title: 'Why We Source Instead of Just Stock',
    excerpt:
      'Most stores stock whatever\'s already available. We do the opposite. Someone tells us what they\'re picturing, and we go looking until we find it, wherever that takes us. It\'s slower, and it means every item on this site was chosen on purpose, not picked from a catalog. That philosophy is also why Source It For Me exists as its own feature, because sourcing was never a side function here, it was the whole starting point.',
    topic: 'Behind the Brand',
    image: siteImages.aboutMosaic1,
  },
]

function Journal() {
  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-16 px-6 min-h-screen">
      <SEO title="Journal" description="Stories, styling tips and updates from Victorious Concept." />
      <div className="max-w-4xl mx-auto">
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4">
          Stories &amp; Updates
        </p>
        <h1 className="font-display italic font-semibold text-4xl text-espresso dark:text-cream mb-12">
          Journal
        </h1>

        <div className="flex flex-col gap-10">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="border-b border-gold/20 pb-10"
            >
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
              <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 leading-relaxed">
                {post.excerpt}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Journal