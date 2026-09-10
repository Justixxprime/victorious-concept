import { siteImages, categoryImages } from './siteImages'

// Full journal post content. `excerpt` is the short teaser shown on the
// Journal list page; `body` is an array of paragraphs shown on the post's
// own detail page. Keep new copy dash-free, consistent with the rest of
// the site.
export const journalPosts = [
  {
    slug: 'from-lagos-island-to-your-doorstep',
    title: 'From Lagos Island to Your Doorstep',
    excerpt:
      'Victorious Concept started the way most real things do. Small, and out of necessity. While still in school, our founder began sourcing bags and shoes from Lagos Island market for friends on campus who wanted something specific and couldn\'t find it themselves. What started as favors between friends grew into a business built on the same instinct: go find the exact thing someone actually wants, and bring it back.',
    topic: 'Founder Journey',
    image: siteImages.aboutStory,
    body: [
      'Victorious Concept started the way most real things do. Small, and out of necessity. While still a student at Federal University Otuoke, our founder began sourcing bags and shoes from Lagos Island market for friends on campus who wanted something specific and could not find it themselves.',
      'It usually went the same way. A friend would describe a bag they had seen somewhere, or a pair of shoes a cousin wore to a wedding, and ask if she could find something close to it. She would take the request seriously, the way you take a favor for someone you actually like. Off to Lagos Island she would go, and later to Trade Fair, walking rows of stalls until something matched what had been described, or came close enough to feel worth bringing back.',
      'What started as favors between friends grew into something with its own shape. People who were not friends of friends started asking. Requests got more specific. Eventually there were more people asking than there was time to help one at a time, and the sourcing trips stopped being occasional and started being a rhythm.',
      'That rhythm is still the whole business, just with a storefront around it now. Every product listed here passed through the same instinct that sent a student walking through Lagos Island for a friend: go find the exact thing someone actually wants, and bring it back. The website changed the scale, not the method.',
    ],
  },
  {
    slug: 'how-to-style-one-bag-three-ways',
    title: 'How to Style One Bag Three Ways',
    excerpt:
      'A great bag earns its place by working harder than one outfit. Wear it structured with tailored pieces for the office, sling it crossbody over a simple dress for errands, or let it anchor an all-black look for a night out. The trick is choosing a piece with a shape confident enough to move between all three, which is exactly what we look for before anything gets listed.',
    topic: 'Style Tips',
    image: categoryImages.bags,
    body: [
      'A great bag earns its place by working harder than one outfit. Before anything gets listed on this site, we ask whether it can move between at least a few different days in someone\'s life, not just one. Here is what that looks like in practice, using the same bag three different ways.',
      'For the office, structure does the talking. Pair a bag with clean lines and a firm shape against tailored trousers or a fitted skirt, and let it sit at the elbow rather than across the body. The formality of the bag should roughly match the formality of the room. A soft, slouchy shape can undercut an otherwise sharp outfit, so save those for days off.',
      'For errands and the in-between hours of a day, the same bag can go crossbody over something simple, a plain dress or jeans and a shirt. This is where a bag earns its keep the most, because it needs to disappear a little, sit comfortably for hours, and still look intentional in photos you did not plan to take.',
      'For a night out, let the bag anchor an all-black look rather than compete with it. A single accent, a chain strap, a hardware detail, a distinct texture, does more here than color. The trick across all three looks is choosing a piece with a shape confident enough to hold its own in very different settings, which is exactly what we look for before anything gets listed here.',
    ],
  },
  {
    slug: 'why-we-source-instead-of-just-stock',
    title: 'Why We Source Instead of Just Stock',
    excerpt:
      'Most stores stock whatever\'s already available. We do the opposite. Someone tells us what they\'re picturing, and we go looking until we find it, wherever that takes us. It\'s slower, and it means every item on this site was chosen on purpose, not picked from a catalog. That philosophy is also why Source It For Me exists as its own feature, because sourcing was never a side function here, it was the whole starting point.',
    topic: 'Behind the Brand',
    image: siteImages.aboutMosaic1,
    body: [
      'Most stores stock whatever is already available and hope it matches what people want. We do the opposite. Someone tells us what they are picturing, and we go looking until we find it, wherever that takes us. It is slower, and it means every item on this site was chosen on purpose, not picked from a catalog because a supplier had extra stock to move.',
      'This is not a marketing angle we added after the fact. It is the reason the business exists at all. Before there was a website, before there was a catalog of any kind, there was just a person asking a favor and someone willing to go find the exact thing, not a close substitute.',
      'That is also why Source It For Me exists as its own feature rather than a footnote. If you want something specific, a particular bag you saw on someone, a style of shoe you cannot find locally, you can ask directly instead of settling for whatever happens to be listed. Sourcing was never a side function here. It was the whole starting point, and the storefront grew up around it.',
      'The tradeoff is honest: sourcing takes longer than pulling something off a shelf. We think that is a fair trade for getting the thing you actually wanted, rather than the thing that happened to be in stock.',
    ],
  },
]

export function getJournalPostBySlug(slug) {
  return journalPosts.find((post) => post.slug === slug) || null
}

// Rough estimate only, derived from the post's own word count (about 200
// words per minute) — not a fabricated or hardcoded figure.
export function estimateReadMinutes(post) {
  const wordCount = post.body.join(' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(wordCount / 200))
}
