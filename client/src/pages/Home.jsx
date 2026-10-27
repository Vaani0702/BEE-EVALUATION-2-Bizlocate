import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Reveal from "../components/Reveal";
import { useAuth } from "../context/AuthContext";

const HERO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuBWu8OhFhuiZxRtL7gffoVh9cbKenir-egradAKnlmK-gdlg2fM662FZS2UurYr5x85FIXIj5bVjM9KQxBfH-om2c--1QK2ZLq5o1jkN7-gKy-vgyAtb6tlSwS3aZb-iBTMJZGrG5feZ2SPH3XIDoy9wwpsyu7Jy7QMOLM5XTD4J5fTqgrN5ZQFzAcTjHMQ4tF6JAOlCRGkPb-CLx9wTLr2JlNiKdTR222kYSB3ShzPJL0t8eMF9vms";

const HUBS = [
  { name: "Bhiwandi", count: "1,200+ Properties", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQySyQuS5aPmev9rwITG2I8LL_9lJP5CJnDA9KOBj_HgJVohSY3IIAex8GM3wrINN4wRjSpxZGWTj9oUDGBOdVnCbGcsJ3En84nxswuNzWQ78MmCbvG2S9YklGKUq65Y3G_xwvwYrMK3rsD74JynMzz0Z0Y4bd0fW4tUEl6HjNxXMzuo-YHrMPwh4rrEkp3HLeIXU31GTQ8afz0BFA0VmPVRuty3jLpYtgj2jVuekZ1kksoqkJMS0F" },
  { name: "Pune", count: "850+ Properties", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtNaNjS_Ht4MqyFHA8RXcIsOIkwkJKWskqOXniBUiVqBL3_Uk0l6dAU694v0eIVo0STwtTO6fCDnHOfcwaQzkwuUGkBCoJH-6_Ch0gveG2_FYwPsJlYS1btP9FSfIJ9UX3Z_mOw5hk-DcJY0euKUbJwZmvytVhtdYIvzxsGy2ZQReQW2t1iHCFoQH-dUcll1Hvp7POiKBhEOnCCIf7QF9U-QasSSqFF9NElvc2dynt4EAXKAksAQx-" },
  { name: "Gurgaon", count: "600+ Properties", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBC5o2r821P-jMMvTsAFAnuy9o9VZy7R2T_ShmWuU2SF4PWARhydF2UHvveY6kEy-smfUjTQkNKOWBr_i8x0HQuNdc_Sb3tX-tPuOiBKvIeRq1mp3nl93UjxIZMM8gZKBWDytT3WTgHLwEOOxx2o2bfGJ_u7--vCuo3Jd6Z9gwPFtHBCW_LnngBxGGMe5IER_1jAQQw5OS56SMlR_1JyGebWAQVRplskGKKmrFXlFCCvnkBHi3WsMVl" }
];

const STEPS = [
  { icon: "tune", title: "Tell us needs", text: "Input your precise operational requirements: clear height, power capacity, docking doors, and zoning restrictions.", box: "bg-blue-50 border-blue-100", ring: "border-blue-600 text-blue-700", iconColor: "text-blue-700" },
  { icon: "all_match", title: "Match", text: "Our algorithm cross-references your needs against our structured database of industrial properties, generating a compatibility score.", box: "bg-orange-50 border-orange-100", ring: "border-orange-500 text-orange-600", iconColor: "text-orange-600" },
  { icon: "verified", title: "See verified status", text: "Review properties with verified structural data. Connect directly with owners when the match meets your operational threshold.", box: "bg-green-50 border-green-100", ring: "border-green-600 text-green-700", iconColor: "text-green-700" }
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  // The hero search sends the words to the Listings page through the URL (?search=..&type=..)
  function handleSearch() {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (type) params.set("type", type);
    navigate("/listings" + (params.toString() ? "?" + params : ""));
  }

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative w-full min-h-[620px] flex items-center justify-center overflow-hidden bg-linear-to-br from-blue-950 via-blue-900 to-blue-800">
        <img alt="Industrial park exterior" className="absolute inset-0 w-full h-full object-cover opacity-40" src={HERO_IMG} />
        {/* two soft glowing circles that float slowly */}
        <div className="animate-float absolute -top-24 -left-24 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="animate-float absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-blue-400/20 blur-3xl" style={{ animationDelay: "-4s" }} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center py-20">
          <span className="stagger-item badge bg-orange-500/90 text-white mb-6 shadow-lg" style={{ "--i": 0 }}>Industrial Real Estate Intelligence</span>
          <h1 className="stagger-item text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-md leading-tight" style={{ "--i": 1 }}>
            Find the Perfect Space for <span className="text-orange-400">Your Business</span>
          </h1>
          <p className="stagger-item text-lg text-blue-100 mb-10 max-w-2xl mx-auto" style={{ "--i": 2 }}>
            SiteIQ compares your operational needs against real property data — precision-matched for modern logistics, manufacturing, and enterprise.
          </p>

          <div className="stagger-item bg-white rounded-xl p-6 w-full max-w-4xl shadow-2xl border border-gray-100" style={{ "--i": 3 }}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">location_on</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  placeholder="City, Locality, or Project (e.g., Bhiwandi, Pune)" type="text" />
              </div>
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">category</span>
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none appearance-none">
                  <option value="">Property Type</option>
                  <option value="warehousing">Warehouse</option>
                  <option value="manufacturing">Manufacturing Unit</option>
                  <option value="logistics">Logistics</option>
                  <option value="rd">R&amp;D / Flex</option>
                </select>
              </div>
              <button onClick={handleSearch} className="btn-orange !px-8 !py-3">Search</button>
            </div>
          </div>

          <div className="stagger-item flex flex-col sm:flex-row items-center justify-center gap-4 mt-10" style={{ "--i": 4 }}>
            <button onClick={() => navigate(user ? "/business-form" : "/signup")}
              className="w-full sm:w-auto bg-white text-blue-900 font-bold px-8 py-4 rounded-lg hover:-translate-y-1 hover:shadow-xl transition-all shadow-lg active:scale-95">
              I'm a Business
            </button>
            <button onClick={() => navigate(user ? "/owner-form" : "/signup")}
              className="w-full sm:w-auto border-2 border-orange-400 text-orange-300 font-bold px-8 py-4 rounded-lg hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:-translate-y-1 transition-all active:scale-95">
              I'm a Property Owner
            </button>
          </div>
        </div>
      </section>

      {/* ---------- POPULAR HUBS ---------- */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Reveal><h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">Popular Industrial Hubs</h2></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HUBS.map((h, i) => (
              <Reveal key={h.name} delay={i}>
                <Link to={`/listings?search=${h.name}`} className="group relative rounded-xl overflow-hidden cursor-pointer brand-card shadow-sm block">
                  <div className="absolute inset-0 bg-linear-to-t from-blue-950 to-transparent opacity-80 z-10" />
                  <img className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700" src={h.img} alt={h.name} loading="lazy" />
                  <div className="absolute bottom-0 left-0 p-6 z-20">
                    <h3 className="text-xl font-bold text-white mb-1">{h.name}</h3>
                    <p className="text-sm text-blue-100">{h.count}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">How BizLocate Works</h2>
            <div className="h-1.5 w-16 bg-orange-500 mx-auto mt-4 rounded-full" />
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i}>
                <div className={`${s.box} border p-8 rounded-xl relative brand-card h-full`}>
                  <div className={`absolute -top-6 -left-6 w-12 h-12 bg-white border-2 ${s.ring} rounded-full flex items-center justify-center font-extrabold shadow-sm`}>{i + 1}</div>
                  <span className={`material-symbols-outlined text-4xl ${s.iconColor} mb-4 block`}>{s.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-600">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- STRUCTURAL PRECISION ---------- */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Reveal className="mb-16"><h2 className="text-3xl font-extrabold text-gray-900">Structural Precision</h2></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[300px]">
            <Reveal className="md:col-span-8">
              <div className="h-full bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm">
                <div className="p-8 flex-1 flex flex-col justify-center">
                  <span className="badge badge-available w-fit mb-4">Tier 1 Verified</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Verification Tiers</h3>
                  <p className="text-gray-600">Properties aren't just listed; they are verified by our admin team, who check each owner's ownership document before a listing earns the Verified badge and ranks higher.</p>
                </div>
                <div className="w-full md:w-1/2 min-h-48 bg-gray-100 relative"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDWXpCiTjpcMLL9w7H_136wfg1OqiA7jC2RggmzYhCCMo65nvRf62RVgjJFf-Fqv5_7IN3vFdbBzrb70jFYDvDH1kxY7vpYfOmQjKD977Djpi5E9LpIxuCIeP8oYQCqzG5kXA92YcPTd9DtiHoDWX1-t7R2zvkiakaswSS4nAWLNPvH7ENHO4umRq9vIrI_aijvxw1Ocd9v7M0cHJQdgu6B3eYKIXUgzF28zthNb-1dabst7gA2Bdqo')", backgroundSize: "cover", backgroundPosition: "center" }} />
              </div>
            </Reveal>
            <Reveal className="md:col-span-4" delay={1}>
              <div className="h-full bg-linear-to-br from-blue-900 to-blue-950 text-white rounded-xl overflow-hidden p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="material-symbols-outlined text-4xl text-orange-400 mb-4 block">data_object</span>
                  <h3 className="text-xl font-bold mb-2">Algorithm Preview</h3>
                  <p className="text-blue-100">Go beyond square footage. Our matching algorithm weighs area, budget, power and location.</p>
                </div>
                <div className="mt-8 border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center mb-2"><span className="text-xs text-blue-200">Match Score</span><span className="text-xl font-bold text-orange-400">94%</span></div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden"><div className="animate-grow-bar bg-orange-400 h-full w-[94%]" /></div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
