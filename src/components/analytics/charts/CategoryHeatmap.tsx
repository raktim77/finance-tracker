import { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { CategorySlice } from "../data/types";
import formatCompactCurrency from "../../../utils/getCompactAmount";

type CategoryHeatmapProps = {
  pieData: CategorySlice[];
  isLoading: boolean;
};

export function CategoryHeatmap({ pieData, isLoading }: CategoryHeatmapProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // SKELETON
  if (isLoading) {
    return (
      <div className="lg:col-span-3 h-full rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-40 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
          <div className="h-3 w-48 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
        </div>

        <div className="flex items-center justify-center py-4">
          <div className="w-[180px] h-[180px] rounded-full border-[14px] border-[var(--color-text-secondary)]/10 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-[var(--color-text-secondary)]/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // EMPTY
  const hasData = pieData.length > 0 && pieData.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="lg:col-span-3 h-full rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mb-4 text-2xl">
          🍩
        </div>
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
          No Data Collected
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-[240px]">
          Transactions will be categorized here once recorded.
        </p>
      </div>
    );
  }

  // DISPLAY LOGIC
  const getDisplayData = () => {
    if (activeIndex !== null) return pieData[activeIndex];
    return pieData.reduce((prev, current) =>
      prev.value > current.value ? prev : current
    );
  };

  const display = getDisplayData();

  return (
    <div className="lg:col-span-3 h-full rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col">

      {/* HEADER */}
      <div className="flex flex-col gap-1 md:mb-0 mb-8">
        <h3 className="font-bold text-base md:text-lg text-[var(--color-text-primary)] tracking-tight">
          Category Heatmap
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Where your money actually goes
        </p>
      </div>

      {/* MAIN SPLIT LAYOUT */}
      <div className="flex gap-6 items-center flex-1 min-h-0">

        <div className="flex items-center gap-3 md:gap-3 flex-1">

          {/* LEFT: DONUT */}
          <div 
          className="relative shrink-0 self-center w-[140px] h-[140px] md:w-[220px] md:h-[220px] overflow-visible"
          style={{ aspectRatio: "1", transform: "translateX(-4px)" }}
          onMouseLeave={() => setActiveIndex(null)}>
             <ResponsiveContainer width="100%" height="100%">
            <PieChart style={{ overflow: "visible" }}>

              {/* DEFINITIONS */}
              <defs>
                {pieData.map((entry, index) => (
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
                data={pieData}
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
                {pieData.map((entry, index) => {
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


            {/* CENTER TEXT */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[8px] md:text-[10px] font-black uppercase text-[var(--color-text-secondary)] tracking-widest opacity-80">
                {activeIndex !== null ? "Focusing" : "Top Spend"}
              </span>
              <span className="text-[10px] md:text-sm font-semibold md:font-black text-[var(--color-text-primary)] truncate max-w-[120px] text-center">
                {display.name}
              </span>
              <span className="text-base md:text-xl font-black text-[var(--color-text-primary)]">
                ₹{formatCompactCurrency(display.value)}
              </span>
            </div>
          </div>

          {/* RIGHT: LEGEND WITH SCROLL */}
          <div className="flex-1 flex flex-col max-h-[180px] md:max-h-[220px]">

            {/* HEADER */}
            <div className="flex items-center justify-between px-1 mb-3">
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-80">
                Breakdown ({pieData.length})
              </span>

              {pieData.length > 2 && (
                <span className="block md:hidden text-[10px] font-bold text-[var(--color-accent)] animate-bounce">
                  ↓ Scroll
                </span>
              )}
              {pieData.length > 6 && (
                <span className="hidden md:block text-[10px] font-bold text-[var(--color-accent)] animate-bounce">
                  ↓ Scroll
                </span>
              )}
            </div>

            {/* SCROLL GRID */}
            <div className="grid md:grid-cols-2 grid-cols-1 gap-2 overflow-y-auto pr-1 no-scrollbar flex-1">
              {pieData.map((item, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center gap-3 px-2.5 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${activeIndex === i
                      ? "bg-[var(--color-background)] border-[var(--color-accent)] shadow-sm"
                      : "bg-[var(--color-background)]/40 border-[var(--border)]"
                    }`}
                >
                  {/* COLOR BAR */}
                  <div
                    className="w-1.5 h-9 rounded-full shrink-0"
                    style={{ background: item.color }}
                  />

                  {/* TEXT */}
                  <div className="flex flex-col min-w-0 flex-1 gap-1">
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] truncate mb-0.5" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[12px] md:text-[14px] font-semibold truncate text-[var(--color-text-primary)] leading-none" title={ '₹' + item.value.toLocaleString()}>
                      ₹{item.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

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