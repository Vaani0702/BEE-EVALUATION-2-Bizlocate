import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [ids, setIds] = useState([]); // ids of the properties this user has saved

  // Load the saved ids whenever the logged-in user changes.
  useEffect(() => {
    if (!user) { setIds([]); return; }
    api.get("/api/wishlist").then((d) => setIds(d.ids)).catch(() => setIds([]));
  }, [user]);

  const isSaved = (propertyId) => ids.includes(String(propertyId));

  async function toggle(propertyId) {
    if (!user) {
      showToast("Login to save properties to your wishlist", "error");
      navigate("/login");
      return;
    }
    try {
      const data = await api.post("/api/wishlist/" + propertyId); // server toggles and returns the new list
      setIds(data.ids);
      showToast(data.saved ? "Added to wishlist" : "Removed from wishlist", data.saved ? "success" : "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  return (
    <WishlistContext.Provider value={{ ids, count: ids.length, isSaved, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}
