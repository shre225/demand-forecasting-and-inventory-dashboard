import {
  daysOfCover,
  reorderPoint,
  stockStatus,
  type StockStatus,
} from "./inventory";

export const DATE_RANGES = ["Jan–Dec 2026", "Jul–Dec 2026", "Oct–Dec 2026"] as const;
export const CATEGORIES = ["All categories", "Electronics", "Home & Kitchen", "Stationery"] as const;
export const STORES = ["All locations", "Delhi", "Ghaziabad", "Noida"] as const;

export type DateRange = (typeof DATE_RANGES)[number];
export type Category = (typeof CATEGORIES)[number];
export type Store = (typeof STORES)[number];

export type Product = {
  sku: string;
  name: string;
  category: Exclude<Category, "All categories">;
  store: Exclude<Store, "All locations">;
  onHand: number;
  dailyAvg: number;
  leadTimeDays: number;
  safetyStock: number;
};

/** Sample retail records used for the demonstration (not live business data). */
export const PRODUCTS: Product[] = [
  { sku: "SKU-104", name: "Wireless Mouse", category: "Electronics", store: "Delhi", onHand: 18, dailyAvg: 2.1, leadTimeDays: 10, safetyStock: 15 },
  { sku: "SKU-221", name: "Steel Bottle", category: "Home & Kitchen", store: "Ghaziabad", onHand: 12, dailyAvg: 1.4, leadTimeDays: 7, safetyStock: 10 },
  { sku: "SKU-087", name: "USB-C Cable", category: "Electronics", store: "Noida", onHand: 64, dailyAvg: 1.8, leadTimeDays: 9, safetyStock: 14 },
  { sku: "SKU-315", name: "Notebook A5", category: "Stationery", store: "Delhi", onHand: 145, dailyAvg: 3.0, leadTimeDays: 7, safetyStock: 20 },
  { sku: "SKU-142", name: "Bluetooth Speaker", category: "Electronics", store: "Ghaziabad", onHand: 22, dailyAvg: 1.2, leadTimeDays: 12, safetyStock: 8 },
  { sku: "SKU-178", name: "Desk Lamp", category: "Home & Kitchen", store: "Delhi", onHand: 30, dailyAvg: 0.9, leadTimeDays: 10, safetyStock: 6 },
  { sku: "SKU-203", name: "Ceramic Mug Set", category: "Home & Kitchen", store: "Noida", onHand: 55, dailyAvg: 1.6, leadTimeDays: 6, safetyStock: 10 },
  { sku: "SKU-256", name: "Gel Pen Pack", category: "Stationery", store: "Ghaziabad", onHand: 30, dailyAvg: 4.2, leadTimeDays: 5, safetyStock: 12 },
  { sku: "SKU-299", name: "Sticky Notes", category: "Stationery", store: "Noida", onHand: 210, dailyAvg: 3.4, leadTimeDays: 5, safetyStock: 15 },
  { sku: "SKU-330", name: "Laptop Stand", category: "Electronics", store: "Delhi", onHand: 26, dailyAvg: 0.8, leadTimeDays: 14, safetyStock: 6 },
  { sku: "SKU-361", name: "Lunch Box", category: "Home & Kitchen", store: "Ghaziabad", onHand: 9, dailyAvg: 1.1, leadTimeDays: 8, safetyStock: 6 },
  { sku: "SKU-402", name: "Sketchbook A4", category: "Stationery", store: "Delhi", onHand: 48, dailyAvg: 1.3, leadTimeDays: 9, safetyStock: 8 },
];

export type ProductRow = Product & {
  daysCover: number | null;
  reorderPoint: number;
  status: StockStatus;
};

export function withMetrics(p: Product): ProductRow {
  const cover = daysOfCover(p.onHand, p.dailyAvg);
  const rop = reorderPoint(p.dailyAvg, p.leadTimeDays, p.safetyStock);
  return { ...p, daysCover: cover, reorderPoint: rop, status: stockStatus(p.onHand, rop, cover) };
}

export type Filters = { dateRange: DateRange; category: Category; store: Store };

export function filterProducts(filters: Filters): ProductRow[] {
  return PRODUCTS.filter(
    (p) =>
      (filters.category === "All categories" || p.category === filters.category) &&
      (filters.store === "All locations" || p.store === filters.store),
  ).map(withMetrics);
}

/* ---------- Portfolio-level summary (sample totals across all 128 SKUs) ---------- */

