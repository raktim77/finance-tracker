import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import type { CategorySlice } from "../data/types";

type CategoryHeatmapProps = {
  pieData: CategorySlice[];
};

export function CategoryHeatmap({ pieData }: CategoryHeatmapProps) {
   function getLeadingCategoryName(): string | null {
  if (pieData.length === 0) return null;

  const topCategory = pieData.reduce((prev, current) => {
    return (prev.value > current.value) ? prev : current;
  });

  return topCategory.name;
}
  return (
    <div className="lg:col-span-2 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm flex flex-col">
      <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight text-left">Category Heatmap</h3>
      <p className="text-xs text-[var(--color-text-secondary)] mb-8 text-left">Where your money actually goes</p>

      <div className="h-[200px] relative mb-6">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
          <PieChart>
            <Pie data={pieData} dataKey="value" innerRadius={80} outerRadius={100} paddingAngle={2} cornerRadius={6}>
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Focus</span>
          <span className="text-lg font-black text-[var(--color-text-primary)]">{getLeadingCategoryName()}</span>
        </div>
      </div>

      {/* <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Total
                </span>
                <span className="text-xl font-black text-[var(--color-text-primary)]">
                  {formatCompactCurrency(total)}
                </span> */}

      <div className="grid grid-cols-2 gap-3 mt-auto">
        {pieData.map((item, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-[var(--color-background)] border border-[var(--border)]">
            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase truncate">{item.name}</span>
            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] ml-auto">₹{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
