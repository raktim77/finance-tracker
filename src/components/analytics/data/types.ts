export type TrendPoint = {
  day: string;
  amount: number;
};

export type SavingsPoint = {
  day: string;
  amount: number;
};

export type CategorySlice = {
  name: string;
  value: number;
  color: string;
};

export type MonthlyBarPoint = {
  month: string;
  income: number;
  expense: number;
};

export type AnalyticsMockData = {
  budgetUsed: number;
  trendData: TrendPoint[];
  savingsData: SavingsPoint[];
  pieData: CategorySlice[];
  barData: MonthlyBarPoint[];
};

export type AnalyticsDatePreset =
  | "last_3_months"
  | "last_6_months"
  | "last_9_months"
  | "last_1_year"
  | "this_year"
  | "this_month"
  | "custom";

export type AnalyticsDateRange = {
  from?: Date;
  to?: Date;
};
