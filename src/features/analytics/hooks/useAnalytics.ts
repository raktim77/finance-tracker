import { useQuery } from "@tanstack/react-query";
import { getAnalyticsSummary } from "../api/analytics.api";
import { analyticsKeys } from "../api/analytics.keys";

interface AuthOptions {
  accessToken?: string | null;
  enabled?: boolean;
}

export function useAnalytics(
  from?: string,
  to?: string,
  options: AuthOptions = {},
) {
  return useQuery({
    queryKey: analyticsKeys.summary(from, to),
    queryFn: () =>
      getAnalyticsSummary(from!, to!, {
        accessToken: options.accessToken,
      }),
    enabled: !!from && !!to && (options.enabled ?? true),
  });
}
