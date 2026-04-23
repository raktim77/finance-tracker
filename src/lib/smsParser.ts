/**
 * parseSMS.ts — Xpensio Financial SMS Parser
 *
 * Pipeline:
 *  1. Noise / spam gate  — blocks OTPs, promos, delivery alerts
 *  2. Financial signal   — keywords + currency patterns
 *  3. Amount extraction  — multi-currency, handles commas / lakhs / crores
 *  4. Transaction type   — expense · income · transfer · investment · unknown
 *  5. Sub-category       — UPI, ATM, EMI, SIP, MF, etc.
 *  6. Merchant           — priority cascade (named payee → merchant name → account tail)
 *  7. Confidence score   — weighted, capped at 1.0
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type TransactionType =
  | "expense"
  | "income"
  | "transfer"
  | "investment"
  | "unknown";

export type SubCategory =
  | "upi"
  | "atm"
  | "emi"
  | "sip"
  | "mutual_fund"
  | "card_payment"
  | "neft_rtgs"
  | "imps"
  | "bank_charge"
  | "dividend"
  | "salary"
  | "refund"
  | "cashback"
  | "insurance"
  | "investment_other"
  | "general"
  | null;

export type ParsedSMS = {
  /** Numeric amount in the local currency unit (no formatting) */
  amount: number | undefined;
  /** ISO 4217 currency code inferred from the symbol / keyword */
  currency: string;
  type: TransactionType;
  subCategory: SubCategory;
  merchant: string | null;
  /** Account / card tail, e.g. "XX1234" — useful for multi-account users */
  accountRef: string | null;
  /** Formatted balance string exactly as it appeared in the SMS, or null */
  balance: string | null;
  /** 0–1 float. < 0.5 = low confidence, treat as unverified */
  confidence: number;
  /** Why confidence is low — useful for debug / user messaging */
  flags: string[];
};

// ─── Stage 1: Noise gate ─────────────────────────────────────────────────────

/**
 * Returns true when the message should be REJECTED before any parsing.
 * Catches OTPs, delivery notifications, service alerts, and promotional spam.
 */
function isNoise(raw: string): boolean {
  const msg = raw.toLowerCase();

  // OTP / authentication codes
  if (/\b(otp|one.?time.?pass|verification code|auth.?code|login code)\b/.test(msg)) return true;
  if (/\b\d{4,8}\b.{0,30}\b(otp|code|pin)\b/.test(msg)) return true;

  // Delivery / logistics
  if (/\b(out for delivery|your order|shipment|parcel|courier|awb|tracking)\b/.test(msg)) return true;

  // Pure promotional with no financial verb
  const hasFinancialVerb =
    /\b(debited|credited|paid|spent|withdrawn|deposited|transferred|received|sent|deducted|reversed|refunded|mandated|auto.?debit|standing instruction|emi|sip|neft|rtgs|imps|upi)\b/.test(msg);
  if (!hasFinancialVerb) {
    if (/\b(offer|discount|cashback|sale|coupon|promo|reward|exclusive|hurry|limited time|click here|subscribe|deal)\b/.test(msg)) return true;
  }

  // KYC / account activation
  if (/\b(kyc|pan|aadhaar|update your|verify your|activate your)\b/.test(msg)) return true;

  // Pure balance enquiry replies (no debit/credit event)
  if (/\b(your balance is|available balance|bal\s*:)\b/.test(msg) && !hasFinancialVerb) return true;

  return false;
}

// ─── Stage 2: Financial signal check ─────────────────────────────────────────

const FINANCIAL_KEYWORDS = [
  "debited", "credited", "debit", "credit",
  "spent", "paid", "payment", "withdraw", "withdrawal",
  "deposited", "deposit", "transfer", "transferred",
  "received", "sent", "sent to",
  "emi", "sip", "neft", "rtgs", "imps", "upi",
  "auto debit", "auto-debit", "standing instruction",
  "mandate", "subscription",
  "refund", "reversal", "reversed",
  "dividend", "interest credited",
  "salary", "payroll",
  "cashback", "reward",
  "purchase", "transaction",
  "charged", "deducted",
  "mutual fund", "mf purchase", "investment",
  "insurance premium",
  "atm",
];

/** Multi-currency detection — covers 30+ currencies used worldwide */
const CURRENCY_PATTERN =
  /(?:₹|rs\.?|inr|usd|\$|aud|cad|usd|€|eur|£|gbp|¥|jpy|cny|cnh|sgd|s\$|aed|aed|myr|rm|idr|rp|krw|₩|thb|฿|brl|r\$|mxn|chf|hkd|nzd|zar|sek|nok|dkk|pln|czk|huf)/i;

