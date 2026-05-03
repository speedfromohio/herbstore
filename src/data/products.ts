import ashwagandha from "@/assets/p-ashwagandha.jpg";
import tulsi from "@/assets/p-tulsi.jpg";
import aloevera from "@/assets/p-aloevera.jpg";
import neem from "@/assets/p-neem.jpg";
import turmeric from "@/assets/p-turmeric.jpg";
import brahmi from "@/assets/p-brahmi.jpg";
import cardamom from "@/assets/p-cardamom.jpg";
import giloy from "@/assets/p-giloy.jpg";

export type Category = "Powders" | "Leaves" | "Roots" | "Spices";

export interface Product {
  id: string;
  name: string;
  botanical: string;
  price: number;
  category: Category;
  image: string;
  description: string;
  rating: number;
}

export const PRODUCTS: Product[] = [
  { id: "ashwagandha", name: "Ashwagandha", botanical: "Withania somnifera", price: 299, category: "Powders", image: ashwagandha, description: "Adaptogenic root powder that helps reduce stress and boost stamina.", rating: 4.8 },
  { id: "tulsi", name: "Tulsi (Holy Basil)", botanical: "Ocimum sanctum", price: 149, category: "Leaves", image: tulsi, description: "Sacred basil leaves for immunity, respiratory health and calm focus.", rating: 4.9 },
  { id: "aloevera", name: "Aloe Vera Gel", botanical: "Aloe barbadensis", price: 249, category: "Leaves", image: aloevera, description: "Pure aloe gel for skin, digestion and natural hydration.", rating: 4.7 },
  { id: "neem", name: "Neem Leaves", botanical: "Azadirachta indica", price: 179, category: "Leaves", image: neem, description: "Bitter leaves traditionally used for skin health and detoxification.", rating: 4.6 },
  { id: "turmeric", name: "Turmeric Powder", botanical: "Curcuma longa", price: 199, category: "Spices", image: turmeric, description: "Anti-inflammatory golden spice rich in curcumin.", rating: 4.9 },
  { id: "brahmi", name: "Brahmi", botanical: "Bacopa monnieri", price: 329, category: "Leaves", image: brahmi, description: "Memory and cognition supporting Ayurvedic herb.", rating: 4.5 },
  { id: "cardamom", name: "Green Cardamom", botanical: "Elettaria cardamomum", price: 449, category: "Spices", image: cardamom, description: "Aromatic pods for digestion and freshening tea blends.", rating: 4.8 },
  { id: "giloy", name: "Giloy", botanical: "Tinospora cordifolia", price: 269, category: "Roots", image: giloy, description: "Immunity-boosting climber, the “root of immortality”.", rating: 4.7 },
];

export const CATEGORIES: ("All" | Category)[] = ["All", "Powders", "Leaves", "Roots", "Spices"];
