import { motion } from "framer-motion";

type TransactionType = "expense" | "income" | "transfer";

type Props = {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
};

const types: { label: string; value: TransactionType }[] = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
  { label: "Transfer", value: "transfer" },
];

export default function TypeToggle({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Label for the section to match the "Card" design */}
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-40 ml-1">
        Transaction Type
      </span>

      <div className="relative flex p-1.5 bg-[var(--color-background)] rounded-2xl border border-[var(--border)] isolate overflow-hidden">
        {types.map((t) => {
          const active = value === t.value;

          return (
            <button
              key={`toggle-btn-${t.value}`} // Specific prefix
              onClick={() => onChange(t.value)}
              className={`
                relative flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-colors duration-300
                ${active 
                  ? "text-white" 
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] opacity-60 hover:opacity-100"
                }
              `}
            >
              {t.label}

              {/* The Sliding Pill */}
              {active && (
                <motion.div
                  layoutId="typeTogglePill"
                  className="absolute inset-0 bg-[var(--color-accent)] rounded-xl z-[-1]"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  style={{
                    boxShadow: "0 4px 12px rgba(var(--color-accent-rgb), 0.2)"
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}