import { Zap, Target, PieChart as PieIcon, PiggyBank } from "lucide-react";

type AnalyticsMetricsProps = {
    data?: {
        thisMonthSpending: number;
        totalSavings: number;
        avgDailySpending: number;
        budgetUsedPercent: number;
    };
    isLoading: boolean;
};

export function AnalyticsMetrics({ data }: AnalyticsMetricsProps) {
    const thisMonth = data?.thisMonthSpending ?? 0;
    const savings = data?.totalSavings ?? 0;
    const avgDaily = data?.avgDailySpending ?? 0;
    const budgetUsed = data?.budgetUsedPercent ?? 0;
    return (
        <div className="relative z-10 -mt-12 md:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">

                {/* Card 1: This Month */}
                <div className="bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:scale-[1.02] transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)] shadow-inner shrink-0">
                        <Zap size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0 gap-1 ">
                        <span className="text-[8px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest truncate">This Month</span>
                        <span className="text-sm md:text-xl font-black text-[var(--color-text-primary)] truncate">₹{thisMonth.toLocaleString()}</span>
                    </div>
                </div>

                {/* Card 2: Total Savings */}
                <div className="bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:scale-[1.02] transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)] shadow-inner shrink-0">
                        <PiggyBank size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0 gap-1">
                        <span className="text-[8px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest truncate">Total Savings</span>
                        <span className="text-sm md:text-xl font-black text-[var(--color-success)] truncate">₹{savings.toLocaleString()}</span>
                    </div>
                </div>

                {/* Card 3: Avg Daily */}
                <div className="bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:scale-[1.02] transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-warm)]/10 flex items-center justify-center text-[var(--color-warm)] shadow-inner shrink-0">
                        <Target size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0 gap-1">
                        <span className="text-[8px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest truncate">Avg Daily</span>
                        <span className="text-sm md:text-xl font-black text-[var(--color-text-primary)] truncate">₹{avgDaily.toLocaleString()}</span>
                    </div>
                </div>

                {/* Card 4: Budget Used */}
                <div className="bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:scale-[1.02] transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shadow-inner shrink-0">
                        <PieIcon size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0 gap-1">
                        <span className="text-[8px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest truncate">Budget Used</span>
                        <span className="text-sm md:text-xl font-black text-[var(--color-text-primary)] truncate">{budgetUsed.toFixed(0)}%</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
