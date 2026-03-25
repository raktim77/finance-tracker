export type DashboardSummaryResponse = {
  summary: {
    month: string;
    income: number;
    expenses: number;
    net: number;
    savings_rate: number;
    budget_left: number | null;
  };
  comparison: {
    prev_income: number;
    prev_expenses: number;
    prev_net: number;
    percent_change: number;
  };
  insights: {
    type: "positive" | "warning" | "neutral" | "info";
    title: string;
    message: string;
  }[];
};

export type DashboardAnalyticsResponse = {
  trend: {
    day: string;
    amount: number;
  }[];
  categories: {
    name: string;
    value: number;
    color: string;
  }[];
};