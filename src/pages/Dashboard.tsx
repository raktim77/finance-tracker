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
import ProfileMenu from "../components/ProfileMenu";

export default function Dashboard() {
  useHeaderConfig({
    heroColor: "#071209",        // matches the hero's top color
    heroHeight: 40,
    showLogo: true,
    scrollTitle: null,
    scrollAction: null,
    isDashboard: true
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
    <div className="mx-auto flex flex-col gap-4 md:pb-10 pb-24 md:gap-5">
      {/* Mobile dashboard flow */}
      <div className="md:hidden flex flex-col gap-4">
        <HeroDashboard data={data} isLoading={isLoading} />

        {isApp ? (
            <PendingReviewCard />
        ) : null}

        <div className="px-1">
          <RecentTransactions />
        </div>

        <div className="px-3 h-full">
            <ExpenseTrend data={analyticsData?.trend} isLoading={analyticsLoading} />
        </div>

        <div className="px-3">
          <SpendingDonut data={analyticsData?.categories} isLoading={analyticsLoading} />
        </div>

        <div className="px-3">
          <AIInsights insights={data?.insights} />
        </div>

        <div className="px-3">
          <BudgetsPromoCard />
        </div>
      </div>

      {/* Desktop dashboard flow */}
      <div className="hidden md:flex md:flex-col md:gap-4">
        <div className="flex items-center justify-between">

          {/* LEFT */}
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              {greeting}, {firstName}! 👋
            </h2>
            <p className="mt-1 text-l text-[var(--color-text-secondary)]">
              Here's your financial overview
            </p>
          </div>

          {/* RIGHT (DESKTOP ONLY) */}
          <div className="hidden md:flex items-center gap-6">
            {/* PROFILE */}
            <ProfileMenu />

          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-11 items-stretch">
          <div className="lg:col-span-5 h-full">
            <BalanceOverviewCard data={data} isLoading={isLoading} />

          </div>
          <div className="lg:col-span-6 h-full">
            <ExpenseTrend data={analyticsData?.trend} isLoading={analyticsLoading} />

          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-11 items-stretch">
          <div className="lg:col-span-5 h-full">
            <SpendingDonut data={analyticsData?.categories} isLoading={analyticsLoading} />

          </div>
          <div className="lg:col-span-6 h-full">
            <RecentTransactions />

          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 h-full">
            <BudgetsPromoCard summary={data?.summary} />
          </div>
          <div className="lg:col-span-5 h-full">
            <AIInsights insights={data?.insights} />
          </div>
        </div>
      </div>
    </div>
  );
}
