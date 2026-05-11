import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { useDismissibleLayer } from "../app-back/DismissibleLayerProvider";

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
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null); // ✅ NEW
  const selectedOptionRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  useDismissibleLayer({
    open,
    onDismiss: () => setOpen(false),
    priority: 340,
  });

  // ✅ FIXED OUTSIDE CLICK HANDLER
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        !ref.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Position calculation
  const toggleDropdown = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();

      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }

    setOpen((prev) => !prev);
  };

  // Scroll selected into view
  useEffect(() => {
    if (!open) return;

    selectedOptionRef.current?.scrollIntoView({
      block: "nearest",
    });
  }, [open, value]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* BUTTON */}
      <button
        type="button"
        onClick={toggleDropdown}
        // In Dropdown.tsx, change the button className:
        className={`w-full flex items-center justify-between bg-[var(--color-surface)] border font-bold transition-all hover:border-[var(--color-accent)]/30 border-[var(--border)] ${compact
            ? `pl-3 pr-2 h-9 rounded-lg ${buttonClassName?.includes("text-") ? "" : "text-[13px]"}`
            : `pl-9 pr-3 h-11 rounded-xl ${buttonClassName?.includes("text-") ? "" : "text-[12px]"}`
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
          className={`transition-transform ${open ? "rotate-[-90deg]" : "rotate-90"
            } text-[var(--color-text-secondary)]`}
        />
      </button>

      {/* PORTAL MENU */}
      {open &&
        createPortal(
          <>
            <div
              data-dropdown-portal="true"
              className="fixed inset-0 z-[9998] backdrop-blur-[2px] bg-black/10"
              onClick={() => setOpen(false)}
            />

            <div
              ref={menuRef}
              data-dropdown-portal="true"
              role="listbox"
              onWheel={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: `${coords.top + 8}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`,
              }}
              className={`bg-[var(--color-surface)] border border-[var(--input-border)] shadow-xl overflow-y-auto overscroll-contain z-[9999] animate-in fade-in slide-in-from-top-1 ${compact
                ? "max-h-65 rounded-lg"
                : "rounded-xl overflow-hidden"
                } ${menuClassName ?? ""}`}
            >
              {options.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  ref={option.value === value ? selectedOptionRef : null}
                  role="option"
                  aria-selected={value === option.value}
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
          </>,
          document.body
        )}
    </div>
  );
}
