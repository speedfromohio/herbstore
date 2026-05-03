import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const { login, register, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (mode === "register" && !form.name.trim()) return "Please enter your name";
    if (!form.email.trim()) return "Please enter your email";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email";
    if (!form.password) return "Please enter a password";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    try {
      setLoading(true);
      if (mode === "login") {
        await login(form.email, form.password);
        toast.success("Welcome back!", { description: `Signed in as ${form.email}` });
      } else {
        await register(form.name, form.email, form.password);
        toast.success("Account created!", { description: `Welcome, ${form.name}` });
      }
      setTimeout(() => navigate("/"), 600);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto rounded-2xl border border-border/60 bg-card p-10 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-leaf text-primary-foreground">
            <UserIcon className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-serif text-2xl font-semibold">Hello, {user.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/" className="rounded-full gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft">
              Continue Shopping
            </Link>
            <button
              onClick={async () => { await logout(); toast("Logged out"); }}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl gradient-leaf text-primary-foreground shadow-soft">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl font-semibold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Sign in to continue your wellness journey." : "Join us and explore authentic herbs."}
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-card">
          <div className="mb-6 grid grid-cols-2 rounded-full bg-secondary p-1 text-sm">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full py-2 font-medium ${
                  mode === m ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"
                }`}
              >
                {m === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "register" && (
              <Field icon={UserIcon} name="name" placeholder="Full Name" value={form.name} onChange={onChange} />
            )}
            <Field icon={Mail} name="email" type="email" placeholder="Email address" value={form.email} onChange={onChange} />
            <Field icon={Lock} name="password" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={onChange} />

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              {loading && <Loader2 className="h-4 w-4" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  icon: Icon, ...props
}: { icon: React.ComponentType<{ className?: string }> } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="relative">
    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <input
      {...props}
      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
    />
  </div>
);

export default Login;
