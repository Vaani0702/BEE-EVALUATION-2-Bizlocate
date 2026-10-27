import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApi } from "../hooks/useApi";
import { useCountUp } from "../hooks/useCountUp";
import { inr } from "../utils";

// Number that counts up from 0 when the page opens.
function StatCard({ icon, label, value, prefix = "", color, index }) {
  const shown = useCountUp(value);
  return (
    <div className="stagger-item brand-card bg-white border border-gray-200 rounded-xl p-6 shadow-sm" style={{ "--i": index }}>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${color}`}><span className="material-symbols-outlined">{icon}</span></div>
      <p className="text-xs uppercase text-gray-400 font-semibold">{label}</p>
      <p className="text-3xl font-extrabold text-gray-900">{prefix}{inr(shown)}</p>
    </div>
  );
}

const short = (title) => (title.length > 16 ? title.slice(0, 15) + "…" : title);

export default function Dashboard() {
  const { data, loading } = useApi("/api/analytics/me");
  const rows = (data?.rows || []).map((r) => ({ ...r, name: short(r.title) }));
  const t = data?.totals;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2"><span className="material-symbols-outlined text-blue-700">monitoring</span> Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">How your properties are performing: views, enquiries and your share of the rent.</p>
        </div>
        <Link to="/owner-form" className="btn-orange w-fit"><span className="material-symbols-outlined">add</span> List another property</Link>
      </div>

      {loading && <div className="skeleton h-40 w-full" />}

      {!loading && rows.length === 0 && (
        <div className="empty-state">You don't own any property yet. <Link to="/owner-form" className="text-blue-700 font-bold">List one</Link> to see your numbers here.</div>
      )}

      {t && rows.length > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard index={0} icon="warehouse" label="Properties" value={t.properties} color="bg-blue-100 text-blue-700" />
            <StatCard index={1} icon="visibility" label="Total views" value={t.views} color="bg-sky-100 text-sky-700" />
            <StatCard index={2} icon="mail" label="Enquiries" value={t.enquiries} color="bg-orange-100 text-orange-600" />
            <StatCard index={3} icon="payments" label="Your rent share / month" value={t.earnings} prefix="₹ " color="bg-green-100 text-green-700" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="stagger-item bg-white border border-gray-200 rounded-xl p-6 shadow-sm" style={{ "--i": 4 }}>
              <h2 className="font-extrabold text-gray-900 mb-1">Views &amp; enquiries per property</h2>
              <p className="text-sm text-gray-500 mb-4">Which listings get attention, and which turn into messages.</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rows} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: "#eff6ff" }} />
                    <Legend />
                    <Bar dataKey="views" name="Views" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="enquiries" name="Enquiries" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="stagger-item bg-white border border-gray-200 rounded-xl p-6 shadow-sm" style={{ "--i": 5 }}>
              <h2 className="font-extrabold text-gray-900 mb-1">Your rent share per property (₹ / month)</h2>
              <p className="text-sm text-gray-500 mb-4">Monthly rent × your share % (if fully rented).</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rows} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => (v >= 100000 ? v / 100000 + "L" : v >= 1000 ? v / 1000 + "k" : v)} />
                    <Tooltip cursor={{ fill: "#fff7ed" }} formatter={(v) => ["₹ " + inr(v), "Your share"]} />
                    <Bar dataKey="earnings" name="Your share" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="stagger-item bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm" style={{ "--i": 6 }}>
            <div className="p-6 border-b border-gray-200"><h2 className="font-extrabold text-gray-900">Property breakdown</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr className="text-left text-xs uppercase text-gray-400">
                  <th className="p-4">Property</th><th className="p-4">Status</th><th className="p-4">My share</th><th className="p-4">Views</th><th className="p-4">Enquiries</th><th className="p-4 text-right">Share / month</th>
                </tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-gray-100 hover:bg-blue-50/40 transition-colors">
                      <td className="p-4 font-semibold"><Link className="hover:text-blue-700" to={`/property/${r.id}`}>{r.title}</Link></td>
                      <td className="p-4 capitalize">{r.verification}</td>
                      <td className="p-4">{r.myPercent}%</td>
                      <td className="p-4">{r.views}</td>
                      <td className="p-4">{r.enquiries}</td>
                      <td className="p-4 text-right font-bold text-orange-600">₹ {inr(r.earnings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
