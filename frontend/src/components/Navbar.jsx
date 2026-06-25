import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquareText,
  ShoppingBag,
  Sparkles,
  UserRound,
  Users,
  X,
  ShoppingCart,
  Package,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.jpg";

function getNavItems(role) {
  if (role === "admin") {
    return [
      { to: "/", label: "Home", icon: Home },
      { to: "/gallery", label: "Gallery", icon: Sparkles },
      {
        to: "/admin-dashboard",
        label: "Admin Dashboard",
        icon: LayoutDashboard,
      },
      {
        to: "/admin-customers",
        label: "Customers",
        icon: Users,
      },
    ];
  }

  if (role === "user" || role === "customer") {
    return [
      { to: "/", label: "Home", icon: Home },
      { to: "/user-dashboard?tab=browse", label: "Products", icon: UserRound },
      { to: "/user-dashboard?tab=cart", label: "Cart", icon: ShoppingCart },
      { to: "/select-outfit", label: "Select Outfit", icon: Sparkles },
      { to: "/user-dashboard?tab=orders", label: "My Orders", icon: Package },
      { to: "/feedback", label: "Feedback", icon: MessageSquareText },
    ];
  }

  return [
    { to: "/", label: "Home", icon: Home },
    { to: "/gallery", label: "Gallery", icon: Sparkles },
  ];
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getNavItems(user?.role);

  const currentPath = location.pathname + location.search;

  const isLinkActive = (itemTo) => {
    if (currentPath === itemTo) return true;
    if (itemTo === "/user-dashboard?tab=browse" && currentPath === "/user-dashboard") return true;
    const [path] = itemTo.split("?");
    return location.pathname === path && !itemTo.includes("tab=");
  };

  async function handleLogout() {
    await logout();
    setOpen(false);
    setDropdownOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-cream/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to={user?.role === "admin" ? "/admin-dashboard" : "/"}
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <img
            src={logo}
            alt="Dhanvika Ethnic Choice Boutique"
            className="h-14 w-14 rounded-full object-cover shadow-md ring-2 ring-gold/40"
          />
          <span>
            <span className="block font-display text-xl font-bold text-plum">
              Dhanvika Ethnic Choice
            </span>
            <span className="block text-xs font-bold uppercase text-gold">
              Boutique
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  active ? "bg-plum text-white" : "text-plum hover:bg-lavender/60"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-plum shadow-sm hover:bg-lavender/40 transition"
              >
                <UserRound size={17} />
                <span>{user.name}</span>
                <span className="text-xs font-bold uppercase text-gold">
                  ({user.role || "user"})
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-plum hover:bg-lavender/40 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserRound size={16} />
                    Profile Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-plum hover:bg-lavender/40 transition border-t border-lavender/20"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary py-2">
              <LogIn size={17} />
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-md bg-white text-plum shadow-sm lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/80 bg-cream px-4 py-4 shadow-aura lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    active ? "bg-plum text-white" : "text-plum hover:bg-lavender/60"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <div className="flex items-center justify-between border-t border-white/80 mt-3 pt-3 px-3">
                  <div>
                    <span className="block text-xs font-bold uppercase text-gold">
                      Logged in as
                    </span>
                    <span className="block font-semibold text-plum">
                      {user.name}
                    </span>
                  </div>
                  <span className="rounded bg-white px-2 py-0.5 text-xs font-bold text-plum uppercase">
                    {user.role || "user"}
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-plum hover:bg-lavender/60 transition mt-1"
                  onClick={() => setOpen(false)}
                >
                  <UserRound size={17} />
                  Profile Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-secondary mt-2 w-full justify-center"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-primary mt-2"
                onClick={() => setOpen(false)}
              >
                <LogIn size={17} />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
