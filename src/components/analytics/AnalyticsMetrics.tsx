import { Zap, Target, PieChart as PieIcon, PiggyBank, BanknoteArrowUp } from "lucide-react";

type AnalyticsMetricsProps = {
    data?: {
        thisMonthSpending: number;
        totalSavings: number;
        avgDailySpending: number;
        budgetUsedPercent: number;
        totalIncome: number;
    };
    isLoading: boolean;
};

export function AnalyticsMetrics({ data }: AnalyticsMetricsProps) {
    const thisMonth = data?.thisMonthSpending ?? 0;
    const savings = data?.totalSavings ?? 0;
    const avgDaily = data?.avgDailySpending ?? 0;
    const budgetUsed = data?.budgetUsedPercent ?? 0;
    const totalIncome = data?.totalIncome ?? 0;
    return (
        <div className="relative z-10 -mt-11 md:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">

                {/* Card 4: Budget Used */}
                <div className="bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:scale-[1.02] transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shadow-inner shrink-0">
                        <BanknoteArrowUp size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0 gap-1">
                        <span className="text-[8px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest truncate">Total income</span>
                        <span className="text-sm md:text-xl font-black text-[var(--color-text-primary)] truncate">₹{totalIncome.toLocaleString()}</span>
                    </div>
                </div>
                

                {/* Card 2: Total Savings */}
                <div className="bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:scale-[1.02] transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)] shadow-inner shrink-0">
                        <PiggyBank size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0 gap-1">
                        <span className="text-[8px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest truncate">Total Savings</span>
                        <span className="text-sm md:text-xl font-black text-[var(--color-success)] truncate">₹{savings.toLocaleString()}</span>
                    </div>
                </div>
                {/* Card 1: This Month */}
                <div className="bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:scale-[1.02] transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)] shadow-inner shrink-0">
                        <Zap size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0 gap-1 ">
                        <span className="text-[8px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest truncate">This Month spend</span>
                        <span className="text-sm md:text-xl font-black text-[var(--color-text-primary)] truncate">₹{thisMonth.toLocaleString()}</span>
                    </div>
                </div>

                {/* Card 3: Avg Daily */}
                <div className="bg-[var(--color-surface)] border border-[var(--border)] p-4 md:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 hover:scale-[1.02] transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[var(--color-warm)]/10 flex items-center justify-center text-[var(--color-warm)] shadow-inner shrink-0">
                        <Target size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0 gap-1">
                        <span className="text-[8px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest truncate">Avg Daily spend</span>
                        <span className="text-sm md:text-xl font-black text-[var(--color-text-primary)] truncate">₹{avgDaily.toLocaleString()}</span>
                    </div>
                </div>

                

            </div>
        </div>
    );
}
