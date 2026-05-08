export const analyticsKeys = {
  all: ["analytics"] as const,

  summary: (from?: string, to?: string, currentDate?: string) =>
    [
      ...analyticsKeys.all,
      "summary",
      from ?? "default",
      to ?? "default",
      currentDate ?? "default",
    ] as const,
};
