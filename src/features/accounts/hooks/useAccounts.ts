import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createAccount,
  getAccountById,
  getAccountCategories,
  getAccounts,
  updateAccount,
} from "../api/accounts.api";
import { accountKeys } from "../api/account.keys";
import type {
  CreateAccountPayload,
  GetAccountsParams,
  UpdateAccountPayload,
} from "../types/account.types";

interface AuthOptions {
  accessToken?: string | null;
  enabled?: boolean;
}

export function useAccounts(
  params: GetAccountsParams = {},
  options: AuthOptions = {}
) {
  return useQuery({
    queryKey: accountKeys.list(params),
    queryFn: () => getAccounts(params, { accessToken: options.accessToken }),
    enabled: options.enabled ?? true,
  });
}

export function useAccount(
  id: string,
  options: AuthOptions = {},
  enabled = true
) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => getAccountById(id, { accessToken: options.accessToken }),
    enabled: enabled && !!id && (options.enabled ?? true),
  });
}

export function useAccountCategories(options: AuthOptions = {}) {
  return useQuery({
    queryKey: accountKeys.categories(),
    queryFn: () =>
      getAccountCategories({ accessToken: options.accessToken }),
    enabled: options.enabled ?? true,
  });
}

export function useCreateAccount(options: AuthOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAccountPayload) =>
      createAccount(payload, { accessToken: options.accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accountKeys.all,
      });
    },
  });
}

export function useUpdateAccount(options: AuthOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAccountPayload;
    }) =>
      updateAccount(id, payload, {
        accessToken: options.accessToken,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: accountKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: accountKeys.detail(variables.id),
      });
    },
  });
}
