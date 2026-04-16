export type ParsedSMS = {
  amount?: number;
  type: "expense" | "income" | "unknown";
  merchant?: string | null;
  confidence: number;
};

export function parseSMS(message: string): ParsedSMS {
  const lower = message.toLowerCase();

  let amount: number | undefined;
  let type: "expense" | "income" | "unknown" = "unknown";
  let merchant: string | null = null;
  let confidence = 0;

  // 💰 Extract amount
  const amountMatch = message.match(/₹?\s?(\d+(?:,\d+)*(?:\.\d+)?)/);

  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ""));
    confidence += 0.4;
  }
  
  // 🔻 Detect expense
  if (
    lower.includes("debited") ||
    lower.includes("spent") ||
    lower.includes("paid") ||
    lower.includes("withdraw") ||
    lower.includes("sent")
  ) {
    type = "expense";
    confidence += 0.3;
  }

  // 🔺 Detect income
  if (
    lower.includes("credited") ||
    lower.includes("received") ||
    lower.includes("deposit")
  ) {
    type = "income";
    confidence += 0.3;
  }

  // 🏪 Extract merchant (basic heuristic)
  const merchantMatch = message.match(/(?:to|at|from)\s([A-Z0-9 &]+)/i);

  if (merchantMatch) {
    merchant = merchantMatch[1].trim();
    confidence += 0.2;
  }

  return {
    amount,
    type,
    merchant,
    confidence: Math.min(confidence, 1)
  };
}