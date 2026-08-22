import SEO from '../components/SEO'
import RevealImage from '../components/RevealImage'
import { siteImages } from '../data/siteImages'

const timeline = [
  { label: 'University', text: 'Studied History and International Relations at Federal University Otuoke, Bayelsa State.' },
  { label: 'First Products', text: 'Started sourcing bags and shoes from Lagos Island market, drawing on her own Lagos roots.' },
  { label: 'First Customers', text: 'Friends and classmates on campus became her first customers, one WhatsApp order at a time.' },
  { label: 'Growing Business', text: 'Word spread beyond her immediate circle as the orders, and the trust, kept growing.' },
  { label: 'Graduation', text: 'Graduated from Federal University Otuoke with her degree in hand.' },
  { label: 'The Next Chapter', text: 'Now building Victorious Concept into a full, modern fashion and lifestyle brand.' },
]

const testimonials = [
  {
    quote: 'I have watched my sister turn a market run into a business since we were both figuring out who we wanted to be. Building her a real home for it online was the easiest yes I have ever given anyone.',
    name: 'Justice',
    relation: 'brother',
  },
  {
    quote: 'She used to disappear to Lagos Island on a Saturday and come back with the exact bag I described from a screenshot. I knew way before anyone else that this was going somewhere.',
    name: 'Naomi',
    relation: 'sister',
  },
  {
    quote: 'My sister has always had an eye for things other people miss. Watching Victorious Concept grow from her hostel room into an actual brand is honestly one of the coolest things I have seen up close.',
    name: 'Emmanuel',
    relation: 'brother',
  },
  {
    quote: 'She is my big sister and my favourite person to shop with, obviously, but even I did not expect the small WhatsApp order thing to turn into this. So proud does not even cover it.',
    name: 'Emmanuella',
    relation: 'sister',
  },
]

const values = [
  {
    title: 'Taste is not optional.',
    text: 'Anyone can sell you a bag. Not everyone can tell you which bag is actually worth carrying. Victorious Concept exists because Victoria could always tell the difference, and refused to pretend otherwise.',
  },
  {
    title: 'Fast is not the same as careless.',
    text: 'We move quickly because we respect your time, not because we are trying to get you off the page. Every piece that reaches you has already been checked by someone who genuinely cares whether you like it.',
  },
  {
    title: 'Small business energy, without the small business excuses.',
    text: 'We started in a hostel room, not a warehouse. That does not mean you should expect less. If anything, expect more, because we still remember what it felt like to be the customer waiting on a reply.',
  },
  {
    title: 'Nigerian first, without limits.',
    text: 'Lagos taught Victoria everything she knows about sourcing well. Victorious Concept is proudly Nigerian, proudly Lagos rooted, and building toward a day when that stamp travels well beyond one country.',
  },
  {
    title: 'You are not just a sale.',
    text: 'The first customers were friends. The next ones will be strangers. We plan to treat both exactly the same.',
  },
]

