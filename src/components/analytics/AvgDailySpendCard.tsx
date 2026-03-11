export default function AvgDailySpendCard() {

  const avg = 280;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-xl p-4">

      <p className="text-sm text-[var(--color-text-secondary)]">
        Avg Daily
      </p>

      <h2 className="text-xl font-semibold mt-2 text-[var(--color-text-primary)]">
        ₹{avg}
      </h2>

    </div>
  );
}