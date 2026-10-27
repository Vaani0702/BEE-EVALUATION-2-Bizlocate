import { useState } from "react";
import { Link } from "react-router-dom";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Modal from "../components/Modal";
import VerificationBadge from "../components/VerificationBadge";
import { api } from "../api";
import { useApi } from "../hooks/useApi";
import { useCountUp } from "../hooks/useCountUp";
import { useToast } from "../context/ToastContext";
import { formatDate, imageUrl, inr } from "../utils";

function StatCard({ icon, label, value, color, index }) {
  const shown = useCountUp(value);
  return (
    <div className="stagger-item brand-card bg-white border border-gray-200 rounded-xl p-5 shadow-sm" style={{ "--i": index }}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${color}`}><span className="material-symbols-outlined">{icon}</span></div>
      <p className="text-xs uppercase text-gray-400 font-semibold">{label}</p>
      <p className="text-3xl font-extrabold text-gray-900">{shown}</p>
    </div>
  );
}

const TABS = [["pending", "Pending"], ["verified", "Verified"], ["rejected", "Rejected"]];

export default function Admin() {
  const { showToast } = useToast();
  const [tab, setTab] = useState("pending");
  const [rejecting, setRejecting] = useState(null); // the property being rejected (opens the reason box)
  const [reason, setReason] = useState("");

  const stats = useApi("/api/admin/stats");
  const queue = useApi(`/api/admin/properties?status=${tab}`);
  const s = stats.data;

  async function decide(property, decision, why = "") {
    try {
      await api.patch(`/api/admin/properties/${property._id}/verify`, { decision, reason: why });
      showToast(decision === "verified" ? `"${property.title}" is now Verified` : `"${property.title}" was rejected`, decision === "verified" ? "success" : "info");
      setRejecting(null);
      setReason("");
      queue.reload();
      stats.reload();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function openDoc(id) {
    try { await api.openDocument(id); } catch (err) { showToast(err.message, "error"); }
  }

  const pie = s ? [
    { name: "Verified", value: s.byStatus.verified, color: "#059669" },
    { name: "Pending", value: s.byStatus.pending, color: "#f59e0b" },
    { name: "Rejected", value: s.byStatus.rejected, color: "#dc2626" }
  ].filter((x) => x.value > 0) : [];

  const list = queue.data?.properties || [];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2"><span className="material-symbols-outlined text-blue-700">admin_panel_settings</span> Admin Panel</h1>
        <p className="text-gray-500 mt-1">Check ownership documents and decide which listings become Verified.</p>
      </div>

      {s && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard index={0} icon="group" label="Total users" value={s.users} color="bg-blue-100 text-blue-700" />
            <StatCard index={1} icon="real_estate_agent" label="Owners" value={s.owners} color="bg-orange-100 text-orange-600" />
            <StatCard index={2} icon="business_center" label="Businesses" value={s.business} color="bg-sky-100 text-sky-700" />
            <StatCard index={3} icon="warehouse" label="Listings" value={s.properties} color="bg-green-100 text-green-700" />
            <StatCard index={4} icon="mail" label="Enquiries" value={s.enquiries} color="bg-purple-100 text-purple-700" />
            <StatCard index={5} icon="pending_actions" label="Awaiting review" value={s.byStatus.pending} color="bg-amber-100 text-amber-700" />
          </div>
          <div className="stagger-item bg-white border border-gray-200 rounded-xl p-5 shadow-sm" style={{ "--i": 6 }}>
            <h2 className="font-extrabold text-gray-900 mb-1">Listings by status</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
                    {pie.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ---------- verification queue ---------- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 flex px-4 md:px-6 gap-2 overflow-x-auto hide-scrollbar">
          {TABS.map(([value, label]) => (
            <button key={value} onClick={() => setTab(value)}
              className={`px-4 py-4 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === value ? "text-blue-700 border-blue-700 font-bold" : "text-gray-500 border-transparent hover:text-blue-700 font-semibold"}`}>
              {label} {s && <span className="ml-1 text-xs bg-gray-100 rounded-full px-2 py-0.5">{s.byStatus[value]}</span>}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-6 space-y-4">
          {queue.loading && <div className="skeleton h-32 w-full" />}
          {!queue.loading && list.length === 0 && <div className="empty-state">Nothing in "{tab}" right now.</div>}

          {list.map((p, i) => (
            <div key={p._id} className="stagger-item border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-5 hover:shadow-md transition-shadow" style={{ "--i": i }}>
              <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-blue-50 shrink-0">
                {p.photos?.[0] ? <img src={imageUrl(p.photos[0])} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-blue-200"><span className="material-symbols-outlined text-5xl">warehouse</span></div>}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{p.title}</h3>
                  <VerificationBadge status={p.verification} />
                </div>
                <p className="text-sm text-gray-500">{p.location} · {inr(p.area)} sqft · ₹{p.rent}/sqft</p>
                <p className="text-sm text-gray-500">Owner: <b className="text-gray-700">{p.ownerName}</b> · Submitted {formatDate(p.createdAt)}</p>
                {p.rejectionReason && <p className="text-sm text-red-600 mt-1">Reason: {p.rejectionReason}</p>}

                <div className="flex flex-wrap gap-2 mt-4">
                  {p.hasDocument
                    ? <button onClick={() => openDoc(p._id)} className="btn-outline !py-1.5 !px-3 text-sm"><span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> View document</button>
                    : <span className="text-sm text-gray-400 flex items-center gap-1 px-2"><span className="material-symbols-outlined text-[18px]">block</span> No document uploaded</span>}
                  <Link to={`/property/${p._id}`} className="px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1">Open listing</Link>
                  {p.verification !== "verified" && (
                    <button onClick={() => decide(p, "verified")} className="px-4 py-1.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span> Verify
                    </button>
                  )}
                  {p.verification !== "rejected" && (
                    <button onClick={() => { setRejecting(p); setReason(""); }} className="px-4 py-1.5 text-sm font-bold text-red-600 border-2 border-red-200 hover:bg-red-50 rounded-lg transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">cancel</span> Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {rejecting && (
        <Modal title={`Reject "${rejecting.title}"`} onClose={() => setRejecting(null)}>
          <p className="text-sm text-gray-600 mb-3">Tell the owner why, so they can fix it.</p>
          <textarea autoFocus rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Ownership document is not readable"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500" />
          <div className="flex justify-end gap-3 mt-4">
            <button className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setRejecting(null)}>Cancel</button>
            <button disabled={!reason.trim()} className="px-5 py-2 font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors" onClick={() => decide(rejecting, "rejected", reason.trim())}>Reject listing</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
