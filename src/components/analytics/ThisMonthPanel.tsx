type ThisMonthPanelProps = {
  data?: {
    thisMonthSpending: number;
    thisMonthIncome: number;
    thisMonthExpenses: number;
    savingsRate: number;
    daysRemaining: number;
  };
  isLoading: boolean;
};

export function ThisMonthPanel({ data, isLoading }: ThisMonthPanelProps) {
  const spend = data?.thisMonthSpending ?? 0;
  const income = data?.thisMonthIncome ?? 0;
  const expenses = data?.thisMonthExpenses ?? 0;
  const savingsRate = data?.savingsRate ?? 0;
  const daysRemaining = data?.daysRemaining ?? 0;

  const Skeleton = ({ w = "w-16", h = "h-5" }: { w?: string; h?: string }) => (
    <div className={`${h} ${w} bg-[var(--color-text-secondary)]/10 rounded-md animate-pulse`} />
  );

  return (
    <div className="lg:col-span-2 rounded-2xl p-4 bg-[var(--color-surface)] border border-[var(--border)] shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-[var(--color-text-primary)] tracking-tight text-left">
          This Month
        </h3>
        
      </div>

      {/* Big spend number */}
      <div className="flex flex-col items-center justify-center flex-1 pb-4 gap-1">
        {isLoading ? (
          <Skeleton w="w-24" h="h-12" />
        ) : (
          <span className="text-[clamp(1.2rem,2vw,2.1rem)] font-black text-[var(--color-text-primary)] tracking-tighter leading-none break-all">
            ₹{spend.toLocaleString()}
          </span>
        )}
        <span className="text-xs font-bold text-[var(--color-text-secondary)] opacity-60 mt-1">
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
              <span className="text-sm font-black text-[var(--color-text-primary)] truncate">
                ₹{income.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Expenses */}
        <div className="border border-[var(--border)] rounded-xl p-4 flex items-center gap-2 bg-[var(--color-background)]/40">
          {/* <div className="w-7 h-7 rounded-lg bg-[var(--color-danger)]/10 flex items-center justify-center text-[var(--color-danger)] shrink-0">
            <CirclePower size={13} strokeWidth={2.5} />
          </div> */}
          <div className="flex flex-col min-w-0 gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] truncate">
              Expenses
            </span>
            {isLoading ? (
              <Skeleton w="w-10" h="h-4" />
            ) : (
              <span className="text-sm font-black text-[var(--color-text-primary)] truncate">
                ₹{expenses.toLocaleString()}
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
              <span className="text-sm font-black text-[var(--color-text-primary)] truncate">
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
              <span className="text-sm font-black text-[var(--color-text-primary)] truncate">
                {daysRemaining}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}