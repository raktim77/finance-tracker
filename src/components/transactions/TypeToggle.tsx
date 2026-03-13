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
return ( <div className="flex justify-center"> <div className="flex rounded-xl bg-[var(--color-surface)] p-1">
{types.map((t) => {
const active = value === t.value;


      return (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`
            px-4 py-2 text-sm font-medium rounded-lg transition
            ${active
              ? "bg-[var(--color-accent)] text-white"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}
          `}
        >
          {t.label}
        </button>
      );
    })}
  </div>
</div>


);
}
