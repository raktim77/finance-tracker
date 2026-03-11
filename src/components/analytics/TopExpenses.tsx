export default function TopExpenses() {

  const expenses = [
    { name: "Swiggy", amount: 1200 },
    { name: "Amazon", amount: 2400 },
    { name: "Uber", amount: 800 }
  ];

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--border)] rounded-xl p-5">

      <h3 className="text-sm mb-4 text-[var(--color-text-secondary)]">
        Top Expenses
      </h3>

      <div className="space-y-3">

        {expenses.map((e, i) => (
          <div key={i} className="flex justify-between text-sm">

            <span className="text-[var(--color-text-primary)]">
              {e.name}
            </span>

            <span className="text-[var(--color-text-secondary)]">
              ₹{e.amount}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}