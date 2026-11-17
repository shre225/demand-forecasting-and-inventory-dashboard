import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Kpi, Panel } from "@/components/stockwise/ui";
import { mae, mape, rmse, rollingHoldout } from "@/lib/inventory";
import { EVALUATION_SERIES, FUNCTIONAL_TESTS, filterProducts } from "@/lib/sample-data";
import { useStockwise } from "@/lib/stockwise-store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Stockwise" },
      { name: "description", content: "Forecast error on a held-out period, functional test results and an exportable inventory table." },
      { property: "og:title", content: "Reports — Stockwise" },
      { property: "og:description", content: "Forecast error on a held-out period, functional test results and an exportable inventory table." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

const HOLDOUT = 3;

function ReportsPage() {
  const { filters, settings } = useStockwise();
  const { actual, forecast } = rollingHoldout(EVALUATION_SERIES, HOLDOUT, settings.window);
  const m = mape(actual, forecast);
  const rows = filterProducts(filters);

  const exportCsv = () => {
    const header = ["sku", "product_name", "category", "store", "on_hand", "avg_daily_demand", "lead_time_days", "safety_stock", "days_cover", "reorder_point", "status"];
    const lines = rows.map((r) =>
      [r.sku, r.name, r.category, r.store, r.onHand, r.dailyAvg, r.leadTimeDays, r.safetyStock, r.daysCover?.toFixed(1) ?? "", Math.round(r.reorderPoint), r.status]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stockwise-inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-[25px]">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Kpi label="MAE" value={`${mae(actual, forecast).toFixed(2)} units`} note={`Last ${HOLDOUT} months held out`} />
        <Kpi label="RMSE" value={`${rmse(actual, forecast).toFixed(2)} units`} note="Penalises large misses" />
        <Kpi label="MAPE" value={m === null ? "—" : `${m.toFixed(1)}%`} note="Non-zero actuals only" />
      </div>

      <div className="grid grid-cols-1 gap-[25px] lg:grid-cols-[565fr_585fr]">
        <Panel title="Holdout comparison">
          <p className="mt-2 text-[11px] text-subtle-foreground">
            {settings.window}-month moving average, one step ahead, on the Fig 3.1 sample series.
          </p>
          <table className="mt-5 w-full text-left text-[12px]">
            <thead className="text-subtle-foreground">
              <tr>
                <th className="pb-3 font-normal">Month index</th>
                <th className="pb-3 font-normal">Actual</th>
                <th className="pb-3 font-normal">Forecast</th>
                <th className="pb-3 font-normal">Error</th>
              </tr>
            </thead>
            <tbody>
              {actual.map((a, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-2.5">{EVALUATION_SERIES.length - HOLDOUT + i + 1}</td>
                  <td className="py-2.5">{a}</td>
                  <td className="py-2.5">{forecast[i].toFixed(2)}</td>
                  <td className="py-2.5">{(a - forecast[i]).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel
          title="Inventory export"
          action={
            <button type="button" className="sw-button" onClick={exportCsv}>
              <Download className="h-4 w-4" /> Export CSV
            </button>
          }
        >
          <p className="mt-4 text-[14px] text-muted-foreground">
            {rows.length} SKUs match the current filters.
          </p>
          <p className="mt-3 text-[11px] text-subtle-foreground">
            The export includes on-hand stock, daily average, days of cover, reorder point and status, so
            product-level calculations can be reviewed before a purchase decision.
          </p>
        </Panel>
      </div>

      <Panel title="Functional test cases">
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-[12px]">
            <thead className="text-subtle-foreground">
              <tr>
                <th className="w-[220px] pb-3 font-normal">Test case</th>
                <th className="pb-3 font-normal">Description / Expected result</th>
                <th className="w-[90px] pb-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {FUNCTIONAL_TESTS.map(([name, desc]) => (
                <tr key={name} className="border-t border-border">
                  <td className="py-2.5">{name}</td>
                  <td className="py-2.5 text-muted-foreground">{desc}</td>
                  <td className="py-2.5">Pass</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
