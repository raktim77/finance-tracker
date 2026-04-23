import { AIInsights } from "../components/dashboard/AIInsights";
import { ExpenseTrend } from "../components/dashboard/ExpenseTrend";
import { HeroDashboard } from "../components/dashboard/HeroDashboard";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { SpendingDonut } from "../components/dashboard/SpendingDonut";
import { StatsGrid } from "../components/dashboard/StatsGrid";
import PendingReviewCard from "../components/pending/PendingReviewCard";

import { useDashboardAnalytics, useDashboardSummary } from "../features/dashboard/hooks/useDashboard";
import { useHeaderConfig } from "../hooks/useHeaderConfig";
import { isNativeCapacitorApp } from "../lib/capacitor/platform";

export default function Dashboard() {
  useHeaderConfig({
    heroColor: "#2f8c3d",
    heroHeight: 280,
    showLogo: true,
    scrollTitle: null,
    scrollAction: null,
  });

  const { data, isLoading } = useDashboardSummary();
  const { data: analyticsData, isLoading: analyticsLoading } =
    useDashboardAnalytics();
  const isApp = isNativeCapacitorApp()
  return (
    <div className="md:p-1 flex flex-col gap-6 md:gap-8 pb-24 mx-auto">

      <HeroDashboard data={data} isLoading={isLoading} />
      {/* <div className="section-animate "> */}
      <div className="">
        {isApp ? (
          <div className="px-2">
            <PendingReviewCard />

          </div>

        ) : <></>}

        <StatsGrid data={data} isLoading={isLoading} />
        <div className="md:mt-8 grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 items-stretch">

          {/* Expense Trend */}
          <div className="lg:col-span-3 order-3 lg:order-1 p-2 md:p-0 lg:flex">
            <ExpenseTrend
              data={analyticsData?.trend}
              isLoading={analyticsLoading}
            />
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2 order-1 lg:order-2 md:p-0 lg:flex">
            <RecentTransactions />
          </div>

          {/* Spending Donut */}
          <div className="lg:col-span-3 h-full order-2 p-2 md:p-0 lg:flex">
            <SpendingDonut
              data={analyticsData?.categories}
              isLoading={analyticsLoading}
            />
          </div>

          {/* AI Insights */}
          <div className="lg:col-span-2 h-full order-4 p-2 md:p-0 lg:flex">
            <AIInsights />
          </div>

        </div>

      </div>
    </div>
  );
}
