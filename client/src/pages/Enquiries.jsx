import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate, imageUrl, initials } from "../utils";

const TABS = [
  { value: "All", label: "All Enquiries" },
  { value: "Pending", label: "Pending" },
  { value: "Responded", label: "Responded" },
  { value: "Scheduled", label: "Scheduled Site Visits" }
];
const BADGE = { Pending: "bg-orange-500", Scheduled: "bg-green-600", Responded: "bg-blue-700" };

export default function Enquiries() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data, loading, reload } = useApi("/api/enquiries");
  const [tab, setTab] = useState("All");

  const all = data?.enquiries || [];
  const shown = tab === "All" ? all : all.filter((e) => e.status === tab);
  const newCount = all.filter((e) => e.received && e.status === "Pending").length;

  async function setStatus(id, status) {
    try {
      await api.patch(`/api/enquiries/${id}/status`, { status });
      showToast(`Marked as ${status}`, "success");
      reload();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2"><span className="material-symbols-outlined text-blue-700">forum</span> My Enquiries</h1>
          <p className="text-gray-500 mt-2">Manage communications with potential buyers and tenants.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500"><span className="material-symbols-outlined">mail</span></div>
          <div><div className="text-xs uppercase text-gray-500 font-semibold">New</div><div className="font-extrabold text-gray-900">{newCount}</div></div>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-8 border-b border-gray-200 hide-scrollbar">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`pb-2 whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${tab === t.value ? "text-blue-700 border-blue-700 font-bold" : "text-gray-500 border-transparent hover:text-blue-700 font-semibold"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="skeleton h-48 w-full" />}
      {!loading && shown.length === 0 && <div className="empty-state">No enquiries here yet.</div>}

      <div className="grid grid-cols-1 gap-6">
        {shown.map((e, i) => (
          <div key={e._id} className="stagger-item brand-card bg-white border border-gray-200 rounded-lg p-4 md:p-6 flex flex-col lg:flex-row gap-6" style={{ "--i": i }}>
            <div className="w-full lg:w-64 h-48 lg:h-auto rounded overflow-hidden flex-shrink-0 relative bg-blue-50">
              {e.property?.photos?.[0]
                ? <img alt="Property" className="w-full h-full object-cover" src={imageUrl(e.property.photos[0])} />
                : <div className="w-full h-full flex items-center justify-center text-blue-200"><span className="material-symbols-outlined text-6xl">warehouse</span></div>}
              <div className={`absolute top-2 left-2 ${BADGE[e.status]} text-white text-xs font-bold px-2 py-1 rounded uppercase`}>{e.status}</div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2 gap-3">
                  <h3 className="font-semibold text-gray-900">{e.property?.title || "(property removed)"}</h3>
                  <span className="text-sm text-gray-500 flex items-center gap-1 whitespace-nowrap"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {formatDate(e.createdAt)}</span>
                </div>
                <div className="bg-blue-50 rounded p-4 mb-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">{initials(e.business?.name)}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{e.received ? e.business?.name : "You"}</div>
                      <div className="text-sm text-gray-500">{e.property?.location}</div>
                    </div>
                    <span className={`ml-auto badge ${e.received ? "badge-premium" : "badge-match"}`}>{e.received ? "Received" : "Sent"}</span>
                  </div>
                  <p className="text-sm text-gray-700 italic">"{e.message}"</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0 pt-4 border-t border-gray-200">
                {e.received ? (
                  <>
                    <button className="btn-orange !py-2" onClick={() => setStatus(e._id, "Responded")} disabled={e.status === "Responded"}>
                      <span className="material-symbols-outlined text-[18px]">chat</span> Mark Responded
                    </button>
                    <button className="btn-outline !py-2" onClick={() => setStatus(e._id, "Scheduled")} disabled={e.status === "Scheduled"}>Schedule Visit</button>
                  </>
                ) : (
                  e.property && <Link className="btn-outline !py-2" to={`/property/${e.property._id}`}>View Property</Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
