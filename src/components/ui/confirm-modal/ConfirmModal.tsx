import { motion, AnimatePresence } from "framer-motion";

type Variant = "default" | "danger" | "success";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: Props) {

  // Refined variants to match your Brand variables and shadow depth
  const variantStyles = {
    default: "bg-[var(--color-accent)] text-white shadow-[0_12px_24px_rgba(82,61,255,0.3)] hover:shadow-[0_16px_32px_rgba(82,61,255,0.4)]",
    danger: "bg-red-500 text-white shadow-[0_12px_24px_rgba(239,68,68,0.3)] hover:shadow-[0_16px_32px_rgba(239,68,68,0.4)]",
    success: "bg-emerald-500 text-white shadow-[0_12px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_16px_32px_rgba(16,185,129,0.4)]",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          {/* High-End Backdrop with heavier blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-[310] w-full max-w-[360px] overflow-hidden rounded-[2.5rem] bg-[var(--color-surface)] border border-[var(--border)] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.35)]"
          >
            {/* Branding Glow (Top Glow logic from TransactionSheet) */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--color-accent-soft)] to-transparent pointer-events-none opacity-40 z-0" />

            <div className="relative z-10 flex flex-col">
              {title && (
                <div className="mb-4">
                  <h3 className="text-xl font-black text-[var(--color-text-primary)] tracking-tighter leading-none">
                    {title}
                  </h3>
                </div>
              )}

              <p className="text-sm font-medium text-[var(--color-text-secondary)] leading-relaxed mb-4">
                {message}
              </p>

              <div className="flex items-center justify-end gap-3 mt-6 relative z-10">

                {/* Cancel: Subtle Border & Ghost Background */}
                <button
                  onClick={onCancel}
                  className="
      px-6 py-3.5 rounded-[1.25rem] 
      border border-[var(--border)] 
      bg-[var(--color-background)]/50
      text-[10px] font-black uppercase tracking-[0.2em] 
      text-[var(--color-text-secondary)] opacity-70
      hover:opacity-100 hover:bg-[var(--color-background)]
      transition-all active:scale-[0.95]
    "
                >
                  {cancelText}
                </button>

                {/* Confirm: Primary Action */}
                <button
                  onClick={onConfirm}
                  className={`
      px-8 py-3.5 rounded-[1.25rem] 
      text-[10px] font-black uppercase tracking-[0.2em] 
      transition-all active:scale-[0.95]
      ${variantStyles[variant]}
    `}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}