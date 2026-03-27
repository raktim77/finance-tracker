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

/**
 * Helper to convert Date objects to "YYYY-MM-DD" string
 */
function toISODateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getPresetRange(preset: Exclude<AnalyticsDatePreset, "custom">): AnalyticsDateRange {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let startDate: Date;

  if (preset === "this_month") {
    startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  } else if (preset === "this_year") {
    startDate = new Date(endDate.getFullYear(), 0, 1);
  } else {
    const monthSpan =
      preset === "last_3_months"
        ? 3
        : preset === "last_6_months"
          ? 6
          : preset === "last_9_months"
            ? 9
            : 12;
    
    // Goes back (monthSpan - 1) months and sets to the 1st of that month
    startDate = new Date(endDate.getFullYear(), endDate.getMonth() - (monthSpan - 1), 1);
  }

  return {
    from: toISODateString(startDate),
    to: toISODateString(endDate)
  };
}

function formatMonthYear(dateString: string) {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric"
    })
    .toUpperCase();
}

export function formatOverviewText(range: { from?: string; to?: string }) {
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