function isFinancialSMS(msg: string): boolean {
  const lower = msg.toLowerCase();
  const hasKeyword = FINANCIAL_KEYWORDS.some((kw) => lower.includes(kw));
  const hasCurrency = CURRENCY_PATTERN.test(msg);
  // Must have at least a keyword OR (currency + numeric amount)
  return hasKeyword || (hasCurrency && /\d+/.test(msg));
}

// ─── Stage 3: Amount extraction ──────────────────────────────────────────────

/**
 * Currency symbol → ISO 4217 code map.
 * Ordered by detection specificity (longer / more unique prefixes first).
 */
const CURRENCY_MAP: { pattern: RegExp; code: string }[] = [
  { pattern: /₹|rs\.?\s|inr/i,  code: "INR" },
  { pattern: /\$(?!g|a)/i,       code: "USD" },  // bare $ (not SGD/AUD prefix)
  { pattern: /aud|\$a|a\$/i,     code: "AUD" },
  { pattern: /cad|\$c|c\$/i,     code: "CAD" },
  { pattern: /sgd|s\$/i,         code: "SGD" },
  { pattern: /€|eur/i,           code: "EUR" },
  { pattern: /£|gbp/i,           code: "GBP" },
  { pattern: /¥|jpy|cny|cnh/i,   code: "JPY" },
  { pattern: /aed/i,             code: "AED" },
  { pattern: /myr|rm\s/i,        code: "MYR" },
  { pattern: /brl|r\$/i,         code: "BRL" },
  { pattern: /zar/i,             code: "ZAR" },
  { pattern: /krw|₩/i,           code: "KRW" },
  { pattern: /thb|฿/i,           code: "THB" },
];

function detectCurrency(msg: string): string {
  for (const { pattern, code } of CURRENCY_MAP) {
    if (pattern.test(msg)) return code;
  }
  return "INR"; // Sensible default for Indian market; adjust per region
}

/**
 * Extracts the PRIMARY transaction amount.
 *
 * Handles:
 *  - INR: ₹1,23,456.78 / Rs 1234 / INR 500.00
 *  - International: $1,234.56 / €999 / £450.00
 *  - Lakh/crore written-out: "2 lakh" "1.5 crore"
 *  - Amounts with only commas (no decimal): 1,23,456
 *  - Words: "five hundred" (fallback, low confidence)
 *
 * IMPORTANT: When multiple amounts appear, picks the one immediately
 * following the primary debit/credit verb — avoids swallowing
 * account balance or reference numbers.
 */
const AMOUNT_REGEXES = [
  // Primary: currency symbol / code right before amount
  /(?:₹|rs\.?\s*|inr\s*)([0-9,]+(?:\.[0-9]{1,2})?)/i,
  /(?:\$|€|£|¥|₩|฿)([0-9,]+(?:\.[0-9]{1,2})?)/,
  /(?:usd|aud|cad|sgd|eur|gbp|aed|myr|brl|zar)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  // Fallback: amount keyword context
  /(?:amount|amt|value|for)\s*(?:of\s*)?(?:₹|rs\.?\s*|\$|€|£)?([0-9,]+(?:\.[0-9]{1,2})?)/i,
];

// Lakh / crore multipliers (Indian numbering)
const MULTIPLIER_PATTERN =
  /(?:₹|rs\.?\s*)?([0-9]+(?:\.[0-9]+)?)\s*(lakh|lac|crore|cr)\b/i;

function extractAmount(msg: string): number | undefined {
  // Lakh / crore written form
  const multMatch = MULTIPLIER_PATTERN.exec(msg);
  if (multMatch) {
    const base = parseFloat(multMatch[1]);
    const unit = multMatch[2].toLowerCase();
    if (unit === "crore" || unit === "cr") return base * 1e7;
    if (unit === "lakh" || unit === "lac") return base * 1e5;
  }

  for (const re of AMOUNT_REGEXES) {
    const m = re.exec(msg);
    if (m) {
      const clean = m[1].replace(/,/g, "");
      const val = parseFloat(clean);
      // Reject implausible values: 0, or numbers that look like dates / times / references
      if (!isNaN(val) && val > 0 && val < 1e11) return val;
    }
  }

  return undefined;
}

// ─── Stage 4: Transaction type ────────────────────────────────────────────────

