import { createFileRoute } from "@tanstack/react-router";
import { Bar, LineChart, Panel } from "@/components/stockwise/ui";
import { FORECAST_PROJECTED, summarize } from "@/lib/sample-data";
import { useStockwise } from "@/lib/stockwise-store";

export const Route = createFileRoute("/forecast")({
  head: () => ({
    meta: [
      { title: "Demand Forecast — Stockwise" },
      { name: "description", content: "Historical demand and projected demand by month, with the forecast assumptions kept visible." },
      { property: "og:title", content: "Demand Forecast — Stockwise" },
      { property: "og:description", content: "Historical demand and projected demand by month, with the forecast assumptions kept visible." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForecastPage,
});

function ForecastPage() {
  const { filters, settings } = useStockwise();
  const s = summarize(filters);
  const previewMax = Math.max(...s.preview.map((p) => p.units)) / 0.93;

  const config = [
    ["Forecast horizon", `Next ${settings.horizon} months`],
    ["Model", settings.model],
    ["Granularity", settings.granularity],
    ["Evaluation", settings.evaluation],
    ["Input features", settings.features],
  ];

  return (
    <div className="space-y-[25px]">
      <Panel title="Demand forecast by month">
        <div className="mt-[56px] pr-9 pl-6">
          <LineChart
            height={160}
            max={160}
            series={[
              { label: "Historical demand", values: s.history, tone: "soft" },
              { label: "Forecast", values: FORECAST_PROJECTED, tone: "strong", dots: [0, 3, 6, 9] },
            ]}
          />
          <div className="mt-[22px] flex gap-[18px] text-[11px] text-subtle-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded-full bg-bar-strong" aria-hidden /> Forecast
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded-full bg-bar-soft" aria-hidden /> Historical demand
            </span>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-[25px] lg:grid-cols-[565fr_585fr]">
        <Panel title="Forecast configuration">
          <dl className="mt-[26px] space-y-[26px] pl-[5px]">
            {config.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[225px_1fr] items-baseline">
                <dt className="text-[11px] text-subtle-foreground">{k}</dt>
                <dd className="text-[14px] text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Forecast preview">
          <div className="mt-[30px] space-y-[37px] px-2.5">
            {s.preview.map((p) => (
              <div key={p.month} className="grid grid-cols-[90px_1fr_100px] items-center gap-0">
                <span className="text-[14px] text-muted-foreground">{p.month}</span>
                <Bar value={p.units} max={previewMax} tone="dark" className="h-2 rounded-none" />
                <span className="pl-[39px] text-[14px] text-muted-foreground whitespace-nowrap">{p.units} units</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
