export default function MonthlySpendCard() {

  const monthly = 8400;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-xl p-4">

      <p className="text-sm text-[var(--color-text-secondary)]">
        This Month
      </p>

      <h2 className="text-xl font-semibold mt-2 text-[var(--color-text-primary)]">
        ₹{monthly.toLocaleString()}
      </h2>

    </div>
  );
}