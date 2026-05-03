import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Checkout = () => {
  const { user } = useAuth();
  const { items, total, count, clear } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: "",
    phone: "",
    paymentMethod: "Card"
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, total, customer, payment_method: customer.paymentMethod }),
      });

      if (!response.ok) throw new Error("Failed to place order");

      toast.success("Order placed successfully!", {
        description: "Your healing herbs are on their way.",
      });
      clear();
      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  if (items.length === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-semibold">Your cart is empty</h2>
        <button onClick={() => navigate("/")} className="mt-4 text-primary hover:underline flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <button onClick={() => navigate("/cart")} className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </button>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="font-serif text-3xl font-semibold">Checkout</h1>
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input
                required
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email Address</label>
              <input
                required
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Shipping Address</label>
              <textarea
                required
                rows={3}
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="123 Herbal Street, Green City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone Number</label>
              <input
                required
                type="tel"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Payment Method</label>
              <select
                value={customer.paymentMethod}
                onChange={(e) => setCustomer({ ...customer, paymentMethod: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
              >
                <option value="Card">Credit / Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full mt-4 rounded-full gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-70"
            >
              {loading ? "Processing..." : `Place Order · ₹${total}`}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-serif text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover bg-secondary" />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-6 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{total}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-primary">Free</span></div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border mt-4">
                <span>Total</span><span>₹{total}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Secure Checkout · 100% Authentic Products
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
