// api/products.js
// Vercel Serverless Function — GET /api/products
// Returns the full herb product catalogue as JSON.
// The same PRODUCTS array is mirrored in script.js for offline / SSR use;
// this endpoint lets any future client (mobile app, etc.) fetch it dynamically.

const PRODUCTS = [
  {
    id: "1",
    name: "Aloe Vera",
    description: "Natural skin care and healing properties.",
    price: 150,
    image: "images/aloe-vera.jpg",
    category: "Healing"
  },
  {
    id: "2",
    name: "Ashwagandha",
    description: "Stress relief and energy booster.",
    price: 450,
    image: "images/ashwagandha.jpg",
    category: "Stress Relief"
  },
  {
    id: "3",
    name: "Brahmi",
    description: "Enhances memory and cognitive function.",
    price: 320,
    image: "images/brahmi.webp",
    category: "Brain Health"
  },
  {
    id: "4",
    name: "Giloy",
    description: "Natural immunity booster and detoxifier.",
    price: 280,
    image: "images/giloy.webp",
    category: "Immunity"
  },
  {
    id: "5",
    name: "Mint",
    description: "Fresh aroma and digestive aid.",
    price: 80,
    image: "images/mint.jpg",
    category: "Digestive"
  },
  {
    id: "6",
    name: "Neem Leafs",
    description: "Purifies blood and treats skin issues.",
    price: 120,
    image: "images/neem-leafs.jpg",
    category: "Skin Care"
  },
  {
    id: "7",
    name: "Rosemary",
    description: "Excellent for hair growth and focus.",
    price: 200,
    image: "images/rosemary.webp",
    category: "Hair Care"
  },
  {
    id: "8",
    name: "Tulsi",
    description: "Holy Basil for respiratory health and peace.",
    price: 180,
    image: "images/tulsi.jpg",
    category: "Holistic"
  }
];

export default function handler(req, res) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  return res.status(200).json({ products: PRODUCTS });
}
