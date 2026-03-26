import { apiClient } from "../../../lib/api/client";
import type { AnalyticsSummaryResponse } from "../types/analytics.types";

interface AuthOptions {
  accessToken?: string | null;
}

export async function getAnalyticsSummary(
  from: string,
  to: string,
  options: AuthOptions = {},
): Promise<AnalyticsSummaryResponse> {
  return apiClient.get<AnalyticsSummaryResponse>("/analytics/summary", {
    authToken: options.accessToken,
    query: { from, to },
  });
}
