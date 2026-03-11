export default function BudgetUsageCard() {

  const percent = 64;

  return (
    <div className="analytics-card">

      <p className="text-xs text-[var(--color-text-secondary)]">
        Budget Used
      </p>

      <h2 className="text-2xl font-semibold mt-1 text-[var(--color-text-primary)]">
        {percent}%
      </h2>

      <div className="mt-4 h-2 rounded-full bg-[var(--border)] overflow-hidden">

        <div
          className="
          h-full
          rounded-full
          bg-gradient-to-r
          from-[var(--color-primary)]
          to-[var(--color-warm)]
          transition-all duration-700
          "
          style={{ width: `${percent}%` }}
        />

      </div>

    </div>
  );
}