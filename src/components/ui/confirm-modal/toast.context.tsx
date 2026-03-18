import { createContext } from "react";

export type ToastType = "default" | "success" | "error";

export type Toast = {
  id: number;
  message: string;
  type?: ToastType;
};

export type ToastContextType = {
  show: (message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

export const ToastContext = createContext<ToastContextType | null>(null);