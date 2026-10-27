import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import FormField from "../components/FormField";

const emptyForm = { businessType: "", sqft: "", power: "", budget: "", location: "", truckAccess: "yes" };

export default function BusinessForm() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  // If the user saved a requirement earlier, fill the form with it.
  useEffect(() => {
    if (!user) return;
    api.get("/api/requirement").then(({ requirement: r }) => {
      if (r) setForm({ businessType: r.businessType, sqft: r.sqft || "", power: r.power || "", budget: r.budget || "", location: r.location, truckAccess: r.truckAccess ? "yes" : "no" });
    }).catch(() => {});
  }, [user]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) { showToast("Please login to continue", "error"); navigate("/login", { state: { from: "/business-form" } }); return; }
    setBusy(true);
    try {
      await api.put("/api/requirement", { ...form, truckAccess: form.truckAccess === "yes" });
      showToast("Requirements saved! Finding matches...", "success");
      navigate("/listings");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  const radio = (value, icon, text) => (
    <label className="flex-1 cursor-pointer">
      <input className="peer sr-only" name="truckAccess" type="radio" value={value} checked={form.truckAccess === value} onChange={change} />
      <div className="border-2 border-gray-300 rounded-lg py-3 flex items-center justify-center gap-2 peer-checked:bg-blue-700 peer-checked:border-blue-700 peer-checked:text-white transition-all hover:-translate-y-0.5">
        <span className="material-symbols-outlined text-[20px]">{icon}</span><span className="text-sm font-semibold">{text}</span>
      </div>
    </label>
  );

  return (
    <div className="blueprint-grid flex-grow flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-3xl bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <div className="border-b border-gray-200 p-8 md:p-12 bg-linear-to-r from-blue-50 to-white">
          <span className="badge badge-match mb-3">Step for Businesses</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Define Your Operations</h1>
          <p className="text-gray-600">Submit your facility requirements to receive precision-matched industrial listings.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Facility Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-gray-700 font-semibold" htmlFor="businessType">Primary Operation Type</label>
                <div className="form-input-focus rounded-lg border border-gray-300 bg-white flex items-center pr-4">
                  <span className="material-symbols-outlined text-blue-600 ml-4">factory</span>
                  <select className="w-full bg-transparent border-none focus:ring-0 py-3 pl-3 pr-8 cursor-pointer" id="businessType" name="businessType" value={form.businessType} onChange={change}>
                    <option value="">Select operation type</option>
                    <option value="manufacturing">Heavy Manufacturing</option>
                    <option value="logistics">Logistics &amp; Distribution</option>
                    <option value="warehousing">Cold Storage / Warehousing</option>
                    <option value="rd">R&amp;D / Flex Space</option>
                  </select>
                </div>
              </div>
              <FormField label="Minimum Square Footage" icon="aspect_ratio" name="sqft" value={form.sqft} onChange={change} placeholder="e.g., 50000" unit="SQFT" type="number" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Power Requirements (HP)" icon="bolt" name="power" value={form.power} onChange={change} placeholder="e.g., 200" unit="HP" type="number" />
              <FormField label="Max Rent Budget (₹/sqft)" icon="payments" name="budget" value={form.budget} onChange={change} placeholder="e.g., 25" unit="₹ /sqft" type="number" />
            </div>
          </div>

          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Access &amp; Geography</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Preferred Hub Location" icon="location_on" name="location" value={form.location} onChange={change} placeholder="e.g., Pune, Bhiwandi, Gurgaon" />
              <div className="space-y-3">
                <label className="block text-sm text-gray-700 font-semibold">Requires Heavy Vehicle Access</label>
                <div className="flex gap-4">
                  {radio("yes", "local_shipping", "Yes, Required")}
                  {radio("no", "block", "Not Needed")}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 max-w-sm">By saving, your requirements will be indexed against our proprietary off-market database.</p>
            <button type="submit" disabled={busy} className="btn-orange w-full sm:w-auto !px-8 !py-4">
              {busy ? "Saving..." : "Save Requirements"} <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
