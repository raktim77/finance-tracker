import { useRef, useEffect, useState, useCallback } from "react";
import { Calendar } from "lucide-react";
import {
  DayPicker,
  useDayPicker,
  type MonthCaptionProps,
} from "react-day-picker";
import { createPortal } from "react-dom";
import Dropdown from "./Dropdown";
import "react-day-picker/dist/style.css";
import { useDismissibleLayer } from "../app-back/DismissibleLayerProvider";

type Props = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  align?: "left" | "right";
  showIcon?: boolean;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modalMode?: boolean;
};

const TODAY = new Date();
const START_MONTH = new Date(1970, 0, 1);
const END_MONTH = new Date(
  TODAY.getFullYear(),
  TODAY.getMonth(),
  TODAY.getDate()
);

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getInitialMonth(value?: Date) {
  if (!value) return getMonthStart(TODAY);
  return value > END_MONTH ? getMonthStart(END_MONTH) : getMonthStart(value);
}

const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "short" });
const yearOptions = Array.from(
  { length: END_MONTH.getFullYear() - START_MONTH.getFullYear() + 1 },
  (_, index) => {
    const year = START_MONTH.getFullYear() + index;
    return { label: String(year), value: String(year) };
  }
);

function CustomMonthCaption({ calendarMonth, ...props }: MonthCaptionProps) {
  const { goToMonth } = useDayPicker();
  const currentDate = calendarMonth.date;
  const monthOptions = Array.from(
    {
      length:
        currentDate.getFullYear() === END_MONTH.getFullYear()
          ? END_MONTH.getMonth() + 1
          : 12,
    },
    (_, index) => ({
      label: monthFormatter.format(new Date(currentDate.getFullYear(), index, 1)),
      value: String(index),
    })
  );

  return (
    <div
      {...props}
      className={`rdp-month_caption ${props.className ?? ""}`.trim()}
    >
      <div className="custom-day-picker__caption">
        <div className="custom-day-picker__caption-item">
          <Dropdown
            value={String(currentDate.getMonth())}
            options={monthOptions}
            compact
            onChange={(nextMonth) => {
              goToMonth(
                new Date(
                  currentDate.getFullYear(),
                  Number(nextMonth),
                  1
                )
              );
            }}
            className="custom-day-picker__dropdown"
            menuClassName="custom-day-picker__dropdown-menu"
            optionClassName="custom-day-picker__dropdown-option"
          />
        </div>

        <div className="custom-day-picker__caption-item custom-day-picker__caption-item--year">
          <Dropdown
            value={String(currentDate.getFullYear())}
            options={yearOptions}
            compact
            onChange={(nextYear) => {
              goToMonth(new Date(Number(nextYear), currentDate.getMonth(), 1));
            }}
            className="custom-day-picker__dropdown"
            menuClassName="custom-day-picker__dropdown-menu"
            optionClassName="custom-day-picker__dropdown-option"
          />
        </div>
      </div>
    </div>
  );
}

const PICKER_HEIGHT = 390;

