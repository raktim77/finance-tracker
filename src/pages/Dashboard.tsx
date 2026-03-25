import { AIInsights } from "../components/dashboard/AIInsights";
import { ExpenseTrend } from "../components/dashboard/ExpenseTrend";
import { HeroDashboard } from "../components/dashboard/HeroDashboard";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { SpendingDonut } from "../components/dashboard/SpendingDonut";
import { StatsGrid } from "../components/dashboard/StatsGrid";

export default function Dashboard() {
  return (
    <div className="p-1 flex flex-col gap-6 md:gap-8 pb-24 animate-in fade-in duration-700 mx-auto">

      <HeroDashboard />

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
        <div className="lg:col-span-3">
          <ExpenseTrend />
        </div>

        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>

        <div className="lg:col-span-3 h-full">
          <SpendingDonut />
        </div>

        <div className="lg:col-span-2 h-full">
          <AIInsights />
        </div>
      </div>
    </div>
  );
}