import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState } from "react";

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

  // 🔥 SKELETON
  if (isLoading) {
    return (
      <div className="h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-6">
        
        {/* Title */}
        <div className="h-5 w-40 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />

        <div className="flex flex-col md:flex-row items-center gap-6">
          
          {/* Donut skeleton */}
          <div className="relative w-[380px] h-[200px] flex items-center justify-center">
            <div className="w-[140px] h-[140px] rounded-full border-[16px] border-[var(--color-text-secondary)]/10 animate-pulse" />
          </div>

          {/* Legend skeleton */}
          <div className="flex flex-col gap-4 w-full">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-text-secondary)]/10 animate-pulse" />
                  <div className="h-3 w-20 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                </div>
                <div className="h-3 w-12 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
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
      <div className="h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-6 items-center justify-center text-center min-h-[320px]">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shadow-inner">
          <span className="text-2xl">🍩</span>
        </div>

        <div className="flex flex-col gap-2 max-w-sm">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
            No Spending Breakdown Yet
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Once you record spending across categories, this chart will show where your money is going.
          </p>
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
    <div className="h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6">
      
      <h2 className="font-bold text-lg text-[var(--color-text-primary)]">
        Spending Categories
      </h2>

      <div className="flex flex-col md:flex-row items-center gap-6">
        
        {/* Donut */}
        <div className="relative w-[380px] h-[200px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
                cornerRadius={6}
                dataKey="value"
                animationDuration={900}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    style={{
                      filter:
                        activeIndex === index
                          ? "brightness(1.15)"
                          : "brightness(0.9)",
                      transition: "all .25s"
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            {activeItem ? (
              <>
                <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  {activeItem.name}
                </span>
                <span className="text-lg font-black text-[var(--color-text-primary)]">
                  {formatCompactCurrency(activeItem.value)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Total
                </span>
                <span className="text-xl font-black text-[var(--color-text-primary)]">
                  {formatCompactCurrency(total)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-4 w-full">
          {data.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between text-sm transition-all ${
                activeIndex === i ? "opacity-100" : "opacity-70"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[var(--color-text-primary)] font-semibold">
                  {item.name}
                </span>
              </div>
              <span className="text-[var(--color-text-secondary)] font-bold">
                ₹{item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
