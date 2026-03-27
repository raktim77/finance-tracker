import { useMemo, useState } from "react";
import { AnalyticsHeader } from "../components/analytics/AnalyticsHeader";
import { AnalyticsHero } from "../components/analytics/AnalyticsHero";
import { AnalyticsMetrics } from "../components/analytics/AnalyticsMetrics";
import { AnalyticsMainGrid } from "../components/analytics/AnalyticsMainGrid";
import { AnalyticsInsights } from "../components/analytics/AnalyticsInsights";
import { formatOverviewText, getPresetRange } from "../components/analytics/data/dateRange";
import type { AnalyticsDatePreset, AnalyticsDateRange } from "../components/analytics/data/types";
import { useAnalytics } from "../features/analytics/hooks/useAnalytics";
import { getAnalyticsMode } from "../utils/getAnalyticsMode";

export default function Analytics() {
  const defaultPreset: Exclude<AnalyticsDatePreset, "custom"> = "last_3_months";
  const initialRange = getPresetRange(defaultPreset);

  const [selectedPreset, setSelectedPreset] =
    useState<AnalyticsDatePreset>(defaultPreset);

  const [activeRange, setActiveRange] =
    useState<AnalyticsDateRange>(initialRange);

  const [pendingRange, setPendingRange] =
    useState<AnalyticsDateRange>(initialRange);

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const overviewText = useMemo(
    () => formatOverviewText(activeRange),
    [activeRange]
  );

  // 🔥 API CALL
  const { data, isLoading } = useAnalytics(
    activeRange.from,
    activeRange.to
  );

  // 🔥 LOADING
  if (isLoading || !data) {
    return <div className="p-6 text-sm">Loading analytics...</div>;
  }

  // 🔥 MAPPING
  const trendData =
    data.trend.spending.map((d) => ({
      day: d.label,
      amount: d.amount,
    })) ?? [];

  const savingsData =
    data.trend.savings.map((d) => ({
      day: d.label,
      amount: d.amount,
    })) ?? [];

  const pieData = data.categoryBreakdown ?? [];
  const barData = data.monthlyComparison ?? [];

  // ===============================

  const handlePresetChange = (preset: AnalyticsDatePreset) => {
    if (preset === "custom") {
      setPendingRange(activeRange);
      setCustomError(null);
      setIsCustomModalOpen(true);
      return;
    }

    const range = getPresetRange(preset);
    setSelectedPreset(preset);
    setActiveRange(range);
    setPendingRange(range);
    setCustomError(null);
    setIsCustomModalOpen(false);

  };

  const handleCustomCancel = () => {
    setPendingRange(activeRange);
    setCustomError(null);
    setIsCustomModalOpen(false);
  };

  const handleCustomApply = () => {
    if (!pendingRange.from || !pendingRange.to) {
      setCustomError("Please select both From and To dates.");
      return;
    }

    if (pendingRange.from > pendingRange.to) {
      setCustomError("From date cannot be after To date.");
      return;
    }

    setActiveRange(pendingRange);
    setSelectedPreset("custom");
    setCustomError(null);
    setIsCustomModalOpen(false);

  };

  const mode = getAnalyticsMode(activeRange.from, activeRange.to);

  return (<div className="flex flex-col gap-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 mx-auto w-full p-1">
    <AnalyticsHeader
      selectedPreset={selectedPreset}
      overviewText={overviewText}
      onPresetChange={handlePresetChange}
      isCustomModalOpen={isCustomModalOpen}
      pendingRange={pendingRange}
      customError={customError}
      onPendingFromChange={(date) => {
        setPendingRange((prev) => ({ ...prev, from: date }));
        setCustomError(null);
      }}
      onPendingToChange={(date) => {
        setPendingRange((prev) => ({ ...prev, to: date }));
        setCustomError(null);
      }}
      onCustomCancel={handleCustomCancel}
      onCustomApply={handleCustomApply}
    />

    <AnalyticsHero data={data?.metrics} isLoading={isLoading} />
    <AnalyticsMetrics data={data?.metrics} isLoading={isLoading} />

    <AnalyticsMainGrid
      trendData={trendData}
      pieData={pieData}
      savingsData={savingsData}
      barData={barData}
      mode={mode}

    >
      <AnalyticsInsights />
    </AnalyticsMainGrid>
  </div>

  );
}
