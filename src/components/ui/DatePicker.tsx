import { useState } from "react";
import { Calendar } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type Props = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
};

export default function DatePicker({ value, onChange, }: Props) {

  const [open, setOpen] = useState(false);

  return (<div className="relative w-full">

    <button
      onClick={() => setOpen(!open)}
      className="w-full flex items-center gap-3 pl-[10px] pr-3 h-11 bg-[var(--color-surface)] border border-[var(--input-border)] rounded-xl text-xs font-bold text-[var(--color-text-primary)]"
    >

      <Calendar size={16} className="text-[var(--color-text-secondary)]" />

      {value
        ? value.toLocaleDateString()
        : "Select date"}

    </button>

    {open && (
      <div className="absolute top-full left-0 mt-2 z-50 bg-[var(--color-surface)] border border-[var(--input-border)] rounded-xl shadow-xl p-3">

        <DayPicker
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
        />

      </div>
    )}

  </div>

  );
}
