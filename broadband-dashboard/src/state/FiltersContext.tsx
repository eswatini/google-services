import { createContext, useContext, useMemo, useState } from "react";
import type { FiltersState } from "../types";

const initialFilters: FiltersState = {
  county: [],
  municipality: [],
  provider: [],
  demographics: {
    incomeBracket: [],
    ageBracket: [],
    raceEthnicity: [],
  },
};

export type FiltersContextValue = {
  filters: FiltersState;
  setFilters: (updater: (prev: FiltersState) => FiltersState) => void;
  reset: () => void;
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<FiltersState>(initialFilters);

  const value = useMemo<FiltersContextValue>(() => ({
    filters,
    setFilters: (updater) => setFiltersState((prev) => updater(prev)),
    reset: () => setFiltersState(initialFilters),
  }), [filters]);

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters(): FiltersContextValue {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used within FiltersProvider");
  return ctx;
}