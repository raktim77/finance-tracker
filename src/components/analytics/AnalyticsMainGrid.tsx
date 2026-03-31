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
  isLoading:boolean
};

export function AnalyticsMainGrid({ trendData, pieData, savingsData, barData, children, mode,isLoading }: AnalyticsMainGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 items-stretch">
      <SpendingTrendChart trendData={trendData} mode={mode} isLoading={isLoading} />
      <SavingsTrendChart savingsData={savingsData} mode={'monthly'} isLoading={isLoading}/>
      <QuarterlyBarChart barData={barData} isLoading={isLoading}/>
      <CategoryHeatmap pieData={pieData} isLoading={isLoading}/>
      {children}
    </div>
  );
}
