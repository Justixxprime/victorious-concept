import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

function ProductGallery({ images, alt, videoUrl }) {
  const [active, setActive] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  function next() {
    setActive((i) => (i + 1) % images.length)
  }
  function prev() {
    setActive((i) => (i - 1 + images.length) % images.length)
  }

  return (
    <div>
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-gold/10 cursor-zoom-in"
        onClick={() => setFullscreen(true)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={alt}
            loading="lazy"
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
      </div>

      {videoUrl && (
        <div className="mt-4">
          <video controls className="w-full rounded-2xl" poster={images[0]}>
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      )}

      {images.length > 1 && (
        <div className="flex gap-2 mt-3">

      {images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                i === active ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            className="fixed inset-0 bg-espresso/95 z-[70] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreen(false)}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-6 right-6 text-cream"
              aria-label="Close"
            >
              <X className="w-7 h-7" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  className="absolute left-4 sm:left-8 text-cream"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next() }}
                  className="absolute right-4 sm:right-8 text-cream"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <motion.img
              key={active}
              src={images[active]}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductGallery