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
import { useApp } from "../state/store";
import { ChevronLeft } from "lucide-react";
import { searchFeatures } from "../core/search";

export default function FeatureList() {
  const { model, searchHits, setSearchHits, setQuery } = useApp();
  if (!model) return null;

  const handleClick = (feature) => {
    // On single click, update query & re-run search
    const q = feature.label || feature.id;
    setQuery(q);
    const hits = searchFeatures(model.features, q);
    setSearchHits(hits);
  };

  return (
    <div className="w-full max-w-[900px] mx-auto my-4 rounded-lg border border-gray-700/30 bg-gray-900/30 backdrop-blur-sm text-gray-100 shadow-md p-4">
      <h2 className="text-lg font-semibold mb-3 border-b border-gray-700/40 pb-2">
        Feature Hierarchy
      </h2>

      <ul className="space-y-[6px] text-sm font-medium">
        {model.features.map((f) => {
          const isSearchHit = searchHits?.includes(f.id);

          return (
            <li
              key={f.id}
              onClick={() => handleClick(f)}
              className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors duration-150 cursor-pointer select-none border border-transparent
                ${
                  isSearchHit
                    ? "bg-blue-500/10 border-blue-400/30 text-blue-300"
                    : "hover:bg-gray-800/60 text-gray-200"
                }
              `}
              style={{
                minHeight: "36px", // prevent height shifts
              }}
              title="Click to search for this feature"
            >
              <div className="flex items-center gap-2 truncate">
                {/* Dot marker for feature type */}
                <span
                  className={`inline-block w-3 h-3 rounded-full flex-shrink-0 ${
                    f.type === "mandatory"
                      ? "bg-green-500"
                      : f.type === "optional"
                      ? "bg-blue-400"
                      : "bg-gray-500"
                  }`}
                ></span>

                {/* Feature label + ID */}
                <span className="truncate">
                  <span
                    className={`${
                      isSearchHit
                        ? "font-semibold text-blue-300"
                        : "text-gray-200"
                    }`}
                  >
                    {f.label}
                  </span>{" "}
                  <span className="text-gray-400 text-xs font-mono">
                    ({f.id})
                  </span>
                </span>
              </div>

              {/* Parent reference */}
              {f.parent && (
                <div className="flex items-center gap-1 text-gray-400 text-xs font-mono">
                  <ChevronLeft size={12} />
                  {f.parent}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {searchHits?.length > 0 && (
        <p className="mt-3 text-xs text-blue-300/80 font-mono">
          {searchHits.length} feature
          {searchHits.length > 1 ? "s" : ""} matched your search.
        </p>
      )}
    </div>
  );
}
