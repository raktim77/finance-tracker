import { AIInsights } from "../components/dashboard/AIInsights";
import { BalanceOverviewCard } from "../components/dashboard/BalanceOverviewCard";
import { BudgetsPromoCard } from "../components/dashboard/BudgetsPromoCard";
import { ExpenseTrend } from "../components/dashboard/ExpenseTrend";
import { HeroDashboard } from "../components/dashboard/HeroDashboard";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { SpendingDonut } from "../components/dashboard/SpendingDonut";
import PendingReviewCard from "../components/pending/PendingReviewCard";

import { useDashboardAnalytics, useDashboardSummary } from "../features/dashboard/hooks/useDashboard";
import { useHeaderConfig } from "../hooks/useHeaderConfig";
import { useAuth } from "../lib/context/useAuth";
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
  const { data: analyticsData, isLoading: analyticsLoading } = useDashboardAnalytics();
  const { user } = useAuth();
  const isApp = isNativeCapacitorApp();
  const firstName = user?.name?.split(" ")[0] ?? "there";
    const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  return (
    <div className="mx-auto flex flex-col gap-4 pb-24 md:gap-5">
      {/* Mobile dashboard flow */}
      <div className="md:hidden flex flex-col gap-4">
        <HeroDashboard data={data} isLoading={isLoading} />

        {isApp ? (
          <div className="px-2">
            <PendingReviewCard />
          </div>
        ) : null}

        <div className="px-2">
          <RecentTransactions />
        </div>

        <div className="px-2">
          <ExpenseTrend data={analyticsData?.trend} isLoading={analyticsLoading} />
        </div>

        <div className="px-2">
          <SpendingDonut data={analyticsData?.categories} isLoading={analyticsLoading} />
        </div>

        <div className="px-2">
          <AIInsights insights={data?.insights} />
        </div>

        <div className="px-2">
          <BudgetsPromoCard />
        </div>
      </div>

      {/* Desktop dashboard flow */}
      <div className="hidden md:flex md:flex-col md:gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            {greeting}, {firstName}! 👋
          </h2>
          <p className="mt-1 text-l text-[var(--color-text-secondary)]">Here's your financial overview</p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-11">
          <div className="lg:col-span-5">
          <BalanceOverviewCard data={data} isLoading={isLoading} />

          </div>
          <div className="lg:col-span-6">
          <ExpenseTrend data={analyticsData?.trend} isLoading={analyticsLoading} />

          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-11">
          <div className="lg:col-span-5">
          <SpendingDonut data={analyticsData?.categories} isLoading={analyticsLoading} />

          </div>
          <div className="lg:col-span-6">
          <RecentTransactions />

          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="lg:col-span-7">
            <BudgetsPromoCard summary={data?.summary}/>
          </div>
          <div className="lg:col-span-5">
            <AIInsights insights={data?.insights} />
          </div>
        </div>
      </div>
    </div>
  );
}
