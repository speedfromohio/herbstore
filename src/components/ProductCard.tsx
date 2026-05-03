import { Star, Plus } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { add } = useCart();

  const handleAdd = () => {
    add(product);
    toast.success(`${product.name} added to cart`, {
      description: `₹${product.price} · Tap cart to checkout`,
    });
  };

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/60 shadow-soft"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/40">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover"
        />
        <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-foreground/80">
          {product.category}
        </span>
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium">
          <Star className="h-3 w-3 fill-accent text-accent" />
          {product.rating}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-semibold leading-tight">{product.name}</h3>
        <p className="text-xs italic text-muted-foreground mt-0.5">{product.botanical}</p>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="font-serif text-2xl font-semibold text-primary">
            ₹{product.price}
          </span>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
