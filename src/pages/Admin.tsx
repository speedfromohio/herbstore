import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Package, Plus, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Product } from "@/data/products";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Admin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", price: "", description: "", category: "Powders", botanical: "", image: "" });
  const [adding, setAdding] = useState(false);

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/products`);
      return res.json();
    },
  });

  // Add product mutation
  const addMutation = useMutation({
    mutationFn: async (newProduct: typeof form) => {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) throw new Error("Failed to add product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added successfully");
      setForm({ name: "", price: "", description: "", category: "Powders", botanical: "", image: "" });
      setAdding(false);
    },
    onError: (error) => toast.error(error.message),
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
    },
  });

  if (!user) return <div className="p-20 text-center">Please login to access Admin panel.</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your herbs store inventory</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="rounded-full gradient-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-soft flex items-center gap-2"
        >
          {adding ? "Cancel" : <><Plus className="h-4 w-4" /> Add Product</>}
        </button>
      </div>

      {adding && (
        <div className="mb-12 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-serif text-xl font-semibold mb-6">New Product</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form); }}
            className="grid gap-4 md:grid-cols-2"
          >
            <input required placeholder="Product Name" className="admin-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input required type="number" placeholder="Price (₹)" className="admin-input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            <input placeholder="Botanical Name" className="admin-input" value={form.botanical} onChange={e => setForm({...form, botanical: e.target.value})} />
            <select className="admin-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option>Powders</option><option>Leaves</option><option>Roots</option><option>Spices</option>
            </select>
            <input placeholder="Image URL" className="admin-input md:col-span-2" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
            <textarea required placeholder="Description" className="admin-input md:col-span-2" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <button
              disabled={addMutation.isPending}
              className="md:col-span-2 rounded-xl gradient-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {addMutation.isPending ? "Adding..." : "Save Product"}
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 text-primary" /></div>
        ) : (
          products?.map((p: Product & { _id: string }) => (
            <div key={p._id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-4">
                <img src={p.image} className="h-12 w-12 rounded-lg object-cover bg-secondary" />
                <div>
                  <h3 className="font-medium">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">₹{p.price} · {p.category}</p>
                </div>
              </div>
              <button
                onClick={() => { if(confirm("Delete this product?")) deleteMutation.mutate(p._id); }}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Admin;
