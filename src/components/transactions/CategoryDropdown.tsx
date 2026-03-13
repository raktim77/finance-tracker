import { useMemo } from "react";

export type Category = {
_id: string;
name: string;
icon: string;
color: string;
type: "expense" | "income";
};

type Props = {
categories: Category[];
type: "expense" | "income" | "transfer";
value: string | null;
onChange: (id: string) => void;
};

export default function CategoryDropdown({
categories,
type,
value,
onChange,
}: Props) {
const filtered = useMemo(() => {
if (type === "transfer") return [];
return categories.filter((c) => c.type === type);
}, [categories, type]);

const selected = filtered.find((c) => c._id === value);

if (type === "transfer") return null;

return ( <div className="space-y-2"> <label className="text-sm text-[var(--color-text-secondary)]">
Category </label>


  <div className="border border-[var(--border)] rounded-xl p-3 bg-[var(--color-surface)]">
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent outline-none"
    >
      <option value="">Select category</option>

      {filtered.map((cat) => (
        <option key={cat._id} value={cat._id}>
          {cat.icon} {cat.name}
        </option>
      ))}
    </select>
  </div>

  {selected && (
    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: selected.color }}
      />
      Selected: {selected.name}
    </div>
  )}
</div>


);
}
