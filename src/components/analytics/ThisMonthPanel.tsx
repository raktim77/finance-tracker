import formatCompactCurrency from "../../utils/getCompactAmount";

type ThisMonthPanelProps = {
  data?: {
    spent: number;
    income: number;
    savings: number;
    savingsRate: number;
    daysRemaining: number;
  };
  isLoading: boolean;
};

export function ThisMonthPanel({ data, isLoading }: ThisMonthPanelProps) {
  const spend = data?.spent ?? 0;
  const income = data?.income ?? 0;
  const savings = data?.savings ?? 0;
  const savingsRate = data?.savingsRate ?? 0;
  const daysRemaining = data?.daysRemaining ?? 0;

  const Skeleton = ({ w = "w-16", h = "h-5" }: { w?: string; h?: string }) => (
    <div className={`${h} ${w} bg-[var(--color-text-secondary)]/10 rounded-md animate-pulse`} />
  );

  return (
    <div className="lg:col-span-2 rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between md:mb-4 mb-6">
        <h3 className="font-bold text-base md:text-lg text-[var(--color-text-primary)] tracking-tight text-left">
          This Month
        </h3>
        
      </div>

      {/* Big spend number */}
      <div className="flex flex-col items-center justify-center flex-1 pb-4 gap-1">
        {isLoading ? (
          <Skeleton w="w-24" h="h-8" />
        ) : (
          <span className="text-[clamp(1.5rem,1.6vw,1.9rem)] font-semibold text-[var(--color-text-primary)] tracking-tighter leading-none break-all">
            ₹{formatCompactCurrency(spend)}
          </span>
        )}
        <span className="text-xs font-bold text-[var(--color-text-secondary)] mt-1">
          Spent so far
        </span>
      </div>

      {/* Sub-metrics grid */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {/* Income */}
        <div className="border border-[var(--border)] rounded-xl p-4 flex items-center gap-2 bg-[var(--color-background)]/40">
          {/* <div className="w-7 h-7 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)] shrink-0">
            <Wallet size={13} strokeWidth={2.5} />
          </div> */}
          <div className="flex flex-col min-w-0 gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] truncate">
              Income
            </span>
            {isLoading ? (
              <Skeleton w="w-10" h="h-4" />
            ) : (
              <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                ₹{formatCompactCurrency(income)}
              </span>
            )}
          </div>
        </div>

        {/* Savings */}
        <div className="border border-[var(--border)] rounded-xl p-4 flex items-center gap-2 bg-[var(--color-background)]/40">
          {/* <div className="w-7 h-7 rounded-lg bg-[var(--color-danger)]/10 flex items-center justify-center text-[var(--color-danger)] shrink-0">
            <CirclePower size={13} strokeWidth={2.5} />
          </div> */}
          <div className="flex flex-col min-w-0 gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] truncate">
              Savings
            </span>
            {isLoading ? (
              <Skeleton w="w-10" h="h-4" />
            ) : (
              <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                ₹{formatCompactCurrency(savings)}
              </span>
            )}
          </div>
        </div>

        {/* Savings Rate */}
        <div className="border border-[var(--border)] rounded-xl p-4 flex items-center gap-2 bg-[var(--color-background)]/40">
          {/* <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
            <PercentCircle size={13} strokeWidth={2.5} />
          </div> */}
          <div className="flex flex-col min-w-0 gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] truncate">
              Savings Rate
            </span>
            {isLoading ? (
              <Skeleton w="w-10" h="h-4" />
            ) : (
              <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                {savingsRate}%
              </span>
            )}
          </div>
        </div>

        {/* Days Remaining */}
        <div className="border border-[var(--border)] rounded-xl p-4 flex items-center gap-2 bg-[var(--color-background)]/40">
          {/* <div className="w-7 h-7 rounded-lg bg-[var(--color-warm)]/10 flex items-center justify-center text-[var(--color-warm)] shrink-0">
            <CalendarDays size={13} strokeWidth={2.5} />
          </div> */}
          <div className="flex flex-col min-w-0 gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] truncate">
              Days Remaining
            </span>
            {isLoading ? (
              <Skeleton w="w-10" h="h-4" />
            ) : (
              <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                {daysRemaining}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
