import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactions,
  updateTransaction,
} from "../api/transactions.api";
import { transactionKeys } from "../api/transaction.keys";
import { accountKeys } from "../../accounts/api/account.keys";
import type {
  CreateTransactionPayload,
  GetTransactionsParams,
  UpdateTransactionPayload,
} from "../types/transaction.types";

interface AuthOptions {
  accessToken?: string | null;
  enabled?: boolean;
}

export function useTransactions(
  params: GetTransactionsParams = {},
  options: AuthOptions = {}
) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () =>
      getTransactions(params, { accessToken: options.accessToken }),
    enabled: options.enabled ?? true,
  });
}

export function useTransaction(
  id: string,
  options: AuthOptions = {},
  enabled = true
) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () =>
      getTransactionById(id, { accessToken: options.accessToken }),
    enabled: enabled && !!id && (options.enabled ?? true),
  });
}

export function useCreateTransaction(options: AuthOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      createTransaction(payload, { accessToken: options.accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: accountKeys.all,
      });
    },
  });
}

export function useUpdateTransaction(options: AuthOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTransactionPayload;
    }) =>
      updateTransaction(id, payload, {
        accessToken: options.accessToken,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteTransaction(options: AuthOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      deleteTransaction(id, { accessToken: options.accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.all,
      });
    },
  });
}
