import { AIInsights } from "../components/dashboard/AIInsights";
import { ExpenseTrend } from "../components/dashboard/ExpenseTrend";
import { HeroDashboard } from "../components/dashboard/HeroDashboard";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { SpendingDonut } from "../components/dashboard/SpendingDonut";
import { StatsGrid } from "../components/dashboard/StatsGrid";
import PendingReviewCard from "../components/pending/PendingReviewCard";

import { useDashboardAnalytics, useDashboardSummary } from "../features/dashboard/hooks/useDashboard";

export default function Dashboard() {
  
  const { data, isLoading } = useDashboardSummary();
  const { data: analyticsData, isLoading: analyticsLoading } =
  useDashboardAnalytics();

  return (
    <div className="md:p-1 flex flex-col gap-6 md:gap-8 pb-24 animate-in fade-in duration-700 mx-auto">

      <HeroDashboard data={data} isLoading={isLoading} />

      <PendingReviewCard />
      <StatsGrid data={data} isLoading={isLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">

  {/* Expense Trend */}
  <div className="lg:col-span-3 order-2 lg:order-1 p-1 md:p-0">
    <ExpenseTrend
      data={analyticsData?.trend}
      isLoading={analyticsLoading}
    />
  </div>

  {/* Recent Transactions */}
  <div className="lg:col-span-2 order-1 lg:order-2 p-1 md:p-0">
    <RecentTransactions />
  </div>

  {/* Spending Donut */}
  <div className="lg:col-span-3 h-full order-3 p-1 md:p-0">
    <SpendingDonut
      data={analyticsData?.categories}
      isLoading={analyticsLoading}
    />
  </div>

  {/* AI Insights */}
  <div className="lg:col-span-2 h-full order-4">
    <AIInsights />
  </div>

</div>
    </div>
  );
}