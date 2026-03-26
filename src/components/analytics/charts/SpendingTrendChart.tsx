import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid
} from "recharts";

import type { TrendPoint } from "../data/types";

type SpendingTrendChartProps = {
  trendData: TrendPoint[];
};

export function SpendingTrendChart({ trendData }: SpendingTrendChartProps) {
  return (
    <div className="lg:col-span-3 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6">
      {/* Header Section: Stacked on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight">
            Spending Trend
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Volume of expenses over time
          </p>
        </div>

        {/* Controls Section: Full width on mobile for easier tapping */}
        <div className="flex items-center gap-2 bg-[var(--color-background)] p-1 rounded-xl border border-[var(--border)] w-fit">
          <button className="h-8 px-4 rounded-lg bg-[var(--color-surface)] shadow-sm border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--color-text-primary)] transition-all active:scale-95">
            Daily
          </button>
          <button className="h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] opacity-40 hover:opacity-100 transition-all">
            Weekly
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", fontSize: "12px" }}
              itemStyle={{ color: "var(--color-text-primary)", fontWeight: "bold" }}
            />
            <Area type="monotone" dataKey="amount" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#trendGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
