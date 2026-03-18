import { createContext } from "react";

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "success";
};

export const ConfirmContext = createContext<{
  confirm: (options: ConfirmOptions) => Promise<boolean>;
} | null>(null);