import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSessions,
  revokeSession,
  revokeOtherSessions,
} from "../api/session.api";
import { sessionKeys } from "../api/session.keys";

interface AuthOptions {
  accessToken?: string | null;
  enabled?: boolean;
}

export function useSessions(options: AuthOptions = {}) {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: () => getSessions({ accessToken: options.accessToken }),
    enabled: options.enabled ?? true,
  });
}

export function useRevokeSession(options: AuthOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      revokeSession(sessionId, {
        accessToken: options.accessToken,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.all,
      });
    },
  });
}

export function useRevokeOtherSessions(options: AuthOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      revokeOtherSessions({
        accessToken: options.accessToken,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.all,
      });
    },
  });
}
