import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useDragControls, type Variants } from "framer-motion";
import { X, Sheet, FileText, Wallet } from "lucide-react";
import Dropdown from "../ui/Dropdown";
import DatePicker from "../ui/DatePicker";
import { useDismissibleLayer } from "../app-back/DismissibleLayerProvider";

type AccountOption = {
  _id: string;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  accounts: AccountOption[];
  onExport: (payload: { accountId: string; startDate: Date; endDate: Date; format: "csv" | "pdf" }) => Promise<void>;
};

function getLastMonthRange() {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 29);
  return { startDate, endDate };
}

export default function AccountStatementModal({ open, onClose, accounts, onExport }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [accountId, setAccountId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(getLastMonthRange().startDate);
  const [endDate, setEndDate] = useState<Date>(getLastMonthRange().endDate);
  const [exportingFormat, setExportingFormat] = useState<"csv" | "pdf" | null>(null);
  const dragControls = useDragControls();

  useDismissibleLayer({
    open,
    onDismiss: onClose,
    priority: 220,
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!open) return;
    setAccountId("");
    const { startDate: initialStart, endDate: initialEnd } = getLastMonthRange();
    setStartDate(initialStart);
    setEndDate(initialEnd);
    setExportingFormat(null);
  }, [open]);

  const accountOptions = useMemo(
    () => [
      { label: "Select Account", value: "" },
      ...accounts.map((acc) => ({ label: acc.name, value: acc._id })),
    ],
    [accounts]
  );

  const isValid = !!accountId && !!startDate && !!endDate && startDate <= endDate;

  const handleExport = async (format: "csv" | "pdf") => {
    if (!isValid || exportingFormat) return;
    try {
      setExportingFormat(format);
      await onExport({
        accountId,
        startDate,
        endDate,
        format,
      });
      onClose();
    } finally {
      setExportingFormat(null);
    }
  };

  const sheetVariants: Variants = {
    hidden: { y: "100%" },
    visible: { y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { y: "100%", transition: { ease: "easeInOut", duration: 0.3 } },
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-[8px]"
            onClick={onClose}
          />

          <motion.div
            key={isMobile ? "mobile-account-statement-sheet" : "desktop-account-statement-modal"}
            variants={isMobile ? sheetVariants : modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag={isMobile ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose();
            }}
            className={`relative overflow-hidden flex flex-col bg-[var(--color-surface)] border border-[var(--border)] shadow-2xl ${isMobile ? "w-full h-[86%] rounded-t-[3rem]" : "w-[460px] rounded-[2.5rem]"
              }`}
          >
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--color-accent-soft)] to-transparent pointer-events-none opacity-50 z-0" />

            {isMobile ? (
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex justify-center pt-4 pb-2 shrink-0 relative z-10 cursor-grab active:cursor-grabbing touch-none"
              >
                <div className="w-12 h-1.5 rounded-full bg-[var(--color-text-secondary)] opacity-20" />
              </div>
            ) : null}

            <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0 relative z-10">
              <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tighter leading-none">
                Account Statement
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[var(--color-background)] border border-[var(--border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all active:scale-90"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <div className="px-8 py-4 space-y-5 relative z-10">
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                  Account
                </p>
                <Dropdown icon={Wallet}
                  value={accountId} options={accountOptions} onChange={setAccountId} />
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                  Date Range
                </p>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div className="h-11 rounded-xl border border-[var(--input-border)] px-3 flex items-center gap-2 bg-[var(--color-surface)] text-sm">
                    <DatePicker value={startDate} onChange={(d) => d && setStartDate(d)} />
                  </div>
                  <span className="text-[var(--color-text-secondary)] text-xs font-semibold">to</span>
                  <div className="h-11 rounded-xl border border-[var(--input-border)] px-3 flex items-center gap-2 bg-[var(--color-surface)] text-sm">
                    <DatePicker value={endDate} onChange={(d) => d && setEndDate(d)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto p-6 pt-3 bg-[var(--color-surface)] relative z-10">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  disabled={!isValid || !!exportingFormat}
                  className="rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)] px-4 py-3 font-semibold text-sm text-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-accent-soft)]/80 transition-colors flex items-center justify-center gap-2"
                >
                  <Sheet size={16} />
                  {exportingFormat === "csv" ? "Exporting..." : "Export CSV"}
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("pdf")}
                  disabled={!isValid || !!exportingFormat}
                  className="rounded-xl border border-[var(--color-warm)]/20 bg-[var(--color-warm)]/10 px-4 py-3 font-semibold text-sm text-[var(--color-warm)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-warm)]/9 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={16} />
                  {exportingFormat === "pdf" ? "Exporting..." : "Export PDF"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
