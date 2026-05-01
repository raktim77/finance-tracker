import { CalendarDays, Percent, Power, Wallet } from "lucide-react";

type AnalyticsMetricsProps = {
  data?: {
    thisMonthSpending: number;
    totalSavings: number;
    avgDailySpending: number;
    budgetUsedPercent: number;
    totalIncome: number;
    efficiency: "High" | "Moderate" | "Low";
    spendingChangePercent: number;
  };
  isLoading: boolean;
};

const fmt = (value: number) => `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;

export function AnalyticsMetrics({ data, isLoading }: AnalyticsMetricsProps) {
  const totalSpending = data?.thisMonthSpending ?? 0;
  const totalIncome = data?.totalIncome ?? 0;
  const totalSavings = data?.totalSavings ?? 0;
  const avgDaily = data?.avgDailySpending ?? 0;
  const efficiency = data?.efficiency ?? "High";
  const budgetUsedPercent = Math.max(0, Math.min(data?.budgetUsedPercent ?? 0, 100));
  const budgetLeft = Math.round(100 - budgetUsedPercent);

  return (
    <div className="lg:hidden flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--color-surface)] p-4">
          <p className="text-[0.68rem] uppercase tracking-[0.08em] font-black text-[var(--color-text-secondary)]/80">Cumulative Spending</p>
          <p className="mt-2 text-[2.95rem] leading-[0.95] font-black text-[var(--color-text-primary)]">{isLoading ? "..." : fmt(totalSpending)}</p>
          <span className="mt-3 inline-flex rounded-xl bg-[#3A1010] px-2 py-1 text-[0.62rem] font-black text-[#FF4D4D]">↘ -66.8%</span>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--color-surface)] p-4">
          <p className="text-[0.68rem] uppercase tracking-[0.08em] font-black text-[var(--color-text-secondary)]/80">Total Income</p>
          <p className="mt-2 text-[2.95rem] leading-[0.95] font-black text-[var(--color-success)]">{isLoading ? "..." : fmt(totalIncome)}</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--color-surface)] p-4">
          <p className="text-[0.68rem] uppercase tracking-[0.08em] font-black text-[var(--color-text-secondary)]/80">Total Savings</p>
          <p className="mt-2 text-[2.95rem] leading-[0.95] font-black text-[var(--color-success)]">{isLoading ? "..." : fmt(totalSavings)}</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--color-surface)] p-4">
          <p className="text-[0.68rem] uppercase tracking-[0.08em] font-black text-[var(--color-text-secondary)]/80">Avg Daily Spend</p>
          <p className="mt-2 text-[2.95rem] leading-[0.95] font-black text-[var(--color-text-primary)]">{isLoading ? "..." : fmt(avgDaily)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--color-surface)] p-4">
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="pr-3 border-r border-[var(--border)]">
            <p className="text-[0.68rem] uppercase tracking-[0.08em] font-black text-[#8CDF72]">Efficiency</p>
            <p className="mt-1 text-[2.7rem] font-black text-[#3AE374]">{isLoading ? "--" : efficiency}</p>
          </div>
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.08em] font-black text-[var(--color-text-secondary)]/80">Budget Left</p>
            <div className="mt-3 h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[var(--color-accent)] rounded-full" style={{ width: `${budgetLeft}%` }} />
            </div>
            <p className="mt-1 text-[2rem] font-black text-[var(--color-success)]">{isLoading ? "--" : `${budgetLeft}%`}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--color-surface)] p-4">
        <h3 className="text-[2rem] font-black text-[var(--color-text-primary)]">This Month</h3>
        <p className="mt-2 text-center text-[4.2rem] leading-none font-black text-[var(--color-text-primary)]">₹0</p>
        <p className="text-center text-[1.2rem] text-[var(--color-text-secondary)]">Spend so far</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { label: "Income", value: "₹0", icon: Wallet, tone: "text-[#33E06A]", bg: "bg-[#12301b]" },
            { label: "Expenses", value: "₹0", icon: Power, tone: "text-[#FF4D4D]", bg: "bg-[#341418]" },
            { label: "Savings Rate", value: "0%", icon: Percent, tone: "text-[#33E06A]", bg: "bg-[#12301b]" },
            { label: "Days Left", value: "15", icon: CalendarDays, tone: "text-[#FF9F40]", bg: "bg-[#322316]" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[var(--border)] bg-[var(--color-background)]/35 p-3.5">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${item.bg}`}>
                  <item.icon size={16} className={item.tone} />
                </div>
                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">{item.label}</p>
                  <p className="text-[1.15rem] font-black text-[var(--color-text-primary)]">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
