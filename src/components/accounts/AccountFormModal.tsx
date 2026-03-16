import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  type Variants,
} from "framer-motion";

import AccountNameInput from "./AccountNameInput";
import AccountNoteInput from "./AccountNoteInput";
import AccountCategoryDropdown from "./AccountCategoryDropdown";
import OpeningBalanceInput from "./OpeningBalanceInput";

export type AccountCategory = {
  _id: string;
  name: string;
  icon: string;
  color: string;
  group: string;
};

type BaseDraft = {
  name: string;
  opening_balance: number | "";
  category_id: string | null;
  note: string;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  categories: AccountCategory[];
  loading?: boolean;
  initialValues?: {
    name: string;
    opening_balance: number;
    account_category_id: string | null;
    note?: string;
  };
  onSubmit: (data: {
    name: string;
    opening_balance?: number;
    account_category_id: string;
    note?: string;
  }) => Promise<void>;
};

export default function AccountFormModal({
  open,
  mode,
  onClose,
  categories,
  onSubmit,
  loading = false,
  initialValues,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const [draft, setDraft] = useState<BaseDraft>({
    name: "",
    opening_balance: "",
    category_id: null,
    note: "",
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
  if (!open) {
    setDraft({
      name: "",
      opening_balance: "",
      category_id: null,
      note: "",
    });
    return;
  }

  if (mode === "edit") {
    setDraft({
      name: initialValues?.name ?? "",
      opening_balance: initialValues?.opening_balance ?? 0,
      category_id: initialValues?.account_category_id ?? null,
      note: initialValues?.note ?? "",
    });
    return;
  }

  setDraft({
    name: "",
    opening_balance: "",
    category_id: null,
    note: "",
  });
}, [open, mode]);

  const isValid = draft.name.trim().length > 0 && draft.category_id !== null;

  const handleSubmit = async () => {
    if (!isValid) return;

    if (mode === "create") {
      await onSubmit({
        name: draft.name.trim(),
        opening_balance: Number(draft.opening_balance) || 0,
        account_category_id: draft.category_id!,
        note: draft.note.trim() || undefined,
      });
    } else {
      await onSubmit({
        name: draft.name.trim(),
        account_category_id: draft.category_id!,
        note: draft.note.trim() || undefined,
      });
    }
  };

  const sheetVariants: Variants = {
    hidden: { y: "100%" },
    visible: {
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 },
    },
    exit: { y: "100%", transition: { ease: "easeInOut", duration: 0.3 } },
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 20, stiffness: 300 },
    },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
  };

  const title = mode === "create" ? "Add Account" : "Edit Account";
  const buttonText =
    mode === "create"
      ? loading
        ? "Creating..."
        : "Create Account"
      : loading
      ? "Saving..."
      : "Save Changes";

  return (
    <AnimatePresence>
      {open && (
        <div
          key="account-sheet-root"
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-[8px]"
            onClick={onClose}
          />

          <motion.div
            key={isMobile ? `mobile-account-${mode}` : `desktop-account-${mode}`}
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
            className={`relative overflow-hidden flex flex-col bg-[var(--color-surface)] border border-[var(--border)] shadow-2xl ${
              isMobile
                ? "w-full h-[92%] rounded-t-[3rem]"
                : "w-[460px] rounded-[2.5rem] max-h-[85vh]"
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--color-accent-soft)] to-transparent pointer-events-none opacity-50 z-0" />

            {isMobile && (
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex justify-center pt-4 pb-2 shrink-0 relative z-10 cursor-grab active:cursor-grabbing touch-none"
              >
                <div className="w-12 h-1.5 rounded-full bg-[var(--color-text-secondary)] opacity-20" />
              </div>
            )}

            <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0 relative z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tighter leading-none">
                  {title}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[var(--color-background)] border border-[var(--border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all active:scale-90"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>

            <div
              ref={scrollContainerRef}
              className={`flex-1 no-scrollbar px-8 py-4 space-y-10 relative z-10 ${
                pickerOpen ? "overflow-hidden" : "overflow-y-auto"
              }`}
            >
              <motion.div
                key={`acc-content-wrapper-${mode}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="space-y-10 pb-12"
              >
                {mode === "create" ? (
                  <OpeningBalanceInput
                    value={draft.opening_balance}
                    onChange={(val: number | "") =>
                      setDraft((d) => ({ ...d, opening_balance: val }))
                    }
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 w-full overflow-hidden">
                    <div className="flex items-center justify-center gap-3 text-5xl transition-all duration-300">
                      <span className="font-black text-[var(--color-text-secondary)] opacity-40 select-none">
                        ₹
                      </span>
                      <span className="font-black text-[var(--color-text-primary)]">
                        {Number(draft.opening_balance || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-secondary)] opacity-40 mt-4">
                      Opening Balance
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-8">
                  <AccountCategoryDropdown
                    categories={categories}
                    value={draft.category_id}
                    onOpenChange={setPickerOpen}
                    onChange={(id: string) =>
                      setDraft((d) => ({ ...d, category_id: id }))
                    }
                  />

                  <AccountNameInput
                    value={draft.name}
                    onChange={(val: string) =>
                      setDraft((d) => ({ ...d, name: val }))
                    }
                  />

                  <AccountNoteInput
                    value={draft.note}
                    onChange={(val: string) =>
                      setDraft((d) => ({ ...d, note: val }))
                    }
                  />
                </div>
              </motion.div>
            </div>

            <div className="p-8 border-t border-[var(--border)] bg-[var(--color-surface)]/80 backdrop-blur-xl shrink-0 relative z-10">
              <button
                onClick={handleSubmit}
                disabled={!isValid || loading}
                className="w-full h-16 rounded-[1.5rem] bg-[var(--color-accent)] shadow-[0_12px_24px_rgba(82,61,255,0.25)] hover:scale-[1.02] active:scale-[0.97] transition-all disabled:opacity-20 flex items-center justify-center"
              >
                <span className="text-xs font-black uppercase tracking-[0.3em] text-white">
                  {buttonText}
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