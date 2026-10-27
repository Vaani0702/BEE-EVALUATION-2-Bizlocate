import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Gallery from "../components/Gallery";
import Modal from "../components/Modal";
import VerificationBadge from "../components/VerificationBadge";
import { api } from "../api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import { inr, initials } from "../utils";

export default function PropertyDetail() {
  const { id } = useParams(); // the :id in the URL /property/:id
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isSaved, toggle } = useWishlist();
  const navigate = useNavigate();

  const { data, loading, error, reload } = useApi(`/api/properties/${id}`);
  const p = data?.property;

  const isOwner = !!p && !!user && String(p.owner) === user.id;
  const isAdminUser = user?.role === "admin";
  const myShare = p?.shareholders?.find((s) => user && String(s.user) === user.id);
  const canSeeMoney = !!myShare || isAdminUser;

  // These only load when the user is allowed to see them (path = null means "skip")
  const shares = useApi(user && p ? `/api/shares/property/${id}` : null);
  const payouts = useApi(canSeeMoney ? `/api/properties/${id}/payouts` : null);

  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [percentFor, setPercentFor] = useState({}); // percent typed for each request

  function refreshAll() { reload(); shares.reload(); payouts.reload(); }

  async function sendEnquiry() {
    try {
      await api.post("/api/enquiries", { propertyId: id, message });
      showToast("Enquiry sent to the owner!", "success");
      setEnquiryOpen(false);
      setMessage("");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function startEnquiry() {
    if (!user) { showToast("Please login to continue", "error"); navigate("/login", { state: { from: `/property/${id}` } }); return; }
    setEnquiryOpen(true);
  }

  async function requestShare() {
    try {
      await api.post(`/api/shares/${id}`);
      showToast("Request sent to the admin!", "success");
      shares.reload();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function decide(requestId, decision, name) {
    try {
      const percent = Number(percentFor[requestId] ?? 10);
      await api.patch(`/api/shares/${requestId}`, { decision, percent });
      showToast(decision === "approve" ? `${name} is now a ${percent}% shareholder` : "Request rejected", decision === "approve" ? "success" : "info");
      refreshAll();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function openDoc() {
    try { await api.openDocument(id); } catch (err) { showToast(err.message, "error"); }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-12 space-y-6">
        <div className="skeleton h-10 w-1/2" /><div className="skeleton h-[400px] w-full" /><div className="skeleton h-40 w-full" />
      </div>
    );
  }
  if (error || !p) {
    return (
      <div className="max-w-xl mx-auto w-full px-4 py-20">
        <div className="empty-state"><span className="material-symbols-outlined text-5xl text-gray-300">search_off</span><p className="mt-2 font-semibold">{error || "Property not found."}</p>
          <Link to="/listings" className="btn-blue mt-4">Back to listings</Link></div>
      </div>
    );
  }

  const monthly = p.rent * p.area;
  const specs = [
    { icon: "straighten", label: "Clear Height", value: p.height },
    { icon: "electric_bolt", label: "Power Load", value: p.power + " HP" },
    { icon: "local_shipping", label: "Loading Docks", value: p.docks },
    { icon: "layers", label: "Flooring / Zoning", value: p.flooring }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
      {/* ---------- notices only the owner / admin should see ---------- */}
      {(isOwner || isAdminUser) && p.verification === "pending" && (
        <div className="animate-fade-in mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-center gap-3 text-sm font-semibold">
          <span className="material-symbols-outlined">schedule</span> This listing is waiting for the admin to verify the ownership document.
        </div>
      )}
      {(isOwner || isAdminUser) && p.verification === "rejected" && (
        <div className="animate-fade-in mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
          <p className="font-bold flex items-center gap-2"><span className="material-symbols-outlined">cancel</span> Rejected by the admin and hidden from the public.</p>
          {p.rejectionReason && <p className="mt-1 ml-8">Reason: {p.rejectionReason}</p>}
        </div>
      )}

      {/* ---------- header ---------- */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge badge-available">{p.availability}</span>
            <span className="badge badge-premium">{p.grade}</span>
            <VerificationBadge status={p.verification} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{p.title}</h1>
          <p className="text-lg text-gray-500 flex items-center gap-1"><span className="material-symbols-outlined text-blue-600">location_on</span> {p.location}</p>
        </div>
        <div className="text-left md:text-right flex flex-col items-start md:items-end gap-3">
          <p className="text-3xl font-extrabold text-orange-600">₹ {p.rent} / sq.ft / month</p>
          <p className="text-sm text-gray-500">Built-up Area: {inr(p.area)} sq.ft</p>
          <button onClick={() => toggle(p._id)} key={String(isSaved(p._id))}
            className={`wishlist-btn ${isSaved(p._id) ? "active animate-heart bg-orange-50" : ""} flex items-center gap-2 border-2 border-orange-400 text-orange-500 font-bold px-3 py-1.5 rounded-lg text-sm hover:bg-orange-50 transition-colors`}>
            <span className="material-symbols-outlined text-[18px]">favorite</span> {isSaved(p._id) ? "Saved" : "Save to Wishlist"}
          </button>
        </div>
      </div>

      <Gallery photos={p.photos} title={p.title} />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 flex flex-col gap-8 min-w-0">
          {/* ---------- overview ---------- */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Property Overview</h2>
            <p className="text-gray-600 mb-6">{p.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {specs.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <span className="material-symbols-outlined text-blue-700 mb-1">{s.icon}</span>
                  <span className="text-xs uppercase text-gray-400 font-semibold">{s.label}</span>
                  <span className="font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
            <div className="w-full h-64 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-center">
              <span className="text-blue-400 text-xs font-semibold">[Map placeholder]</span>
            </div>
          </section>

          {/* ---------- ownership document (private) ---------- */}
          {(isOwner || isAdminUser) && (
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Ownership Document</h2>
              <p className="text-sm text-gray-500 mb-4">Private. Only the owner and the admin can open this file.</p>
              {p.hasDocument ? (
                <button onClick={openDoc} className="btn-outline"><span className="material-symbols-outlined">picture_as_pdf</span> View ownership PDF</button>
              ) : <p className="text-sm text-gray-500">No document uploaded for this listing.</p>}
            </section>
          )}

          {/* ---------- shareholders ---------- */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ownership &amp; Shareholders</h2>
            <p className="text-sm text-gray-500 mb-4">This property can be co-owned by multiple people. Each shareholder holds a percentage of it, and the admin approves who else can join.</p>

            <div className="flex flex-col gap-3">
              {p.shareholders.map((s) => (
                <div key={s._id} className="shareholder-row">
                  <span className="flex items-center gap-2 font-semibold text-sm text-gray-900">{s.name} {s.isAdmin && <span className="badge badge-match">Admin</span>}</span>
                  <div className="flex items-center gap-3 flex-1 max-w-[50%] justify-end">
                    <div className="hidden sm:block h-2 bg-gray-200 rounded-full overflow-hidden flex-1">
                      <div className="animate-grow-bar h-full bg-blue-600 rounded-full" style={{ width: s.percent + "%" }} />
                    </div>
                    <span className="font-extrabold text-blue-700 text-sm w-12 text-right">{s.percent}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              {!user && <p className="text-sm text-gray-500"><Link to="/login" className="text-blue-700 font-semibold">Login</Link> to request a share of this property.</p>}

              {user && shares.data?.isAdmin && (
                shares.data.requests.length > 0 ? (
                  <>
                    <p className="text-sm font-bold text-gray-700 mb-2">Pending Requests</p>
                    {shares.data.requests.map((r) => (
                      <div key={r._id} className="share-request-row animate-fade-in">
                        <span className="text-sm font-semibold text-gray-800">{r.requesterName} wants a share</span>
                        <div className="flex items-center gap-2">
                          <input type="number" min="1" max="99" title="Percent to give" className="w-16 text-sm border border-gray-300 rounded px-2 py-1"
                            value={percentFor[r._id] ?? 10} onChange={(e) => setPercentFor({ ...percentFor, [r._id]: e.target.value })} />
                          <span className="text-sm text-gray-500">%</span>
                          <button onClick={() => decide(r._id, "approve", r.requesterName)} className="text-xs font-bold text-green-700 border border-green-600 px-3 py-1 rounded hover:bg-green-50 transition-colors">Approve</button>
                          <button onClick={() => decide(r._id, "reject", r.requesterName)} className="text-xs font-bold text-red-700 border border-red-600 px-3 py-1 rounded hover:bg-red-50 transition-colors">Reject</button>
                        </div>
                      </div>
                    ))}
                  </>
                ) : <p className="text-sm text-gray-500">No pending share requests right now.</p>
              )}

              {user && shares.data && !shares.data.isAdmin && !isAdminUser && (
                myShare ? <p className="text-sm text-green-700 font-semibold">You already own a {myShare.percent}% share of this property.</p>
                : shares.data.requests.length > 0 ? <p className="text-sm text-orange-600 font-semibold">Your request is waiting for the admin's approval.</p>
                : <button onClick={requestShare} className="btn-outline">Request to become a Shareholder</button>
              )}
            </div>
          </section>

          {/* ---------- rent split ---------- */}
          {canSeeMoney && payouts.data && (
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Monthly Rent Split</h2>
              <p className="text-sm text-gray-500 mb-4">Rent of ₹ {inr(payouts.data.monthlyRent)} a month is shared by percentage (rent × share ÷ 100).</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs uppercase text-gray-400 border-b border-gray-200"><th className="py-2">Shareholder</th><th className="py-2">Share</th><th className="py-2 text-right">Gets / month</th></tr></thead>
                  <tbody>
                    {payouts.data.rows.map((r) => (
                      <tr key={r.name} className="border-b border-gray-100 last:border-0">
                        <td className="py-2.5 font-semibold">{r.name} {r.isAdmin && <span className="badge badge-match ml-1">Admin</span>}</td>
                        <td className="py-2.5">{r.percent}%</td>
                        <td className="py-2.5 text-right font-extrabold text-orange-600">₹ {inr(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {/* ---------- sidebar ---------- */}
        <div className="lg:w-1/3">
          <div className="sticky top-28 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="mb-6"><span className="block text-2xl font-extrabold text-gray-900">₹ {inr(monthly)}</span><span className="text-sm text-gray-500">Estimated Monthly Rent</span></div>
              {!isOwner && <button onClick={startEnquiry} className="btn-orange w-full !py-3 mb-6"><span className="material-symbols-outlined">mail</span> Enquire Now</button>}
              {isOwner && <p className="text-sm text-gray-500 mb-6">This is your listing.</p>}
              {(isOwner || isAdminUser) && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6"><span className="material-symbols-outlined text-blue-600">visibility</span> <b>{p.views}</b> views</div>
              )}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs uppercase text-gray-400 mb-2 font-semibold">Listed By</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">{initials(p.ownerName)}</div>
                  <div><p className="font-semibold">{p.ownerName}</p><p className="text-sm text-gray-500">{p.verification === "verified" ? "Verified Partner" : "Property Owner"}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {enquiryOpen && (
        <Modal title="Send an enquiry to the owner" onClose={() => setEnquiryOpen(false)}>
          <textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600" rows={4}
            placeholder="Add a short message to the owner (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
          <div className="flex justify-end gap-3 mt-4">
            <button className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setEnquiryOpen(false)}>Cancel</button>
            <button className="btn-orange" onClick={sendEnquiry}>Send Enquiry</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