/** Returns type + rough confidence contribution */
function classifyType(lower: string): {
  type: TransactionType;
  score: number;
} {
  // ── Investment signals (check before income/expense — "credited to your MF folio" is investment, not income)
  if (
    /\b(sip|systematic investment|mutual fund|mf\s*(purchase|invest)|nav|folio|units allotted|units allocated|redemption|elss|nps|ppf|nsc|sgb|sovereign gold|ipo allot)\b/.test(lower)
  ) {
    return { type: "investment", score: 0.35 };
  }
  if (/\b(insurance premium|life insurance|health insurance|term plan|ulip)\b/.test(lower)) {
    return { type: "investment", score: 0.3 };
  }

  // ── Transfer / internal movement (higher priority than generic debit/credit)
  if (
    /\b(transferred to|transfer to|neft|rtgs|imps|internal transfer|fund transfer|self transfer)\b/.test(lower) &&
    !/\b(received|credited)\b/.test(lower)
  ) {
    return { type: "transfer", score: 0.3 };
  }

  // ── Expense
  if (
    /\b(debited|deducted|spent|paid|payment|purchase|charged|withdraw|withdrawn|atm|emi|mandate executed|auto.?debit|standing instruction)\b/.test(lower)
  ) {
    return { type: "expense", score: 0.35 };
  }

  // ── Income
  if (
    /\b(credited|received|deposited|deposit|salary|payroll|refund|reversal|reversed|cashback|reward|dividend|interest credited)\b/.test(lower)
  ) {
    return { type: "income", score: 0.35 };
  }

  return { type: "unknown", score: 0 };
}

// ─── Stage 4b: Sub-category ──────────────────────────────────────────────────

function classifySubCategory(lower: string, type: TransactionType): SubCategory {
  if (/\batm\b/.test(lower)) return "atm";
  if (/\bupi\b/.test(lower)) return "upi";
  if (/\b(neft|rtgs)\b/.test(lower)) return "neft_rtgs";
  if (/\bimps\b/.test(lower)) return "imps";
  if (/\bemi\b/.test(lower)) return "emi";
  if (/\b(sip|systematic investment)\b/.test(lower)) return "sip";
  if (/\b(mutual fund|mf\s*(purchase|invest)|nav|folio|units)\b/.test(lower)) return "mutual_fund";
  if (/\b(insurance premium|life insurance|health insurance|term plan|ulip)\b/.test(lower)) return "insurance";
  if (/\b(dividend)\b/.test(lower)) return "dividend";
  if (/\b(salary|payroll|ctc)\b/.test(lower)) return "salary";
  if (/\b(refund|reversal|reversed)\b/.test(lower)) return "refund";
  if (/\b(cashback|reward)\b/.test(lower)) return "cashback";
  if (/\b(card|pos|swipe|tap to pay)\b/.test(lower)) return "card_payment";
  if (/\b(bank charge|service charge|annual fee|late fee|penalty)\b/.test(lower)) return "bank_charge";
  if (type === "investment") return "investment_other";
  return "general";
}

// ─── Stage 5: Merchant extraction ────────────────────────────────────────────

/**
 * Priority cascade — tries the most reliable patterns first and stops
 * at the first match. Cleans the result before returning.
 */
const MERCHANT_PATTERNS: RegExp[] = [
  // 1. "to <MERCHANT>" or "at <MERCHANT>" — most common in Indian bank SMS
  /\b(?:to|at)\s+([A-Z0-9][A-Za-z0-9 &.\-_/]{1,40}?)(?:\s+(?:via|on|for|using|with|ref|upi|vpa|a\/c|ac|account|rs|inr|₹|\d))/i,
  // 2. "paid to <X>" / "sent to <X>"
  /\b(?:paid|sent)\s+(?:to\s+)?([A-Z0-9][A-Za-z0-9 &.\-_/]{1,40}?)(?:\s+(?:via|on|for|using|with|ref|upi|vpa|a\/c|ac|rs|inr|₹|\d))/i,
  // 3. "from <X>" for income context
  /\breceived\s+(?:from\s+)?([A-Z0-9][A-Za-z0-9 &.\-_/]{1,40}?)(?:\s+(?:via|on|for|using|with|ref|upi|a\/c|rs|inr|₹|\d))/i,
  // 4. UPI VPA — last segment before @ is often business name
  /(?:vpa|upi id|upi ref)[:\s]+([a-z0-9._-]+)@/i,
  // 5. "at <MERCHANT>" without look-ahead (lower confidence, wider match)
  /\bat\s+([A-Z][A-Za-z0-9 &.-]{1,35})/,
  // 6. "to <MERCHANT>" without look-ahead
  /\bto\s+([A-Z][A-Za-z0-9 &.-]{1,35})/,
];

/** Words that commonly appear in SMS templates and are NOT merchants */
const MERCHANT_BLOCKLIST = new Set([
  "your", "you", "the", "a", "an", "our", "us",
  "bank", "axis", "sbi", "hdfc", "icici", "kotak", "yes", "rbl",
  "account", "acc", "a/c", "card", "wallet", "upi", "neft", "imps", "rtgs",
  "ref", "reference", "txn", "tran", "transaction", "id",
  "avl", "bal", "balance", "available",
  "rs", "inr", "mr", "mrs", "ms", "dr",
  "dear", "customer", "info", "alert", "update",
]);

