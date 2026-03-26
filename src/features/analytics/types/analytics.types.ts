export type AnalyticsSummaryResponse = {
  metrics: {
    totalSpending: number;
    totalIncome: number;
    totalSavings: number;
    thisMonthSpending: number;
    avgDailySpending: number;
    budgetUsedPercent: number;
    spendingChangePercent: number;
    efficiency: "High" | "Moderate" | "Low";
  };

  trend: {
    spending: { label: string; amount: number }[];
    savings: { label: string; amount: number }[];
  };

  categoryBreakdown: {
    name: string;
    value: number;
    color: string;
  }[];

  monthlyComparison: {
    month: string;
    income: number;
    expense: number;
  }[];
};
