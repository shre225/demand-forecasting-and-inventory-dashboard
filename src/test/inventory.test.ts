import { describe, expect, it } from "vitest";
import {
  daysOfCover,
  mape,
  movingAverageForecast,
  orderUpToQuantity,
  reorderPoint,
  stockStatus,
  suggestedTopUp,
} from "@/lib/inventory";

// Worked example from the report: 18 on hand, 2.1/day, 10-day lead time, 15 safety stock.
describe("inventory planning formulas", () => {
  it("days of cover is on-hand ÷ daily demand (≈ 8.6 days)", () => {
    expect(daysOfCover(18, 2.1)!.toFixed(1)).toBe("8.6");
  });

  it("days of cover is not computed when demand is zero", () => {
    expect(daysOfCover(10, 0)).toBeNull();
  });

  it("reorder point is lead-time demand plus safety stock (36 units)", () => {
    expect(Math.round(reorderPoint(2.1, 10, 15))).toBe(36);
  });

  it("minimum top-up is the shortfall to the reorder point (18 units), never negative", () => {
    expect(suggestedTopUp(18, reorderPoint(2.1, 10, 15))).toBe(18);
    expect(suggestedTopUp(64, 30)).toBe(0);
  });

  it("suggested order with a 15-day review period is 50 units", () => {
    expect(orderUpToQuantity(18, 2.1, 10, 15, 15)).toBe(50);
  });

  it("flags items below the reorder point for reorder", () => {
    expect(stockStatus(18, 36, 8.6)).toBe("Reorder");
    expect(stockStatus(145, 41, 48.3)).toBe("Overstock");
    expect(stockStatus(64, 30, 35.6)).toBe("Healthy");
  });
});

describe("forecasting", () => {
  it("moving average of 96, 102, 108 forecasts 102 for each month", () => {
    expect(movingAverageForecast([96, 102, 108], 3, 3)).toEqual([102, 102, 102]);
  });

  it("empty history forecasts zeros", () => {
    expect(movingAverageForecast([], 3)).toEqual([0, 0, 0]);
  });

  it("MAPE skips periods with zero actual demand", () => {
    expect(mape([0, 100], [5, 90])).toBeCloseTo(10);
  });
});
