import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type Props = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  align?: "left" | "right"; // Added to handle mobile/desktop positioning
};

export default function DatePicker({ value, onChange, align = "left" }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full min-w-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 pl-3 pr-3 h-11 bg-[var(--color-surface)] border border-[var(--input-border)] rounded-xl text-[11px] font-bold text-[var(--color-text-primary)] transition-all hover:border-[var(--color-accent)]/50"
      >
        <Calendar size={14} className="text-[var(--color-text-secondary)] shrink-0" />
        <span className="truncate text-xs">
          {value ? value.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "Select date"}
        </span>
      </button>

      {open && (
        <div
          className={`
            border border-[var(--color-warm)] shadow-sm 
            absolute top-full mt-2 z-[100] 
            bg-[var(--color-surface)] 
            rounded-2xl p-2 animate-in fade-in zoom-in-95 duration-200
            /* Responsive Alignment */
            ${align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"}
            /* Mobile adjustment: center it if it's too wide */
            max-sm:fixed max-sm:top-1/2 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:-translate-y-1/2 max-sm:mt-0
          `}
        >
          {/* Mobile Overlay Background */}
          <div className="hidden max-sm:block fixed inset-0  -z-10" onClick={() => setOpen(false)} />

          <div className="custom-day-picker">
            <DayPicker
              mode="single"
              selected={value}
              onSelect={(date) => {
                onChange(date);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Internal CSS to shrink the picker for mobile */}
      <style>{`
        .custom-day-picker .rdp {
          --rdp-cell-size: 38px;
          --rdp-accent-color: var(--color-accent);
          --rdp-background-color: var(--color-accent-soft);
          margin: 0;
        }
        @media (max-width: 640px) {
          .custom-day-picker .rdp {
            --rdp-cell-size: 34px;
          }
        }
        .rdp-months { justify-content: center; }
        .rdp-day_selected { background-color: var(--color-accent) !important; font-weight: bold; }
      `}</style>
    </div>
  );
}