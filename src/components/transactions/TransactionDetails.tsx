import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Wallet, FileText, Edit3, Trash2, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useDragControls } from "framer-motion"; // Added useDragControls
import type { Transaction } from "../../features/transactions/types/transaction.types";

type Props = {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
};

export default function TransactionDetails({ transaction, open, onClose, onEdit, onDelete }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const dragControls = useDragControls(); // Initialize drag controls

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!transaction) return null;

  const isExpense = transaction.signed_amount < 0;
  const isIncome = transaction.signed_amount > 0;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99] flex items-end md:items-center justify-center p-0 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

        <motion.div
            layout
            // Drag Props
            drag={isMobile ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose();
            }}
            initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`
              relative overflow-hidden flex flex-col bg-[var(--color-surface)] border border-[var(--border)] shadow-2xl
              ${isMobile ? "w-full rounded-t-[3rem]" : "w-[440px] rounded-[2.5rem]"}
            `}
          >
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--color-accent-soft)] to-transparent pointer-events-none opacity-50 z-0" />

            {/* Drag Handle Container */}
            {isMobile && (
              <div 
                onPointerDown={(e) => dragControls.start(e)}
                className="flex justify-center pt-4 pb-2 shrink-0 relative z-10 cursor-grab active:cursor-grabbing touch-none"
              >
                <div className="w-12 h-1.5 rounded-full bg-[var(--color-text-secondary)] opacity-20" />
              </div>
            )}

            {/* HEADER - Also draggable on mobile */}
            <div 
              onPointerDown={isMobile ? (e) => dragControls.start(e) : undefined}
              className="flex items-center justify-between px-8 pt-4 md:pt-8 pb-4 shrink-0 relative z-10"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-black text-[var(--color-text-primary)] tracking-tighter leading-none">
                  Transaction Details
                </h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-[var(--color-background)] border border-[var(--border)] flex items-center justify-center text-[var(--color-text-secondary)] active:scale-90 transition-transform">
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <div className="px-8 py-6 space-y-8 relative z-10">
              <div className="flex flex-col items-center">
                <div className={`text-5xl font-black tracking-tighter ${isExpense ? "text-[var(--color-danger)]" : isIncome ? "text-[var(--color-success)]" : "text-[var(--color-text-primary)]"}`}>
                  <span className="text-2xl opacity-30 mr-1">₹</span>
                  {transaction.amount.toLocaleString("en-IN")}
                </div>
                <div className="mt-3 text-[12px] font-black uppercase tracking-[0.2em] opacity-70">{transaction.category_name || "Transfer"}</div>
              </div>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto">
                <DetailRow icon={Calendar} label="Date" value={formatDisplayDate(transaction.date)} />
                <DetailRow icon={Wallet} label="Account" value={transaction.account_id?.name} isMultiline />
                {transaction.to_account_id && (
                  <DetailRow icon={Wallet} label="To Account" value={transaction.to_account_id?.name} isMultiline />
                )}
                <DetailRow icon={FileText} label="Type" value={transaction.type.toUpperCase()} />
                {transaction.note && (
                  <DetailRow icon={FileText} label="Note" value={transaction.note} isMultiline />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => onEdit?.(transaction)}
                  className="flex-1 h-14 rounded-2xl bg-[var(--color-background)] border border-[var(--border)] font-black text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]/30 transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 size={16} className="text-[var(--color-accent)] opacity-50" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete?.(transaction)}
                  className="flex-1 h-14 rounded-2xl bg-red-500/5 border border-red-500/10 font-black text-[10px] uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} className="opacity-50" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

interface DetailRowProps {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  isMultiline?: boolean;
}

function DetailRow({ icon: Icon, label, value, isMultiline }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-background)] border border-[var(--border)] flex items-center justify-center text-[var(--color-accent)] opacity-70">
          <Icon size={14} strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{label}</span>
      </div>
      <span className={`text-sm font-bold text-[var(--color-text-primary)] ${isMultiline ? "text-right max-w-[200px]" : "truncate"}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function formatDisplayDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}