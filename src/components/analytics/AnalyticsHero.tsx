import { TrendingUp } from "lucide-react";
import formatCompactCurrency from "../../utils/getCompactAmount";

type AnalyticsHeroProps = {
  data?: {
    totalSpending: number;
    spendingChangePercent: number;
    efficiency: "High" | "Moderate" | "Low";
    budgetUsedPercent: number;
  };
  isLoading: boolean;
};

export function AnalyticsHero({ data, isLoading }: AnalyticsHeroProps) {
  const totalSpending = data?.totalSpending ?? 0;
  const change = data?.spendingChangePercent ?? 0;
  const efficiency = data?.efficiency ?? "High";
  const budgetUsed = data?.budgetUsedPercent ?? 0;
  const safeBudget = Math.min(budgetUsed, 100);

  return (<div className="relative w-full max-w-full"> <div className="relative z-0 group overflow-hidden rounded-[2.5rem] p-6 md:p-12 bg-gradient-to-br from-[#7c6cff] via-[#9c7cff] to-[#c084fc] shadow-2xl/50 transition-all duration-500"> <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none"> <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-[60px] md:blur-[80px] -mr-16 -mt-16 md:-mr-32 md:-mt-32 animate-pulse" /> </div>

    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:gap-12 text-white">

      {/* LEFT */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">
          Total Cumulative Spending
        </span>

        <div className="flex items-baseline gap-2">

          {isLoading ? (
            <>
              {/* Amount skeleton */}
              <div className="h-9 md:h-14 w-40 md:w-64 bg-white/30 rounded-lg animate-pulse" />

              {/* Change badge skeleton */}
              <div className="h-6 w-16 bg-white/30 rounded-lg animate-pulse" />
            </>
          ) : (
            <>
              <span className="text-3xl md:text-5xl font-black tracking-tighter md:block hidden">
                ₹{totalSpending.toLocaleString()}
              </span>
              <span className="text-3xl md:text-5xl font-black tracking-tighter md:hidden block">
                ₹{formatCompactCurrency(totalSpending)}
              </span>

              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg backdrop-blur-md">
                <TrendingUp size={14} />
                <span className="text-xs font-bold">
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6 bg-black/10 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-inner shrink-0 w-full md:w-auto justify-between md:justify-start">

        {/* Efficiency */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black uppercase text-white/50 tracking-widest text-left">
            Efficiency
          </span>

          {isLoading ? (
            <div className="h-7 w-16 bg-white/30 rounded-md animate-pulse" />
          ) : (
            <span className="text-xl font-bold">{efficiency}</span>
          )}
        </div>

        <div className="w-px h-10 bg-white/10" />

        {/* Budget */}
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase text-white/50 tracking-widest text-left">
            Budget Remaining
          </span>

          <div className="w-24 md:w-32 h-2 bg-white/30 rounded-full overflow-hidden">
            {isLoading ? (
              <div className="h-full w-full bg-white/30 animate-pulse" />
            ) : (
              <div
                className="h-full bg-white transition-all duration-1000"
                style={{ width: `${safeBudget}%` }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>

  );
}
