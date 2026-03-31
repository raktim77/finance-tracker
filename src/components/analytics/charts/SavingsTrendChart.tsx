import {
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
Area,
AreaChart,
CartesianGrid
} from "recharts";

import type { SavingsPoint } from "../data/types";
import { formatChartLabel } from "../../../utils/formatLabel";

type SavingsTrendChartProps = {
savingsData: SavingsPoint[];
mode: "daily" | "monthly" | "weekly";
isLoading: boolean;
};

export function SavingsTrendChart({ savingsData, mode, isLoading }: SavingsTrendChartProps) {

// 🔥 SKELETON
if (isLoading) {
return ( <div className="lg:col-span-3 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-6 h-full">

    {/* Header Skeleton */}
    <div className="flex flex-col gap-2">
      <div className="h-4 w-32 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
      <div className="h-3 w-48 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
    </div>

    {/* Chart Skeleton */}
    <div className="flex-1 flex flex-col justify-end min-h-[240px] w-full relative overflow-hidden">
      <svg
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        className="w-full h-[200px] animate-pulse mt-auto"
      >
        {/* Area */}
        <path
          d="M0,100 L0,70 C40,65 80,75 120,60 C160,45 200,70 260,50 C320,30 360,40 400,25 L400,100 Z"
          className="fill-[var(--color-text-secondary)] opacity-10"
        />

        {/* Line */}
        <path
          d="M0,70 C40,65 80,75 120,60 C160,45 200,70 260,50 C320,30 360,40 400,25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-[var(--color-text-secondary)] opacity-10"
        />
      </svg>

      {/* Grid */}
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
savingsData.length > 0 &&
savingsData.some((d) => d.amount !== 0);

if (!hasData) {
return ( <div className="lg:col-span-3 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-6 items-center justify-center min-h-[300px] text-center">

    <div className="w-12 h-12 rounded-2xl bg-[var(--color-success)]/10 flex items-center justify-center mb-3">
      <span className="text-lg">💸</span>
    </div>

    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
        No savings data yet
      </h3>
      <p className="text-xs text-[var(--color-text-secondary)] max-w-[240px]">
        Savings insights will appear as you log data over a period of time.
      </p>
    </div>
  </div>
);

}

// ✅ REAL DATA
const formattedData = savingsData.map((d) => ({
...d,
displayLabel: formatChartLabel(d.day, mode),
}));

return ( <div className="lg:col-span-3 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6">

  <div className="flex flex-col">
    <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight">
      Savings Performance
    </h3>
    <p className="text-xs text-[var(--color-text-secondary)]">
      Monthly surplus after income and expenses
    </p>
  </div>

  <div className="flex-1 min-h-[240px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        
        <defs>
          <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
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
          stroke="var(--color-success)"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#savingsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
</div>

);
}
