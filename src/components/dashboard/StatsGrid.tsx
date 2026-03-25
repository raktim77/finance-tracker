import { TrendingUp, TrendingDown, Target, CircleDollarSign } from "lucide-react";
import { StatCard } from "./StatCard";
import type { DashboardSummaryResponse } from "../../features/dashboard/types/dashboard.types";

type Props = {
    data?: DashboardSummaryResponse;
    isLoading: boolean;
};

export const StatsGrid = ({ data, isLoading }: Props) => {
    return (
        <div className="relative z-10">
            {/* Header */}
            <div className="relative z-20 mb-3">
                <div className="inline-flex items-baseline gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--border)] backdrop-blur-md">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)]">
                        Monthly Overview
                    </span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">

                {/* 🔥 Skeleton */}
                {isLoading && (
                    <>
                        <StatCard isLoading />
                        <StatCard isLoading />
                        <StatCard isLoading />
                        <StatCard isLoading />
                    </>
                )}

                {/* ✅ Real Data */}
                {!isLoading && data && (
                    <>
                        <StatCard
                            label="Income"
                            amount={`₹${data.summary.income.toLocaleString()}`}
                            icon={TrendingUp}
                            color="#16A34A"
                        />

                        <StatCard
                            label="Expenses"
                            amount={`₹${data.summary.expenses.toLocaleString()}`}
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
                                    ? `₹${data.summary.budget_left.toLocaleString()}`
                                    : "—"
                            }
                            icon={CircleDollarSign}
                            color="#32a59e"
                        />
                    </>
                )}

            </div>
        </div>
    );
};