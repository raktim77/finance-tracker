export const getAnalyticsMode = (
  from: Date | undefined,
  to: Date | undefined
): "daily" | "weekly" | "monthly" => {
  const days =
    (to!.getTime() - from!.getTime()) / (1000 * 60 * 60 * 24);

  if (days <= 31) return "daily";
  if (days <= 90) return "weekly";
  return "monthly";
};