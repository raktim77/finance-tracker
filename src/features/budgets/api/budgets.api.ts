import { apiClient } from "../../../lib/api/client";
import type {
  BudgetResponse,
  BudgetSuggestionsResponse,
  UpsertBudgetPayload,
} from "../types/budget.types";

interface AuthOptions {
  accessToken?: string | null;
}

export async function getBudget(
  month: string,
  options: AuthOptions = {}
): Promise<BudgetResponse> {
  return apiClient.get<BudgetResponse>("/budgets", {
    query: { month },
    authToken: options.accessToken,
  });
}

export async function getBudgetSuggestions(
  month: string,
  options: AuthOptions = {}
): Promise<BudgetSuggestionsResponse> {
  return apiClient.get<BudgetSuggestionsResponse>(
    "/budgets/suggestions",
    {
      query: { month },
      authToken: options.accessToken,
    }
  );
}

export async function upsertBudget(
  payload: UpsertBudgetPayload,
  options: AuthOptions = {}
) {
  return apiClient.post("/budgets", payload, {
    authToken: options.accessToken,
  });
}