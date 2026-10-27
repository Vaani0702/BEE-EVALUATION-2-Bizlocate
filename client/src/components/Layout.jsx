import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Every page is drawn inside this frame: Navbar on top, Footer at the bottom.
export default function Layout() {
  const { pathname } = useLocation();

  // Go back to the top of the page when the route changes.
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* key={pathname} makes React re-create <main> on each route, so the page-enter animation plays again */}
      <main key={pathname} className="page-enter flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
