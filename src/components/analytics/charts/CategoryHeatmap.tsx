import { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { CategorySlice } from "../data/types";
import formatCompactCurrency from "../../../utils/getCompactAmount";

type CategoryHeatmapProps = {
    pieData: CategorySlice[];
    isLoading: boolean;
};

/**
 * Enhanced Category Heatmap with Scrollable Legend and Vertical Pills
 */
export function CategoryHeatmap({ pieData, isLoading }: CategoryHeatmapProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // ✅ SKELETON STATE
    if (isLoading) {
        return (
            <div className="lg:col-span-3 h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <div className="h-4 w-40 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                </div>
                <div className="flex items-center justify-center py-4">
                    <div className="w-[180px] h-[180px] rounded-full border-[14px] border-[var(--color-text-secondary)]/10 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-12 bg-[var(--color-text-secondary)]/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // ✅ EMPTY STATE
    const hasData = pieData.length > 0 && pieData.some((d) => d.value > 0);

    if (!hasData) {
        return (
            <div className="lg:col-span-3 h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mb-4 text-2xl">🍩</div>
                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">No Data Collected</h3>
                <p className="text-xs text-[var(--color-text-secondary)] max-w-[200px] mt-2">Transactions will be categorized here once recorded.</p>
            </div>
        );
    }

    // ✅ DISPLAY LOGIC
    const getDisplayData = () => {
        if (activeIndex !== null) return pieData[activeIndex];
        return pieData.reduce((prev, current) => (prev.value > current.value ? prev : current));
    };

    const display = getDisplayData();

    return (
        <div className="lg:col-span-3 h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col transition-all">
            <div className="flex flex-col mb-2">
                <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight">Category Heatmap</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">Where your money actually goes</p>
            </div>

            {/* CHART AREA */}
            <div className="h-[220px] relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            dataKey="value"
                            innerRadius={75}
                            outerRadius={100}
                            paddingAngle={3}
                            cornerRadius={8}
                            stroke="none"
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {pieData.map((entry, index) => (
                                <Cell 
                                    key={index} 
                                    fill={entry.color} 
                                    style={{ 
                                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.3,
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* CENTER LABELS */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black uppercase text-[var(--color-text-secondary)] tracking-widest opacity-60">
                        {activeIndex !== null ? "Focusing" : "Top Spend"}
                    </span>
                    <span className="text-sm font-black text-[var(--color-text-primary)] truncate max-w-[130px] leading-tight">
                        {display.name}
                    </span>
                    <span className="text-xl font-black text-[var(--color-text-primary)] mt-0.5">
                        ₹{formatCompactCurrency(display.value)}
                    </span>
                </div>
            </div>

            {/* SCROLLABLE LEGEND - THE FIX */}
            <div className="flex flex-col mt-4 gap-3">
                <div className="flex items-center justify-between px-1 border-b border-[var(--border)] pb-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-60">
                        Breakdown ({pieData.length})
                    </span>
                    {pieData.length > 6 && (
                        <span className="text-[10px] font-bold text-[var(--color-accent)] animate-bounce">↓ Scroll</span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1 no-scrollbar py-1">
                    {pieData.map((item, i) => (
                        <div
                            key={i}
                            onMouseEnter={() => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(null)}
                            className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                activeIndex === i 
                                    ? "bg-[var(--color-background)] border-[var(--color-accent)] shadow-sm translate-y-[-2px]" 
                                    : "bg-[var(--color-background)]/40 border-[var(--border)]"
                            }`}
                        >
                            {/* Vertical Color Indicator */}
                            <div
                                className="w-1.5 h-7 rounded-full shrink-0 shadow-sm"
                                style={{ background: item.color }}
                            />
                            
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-[11px] font-black text-[var(--color-text-primary)] uppercase truncate leading-none mb-1">
                                    {item.name}
                                </span>
                                <div className="flex items-center justify-between w-full pt-1">
                                    <span className="text-[12px] font-bold text-[var(--color-text-secondary)] leading-none truncate">
                                        ₹{item.value.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}