import { createContext, useContext, useState } from "react";

const AppCtx = createContext(null);
export function AppProvider({ children }) {
  const [model, setModel] = useState(null);       // original JSON
  const [graph, setGraph] = useState(null);       // nodes/edges/childrenMap/parentMap
  const [searchHits, setSearchHits] = useState([]); // matched feature ids
  const [activeId, setActiveId] = useState(null); // currently chosen feature
  const [query, setQuery] = useState(""); // search query


  return (
    <AppCtx.Provider value={{ model, setModel, graph, setGraph, searchHits, setSearchHits, activeId, setActiveId, query, setQuery }}>
      {children}
    </AppCtx.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppCtx);
