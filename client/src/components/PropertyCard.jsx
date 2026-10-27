import { Link, useNavigate } from "react-router-dom";
import VerificationBadge from "./VerificationBadge";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api";
import { calculateMatch, imageUrl, inr } from "../utils";

// One listing card (used on Listings and Wishlist). Same layout as the original site.
export default function PropertyCard({ property: p, requirement, index = 0 }) {
  const { user } = useAuth();
  const { isSaved, toggle } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const match = calculateMatch(p, requirement);
  const saved = isSaved(p._id);
  const photo = p.photos?.[0];

  // "Book Viewing" = send a quick enquiry with the default message.
  async function bookViewing() {
    if (!user) {
      showToast("Please login to continue", "error");
      navigate("/login");
      return;
    }
    try {
      await api.post("/api/enquiries", { propertyId: p._id });
      showToast("Enquiry sent to the owner!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  return (
    <div className="stagger-item brand-card bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row shadow-sm group" style={{ "--i": index }}>
      <div className="w-full md:w-2/5 relative h-64 md:h-auto overflow-hidden bg-blue-50">
        {photo ? (
          <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={imageUrl(photo)} alt={p.title} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-blue-200"><span className="material-symbols-outlined text-7xl">warehouse</span></div>
        )}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="badge badge-premium"><span className="material-symbols-outlined text-[14px]">star</span> {p.grade}</span>
          <span className="badge badge-available">{p.availability}</span>
        </div>
        <button
          onClick={() => toggle(p._id)}
          key={String(saved)} /* new key = the pop animation replays on each click */
          className={`wishlist-btn ${saved ? "active animate-heart" : ""} absolute top-4 right-4 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center shadow`}
          title="Save to wishlist"
        >
          <span className="material-symbols-outlined text-orange-500">favorite</span>
        </button>
        {p.photos?.length > 1 && (
          <span className="absolute bottom-3 left-3 bg-blue-950/70 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">photo_library</span> {p.photos.length}
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex justify-between items-start mb-2 gap-3">
            <h3 className="text-xl font-bold text-gray-900">{p.title}</h3>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {match !== null && (
                <div className="badge badge-match"><span className="material-symbols-outlined text-[16px]">verified</span> {match}% Match</div>
              )}
              <VerificationBadge status={p.verification} />
            </div>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
            <span className="material-symbols-outlined text-[16px] text-blue-600">location_on</span> {p.location}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div><p className="text-xs uppercase text-gray-400 font-semibold">Rent</p><p className="font-bold text-orange-600">₹ {p.rent} /sqft</p></div>
            <div><p className="text-xs uppercase text-gray-400 font-semibold">Area</p><p className="font-bold">{inr(p.area)} sqft</p></div>
            <div><p className="text-xs uppercase text-gray-400 font-semibold">Height</p><p className="font-bold">{p.height}</p></div>
            <div><p className="text-xs uppercase text-gray-400 font-semibold">Power</p><p className="font-bold">{p.power} HP</p></div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 font-semibold">{p.zoning}</span>
            {p.truckAccess && <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 font-semibold">Truck Access</span>}
            {p.shareholders?.length > 1 && (
              <span className="text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-100 font-semibold">{p.shareholders.length} Shareholders</span>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Link to={`/property/${p._id}`} className="btn-outline">View Details</Link>
          <button onClick={bookViewing} className="btn-orange">Book Viewing</button>
        </div>
      </div>
    </div>
  );
}
