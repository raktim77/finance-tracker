import { useQuery } from "@tanstack/react-query";
import { getAnalyticsSummary } from "../api/analytics.api";
import { analyticsKeys } from "../api/analytics.keys";

interface AuthOptions {
  accessToken?: string | null;
  enabled?: boolean;
}

export function useAnalytics(
  from?: Date,
  to?: Date,
  options: AuthOptions = {},
) {
  return useQuery({
    queryKey: analyticsKeys.summary(from?.toISOString(), to?.toISOString()),
    queryFn: () =>
      getAnalyticsSummary(from!.toISOString(), to!.toISOString(), {
        accessToken: options.accessToken,
      }),
    enabled: !!from && !!to && (options.enabled ?? true),
  });
}
