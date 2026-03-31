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
            <div className="lg:col-span-3 h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-8">

                {/* Header Skeleton */}
                <div className="flex flex-col gap-3">
                    <div className="h-5 w-40 bg-[var(--color-text-secondary)]/10 rounded-lg animate-pulse" />
                    <div className="h-3 w-56 bg-[var(--color-text-secondary)]/10 rounded-md animate-pulse" />
                </div>

                {/* BAR CHART SKELETON - Added flex-1 and min-h */}
                <div className="flex-1 min-h-[260px] w-full flex items-end justify-between gap-4 px-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-1 h-full flex items-end justify-center gap-1.5">

                            {/* Income Bar Skeleton */}
                            <div
                                className="w-3 md:w-4 bg-[var(--color-text-secondary)]/10 rounded-t-lg animate-pulse"
                                style={{
                                    height: `${Math.floor(Math.random() * (80 - 40 + 1) + 40)}%`,
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />

                            {/* Expense Bar Skeleton */}
                            <div
                                className="w-3 md:w-4 bg-[var(--color-text-secondary)]/10 rounded-t-lg animate-pulse opacity-60"
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
            <div className="lg:col-span-3 h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">

                <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mb-3">
                    <span className="text-lg">📊</span>
                </div>

                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                        No transaction data yet
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] max-w-[240px]">
                        Income and expense comparison will appear once transactions are recorded
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-3 h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
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
                    <div>
                        <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight text-left">
                            Transactional Velocity
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)] text-left">
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
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-secondary)", fontSize: 10, fontWeight: "700" }} tickFormatter={(v) => v === 0 ? '₹0' : `₹${v / 1000}k`} />
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
