import { useEffect, useRef, useState } from "react";
import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
} from "recharts";
import type { MonthlyBarPoint } from "../data/types";

type QuarterlyBarChartProps = {
    barData: MonthlyBarPoint[];
    isLoading: boolean;

};

type ChartIndex = number | string | null;

export function QuarterlyBarChart({ barData, isLoading }: QuarterlyBarChartProps) {
    const pointCount = barData.length;
    const groupWidth =
        pointCount <= 3 ? 120 :
            pointCount <= 6 ? 92 :
                pointCount <= 9 ? 76 :
                    64;
    const barSize =
        pointCount <= 3 ? 22 :
            pointCount <= 6 ? 16 :
                pointCount <= 9 ? 12 :
                    10;
    const barGap =
        pointCount <= 3 ? 10 :
            pointCount <= 6 ? 8 :
                4;
    const minChartWidth = barData.length * groupWidth;

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const chartContentRef = useRef<HTMLDivElement>(null);
    const touchEndTimeoutRef = useRef<number | null>(null);

    const [isTouchScrolling, setIsTouchScrolling] = useState(false);
    const [isCoarsePointer, setIsCoarsePointer] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [activeIndex, setActiveIndex] = useState<ChartIndex>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
            const mediaQuery = window.matchMedia("(pointer: coarse)");
            const updatePointerMode = () => setIsCoarsePointer(mediaQuery.matches);
            updatePointerMode();
            mediaQuery.addEventListener("change", updatePointerMode);
            return () => mediaQuery.removeEventListener("change", updatePointerMode);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (scrollContainerRef.current && !scrollContainerRef.current.contains(event.target as Node)) {
                setActiveIndex(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        const content = chartContentRef.current;
        if (!container || !content) return;

        const updateOverflowState = () => {
            const contentWidth = content.getBoundingClientRect().width;
            const containerWidth = container.clientWidth;
            const isOverflowing = contentWidth > containerWidth + 8;
            const hasMoreContentRight = container.scrollLeft + container.clientWidth < contentWidth - 8;
            setHasOverflow(isOverflowing);
            setCanScrollRight(isOverflowing && hasMoreContentRight);
        };

        updateOverflowState();
        const resizeObserver = new ResizeObserver(updateOverflowState);
        resizeObserver.observe(container);
        resizeObserver.observe(content);
        const handleScroll = () => updateOverflowState();
        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            resizeObserver.disconnect();
            container.removeEventListener("scroll", handleScroll);
        };
    }, [barData.length]);

    const handleTouchMove = () => {
        if (touchEndTimeoutRef.current !== null) window.clearTimeout(touchEndTimeoutRef.current);
        setIsTouchScrolling(true);
    };

    const handleTouchEnd = () => {
        touchEndTimeoutRef.current = window.setTimeout(() => {
            setIsTouchScrolling(false);
            touchEndTimeoutRef.current = null;
        }, 180);
    };



    const hasData =
        barData.length > 0 &&
        barData.some((d) => d.income !== 0 || d.expense !== 0);

    if (isLoading) {
        return (
            <div className="lg:col-span-3 h-full rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col gap-8">

                {/* Header Skeleton */}
                <div className="flex flex-col gap-3">
                    <div className="h-5 w-40 bg-[var(--color-text-secondary)]/10 rounded-lg animate-pulse" />
                    <div className="h-3 w-56 bg-[var(--color-text-secondary)]/10 rounded-md animate-pulse" />
                </div>

                {/* BAR CHART SKELETON - Added flex-1 and min-h */}
                <div className="flex-1 min-h-[180px] w-full flex items-end justify-between gap-4 px-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-1 h-full flex items-end justify-center gap-1.5">

                            {/* Income Bar Skeleton */}
                            <div
                                className="w-3 md:w-4 bg-[var(--color-text-secondary)]/15 rounded-t-lg animate-pulse"
                                style={{
                                    height: `${Math.floor(Math.random() * (80 - 40 + 1) + 40)}%`,
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />

                            {/* Expense Bar Skeleton */}
                            <div
                                className="w-3 md:w-4 bg-[var(--color-text-secondary)]/15 rounded-t-lg animate-pulse opacity-60"
                                style={{
                                    height: `${Math.floor(Math.random() * (60 - 20 + 1) + 20)}%`,
                                    animationDelay: `${i * 0.15}s`
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Optional: X-Axis Labels Skeleton */}
                <div className="flex justify-between px-2 pt-2 border-t border-[var(--border)]/50">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-2 w-8 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

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
        @keyframes qbc-pulse{0%,100%{opacity:.45;transform:scale(1);}50%{opacity:.9;transform:scale(1.07);}}
        @keyframes qbc-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
        @keyframes qbc-bar{from{opacity:.18;}to{opacity:.50;}}
      `}</style>

                {/* blobs */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
                    <div style={{ position: "absolute", top: "-30%", left: "-10%", width: "55%", paddingBottom: "55%", borderRadius: "50%", background: "radial-gradient(circle,rgba(34,197,94,.11) 0%,transparent 70%)", filter: "blur(32px)" }} />
                    <div style={{ position: "absolute", bottom: "-25%", right: "-10%", width: "50%", paddingBottom: "50%", borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,.08) 0%,transparent 70%)", filter: "blur(28px)" }} />
                </div>

                {/* icon */}
                <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center", animation: "qbc-float 3.2s ease-in-out infinite", flexShrink: 0 }}>
                    <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "1.5px solid rgba(34,197,94,.22)", animation: "qbc-pulse 2.8s ease-in-out infinite" }} />
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(34,197,94,.10)", animation: "qbc-pulse 2.8s ease-in-out .5s infinite" }} />
                    <div style={{
                        width: 64, height: 64, borderRadius: 18, position: "relative", zIndex: 1,
                        background: "linear-gradient(135deg,rgba(34,197,94,.14) 0%,rgba(16,185,129,.07) 100%)",
                        border: "1px solid rgba(34,197,94,.22)", boxShadow: "0 8px 24px rgba(34,197,94,.10)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        {/* paired bar icon — income + expense columns */}
                        <svg width="32" height="26" viewBox="0 0 32 26" fill="none">
                            {/* group 1 */}
                            <rect x="1" y="8" width="5" height="18" rx="2" fill="#22c55e" fillOpacity="0.9" />
                            <rect x="7" y="14" width="5" height="12" rx="2" fill="#ef4444" fillOpacity="0.7" />
                            {/* group 2 */}
                            <rect x="14" y="4" width="5" height="22" rx="2" fill="#22c55e" fillOpacity="0.9" />
                            <rect x="20" y="10" width="5" height="16" rx="2" fill="#ef4444" fillOpacity="0.7" />
                            {/* group 3 */}
                            <rect x="27" y="6" width="5" height="20" rx="2" fill="#22c55e" fillOpacity="0.55" />
                            {/* baseline */}
                            <line x1="0" y1="26" x2="32" y2="26" stroke="#22c55e" strokeOpacity="0.20" strokeWidth="1" />
                        </svg>
                    </div>
                </div>



                {/* text */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: 240, position: "relative" }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: "0.02em", color: "var(--color-text-primary)" }}>
                        No Transaction Data Yet
                    </p>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: "var(--color-text-secondary)" }}>
                        Income and expense comparison will appear once transactions are recorded.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-3 h-full rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs overflow-hidden flex flex-col">
            <style>
                {`
                    @keyframes scroll-hint {
                        0%, 100% { transform: translateX(-100%); }
                        50% { transform: translateX(200%); }
                    }
                    .animate-scroll-hint {
                        animation: scroll-hint 2s infinite ease-in-out;
                    }
                `}
            </style>

            <div className="flex flex-col mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-base md:text-lg text-[var(--color-text-primary)] tracking-tight text-left">
                            Transactional Velocity
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            Income vs Expense comparison
                        </p>
                    </div>

                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest bg-[var(--color-background)] px-3 py-2 rounded-xl border border-[var(--border)]">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                            <span className="opacity-60 text-[var(--color-text-primary)]">Income</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                            <span className="opacity-60 text-[var(--color-text-primary)]">Expense</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative group flex-1 flex flex-col">
                <div
                    ref={scrollContainerRef}
                    /* Fixed: touch-auto allows both chart swiping and page scrolling */
                    className="min-h-[260px] flex-1 overflow-x-auto overflow-y-hidden no-scrollbar touch-auto cursor-grab active:cursor-grabbing"
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                >
                    <div
                        ref={chartContentRef}
                        style={{ width: '100%', minWidth: `${minChartWidth}px` }}
                        className="h-full"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barData}
                                margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
                                barGap={barGap}
                                onMouseMove={(state) => {
                                    if (state.activeTooltipIndex !== undefined) setActiveIndex(state.activeTooltipIndex);
                                }}
                                onMouseLeave={() => setActiveIndex(null)}
                                onClick={(state) => {
                                    if (state && state.activeTooltipIndex !== undefined) setActiveIndex(state.activeTooltipIndex);
                                }}
                            >
                                <defs>
                                    {/* Brand Success Gradient */}
                                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#16A34A" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#16A34A" stopOpacity={0.7} />
                                    </linearGradient>
                                    {/* Brand Danger Gradient */}
                                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0.7} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10, fontWeight: "900" }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }} tickFormatter={(v) => v === 0 ? '₹0' : `₹${v / 1000}K`} />
                                <Tooltip
                                    active={isTouchScrolling ? false : (activeIndex !== null)}
                                    trigger={isCoarsePointer ? "click" : "hover"}
                                    cursor={{ fill: "var(--color-accent-soft)", radius: 12, opacity: 0.4 }}
                                    wrapperStyle={{ pointerEvents: "none", zIndex: 30 }}
                                    contentStyle={{ borderRadius: "16px", border: "1px solid var(--border)", background: "var(--color-surface)", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "12px" }}
                                    itemStyle={{ fontWeight: "900", fontSize: "12px" }}
                                />
                                <Bar dataKey="income" fill="url(#incomeGradient)" radius={[6, 6, 0, 0]} barSize={barSize} />
                                <Bar dataKey="expense" fill="url(#expenseGradient)" radius={[6, 6, 0, 0]} barSize={barSize} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {canScrollRight && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--color-surface)] via-[var(--color-surface)]/80 to-transparent transition-opacity duration-300" />
                )}

                {hasOverflow && (
                    <div className="mt-3 flex justify-center">
                        <div className="flex gap-2 items-center rounded-full border border-[var(--border)] bg-[var(--color-background)]/80 px-3 py-1 backdrop-blur-sm">
                            <div className="w-12 h-1 bg-[var(--color-accent-soft)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--color-accent)] w-1/3 animate-scroll-hint" />
                            </div>
                            <span className="text-[8px] font-black uppercase text-[var(--color-text-secondary)] opacity-60 tracking-tighter">
                                Scroll to view
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
