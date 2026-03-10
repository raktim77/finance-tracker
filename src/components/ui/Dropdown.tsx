import { useState, useRef, useEffect } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

type DropdownProps = {
  icon?: LucideIcon;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
};

export default function Dropdown({
  icon: Icon,
  value,
  options,
  onChange,
  className
}: DropdownProps) {

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);

  }, []);

  return (

    <div ref={ref} className={`relative ${className}`}>

      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between pl-9 pr-3 h-11 bg-[var(--color-surface)] border border-[var(--input-border)] rounded-xl text-[12px] font-bold transition-all hover:border-[var(--color-accent)]/30"
      >

        <div className="flex items-center gap-2">

          {Icon && (
            <Icon
              size={14}
              className="absolute left-3 text-[var(--color-text-secondary)]"
            />
          )}

          <span>{selected?.label}</span>

        </div>

        <ChevronRight
          size={14}
          className={`transition-transform ${open ? "rotate-[-90deg]" : "rotate-90"} text-[var(--color-text-secondary)]`}
        />

      </button>


      {/* Dropdown Menu */}
      {open && (

        <div className="absolute top-full left-0 mt-2 w-full bg-[var(--color-surface)] border border-[var(--input-border)] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">

          {options.map((option) => (

            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-[var(--color-background)] transition-colors ${value === option.value ? "text-[var(--color-accent)]" : ""
                }`}
            >

              {option.label}

            </button>

          ))}

        </div>

      )}

    </div>

  );
}
