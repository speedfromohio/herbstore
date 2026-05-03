import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Leaf, Sparkles, ShieldCheck, Truck } from "lucide-react";
import hero from "@/assets/hero-herbs.jpg";
import { CATEGORIES, type Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Home = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json() as Promise<Product[]>;
    },
  });

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchQ =
        !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.botanical.toLowerCase().includes(query.toLowerCase());
      const matchC = category === "All" || p.category === category;
      return matchQ && matchC;
    });
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [query, category, sort, products]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-background/70 backdrop-blur px-3 py-1 text-xs font-medium text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" /> 100% Authentic Ayurveda
            </span>
            <h1 className="mt-5 font-serif text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Nature's pharmacy,<br />
              <span className="text-primary">delivered to your door.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-lg">
              Hand-picked herbs, roots and spices sourced directly from organic Indian farms — for healing, healthy living and timeless rituals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#shop" className="inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft">
                <Leaf className="h-4 w-4" /> Shop Herbs
              </a>
              <a href="#shop" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-secondary">
                Explore Categories
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { icon: ShieldCheck, label: "Lab Tested" },
                { icon: Leaf, label: "Organic" },
                { icon: Truck, label: "Free Shipping" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                  <Icon className="h-5 w-5 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />
            <img
              src={hero}
              alt="Assorted fresh ayurvedic herbs"
              width={1600}
              height={900}
              className="relative rounded-[2rem] shadow-card object-cover w-full aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* SHOP */}
      <section id="shop" className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">Our Herb Collection</h2>
            <p className="text-muted-foreground mt-2">Browse, search and discover authentic herbs.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search herbs..."
              className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2.5 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border ${
                  category === c
                    ? "gradient-primary text-primary-foreground border-transparent shadow-soft"
                    : "bg-card text-foreground/80 border-border hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="featured">Sort: Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="aspect-square bg-secondary/60" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-2/3 bg-secondary/70 rounded" />
                  <div className="h-3 w-1/2 bg-secondary/60 rounded" />
                  <div className="h-8 w-full bg-secondary/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-16 text-center">
            <Leaf className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-serif text-xl font-semibold">No herbs found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;
