import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import SEO from '../components/SEO'
import RevealImage from '../components/RevealImage'
import { journalPosts, getJournalPostBySlug, estimateReadMinutes } from '../data/journalPosts'
import { useEditorialCursor } from '../context/CursorContext'

function JournalPost() {
  const { slug } = useParams()
  const post = getJournalPostBySlug(slug)
  const cursor = useEditorialCursor()

  if (!post) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display italic text-3xl text-espresso dark:text-cream">
          Story not found
        </h1>
        <Link to="/journal" className="text-gold hover:underline">
          Back to Journal
        </Link>
      </div>
    )
  }

  const related = journalPosts.filter((p) => p.slug !== post.slug).slice(0, 2)

  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-16 px-6 min-h-screen">
      <SEO title={post.title} description={post.excerpt} />
      <div className="max-w-3xl mx-auto">
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-gold-deep dark:text-gold mb-8 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Journal
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="font-sans text-xs uppercase tracking-widest text-gold-deep dark:text-gold">
            {post.topic}
          </span>
          <span className="w-1 h-1 rounded-full bg-espresso/30 dark:bg-cream/30" />
          <span className="font-sans text-xs text-espresso/50 dark:text-cream/50">
            {estimateReadMinutes(post)} min read
          </span>
        </div>

        <h1 className="font-display italic font-semibold text-4xl md:text-5xl text-espresso dark:text-cream mb-10 leading-tight">
          {post.title}
        </h1>

        <RevealImage
          src={post.image}
          alt={post.title}
          className="aspect-video rounded-2xl mb-10"
        />

        <div className="flex flex-col gap-6">
          {post.body.map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-base text-espresso/80 dark:text-cream/80 leading-relaxed"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>

        {related.length > 0 && (
          <div className="mt-20 pt-10 border-t border-gold/20">
            <p className="font-sans text-xs uppercase tracking-widest text-gold-deep dark:text-gold mb-6">
              More from the Journal
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/journal/${r.slug}`}
                  onMouseEnter={() => cursor.show('Read Story')}
                  onMouseLeave={cursor.hide}
                  className="group block"
                >
                  <RevealImage
                    src={r.image}
                    alt={r.title}
                    className="aspect-video rounded-2xl mb-3"
                  />
                  <h3 className="font-display italic text-lg text-espresso dark:text-cream group-hover:text-gold-deep dark:group-hover:text-gold transition-colors">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default JournalPost
