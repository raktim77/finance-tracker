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
import { formatChartLabel } from "../../../utils/formatLabel";

type SpendingTrendChartProps = {
trendData: TrendPoint[];
mode: "daily" | "monthly" | "weekly";
isLoading: boolean;
};

export function SpendingTrendChart({ trendData, mode, isLoading }: SpendingTrendChartProps) {

// 🔥 SKELETON
if (isLoading) {
return ( <div className="lg:col-span-3 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-6 h-full"> <div className="flex flex-col gap-2"> <div className="h-4 w-32 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" /> <div className="h-3 w-40 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" /> </div>

    <div className="flex-1 flex flex-col justify-end min-h-[240px] w-full relative overflow-hidden">
      <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-[200px] animate-pulse mt-auto">
        <path
          d="M0,100 L0,60 C40,55 80,85 120,60 C160,35 200,90 260,45 C320,5 360,25 400,5 L400,100 Z"
          className="fill-[var(--color-text-secondary)] opacity-10"
        />
        <path
          d="M0,60 C40,55 80,85 120,60 C160,35 200,90 260,45 C320,5 360,25 400,5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-[var(--color-text-secondary)] opacity-10"
        />
      </svg>

      <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-[1px] h-full bg-[var(--color-text-secondary)]/5" />
        ))}
      </div>
    </div>
  </div>
);

}

// ✅ EMPTY STATE CHECK
const hasData =
trendData.length > 0 &&
trendData.some((d) => d.amount > 0);

if (!hasData) {
return ( <div className="lg:col-span-3 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-6 items-center justify-center min-h-[300px] text-center">

    <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mb-3">
      <span className="text-lg">📉</span>
    </div>

    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
        No spending data yet
      </h3>
      <p className="text-xs text-[var(--color-text-secondary)] max-w-[220px]">
        Start adding expenses to visualize your spending patterns over time
      </p>
    </div>
  </div>
);

}

// ✅ REAL DATA
const formattedData = trendData.map((d) => ({
...d,
displayLabel: formatChartLabel(d.day, mode),
}));

return ( <div className="lg:col-span-3 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6">

  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div className="flex flex-col">
      <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight">
        Spending Trend
      </h3>
      <p className="text-xs text-[var(--color-text-secondary)]">
        Volume of expenses over time
      </p>
    </div>
  </div>

  <div className="flex-1 min-h-[240px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />

        <XAxis
          dataKey="displayLabel"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }}
          dy={10}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-surface)",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            fontSize: "12px"
          }}
          itemStyle={{
            color: "var(--color-text-primary)",
            fontWeight: "bold"
          }}
        />

        <Area
          type="monotone"
          dataKey="amount"
          stroke="var(--color-accent)"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#trendGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
</div>

);
}
