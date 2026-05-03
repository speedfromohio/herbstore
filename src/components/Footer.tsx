import { Leaf } from "lucide-react";

const Footer = () => (
  <footer className="mt-24 border-t border-border/60 bg-secondary/40">
    <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-leaf text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="font-serif text-lg font-semibold">Herbs Store</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Authentic Ayurvedic herbs sourced with care, delivered with integrity.
        </p>
      </div>
      <div>
        <h4 className="font-serif text-base font-semibold mb-3">Shop</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Powders</li><li>Leaves</li><li>Roots</li><li>Spices</li>
        </ul>
      </div>
      <div>
        <h4 className="font-serif text-base font-semibold mb-3">Company</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>About</li><li>Contact</li><li>Sustainability</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} Herbs Store · College Project Demo
    </div>
  </footer>
);

export default Footer;
