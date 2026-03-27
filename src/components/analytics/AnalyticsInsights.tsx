import { TrendingDown, Zap, Lightbulb, AlertTriangle } from "lucide-react";

export function AnalyticsInsights() {
  return (
    <div className="lg:col-span-6 rounded-[2rem] p-6 bg-[var(--color-surface)] border border-[var(--border)] shadow-sm relative overflow-hidden">
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[var(--color-accent)] opacity-5 blur-3xl rounded-full" />

      <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight mb-6 flex items-center gap-2">
        <Zap size={18} className="text-[var(--color-accent)]" /> AI Analytics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="flex gap-4 p-5 rounded-2xl bg-[var(--color-background)] border border-[var(--border)] hover:border-[var(--color-danger)]/30 transition-colors">
          <AlertTriangle className="text-[var(--color-danger)] shrink-0" size={20} />
          <p className="text-sm font-medium text-[var(--color-text-primary)] leading-relaxed">
            You spent <span className="font-black">32% more</span> on food this month. Consider reducing restaurant visits to stay on track.
          </p>
        </div>
        <div className="flex gap-4 p-5 rounded-2xl bg-[var(--color-background)] border border-[var(--border)] hover:border-[var(--color-success)]/30 transition-colors">
          <TrendingDown className="text-[var(--color-success)] shrink-0" size={20} />
          <p className="text-sm font-medium text-[var(--color-text-primary)] leading-relaxed">
            Efficiency is up! Transport expenses dropped by <span className="font-black">12%</span> compared to your 3-month average.
          </p>
        </div>
        <div className="flex gap-4 p-5 rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 shadow-sm">
          <Lightbulb className="text-[var(--color-accent)] shrink-0" size={20} />
          <p className="text-sm font-black text-[var(--color-accent)] leading-relaxed">
            Strategy: Reducing dining out could save you approximately ₹2,000 by the end of next month.
          </p>
        </div>
      </div>
    </div>
  );
}
