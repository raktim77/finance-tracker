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
      <div className="h-full w-full rounded-[1.6rem] md:rounded-[2rem] p-4 md:p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-4 md:gap-6">
        <div className="h-5 w-40 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
        <div className="flex items-center gap-4">
          {/* Donut skeleton: Guaranteed size on mobile */}
          <div className="relative h-32 w-32 md:w-48 md:h-48 shrink-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-[10px] md:border-[16px] border-[var(--color-text-secondary)]/10 animate-pulse" />
          </div>
          <div className="flex flex-1 flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-20 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
                <div className="h-3 w-8 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
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
      <div className="h-full w-full rounded-[1.6rem] md:rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col gap-4 md:gap-6 items-center justify-center text-center min-h-[280px]">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-background)] flex items-center justify-center border border-[var(--border)] shadow-sm">
          <span className="text-xl">🍩</span>
        </div>
        <div className="flex flex-col gap-1 max-w-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-primary)]">
            Empty Vault
          </h2>
          <p className="text-[10px] font-bold text-[var(--color-text-secondary)] leading-relaxed">
            Record categories to see spending insights.
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
    <div className="h-full w-full rounded-[1.6rem] md:rounded-[2rem] p-4 md:p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-4 md:gap-6">
      
      <h2 className="font-bold text-lg text-[var(--color-text-primary)]">
        Spending Categories
      </h2>

      <div className="flex items-center gap-2 md:gap-12">
        
        {/* Donut Container: Fixed min-width on mobile to prevent squishing */}
        <div className="relative h-40 w-40 md:w-55 md:h-55 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius="60%"
                outerRadius="85%"
                paddingAngle={3}
                cornerRadius={4}
                dataKey="value"
                stroke="none"
                animationDuration={1000}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    className="outline-none"
                    style={{
                      filter: activeIndex === index ? "brightness(1.1)" : "none",
                      opacity: activeIndex === null || activeIndex === index ? 1 : 0.6,
                      transition: "all .3s ease"
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label: Sized for high-contrast architectural feel */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[7px] md:text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-0.5">
              {activeItem ? activeItem.name : "Total"}
            </span>
            <span className="text-xs md:text-lg font-black text-[var(--color-text-primary)]">
              {formatCompactCurrency(activeItem ? activeItem.value : total)}
            </span>
          </div>
        </div>

        {/* Legend Container: Flex-1 w-0 to allow internal truncation */}
        <div className="flex-1 w-0 flex flex-col gap-2.5 md:gap-4">
          {data.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-3 text-[10px] md:text-sm transition-all duration-300 ${
                activeIndex === null || activeIndex === i ? "opacity-100" : "opacity-40"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-1.5 w-1.5 md:h-2 md:w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate font-black font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
                  {item.name}
                </span>
              </div>
              <span className="shrink-0 font-bold text-[var(--color-text-secondary)]">
                {formatCompactCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
