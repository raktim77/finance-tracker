import { ArrowUpRight } from "lucide-react";

export default function TotalSpendCard() {

  const total = 48200;

  return (
    <div className="analytics-card">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Total Spending
          </p>

          <h2 className="text-2xl font-semibold mt-1 text-[var(--color-text-primary)]">
            ₹{total.toLocaleString()}
          </h2>
        </div>

        <div
          className="
          w-8 h-8
          flex items-center justify-center
          rounded-md
          bg-[var(--color-accent-soft)]
          text-[var(--color-primary)]
          "
        >
          <ArrowUpRight size={16} />
        </div>

      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">

        <span className="text-[var(--color-success)] font-medium">
          +12.4%
        </span>

        <span className="text-[var(--color-text-secondary)]">
          vs last month
        </span>

      </div>

    </div>
  );
}