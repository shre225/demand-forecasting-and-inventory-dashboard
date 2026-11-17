import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Panel } from "@/components/stockwise/ui";
import { daysOfCover, reorderPoint, suggestedTopUp } from "@/lib/inventory";
import { filterProducts, PRODUCTS } from "@/lib/sample-data";
import { useStockwise } from "@/lib/stockwise-store";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — Stockwise" },
      { name: "description", content: "Every sample SKU with its supplier lead time, safety stock and a worked reorder calculation." },
      { property: "og:title", content: "Products — Stockwise" },
      { property: "og:description", content: "Every sample SKU with its supplier lead time, safety stock and a worked reorder calculation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { filters, selectedSku, setSelectedSku } = useStockwise();
  const rows = filterProducts(filters);
  const product = PRODUCTS.find((p) => p.sku === selectedSku) ?? PRODUCTS[0];
  const [inputs, setInputs] = useState({
    onHand: product.onHand,
    dailyAvg: product.dailyAvg,
    leadTimeDays: product.leadTimeDays,
    safetyStock: product.safetyStock,
  });

  useEffect(() => {
    setInputs({
      onHand: product.onHand,
      dailyAvg: product.dailyAvg,
      leadTimeDays: product.leadTimeDays,
      safetyStock: product.safetyStock,
    });
  }, [product]);

  const cover = daysOfCover(inputs.onHand, inputs.dailyAvg);
  const leadDemand = inputs.dailyAvg * inputs.leadTimeDays;
  const rop = reorderPoint(inputs.dailyAvg, inputs.leadTimeDays, inputs.safetyStock);
  const topUp = suggestedTopUp(inputs.onHand, rop);
  const r = (n: number) => Math.round(n * 10) / 10;

  const fields = [
    ["onHand", "On-hand stock", 1],
    ["dailyAvg", "Average daily demand", 0.1],
    ["leadTimeDays", "Lead time (days)", 1],
    ["safetyStock", "Safety stock", 1],
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-[25px] xl:grid-cols-[1fr_420px]">
      <Panel title={`Product catalogue (${rows.length})`}>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[11px]">
            <thead className="text-subtle-foreground">
              <tr>
                {["SKU", "Product", "Category", "Store", "On hand", "Lead time", "Safety stock", "Status"].map((h) => (
                  <th key={h} className="pb-4 pl-1.5 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-foreground">
              {rows.map((p) => (
                <tr
                  key={p.sku}
                  className="sw-row border-b border-border"
                  data-selected={p.sku === product.sku}
                  onClick={() => setSelectedSku(p.sku)}
                >
                  <td className="py-3 pl-1.5">{p.sku}</td>
                  <td className="py-3 pl-1.5">{p.name}</td>
                  <td className="py-3 pl-1.5">{p.category}</td>
                  <td className="py-3 pl-1.5">{p.store}</td>
                  <td className="py-3 pl-1.5">{p.onHand}</td>
                  <td className="py-3 pl-1.5">{p.leadTimeDays} days</td>
                  <td className="py-3 pl-1.5">{p.safetyStock}</td>
                  <td className="py-3 pl-1.5">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Reorder calculator">
        <div className="mt-1 text-[11px] text-subtle-foreground">
          {product.sku} • {product.name}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4">
          {fields.map(([key, label, step]) => (
            <label key={key} className="block">
              <span className="sw-label">{label}</span>
              <input
                type="number"
                min={0}
                step={step}
                className="sw-input mt-1.5"
                value={inputs[key]}
                onChange={(e) => setInputs({ ...inputs, [key]: Math.max(0, Number(e.target.value) || 0) })}
              />
            </label>
          ))}
        </div>
        <table className="mt-6 w-full text-left text-[12px]">
          <thead className="text-subtle-foreground">
            <tr>
              <th className="pb-2 font-normal">Quantity</th>
              <th className="pb-2 font-normal">Calculation</th>
              <th className="pb-2 font-normal">Result</th>
            </tr>
          </thead>
          <tbody className="text-foreground">
            <tr className="border-t border-border">
              <td className="py-2.5">Days of cover</td>
              <td className="py-2.5">{inputs.onHand} ÷ {inputs.dailyAvg}</td>
              <td className="py-2.5">{cover === null ? "No demand" : `≈ ${cover.toFixed(1)} days`}</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-2.5">Demand during lead time</td>
              <td className="py-2.5">{inputs.dailyAvg} × {inputs.leadTimeDays}</td>
              <td className="py-2.5">{r(leadDemand)} units</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-2.5">Reorder point</td>
              <td className="py-2.5">{r(leadDemand)} + {inputs.safetyStock}</td>
              <td className="py-2.5">{r(rop)} units</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-2.5">Shortfall to reorder point</td>
              <td className="py-2.5">max(0, {r(rop)} − {inputs.onHand})</td>
              <td className="py-2.5 font-bold">{topUp} units</td>
            </tr>
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
