import { useMemo, useEffect, useState } from "react";
import { useApp } from "../state/store";
import { searchFeatures } from "../core/search";
import { Search, XCircle } from "lucide-react";

export default function ControlBar() {
  const { model, setSearchHits, query, setQuery } = useApp();
  const [searchResultCount, setSearchResultCount] = useState(null);

  const featureList = useMemo(() => model?.features || [], [model]);

  useEffect(() => {
    const trimmedQuery = query?.trim();

    if (!trimmedQuery) {
      setSearchHits([]);
      setSearchResultCount(null);
      return;
    }

    const matchedFeatures = searchFeatures(featureList, trimmedQuery) || [];
    setSearchHits(matchedFeatures);
    setSearchResultCount(matchedFeatures.length);
  }, [query, featureList, setSearchHits]);

  useEffect(() => {
    const searchInput = document.getElementById("feature-search-input");

    const handleShortcutKey = (event) => {
      if (event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        searchInput?.focus();
      }
    };

    window.addEventListener("keydown", handleShortcutKey);
    return () => window.removeEventListener("keydown", handleShortcutKey);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto mt-2 mb-3 px-4">
      <div className="relative flex items-center">
        <Search
          size={18}
          className="absolute left-4 text-gray-400 pointer-events-none"
        />

        <input
          id="feature-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search features..."
          className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-gray-950/80 border border-gray-800 text-gray-100 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500
                     hover:border-gray-700 transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 text-gray-400 hover:text-red-400 transition"
            title="Clear search"
          >
            <XCircle size={18} />
          </button>
        )}

        {searchResultCount !== null && (
          <div className="absolute left-3 -bottom-7 text-xs font-mono text-gray-300 select-none">
            {searchResultCount > 0 ? (
              <span className="text-green-400">
                {searchResultCount} feature
                {searchResultCount === 1 ? "" : "s"} found
              </span>
            ) : (
              <span className="text-red-400">No features match your query</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
