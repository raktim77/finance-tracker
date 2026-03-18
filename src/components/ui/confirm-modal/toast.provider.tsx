import { useState } from "react";
import { ToastContext, type Toast } from "./toast.context";
import { motion, AnimatePresence } from "framer-motion";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"]) => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  const value = {
    show: (msg: string) => addToast(msg, "default"),
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* TOAST VIEWPORT */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const styles = {
              default: "bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--border)]",
              success: "bg-green-500 text-white",
              error: "bg-red-500 text-white",
            };

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`
                  px-5 py-3 rounded-xl text-sm font-bold shadow-lg
                  ${styles[t.type || "default"]}
                `}
              >
                {t.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}