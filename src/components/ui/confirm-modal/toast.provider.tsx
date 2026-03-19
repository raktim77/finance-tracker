import { useState, useCallback } from "react";
import { ToastContext, type Toast } from "./toast.context";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000); // Slightly longer for readability
  }, []);

  const value = {
    show: (msg: string) => addToast(msg, "default"),
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* TOAST VIEWPORT */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center gap-3 w-full max-w-[90vw] pointer-events-none">
        {/* Removed mode="multiple" to fix TS error */}
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = t.type === "success" ? CheckCircle2 : t.type === "error" ? AlertCircle : Info;

            const variantStyles = {
              default: "bg-[var(--color-surface)]/80 text-[var(--color-text-primary)] border-[var(--border)] shadow-xl",
              success: "bg-emerald-500 text-white shadow-[0_12px_32px_rgba(16,185,129,0.35)] border-emerald-400/20",
              error: "bg-rose-500 text-white shadow-[0_12px_32px_rgba(244,63,94,0.35)] border-rose-400/20",
            };

            return (
              <motion.div
                key={t.id}
                layout // This ensures other toasts slide smoothly when one is removed
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className={`
            pointer-events-auto flex items-center gap-3 px-6 py-4 
            rounded-[1.5rem] border backdrop-blur-md 
            text-sm font-black tracking-tight
            ${variantStyles[t.type || "default"]}
          `}
              >
                <Icon size={18} strokeWidth={2.5} className="shrink-0" />
                <span className="truncate">{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}