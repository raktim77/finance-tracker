import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

import type { SavingsPoint } from "../data/types";
import { formatChartLabel } from "../../../utils/formatLabel";

type SavingsTrendChartProps = {
  savingsData: SavingsPoint[];
  mode: "daily" | "monthly" | "weekly";
  isLoading: boolean;
};

export function SavingsTrendChart({
  savingsData,
  mode,
  isLoading,
}: SavingsTrendChartProps) {
  // 🔥 SKELETON
  if (isLoading) {
    return (
      <div className="h-full rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
          <div className="h-3 w-48 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
        </div>
        <div className="flex-1 flex flex-col justify-end min-h-[240px] w-full relative overflow-hidden">
          <svg
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
            className="w-full h-[200px] animate-pulse mt-auto"
          >
            <path
              d="M0,100 L0,70 C40,65 80,75 120,60 C160,45 200,70 260,50 C320,30 360,40 400,25 L400,100 Z"
              className="fill-[var(--color-text-secondary)] opacity-10"
            />
            <path
              d="M0,70 C40,65 80,75 120,60 C160,45 200,70 260,50 C320,30 360,40 400,25"
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
  const hasData =
    savingsData.length > 0 && savingsData.some((d) => d.amount !== 0);

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
        @keyframes sav-pulse{0%,100%{opacity:.45;transform:scale(1);}50%{opacity:.9;transform:scale(1.07);}}
        @keyframes sav-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
        @keyframes sav-bar{from{opacity:.22;}to{opacity:.55;}}
      `}</style>

        {/* blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
          <div style={{ position: "absolute", top: "-30%", left: "-10%", width: "55%", paddingBottom: "55%", borderRadius: "50%", background: "radial-gradient(circle,rgba(34,197,94,.11) 0%,transparent 70%)", filter: "blur(32px)" }} />
          <div style={{ position: "absolute", bottom: "-25%", right: "-10%", width: "50%", paddingBottom: "50%", borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 70%)", filter: "blur(28px)" }} />
        </div>

        {/* icon */}
        <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center", animation: "sav-float 3.2s ease-in-out infinite", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "1.5px solid rgba(34,197,94,.22)", animation: "sav-pulse 2.8s ease-in-out infinite" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(34,197,94,.10)", animation: "sav-pulse 2.8s ease-in-out .5s infinite" }} />
          <div style={{
            width: 64, height: 64, borderRadius: 18, position: "relative", zIndex: 1,
            background: "linear-gradient(135deg,rgba(34,197,94,.14) 0%,rgba(16,185,129,.07) 100%)",
            border: "1px solid rgba(34,197,94,.22)", boxShadow: "0 8px 24px rgba(34,197,94,.10)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="30" height="28" viewBox="0 0 30 28" fill="none">
              {/* positive area fill */}
              <defs>
                <linearGradient id="savIconFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* zero line */}
              <line x1="0" y1="18" x2="30" y2="18" stroke="#22c55e" strokeOpacity="0.20" strokeWidth="1" strokeDasharray="3 2" />
              {/* savings curve — generally trending up with one dip below zero */}
              <path d="M0 16 C4 14 7 20 10 18 C13 16 16 8 20 6 C24 4 27 7 30 5 L30 28 L0 28 Z"
                fill="url(#savIconFill)" />
              <path d="M0 16 C4 14 7 20 10 18 C13 16 16 8 20 6 C24 4 27 7 30 5"
                stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="30" cy="5" r="2.5" fill="#22c55e" />
              {/* travelling dot */}
              <circle r="2" fill="white" fillOpacity="0.85">
                <animateMotion dur="3s" repeatCount="indefinite"
                  path="M0 16 C4 14 7 20 10 18 C13 16 16 8 20 6 C24 4 27 7 30 5" />
              </circle>
            </svg>
          </div>
        </div>

        {/* ghost bars — mix of positive and one negative to hint at the surplus chart */}
        {/* <div style={{ display: "flex", alignItems: "center", gap: 4, height: 44, position: "relative" }}>
          {([10, 18, 14, 28, 8, 32, 20, 36, 24, 30] as number[]).map((h, i) => {
            const isNeg = i === 2 || i === 4;
            return (
              <div key={i} style={{
                width: 5,
                height: Math.abs(h),
                borderRadius: 3,
                background: isNeg
                  ? "linear-gradient(180deg,#ef4444 0%,#f87171 100%)"
                  : "linear-gradient(180deg,#22c55e 0%,#10b981 100%)",
                opacity: 0.18,
                alignSelf: isNeg ? "flex-start" : "flex-end",
                animation: `sav-bar 1.8s ease-in-out ${i * 0.08}s infinite alternate`,
              }} />
            );
          })}
          <div style={{
            position: "absolute", bottom: "50%", left: 0, right: 0, height: 1,
            background: "rgba(34,197,94,0.18)", borderRadius: 1
          }} />
        </div> */}

        {/* text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: 220, position: "relative" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: "0.02em", color: "var(--color-text-primary)" }}>
            No Savings Data Yet
          </p>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: "var(--color-text-secondary)" }}>
            Savings insights will appear as you log data over a period of time.
          </p>
        </div>
      </div>
    );
  }

  const formattedData = savingsData.map((d) => ({
    ...d,
    displayLabel: formatChartLabel(d.day, mode),
  }));

  // Check if we have negative values for dual-color gradient
  const hasNegative = formattedData.some((d) => d.amount < 0);

  return (
    <div className="h-full rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs hover:shadow-md transition-all flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base md:text-lg text-[var(--color-text-primary)] tracking-tight">
            Savings Performance
          </h3>

        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Monthly surplus
        </p>
      </div>

      <div className="flex-1 min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="savingsGradientPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="savingsGradientNeg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0} />
                <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.35} />
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
                fontSize: "12px",
              }}
              itemStyle={{
                color: "var(--color-text-primary)",
                fontWeight: "bold",
              }}
            />
            {hasNegative && (
              <ReferenceLine
                y={0}
                stroke="var(--color-danger)"
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.5}
              />
            )}
            {/* Positive area */}
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--color-success)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#savingsGradientPos)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}