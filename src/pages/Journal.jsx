import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import SEO from '../components/SEO'
import RevealImage from '../components/RevealImage'
import { journalPosts, estimateReadMinutes } from '../data/journalPosts'
import { useEditorialCursor } from '../context/CursorContext'

function Journal() {
  const cursor = useEditorialCursor()

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-16 px-6 min-h-screen">
      <SEO title="Journal" description="Stories, styling tips and updates from Victorious Concept." />
      <div className="max-w-4xl mx-auto">
        <p className="font-sans text-xs uppercase tracking-widest text-gold-deep dark:text-gold mb-4">
          Stories &amp; Updates
        </p>
        <h1 className="font-display italic font-semibold text-4xl md:text-5xl text-espresso dark:text-cream mb-12">
          Journal
        </h1>

        <div className="flex flex-col gap-10">
          {journalPosts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="border-b border-gold/20 pb-10"
            >
              <Link
                to={`/journal/${post.slug}`}
                onMouseEnter={() => cursor.show('Read Story')}
                onMouseLeave={cursor.hide}
                className="group block"
              >
                <div className="relative">
                  <RevealImage
                    src={post.image}
                    alt={post.title}
                    className="aspect-video rounded-2xl mb-5"
                  />
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-cream/90 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 text-espresso" />
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-block font-sans text-xs uppercase tracking-widest text-gold-deep dark:text-gold">
                    {post.topic}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-espresso/30 dark:bg-cream/30" />
                  <span className="font-sans text-xs text-espresso/50 dark:text-cream/50">
                    {estimateReadMinutes(post)} min read
                  </span>
                </div>
                <h2 className="font-display italic text-2xl text-espresso dark:text-cream mb-2 group-hover:text-gold-deep dark:group-hover:text-gold transition-colors">
                  {post.title}
                </h2>
                <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 leading-relaxed">
                  {post.excerpt}
                </p>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Journal