const CATEGORY_SHARE: Record<Category, number> = {
  "All categories": 1,
  Electronics: 0.42,
  "Home & Kitchen": 0.33,
  Stationery: 0.25,
};
const STORE_SHARE: Record<Store, number> = {
  "All locations": 1,
  Delhi: 0.4,
  Ghaziabad: 0.35,
  Noida: 0.25,
};
const RANGE_MONTHS: Record<DateRange, number> = {
  "Jan–Dec 2026": 12,
  "Jul–Dec 2026": 6,
  "Oct–Dec 2026": 3,
};
const ACCURACY: Record<Category, number> = {
  "All categories": 91.2,
  Electronics: 89.7,
  "Home & Kitchen": 92.4,
  Stationery: 93.1,
};
const STOCK_HEALTH: Record<Category, [number, number, number]> = {
  "All categories": [78, 14, 8],
  Electronics: [72, 19, 9],
  "Home & Kitchen": [81, 13, 6],
  Stationery: [76, 9, 15],
};
const PREVIOUS_GROWTH: Record<DateRange, number> = {
  "Jan–Dec 2026": 8.4,
  "Jul–Dec 2026": 6.1,
  "Oct–Dec 2026": 4.7,
};

/** Indexed monthly demand trend (Jan–Dec) for the overview chart. */
const MONTHLY_TREND = [15, 35, 21, 64, 53, 79, 71, 117, 97, 133, 113, 162];
const CATEGORY_WOBBLE: Record<Category, number[]> = {
  "All categories": Array(12).fill(0),
  Electronics: [6, -4, 8, -6, 10, -8, 4, -10, 12, -6, 8, -4],
  "Home & Kitchen": [-4, 6, -6, 4, -8, 6, -4, 8, -10, 6, -4, 2],
  Stationery: [10, 2, 12, -2, 6, 0, 10, -4, 4, -2, 12, -8],
};

/** Historical vs forecast monthly demand (indexed) for the forecast page. */
export const FORECAST_HISTORY = [12, 26, 19, 51, 62, 57, 88, 100, 94, 120, 111, 142];
export const FORECAST_PROJECTED = [12, 21, 28, 40, 59, 67, 76, 92, 104, 114, 128, 143];
const PREVIEW_MONTHS = [
  { month: "Jan", units: 108 },
  { month: "Feb", units: 112 },
  { month: "Mar", units: 117 },
  { month: "Apr", units: 121 },
];

export function summarize(filters: Filters) {
  const share = CATEGORY_SHARE[filters.category] * STORE_SHARE[filters.store];
  const months = RANGE_MONTHS[filters.dateRange];
  const trend = MONTHLY_TREND.map((v, i) => Math.max(4, v + CATEGORY_WOBBLE[filters.category][i]));
  const monthWeights = MONTHLY_TREND.map((v) => v + 60);
  const totalWeight = monthWeights.reduce((a, b) => a + b, 0);
  const rangeWeight = monthWeights.slice(12 - months).reduce((a, b) => a + b, 0);
  const [healthy, low, over] = STOCK_HEALTH[filters.category];

  return {
    forecastSales: Math.round(12480 * share * (rangeWeight / totalWeight)),
    growth: PREVIOUS_GROWTH[filters.dateRange],
    stockOnHand: Math.round(3260 * share),
    skuCount: Math.max(1, Math.round(128 * share)),
    lowStock: Math.max(1, Math.round(14 * share)),
    accuracy: ACCURACY[filters.category],
    trend: trend.slice(12 - months),
    health: { healthy, low, over },
    preview: PREVIEW_MONTHS.map((m) => ({ ...m, units: Math.max(1, Math.round(m.units * share)) })),
    history: FORECAST_HISTORY.map((v, i) => Math.max(4, v + CATEGORY_WOBBLE[filters.category][i] / 2)),
  };
}

/** Sample monthly history from Fig 3.1, used for the forecast evaluation on the Reports page. */
export const EVALUATION_SERIES = [92, 95, 99, 97, 104, 108, 106, 112, 110, 115, 119];

export const FUNCTIONAL_TESTS = [
  ["Data loading", "Sales and inventory files are read with the expected columns."],
  ["Date validation", "Date values are converted to a consistent date format; invalid rows are flagged."],
  ["Quantity validation", "Non-numeric and negative quantities are excluded from the demand series."],
  ["Monthly aggregation", "Sales are grouped by SKU and month without losing valid quantities."],
  ["Forecast generation", "A forecast is returned for the selected SKU and forecast horizon."],
  ["Inventory metrics", "Days of cover and reorder point are calculated from the supplied inputs."],
  ["Low-stock flag", "Items below the calculated reorder point are highlighted for review."],
  ["Dashboard filters", "Selected date/category filters update the displayed tables and charts."],
  ["Sparse history handling", "Items with insufficient history are marked for cautious interpretation."],
] as const;
