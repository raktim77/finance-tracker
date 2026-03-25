import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getDashboardAnalytics,
} from "../api/dashboard.api";
import { dashboardKeys } from "../api/dashboard.keys";

interface AuthOptions {
  accessToken?: string | null;
  enabled?: boolean;
}

// 🔹 Summary (hero + stats + insights)
export function useDashboardSummary(options: AuthOptions = {}) {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () =>
      getDashboardSummary({ accessToken: options.accessToken }),
    enabled: options.enabled ?? true,
  });
}

// 🔹 Analytics (charts + donut)
export function useDashboardAnalytics(options: AuthOptions = {}) {
  const today = new Date().toISOString().slice(0, 10);

  return useQuery({
    queryKey: dashboardKeys.analytics(today),
    queryFn: () =>
      getDashboardAnalytics(today, { accessToken: options.accessToken }),
    enabled: options.enabled ?? true,
  });
}
