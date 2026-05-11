import { Eye, EyeOff, TrendingDown, TrendingUp, Target, CircleDollarSign, ArrowUp, ArrowDown } from "lucide-react";
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

  if (!data && !isLoading) return null;

  const netChange = data?.summary.net ?? 0;

  const positiveColor = "var(--color-success)";
  const negativeColor = "var(--color-danger)";
  const softOverlay =
    "color-mix(in srgb, var(--color-text-primary) 5%, transparent)";

  return (
    <div className="h-full w-full rounded-2xl border border-[var(--border)] bg-[var(--color-surface)] p-4 md:p-6 shadow-xs">
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
          <div className="mt-4">
            {isLoading ? (
              <div className="h-12 w-56 rounded-xl bg-[var(--color-text-secondary)]/15 animate-pulse" />
            ) : (
              <h2 className="text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                {showBalance
                  ? `${netChange > 0 ? "+" : netChange < 0 ? "-" : ""}₹${formatCompactCurrency(
                      Math.abs(netChange)
                    )}`
                  : "••••••••"}
              </h2>
            )}
          </div>

          {/* Change */}
          <div className="mt-3">
            {isLoading ? (
              <div className="h-7 w-40 rounded-full bg-[var(--color-text-secondary)]/15 animate-pulse" />
            ) : (
              <div
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-[var(--color-accent)]"
                style={{ background: softOverlay }}
              >
                {data!.comparison.percent_change >= 0 ? (
                  <ArrowUp size={14} style={{ color: positiveColor }} />
                ) : (
                  <ArrowDown size={14} style={{ color: negativeColor }} />
                )}

                <span
                  style={{
                    color:
                      data!.comparison.percent_change >= 0
                        ? positiveColor
                        : negativeColor,
                  }}
                >
                  {data!.comparison.percent_change}% vs last month
                </span>
              </div>
            )}
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
        <div className="flex flex-col gap-2">
          <>
            <StatCard
              isLoading={isLoading}
              label="Income"
              amount={`₹${formatCompactCurrency(
                Math.abs(data?.summary.income ?? 0)
              )}`}
              icon={TrendingUp}
              color="#16A34A"
            />

            <StatCard
              isLoading={isLoading}
              label="Expenses"
              amount={`₹${formatCompactCurrency(
                Math.abs(data?.summary.expenses ?? 0)
              )}`}
              icon={TrendingDown}
              color="#EF4444"
            />

            <StatCard
              isLoading={isLoading}
              label="Savings"
              amount={`${(data?.summary.savings_rate ?? 0).toFixed(1)}%`}
              icon={Target}
              color="#9333EA"
            />

            <StatCard
              isLoading={isLoading}
              label="Budget Left"
              amount={
                data?.summary.budget_left !== null &&
                data?.summary.budget_left !== undefined
                  ? `₹${formatCompactCurrency(
                      Math.abs(data.summary.budget_left)
                    )}`
                  : "—"
              }
              icon={CircleDollarSign}
              color="#32a59e"
            />
          </>
        </div>
      </div>
    </div>
  );
}