import { useMutation } from "@tanstack/react-query";

import { exportAccountSummary } from "../api/exportAccountSummary";

import type {
  GetAccountSummaryParams,
} from "../types/account.types";

interface AuthOptions {
  accessToken?: string | null;
}

interface ExportPayload {
  params: GetAccountSummaryParams;
}

function getFileName() {
  const date = new Date()
    .toISOString()
    .split("T")[0];

  return `xpensio-account-summary-${date}.pdf`;
}

export function useExportAccountSummary(
  options: AuthOptions = {}
) {
  return useMutation({
    mutationFn: async ({
      params,
    }: ExportPayload) => {
      const blob =
        await exportAccountSummary(
          params,
          {
            accessToken: options.accessToken,
          }
        );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = getFileName();

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    },
  });
}