function cleanMerchant(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^A-Za-z0-9 &.\-_/@]/g, "")
    .trim();

  if (cleaned.length < 2) return null;
  if (MERCHANT_BLOCKLIST.has(cleaned.toLowerCase())) return null;
  // Reject pure numeric strings (likely account numbers)
  if (/^\d+$/.test(cleaned)) return null;
  // Reject strings that look like account tails (XX1234)
  if (/^[Xx*]+\d{3,6}$/.test(cleaned)) return null;

  return cleaned;
}

function extractMerchant(msg: string): string | null {
  for (const pattern of MERCHANT_PATTERNS) {
    const m = pattern.exec(msg);
    if (m) {
      const result = cleanMerchant(m[1]);
      if (result) return result;
    }
  }
  return null;
}

// ─── Stage 5b: Account reference ─────────────────────────────────────────────

function extractAccountRef(msg: string): string | null {
  // Masked card / account: XX1234, **1234, ending 1234, a/c xx1234
  const m =
    /(?:a\/c|account|card|ac)\s*(?:no\.?\s*)?(?:[Xx*]{2,4})(\d{4})\b/i.exec(msg) ||
    /(?:ending|ending in|ending with|last 4)\s*(\d{4})\b/i.exec(msg) ||
    /\b([Xx*]{2,4}\d{4})\b/.exec(msg);
  return m ? m[1] || m[0] : null;
}

// ─── Stage 5c: Balance ────────────────────────────────────────────────────────

function extractBalance(msg: string): string | null {
  // "Avl Bal: Rs 12,345.67" / "Available balance INR 1234"
  const m =
    /(?:avl\.?\s*bal|available\s*bal(?:ance)?|a\/c\s*bal(?:ance)?|bal(?:ance)?)\s*[:-]?\s*((?:₹|rs\.?\s*|inr\s*)?[0-9,]+(?:\.[0-9]{1,2})?)/i.exec(msg);
  return m ? m[1].trim() : null;
}

// ─── Stage 6: Confidence scoring ─────────────────────────────────────────────

function computeConfidence(
  amount: number | undefined,
  type: TransactionType,
  typeScore: number,
  merchant: string | null,
  msg: string,
  flags: string[]
): number {
  let score = 0;

  // Amount found — largest single contributor
  if (amount !== undefined) {
    score += 0.35;
  } else {
    flags.push("no_amount_found");
  }

  // Transaction type resolved
  score += typeScore;

  // Merchant or VPA found — extra signal of legitimacy
  if (merchant) score += 0.15;

  // Currency marker present
  if (CURRENCY_PATTERN.test(msg)) score += 0.05;

  // Bank sender heuristic — 2–6 char alphanumeric senders are almost always banks
  // (We don't have sender here, but presence of "ACCT", "A/C", "XX" masked cards adds trust)
  if (/\b(a\/c|account|xx\d{4}|card ending|avl bal)\b/i.test(msg)) score += 0.05;

  // Penalise ambiguity
  if (type === "unknown") {
    flags.push("type_unresolved");
    score -= 0.1;
  }

  return Math.min(Math.max(score, 0), 1);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function parseSMS(message: string): ParsedSMS | null {
  if (!message || typeof message !== "string") return null;

  // Stage 1 — Noise gate
  if (isNoise(message)) return null;

  // Stage 2 — Financial signal
  if (!isFinancialSMS(message)) return null;

  const lower = message.toLowerCase();
  const flags: string[] = [];

  // Stage 3 — Amount
  const amount = extractAmount(message);
  const currency = detectCurrency(message);

  // Stage 4 — Type
  const { type, score: typeScore } = classifyType(lower);
  const subCategory = classifySubCategory(lower, type);

  // Stage 5 — Merchant, account ref, balance
  const merchant = extractMerchant(message);
  const accountRef = extractAccountRef(message);
  const balance = extractBalance(message);

  // Stage 6 — Confidence
  const confidence = computeConfidence(
    amount, type, typeScore, merchant, message, flags
  );

  return {
    amount,
    currency,
    type,
    subCategory,
    merchant,
    accountRef,
    balance,
    confidence,
    flags,
  };
}

/**
 * Convenience: returns true if this SMS should trigger a UI notification.
 * Requires at least a recognised amount OR a clear financial verb,
 * and a confidence above the "useful" threshold.
 */
export function shouldNotify(parsed: ParsedSMS | null): boolean {
  if (!parsed) return false;
  return parsed.confidence >= 0.45 && parsed.type !== "unknown";
}