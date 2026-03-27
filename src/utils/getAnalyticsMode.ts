export const getAnalyticsMode = (
  from: string | undefined,
  to: string | undefined
): "daily" | "weekly" | "monthly" => {
  if (!from || !to) {
    return "monthly";
  }

  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const days =
    (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);

  if (days <= 31) return "daily";
  if (days <= 90) return "weekly";
  return "monthly";
};
