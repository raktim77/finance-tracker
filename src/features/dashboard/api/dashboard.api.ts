import { apiClient } from "../../../lib/api/client";
import type {
  DashboardSummaryResponse,
  DashboardAnalyticsResponse,
} from "../types/dashboard.types";

interface AuthOptions {
  accessToken?: string | null;
}

export async function getDashboardSummary(
  options: AuthOptions = {}
): Promise<DashboardSummaryResponse> {
  return apiClient.get<DashboardSummaryResponse>("/dashboard/summary", {
    authToken: options.accessToken,
  });
}

export async function getDashboardAnalytics(
  options: AuthOptions = {}
): Promise<DashboardAnalyticsResponse> {
  return apiClient.get<DashboardAnalyticsResponse>("/dashboard/analytics", {
    authToken: options.accessToken,
  });
}