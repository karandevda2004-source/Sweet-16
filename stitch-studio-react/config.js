export const CONFIG = {
  brand: 'Rashmi Loom',
  owner: 'Rashmi',
  phone: '919752524222',
  email: 'hello@rashmiloom.com',
  instagram: 'rashmicrafts',
  city: 'Indore, Madhya Pradesh',
};

export const waLink = (text) =>
  `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(text)}`;

export const inr = (n) => `₹${new Intl.NumberFormat('en-IN').format(n)}`;

export const CATEGORIES = [
  { id: 'plushies', name: 'Plushies' },
  { id: 'apparel', name: 'Apparel' },
  { id: 'decor', name: 'Handcrafted Decor' },
  { id: 'patterns', name: 'DIY Patterns' },
];

export const PRODUCTS = [
  {
    id: 1,
    name: 'Floral Drawstring Potli',
    category: 'apparel',
    price: 349,
    tags: ['Beginner', '100% Cotton'],
    description:
      'Cute crochet potli with flower tassels — jewellery, coins or return gifts.',
    sw: ['#B85B35', '#8FA89B', '#F1E8DE'],
  },
  {
    id: 2,
    name: 'Granny-Stripe Mini Tote',
    category: 'apparel',
    price: 399,
    tags: ['Beginner', 'Cotton Blend'],
    description: 'Mini handbag in blue and cream granny stripes with comfy handles.',
    sw: ['#6E8CA8', '#F1E8DE', '#B85B35'],
  },
  {
    id: 3,
    name: 'Cherry Hair Tie',
    category: 'plushies',
    price: 129,
    tags: ['Beginner', 'Cotton'],
    description: 'Playful crochet cherries on a soft hair tie. Choose your colours.',
    sw: ['#D1345B', '#2E7D32'],
  },
  {
    id: 4,
    name: 'Crochet Rose Bouquet',
    category: 'decor',
    price: 499,
    tags: ['Intermediate', 'Silk Blend'],
    description: 'A bouquet that never wilts. Red roses with a cream frill and ribbon.',
    sw: ['#C2185B', '#F7EDE3'],
  },
  {
    id: 5,
    name: 'Pastel Crochet Rose',
    category: 'plushies',
    price: 99,
    tags: ['Beginner', 'Cotton'],
    description: 'Handmade rose for brooches, hair clips or gift toppers.',
    sw: ['#F3A9C0', '#C3D2C8', '#F7C87A'],
  },
  {
    id: 6,
    name: 'Peacock Fan Thali',
    category: 'decor',
    price: 899,
    tags: ['Advanced', 'Beaded'],
    description: 'Half-fan red thali with gold beadwork, pearls and blue stones.',
    sw: ['#B85B35', '#D4A24C', '#2E6E8E'],
  },
  {
    id: 7,
    name: 'Lotus Aarti Thali + Diya Set',
    category: 'decor',
    price: 1499,
    tags: ['Advanced', 'Mixed Media'],
    description: 'Multicolour lotus-petal thali with painted centre and four diya holders.',
    sw: ['#B85B35', '#8FA89B', '#D4A24C'],
  },
  {
    id: 8,
    name: 'Red & Gold Oval Tray',
    category: 'decor',
    price: 749,
    tags: ['Intermediate', 'Beaded'],
    description: 'Oval decorative tray with pearl and green stone border.',
    sw: ['#C2185B', '#D4A24C'],
  },
  {
    id: 9,
    name: 'Paisley Kumkum Box',
    category: 'decor',
    price: 349,
    tags: ['Intermediate', 'MDF'],
    description: 'Purple paisley-shaped box with gold flower centrepiece and compartments.',
    sw: ['#6B4E8F', '#D4A24C'],
  },
  {
    id: 10,
    name: 'Swastik Kumkum Box',
    category: 'decor',
    price: 299,
    tags: ['Beginner', 'MDF'],
    description: 'Auspicious red box with swastik, pearls and amber stones.',
    sw: ['#C2185B', '#D4A24C'],
  },
  {
    id: 11,
    name: 'Granny Square Blanket PDF',
    category: 'patterns',
    price: 199,
    tags: ['Intermediate', 'PDF'],
    description: '28-square blanket with corner shaping, 6 colourways, step photos.',
    sw: ['#B85B35', '#8FA89B', '#F1E8DE'],
  },
  {
    id: 12,
    name: 'Amigurumi Basics',
    category: 'patterns',
    price: 149,
    tags: ['Beginner', 'PDF'],
    description: 'The 12-shape starter course — magic ring, shaping, stuffing and faces.',
    sw: ['#FF2A85', '#8FA89B'],
  },
  {
    id: 13,
    name: 'Floral Motif Charts',
    category: 'patterns',
    price: 249,
    tags: ['Advanced', 'PDF'],
    description: '18 rosette and vine charts with stitch-by-stitch diagrams.',
    sw: ['#D4A24C', '#1A1A1A'],
  },
];

export const PROCESS = [
  {
    n: '01',
    t: 'Skein',
    image: 2,
    d: 'Rashmi buys small-lot cotton in unbleached cream and clay tones, then winds every ball by hand so the tension starts right.',
  },
  {
    n: '02',
    t: 'Swatch',
    image: 1,
    d: 'Every new colour gets a tension swatch first. If the gauge drifts she re-winds the yarn — never the pattern.',
  },
  {
    n: '03',
    t: 'Hook',
    image: 6,
    d: 'One 6 mm bamboo hook, forty years of muscle memory. That consistent tension is the signature of every piece.',
  },
  {
    n: '04',
    t: 'Stitch',
    image: 0,
    d: 'One stitch at a time, counted out loud. Two mugs of chai, one patient floor, and a lot of re-done rows.',
  },
  {
    n: '05',
    t: 'Finish',
    image: 9,
    d: 'Blocked, steam-shaped and brushed with a suede cloth so the fibres bloom soft instead of shiny.',
  },
  {
    n: '06',
    t: 'Send',
    image: 4,
    d: 'Wrapped in kraft paper with a handwritten note, and shipped within 72 hours of finishing.',
  },
];
