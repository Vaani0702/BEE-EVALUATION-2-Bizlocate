import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu

  // Add a soft shadow once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever we go to another page.
  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { to: "/", label: "Home", match: (p) => p === "/" },
    { to: "/business-form", label: "For Business", match: (p) => p === "/business-form" },
    { to: "/owner-form", label: "For Owners", match: (p) => p === "/owner-form" },
    { to: "/listings", label: "Listings", match: (p) => p === "/listings" || p.startsWith("/property/") }
  ];
  if (user?.role === "owner") links.push({ to: "/dashboard", label: "Dashboard", match: (p) => p === "/dashboard" });
  if (user?.role === "admin") links.push({ to: "/admin", label: "Admin", match: (p) => p === "/admin" });

  async function handleLogout() {
    await logout(); // server deletes the cookie, then we clear the saved user
    showToast("Logged out successfully", "info");
    navigate("/");
  }

  return (
    <header className={`glass-nav w-full top-0 sticky border-b border-gray-200 z-50 ${scrolled ? "scrolled" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center gap-2 h-20">
        <Logo />

        <nav className="hidden md:flex gap-8 text-sm">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={`nav-link ${l.match(pathname) ? "active" : ""}`}>{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <div className="flex items-center gap-2.5 md:gap-5">
              <Link to="/wishlist" title="Wishlist" className="relative text-gray-500 hover:text-orange-500 transition-colors">
                <span className="material-symbols-outlined">favorite</span>
                {count > 0 && (
                  <span key={count} className="animate-heart absolute -top-1.5 -right-2 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">{count}</span>
                )}
              </Link>
              <Link to="/profile" title="Profile" className="text-gray-500 hover:text-blue-700 transition-colors">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
              <button onClick={handleLogout} className="hidden md:block text-blue-700 font-bold px-4 py-2 rounded hover:bg-blue-50 transition-colors">Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="hidden md:block text-blue-700 font-bold px-4 py-2 rounded hover:bg-blue-50 transition-colors">Login</Link>
              <Link to="/signup" className="btn-orange !py-2.5">Register</Link>
            </>
          )}

          {/* hamburger (phones only) */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-1 text-gray-700" aria-label="Menu">
            <span className="material-symbols-outlined">{open ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {/* mobile menu slides open */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-96 border-t border-gray-200" : "max-h-0"}`}>
        <div className="px-4 py-3 flex flex-col gap-1 bg-white">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={`px-3 py-2.5 rounded-lg font-bold ${l.match(pathname) ? "bg-blue-50 text-blue-700" : "text-gray-600"}`}>{l.label}</Link>
          ))}
          {user ? (
            <button onClick={handleLogout} className="text-left px-3 py-2.5 rounded-lg font-bold text-blue-700">Logout</button>
          ) : (
            <Link to="/login" className="px-3 py-2.5 rounded-lg font-bold text-blue-700">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
