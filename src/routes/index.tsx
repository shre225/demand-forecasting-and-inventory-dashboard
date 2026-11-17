import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, Kpi, LineChart, Panel, fmt } from "@/components/stockwise/ui";
import { filterProducts, summarize } from "@/lib/sample-data";
import { useStockwise } from "@/lib/stockwise-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Stockwise" },
      { name: "description", content: "Forecast sales, stock on hand, low-stock items and forecast accuracy at a glance." },
      { property: "og:title", content: "Overview — Stockwise" },
      { property: "og:description", content: "Forecast sales, stock on hand, low-stock items and forecast accuracy at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { filters, setSelectedSku } = useStockwise();
  const s = summarize(filters);
  const rows = filterProducts(filters).slice(0, 3);

  return (
    <div className="space-y-[25px]">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Forecast sales" value={`${fmt(s.forecastSales)} units`} note={`+${s.growth}% vs previous period`} />
        <Kpi label="Stock on hand" value={`${fmt(s.stockOnHand)} units`} note={`Across ${s.skuCount} SKUs`} />
        <Kpi label="Low-stock items" value={`${s.lowStock} SKUs`} note="Needs replenishment" />
        <Kpi label="Forecast accuracy" value={`${s.accuracy}%`} note="Illustrative validation" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[715fr_440fr]">
        <Panel title="Actual vs forecast demand">
          <div className="mt-[42px] pl-5 pr-7">
            <LineChart
              height={180}
              max={180}
              series={[{ label: "Monthly demand", values: s.trend, tone: "strong", dots: s.trend.length === 12 ? [0, 3, 6, 9] : [0] }]}
            />
          </div>
          <p className="mt-[22px] text-[11px] text-subtle-foreground">Monthly demand trend (units indexed)</p>
        </Panel>

        <Panel title="Stock health">
          <div className="mt-[30px] space-y-[25px] pr-5">
            {[
              { label: "Healthy", value: s.health.healthy, tone: "strong" as const },
              { label: "Low stock", value: s.health.low, tone: "soft" as const },
              { label: "Overstock", value: s.health.over, tone: "strong" as const },
            ].map((h) => (
              <div key={h.label}>
                <div className="flex justify-between text-[14px] text-muted-foreground">
                  <span>{h.label}</span>
                  <span>{h.value}%</span>
                </div>
                <Bar value={h.value} tone={h.tone} className="mt-3 h-[15px]" />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Items requiring attention">
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[11px]">
            <thead className="text-subtle-foreground">
              <tr>
                <th className="w-[170px] pb-3 font-normal">SKU</th>
                <th className="w-[420px] pb-3 font-normal">Product</th>
                <th className="w-[180px] pb-3 font-normal">On hand</th>
                <th className="w-[210px] pb-3 font-normal">Reorder point</th>
                <th className="pb-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {rows.map((r) => (
                <tr key={r.sku}>
                  <td className="py-[7px]">
                    <Link to="/inventory" onClick={() => setSelectedSku(r.sku)} className="hover:underline">
                      {r.sku}
                    </Link>
                  </td>
                  <td className="py-[7px]">{r.name}</td>
                  <td className="py-[7px]">{r.onHand}</td>
                  <td className="py-[7px]">{Math.round(r.reorderPoint)}</td>
                  <td className="py-[7px]">{r.status}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 text-muted-foreground">No items match these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
