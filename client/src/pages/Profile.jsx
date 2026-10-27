import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import VerificationBadge from "../components/VerificationBadge";
import { api } from "../api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import { imageUrl, initials, inr, TYPE_LABELS } from "../utils";

const ROLE_LABEL = { owner: "Property Owner", business: "Business", admin: "Platform Admin" };

export default function Profile() {
  const { user, logout } = useAuth();
  const { count } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const mine = useApi("/api/properties/mine");
  const enquiries = useApi("/api/enquiries");
  const [toDelete, setToDelete] = useState(null); // the property waiting for "are you sure?"

  const listings = mine.data?.properties || [];

  async function confirmDelete() {
    try {
      await api.del(`/api/properties/${toDelete._id}`);
      showToast("Listing removed", "info");
      setToDelete(null);
      mine.reload();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleLogout() {
    await logout(); // server deletes the cookie, then we clear the saved user
    showToast("Logged out successfully", "info");
    navigate("/");
  }

  const navItem = "flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-semibold text-sm rounded-lg transition-all hover:translate-x-1";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 w-full grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* ---------- sidebar ---------- */}
      <aside className="col-span-1 md:col-span-3 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white text-3xl font-extrabold mb-4 border-4 border-blue-100">{initials(user.name)}</div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">{user.name}</h1>
            <p className="text-sm text-gray-500 mb-4 break-all">{user.email}</p>
            <span className="badge badge-match">{ROLE_LABEL[user.role]}</span>
          </div>
          <hr className="my-6 border-gray-200" />
          <nav className="space-y-1">
            <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg"><span className="material-symbols-outlined text-[20px]">account_circle</span> Profile</Link>
            {user.role === "owner" && <Link to="/dashboard" className={navItem}><span className="material-symbols-outlined text-[20px]">monitoring</span> Analytics Dashboard</Link>}
            {user.role === "admin" && <Link to="/admin" className={navItem}><span className="material-symbols-outlined text-[20px]">admin_panel_settings</span> Admin Panel</Link>}
            <Link to="/owner-form" className={navItem}><span className="material-symbols-outlined text-[20px]">real_estate_agent</span> List Property</Link>
            <Link to="/wishlist" className={navItem}><span className="material-symbols-outlined text-[20px]">favorite</span> Saved Wishlist</Link>
            <Link to="/enquiries" className={navItem}><span className="material-symbols-outlined text-[20px]">forum</span> My Enquiries</Link>
          </nav>
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <button onClick={handleLogout} className="w-full py-2.5 px-4 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">logout</span> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- main ---------- */}
      <div className="col-span-1 md:col-span-9 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stagger-item brand-card bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-36 shadow-sm" style={{ "--i": 0 }}>
            <div className="flex items-center gap-2 text-gray-500"><span className="material-symbols-outlined text-blue-600">warehouse</span><span className="text-sm font-bold">My Listings</span></div>
            <div className="text-4xl font-extrabold text-gray-900">{listings.length}</div>
          </div>
          <div className="stagger-item brand-card bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-36 shadow-sm" style={{ "--i": 1 }}>
            <div className="flex items-center gap-2 text-gray-500"><span className="material-symbols-outlined text-orange-500">favorite</span><span className="text-sm font-bold">Wishlist</span></div>
            <div className="text-4xl font-extrabold text-gray-900">{count}</div>
          </div>
          <div className="stagger-item brand-card bg-linear-to-br from-blue-700 to-blue-900 border border-blue-800 rounded-xl p-6 flex flex-col justify-between h-36 text-white shadow-md" style={{ "--i": 2 }}>
            <div className="flex items-center gap-2 text-blue-100"><span className="material-symbols-outlined">chat_bubble</span><span className="text-sm font-bold">Enquiries</span></div>
            <div className="text-4xl font-extrabold">{enquiries.data?.enquiries.length ?? 0}</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="border-b border-gray-200 flex px-6">
            <span className="px-4 py-4 text-sm font-bold text-blue-700 border-b-2 border-blue-700 -mb-px">My Listings</span>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Manage Your Properties</h2>
            <div className="space-y-6">
              {mine.loading && <div className="skeleton h-40 w-full" />}
              {!mine.loading && listings.length === 0 && (
                <div className="empty-state">No listings yet. <Link to="/owner-form" className="text-blue-700 font-bold">List a property</Link>.</div>
              )}
              {listings.map((l, i) => (
                <div key={l._id} className="stagger-item flex flex-col md:flex-row gap-6 border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow" style={{ "--i": i }}>
                  <div className="w-full md:w-64 h-40 flex-shrink-0 relative overflow-hidden rounded-lg bg-blue-50">
                    {l.photos?.[0]
                      ? <img alt={l.title} className="w-full h-full object-cover" src={imageUrl(l.photos[0])} />
                      : <div className="w-full h-full flex items-center justify-center text-blue-200"><span className="material-symbols-outlined text-6xl">warehouse</span></div>}
                    <span className={`badge ${l.availability === "Available" ? "badge-available" : "badge-draft"} absolute top-2 right-2`}>{l.availability}</span>
                  </div>
                  <div className="flex-grow flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{l.title}</h3>
                        <VerificationBadge status={l.verification} />
                      </div>
                      <p className="text-sm text-gray-500 mb-4 flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-blue-600">location_on</span> {l.location}</p>
                      {l.verification === "rejected" && l.rejectionReason && <p className="text-sm text-red-600 mb-3">Rejected: {l.rejectionReason}</p>}
                      <div className="flex flex-wrap gap-6 mb-4">
                        <div className="flex flex-col"><span className="text-xs text-gray-400 font-semibold">Area</span><span className="text-sm font-bold text-gray-900">{inr(l.area)} sq ft</span></div>
                        <div className="flex flex-col"><span className="text-xs text-gray-400 font-semibold">Rate</span><span className="text-sm font-bold text-orange-600">₹{l.rent} / sq ft / month</span></div>
                        <div className="flex flex-col"><span className="text-xs text-gray-400 font-semibold">Type</span><span className="text-sm font-bold text-gray-900">{TYPE_LABELS[l.type] || l.type}</span></div>
                        <div className="flex flex-col"><span className="text-xs text-gray-400 font-semibold">Shareholders</span><span className="text-sm font-bold text-orange-600">{l.shareholders.length}</span></div>
                        <div className="flex flex-col"><span className="text-xs text-gray-400 font-semibold">Views</span><span className="text-sm font-bold text-gray-900">{l.views}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-auto">
                      <Link to={`/property/${l._id}`} className="btn-blue !py-2 !px-4 text-sm">View Details</Link>
                      {String(l.owner) === user.id && (
                        <button onClick={() => setToDelete(l)} className="px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 rounded-lg font-bold text-sm transition-colors">Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toDelete && (
        <Modal title="Remove this listing?" onClose={() => setToDelete(null)}>
          <p className="text-sm text-gray-600">"{toDelete.title}" will be deleted together with its photos, document and enquiries. This cannot be undone.</p>
          <div className="flex justify-end gap-3 mt-6">
            <button className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setToDelete(null)}>Cancel</button>
            <button className="px-5 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors" onClick={confirmDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
