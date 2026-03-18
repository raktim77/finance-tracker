import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import AuthProvider from "./lib/context/AuthProvider.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/react-query/queryClient.ts";
import { ConfirmProvider } from "./components/ui/confirm-modal/confirm.provider.tsx";
import { ToastProvider } from "./components/ui/confirm-modal/toast.provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <ConfirmProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
      </ConfirmProvider>
    </ToastProvider>
  </React.StrictMode>
);
