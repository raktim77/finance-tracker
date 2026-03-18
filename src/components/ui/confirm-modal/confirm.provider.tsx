import { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { ConfirmContext, type ConfirmOptions } from "./confirm.context";

type Resolver = (value: boolean) => void;

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<Resolver | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    resolver?.(true);
    setOptions(null);
  };

  const handleCancel = () => {
    resolver?.(false);
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <ConfirmModal
        open={!!options}
        {...options!}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}