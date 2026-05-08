import {
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import formatCompactCurrency from "../../utils/getCompactAmount";

type AnalyticsHeroProps = {
  data?: {
    totalSpending: number;
    spendingChangePercent: number;
    efficiency: "High" | "Moderate" | "Low";
    budgetUsedPercent: number;
    totalIncome?: number;
    totalSavings?: number;
    avgDailySpending?: number;
  };
  isLoading: boolean;
};

const efficiencyColor = {
  High: "text-[var(--color-success)]",
  Moderate: "text-[var(--color-warm)]",
  Low: "text-[var(--color-danger)]",
};

export function AnalyticsHero({ data, isLoading }: AnalyticsHeroProps) {
  const totalSpending = data?.totalSpending ?? 0;
  const change = data?.spendingChangePercent ?? 0;
  const efficiency = data?.efficiency ?? "High";
  const budgetUsed = data?.budgetUsedPercent ?? 0;
  const safeBudget = Math.min(budgetUsed, 100);
  const totalIncome = data?.totalIncome ?? 0;
  const totalSavings = data?.totalSavings ?? 0;
  const avgDaily = data?.avgDailySpending ?? 0;



  const isNegativeChange = change < 0;

  const SkeletonVal = ({ wide }: { wide?: boolean }) => (
    <div
      className={`h-7 ${wide ? "w-40" : "w-24"} bg-[var(--color-text-secondary)]/10 rounded-md animate-pulse mt-1`}
    />
  );


  // ─── MOBILE layout: 2×2 metric cards + efficiency/budget row ───
  const MobileHero = (
    <div className="flex flex-col gap-3 md:hidden px-2">
      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cumulative Spending */}
        <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
            Cumulative Spending
          </span>
          {isLoading ? (
            <SkeletonVal wide />
          ) : (
            <div className="flex flex-wrap items-end gap-x-2 gap-y-2 justify-between">
              <span className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight leading-none">
                ₹{formatCompactCurrency(totalSpending)}
              </span>

              <div
                className={`inline-flex items-center gap-1 px-1 py-0.5 rounded-lg text-[12px] font-black w-fit ${isNegativeChange
                    ? "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
                    : "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                  }`}
              >
                {isNegativeChange ? (
                  <ArrowDown size={10} strokeWidth={2.5} />
                ) : (
                  <ArrowUp size={10} strokeWidth={2.5} />
                )}
                <span>
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Total Income */}
        <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
            Total Income
          </span>
          {isLoading ? (
            <SkeletonVal />
          ) : (
            <span className="text-2xl font-semibold text-[var(--color-success)] tracking-tight leading-none">
              ₹{formatCompactCurrency(totalIncome)}
            </span>
          )}
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Savings */}
        <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
            Total Savings
          </span>
          {isLoading ? (
            <SkeletonVal />
          ) : (
            <span className="text-2xl font-semibold text-[var(--color-success)] tracking-tight leading-none">
              ₹{formatCompactCurrency(totalSavings)}
            </span>
          )}
        </div>

        {/* Avg Daily Spend */}
        <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
            Avg Daily Spend
          </span>
          {isLoading ? (
            <SkeletonVal />
          ) : (
            <span className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight leading-none">
              ₹{formatCompactCurrency(avgDaily)}
            </span>
          )}
        </div>
      </div>

      {/* Efficiency + Budget row */}
      <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-0">
        {/* Efficiency */}
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
            Efficiency
          </span>
          {isLoading ? (
            <div className="h-6 w-16 bg-[var(--color-text-secondary)]/10 rounded animate-pulse mt-1" />
          ) : (
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xl font-semibold ${efficiencyColor[efficiency]}`}
              >
                {efficiency}
              </span>
              <ArrowUpRight
                size={16}
                className={`${efficiencyColor[efficiency]}`}
                strokeWidth={2.5}
              />
            </div>
          )}
        </div>

        <div className="w-px h-10 bg-[var(--border)] mx-4" />

        {/* Budget Left */}
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
            Budget Used
          </span>
          {isLoading ? (
            <div className="h-2 w-full bg-[var(--color-text-secondary)]/10 rounded-full animate-pulse" />
          ) : (
            <>
              <div className="w-full h-2 bg-[var(--color-text-secondary)]/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-success)] rounded-full transition-all duration-1000"
                  style={{ width: `${safeBudget}%` }}
                />
              </div>
              <span className="text-xs font-black text-[var(--color-text-primary)]">
                {safeBudget}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ---------------- DESKTOP FIXED ----------------

  const DesktopHero = (
    <div className="relative hidden md:block bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs overflow-hidden">
      {/* GRID INSTEAD OF RIGID FLEX */}
      <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1.4fr] min-w-0">

        {/* 1. TOTAL SPENDING */}
        <div className="flex flex-col gap-3 pr-6 border-r border-[var(--border)] min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Total Cumulative Spending
          </span>

          {isLoading ? (
            <SkeletonVal wide />
          ) : (
            <div className="flex items-baseline gap-2 flex-wrap min-w-0">
              <span className="text-[clamp(1.2rem,1.6vw,1.9rem)] font-bold text-[var(--color-text-primary)] tracking-tight leading-none break-all">
                ₹{totalSpending.toLocaleString()}
              </span>

              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black shrink-0 ${isNegativeChange
                    ? "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
                    : "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                  }`}
              >
                {isNegativeChange ? (
                  <ArrowDown size={12} strokeWidth={2.5} />
                ) : (
                  <ArrowUp size={12} strokeWidth={2.5} />
                )}
                {change >= 0 ? "+" : ""}
                {change.toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* 2. INCOME */}
        <div className="flex flex-col gap-3 px-6 border-r border-[var(--border)] min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Total Income
          </span>

          {isLoading ? (
            <SkeletonVal />
          ) : (
            <span className="text-[clamp(0.8rem,1.2vw,1.4rem)] font-semibold text-[var(--color-success)] tracking-tight leading-none break-all">
              ₹{totalIncome.toLocaleString()}
            </span>
          )}
        </div>

        {/* 3. SAVINGS */}
        <div className="flex flex-col gap-3 px-6 border-r border-[var(--border)] min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Total Savings
          </span>

          {isLoading ? (
            <SkeletonVal />
          ) : (
            <span className="text-[clamp(0.8rem,1.2vw,1.4rem)] font-semibold text-[var(--color-success)] tracking-tight leading-none break-all">
              ₹{totalSavings.toLocaleString()}
            </span>
          )}
        </div>

        {/* 4. AVG DAILY */}
        <div className="flex flex-col gap-3 px-6 border-r border-[var(--border)] min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Avg Daily Spend
          </span>

          {isLoading ? (
            <SkeletonVal />
          ) : (
            <span className="text-[clamp(0.8rem,1.2vw,1.4rem)] font-semibold text-[var(--color-text-primary)] tracking-tight leading-none break-all">
              ₹{avgDaily.toLocaleString()}
            </span>
          )}
        </div>

        {/* 5. RIGHT BLOCK */}
        <div className="flex items-stretch gap-0 pl-6 min-w-0">

          {/* Efficiency */}
          <div className="flex flex-col gap-3 pr-6 border-r border-[var(--border)] min-w-0">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-success)]">
              Efficiency
            </span>

            {isLoading ? (
              <div className="h-7 w-16 bg-[var(--color-text-secondary)]/10 rounded animate-pulse mt-1" />
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[clamp(1rem,1.4vw,1.6rem)] font-semibold text-[var(--color-text-primary)] leading-none">
                  {efficiency}
                </span>
                <ArrowUpRight
                  size={16}
                  className="text-[var(--color-success)]"
                  strokeWidth={2.5}
                />
              </div>
            )}
          </div>

          {/* Budget */}
          <div className="flex flex-col gap-2 pl-6 justify-center min-w-0">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              Budget Used
            </span>

            {isLoading ? (
              <div className="h-2 w-full bg-[var(--color-text-secondary)]/10 rounded-full animate-pulse" />
            ) : (
              <>
                <div className="w-full h-2 bg-[var(--color-text-secondary)]/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-success)] rounded-full transition-all duration-1000"
                    style={{ width: `${safeBudget}%` }}
                  />
                </div>

                <span className="text-[clamp(0.8rem,1vw,1rem)] font-black text-[var(--color-text-primary)] break-all">
                  {safeBudget}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {DesktopHero}
      {MobileHero}
    </>
  );
}