import { useEffect, useState } from "react";
import { imageUrl } from "../utils";

// Photo gallery: big picture + thumbnails + arrows + click for full screen.
export default function Gallery({ photos = [], title = "" }) {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const count = photos.length;

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  // Keyboard arrows + Escape while the full-screen view is open.
  useEffect(() => {
    if (!full) return;
    const onKey = (e) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full, count]);

  if (count === 0) {
    return (
      <div className="h-[300px] md:h-[420px] rounded-xl bg-linear-to-br from-blue-100 to-blue-50 flex flex-col items-center justify-center text-blue-300 mb-12 border border-blue-100">
        <span className="material-symbols-outlined text-7xl">warehouse</span>
        <p className="text-sm font-semibold mt-2">No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="relative h-[320px] md:h-[500px] rounded-xl overflow-hidden shadow-sm bg-gray-100 group cursor-zoom-in" onClick={() => setFull(true)}>
        {/* key={index} re-creates the <img> so the fade animation plays on every change */}
        <img key={index} src={imageUrl(photos[index])} alt={title} className="animate-fade-in w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        {count > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Previous photo">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next photo">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <span className="absolute bottom-3 right-3 bg-blue-950/70 text-white text-xs font-bold px-3 py-1 rounded-full">{index + 1} / {count}</span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-3 mt-3 overflow-x-auto hide-scrollbar py-1">
          {photos.map((p, i) => (
            <button key={p + i} onClick={() => setIndex(i)} className={`gallery-thumb shrink-0 w-24 h-16 rounded-lg overflow-hidden ${i === index ? "active" : ""}`}>
              <img src={imageUrl(p)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {full && (
        <div className="animate-fade-in fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setFull(false)}>
          <img src={imageUrl(photos[index])} alt={title} className="animate-scale-in max-h-full max-w-full rounded-lg" onClick={(e) => e.stopPropagation()} />
          {count > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white bg-white/10 hover:bg-white/25 w-12 h-12 rounded-full flex items-center justify-center"><span className="material-symbols-outlined">chevron_left</span></button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 text-white bg-white/10 hover:bg-white/25 w-12 h-12 rounded-full flex items-center justify-center"><span className="material-symbols-outlined">chevron_right</span></button>
            </>
          )}
          <button className="absolute top-4 right-4 text-white" aria-label="Close"><span className="material-symbols-outlined text-3xl">close</span></button>
        </div>
      )}
    </div>
  );
}
