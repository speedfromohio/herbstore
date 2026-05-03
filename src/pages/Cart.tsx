import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const Cart = () => {
  const { items, total, count, updateQty, remove, clear } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto rounded-2xl border border-border/60 bg-card p-10 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mt-5 font-serif text-2xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Looks like you haven't added any herbs yet. Let's fix that.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft"
          >
            Browse Herbs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-2">Shopping Cart</h1>
      <p className="text-muted-foreground mb-10">{count} item{count > 1 ? "s" : ""} in your basket</p>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
            >
              <img
                src={item.image}
                alt={item.name}
                width={120}
                height={120}
                loading="lazy"
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl object-cover bg-secondary/40"
              />
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-lg font-semibold">{item.name}</h3>
                    <p className="text-xs italic text-muted-foreground">{item.botanical}</p>
                  </div>
                  <button
                    onClick={() => { remove(item.id); toast(`${item.name} removed`); }}
                    aria-label="Remove item"
                    className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-secondary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-full border border-border bg-background">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      aria-label="Decrease"
                      className="p-2 hover:bg-secondary rounded-l-full"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-sm font-medium tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      aria-label="Increase"
                      className="p-2 hover:bg-secondary rounded-r-full"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-serif text-lg font-semibold text-primary">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft h-fit lg:sticky lg:top-24">
          <h2 className="font-serif text-xl font-semibold">Order Summary</h2>
          <div className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{total}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-primary">Free</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>Included</span></div>
            <div className="border-t border-border my-3" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span><span className="font-serif text-2xl text-primary">₹{total}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="mt-6 w-full rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            Checkout
          </button>
          <button
            onClick={() => { clear(); toast("Cart cleared"); }}
            className="mt-3 w-full rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            Clear Cart
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
