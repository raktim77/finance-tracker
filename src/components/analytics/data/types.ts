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
  amount: number;
};

export type AnalyticsMockData = {
  budgetUsed: number;
  trendData: TrendPoint[];
  savingsData: SavingsPoint[];
  pieData: CategorySlice[];
  barData: MonthlyBarPoint[];
};