export default function DatePicker({
  value,
  onChange,
  align = "left",
  showIcon = true,
  className = "",
  open: controlledOpen,
  onOpenChange,
  modalMode = false,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inlinePopoverRef = useRef<HTMLDivElement>(null);

  const isControlled =
    typeof controlledOpen === "boolean" && typeof onOpenChange === "function";

  const open = isControlled ? controlledOpen : internalOpen;

  useDismissibleLayer({
    open,
    onDismiss: () => setOpen(false),
    priority: 320,
  });

  const setOpen = useCallback(
    (next: boolean) => {
      if (isControlled) {
        onOpenChange?.(next);
      } else {
        setInternalOpen(next);
      }
    },
    [isControlled, onOpenChange]
  );

  const calculateAndOpen = useCallback(() => {
    if (!containerRef.current) {
      setOpen(true);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      // Always center on mobile
      setPopoverStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
    } else if (spaceBelow >= PICKER_HEIGHT) {
      // Open downward
      setPopoverStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: align === "right" ? undefined : rect.left,
        right: align === "right" ? window.innerWidth - rect.right : undefined,
      });
    } else if (spaceAbove >= PICKER_HEIGHT) {
      // Flip upward
      setPopoverStyle({
        position: "fixed",
        bottom: window.innerHeight - rect.top + 8,
        left: align === "right" ? undefined : rect.left,
        right: align === "right" ? window.innerWidth - rect.right : undefined,
      });
    } else {
      // Not enough space either way — center in viewport
      setPopoverStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
    }

    setOpen(true);
  }, [align, setOpen]);

  // Outside click — ignore clicks inside dropdown portals
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalMode) return;

      const target = event.target as Element;

      // Don't close if clicking inside a dropdown portal (month/year selectors)
      if (target.closest('[data-dropdown-portal="true"]')) return;

      if (
        containerRef.current?.contains(target) ||
        inlinePopoverRef.current?.contains(target)
      ) {
        return; // click inside → do nothing
      }

      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalMode, setOpen]);

  useEffect(() => {
    if (!modalMode) return;

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open, modalMode]);

  useEffect(() => {
    if (modalMode || !open) return;

    const popover = inlinePopoverRef.current;
    if (!popover) return;

    const handleWheel = (event: globalThis.WheelEvent) => {
      const target = event.target;

      if (
        target instanceof Element &&
        target.closest(".custom-day-picker__dropdown-menu")
      ) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();
    };

    popover.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      popover.removeEventListener("wheel", handleWheel);
    };
  }, [open, modalMode]);

  const pickerContent = (
    <div className="custom-day-picker overscroll-contain">
      <DayPicker
        classNames={{
          today: `
      text-[var(--color-warm)]
      font-extrabold
    `,

          selected: `
      bg-[var(--color-accent)]
      text-white
      rounded-full
    `,
        }}
        mode="single"
        selected={value}
        defaultMonth={getInitialMonth(value)}
        navLayout="around"
        startMonth={START_MONTH}
        endMonth={END_MONTH}
        disabled={{ after: END_MONTH }}
        components={{
          MonthCaption: CustomMonthCaption,
        }}
        onSelect={(date) => {
          onChange(date);
          setOpen(false);
        }}
      />
    </div>
  );

  return (
    <div className={`relative w-full min-w-0 ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            calculateAndOpen();
          }
        }}
        className="w-full flex items-center gap-3 text-left bg-transparent border-0 outline-none min-w-0"
      >
        {showIcon && (
          <Calendar
            size={16}
            className="text-[var(--color-text-secondary)] shrink-0"
          />
        )}

        <span className="truncate text-xs font-bold text-[var(--color-text-primary)]">
          {value
            ? value.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            : "Select date"}
        </span>
      </button>

      {open &&
        (modalMode
          ? typeof document !== "undefined"
            ? createPortal(
              <>
                <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
                  {/* 1. THE BACKDROP: An absolute sibling that captures the outside click */}
                  <div
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                    onClick={() => setOpen(false)}
                  />

                  {/* 2. THE CONTENT: Isolated from the backdrop click via stopPropagation */}
                  <div
                    onClick={(e) => e.stopPropagation()} // 👈 Critical: Prevents picker clicks from reaching the backdrop
                    className="
        relative z-[270]
        bg-[var(--color-surface)]
        border border-[var(--border)]
        rounded-[1.75rem] p-4
        shadow-[0_25px_60px_rgba(0,0,0,0.22)]
        animate-in fade-in zoom-in-95 duration-200
        w-max max-w-[95vw]
        pointer-events-auto
      "
                  >
                    {pickerContent}
                  </div>
                </div>
              </>,
              document.body
            )
            : null
          : typeof document !== "undefined"
            ? createPortal(
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-[119] bg-black/20 backdrop-blur-sm"
                  onClick={() => setOpen(false)}
                />

                {/* Popover — positioned via calculated inline style */}
                <div
                  ref={inlinePopoverRef}
                  style={popoverStyle}
                  className="
                    z-[120]
                    bg-[var(--color-surface)]
                    border border-[var(--border)]
                    rounded-[1.5rem] p-3
                    shadow-[0_20px_50px_rgba(0,0,0,0.15)]
                    animate-in fade-in zoom-in-95 duration-200
                    w-max
                  "
                >
                  {pickerContent}
                </div>
              </>,
              document.body
            )
            : null)}

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

        .rdp-months {
          justify-content: center;
        }

        .custom-day-picker .rdp-month {
          min-width: 320px;
          width: max-content;
        }

        .custom-day-picker .rdp-month_caption {
          padding: 0 0.25rem 0.75rem;
        }

        .custom-day-picker__caption {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          flex-wrap: nowrap;
        }

        .custom-day-picker__caption-item {
          min-width: 120px;
        }

        .custom-day-picker__caption-item--year {
          min-width: 110px;
        }

        .custom-day-picker__dropdown {
          width: 100%;
        }

        .custom-day-picker__dropdown button {
          padding-left: 0.85rem;
          padding-right: 0.65rem;
          height: 2.2rem;
          border-radius: 0.9rem;
          border-color: var(--border);
          background: var(--color-background);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
          font-size: 0.85rem;
          gap: 0.35rem;
        }

        .custom-day-picker__dropdown button:hover {
          border-color: color-mix(in srgb, var(--color-accent) 40%, var(--border));
        }

        .custom-day-picker__dropdown button span {
          white-space: nowrap;
        }

        .custom-day-picker__dropdown > div:last-child {
          margin-top: 0.45rem;
          min-width: 100%;
        }

        .custom-day-picker__dropdown-menu {
          border-color: color-mix(in srgb, var(--border) 80%, black);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(14px);
        }

        .custom-day-picker__dropdown-option {
          color: var(--color-text-primary);
          border-radius: 0px !important;
        }

        .custom-day-picker__dropdown-option[aria-selected="true"] {
          background: var(--color-accent-soft);
          color: var(--color-accent);
        }

        .custom-day-picker__dropdown-option:hover {
          background: color-mix(in srgb, var(--color-accent) 12%, transparent);
        }

        .custom-day-picker .rdp-button_previous,
        .custom-day-picker .rdp-button_next {
          width: 2.25rem;
          height: 2.25rem;
          border: 1px solid var(--border);
          border-radius: 9999px;
          background: var(--color-surface);
          color: var(--color-text-primary);
          transition: background-color 150ms ease, border-color 150ms ease,
            transform 150ms ease;
        }

        .custom-day-picker .rdp-button_previous:hover,
        .custom-day-picker .rdp-button_next:hover {
          background: var(--color-accent-soft);
          border-color: color-mix(in srgb, var(--color-accent) 30%, var(--border));
          transform: translateY(-1px);
        }

        .custom-day-picker .rdp-button_previous:disabled,
        .custom-day-picker .rdp-button_next:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }

        .custom-day-picker .rdp-chevron {
          fill: currentColor;
        }

        .custom-day-picker .rdp-weekday {
          color: var(--color-text-secondary);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0.72;
        }

        .custom-day-picker .rdp-day_button {
          font-weight: 700;
          border-radius: 9999px;
          transition: background-color 150ms ease, color 150ms ease,
            transform 150ms ease;
        }

        .custom-day-picker .rdp-day_button:hover {
          background: color-mix(in srgb, var(--color-accent) 12%, transparent);
          transform: translateY(-1px);
        }

        .rdp-day_selected {
          background-color: var(--color-accent) !important;
          font-weight: 700;
          color: white !important;
        }

        .custom-day-picker .rdp-day_today:not(.rdp-day_selected) {
          color: var(--color-accent);
          font-weight: 800;
        }

        .rdp-selected .rdp-day_button {
    border: var(--color-accent);
}

        @media (max-width: 640px) {
          .custom-day-picker__caption {
            gap: 0.4rem;
          }

          .custom-day-picker__caption-item {
            min-width: 108px;
          }

          .custom-day-picker__caption-item--year {
            min-width: 96px;
          }

          .custom-day-picker__dropdown button {
            font-size: 0.8rem;
            height: 2.05rem;
          }
        }
      `}</style>
    </div>
  );
}