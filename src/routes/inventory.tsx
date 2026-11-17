import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, Panel } from "@/components/stockwise/ui";
import { orderUpToQuantity, suggestedTopUp } from "@/lib/inventory";
import { filterProducts, summarize, withMetrics, PRODUCTS } from "@/lib/sample-data";
import { useStockwise } from "@/lib/stockwise-store";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Stockwise" },
      { name: "description", content: "Stock status by SKU with days of cover, reorder recommendations and inventory composition." },
      { property: "og:title", content: "Inventory — Stockwise" },
      { property: "og:description", content: "Stock status by SKU with days of cover, reorder recommendations and inventory composition." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const { filters, settings, selectedSku, setSelectedSku } = useStockwise();
  const all = filterProducts(filters);
  const rows = all.slice(0, 4);
  const s = summarize(filters);
  const selected = withMetrics(PRODUCTS.find((p) => p.sku === selectedSku) ?? PRODUCTS[0]);
  const orderQty = orderUpToQuantity(
    selected.onHand,
    selected.dailyAvg,
    selected.leadTimeDays,
    selected.safetyStock,
    settings.reviewDays,
  );
  const topUp = suggestedTopUp(selected.onHand, selected.reorderPoint);

  return (
    <div className="space-y-[30px]">
      <Panel
        title="Inventory status by SKU"
        action={
          all.length > rows.length ? (
            <Link to="/products" className="text-[11px] text-subtle-foreground hover:underline">
              View all {all.length} SKUs
            </Link>
          ) : null
        }
      >
        <div className="mt-[30px] overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-[11px]">
            <thead className="text-subtle-foreground">
              <tr>
                <th className="w-[130px] pb-[38px] pl-1.5 font-normal">SKU</th>
                <th className="w-[370px] pb-[38px] font-normal">Product</th>
                <th className="w-[180px] pb-[38px] font-normal">On hand</th>
                <th className="w-[160px] pb-[38px] font-normal">Daily avg.</th>
                <th className="w-[170px] pb-[38px] font-normal">Days cover</th>
                <th className="pb-[38px] font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {rows.map((r) => (
                <tr
                  key={r.sku}
                  className="sw-row border-b border-border"
                  data-selected={r.sku === selected.sku}
                  onClick={() => setSelectedSku(r.sku)}
                >
                  <td className="py-[15px] pl-1.5">{r.sku}</td>
                  <td className="py-[15px]">{r.name}</td>
                  <td className="py-[15px]">{r.onHand}</td>
                  <td className="py-[15px]">{r.dailyAvg.toFixed(1)}</td>
                  <td className="py-[15px]">{r.daysCover === null ? "—" : r.daysCover.toFixed(1)}</td>
                  <td className="py-[15px]">{r.status}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-muted-foreground">No items match these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-[25px] lg:grid-cols-[565fr_585fr]">
        <Panel title="Reorder recommendation" className="min-h-[350px]">
          <div className="mt-[46px] pl-[5px]">
            <div className="text-[14px] text-muted-foreground">
              {selected.sku} &nbsp;•&nbsp; {selected.name}
            </div>
            <div className="mt-[22px] text-[11px] text-subtle-foreground">Suggested order quantity</div>
            <div className="mt-2.5 text-[24px] font-bold text-bar-strong">{orderQty} units</div>
            <p className="mt-[38px] text-[11px] text-subtle-foreground">
              Based on lead time, safety stock and forecast demand.
            </p>
            <p className="mt-2 text-[11px] text-subtle-foreground">
              Reorder point {Math.round(selected.reorderPoint)} units • Minimum top-up {topUp} units •{" "}
              {settings.reviewDays}-day review period
            </p>
          </div>
        </Panel>

        <Panel title="Inventory composition">
          <div className="mt-[52px] space-y-[52px] px-2.5">
            {[
              { label: "Healthy", value: s.health.healthy, tone: "strong" as const },
              { label: "Low", value: s.health.low, tone: "soft" as const },
              { label: "Excess", value: s.health.over, tone: "strong" as const },
            ].map((h) => (
              <div key={h.label} className="grid grid-cols-[170px_1fr_40px] items-center">
                <span className="text-[14px] text-muted-foreground">{h.label}</span>
                <Bar value={h.value} tone={h.tone} className="h-5" />
                <span className="pl-3.5 text-[11px] text-muted-foreground">{h.value}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
