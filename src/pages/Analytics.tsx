import { AnalyticsHeader } from "../components/analytics/AnalyticsHeader";
import { AnalyticsHero } from "../components/analytics/AnalyticsHero";
import { AnalyticsMetrics } from "../components/analytics/AnalyticsMetrics";
import { AnalyticsMainGrid } from "../components/analytics/AnalyticsMainGrid";
import { AnalyticsInsights } from "../components/analytics/AnalyticsInsights";
import { analyticsMockData } from "../components/analytics/data/mockAnalytics";

export default function Analytics() {
  const { budgetUsed, trendData, pieData, savingsData, barData } = analyticsMockData;

  return (
    <div className="flex flex-col gap-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 mx-auto w-full p-1">
      {/* 1. HEADER - Responsive Fixed */}
      <AnalyticsHeader />

      {/* 2. PREMIUM HERO SECTION */}
      <AnalyticsHero budgetUsed={budgetUsed} />

      {/* 3. OVERLAP METRICS - 4 COLUMNS */}
      <AnalyticsMetrics budgetUsed={budgetUsed} />

      {/* 4. MAIN ANALYTICS GRID */}
      <AnalyticsMainGrid trendData={trendData} pieData={pieData} savingsData={savingsData} barData={barData}>
        {/* Smart Insights - Full Width Footer Grid */}
        <AnalyticsInsights />
      </AnalyticsMainGrid>
    </div>
  );
}
