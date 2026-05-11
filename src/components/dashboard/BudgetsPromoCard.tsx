import { ArrowRight, WalletMinimal } from "lucide-react";
import type { DashboardSummaryResponse } from "../../features/dashboard/types/dashboard.types";
import { useNavigate } from "react-router-dom";
type Props = {
  summary?: DashboardSummaryResponse["summary"];
};

const metrics = [
  { label: "Budgets", Icon: WalletMinimal }
] as const;

export function BudgetsPromoCard({summary}: Props) {
  const navigate = useNavigate()
  return (
    <div className="h-full w-full rounded-2xl border border-[var(--border)] bg-[var(--color-surface)] p-4 md:p-6 shadow-xs">

      {/* ROOT: stacks vertically on mobile, horizontal on md+ */}
      <div className="flex flex-col md:flex-row md:items-stretch md:justify-between gap-4 md:gap-6">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">

          {/* IMAGE */}
          <img
            src="/assets/dashboard_budget.webp"
            alt="wallet"
            className="w-[80px] md:w-[170px] object-contain shrink-0"
          />

          {/* TEXT */}
          <div className="flex flex-col justify-center min-w-0">
            <h3 className="text-base md:text-2xl font-extrabold text-[var(--color-text-primary)] leading-snug">
              Track smarter. Save better.
            </h3>

            <p className="mt-1 md:mt-2 text-xs md:text-base text-[var(--color-text-secondary)] max-w-md">
              Create budgets, set goals, and get personalized insights
              to take control of your finances.
            </p>

            <div className="mt-3 md:mt-6">
              <button className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)] px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-accent-soft)] transition" onClick={() => navigate("/budgets")}>
                Explore Budgets
                <ArrowRight size={10} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: full-width row on mobile, card on md+ */}
        <div className="flex md:items-stretch shrink-0">
          {metrics.map(({ label, Icon }) => (
            <div
              key={label}
              className="
                flex flex-row md:flex-col
                items-center
                md:justify-between
                gap-3 md:gap-0
                w-full md:w-auto
                rounded-xl border border-[var(--border)]
                px-4 md:px-6
                py-3 md:py-6
                md:min-w-[140px]
              "
            >
              {/* ICON */}
              <div className="flex items-center justify-center w-9 h-9 md:w-20 md:h-20 rounded-full border border-2 border-[var(--border)]  shrink-0">
                <Icon size={16} className="text-[var(--color-text-primary)] md:hidden" />
                <Icon size={50} className="text-[var(--color-text-primary)] hidden md:block" />
              </div>

              {/* LABEL + VALUE */}
              <div className="flex flex-col md:items-center md:gap-2">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {label}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {summary?.budget_left !== null
                    ? '1 active'
                    : "0 active"}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
