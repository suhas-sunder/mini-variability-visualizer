// import { useApp } from "../state/store";

// // List all features from the model
// export default function FeatureList() {
//   const { model } = useApp();
//   if (!model) return null;
//   return (
//     <ul>
//       {model.features.map(f => (
//         <li key={f.id}>{f.label} ({f.id}) {f.parent ? `← ${f.parent}` : ""}</li>
//       ))}
//     </ul>
//   );
// }
import { useState, useEffect } from "react";
import { useApp } from "../state/store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { searchFeatures } from "../core/search";

export default function FeatureListPanel() {
  const { model, searchHits, setSearchHits, query, setQuery } = useApp();
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard toggle Shift + M
  useEffect(() => {
    const handleKey = (e) => {
      if (e.shiftKey && e.key.toLowerCase() === "m") setOpen((o) => !o);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!model) return null;

  const handleClick = (feature) => {
    const q = feature.label || feature.id;
    setQuery(q);
    const hits = searchFeatures(model.features, q);
    setSearchHits(hits);
    if (isMobile) setOpen(false);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed z-40 flex flex-col backdrop-blur-md transition-all duration-500 ease-in-out ${
          isMobile
            ? `bottom-0 left-0 w-full max-h-[65%] rounded-t-2xl`
            : `top-0 left-0 h-full w-[300px]`
        } bg-gray-900/80 border-r border-gray-700/40 shadow-2xl text-gray-100 ${
          open
            ? "translate-x-0 opacity-100"
            : isMobile
            ? "translate-y-full opacity-0"
            : "-translate-x-full opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/40">
          <h2 className="text-sm font-semibold tracking-wide text-gray-200">
            Features
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-800 transition"
            title="Hide feature list"
          >
            {isMobile ? (
              <ChevronRight className="rotate-90 text-gray-300" size={18} />
            ) : (
              <ChevronLeft size={18} className="text-gray-300" />
            )}
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-3 pr-2 custom-scroll">
          {model.features.map((f) => {
            const isSearchHit = searchHits?.includes(f.id);

            return (
              <div
                key={f.id}
                onClick={() => handleClick(f)}
                className={`px-3 py-2 rounded-md cursor-pointer border border-transparent select-none transition-all duration-150 ${
                  isSearchHit
                    ? "bg-blue-500/10 border-blue-400/40"
                    : "hover:bg-gray-800/60"
                }`}
              >
                {/* Top row: feature name */}
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      f.type === "mandatory"
                        ? "bg-green-500"
                        : f.type === "optional"
                        ? "bg-blue-400"
                        : "bg-gray-400"
                    }`}
                  ></span>
                  <span
                    className={`truncate text-[15px] font-medium ${
                      isSearchHit ? "text-blue-300" : "text-gray-100"
                    }`}
                  >
                    {f.label}
                  </span>
                </div>

                {/* Second row: ID + Parent */}
                <div className="mt-1 ml-5 flex flex-col text-xs font-mono text-gray-400 leading-tight">
                  <span>({f.id})</span>
                  {f.parent && <span>↳ {f.parent}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        {searchHits?.length > 0 && (
          <div className="px-4 py-2 text-[11px] text-blue-300/70 font-mono border-t border-gray-700/40 bg-gray-800/60">
            {searchHits.length} feature
            {searchHits.length > 1 ? "s" : ""} matched your search.
          </div>
        )}
      </div>

      {/* Floating Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`fixed z-50 ${
            isMobile
              ? "bottom-5 left-1/2 -translate-x-1/2 px-4 py-2"
              : "top-1/2 -translate-y-1/2 left-3 p-2"
          } bg-gray-900/70 backdrop-blur-md border border-gray-700/50 rounded-full shadow-lg text-gray-100 hover:bg-gray-800/80 flex items-center justify-center gap-2 transition`}
          title="Open feature list (Shift + M)"
        >
          <ChevronRight size={18} />
          {isMobile && <span className="text-sm font-medium">Features</span>}
        </button>
      )}
    </>
  );
}
