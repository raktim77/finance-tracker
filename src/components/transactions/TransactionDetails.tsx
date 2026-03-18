import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Transaction } from "../../features/transactions/types/transaction.types";

type Props = {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
};

export default function TransactionDetails({
  transaction,
  open,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  // Lock background scroll when open
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !transaction) return null;

const isMobile =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 768px)").matches;

  const content = (
    <TransactionContent
      transaction={transaction}
      onEdit={onEdit}
      onDelete={onDelete}
      onClose={onClose}
    />
  );

  return createPortal(
    isMobile ? (
      <MobileSheet onClose={onClose}>{content}</MobileSheet>
    ) : (
      <DesktopModal onClose={onClose}>{content}</DesktopModal>
    ),
    document.body
  );
}

//
// 🔷 Desktop Modal
//
function DesktopModal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-[420px] max-w-[95vw] bg-[var(--color-surface)] border border-[var(--border)] rounded-2xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.25)] animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

//
// 🔷 Mobile Bottom Sheet
//
function MobileSheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[99] flex flex-col justify-end">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* SHEET */}
      <div className="relative bg-[var(--color-surface)] border-t border-[var(--border)] rounded-t-3xl p-4 pb-6 animate-in slide-in-from-bottom duration-300">
        {/* Drag handle */}
        <div className="w-10 h-1.5 bg-[var(--color-text-secondary)]/30 rounded-full mx-auto mb-3" />

        {children}
      </div>
    </div>
  );
}

//
// 🔷 Main Content
//
function TransactionContent({
  transaction,
  onEdit,
  onDelete,
  onClose,
}: {
  transaction: Transaction;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
  onClose: () => void;
}) {
  const isExpense = transaction.signed_amount < 0;
  const isIncome = transaction.signed_amount > 0;

  const amountColor = isExpense
    ? "text-[var(--color-danger)]"
    : isIncome
    ? "text-[var(--color-success)]"
    : "text-[var(--color-text-primary)]";

  return (
    <div className="flex flex-col gap-5">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold">
            {transaction.category_name || "Transfer"}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)] opacity-70">
            {formatDate(transaction.date)}
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-[var(--color-text-secondary)] text-lg"
        >
          ✕
        </button>
      </div>

      {/* AMOUNT */}
      <div className="text-center">
        <div className={`text-3xl font-bold ${amountColor}`}>
          {isExpense ? "-" : isIncome ? "+" : ""}
          ₹{formatAmount(transaction.amount)}
        </div>
      </div>

      {/* DETAILS */}
      <div className="space-y-3 text-sm">

        <Row label="Account" value={transaction.account_id?.name} />

        {transaction.to_account_id && (
          <Row label="To Account" value={transaction.to_account_id?.name} />
        )}

        <Row label="Type" value={capitalize(transaction.type)} />

        {transaction.note && (
          <Row label="Note" value={transaction.note} />
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onEdit?.(transaction)}
          className="flex-1 h-11 rounded-xl bg-[var(--color-background)] border border-[var(--border)] font-semibold hover:bg-[var(--color-accent-soft)] transition"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete?.(transaction)}
          className="flex-1 h-11 rounded-xl bg-red-500/10 text-red-500 font-semibold hover:bg-red-500/20 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

//
// 🔷 Row Component
//
function Row({ label, value }: {
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

//
// 🔧 Helpers
//
function formatAmount(amount: number) {
  return amount.toLocaleString("en-IN");
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}