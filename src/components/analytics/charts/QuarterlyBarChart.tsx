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
};

/**
 * Type alias to satisfy ESLint and Recharts internal TooltipIndex
 */
type ChartIndex = number | string | null;

export function QuarterlyBarChart({ barData }: QuarterlyBarChartProps) {
    const groupWidth = 70;
    const minChartWidth = barData.length * groupWidth;

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const chartContentRef = useRef<HTMLDivElement>(null);
    const touchEndTimeoutRef = useRef<number | null>(null);

    const [isTouchScrolling, setIsTouchScrolling] = useState(false);
    const [isCoarsePointer, setIsCoarsePointer] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // FIXED: Replaced 'any' with a Union Type to satisfy eslint@typescript-eslint/no-explicit-any
    const [activeIndex, setActiveIndex] = useState<ChartIndex>(null);

    // Detect if device is touch-based (Coarse pointer)
    useEffect(() => {
        if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
            const mediaQuery = window.matchMedia("(pointer: coarse)");
            const updatePointerMode = () => setIsCoarsePointer(mediaQuery.matches);
            updatePointerMode();
            mediaQuery.addEventListener("change", updatePointerMode);
            return () => mediaQuery.removeEventListener("change", updatePointerMode);
        }
    }, []);

    // Global listener to close tooltip when clicking/tapping outside the chart area
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

    // Handle horizontal overflow and scroll indicators
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

    return (
        <div className="lg:col-span-2 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm overflow-hidden">
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
                            <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                            <span className="opacity-60 text-[var(--color-text-primary)]">Income</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                            <span className="opacity-60 text-[var(--color-text-primary)]">Expense</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative group">
                <div
                    ref={scrollContainerRef}
                    /* FIX: Changed 'touch-pan-x' to 'touch-auto' 
                       or 'touch-pan-x pan-y' to allow vertical page scrolling 
                    */
                    className="h-[260px] overflow-x-auto overflow-y-hidden no-scrollbar touch-auto cursor-grab active:cursor-grabbing"
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
                                barGap={4}
                                // Updated handlers to use specific state logic
                                onMouseMove={(state) => {
                                    if (state.activeTooltipIndex !== undefined) {
                                        setActiveIndex(state.activeTooltipIndex);
                                    }
                                }}
                                onMouseLeave={() => setActiveIndex(null)}
                                onClick={(state) => {
                                    if (state && state.activeTooltipIndex !== undefined) {
                                        setActiveIndex(state.activeTooltipIndex);
                                    }
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="var(--border)"
                                    opacity={0.3}
                                />

                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "var(--color-text-secondary)",
                                        fontSize: 10,
                                        fontWeight: "900"
                                    }}
                                    dy={10}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "var(--color-text-secondary)", fontSize: 10, fontWeight: "700" }}
                                    tickFormatter={(v) => v === 0 ? '₹0' : `₹${v / 1000}k`}
                                />

                                <Tooltip
                                    // Managed visibility based on scroll state and active index
                                    active={isTouchScrolling ? false : (activeIndex !== null)}

                                    trigger={isCoarsePointer ? "click" : "hover"}
                                    cursor={{ fill: "var(--color-accent-soft)", radius: 12, opacity: 0.4 }}
                                    wrapperStyle={{ pointerEvents: "none", zIndex: 30 }}
                                    contentStyle={{
                                        borderRadius: "16px",
                                        border: "1px solid var(--border)",
                                        background: "var(--color-surface)",
                                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                                        padding: "12px"
                                    }}
                                    itemStyle={{ fontWeight: "900", fontSize: "12px" }}
                                />

                                <Bar
                                    dataKey="income"
                                    fill="#22c55e"
                                    radius={[6, 6, 0, 0]}
                                    barSize={14}
                                />

                                <Bar
                                    dataKey="expense"
                                    fill="#ef4444"
                                    radius={[6, 6, 0, 0]}
                                    barSize={14}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Horizontal Fade Overlay */}
                {canScrollRight && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--color-surface)] via-[var(--color-surface)]/80 to-transparent transition-opacity duration-300" />
                )}

                {/* Scroll Affordance Indicator */}
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