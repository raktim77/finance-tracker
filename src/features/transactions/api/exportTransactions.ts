import { apiClient } from "../../../lib/api/client";

import type {
  GetTransactionsParams,
} from "../types/transaction.types";

interface ExportTransactionsOptions {
  accessToken?: string | null;

  format?: "csv" | "pdf";
}

export async function exportTransactions(
  params: GetTransactionsParams = {},

  options: ExportTransactionsOptions = {}
) {
  return apiClient.get<Blob>(
    "/transactions/export",
    {
      query: {
        ...params,
        format: options.format || "csv",
      },

      authToken: options.accessToken,

      responseType: "blob",
    }
  );
}