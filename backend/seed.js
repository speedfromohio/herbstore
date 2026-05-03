const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');

dotenv.config();

const products = [
  { id: "ashwagandha", name: "Ashwagandha", botanical: "Withania somnifera", price: 299, category: "Powders", image: "/images/p-ashwagandha.jpg", description: "Adaptogenic root powder that helps reduce stress and boost stamina.", rating: 4.8 },
  { id: "tulsi", name: "Tulsi (Holy Basil)", botanical: "Ocimum sanctum", price: 149, category: "Leaves", image: "/images/p-tulsi.jpg", description: "Sacred basil leaves for immunity, respiratory health and calm focus.", rating: 4.9 },
  { id: "aloevera", name: "Aloe Vera Gel", botanical: "Aloe barbadensis", price: 249, category: "Leaves", image: "/images/p-aloevera.jpg", description: "Pure aloe gel for skin, digestion and natural hydration.", rating: 4.7 },
  { id: "neem", name: "Neem Leaves", botanical: "Azadirachta indica", price: 179, category: "Leaves", image: "/images/p-neem.jpg", description: "Bitter leaves traditionally used for skin health and detoxification.", rating: 4.6 },
  { id: "turmeric", name: "Turmeric Powder", botanical: "Curcuma longa", price: 199, category: "Spices", image: "/images/p-turmeric.jpg", description: "Anti-inflammatory golden spice rich in curcumin.", rating: 4.9 },
  { id: "brahmi", name: "Brahmi", botanical: "Bacopa monnieri", price: 329, category: "Leaves", image: "/images/p-brahmi.jpg", description: "Memory and cognition supporting Ayurvedic herb.", rating: 4.5 },
  { id: "cardamom", name: "Green Cardamom", botanical: "Elettaria cardamomum", price: 449, category: "Spices", image: "/images/p-cardamom.jpg", description: "Aromatic pods for digestion and freshening tea blends.", rating: 4.8 },
  { id: "giloy", name: "Giloy", botanical: "Tinospora cordifolia", price: 269, category: "Roots", image: "/images/p-giloy.jpg", description: "Immunity-boosting climber, the “root of immortality”.", rating: 4.7 },
];

const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared.');

    // Insert new products
    await Product.insertMany(products);
    console.log('Database Seeded Successfully!');
    
    process.exit();
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
