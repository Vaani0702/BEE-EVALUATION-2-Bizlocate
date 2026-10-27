import { Link } from "react-router-dom";

// The BizLocate logo. It always links to the home page.
export default function Logo({ light = false }) {
  return (
    <Link to="/" className="brand-link flex items-center gap-3" aria-label="BizLocate home">
      <div className="brand-mark">
        <span className="material-symbols-outlined text-white text-[22px]">location_city</span>
      </div>
      {light ? (
        <span className="text-xl font-extrabold text-white">Biz<span className="text-orange-400">Locate</span></span>
      ) : (
        <span className="brand-wordmark"><span className="biz">Biz</span><span className="locate">Locate</span></span>
      )}
    </Link>
  );
}
