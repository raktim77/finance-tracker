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
  const variantStyles = {
    default:
      "bg-[var(--color-accent)] text-white shadow-[0_10px_25px_rgba(82,61,255,0.3)]",
    danger:
      "bg-red-500 text-white shadow-[0_10px_25px_rgba(239,68,68,0.3)]",
    success:
      "bg-green-500 text-white shadow-[0_10px_25px_rgba(34,197,94,0.3)]",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative z-[310] w-full max-w-md rounded-[2rem] bg-[var(--color-surface)] border border-[var(--border)] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.25)]"
          >
            {title && (
              <h3 className="text-lg font-black mb-2">{title}</h3>
            )}

            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              {message}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl border text-sm font-bold hover:bg-[var(--color-background)]"
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                className={`px-5 py-2 rounded-xl text-sm font-black transition-all active:scale-95 hover:scale-[1.03] ${variantStyles[variant]}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}