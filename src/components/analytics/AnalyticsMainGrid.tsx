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
};

export function AnalyticsMainGrid({ trendData, pieData, savingsData, barData, children }: AnalyticsMainGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
      <SpendingTrendChart trendData={trendData} />
      <CategoryHeatmap pieData={pieData} />
      <SavingsTrendChart savingsData={savingsData} />
      <QuarterlyBarChart barData={barData} />
      {children}
    </div>
  );
}
