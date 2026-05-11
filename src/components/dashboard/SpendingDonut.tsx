import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

type Category = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  data?: Category[];
  isLoading: boolean;
};

export const SpendingDonutEmpty = () => {
  const C = 36;
  const R = 26;
  const STROKE = 10;
  const CIRC = 2 * Math.PI * R;

  const arcs = [
    { pct: 0.42, opacity: 1, color: "#22c55e", delay: "0s" },
    { pct: 0.33, opacity: 0.4, color: "#22c55e", delay: "0s" },
    { pct: 0.22, opacity: 0.18, color: "#22c55e", delay: "0s" },
  ];

  let rotation = -90;

  const built = arcs.map((a) => {
    const dash = a.pct * CIRC;
    const gap = CIRC - dash;
    const rot = rotation;

    rotation += a.pct * 360 + 0.02 * 360;

    return { ...a, dash, gap, rot };
  });

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        borderRadius: 20,
        padding: "20px 16px",
        background: "var(--color-surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // gap: 16,
        justifyContent: "center",
        textAlign: "center",
        minHeight: 250,
        position: "relative",
        overflow: "hidden",
      }}
      className="gap-10 shadow-xs border border-(--border)"
    >
      <style>{`
        @keyframes sde-pulse {
          0%,100%{ opacity:.45; transform:scale(1); }
          50%    { opacity:.90; transform:scale(1.07); }
        }

        @keyframes sde-spin {
          from{ transform:rotate(-90deg); }
          to  { transform:rotate(270deg); }
        }

        @keyframes sde-bar {
          from{ opacity:.25; }
          to  { opacity:.70; }
        }
      `}</style>

      {/* ambient blobs */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          borderRadius: "inherit",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "-10%",
            width: "55%",
            paddingBottom: "55%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(34,197,94,.13) 0%,transparent 70%)",
            filter: "blur(32px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "-25%",
            right: "-10%",
            width: "50%",
            paddingBottom: "50%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(16,185,129,.09) 0%,transparent 70%)",
            filter: "blur(28px)",
          }}
        />
      </div>

      {/* donut + legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* donut */}
        <div
          style={{
            position: "relative",
            width: 72,
            height: 72,
            flexShrink: 0,
          }}
        >
          {/* pulse ring 1 */}
          <div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "1.5px solid rgba(34,197,94,.22)",
              animation: "sde-pulse 2.8s ease-in-out infinite",
            }}
          />

          {/* pulse ring 2 */}
          <div
            style={{
              position: "absolute",
              inset: -18,
              borderRadius: "50%",
              border: "1px solid rgba(34,197,94,.10)",
              animation: "sde-pulse 2.8s ease-in-out 0.5s infinite",
            }}
          />

          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            style={{
              position: "relative",
              zIndex: 1,
              overflow: "visible",
            }}
          >
            {/* track */}
            <circle
              cx={C}
              cy={C}
              r={R}
              stroke="rgba(34,197,94,0.08)"
              strokeWidth={STROKE}
              fill="none"
            />

            {/* animated arcs */}
            <g
              style={{
                transformOrigin: `${C}px ${C}px`,
                animation: "sde-spin 8s linear infinite",
              }}
            >
              {built.map((a, i) => (
                <circle
                  key={i}
                  cx={C}
                  cy={C}
                  r={R}
                  fill="none"
                  stroke="#22c55e"
                  strokeOpacity={a.opacity}
                  strokeWidth={STROKE}
                  strokeDasharray={`${a.dash} ${a.gap}`}
                  strokeLinecap="round"
                  style={{
                    transform: `rotate(${a.rot}deg)`,
                    transformOrigin: `${C}px ${C}px`,
                  }}
                />
              ))}
            </g>

            {/* center */}
            <circle
              cx={C}
              cy={C}
              r={R - STROKE / 2 - 1}
              fill="var(--color-surface)"
            />
          </svg>
        </div>

       
      </div>

      {/* text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          maxWidth: 260,
          textAlign: "center",
          position: "relative",
          zIndex: 1,
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
          Empty Vault
        </p>

        <p
          style={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.65,
            color: "var(--color-text-secondary)",
          }}
        >
          Start recording transactions and categorizing your spending to
          unlock category insights.
        </p>
      </div>
    </div>
  );
};
export function SpendingDonut({ data, isLoading }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="h-full w-full rounded-2xl p-4 md:p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col gap-4">
        <div className="h-5 w-40 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="relative shrink-0" style={{ width: 110, height: 110 }}>
            <div className="rounded-full border-[12px] border-[var(--color-text-secondary)]/10 animate-pulse w-full h-full" />
          </div>
          <div className="flex flex-1 flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)]/10 animate-pulse shrink-0" />
                  <div className="h-2.5 w-16 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                </div>
                <div className="h-2.5 w-10 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasData = !!data && data.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <SpendingDonutEmpty />
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  const formatCompactCurrency = (value: number) => {
    if (value >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
    if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
    if (value >= 1e3) return `₹${(value / 1e3).toFixed(1)}K`;
    return `₹${value}`;
  };

  return (
    <div className="h-full w-full rounded-2xl p-4 md:p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] md:text-base font-semibold text-[var(--color-text-primary)] tracking-wide uppercase">
          Spending by Category
        </h2>
      </div>

      {/* Body — always side by side, donut smaller on mobile */}
      <div className="flex items-center gap-3 flex-1">

        {/* Donut — 110px mobile, 180px desktop */}
        <div
          className="relative shrink-0 self-center w-[140px] h-[140px] md:w-[200px] md:h-[200px] overflow-visible"
          style={{ aspectRatio: "1", transform: "translateX(-4px)" }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart style={{ overflow: "visible" }}>

              {/* DEFINITIONS */}
              <defs>
                {data.map((entry, index) => (
                  <radialGradient
                    key={index}
                    id={`grad-${index}`}
                    cx="50%"
                    cy="50%"
                    r="75%"
                  >
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                    <stop offset="65%" stopColor={entry.color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.85} />
                  </radialGradient>
                ))}

                {/* FIXED SHADOW (no clipping) */}
                <filter id="shadow" x="-60%" y="-60%" width="220%" height="220%">
                  <feDropShadow
                    dx="0"
                    dy="6"
                    stdDeviation="10"
                    floodColor="rgba(0,0,0,0.18)"
                  />
                </filter>
              </defs>

              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius="64%"
                outerRadius="95%"
                paddingAngle={2}
                cornerRadius={4}
                stroke="none"
                animationDuration={1000}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {data.map((entry, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <Cell
                      key={index}
                      fill={`url(#grad-${index})`}
                      filter="url(#shadow)"
                      style={{
                        opacity:
                          activeIndex === null || isActive ? 1 : 0.28,
                        transform: isActive ? "scale(1.04)" : "scale(1)",
                        transformOrigin: "center",
                        transition:
                          "transform 0.25s ease, opacity 0.25s ease, filter 0.25s ease",
                        filter: isActive
                          ? "url(#shadow) brightness(1.12)"
                          : "url(#shadow)",
                      }}
                    />
                  );
                })}
              </Pie>

              {/* GLASS INNER RING (kept subtle) */}
              {/* <circle
                cx="50%"
                cy="50%"
                r="55%"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="2"
                style={{ pointerEvents: "none" }}
              /> */}

            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5">
            <span className="hidden md:block text-[8px] md:text-[9px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">
              {activeItem ? activeItem.name.split(" ")[0] : "Total"}
            </span>
            <span className="block md:hidden text-[8px] md:text-[9px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">
              {activeItem ? "Spent" : "Total"}
            </span>
            <span className="text-xs md:text-base font-black text-[var(--color-text-primary)] leading-tight">
              {formatCompactCurrency(activeItem ? activeItem.value : total)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-0">
          {data.map((item, i) => {
            const pct = Math.round((item.value / total) * 100);
            const isActive = activeIndex === i;
            return (
              <div
                key={i}
                className="cursor-pointer flex flex-col gap-1 py-2 md:py-3 transition-all duration-200"
                style={{ opacity: activeIndex === null || isActive ? 1 : 0.4 }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {/* Name + amount row */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] md:text-[14px] text-[var(--color-text-primary)] truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] md:text-[14px] font-bold text-[var(--color-text-primary)]">
                      {formatCompactCurrency(item.value)}
                    </span>
                    <span className="text-[10px] md:text-xs text-[var(--color-text-secondary)] w-6 md:w-7 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 rounded-full bg-[var(--color-text-secondary)]/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.color,
                      opacity: isActive ? 1 : 0.75,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer */}
      {/* CTA — fits content, not full width */}
      <div className="mt-4">
        <button className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)] px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-accent-soft)] transition">
          View Full Report
          <ArrowRight size={10} strokeWidth={3} />

        </button>
      </div>
      <style>{`
  .recharts-wrapper svg,
  .recharts-surface {
    overflow: visible !important;
  }
`}</style>
    </div>

  );

}