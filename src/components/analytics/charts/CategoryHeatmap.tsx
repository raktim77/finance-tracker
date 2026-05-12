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
  const skeletonBg =
    "color-mix(in srgb, var(--color-text-secondary) 10%, transparent)";

  const skeletonBgSoft =
    "color-mix(in srgb, var(--color-text-secondary) 7%, transparent)";

  return (
    <div className="lg:col-span-3 h-full rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col gap-6">
      <style>{`
        @keyframes chm-sk{
          0%,100%{opacity:.30;}
          50%{opacity:.65;}
        }
      `}</style>

      {/* header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            height: 16,
            width: 140,
            borderRadius: 6,
            background: skeletonBg,
            animation: "chm-sk 1.6s ease-in-out infinite",
          }}
        />

        <div
          style={{
            height: 11,
            width: 180,
            borderRadius: 5,
            background: skeletonBgSoft,
            animation: "chm-sk 1.6s ease-in-out .1s infinite",
          }}
        />
      </div>

      {/* donut + legend side by side */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flex: 1,
        }}
      >
        {/* donut ghost */}
        <div
          style={{
            flexShrink: 0,
            position: "relative",
            width: "clamp(110px, 35%, 180px)",
            aspectRatio: "1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* track */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 180 180"
            style={{
              position: "absolute",
              inset: 0,
            }}
          >
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke={skeletonBgSoft}
              strokeWidth="22"
            />

            {/* 3 arc segments */}
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke={skeletonBg}
              strokeWidth="22"
              strokeLinecap="round"
              strokeDasharray="176 264"
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "90px 90px",
                animation: "chm-sk 1.6s ease-in-out infinite",
              }}
            />

            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke={skeletonBg}
              strokeWidth="22"
              strokeLinecap="round"
              strokeDasharray="132 308"
              style={{
                transform: "rotate(65deg)",
                transformOrigin: "90px 90px",
                animation: "chm-sk 1.6s ease-in-out .15s infinite",
                opacity: 0.7,
              }}
            />

            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke={skeletonBg}
              strokeWidth="22"
              strokeLinecap="round"
              strokeDasharray="88 352"
              style={{
                transform: "rotate(195deg)",
                transformOrigin: "90px 90px",
                animation: "chm-sk 1.6s ease-in-out .3s infinite",
                opacity: 0.45,
              }}
            />

            {/* hole */}
            <circle
              cx="90"
              cy="90"
              r="58"
              fill="var(--color-surface)"
            />
          </svg>

          {/* center label ghost */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
            }}
          >
            <div
              style={{
                height: 7,
                width: 40,
                borderRadius: 4,
                background: skeletonBg,
                animation: "chm-sk 1.6s ease-in-out infinite",
              }}
            />

            <div
              style={{
                height: 10,
                width: 56,
                borderRadius: 4,
                background: skeletonBg,
                animation: "chm-sk 1.6s ease-in-out .1s infinite",
              }}
            />

            <div
              style={{
                height: 14,
                width: 44,
                borderRadius: 4,
                background: skeletonBg,
                animation: "chm-sk 1.6s ease-in-out .2s infinite",
              }}
            />
          </div>
        </div>

        {/* legend ghost */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            alignContent: "start",
          }}
        >
          {[
            ["72%", "0s"],
            ["55%", "0.08s"],
            ["65%", "0.16s"],
            ["48%", "0.24s"],
            ["60%", "0.32s"],
            ["52%", "0.40s"],
          ].map(([w, delay], i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 10,
                background: skeletonBgSoft,
                border: `1px solid ${skeletonBgSoft}`,
                opacity: 1 - i * 0.08,
              }}
            >
              {/* color bar */}
              <div
                style={{
                  width: 4,
                  height: 28,
                  borderRadius: 2,
                  flexShrink: 0,
                  background: skeletonBg,
                  animation: `chm-sk 1.6s ease-in-out ${delay} infinite`,
                }}
              />

              {/* text lines */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                <div
                  style={{
                    height: 6,
                    width: "60%",
                    borderRadius: 3,
                    background: skeletonBg,
                    animation: `chm-sk 1.6s ease-in-out ${delay} infinite`,
                  }}
                />

                <div
                  style={{
                    height: 10,
                    width: w as string,
                    borderRadius: 3,
                    background: skeletonBg,
                    animation: `chm-sk 1.6s ease-in-out ${delay} infinite`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

  // EMPTY
  const hasData = pieData.length > 0 && pieData.some((d) => d.value > 0);

 if (!hasData) {
  return (
    <div className="lg:col-span-3" style={{
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
        @keyframes chm-pulse{0%,100%{opacity:.45;transform:scale(1);}50%{opacity:.9;transform:scale(1.07);}}
        @keyframes chm-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
        @keyframes chm-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @keyframes chm-bar{from{opacity:.20;}to{opacity:.50;}}
      `}</style>

      {/* blobs */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", borderRadius:"inherit" }}>
        <div style={{ position:"absolute", top:"-30%", left:"-10%", width:"55%", paddingBottom:"55%", borderRadius:"50%", background:"radial-gradient(circle,rgba(34,197,94,.11) 0%,transparent 70%)", filter:"blur(32px)" }} />
        <div style={{ position:"absolute", bottom:"-25%", right:"-10%", width:"50%", paddingBottom:"50%", borderRadius:"50%", background:"radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 70%)", filter:"blur(28px)" }} />
      </div>

      {/* icon */}
      <div style={{ position:"relative", width:100, height:100, display:"flex", alignItems:"center", justifyContent:"center", animation:"chm-float 3.2s ease-in-out infinite", flexShrink:0 }}>
        <div style={{ position:"absolute", inset:10, borderRadius:"50%", border:"1.5px solid rgba(34,197,94,.22)", animation:"chm-pulse 2.8s ease-in-out infinite" }} />
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1px solid rgba(34,197,94,.10)", animation:"chm-pulse 2.8s ease-in-out .5s infinite" }} />
        <div style={{ width:64, height:64, borderRadius:18, position:"relative", zIndex:1,
          background:"linear-gradient(135deg,rgba(34,197,94,.14) 0%,rgba(16,185,129,.07) 100%)",
          border:"1px solid rgba(34,197,94,.22)", boxShadow:"0 8px 24px rgba(34,197,94,.10)",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          {/* spinning donut using stroke arcs — same pattern as SpendingDonutEmpty, no id collisions */}
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <g style={{ transformOrigin:"19px 19px", animation:"chm-spin 8s linear infinite" }}>
              {/* seg 1 ~40% */}
              <circle cx="19" cy="19" r="14" fill="none" stroke="#22c55e" strokeOpacity="0.90"
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray="35 52" strokeDashoffset="0"
                style={{ transform:"rotate(-90deg)", transformOrigin:"19px 19px" }}/>
              {/* seg 2 ~33% */}
              <circle cx="19" cy="19" r="14" fill="none" stroke="#22c55e" strokeOpacity="0.40"
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray="29 58" strokeDashoffset="0"
                style={{ transform:"rotate(62deg)", transformOrigin:"19px 19px" }}/>
              {/* seg 3 ~22% */}
              <circle cx="19" cy="19" r="14" fill="none" stroke="#22c55e" strokeOpacity="0.18"
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray="19 68" strokeDashoffset="0"
                style={{ transform:"rotate(197deg)", transformOrigin:"19px 19px" }}/>
            </g>
            {/* inner hole */}
            <circle cx="19" cy="19" r="10" fill="var(--color-surface)"/>
          </svg>
        </div>
      </div>


      {/* text */}
      <div style={{ display:"flex", flexDirection:"column", gap:5, maxWidth:230, position:"relative" }}>
        <p style={{ margin:0, fontSize:14, fontWeight:700, letterSpacing:"0.02em", color:"var(--color-text-primary)" }}>
          No Data Collected
        </p>
        <p style={{ margin:0, fontSize:12, lineHeight:1.65, color:"var(--color-text-secondary)" }}>
          Transactions will be categorized here once recorded.
        </p>
      </div>
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
                {pieData.map((_, index) => {
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