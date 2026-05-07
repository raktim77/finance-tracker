import { useMutation } from "@tanstack/react-query";

import { exportTransactions } from "../api/exportTransactions";

import type {
  GetTransactionsParams,
} from "../types/transaction.types";

interface AuthOptions {
  accessToken?: string | null;
}

interface ExportPayload {
  params?: GetTransactionsParams;

  format?: "csv" | "pdf";
}

function getFileName(
  format: "csv" | "pdf"
) {
  const date = new Date()
    .toISOString()
    .split("T")[0];

  return `xpensio-transactions-${date}.${format}`;
}

export function useExportTransactions(
  options: AuthOptions = {}
) {
  return useMutation({
    mutationFn: async ({
      params = {},
      format = "csv",
    }: ExportPayload) => {
      const blob =
        await exportTransactions(params, {
          format,
          accessToken: options.accessToken,
        });

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = getFileName(format);

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    },
  });
}