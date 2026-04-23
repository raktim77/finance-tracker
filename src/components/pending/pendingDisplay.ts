export type PendingSMSItem = {
  id: string;
  raw_message: string;
  sender?: string | null;
  amount?: number | null;
  type?: "expense" | "income" | "unknown" | string | null;
  merchant?: string | null;
  confidence?: number | null;
  received_at?: number | null;
};

export function getPendingKind(item: PendingSMSItem) {
  if (item.type === "income") return "income";
  if (item.type === "expense") return "expense";
  return "unknown";
}

export function getPendingTitle(item: PendingSMSItem) {
  console.log("LOOGGING", JSON.stringify(item));
  
  return item.merchant?.trim() || item.sender?.trim() || "Unknown merchant";
}

export function getPendingSubtitle(item: PendingSMSItem) {
  const kind = getPendingKind(item);
  if (kind === "income") return "income";
  if (kind === "expense") return "expense";
  return "Needs review";
}

export function formatPendingAmount(amount?: number | null) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "Amount unknown";

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  })}`;
}

export function getPendingSignedAmount(item: PendingSMSItem) {
  const amount = formatPendingAmount(item.amount);
  if (amount === "Amount unknown") return amount;

  const kind = getPendingKind(item);
  if (kind === "expense") return `-${amount}`;
  if (kind === "income") return `+${amount}`;
  return amount;
}

export function getPendingAmountClass(item: PendingSMSItem) {
  const kind = getPendingKind(item);
  if (kind === "expense") return "text-[var(--color-danger)]";
  if (kind === "income") return "text-[var(--color-success)]";
  return "text-[var(--color-text-primary)]";
}

export function formatPendingDateTime(timestamp?: number | null) {
  if (!timestamp) return "Just now";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
