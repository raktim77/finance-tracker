import { Eye, EyeOff, TrendingDown, TrendingUp, Target, CircleDollarSign } from "lucide-react";
import { useState } from "react";
import type { DashboardSummaryResponse } from "../../features/dashboard/types/dashboard.types";
import { StatCard } from "./StatCard";
import formatCompactCurrency from "../../utils/getCompactAmount";

type Props = {
  data?: DashboardSummaryResponse;
  isLoading: boolean;
};


export function BalanceOverviewCard({ data, isLoading }: Props) {
  const [showBalance, setShowBalance] = useState(true);

  if (isLoading) {
    return (
      <div className="h-full w-full rounded-2xl border border-[var(--border)] bg-[var(--color-surface)] p-4 md:p-5 shadow-sm">
        <div className="h-6 w-40 rounded bg-[var(--color-text-secondary)]/15 animate-pulse" />
        <div className="mt-4 h-10 w-52 rounded bg-[var(--color-text-secondary)]/15 animate-pulse" />
        <div className="mt-4 h-7 w-44 rounded-full bg-[var(--color-text-secondary)]/15 animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  const netChange = data.summary.net;
  const changeSign = data.comparison.percent_change >= 0 ? "+" : "";

  // const statCards = [
  //   {
  //     label: "Income",
  //     value: data.summary.income,
  //     Icon: TrendingUp,
  //     tone: "text-[var(--color-success)] bg-[var(--color-success)]/10",
  //   },
  //   {
  //     label: "Expenses",
  //     value: data.summary.expenses,
  //     Icon: TrendingDown,
  //     tone: "text-[var(--color-warm)] bg-[var(--color-warm)]/10",
  //   },
  //   {
  //     label: "Net Savings",
  //     value: Math.max(data.summary.net, 0),
  //     Icon: Target,
  //     tone: "text-[#3b82f6] bg-[#3b82f6]/10",
  //   },
  // ] as const;

  return (
    <div className="h-full w-full rounded-2xl border border-[var(--border)] bg-[var(--color-surface)] p-4 md:p-6 shadow-sm">

      <div className="flex flex-col lg:flex-row gap-2">

        {/* LEFT */}
        <div className="flex-1">

          {/* Title */}
          <div className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text-secondary)]">
            <span>This Month</span>
            <button
              type="button"
              onClick={() => setShowBalance((prev) => !prev)}
              aria-label={showBalance ? "Hide balance" : "Show balance"}
              className="inline-flex items-center justify-center rounded-md p-1 hover:bg-[var(--color-text-secondary)]/10 transition-colors"
            >
              {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>

          {/* Amount */}
          <h2 className="mt-4 text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            {showBalance
              ? `${netChange > 0 ? "+" : netChange < 0 ? "-" : ""}₹${formatCompactCurrency(
                  Math.abs(netChange)
                )}`
              : "••••••••"}
          </h2>

          {/* Change */}
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--color-accent)]">
            <TrendingUp size={14} />
            {changeSign}
            {data.comparison.percent_change}% vs last month
          </div>

          {/* Wallet Image */}
          <div className="mt-3 w-full flex items-center justify-center">
            <img
              src="/assets/dashboard_wallet.webp"
              alt="wallet"
              className="w-[80%] object-contain"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className=" flex flex-col gap-2">

          {!isLoading && data && (
                    <>
                        <StatCard
                            label="Income"
                            amount={`₹${formatCompactCurrency(Math.abs(data.summary.income))}`}
                            icon={TrendingUp}
                            color="#16A34A"
                        />

                        <StatCard
                            label="Expenses"
                            amount={`₹${formatCompactCurrency(Math.abs(data.summary.expenses))}`}
                            icon={TrendingDown}
                            color="#EF4444"
                        />

                        <StatCard
                            label="Savings"
                            amount={`${data.summary.savings_rate.toFixed(1)}%`}
                            icon={Target}
                            color="#9333EA"
                        />

                        <StatCard
                            label="Budget Left"
                            amount={
                                data.summary.budget_left !== null
                                    ? `₹${formatCompactCurrency(Math.abs(data.summary.budget_left))}`
                                    : "—"
                            }
                            icon={CircleDollarSign}
                            color="#32a59e"
                        />
                    </>
                )}

        </div>

      </div>
    </div>
  );
}
