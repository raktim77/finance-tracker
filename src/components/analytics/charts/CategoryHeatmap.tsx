import { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import type { CategorySlice } from "../data/types";
import formatCompactCurrency from "../../../utils/getCompactAmount";

type CategoryHeatmapProps = {
  pieData: CategorySlice[];
};

export function CategoryHeatmap({ pieData }: CategoryHeatmapProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getDisplayData = () => {
    if (pieData.length === 0) {
      return { name: "—", value: 0 };
    }

    if (activeIndex !== null) {
      return pieData[activeIndex];
    }

    // default → top category
    return pieData.reduce((prev, current) =>
      prev.value > current.value ? prev : current
    );

  };

  const display = getDisplayData();

  return (<div className="lg:col-span-3 h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col"> <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight text-left">
    Category Heatmap </h3> <p className="text-xs text-[var(--color-text-secondary)] mb-8 text-left">
      Where your money actually goes </p>

    <div className="h-[230px] relative mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={2}
            cornerRadius={6}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {pieData.map((entry, index) => (
              <Cell key={index} fill={entry.color} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* CENTER CONTENT */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
          {activeIndex !== null ? "Focus" : "Top category"}
        </span>

        <span className="text-lg font-black text-[var(--color-text-primary)]">
          {display.name}
        </span>

        <span className="text-l font-black text-[var(--color-text-primary)]">
          ₹{formatCompactCurrency(display.value)}
        </span>
      </div>
    </div>

    <div className="grid md:grid-cols-3 grid-cols-2 gap-3 mt-auto">
      {pieData.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 p-2 rounded-xl bg-[var(--color-background)] border border-[var(--border)]"
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: item.color }}
          />
          <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase truncate">
            {item.name}
          </span>
          <span className="text-[10px] font-bold text-[var(--color-text-secondary)] ml-auto">
            ₹{item.value}
          </span>
        </div>
      ))}
    </div>
  </div>

  );
}
