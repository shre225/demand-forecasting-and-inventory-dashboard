import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useStockwise } from "@/lib/stockwise-store";
import { CATEGORIES, DATE_RANGES, STORES, type Filters } from "@/lib/sample-data";

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/forecast", label: "Demand Forecast" },
  { to: "/inventory", label: "Inventory" },
  { to: "/products", label: "Products" },
  { to: "/reports", label: "Reports" },
  { to: "/settings", label: "Settings" },
] as const;

function Sidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground md:fixed md:inset-y-0 md:left-0 md:w-[246px]">
      <div className="px-7 pt-6 pb-4 md:pb-0">
        <div className="text-[24px] font-bold tracking-wide text-sidebar-primary">STOCKWISE</div>
        <div className="mt-1.5 text-[11px] text-sidebar-foreground">Demand &amp; Inventory</div>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:mt-[37px] md:flex-col md:gap-[18px] md:overflow-visible md:pb-0">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: true }}
            className="flex h-11 shrink-0 items-center gap-[11px] rounded-lg px-[22px] text-[14px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-sidebar-foreground" aria-hidden />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function FilterSelect<K extends keyof Filters>({
  label,
  field,
  options,
}: {
  label: string;
  field: K;
  options: readonly Filters[K][];
}) {
  const { filters, setFilters } = useStockwise();
  return (
    <label className="flex items-center gap-1 whitespace-nowrap">
      <span>{label}:</span>
      <select
        className="sw-select"
        aria-label={label}
        value={filters[field]}
        onChange={(e) => setFilters({ ...filters, [field]: e.target.value as Filters[K] })}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterBar() {
  return (
    <div className="sw-card mt-[22px] grid grid-cols-1 gap-3 px-6 py-[18px] text-[14px] text-muted-foreground sm:grid-cols-[340px_360px_1fr]">
      <FilterSelect label="Date range" field="dateRange" options={DATE_RANGES} />
      <FilterSelect label="Category" field="category" options={CATEGORIES} />
      <FilterSelect label="Store" field="store" options={STORES} />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="px-5 pt-7 pb-5 md:ml-[246px] md:px-[39px]">
        <header>
          <h1 className="text-[24px] font-bold text-foreground">Inventory Planning Workspace</h1>
          <p className="mt-2 text-[11px] text-subtle-foreground">
            Sample retail dataset &nbsp;•&nbsp; Demo view &nbsp;•&nbsp; Last refreshed: 04 Nov 2026
          </p>
        </header>
        <FilterBar />
        <div className="mt-[27px]">{children}</div>
        <footer className="mt-[26px] text-[11px] text-subtle-foreground">
          Illustrative prototype screen • Values are sample data for report demonstration
        </footer>
      </main>
    </div>
  );
}
