import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";
import "./index.css";

// Providers wrap the app so every page can use login state, toasts and the wishlist.
// (React.StrictMode is left out on purpose: in development it runs effects twice,
//  which would count every page view twice while you demonstrate.)
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
);
