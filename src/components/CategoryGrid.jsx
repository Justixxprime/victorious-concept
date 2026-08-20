import { Link } from 'react-router-dom'
import { categories } from '../data/categories'

function CategoryGrid() {
  return (
    <section className="bg-cream dark:bg-espresso transition-colors py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display italic font-semibold text-3xl md:text-4xl text-espresso dark:text-cream mb-10">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className="group flex flex-col items-center justify-center gap-3 aspect-square rounded-2xl border border-gold/20 hover:border-gold bg-gold/5 hover:bg-gold/10 transition-all"
            >
              <span className="font-sans text-sm uppercase tracking-wide text-espresso dark:text-cream group-hover:text-gold transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoryGrid