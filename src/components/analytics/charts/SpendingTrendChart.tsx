import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";

import type { TrendPoint } from "../data/types";
import { formatChartLabel } from "../../../utils/formatLabel";

type SpendingTrendChartProps = {
  trendData: TrendPoint[];
  mode: "daily" | "monthly" | "weekly";
  isLoading: boolean;
};

export function SpendingTrendChart({
  trendData,
  mode,
  isLoading,
}: SpendingTrendChartProps) {
  // 🔥 SKELETON
  if (isLoading) {
    return (
      <div className="h-full rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
          <div className="h-3 w-40 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
        </div>
        <div className="flex-1 flex flex-col justify-end min-h-[240px] w-full relative overflow-hidden">
          <svg
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
            className="w-full h-[200px] animate-pulse mt-auto"
          >
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

  // ✅ EMPTY STATE
  const hasData = trendData.length > 0 && trendData.some((d) => d.amount > 0);

  if (!hasData) {
    return (
      <div style={{
        height: "100%", minHeight: 300, borderRadius: 16,
        padding: 16, background: "var(--color-surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 14, textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <style>{`
        @keyframes stc-pulse{0%,100%{opacity:.45;transform:scale(1);}50%{opacity:.9;transform:scale(1.07);}}
        @keyframes stc-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
        @keyframes stc-bar{from{opacity:.22;}to{opacity:.55;}}
      `}</style>

        {/* blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
          <div style={{ position: "absolute", top: "-30%", left: "-10%", width: "55%", paddingBottom: "55%", borderRadius: "50%", background: "radial-gradient(circle,rgba(34,197,94,.11) 0%,transparent 70%)", filter: "blur(32px)" }} />
          <div style={{ position: "absolute", bottom: "-25%", right: "-10%", width: "50%", paddingBottom: "50%", borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 70%)", filter: "blur(28px)" }} />
        </div>

        {/* icon */}
        <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center", animation: "stc-float 3.2s ease-in-out infinite", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "1.5px solid rgba(34,197,94,.22)", animation: "stc-pulse 2.8s ease-in-out infinite" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(34,197,94,.10)", animation: "stc-pulse 2.8s ease-in-out .5s infinite" }} />
          <div style={{
            width: 64, height: 64, borderRadius: 18, position: "relative", zIndex: 1,
            background: "linear-gradient(135deg,rgba(34,197,94,.14) 0%,rgba(16,185,129,.07) 100%)",
            border: "1px solid rgba(34,197,94,.22)", boxShadow: "0 8px 24px rgba(34,197,94,.10)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="30" height="26" viewBox="0 0 30 26" fill="none">
              <defs>
                <linearGradient id="stcFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 24 L0 18 C5 16 8 21 13 14 C18 7 22 19 27 8 L30 5 L30 24 Z" fill="url(#stcFill)" />
              <path d="M0 18 C5 16 8 21 13 14 C18 7 22 19 27 8 L30 5"
                stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="30" cy="5" r="2.5" fill="#22c55e" />
              <circle r="2" fill="white" fillOpacity="0.85">
                <animateMotion dur="3s" repeatCount="indefinite"
                  path="M0 18 C5 16 8 21 13 14 C18 7 22 19 27 8 L30 5" />
              </circle>
            </svg>
          </div>
        </div>


        {/* text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: 210, position: "relative" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: "0.02em", color: "var(--color-text-primary)" }}>
            No Spending Data Yet
          </p>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: "var(--color-text-secondary)" }}>
            Start adding expenses to visualize your spending patterns over time.
          </p>
        </div>
      </div>
    );
  }

  const formattedData = trendData.map((d) => ({
    ...d,
    displayLabel: formatChartLabel(d.day, mode),
  }));

  return (
    <div className="h-full rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs hover:shadow-md transition-all flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base md:text-lg text-[var(--color-text-primary)] tracking-tight">
              Spending Trend
            </h3>

          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Expenses over time
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-accent)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-accent)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.5}
            />
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
              tickFormatter={(v) =>
                v === 0 ? "₹0" : `₹${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                fontSize: "12px",
              }}
              itemStyle={{
                color: "var(--color-text-primary)",
                fontWeight: "bold",
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