function About() {
  return (
    <section className="bg-cream dark:bg-espresso transition-colors">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4">
          Our Story
        </p>
        <h1 className="font-display italic font-semibold text-4xl md:text-5xl text-espresso dark:text-cream mb-10 leading-tight">
          She sourced for her friends. Now she's sourcing for you.
        </h1>

        <div className="flex flex-col gap-6 font-sans text-base text-espresso/80 dark:text-cream/80 leading-relaxed">
          <p>
            Every real brand starts with someone who simply refused to settle for what was in front of them.
            For Obioma Victoria Sopuruchi, that refusal started in a lecture hall at Federal University Otuoke,
            Bayelsa State, while she was deep into a degree in History and International Relations, the kind of
            course that teaches you how empires rise. Turns out it also teaches you how to build one, just a
            smaller, better dressed empire.
          </p>
          <p>
            Victoria grew up in Lagos, which meant she grew up around the market, the real one, Lagos Island,
            loud and chaotic and full of treasure if you know where to look. Most people who pass through it
            once never learn the language of it. Victoria did. She knew which stall had the good leather. She
            knew which trader would haggle honestly. She knew the difference between something that looked
            expensive and something that actually was.
          </p>
          <p>
            So when a friend on campus needed a bag for an event and had no time to travel home to source it
            herself, Victoria didn't think twice. She made the trip, found the piece, brought it back. Then
            another friend asked. Then a friend of that friend. What started as a favour turned into a pattern,
            and a pattern, if you're paying attention, is the first sketch of a business.
          </p>
          <p>
            By her second year, Victoria wasn't just helping out anymore, she was running something. Orders came
            in over WhatsApp. She learned to manage stock before she'd taken a single business class. She learned
            what customers actually meant when they said "something classy but not too much," which, if you've
            ever shopped for anyone, you know is its own language entirely. She built trust the old fashioned way,
            by consistently showing up with exactly what she promised.
          </p>
          <p>
            Victorious Concept was never a plan she wrote down first. It was a name that arrived after the work
            had already started, because by then, it needed one.
          </p>
        </div>
      </div>

      <RevealImage
        src={siteImages.aboutStory}
        alt="Lagos Island market, the origin of Victorious Concept"
        className="w-full aspect-[21/9]"
      />

      <div className="bg-espresso dark:bg-cream/5 text-cream dark:text-espresso py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-sans text-xs uppercase tracking-widest text-gold-light dark:text-gold mb-4">
            The Next Chapter
          </p>
          <h2 className="font-display italic font-semibold text-3xl md:text-4xl leading-tight">
            Now she has the degree. She still has the eye. And she is done keeping this
            beautiful little secret confined to one campus hallway.
          </h2>
          <p className="font-sans text-base mt-6 opacity-80">
            This is the part where Victorious Concept stops being "that girl who sources bags" and becomes a
            name you actually know, a real storefront, a real catalogue, a real brand built the same way it
            started: with taste, with hustle, and with zero patience for anything less than good.
          </p>
          <p className="font-display italic text-xl mt-6 text-gold-light dark:text-gold">
            Welcome to the next chapter. It has better lighting.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="flex flex-col gap-10">
          {timeline.map((step, i) => (
            <div key={step.label} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-gold flex-shrink-0" />
                {i !== timeline.length - 1 && (
                  <div className="w-px flex-1 bg-gold/30 mt-2" />
                )}
              </div>
              <div className="pb-4">
                <h3 className="font-sans text-xs uppercase tracking-widest text-gold mb-2">
                  {step.label}
                </h3>
                <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 max-w-xl">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 max-w-5xl mx-auto px-6 pt-16">
        <RevealImage
         src={siteImages.aboutMosaic1}
          alt="Fashion detail"
          className="aspect-[3/4]"
        />
        <RevealImage
          src={siteImages.aboutMosaic2}
          alt="Fashion detail"
          className="aspect-[3/4] mt-8"
        />
      </div>

            <div className="grid grid-cols-2 gap-2 max-w-5xl mx-auto px-6 pt-16">
        <RevealImage
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80"
          alt="Fashion detail"
          className="aspect-[3/4]"
        />
        <RevealImage
          src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1000&q=80"
          alt="Fashion detail"
          className="aspect-[3/4] mt-8"
        />
      </div>

            <div className="grid grid-cols-2 gap-2 max-w-5xl mx-auto px-6 pt-16">
        <RevealImage
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80"
          alt="Fashion detail"
          className="aspect-[3/4]"
        />
        <RevealImage
          src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1000&q=80"
          alt="Fashion detail"
          className="aspect-[3/4] mt-8"
        />
      </div>

            <div className="grid grid-cols-2 gap-2 max-w-5xl mx-auto px-6 pt-16">
        <RevealImage
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80"
          alt="Fashion detail"
          className="aspect-[3/4]"
        />
        <RevealImage
          src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1000&q=80"
          alt="Fashion detail"
          className="aspect-[3/4] mt-8"
        />
      </div>

         <div className="grid grid-cols-2 gap-2 max-w-5xl mx-auto px-6 pt-16">

        <RevealImage

          src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80"

          alt="Fashion detail"

          className="aspect-[3/4]"

        />

        <RevealImage

          src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1000&q=80"

          alt="Fashion detail"

          className="aspect-[3/4] mt-8"

        />

      </div>

      <div className="max-w-5xl mx-auto px-6 py-20 border-t border-gold/20">

        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2 text-center">

          Before The Website, There Was Us

        </p>
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 text-center mb-12 max-w-xl mx-auto">
          A few honest words from the people who watched Victorious Concept happen in real time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-gold/5 rounded-2xl p-6 flex flex-col gap-4">
              <p className="font-display italic text-lg text-espresso dark:text-cream leading-relaxed">
                "{t.quote}"
              </p>
              <p className="font-sans text-xs uppercase tracking-widest text-gold">
                {t.name}, {t.relation}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-24">
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2 text-center">
          What We Actually Believe
        </p>
        <p className="font-sans text-sm text-espresso/60 dark:text-cream/60 text-center mb-12">
          No mission statement generator was involved in the making of this list.
        </p>

        <div className="flex flex-col gap-8">
          {values.map((v) => (
            <div key={v.title} className="border-b border-gold/20 pb-8 last:border-b-0">
              <h3 className="font-display italic text-xl text-espresso dark:text-cream mb-2">
                {v.title}
              </h3>
              <p className="font-sans text-sm text-espresso/70 dark:text-cream/70 leading-relaxed">
                {v.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About