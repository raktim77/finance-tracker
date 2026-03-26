import type { AnalyticsDatePreset, AnalyticsDateRange } from "./types";

type PresetOption = {
  label: string;
  value: AnalyticsDatePreset;
};

export const analyticsDatePresetOptions: PresetOption[] = [
  { label: "Last 3 Months", value: "last_3_months" },
  { label: "Last 6 Months", value: "last_6_months" },
  { label: "Last 9 Months", value: "last_9_months" },
  { label: "Last 1 Year", value: "last_1_year" },
  { label: "This Year", value: "this_year" },
  { label: "This Month", value: "this_month" },
  { label: "Custom Range", value: "custom" }
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function today() {
  return startOfDay(new Date());
}

export function getPresetRange(preset: Exclude<AnalyticsDatePreset, "custom">): AnalyticsDateRange {
  const endDate = today();

  if (preset === "this_month") {
    return {
      from: new Date(endDate.getFullYear(), endDate.getMonth(), 1),
      to: endDate
    };
  }

  if (preset === "this_year") {
    return {
      from: new Date(endDate.getFullYear(), 0, 1),
      to: endDate
    };
  }

  const monthSpan =
    preset === "last_3_months"
      ? 3
      : preset === "last_6_months"
        ? 6
        : preset === "last_9_months"
          ? 9
          : 12;

  return {
    from: new Date(endDate.getFullYear(), endDate.getMonth() - (monthSpan - 1), 1),
    to: endDate
  };
}

function formatMonthYear(date: Date) {
  return date
    .toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric"
    })
    .toUpperCase();
}

export function formatOverviewText(range: AnalyticsDateRange) {
  if (!range.from || !range.to) {
    return "OVERVIEW";
  }

  const start = formatMonthYear(range.from);
  const end = formatMonthYear(range.to);

  if (start === end) {
    return `${start} OVERVIEW`;
  }

  return `${start} - ${end} OVERVIEW`;
}
