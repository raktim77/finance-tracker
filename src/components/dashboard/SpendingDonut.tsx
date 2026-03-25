import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState } from "react";

const categoryData = [
  { name: "Food", value: 8200, color: "#f97316" },
  { name: "Shopping", value: 5100, color: "#8b5cf6" },
  { name: "Transport", value: 2400, color: "#06b6d4" },
  { name: "Bills", value: 2500, color: "#22c55e" }
];

export function SpendingDonut() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = categoryData.reduce((sum, item) => sum + item.value, 0);
  const activeItem = activeIndex !== null ? categoryData[activeIndex] : null;

  return (
    <div className="h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6">
      
      <h2 className="font-bold text-lg text-[var(--color-text-primary)]">
        Spending Categories
      </h2>

      <div className="flex flex-col md:flex-row items-center gap-6">
        
        <div className="relative w-[380px] h-[200px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
                cornerRadius={6}
                dataKey="value"
                animationDuration={900}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {categoryData.map((entry, index) => (
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

          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            {activeItem ? (
              <>
                <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  {activeItem.name}
                </span>
                <span className="text-lg font-black text-[var(--color-text-primary)]">
                  ₹{activeItem.value.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Total
                </span>
                <span className="text-xl font-black text-[var(--color-text-primary)]">
                  ₹{total.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          {categoryData.map((item, i) => (
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