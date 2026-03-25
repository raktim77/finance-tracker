import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label?: string;
  amount?: string;
  icon?: LucideIcon;
  color?: string;
  isLoading?: boolean;
}

export const StatCard = ({
  label,
  amount,
  icon: Icon,
  color,
  isLoading,
}: StatCardProps) => (
  <div className="group p-4 md:p-5 rounded-2xl bg-[var(--color-surface)] 
    border border-[var(--border)] shadow-sm
    flex flex-col sm:flex-row items-center gap-3 md:gap-4
    transition-all duration-200"
  >
    {/* 🔹 Icon */}
    <div
      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${
        isLoading ? "bg-[var(--color-text-secondary)]/10 animate-pulse" : ""
      }`}
      style={
        !isLoading
          ? { backgroundColor: `${color}15`, color }
          : undefined
      }
    >
      {!isLoading && Icon && (
        <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
      )}
    </div>

    {/* 🔹 Text */}
    <div className="flex flex-col items-center sm:items-start min-w-0 w-full">

      {/* Label */}
      {isLoading ? (
        <div className="h-3 w-16 bg-[var(--color-text-secondary)]/10 rounded animate-pulse mb-1" />
      ) : (
        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] truncate w-full text-center sm:text-left">
          {label}
        </span>
      )}

      {/* Amount */}
      {isLoading ? (
        <div className="h-5 w-24 bg-[var(--color-text-secondary)]/10 rounded animate-pulse" />
      ) : (
        <span className="text-base md:text-xl font-black text-[var(--color-text-primary)] truncate w-full text-center sm:text-left">
          {amount}
        </span>
      )}
    </div>
  </div>
);