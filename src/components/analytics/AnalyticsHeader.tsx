import { Calendar, ChevronDown } from "lucide-react";

export function AnalyticsHeader() {
  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-4">
      <div className="flex flex-col gap-4 w-full md:w-auto">
        <h2 className="text-3xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">
          Analytics
        </h2>
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-[var(--color-accent)]" />
          <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] opacity-60">
            JAN 2026 - JUN 2026 OVERVIEW
          </p>
        </div>
      </div>

      <button className="group flex items-center justify-between md:justify-start gap-2 w-full md:w-auto px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-[var(--color-surface)] border border-[var(--border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all active:scale-95 shadow-sm">
        <span>Last 6 Months</span>
        <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}
