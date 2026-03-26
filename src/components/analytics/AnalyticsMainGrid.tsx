import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
  CartesianGrid
} from "recharts";

import type { CategorySlice, MonthlyBarPoint, SavingsPoint, TrendPoint } from "./data/types";
import type { ReactNode } from "react";

type AnalyticsMainGridProps = {
  trendData: TrendPoint[];
  pieData: CategorySlice[];
  savingsData: SavingsPoint[];
  barData: MonthlyBarPoint[];
  children?: ReactNode;
};

export function AnalyticsMainGrid({ trendData, pieData, savingsData, barData, children }: AnalyticsMainGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">

      {/* Spending Trend */}
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

      {/* Category Heatmap */}
      <div className="lg:col-span-2 rounded-[2.5rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col">
        <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight mb-2 text-left">Category Heatmap</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-8 text-left">Where your money actually goes</p>

        <div className="h-[200px] relative mb-6">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={85} paddingAngle={2} cornerRadius={6}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-black uppercase text-[var(--color-text-secondary)]">Focus</span>
            <span className="text-lg font-black text-[var(--color-text-primary)]">Food</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          {pieData.map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-[var(--color-background)] border border-[var(--border)]">
              <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase truncate">{item.name}</span>
              <span className="text-[10px] font-bold text-[var(--color-text-secondary)] ml-auto">₹{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Trend - Same style as spending */}
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

      {/* Quarterly Velocity */}
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
      {children}
    </div>
  );
}
