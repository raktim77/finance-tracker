import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateProfile } from "../api/user.api";
import { userKeys } from "../api/user.keys";
import type { UpdateProfilePayload } from "../types/user.types";
import { useQuery } from "@tanstack/react-query";
interface AuthOptions {
  accessToken?: string | null;
  enabled?: boolean;
}

export function useUpdateProfile(options: AuthOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      updateProfile(payload, {
        accessToken: options.accessToken,
      }),

    onSuccess: () => {
      // same pattern as accounts
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });
    },
  });
}

export function useMe(options: AuthOptions = {}) {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => getMe({ accessToken: options.accessToken }),
    enabled: options.enabled ?? true,
  });
}
