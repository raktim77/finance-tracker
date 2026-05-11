import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

type Props = {
  data?: { day: string; amount: number }[];
  isLoading: boolean;
};

// Drop-in replacement for the hasData === false branch in ExpenseTrend.tsx
// Paste this as the `!hasData` return block, or use standalone for preview.

export const ExpenseTrendEmptyState = () => {
  return (
    <div className="w-full rounded-2xl p-4 md:p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col gap-10 items-center justify-center min-h-[250px] h-full overflow-hidden relative">

      {/* ── Ambient glow blobs ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          borderRadius: "inherit",
        }}
      >
        {/* top-left warm blob */}
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "-10%",
            width: "55%",
            paddingBottom: "55%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.10) 0%, transparent 70%)",
            filter: "blur(32px)",
          }}
        />
        {/* bottom-right cool blob */}
        <div
          style={{
            position: "absolute",
            bottom: "-25%",
            right: "-10%",
            width: "50%",
            paddingBottom: "50%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
            filter: "blur(28px)",
          }}
        />
      </div>

      {/* ── Micro chart illustration ── */}
      <div style={{ position: "relative", width: 72, height: 72 }}>
        {/* outer ring pulse */}
        <div
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            border: "1.5px solid rgba(34,197,94,0.18)",
            animation: "etPulse 2.8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: -18,
            borderRadius: "50%",
            border: "1px solid rgba(34,197,94,0.08)",
            animation: "etPulse 2.8s ease-in-out infinite 0.5s",
          }}
        />

        {/* icon container */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(34,197,94,0.14) 0%, rgba(16,185,129,0.07) 100%)",
            border: "1px solid rgba(34,197,94,0.20)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
            boxShadow:
              "0 0 0 1px rgba(34,197,94,0.06), 0 8px 24px rgba(34,197,94,0.10)",
          }}
        >
          {/* inline SVG sparkline */}
          <svg
            width="38"
            height="30"
            viewBox="0 0 38 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* gradient def */}
            <defs>
              <linearGradient id="etFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* fill area */}
            <path
              d="M0 28 L0 20 C6 18 10 24 16 16 C22 8 26 22 32 10 L38 6 L38 28 Z"
              fill="url(#etFill)"
            />
            {/* line */}
            <path
              d="M0 20 C6 18 10 24 16 16 C22 8 26 22 32 10 L38 6"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* end dot */}
            <circle cx="38" cy="6" r="2.5" fill="#22c55e" />
            {/* animated travelling dot */}
            <circle r="2" fill="white" fillOpacity="0.85">
              <animateMotion
                dur="3s"
                repeatCount="indefinite"
                path="M0 20 C6 18 10 24 16 16 C22 8 26 22 32 10 L38 6"
              />
            </circle>
          </svg>
        </div>
      </div>

      {/* ── Fake sparkline bar strip ── */}
      {/* <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 4,
          height: 36,
          opacity: 0.25,
        }}
      >
        {[14, 22, 10, 30, 18, 26, 8].map((h, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: h,
              borderRadius: 3,
              background: "linear-gradient(180deg, #22c55e 0%, #10b981 100%)",
              animation: `etBar 1.8s ease-in-out ${i * 0.1}s infinite alternate`,
            }}
          />
        ))}
      </div> */}

      {/* ── Text ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          maxWidth: 260,
          textAlign: "center",
          position: "relative",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.02em",
            color: "var(--color-text-primary)",
          }}
        >
          No Spending Data Yet
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.6,
            color: "var(--color-text-secondary)",
          }}
        >
          Your 7-day trend will appear here once you record transactions over a period.
        </p>
      </div>

      

      {/* ── keyframes injected once ── */}
      <style>{`
        @keyframes etPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.06); }
        }
        @keyframes etBar {
          from { opacity: 0.18; }
          to   { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
};

export const ExpenseTrend = ({ data, isLoading }: Props) => {

  // 🔥 SKELETON (matches your UI)
  if (isLoading) {
    return (
      <div className="w-full rounded-2xl p-4 md:p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col gap-6 h-full">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
            <div className="h-3 w-40 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
          </div>

          <div className="flex gap-2 items-center">
            <div className="h-2 w-2 rounded-full bg-black/10 dark:bg-white/20 animate-pulse" />
            <div className="h-3 w-16 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
          </div>
        </div>

        {/* High-Impact Area Chart Skeleton */}
        <div className="flex-1 flex flex-col justify-end min-h-[240px] w-full relative overflow-hidden">
          <svg
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
            className="w-full h-[200px] animate-pulse mt-auto"
          >
            {/* Area Fill - Coordinates raised to fill upward space */}
            <path
              d="M0,100 L0,60 C40,55 80,85 120,60 C160,35 200,90 260,45 C320,5 360,25 400,5 L400,100 Z"
              className="fill-[var(--color-text-secondary)] opacity-10"
            />

            {/* Line Stroke - Peaks moved closer to Y:0 to reduce top gap */}
            <path
              d="M0,60 C40,55 80,85 120,60 C160,35 200,90 260,45 C320,5 360,25 400,5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-[var(--color-text-secondary)] opacity-10"
            />
          </svg>

          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-[1px] h-full bg-[var(--color-text-secondary)]/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasData = !!data && data.some((point) => point.amount > 0);

  if (!hasData) {
    return (
      <ExpenseTrendEmptyState />
    );
  }

  return (
    <div className="w-full rounded-2xl p-4 md:p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs transition-all flex flex-col gap-5 h-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-[14px] md:text-base font-semibold text-[var(--color-text-primary)] tracking-wide uppercase">
            Spending Trend
          </h2>
        </div>
        {/* <button className="inline-flex h-9 items-center rounded-xl border border-[var(--border)] px-3 text-xs font-semibold text-[var(--color-text-primary)]">
          This Month
          <span className="ml-2 text-[11px]">⌄</span>
        </button> */}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[240px] w-full">
        <ResponsiveContainer width="100%" minHeight={240}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                fontSize: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
              }}
              itemStyle={{
                color: "var(--color-text-primary)",
                fontWeight: "bold"
              }}
            />

            <CartesianGrid
              strokeDasharray="1 1"
              vertical={false}
              stroke="var(--color-text-secondary)"
              strokeOpacity={0.3}
            />

            <XAxis
              dataKey="day"
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

            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--color-accent)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAmount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
