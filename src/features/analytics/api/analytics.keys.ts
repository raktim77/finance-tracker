export const analyticsKeys = {
  all: ["analytics"] as const,

  summary: (from?: string, to?: string) =>
    [
      ...analyticsKeys.all,
      "summary",
      from ?? "default",
      to ?? "default",
    ] as const,
};
