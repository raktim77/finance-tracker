import type { CategorySlice, MonthlyBarPoint, SavingsPoint, TrendPoint } from "./data/types";
import type { ReactNode } from "react";
import { SpendingTrendChart } from "./charts/SpendingTrendChart";
import { CategoryHeatmap } from "./charts/CategoryHeatmap";
import { SavingsTrendChart } from "./charts/SavingsTrendChart";
import { QuarterlyBarChart } from "./charts/QuarterlyBarChart";

type AnalyticsMainGridProps = {
  trendData: TrendPoint[];
  pieData: CategorySlice[];
  savingsData: SavingsPoint[];
  barData: MonthlyBarPoint[];
  children?: ReactNode;
  mode: "daily" | "monthly" | "weekly"

};

export function AnalyticsMainGrid({ trendData, pieData, savingsData, barData, children, mode }: AnalyticsMainGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
      <SpendingTrendChart trendData={trendData} mode={mode} />
      <CategoryHeatmap pieData={pieData} />
      <SavingsTrendChart savingsData={savingsData} mode={mode} />
      <QuarterlyBarChart barData={barData} />
      {children}
    </div>
  );
}
