import { useMemo, useState, useEffect } from "react";
import {
  ChevronDown,
  Wallet,
  Landmark,
  CreditCard,
  Smartphone,
  HelpCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

export type Account = {
  _id: string;
  name: string;
  type: string;
  balance?: number;
};

type Props = {
  accounts: Account[];
  type: "expense" | "income" | "transfer";
  accountId: string | null;
  toAccountId: string | null;
  onAccountChange: (id: string) => void;
  onToAccountChange: (id: string) => void;
  onOpenChange?: (open: boolean) => void;
};

const accountIconMap: Record<string, LucideIcon> = {
  cash: Wallet,
  bank: Landmark,
  card: CreditCard,
  upi: Smartphone,
  wallet: Wallet,
};

function AccountPicker({
  open,
  title,
  accounts,
  value,
  onClose,
  onSelect,
}: {
  open: boolean;
  title: string;
  accounts: Account[];
  value: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const overlay =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[220] bg-black/20 backdrop-blur-sm"
                  onClick={onClose}
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
                        {title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-9 h-9 rounded-full bg-[var(--color-background)] border border-[var(--border)] flex items-center justify-center"
                    >
                      <X size={16} className="opacity-60" />
                    </button>
                  </div>
              
                  <div className="max-h-[60vh] overflow-y-auto p-4 no-scrollbar overscroll-contain">
                      <div className="grid grid-cols-2 gap-3">
                      {accounts.map((acc,index) => {
                        const Icon = accountIconMap[acc.type?.toLowerCase()] || HelpCircle;
                        const active = value === acc._id;

                        return (
                        <button
  key={`account-${acc._id || index}`} // Ensures a unique, non-empty string
  type="button"
  onClick={() => {
    onSelect(acc._id);
    onClose();
  }}
  className={`
    flex flex-col items-start gap-3 p-4 rounded-[1.5rem] transition-all border text-left min-w-0
    ${
      active
        ? "bg-[var(--color-accent-soft)] border-[var(--color-accent)]/40 scale-[1.01]"
        : "bg-[var(--color-background)] border-transparent hover:border-[var(--border)]"
    }
  `}
>
  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm bg-[var(--color-surface)] text-[var(--color-accent)]">
    <Icon size={20} />
  </div>

  <div className="flex flex-col min-w-0 w-full">
    <span
      className={`text-[13px] font-bold leading-tight break-words ${
        active
          ? "text-[var(--color-accent)]"
          : "text-[var(--color-text-primary)]"
      }`}
    >
      {acc.name}
    </span>

    <span className="text-[10px] font-black uppercase tracking-wider opacity-40 mt-1 leading-tight">
      {acc.type}
      {typeof acc.balance === "number"
        ? ` • ₹${acc.balance.toLocaleString()}`
        : ""}
    </span>
  </div>
</button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )
      : null;

  return overlay;
}

function AccountTrigger({
  label,
  selected,
  placeholder,
  onClick,
}: {
  label: string;
  selected?: Account;
  placeholder: string;
  onClick: () => void;
}) {
  const Icon = selected
    ? accountIconMap[selected.type?.toLowerCase()] || HelpCircle
    : Wallet;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-40 ml-1">
        {label}
      </label>

      <button
        type="button"
        onClick={onClick}
        className="
          flex items-center justify-between px-5 py-4
          bg-[var(--color-background)] rounded-[1.25rem]
          border border-[var(--border)] hover:border-[var(--color-accent)]
          transition-all duration-300 active:scale-[0.98]
        "
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 shrink-0 bg-[var(--color-surface)] text-[var(--color-accent)]">
            <Icon size={18} />
          </div>

          <div className="flex flex-col items-start text-left min-w-0">
            <span
              className={`font-bold text-sm truncate ${
                !selected
                  ? "text-[var(--color-text-secondary)] opacity-50"
                  : "text-[var(--color-text-primary)]"
              }`}
            >
              {selected ? selected.name : placeholder}
            </span>

            {selected && (
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-none mt-1">
                {selected.type}
                {typeof selected.balance === "number"
                  ? ` • ₹${selected.balance.toLocaleString()}`
                  : ""}
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
  );
}

export default function AccountDropdown({
  accounts,
  type,
  accountId,
  toAccountId,
  onAccountChange,
  onToAccountChange,
  onOpenChange,
}: Props) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  useEffect(() => {
    const open = fromOpen || toOpen;
    onOpenChange?.(open);

    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fromOpen, toOpen, onOpenChange]);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a._id === accountId),
    [accounts, accountId]
  );

  const selectedToAccount = useMemo(
    () => accounts.find((a) => a._id === toAccountId),
    [accounts, toAccountId]
  );

  const destinationAccounts = useMemo(
    () => accounts.filter((a) => a._id !== accountId),
    [accounts, accountId]
  );

  return (
    <div className="space-y-6">
      <AccountTrigger
        label={type === "transfer" ? "From Account" : "Account"}
        selected={selectedAccount}
        placeholder="Choose Account"
        onClick={() => setFromOpen(true)}
      />

      {type === "transfer" && (
        <AccountTrigger
          label="To Account"
          selected={selectedToAccount}
          placeholder="Choose Destination"
          onClick={() => setToOpen(true)}
        />
      )}

      <AccountPicker
        open={fromOpen}
        title={type === "transfer" ? "Select From Account" : "Select Account"}
        accounts={accounts}
        value={accountId}
        onClose={() => setFromOpen(false)}
        onSelect={onAccountChange}
      />

      <AccountPicker
        open={toOpen}
        title="Select To Account"
        accounts={destinationAccounts}
        value={toAccountId}
        onClose={() => setToOpen(false)}
        onSelect={onToAccountChange}
      />
    </div>
  );
}