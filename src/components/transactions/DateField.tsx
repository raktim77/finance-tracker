import { useState } from "react";
import { CalendarDays } from "lucide-react";
import DatePicker from "../ui/DatePicker";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export default function DateField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-40 ml-1">
        Date
      </label>

      <div className="flex items-center gap-4 px-5 py-4 bg-[var(--color-background)] rounded-[1.25rem] border border-[var(--border)] hover:border-[var(--color-accent)]/30 transition-all duration-300">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 shrink-0 bg-[var(--color-surface)] text-[var(--color-accent)]"
        >
          <CalendarDays size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <DatePicker
            value={value}
            onChange={(d) => {
              if (d) onChange(d);
            }}
            showIcon={false}
            open={open}
            onOpenChange={setOpen}
            modalMode
          />
        </div>
      </div>
    </div>
  );
} 