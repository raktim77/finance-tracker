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

export function SpendingDonut({ data, isLoading }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="h-full w-full rounded-2xl p-4 md:p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-4">
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
      <div className="h-full w-full rounded-2xl p-5 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-4 items-center justify-center text-center min-h-[200px]">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-background)] flex items-center justify-center border border-[var(--border)]">
          <span className="text-lg">🍩</span>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Empty Vault</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">Record categories to see spending insights.</p>
        </div>
      </div>
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
    <div className="h-full w-full rounded-2xl p-4 md:p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] tracking-wide uppercase">
          Spending by Category
        </h2>
      </div>

      {/* Body — always side by side, donut smaller on mobile */}
      <div className="flex items-center gap-3 md:gap-6 flex-1">

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
              <circle
                cx="50%"
                cy="50%"
                r="55%"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="2"
                style={{ pointerEvents: "none" }}
              />

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
                className="cursor-pointer flex flex-col gap-1 py-2 md:py-3 border-b border-[var(--border)] last:border-b-0 cursor-default transition-all duration-200"
                style={{ opacity: activeIndex === null || isActive ? 1 : 0.4 }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {/* Name + amount row */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] md:text-[12px] font-semibold text-[var(--color-text-primary)] truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] md:text-xs font-bold text-[var(--color-text-primary)]">
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