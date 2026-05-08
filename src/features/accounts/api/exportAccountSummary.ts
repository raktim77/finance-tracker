import { apiClient } from "../../../lib/api/client";

import type {
  GetAccountSummaryParams,
} from "../types/account.types";

interface ExportAccountSummaryOptions {
  accessToken?: string | null;
}

export async function exportAccountSummary(
  params: GetAccountSummaryParams,
  options: ExportAccountSummaryOptions = {}
) {
  return apiClient.get<Blob>(
    "/accounts/export/summary",
    {
      query: params,
      authToken: options.accessToken,
      responseType: "blob",
    }
  );
}
