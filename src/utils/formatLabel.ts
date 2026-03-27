export const formatChartLabel = (
  label: string,
  mode: "daily" | "weekly" | "monthly",
) => {
  if (mode === "daily") {
    // "2025-03-01" → "01"
    return label.split("-")[2] + '/' + label.split("-")[1] ;
  }

  if (mode === "weekly") {
    // "2025-12" → "W12"
    const week = label.split("-")[1];
    return `Week ${parseInt(week, 10)}`;
  }

  if (mode === "monthly") {
    // "2025-03" → "Mar"
    const [, month] = label.split("-");
    const date = new Date(Number(label.slice(0, 4)), Number(month) - 1);

    return date.toLocaleString("en-IN", {
      month: "short",
    });
  }

  return label;
};
