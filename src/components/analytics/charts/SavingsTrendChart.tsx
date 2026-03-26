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

type SavingsTrendChartProps = {
  savingsData: SavingsPoint[];
};

export function SavingsTrendChart({ savingsData }: SavingsTrendChartProps) {
  return (
    <div className="lg:col-span-3 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6">
      <div className="flex flex-col">
        <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight">Savings Growth</h3>
        <p className="text-xs text-[var(--color-text-secondary)]">Retained surplus accumulated over time</p>
      </div>

      <div className="flex-1 min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
          <AreaChart data={savingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--border)", fontSize: "12px" }}
              itemStyle={{ color: "var(--color-text-primary)", fontWeight: "bold" }}
            />
            <Area type="monotone" dataKey="amount" stroke="var(--color-success)" strokeWidth={3} fillOpacity={1} fill="url(#savingsGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
