export interface BudgetCategoryStat {
  category_id: string;
  name: string;
  icon: string;
  color: string;

  limit: number;
  spent: number;
  remaining: number;
  percent: number;
}

export interface BudgetResponse {
  month: string;
  exists: boolean;

  total_limit?: number;
  allocated?: number;
  spent?: number;
  unallocated?: number;

  categories?: BudgetCategoryStat[];
}

export interface BudgetSuggestionCategory {
  category_id: string;
  name: string;
  icon: string;
  color: string;

  last_month_spent: number;
  suggested_limit: number;
}

export interface BudgetSuggestionsResponse {
  month: string;
  based_on: string;
  suggested_total: number;
  categories: BudgetSuggestionCategory[];
}

export interface UpsertBudgetPayload {
  month: string;
  total_limit: number;
  categories: {
    category_id: string;
    limit: number;
  }[];
}