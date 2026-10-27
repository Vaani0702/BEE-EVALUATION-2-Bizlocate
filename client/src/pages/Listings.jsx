import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import { ListSkeleton } from "../components/Skeletons";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { calculateMatch } from "../utils";

const emptyFilters = { minPrice: "", maxPrice: "", sqft: [], power: "any", sort: "match" };

export default function Listings() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams(); // ?search=..&type=.. in the URL
  const search = params.get("search") || "";
  const type = params.get("type") || "";

  const [filters, setFilters] = useState(emptyFilters);

  const { data, loading, error } = useApi("/api/properties");
  const { data: reqData } = useApi(user ? "/api/requirement" : null);
  const requirement = reqData?.requirement || null;

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };

  function toggleSqft(value) {
    const list = filters.sqft.includes(value) ? filters.sqft.filter((v) => v !== value) : [...filters.sqft, value];
    setFilters({ ...filters, sqft: list });
  }

  function clearAll() {
    setFilters(emptyFilters);
    setParams({}, { replace: true });
  }

  // Filter + sort. useMemo = only recalculate when the inputs change.
  const results = useMemo(() => {
    const all = data?.properties || [];
    const min = Number(filters.minPrice) || 0;
    const max = Number(filters.maxPrice) || Infinity;
    const q = search.toLowerCase();

    const filtered = all.filter((p) => {
      if (p.rent < min || p.rent > max) return false;
      if (type && p.type !== type) return false;
      if (filters.sqft.length > 0) {
        const inRange = filters.sqft.some((r) =>
          (r === "under10k" && p.area <= 10000) ||
          (r === "10to50k" && p.area > 10000 && p.area <= 50000) ||
          (r === "over50k" && p.area > 50000));
        if (!inRange) return false;
      }
      if (filters.power === "under100" && p.power > 100) return false;
      if (filters.power === "100to500" && (p.power < 100 || p.power > 500)) return false;
      if (filters.power === "over500" && p.power < 500) return false;
      if (q && !(p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q))) return false;
      return true;
    });

    // 1st: the chosen sort order
    filtered.sort((a, b) => {
      if (filters.sort === "priceAsc") return a.rent - b.rent;
      if (filters.sort === "areaDesc") return b.area - a.area;
      return (calculateMatch(b, requirement) || 0) - (calculateMatch(a, requirement) || 0);
    });
    // 2nd: Verified listings always rank above unverified ones (sort is stable, so step 1 is kept inside each group)
    filtered.sort((a, b) => (b.verification === "verified") - (a.verification === "verified"));
    return filtered;
  }, [data, filters, search, type, requirement]);

  const inputClass = "w-full border border-gray-200 rounded-lg text-sm p-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none";

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-6">
      {/* ---------- Filters ---------- */}
      <aside className="w-full md:w-1/4 shrink-0 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm md:sticky md:top-28">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900">Filters</h2>
            <button className="text-orange-600 text-sm font-bold hover:underline" onClick={clearAll}>Clear All</button>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Price Range (₹/sqft/mo)</h3>
            <div className="flex gap-2 items-center">
              <input className={inputClass} placeholder="Min" type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
              <span className="text-gray-400">-</span>
              <input className={inputClass} placeholder="Max" type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Built-up Area (SQFT)</h3>
            <div className="space-y-2">
              {[["under10k", "Up to 10,000"], ["10to50k", "10,000 - 50,000"], ["over50k", "50,000+"]].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input className="rounded w-4 h-4 text-blue-600" type="checkbox" checked={filters.sqft.includes(value)} onChange={() => toggleSqft(value)} />
                  <span className="text-sm text-gray-600">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Power Capacity</h3>
            <select className={inputClass} value={filters.power} onChange={(e) => setFilters({ ...filters, power: e.target.value })}>
              <option value="any">Any Power</option>
              <option value="under100">Up to 100 HP</option>
              <option value="100to500">100 - 500 HP</option>
              <option value="over500">500+ HP (HT Line)</option>
            </select>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Property Type</h3>
            <select className={inputClass} value={type} onChange={(e) => setParam("type", e.target.value)}>
              <option value="">All types</option>
              <option value="warehousing">Warehouse</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="logistics">Logistics</option>
              <option value="rd">R&amp;D / Flex</option>
            </select>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Sort</h3>
            <select className={inputClass} value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
              <option value="match">Match Percentage (High to Low)</option>
              <option value="priceAsc">Price (Low to High)</option>
              <option value="areaDesc">Area (Large to Small)</option>
            </select>
            <p className="text-xs text-gray-400 mt-2 flex items-start gap-1">
              <span className="material-symbols-outlined text-[14px] text-emerald-600" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
              Verified listings always appear first.
            </p>
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-800 to-blue-950 text-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold mb-2">Need Help?</h3>
          <p className="text-sm mb-4 text-blue-100">Connect with a specialized industrial broker in Pune.</p>
          <button className="btn-orange w-full !py-2">Contact Broker</button>
        </div>
      </aside>

      {/* ---------- Results ---------- */}
      <div className="flex-grow flex flex-col gap-6 min-w-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Industrial Properties</h1>
            <p className="text-gray-500">{loading ? "Loading listings..." : `Showing ${results.length} matched listing${results.length === 1 ? "" : "s"}`}</p>
          </div>
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[20px]">search</span>
            <input className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-white"
              placeholder="Search title or location" value={search} onChange={(e) => setParam("search", e.target.value)} />
          </div>
        </div>

        {user && !requirement && !loading && (
          <div className="animate-fade-in bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex items-center gap-3">
            <span className="material-symbols-outlined">tune</span>
            Save your business requirements to see a Match % on every listing.
          </div>
        )}

        {loading && <ListSkeleton />}
        {error && <div className="empty-state">{error}</div>}
        {!loading && !error && results.length === 0 && (
          <div className="empty-state">No properties match your filters yet. Try adjusting them.</div>
        )}
        <div className="flex flex-col gap-6">
          {results.map((p, i) => <PropertyCard key={p._id} property={p} requirement={requirement} index={i} />)}
        </div>
      </div>
    </div>
  );
}
