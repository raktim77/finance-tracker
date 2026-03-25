import { ChevronRight, type LucideIcon } from "lucide-react";

interface TransactionItemProps {
  name: string;
  category: string;
  date: string;
  amount: string;
  icon: LucideIcon;
  negative?: boolean;
}

export const TransactionItem = ({
  name,
  category,
  date,
  amount,
  icon: Icon,
  negative
}: TransactionItemProps) => (
  <div className="flex items-center justify-between group cursor-pointer py-1">
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-11 h-11 rounded-full bg-[var(--color-background)] border border-[var(--border)] flex items-center justify-center group-hover:bg-[var(--color-accent-soft)] transition-colors shrink-0">
        <Icon size={18} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-[var(--color-text-primary)] text-sm truncate">{name}</span>
        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-tighter truncate">
          {category} • {date}
        </span>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className={`font-black text-sm ${negative ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}>
        {amount}
      </span>
      <ChevronRight size={14} className="text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
    </div>
  </div>
);