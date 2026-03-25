import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  amount: string;
  icon: LucideIcon;
  color: string;
}

export const StatCard = ({ label, amount, icon: Icon, color }: StatCardProps) => (
  <div className="group p-4 md:p-5 rounded-2xl bg-[var(--color-surface)] 
    border border-[var(--border)] shadow-sm
    flex flex-col sm:flex-row items-center sm:items-center gap-3 md:gap-4
    transition-all duration-200
    hover:-translate-y-[2px]
    hover:shadow-lg
    hover:border-[var(--color-accent)]/30"
  >
    <div
      className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-inner shrink-0"
      style={{ backgroundColor: `${color}15`, color }}
    >
      <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
    </div>

    <div className="flex flex-col items-center sm:items-start min-w-0 w-full">
      <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] truncate w-full text-center sm:text-left">
        {label}
      </span>
      <span className="text-base md:text-xl font-black text-[var(--color-text-primary)] truncate w-full text-center sm:text-left">
        {amount}
      </span>
    </div>
  </div>
);