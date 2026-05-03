import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingCart, Leaf, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  const linkBase = "relative px-1 py-2 text-sm font-medium hover:text-primary";
  const linkActive = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${isActive ? "text-primary" : "text-foreground/80"}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-leaf text-primary-foreground shadow-soft">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight">
            Herbs <span className="text-primary">Store</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={linkActive} end>Home</NavLink>
          {user ? (
            <button onClick={logout} className={`${linkBase} flex items-center gap-1.5 text-foreground/80`}>
              <LogOut className="h-4 w-4" /> Logout
            </button>
          ) : (
            <NavLink to="/login" className={linkActive}>Login</NavLink>
          )}
          <NavLink to="/cart" className={linkActive}>
            <span className="flex items-center gap-1.5">
              <ShoppingCart className="h-4 w-4" />
              Cart
              {count > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </span>
          </NavLink>
          {user && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-4 w-4" /> {user.name}
            </span>
          )}
        </nav>

        <button
          aria-label="Toggle menu"
          className="md:hidden p-2 rounded-lg hover:bg-secondary"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {[
              { to: "/", label: "Home" },
              { to: "/login", label: user ? "Account" : "Login" },
              { to: "/cart", label: `Cart${count ? ` (${count})` : ""}` },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary ${
                  loc.pathname === l.to ? "text-primary bg-secondary" : "text-foreground/80"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => { logout(); setOpen(false); }}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
