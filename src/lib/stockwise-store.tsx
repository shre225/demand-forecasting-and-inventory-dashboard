import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Filters } from "./sample-data";

export type ForecastSettings = {
  horizon: number;
  model: string;
  granularity: string;
  evaluation: string;
  features: string;
  window: number;
  reviewDays: number;
};

export const DEFAULT_SETTINGS: ForecastSettings = {
  horizon: 3,
  model: "Seasonal baseline + trend",
  granularity: "Monthly",
  evaluation: "Rolling holdout",
  features: "Date, SKU, promotions, price",
  window: 3,
  reviewDays: 15,
};

type Store = {
  filters: Filters;
  setFilters: (f: Filters) => void;
  settings: ForecastSettings;
  setSettings: (s: ForecastSettings) => void;
  selectedSku: string;
  setSelectedSku: (sku: string) => void;
};

const StockwiseContext = createContext<Store | null>(null);

export function StockwiseProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>({
    dateRange: "Jan–Dec 2026",
    category: "All categories",
    store: "All locations",
  });
  const [settings, setSettings] = useState<ForecastSettings>(DEFAULT_SETTINGS);
  const [selectedSku, setSelectedSku] = useState("SKU-104");

  const value = useMemo(
    () => ({ filters, setFilters, settings, setSettings, selectedSku, setSelectedSku }),
    [filters, settings, selectedSku],
  );
  return <StockwiseContext.Provider value={value}>{children}</StockwiseContext.Provider>;
}

export function useStockwise() {
  const ctx = useContext(StockwiseContext);
  if (!ctx) throw new Error("useStockwise must be used inside StockwiseProvider");
  return ctx;
}
