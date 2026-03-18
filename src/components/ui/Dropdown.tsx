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
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  compact?: boolean;
};

export default function Dropdown({
  icon: Icon,
  value,
  options,
  onChange,
  className,
  buttonClassName,
  menuClassName,
  optionClassName,
  compact = false,
}: DropdownProps) {

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!open) return;

    selectedOptionRef.current?.scrollIntoView({
      block: "nearest",
    });
  }, [open, value]);

  return (

    <div ref={ref} className={`relative ${className}`}>

      {/* Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between bg-[var(--color-surface)] border border-[var(--input-border)] font-bold transition-all hover:border-[var(--color-accent)]/30 ${compact
          ? "pl-3 pr-2 h-9 rounded-lg text-[13px]"
          : "pl-9 pr-3 h-11 rounded-xl text-[12px]"
          } ${buttonClassName ?? ""}`}
      >

        <div className="flex items-center gap-2">

          {Icon && (
            <Icon
              size={14}
              className={`absolute text-[var(--color-text-secondary)] ${compact ? "left-2.5" : "left-3"
                }`}
            />
          )}

          <span className="truncate">{selected?.label}</span>

        </div>

        <ChevronRight
          size={14}
          className={`transition-transform ${open ? "rotate-[-90deg]" : "rotate-90"} text-[var(--color-text-secondary)]`}
        />

      </button>


      {/* Dropdown Menu */}
      {open && (

        <div
          onWheel={(e) => e.stopPropagation()}
          className={`absolute top-full left-0 mt-2 bg-[var(--color-surface)] border border-[var(--input-border)] shadow-xl overflow-y-auto overscroll-contain z-50 animate-in fade-in slide-in-from-top-1 ${compact
              ? "min-w-full max-h-56 rounded-lg"
              : "w-full rounded-xl overflow-hidden"
            } ${menuClassName ?? ""}`}
        >

          {options.map((option) => (

            <button
              type="button"
              key={option.value}
              ref={option.value === value ? selectedOptionRef : null}
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full text-left font-semibold transition-colors ${compact
                ? "px-3 py-2 rounded-md text-[13px] whitespace-nowrap"
                : "px-4 py-2 text-sm"
                } hover:bg-[var(--color-background)] ${value === option.value
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : ""
                } ${optionClassName ?? ""}`}
            >

              {option.label}

            </button>

          ))}

        </div>

      )}

    </div>

  );
}
