import type { CategorySlice, MonthlyBarPoint, SavingsPoint, TrendPoint } from "./data/types";
import { SpendingTrendChart } from "./charts/SpendingTrendChart";
import { CategoryHeatmap } from "./charts/CategoryHeatmap";
import { SavingsTrendChart } from "./charts/SavingsTrendChart";
import { QuarterlyBarChart } from "./charts/QuarterlyBarChart";
import { ThisMonthPanel } from "./ThisMonthPanel";
import type { ReactNode } from "react";


type AnalyticsMainGridProps = {
  trendData: TrendPoint[];
  pieData: CategorySlice[];
  savingsData: SavingsPoint[];
  barData: MonthlyBarPoint[];
  children?: ReactNode;
  mode: "daily" | "monthly" | "weekly";
  isLoading: boolean;
  thisMonthData?: {
    spent: number;
    income: number;
    savings: number;
    savingsRate: number;
    daysRemaining: number;
  };
};
// trendData, pieData, savingsData, barData, children, mode, isLoading

export function AnalyticsMainGrid({
  trendData,
  pieData,
  savingsData,
  barData,
  children,
  mode,
  isLoading,
  thisMonthData,
}: AnalyticsMainGridProps) {
  return (
    <div className="flex flex-col gap-4 px-3 md:px-0">
      {/* ── ROW 1: Spending Trend + Savings Performance + This Month ── */}
      {/* Desktop: 3-col (5fr + 5fr + 2fr), Mobile: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">
        {/* Spending Trend — spans 5 cols desktop */}
        <div className="lg:col-span-4 h-full">
          <SpendingTrendChart trendData={trendData} mode={mode} isLoading={isLoading} />
        </div>
 
        {/* Savings Performance — spans 5 cols desktop */}
        <div className="lg:col-span-3 h-full">
          <SavingsTrendChart savingsData={savingsData} mode="monthly" isLoading={isLoading} />
        </div>
 
        {/* This Month panel — spans 2 cols desktop, hidden on mobile (shown in hero) */}
        <div className="lg:col-span-3 hidden lg:block h-full">
          <ThisMonthPanel data={thisMonthData} isLoading={isLoading} />
        </div>
 
        {/* Mobile: This Month panel shown below charts */}
        <div className="lg:hidden">
          <ThisMonthPanel data={thisMonthData} isLoading={isLoading} />
        </div>
      </div>
 
      {/* ── ROW 2: Transactional Velocity + Category Heatmap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
        <div className="lg:col-span-5 h-full">
        <QuarterlyBarChart barData={barData} isLoading={isLoading} />
          
        </div>
        <div className="lg:col-span-6 h-full">
        <CategoryHeatmap pieData={pieData} isLoading={isLoading} />

        </div>
      </div>
 
      {/* ── ROW 3: AI Insights — full width ── */}
      {children}
    </div>
  );
}
 
