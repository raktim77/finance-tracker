import { AIInsights } from "../components/dashboard/AIInsights";
import { ExpenseTrend } from "../components/dashboard/ExpenseTrend";
import { HeroDashboard } from "../components/dashboard/HeroDashboard";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { SpendingDonut } from "../components/dashboard/SpendingDonut";
import { StatsGrid } from "../components/dashboard/StatsGrid";

import { useDashboardAnalytics, useDashboardSummary } from "../features/dashboard/hooks/useDashboard";

export default function Dashboard() {
  
  const { data, isLoading } = useDashboardSummary();
  const { data: analyticsData, isLoading: analyticsLoading } =
  useDashboardAnalytics();

  return (
    <div className="p-1 flex flex-col gap-6 md:gap-8 pb-24 animate-in fade-in duration-700 mx-auto">

      <HeroDashboard data={data} isLoading={isLoading} />

      <StatsGrid data={data} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
        <div className="lg:col-span-3">
          <ExpenseTrend data={analyticsData?.trend}
            isLoading={analyticsLoading}
          />
        </div>

        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>

        <div className="lg:col-span-3 h-full">
          <SpendingDonut
            data={analyticsData?.categories}
            isLoading={analyticsLoading}
          />
        </div>

        <div className="lg:col-span-2 h-full">
          <AIInsights />
        </div>
      </div>
    </div>
  );
}