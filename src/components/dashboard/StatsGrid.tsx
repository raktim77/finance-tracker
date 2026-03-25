import { TrendingUp, TrendingDown, Target, CircleDollarSign } from "lucide-react";
import { StatCard } from "./StatCard";

export const StatsGrid = () => {
  return (
    <div className="relative z-10">
      <div className="relative z-20 mb-3">
        <div className="inline-flex items-baseline gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--border)] backdrop-blur-md">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)]">
            Current Month Overview
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <StatCard label="Income" amount="₹45,000" icon={TrendingUp} color="#16A34A" />
        <StatCard label="Expenses" amount="₹18,200" icon={TrendingDown} color="#EF4444" />
        <StatCard label="Savings" amount="92%" icon={Target} color="#9333EA" />
        <StatCard label="Budget Left" amount="₹26,800" icon={CircleDollarSign} color="#32a59e" />
      </div>
    </div>
  );
};