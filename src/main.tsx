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
import { DismissibleLayerProvider } from "./components/app-back/DismissibleLayerProvider.tsx";
import { HeaderProvider } from "./context/HeaderContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DismissibleLayerProvider>
      <ToastProvider>
          <ConfirmProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <HeaderProvider>
                <ThemeProvider>
                  <App />
                </ThemeProvider>

                </HeaderProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ConfirmProvider>
      </ToastProvider>
    </DismissibleLayerProvider>
  </React.StrictMode>
);
