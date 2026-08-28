// One-time starter catalog for Victorious Concept.
// - Bags, Shoes and Slippers use Victoria's REAL original product names and
//   real prices from her first site. Photos here are honest stock-photo
//   stand-ins (the real netlify.app photo links could not be verified as
//   still live) - swap for real product photography in Admin whenever ready.
// - Clothing, Perfumes and Accessories are new categories with prices
//   grounded in the current Nigerian market (Ankara dresses, oud/designer
//   perfume oils, fashion jewelry) as of August 2026.
// Every product below has its own distinct photo - no duplicates.

export const starterCatalog = [
  // ---- BAGS (real names & prices) ----
  { name: 'Off White Bag', price: 24000, category: 'bags', stock: 5, status: 'active', is_new: true, is_featured: true, image: 'https://images.unsplash.com/photo-1682745230951-8a5aa9a474a0?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cherry Print Bag', price: 24000, category: 'bags', stock: 5, status: 'active', is_new: true, is_featured: false, image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Dior Lady Bag', price: 22000, category: 'bags', stock: 5, status: 'active', is_new: false, is_featured: true, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Edin Bag', price: 22000, category: 'bags', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Louis Vuitton Pochette', price: 20000, category: 'bags', stock: 5, status: 'active', is_new: false, is_featured: true, image: 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Polene Bag', price: 48000, category: 'bags', stock: 5, status: 'active', is_new: true, is_featured: true, image: 'https://images.unsplash.com/photo-1614179689702-355944cd0918?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Top Handle Bag', price: 12000, category: 'bags', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Bow Bag', price: 15000, category: 'bags', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1705909237050-7a7625b47fac?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Shopping Tote Bag', price: 18000, category: 'bags', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Quilted Mini Bag', price: 13000, category: 'bags', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Striped Tote Bag', price: 23000, category: 'bags', stock: 5, status: 'active', is_new: true, is_featured: false, image: 'https://images.unsplash.com/photo-1597633125184-9fd7e54f0ff7?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Top Handle Monogram Bag', price: 16000, category: 'bags', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1613482184972-f9c1022d0928?auto=format&fit=crop&w=1200&q=80' },

  // ---- SHOES & SLIPPERS (real names & prices) ----
  { name: 'Slippers', price: 18000, category: 'slippers', stock: 5, status: 'active', is_new: false, is_featured: true, image: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Balenciaga Style Slippers', price: 18000, category: 'slippers', stock: 5, status: 'active', is_new: true, is_featured: false, image: 'https://images.unsplash.com/photo-1590099033615-be195f8d575c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Flower Heels', price: 22000, category: 'shoes', stock: 5, status: 'active', is_new: false, is_featured: true, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Luxury Slippers', price: 19000, category: 'slippers', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1553545985-1e0d8781d5db?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Wedge Slipper', price: 23000, category: 'slippers', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1581101767113-1677fc2beaa8?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Heels', price: 28000, category: 'shoes', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?auto=format&fit=crop&w=1200&q=80' },

  // ---- CLOTHING (new - Nigerian market pricing) ----
  { name: 'Ankara Wrap Dress', price: 25000, category: 'clothing', stock: 5, status: 'active', is_new: true, is_featured: true, image: 'https://images.unsplash.com/photo-1696962678565-bee84e6b9cb6?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Floral Print Maxi Dress', price: 22000, category: 'clothing', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1628144029346-8a98676311b6?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Two-Piece Ankara Set', price: 28000, category: 'clothing', stock: 5, status: 'active', is_new: true, is_featured: true, image: 'https://images.unsplash.com/photo-1681545290284-679e6291c440?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Bubu Gown', price: 18000, category: 'clothing', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1709809081557-78f803ce93a0?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Traditional Print Dress', price: 26000, category: 'clothing', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1687052093309-7a14efa58ecb?auto=format&fit=crop&w=1200&q=80' },

  // ---- PERFUMES (new - Nigerian market pricing) ----
  { name: 'Oud Intense 50ml', price: 25000, category: 'perfumes', stock: 5, status: 'active', is_new: true, is_featured: true, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Signature Eau de Parfum 100ml', price: 40000, category: 'perfumes', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Floral Musk 30ml', price: 18000, category: 'perfumes', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Amber Oud Rollerball', price: 15000, category: 'perfumes', stock: 5, status: 'active', is_new: true, is_featured: false, image: 'https://images.unsplash.com/photo-1718466044521-d38654f3ba0a?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Rose Gold Eau de Toilette', price: 22000, category: 'perfumes', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1613521140785-e85e427f8002?auto=format&fit=crop&w=1200&q=80' },

  // ---- ACCESSORIES (new - Nigerian market pricing) ----
  { name: 'Gold Layered Necklace Set', price: 15000, category: 'accessories', stock: 5, status: 'active', is_new: true, is_featured: true, image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Statement Hoop Earrings', price: 8000, category: 'accessories', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Chain Bracelet', price: 10000, category: 'accessories', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Pearl Drop Earrings', price: 12000, category: 'accessories', stock: 5, status: 'active', is_new: false, is_featured: false, image: 'https://images.unsplash.com/photo-1569397288884-4d43d6738fbd?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Layered Pendant Necklace', price: 14000, category: 'accessories', stock: 5, status: 'active', is_new: true, is_featured: false, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80' },
]