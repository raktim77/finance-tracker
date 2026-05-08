import { apiClient } from "../../../lib/api/client";

import type {
  AccountStatementFormat,
  GetAccountStatementParams,
} from "../types/account.types";

interface ExportAccountStatementOptions {
  accessToken?: string | null;
  format?: AccountStatementFormat;
}

export async function exportAccountStatement(
  accountId: string,
  params: GetAccountStatementParams,
  options: ExportAccountStatementOptions = {}
) {
  return apiClient.get<Blob>(
    `/accounts/${accountId}/statement`,
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
