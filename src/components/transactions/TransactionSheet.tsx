import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  type Variants,
} from "framer-motion";
import AmountInput from "./AmountInput";
import TypeToggle from "./TypeToggle";
import CategoryDropdown, { type Category } from "./CategoryDropdown";
import AccountDropdown, { type Account } from "./AccountDropdown";
import DateField from "./DateField";
import NoteInput from "./NoteInput";

// --- TYPES ---

type TransactionType = "expense" | "income" | "transfer";

export type TransactionDraft = {
  amount: number | "";
  type: TransactionType;
  account_id: string | null;
  to_account_id: string | null;
  category_id: string | null;
  note: string;
  date: Date;
};

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  accounts: Account[];
  loading?: boolean;
  onSubmit: (data: {
    amount: number;
    type: TransactionType;
    account_id: string;
    to_account_id?: string;
    category_id?: string;
    note?: string;
    date: Date;
  }) => Promise<void>;
  initialData?: TransactionDraft | null;
  defaultData?: Partial<TransactionDraft> | null;
};

// --- COMPONENT ---

export default function TransactionSheet({
  open,
  onClose,
  categories,
  accounts,
  onSubmit,
  loading = false,
  initialData,
  defaultData,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const [draft, setDraft] = useState<TransactionDraft>({
    amount: "",
    type: "expense",
    account_id: null,
    to_account_id: null,
    category_id: null,
    note: "",
    date: new Date(),
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Reset form and prevent autofocus/keyboard on open
  useEffect(() => {
    if (open) {
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;

      const baseDraft: TransactionDraft = {
        amount: "",
        type: "expense",
        account_id: null,
        to_account_id: null,
        category_id: null,
        note: "",
        date: new Date(),
      };

      if (initialData) {
        setDraft(initialData);
      } else {
        setDraft({
          ...baseDraft,
          ...defaultData,
          date: defaultData?.date ?? baseDraft.date,
        });
      }

      if (isMobile && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [open, isMobile, initialData, defaultData]);

  const isValid = () => {
    if (!draft.amount || draft.amount <= 0) return false;
    if (!draft.account_id) return false;
    if (draft.type === "transfer") {
      return !!draft.to_account_id;
    }
    return !!draft.category_id;
  };

  const handleSubmit = async () => {
    if (!isValid()) return;

    await onSubmit({
      amount: Number(draft.amount),
      type: draft.type,
      account_id: draft.account_id!,
      to_account_id: draft.type === "transfer" ? draft.to_account_id! : undefined,
      category_id: draft.type !== "transfer" ? draft.category_id! : undefined,
      note: draft.note || undefined,
      date: draft.date,
    });

    onClose();
  };

  // --- ANIMATION VARIANTS (Typed for TS Safety) ---

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const sheetVariants: Variants = {
    hidden: { y: "100%" },
    visible: {
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 }
    },
    exit: { y: "100%", transition: { ease: "easeInOut", duration: 0.3 } }
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 20, stiffness: 300 }
    },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }
  };


  return (
    <AnimatePresence>
      {open && (
        <div
          key="transaction-sheet-root"
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">

          {/* Backdrop */}
          <motion.div
            key="transaction-backdrop" // Added key
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-[8px]"
            onClick={onClose}
          />

          {/* Main Container */}
          <motion.div
            key={isMobile ? "mobile-sheet" : "desktop-modal"} // CRITICAL: Forces a clean swap between mobile/desktop
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
              if (info.offset.y > 120 || info.velocity.y > 700) {
                onClose();
              }
            }}
            className={`
    relative overflow-hidden flex flex-col
    bg-[var(--color-surface)]
    border border-[var(--border)]
    shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.6)]
    ${isMobile
                ? "w-full h-[92%] rounded-t-[3rem]"
                : "w-[460px] rounded-[2.5rem] max-h-[85vh]"
              }
  `}
          >
            {/* Top Glow Layer */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--color-accent-soft)] to-transparent pointer-events-none opacity-50 z-0" />

            {/* Mobile Grab Handle */}
            {isMobile && (
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex justify-center pt-4 pb-2 shrink-0 relative z-10 cursor-grab active:cursor-grabbing touch-none"
              >
                <div className="w-12 h-1.5 rounded-full bg-[var(--color-text-secondary)] opacity-20" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0 relative z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tighter leading-none">
                  {initialData ? "Edit Transaction" : "New Transaction"}
                </h2>
                {/* <div className="h-1 w-6 rounded-full bg-[var(--color-accent)]" /> */}
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[var(--color-background)] border border-[var(--border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all active:scale-90"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div
              ref={scrollContainerRef}
              className={`flex-1 no-scrollbar px-8 py-4 space-y-10 relative z-10 ${categoryPickerOpen || accountPickerOpen ? "overflow-hidden" : "overflow-y-auto"
                }`}
            >
              <motion.div
                key="form-content-wrapper" // Added key
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="space-y-10 pb-12"
              >
                {/* Hero Section: Amount */}
                <AmountInput
                  value={draft.amount}
                  onChange={(amount) => setDraft((d) => ({ ...d, amount }))}
                />

                {/* Segmented Controller: Type */}
                <TypeToggle
                  value={draft.type}
                  onChange={(type) =>
                    setDraft((d) => ({
                      ...d,
                      type,
                      category_id: null,
                      to_account_id: null,
                    }))
                  }
                />

                {/* Form Elements as Cards */}
                <div className="flex flex-col gap-4">
                  <CategoryDropdown
                    categories={categories}
                    type={draft.type}
                    value={draft.category_id}
                    onOpenChange={setCategoryPickerOpen}
                    onChange={(id) => setDraft((d) => ({ ...d, category_id: id }))}
                  />

                  <AccountDropdown
                    accounts={accounts}
                    type={draft.type}
                    accountId={draft.account_id}
                    toAccountId={draft.to_account_id}
                    onOpenChange={setAccountPickerOpen}
                    onAccountChange={(id) =>
                      setDraft((d) => ({
                        ...d,
                        account_id: id,
                        ...(d.type === "transfer" && d.to_account_id === id
                          ? { to_account_id: null }
                          : {}),
                      }))
                    }
                    onToAccountChange={(id) =>
                      setDraft((d) => ({
                        ...d,
                        to_account_id: id,
                      }))
                    }
                  />

                  <div className="grid grid-cols-1 gap-4">
                    <DateField
                      value={draft.date}
                      onChange={(date) =>
                        setDraft((d) => ({
                          ...d,
                          date,
                        }))
                      }
                    />
                    <NoteInput
                      value={draft.note}
                      onChange={(note) => setDraft((d) => ({ ...d, note }))}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-8 border-t border-[var(--border)] bg-[var(--color-surface)]/80 backdrop-blur-xl shrink-0 relative z-10">
              <button
                onClick={handleSubmit}
                disabled={!isValid() || loading}
                className="
                  w-full h-16 rounded-[1.5rem] 
                  bg-[var(--color-accent)] 
                  shadow-[0_12px_24px_rgba(82,61,255,0.25)]
                  hover:scale-[1.02] active:scale-[0.97]
                  transition-all duration-300
                  disabled:opacity-20 disabled:grayscale disabled:scale-100 disabled:pointer-events-none
                  flex items-center justify-center
                "
              >
                <span className="text-xs font-black uppercase tracking-[0.3em] text-white">
                  {loading
                    ? initialData
                      ? "Updating..."
                      : "Creating..."
                    : initialData
                      ? "Update Transaction"
                      : "Confirm Transaction"}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </AnimatePresence>
  );
}
