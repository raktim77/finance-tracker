export const dashboardKeys = {
  all: ["dashboard"] as const,

  summary: () => [...dashboardKeys.all, "summary"] as const,
  analytics: (date?: string) =>
    [...dashboardKeys.all, "analytics", date ?? "default"] as const,
};
