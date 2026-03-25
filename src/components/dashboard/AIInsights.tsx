import { Sparkles, AlertTriangle, Brain, TrendingUp } from "lucide-react";

export function AIInsights() {
  return (
    <div className="h-full rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all flex flex-col gap-6">
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center">
          <Sparkles size={18} className="text-[var(--color-accent)]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[var(--color-text-primary)]">
            AI Insights
          </span>
          <span className="text-xs text-[var(--color-text-secondary)]">
            Smart spending analysis
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5 text-sm">
        <div className="flex gap-3">
          <TrendingUp size={18} className="text-[var(--color-success)] mt-[2px]" />
          <p className="text-[var(--color-text-primary)] leading-relaxed">
            Your <strong>food spending increased 32%</strong> compared to last week.
          </p>
        </div>

        <div className="flex gap-3">
          <Brain size={18} className="text-[var(--color-accent)] mt-[2px]" />
          <p className="text-[var(--color-text-primary)] leading-relaxed">
            Your <strong>highest spending day was Wednesday</strong> with ₹9,800 spent.
          </p>
        </div>

        <div className="flex gap-3">
          <AlertTriangle size={18} className="text-[var(--color-warm)] mt-[2px]" />
          <p className="text-[var(--color-text-primary)] leading-relaxed">
            At this pace your <strong>monthly spending may reach ₹41,200</strong>.
          </p>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-gradient-to-r from-[var(--color-accent-soft)] to-transparent border border-[var(--color-accent)]/20 flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
          Monthly Forecast
        </span>
        <span className="text-2xl font-black text-[var(--color-text-primary)]">
          ₹18,400
        </span>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          Estimated remaining balance by the end of this month based on current spending trends.
        </p>
      </div>

    </div>
  );
}