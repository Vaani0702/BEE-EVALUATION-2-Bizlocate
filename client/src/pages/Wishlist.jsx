import { Link } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import { ListSkeleton } from "../components/Skeletons";
import { useApi } from "../hooks/useApi";
import { useWishlist } from "../context/WishlistContext";

export default function Wishlist() {
  const { ids } = useWishlist(); // when a heart is clicked, ids changes and the list below updates
  const { data, loading } = useApi("/api/wishlist");
  const { data: reqData } = useApi("/api/requirement");

  // Hide a property the moment it is un-hearted (without waiting for the server again).
  const items = (data?.properties || []).filter((p) => ids.includes(String(p._id)));

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-500">favorite</span> Saved Wishlist
        </h1>
        <p className="text-gray-500">Properties you've bookmarked for later.</p>
      </div>

      {loading && <ListSkeleton count={2} />}
      {!loading && items.length === 0 && (
        <div className="empty-state">
          You haven't saved any properties yet. Browse <Link to="/listings" className="text-blue-700 font-semibold">listings</Link> and tap the heart icon.
        </div>
      )}
      <div className="flex flex-col gap-6">
        {items.map((p, i) => <PropertyCard key={p._id} property={p} requirement={reqData?.requirement || null} index={i} />)}
      </div>
    </div>
  );
}
