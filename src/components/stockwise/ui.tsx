import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  children,
  className,
  action,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("sw-card px-6 pt-[22px] pb-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="sw-card-title">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="sw-card px-[17px] pt-[19px] pb-3.5">
      <div className="text-[11px] uppercase text-subtle-foreground">{label}</div>
      <div className="mt-3 text-[24px] font-bold text-foreground">{value}</div>
      <div className="mt-2.5 text-[11px] text-muted-foreground">{note}</div>
    </div>
  );
}

const TONE = {
  strong: "bg-bar",
  soft: "bg-bar-soft",
  dark: "bg-bar-strong",
} as const;

export function Bar({
  value,
  max = 100,
  tone = "strong",
  className,
}: {
  value: number;
  max?: number;
  tone?: keyof typeof TONE;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-track", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-500", TONE[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}

type Series = { values: number[]; tone: "strong" | "soft"; dots?: number[]; label: string };

export function LineChart({
  series,
  max,
  height,
  gridLines = 4,
  className,
}: {
  series: Series[];
  max: number;
  height: number;
  gridLines?: number;
  className?: string;
}) {
  const W = 1000;
  const toPoint = (v: number, i: number, n: number) => {
    const x = n <= 1 ? W / 2 : (i / (n - 1)) * W;
    const y = height - (v / max) * height;
    return [x, y] as const;
  };

  return (
    <div className={cn("relative", className)} style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
        role="img"
        aria-label={series.map((s) => s.label).join(" and ")}
      >
        {Array.from({ length: gridLines }).map((_, i) => {
          const y = (i / (gridLines - 1)) * height;
          return (
            <line key={i} x1={0} x2={W} y1={y} y2={y} className="stroke-grid" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          );
        })}
        {series.map((s) => (
          <polyline
            key={s.label}
            fill="none"
            points={s.values.map((v, i) => toPoint(v, i, s.values.length).join(",")).join(" ")}
            className={s.tone === "strong" ? "stroke-bar-strong" : "stroke-bar-soft"}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {series.flatMap((s) =>
        (s.dots ?? []).filter((i) => i < s.values.length).map((i) => {
          const [x, y] = toPoint(s.values[i], i, s.values.length);
          return (
            <span
              key={`${s.label}-${i}`}
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bar-strong"
              style={{ left: `${(x / W) * 100}%`, top: y }}
            />
          );
        }),
      )}
    </div>
  );
}

export function fmt(n: number) {
  return n.toLocaleString("en-US");
}
