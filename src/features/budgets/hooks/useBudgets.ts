import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteBudget,
  getBudget,
  getBudgetSuggestions,
  upsertBudget,
} from "../api/budgets.api";

import { budgetKeys } from "../api/budget.keys";
import type { UpsertBudgetPayload } from "../types/budget.types";

interface AuthOptions {
  accessToken?: string | null;
  enabled?: boolean;
}

export function useBudget(month: string, options: AuthOptions = {}) {
  return useQuery({
    queryKey: budgetKeys.list(month),
    queryFn: () =>
      getBudget(month, { accessToken: options.accessToken }),
    enabled: options.enabled ?? true,
  });
}

export function useBudgetSuggestions(
  month: string,
  options: AuthOptions = {}
) {
  return useQuery({
    queryKey: budgetKeys.suggestion(month),
    queryFn: () =>
      getBudgetSuggestions(month, {
        accessToken: options.accessToken,
      }),
    enabled: options.enabled ?? true,
  });
}

export function useUpsertBudget(options: AuthOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertBudgetPayload) =>
      upsertBudget(payload, {
        accessToken: options.accessToken,
      }),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: budgetKeys.list(variables.month),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.suggestion(variables.month),
      });
    },
  });
}

export function useDeleteBudget(options: AuthOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (month: string) =>
      deleteBudget(month, {
        accessToken: options.accessToken,
      }),

    onSuccess: (_, month) => {
      queryClient.invalidateQueries({
        queryKey: budgetKeys.list(month),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.suggestion(month),
      });
    },
  });
}
