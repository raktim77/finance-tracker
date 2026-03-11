export default function SmartInsights() {

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-xl p-5 space-y-3">

      <h3 className="text-sm text-[var(--color-text-secondary)]">
        Smart Insights
      </h3>

      <p className="text-sm text-[var(--color-text-primary)]">
        ⚠ You spent <b>32% more</b> on food this month
      </p>

      <p className="text-sm text-[var(--color-text-primary)]">
        📉 Transport expenses dropped by <b>12%</b>
      </p>

      <p className="text-sm text-[var(--color-text-primary)]">
        💡 Reducing dining out could save ₹2000/month
      </p>

    </div>
  );
}