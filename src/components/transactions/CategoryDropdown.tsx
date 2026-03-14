import { useMemo, useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  LayoutGrid,
  HelpCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export type Category = {
  _id: string;
  name: string;
  icon: string;
  color: string;
  type: "expense" | "income";
};


const DynamicIcon = ({
  name,
  size = 18,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) => {

  const normalized = name.trim().toLowerCase();

  const pascalName =
    normalized
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

  const IconLibrary = Icons as unknown as Record<string, LucideIcon>;
  const IconComponent = IconLibrary[pascalName] || HelpCircle;

  return <IconComponent size={size} className={className} />;
};

type Props = {
  categories: Category[];
  type: "expense" | "income" | "transfer";
  value: string | null;
  onChange: (id: string) => void;
  onOpenChange?: (open: boolean) => void;
};

export default function CategoryDropdown({
  categories,
  type,
  value,
  onChange,
  onOpenChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (type === "transfer") return [];
    return categories.filter((c) => c.type === type);
  }, [categories, type]);

  const selected = filtered.find((c) => c._id === value);

  if (type === "transfer") return null;

  const overlay = mounted
    ? createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[220] bg-black/20 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="
                  fixed left-1/2 top-1/2 z-[230]
                  w-[calc(100vw-2rem)] max-w-[340px]
                  -translate-x-1/2 -translate-y-1/2
                  rounded-[2rem]
                  border border-[var(--border)]
                  bg-[var(--color-surface)]
                  shadow-[0_30px_80px_rgba(0,0,0,0.18)]
                  overflow-hidden
                "
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40">
                      Selection
                    </span>
                    <h3 className="text-base font-black tracking-tight text-[var(--color-text-primary)] mt-1">
                      Select Category
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-9 h-9 rounded-full bg-[var(--color-background)] border border-[var(--border)] flex items-center justify-center"
                  >
                    <X size={16} className="opacity-60" />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4 no-scrollbar overscroll-contain">
                  <div className="grid grid-cols-2 gap-3">
                    {filtered.map((cat) => (
                      <button
                        key={`cat-${cat.type}-${cat._id}`} // Prefix + fallback to index
                        type="button"
                        onClick={() => {
                          onChange(cat._id);
                          setIsOpen(false);
                        }}
                        className={`
                          flex flex-col items-start gap-4 p-4 rounded-[1.5rem] transition-all border text-left min-w-0
                          ${
                            value === cat._id
                              ? "bg-[var(--color-accent-soft)] border-[var(--color-accent)]/40 scale-[1.01]"
                              : "bg-[var(--color-background)] border-transparent hover:border-[var(--border)]"
                          }
                        `}
                      >
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                          style={{
                            backgroundColor: `${cat.color}15`,
                            color: cat.color,
                          }}
                        >
                          <DynamicIcon name={cat.icon} size={22} />
                        </div>

                        <span
                          className={`text-[13px] font-bold leading-tight break-words ${
                            value === cat._id
                              ? "text-[var(--color-accent)]"
                              : "text-[var(--color-text-primary)]"
                          }`}
                        >
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;
  return (
    <>
      <div className="flex flex-col gap-2 relative">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-40 ml-1">
          Category
        </label>

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          className="
            flex items-center justify-between px-5 py-4
            bg-[var(--color-background)] rounded-[1.25rem]
            border border-[var(--border)] hover:border-[var(--color-accent)]
            transition-all duration-300 active:scale-[0.98]
          "
        >
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 shrink-0"
              style={{
                backgroundColor: selected
                  ? `${selected.color}20`
                  : "var(--color-surface)",
                color: selected ? selected.color : "inherit",
              }}
            >
              {selected ? (
                <DynamicIcon name={selected.icon} />
              ) : (
                <LayoutGrid size={18} className="text-[var(--color-accent)]" />
              )}
            </div>

            <div className="flex flex-col items-start text-left min-w-0">
              <span
                className={`font-bold text-sm truncate ${
                  !selected
                    ? "text-[var(--color-text-secondary)] opacity-50"
                    : "text-[var(--color-text-primary)]"
                }`}
              >
                {selected ? selected.name : "Choose Category"}
              </span>

              {selected && (
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-none mt-1">
                  Classification
                </span>
              )}
            </div>
          </div>

          <ChevronDown
            size={16}
            className="text-[var(--color-text-secondary)] opacity-30 shrink-0"
          />
        </button>
      </div>

      {overlay}
    </>
  );
}