import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/stockwise/ui";
import { DEFAULT_SETTINGS, useStockwise, type ForecastSettings } from "@/lib/stockwise-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Stockwise" },
      { name: "description", content: "Forecast horizon, model, moving-average window and review period used across the dashboard." },
      { property: "og:title", content: "Settings — Stockwise" },
      { property: "og:description", content: "Forecast horizon, model, moving-average window and review period used across the dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const SELECTS: { key: keyof ForecastSettings; label: string; options: (string | number)[] }[] = [
  { key: "horizon", label: "Forecast horizon (months)", options: [3, 6, 12] },
  { key: "model", label: "Model", options: ["Seasonal baseline + trend", "Moving average", "Naive (last value)"] },
  { key: "granularity", label: "Granularity", options: ["Monthly", "Weekly"] },
  { key: "evaluation", label: "Evaluation", options: ["Rolling holdout", "Single holdout"] },
  { key: "window", label: "Moving-average window (months)", options: [2, 3, 4, 6] },
  { key: "reviewDays", label: "Review period (days)", options: [7, 15, 30] },
];

function SettingsPage() {
  const { settings, setSettings } = useStockwise();

  return (
    <div className="grid grid-cols-1 gap-[25px] lg:grid-cols-[565fr_585fr]">
      <Panel title="Forecast settings">
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {SELECTS.map((f) => (
            <label key={f.key} className="block">
              <span className="sw-label">{f.label}</span>
              <select
                className="sw-input mt-1.5"
                value={String(settings[f.key])}
                onChange={(e) => {
                  const raw = e.target.value;
                  const value = typeof DEFAULT_SETTINGS[f.key] === "number" ? Number(raw) : raw;
                  setSettings({ ...settings, [f.key]: value });
                }}
              >
                {f.options.map((o) => (
                  <option key={o} value={String(o)}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <button type="button" className="sw-button mt-7" onClick={() => setSettings(DEFAULT_SETTINGS)}>
          Reset to defaults
        </button>
      </Panel>

      <Panel title="Planning policy">
        <ul className="mt-5 space-y-4 text-[13px] text-muted-foreground">
          <li><b className="text-foreground">Days of cover</b> = On-hand stock ÷ Average daily demand</li>
          <li><b className="text-foreground">Reorder point</b> = (Average daily demand × Lead time) + Safety stock</li>
          <li><b className="text-foreground">Minimum top-up</b> = max(0, Reorder point − On-hand stock)</li>
          <li>
            <b className="text-foreground">Suggested order</b> = Reorder point + (Average daily demand × Review
            period) − On-hand stock
          </li>
        </ul>
        <p className="mt-6 text-[11px] text-subtle-foreground">
          Safety stock is supplied per product so the business can apply its own service-level policy. Final
          order quantities should also consider pack sizes, minimum order quantities, budget and supplier
          constraints.
        </p>
      </Panel>
    </div>
  );
}
