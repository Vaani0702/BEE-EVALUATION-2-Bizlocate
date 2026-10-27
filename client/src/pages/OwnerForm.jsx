import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import FormField from "../components/FormField";

const MAX_PHOTOS = 6;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB, same limit as Multer on the server

const emptyForm = {
  title: "", type: "warehousing", location: "", area: "", rent: "", power: "",
  height: "", docks: "", zoning: "", truckAccess: "yes", description: ""
};

export default function OwnerForm() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]);     // array of File objects chosen by the owner
  const [doc, setDoc] = useState(null);         // the ownership PDF (one File)
  const [busy, setBusy] = useState(false);
  const photoInput = useRef(null);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Small preview pictures for the chosen files (blob: URLs only exist in the browser).
  const [previews, setPreviews] = useState([]);
  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u)); // free the memory when the list changes
  }, [photos]);

  function addPhotos(e) {
    const chosen = Array.from(e.target.files);
    e.target.value = ""; // so choosing the same file again still triggers onChange
    const good = [];
    for (const f of chosen) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { showToast(`${f.name}: only JPG, PNG or WEBP`, "error"); continue; }
      if (f.size > MAX_SIZE) { showToast(`${f.name} is bigger than 5 MB`, "error"); continue; }
      good.push(f);
    }
    const all = [...photos, ...good];
    if (all.length > MAX_PHOTOS) showToast(`Maximum ${MAX_PHOTOS} photos`, "info");
    setPhotos(all.slice(0, MAX_PHOTOS));
  }

  const removePhoto = (index) => setPhotos(photos.filter((_, i) => i !== index));

  function chooseDoc(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== "application/pdf") { showToast("Ownership document must be a PDF", "error"); e.target.value = ""; return; }
    if (f.size > MAX_SIZE) { showToast("PDF is bigger than 5 MB", "error"); e.target.value = ""; return; }
    setDoc(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!doc) { showToast("Please upload your ownership document (PDF)", "error"); return; }

    // FormData = the way a browser sends text AND files together (multipart/form-data).
    // The field names ("photos", "ownershipDoc") must match what Multer expects on the server.
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    photos.forEach((file) => data.append("photos", file));
    data.append("ownershipDoc", doc);

    setBusy(true);
    try {
      await api.post("/api/properties", data);
      showToast("Property submitted! It will show as Verified once the admin approves it.", "success", 4200);
      navigate("/profile");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  const radio = (value, icon, text) => (
    <label className="flex-1 cursor-pointer">
      <input className="peer sr-only" name="truckAccess" type="radio" value={value} checked={form.truckAccess === value} onChange={change} />
      <div className="border-2 border-gray-300 rounded-lg py-3 flex items-center justify-center gap-2 peer-checked:bg-orange-500 peer-checked:border-orange-500 peer-checked:text-white transition-all hover:-translate-y-0.5">
        <span className="material-symbols-outlined text-[20px]">{icon}</span><span className="text-sm font-semibold">{text}</span>
      </div>
    </label>
  );

  return (
    <div className="blueprint-grid flex-grow flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-3xl bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <div className="border-b border-gray-200 p-8 md:p-12 bg-linear-to-r from-orange-50 to-white">
          <span className="badge badge-premium mb-3">Step for Property Owners</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">List Your Property</h1>
          <p className="text-gray-600">Add your industrial property so it gets matched against verified business requirements.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          {/* ---- Basics ---- */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Property Basics</h2>
            <FormField label="Property Title" icon="warehouse" name="title" value={form.title} onChange={change} placeholder="e.g., Grade A Logistics Warehouse" color="orange" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-gray-700 font-semibold" htmlFor="type">Property Type</label>
                <div className="form-input-focus rounded-lg border border-gray-300 bg-white flex items-center pr-4">
                  <span className="material-symbols-outlined text-orange-500 ml-4">factory</span>
                  <select className="w-full bg-transparent border-none focus:ring-0 py-3 pl-3 pr-8 cursor-pointer" id="type" name="type" value={form.type} onChange={change}>
                    <option value="manufacturing">Heavy Manufacturing</option>
                    <option value="logistics">Logistics &amp; Distribution</option>
                    <option value="warehousing">Cold Storage / Warehousing</option>
                    <option value="rd">R&amp;D / Flex Space</option>
                  </select>
                </div>
              </div>
              <FormField label="Location" icon="location_on" name="location" value={form.location} onChange={change} placeholder="e.g., MIDC, Bhiwandi" color="orange" required />
            </div>
          </div>

          {/* ---- Specs ---- */}
          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Facility Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Built-up Area" icon="aspect_ratio" name="area" value={form.area} onChange={change} placeholder="e.g., 50000" unit="SQFT" type="number" color="orange" />
              <FormField label="Rent" icon="payments" name="rent" value={form.rent} onChange={change} placeholder="e.g., 22" unit="₹ /sqft" type="number" color="orange" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Power Capacity" icon="bolt" name="power" value={form.power} onChange={change} placeholder="e.g., 250" unit="HP" type="number" color="orange" />
              <FormField label="Clear Height" icon="straighten" name="height" value={form.height} onChange={change} placeholder="e.g., 12 Meters" color="orange" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Loading Docks" icon="local_shipping" name="docks" value={form.docks} onChange={change} placeholder="e.g., 6 (Dock Levelers)" color="orange" />
              <FormField label="Zoning / Park" icon="domain" name="zoning" value={form.zoning} onChange={change} placeholder="e.g., MIDC Approved" color="orange" />
            </div>
            <div className="space-y-3">
              <label className="block text-sm text-gray-700 font-semibold">Heavy Vehicle Access</label>
              <div className="flex gap-4">
                {radio("yes", "local_shipping", "Available")}
                {radio("no", "block", "Not Available")}
              </div>
            </div>
          </div>

          {/* ---- Uploads (Multer) ---- */}
          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Photos &amp; Ownership Proof</h2>

            <div className="space-y-3">
              <label className="block text-sm text-gray-700 font-semibold">Property Photos <span className="text-gray-400 font-normal">(up to {MAX_PHOTOS}, JPG / PNG / WEBP, 5 MB each)</span></label>
              <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} className="hidden" />
              <button type="button" onClick={() => photoInput.current.click()}
                className="w-full border-2 border-dashed border-orange-300 bg-orange-50/50 hover:bg-orange-50 hover:border-orange-400 rounded-xl py-8 flex flex-col items-center gap-1 text-orange-600 transition-all hover:-translate-y-0.5">
                <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                <span className="font-bold text-sm">Click to add photos</span>
                <span className="text-xs text-gray-500">{photos.length} / {MAX_PHOTOS} selected</span>
              </button>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {photos.map((file, i) => (
                    <div key={file.name + i} className="animate-scale-in relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={previews[i]} alt={file.name} className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">COVER</span>}
                      <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-white/90 hover:bg-red-500 hover:text-white rounded-full w-6 h-6 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all" aria-label="Remove photo">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-700 font-semibold" htmlFor="ownershipDoc">
                Ownership Document <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(title deed or proof, PDF, 5 MB max)</span>
              </label>
              <label htmlFor="ownershipDoc" className={`flex items-center gap-3 border-2 rounded-xl px-4 py-4 cursor-pointer transition-all hover:-translate-y-0.5 ${doc ? "border-green-400 bg-green-50" : "border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50"}`}>
                <span className={`material-symbols-outlined text-3xl ${doc ? "text-green-600" : "text-blue-600"}`}>{doc ? "task" : "upload_file"}</span>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">{doc ? doc.name : "Click to choose a PDF"}</p>
                  <p className="text-xs text-gray-500">{doc ? (doc.size / 1024).toFixed(0) + " KB, only the admin and you can open it" : "Kept private. Only you and the admin can open it."}</p>
                </div>
              </label>
              <input id="ownershipDoc" type="file" accept="application/pdf" onChange={chooseDoc} className="hidden" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-700 font-semibold" htmlFor="description">Description</label>
              <textarea className="w-full form-input-focus rounded-lg border border-gray-300 bg-white p-4 focus:ring-0" id="description" name="description" rows={4}
                placeholder="Describe the facility, connectivity, and compliance details..." value={form.description} onChange={change} />
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 max-w-sm">Your listing goes live straight away and gets the Verified badge once the admin checks your document.</p>
            <button type="submit" disabled={busy} className="btn-blue w-full sm:w-auto !px-8 !py-4">
              {busy ? "Uploading..." : "Save & List Property"} <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
