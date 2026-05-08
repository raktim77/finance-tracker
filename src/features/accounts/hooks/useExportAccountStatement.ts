import { useMutation } from "@tanstack/react-query";

import { exportAccountStatement } from "../api/exportAccountStatement";

import type {
  AccountStatementFormat,
  GetAccountStatementParams,
} from "../types/account.types";

interface AuthOptions {
  accessToken?: string | null;
}

interface ExportPayload {
  accountId: string;
  params: GetAccountStatementParams;
  format?: AccountStatementFormat;
}

function getFileName(
  format: AccountStatementFormat
) {
  const date = new Date()
    .toISOString()
    .split("T")[0];

  return `xpensio-account-statement-${date}.${format}`;
}

export function useExportAccountStatement(
  options: AuthOptions = {}
) {
  return useMutation({
    mutationFn: async ({
      accountId,
      params,
      format = "csv",
    }: ExportPayload) => {
      const blob =
        await exportAccountStatement(
          accountId,
          params,
          {
            format,
            accessToken: options.accessToken,
          }
        );

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
