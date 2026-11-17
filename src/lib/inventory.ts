/**
 * Inventory planning and forecasting formulas from the project report (Chapter 2 & 3).
 * Pure functions so every number on the dashboard can be checked by hand.
 */

export type StockStatus = "Reorder" | "Healthy" | "Overstock";

/** Days of cover = on-hand stock ÷ average daily demand (null when demand is zero). */
export function daysOfCover(onHand: number, avgDailyDemand: number): number | null {
  return avgDailyDemand > 0 ? onHand / avgDailyDemand : null;
}

/** Reorder point = (average daily demand × lead time in days) + safety stock. */
export function reorderPoint(avgDailyDemand: number, leadTimeDays: number, safetyStock: number) {
  return avgDailyDemand * leadTimeDays + safetyStock;
}

/** Suggested top-up = max(0, reorder point − on-hand stock), rounded to whole units. */
export function suggestedTopUp(onHand: number, rop: number) {
  return Math.max(0, Math.round(rop - onHand));
}

/**
 * Order-up-to quantity used by the reorder recommendation card:
 * reorder point plus demand expected over the review period, minus stock on hand.
 */
export function orderUpToQuantity(
  onHand: number,
  avgDailyDemand: number,
  leadTimeDays: number,
  safetyStock: number,
  reviewDays: number,
) {
  const target = reorderPoint(avgDailyDemand, leadTimeDays, safetyStock) + avgDailyDemand * reviewDays;
  return Math.max(0, Math.round(target - onHand));
}

/** Days of cover above which an item is treated as overstock. */
export const OVERSTOCK_DAYS = 45;

export function stockStatus(onHand: number, rop: number, cover: number | null): StockStatus {
  if (onHand < rop) return "Reorder";
  if (cover === null || cover > OVERSTOCK_DAYS) return "Overstock";
  return "Healthy";
}

/** Moving-average forecast: averages the last `window` values and repeats it over the horizon. */
export function movingAverageForecast(series: number[], horizon = 3, window = 3): number[] {
  const clean = series.filter((v) => Number.isFinite(v));
  if (clean.length === 0) return Array(horizon).fill(0);
  const tail = clean.slice(-window);
  const level = tail.reduce((a, b) => a + b, 0) / tail.length;
  return Array(horizon).fill(Math.round(level * 100) / 100);
}

export function mae(actual: number[], forecast: number[]) {
  const n = actual.length;
  return actual.reduce((s, a, i) => s + Math.abs(a - forecast[i]), 0) / n;
}

export function rmse(actual: number[], forecast: number[]) {
  const n = actual.length;
  return Math.sqrt(actual.reduce((s, a, i) => s + (a - forecast[i]) ** 2, 0) / n);
}

/** MAPE only over periods where actual demand is not zero (the denominator would be invalid). */
export function mape(actual: number[], forecast: number[]): number | null {
  const valid = actual.map((a, i) => [a, forecast[i]] as const).filter(([a]) => a !== 0);
  if (valid.length === 0) return null;
  return (100 / valid.length) * valid.reduce((s, [a, f]) => s + Math.abs(a - f) / a, 0);
}

/** Rolling one-step-ahead moving-average evaluation over the last `holdout` periods. */
export function rollingHoldout(series: number[], holdout: number, window: number) {
  const actual: number[] = [];
  const forecast: number[] = [];
  for (let t = series.length - holdout; t < series.length; t++) {
    const [f] = movingAverageForecast(series.slice(0, t), 1, window);
    actual.push(series[t]);
    forecast.push(f);
  }
  return { actual, forecast };
}
