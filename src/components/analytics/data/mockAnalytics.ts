import type { AnalyticsMockData } from "./types";

export const analyticsMockData: AnalyticsMockData = {
  budgetUsed: 64,
  trendData: [
    { day: "01", amount: 200 },
    { day: "05", amount: 450 },
    { day: "10", amount: 150 },
    { day: "15", amount: 500 },
    { day: "20", amount: 300 },
    { day: "25", amount: 480 },
    { day: "30", amount: 420 }
  ],
  savingsData: [
    { day: "01", amount: 100 },
    { day: "05", amount: 300 },
    { day: "10", amount: 600 },
    { day: "15", amount: 400 },
    { day: "20", amount: 800 },
    { day: "25", amount: 750 },
    { day: "30", amount: 900 }
  ],
  pieData: [
    { name: "Food", value: 400, color: "#f97316" },
    { name: "Shopping", value: 300, color: "#8b5cf6" },
    { name: "Transport", value: 200, color: "#06b6d4" },
    { name: "Bills", value: 100, color: "#22c55e" }
  ],
  barData: [
    { month: "Jan", amount: 1200 },
    { month: "Feb", amount: 1800 },
    { month: "Mar", amount: 900 },
    { month: "Apr", amount: 2100 },
    { month: "May", amount: 1600 },
    { month: "Jun", amount: 2400 }
  ]
};
