import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";

import type { MonthlyBarPoint } from "../data/types";

type QuarterlyBarChartProps = {
  barData: MonthlyBarPoint[];
};

export function QuarterlyBarChart({ barData }: QuarterlyBarChartProps) {
  return (
    <div className="lg:col-span-2 rounded-[2.5rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm">
      <div className="flex flex-col mb-8">
        <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight text-left">Quarterly Velocity</h3>
        <p className="text-xs text-[var(--color-text-secondary)] text-left">Monthly spending volume comparison</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
          <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10, fontWeight: "bold" }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} />
            <Tooltip cursor={{ fill: "var(--color-accent-soft)", radius: 10 }} />
            <Bar dataKey="amount" fill="var(--color-primary)" radius={[8, 8, 8, 8]} barSize={35} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
