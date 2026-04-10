export const dashboardKeys = {
  all: ["dashboard"] as const,

  summary: (date?: string) =>
    [...dashboardKeys.all, "summary", date ?? "default"] as const,
  analytics: (date?: string) =>
    [...dashboardKeys.all, "analytics", date ?? "default"] as const,
};
