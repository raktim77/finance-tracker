export const budgetKeys = {
  all: ["budgets"] as const,

  lists: () => [...budgetKeys.all, "list"] as const,
  list: (month: string) =>
    [...budgetKeys.lists(), month] as const,

  suggestions: () => [...budgetKeys.all, "suggestions"] as const,
  suggestion: (month: string) =>
    [...budgetKeys.suggestions(), month] as const,
};