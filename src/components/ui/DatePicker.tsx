import { useRef, useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { createPortal } from "react-dom";
import "react-day-picker/dist/style.css";

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
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled =
    typeof controlledOpen === "boolean" && typeof onOpenChange === "function";

  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalMode) return;

      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalMode]);

  const pickerContent = (
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
  );

  return (
    <div className={`relative w-full min-w-0 ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 text-left bg-transparent border-0 outline-none min-w-0"
      >
        {showIcon && (
          <Calendar
            size={16}
            className="text-[var(--color-text-secondary)] shrink-0"
          />
        )}

        <span className="truncate text-sm font-bold text-[var(--color-text-primary)]">
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
                  <div
                    className="fixed inset-0 z-[260] bg-black/20 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                  />

                  <div className="fixed inset-0 z-[270] flex items-center justify-center p-4">
                    <div
                      className="
                        bg-[var(--color-surface)]
                        border border-[var(--border)]
                        rounded-[1.75rem] p-4
                        shadow-[0_25px_60px_rgba(0,0,0,0.22)]
                        animate-in fade-in zoom-in-95 duration-200
                        max-w-[calc(100vw-2rem)]
                      "
                    >
                      {pickerContent}
                    </div>
                  </div>
                </>,
                document.body
              )
            : null
          : (
            <>
              <div
                className="fixed inset-0 z-[119] bg-black/10 md:bg-transparent"
                onClick={() => setOpen(false)}
              />

              <div
                className={`
                  absolute top-full mt-3 z-[120]
                  bg-[var(--color-surface)]
                  border border-[var(--border)]
                  rounded-[1.5rem] p-3
                  shadow-[0_20px_50px_rgba(0,0,0,0.15)]
                  animate-in fade-in zoom-in-95 duration-200
                  ${
                    align === "right"
                      ? "right-0 origin-top-right"
                      : "left-0 origin-top-left"
                  }
                  max-sm:fixed
                  max-sm:left-1/2
                  max-sm:top-1/2
                  max-sm:-translate-x-1/2
                  max-sm:-translate-y-1/2
                  max-sm:mt-0
                `}
              >
                {pickerContent}
              </div>
            </>
          ))}

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

        .rdp-day_selected {
          background-color: var(--color-accent) !important;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}