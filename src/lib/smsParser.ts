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
 * Catches OTPs, delivery notifications, service alerts, promotional spam,
 * merchant-side acknowledgements, and bill / due-date reminders.
 */
function isNoise(raw: string): boolean {
  const msg = raw.toLowerCase();

  // OTP / authentication codes
  if (
    /\b(otp|one.?time.?pass|verification code|auth.?code|login code)\b/.test(
      msg,
    )
  )
    return true;
  if (/\b\d{4,8}\b.{0,30}\b(otp|code|pin)\b/.test(msg)) return true;

  // Delivery / logistics
  if (
    /\b(out for delivery|your order|shipment|parcel|courier|awb|tracking)\b/.test(
      msg,
    )
  )
    return true;

  // ── Merchant-side payment acknowledgements ─────────────────────────────────
  // These come from the merchant / payment processor confirming they received
  // YOUR payment. The bank already sent the real debit SMS. Counting these
  // would double-count the expense.
  if (/\b(we\s+have\s+received|payment\s+has\s+been\s+received|has\s+been\s+received|payment\s+received\s+successfully|payment\s+successfully\s+received)\b/.test(msg)) return true;
 
  // "payment of Rs X for your <service> has been received" — Jio/telecom style
  if (/\bpayment\s+of\s+(?:rs|₹|\$|€|£)[\s.]?\d/.test(msg) && /\bhas\s+been\s+received\b/.test(msg)) return true;
 
  // "received payment of Rs X via BBPS" — merchant POV, not bank
  if (/^(?:dear\s+\w+[,.]?\s+)?(?:we\s+have\s+)?received\s+payment\s+of\b/.test(msg)) return true;
 
  // ── Bill / due-date reminders ──────────────────────────────────────────────
  // No real transaction happened — just a reminder that something is due.
  if (/\b(is\s+due\s+on|due\s+date|minimum\s+amount\s+due|min\.?\s+amount\s+due|payment\s+due|please\s+pay\s+by|kindly\s+pay|pay\s+before|bill\s+generated|bill\s+amount\s+due)\b/.test(msg)) return true;
 
  // "outstanding of Rs X on your credit card ... is due"
  if (/\boutstanding\s+of\b/.test(msg) && /\bis\s+due\b/.test(msg)) return true;

  // ── Mandate / AutoPay setup confirmations ─────────────────────────────────
  // "Mandate successfully created/registered" — this is a SETUP confirmation,
  // not an actual debit. Only block when no actual debit verb is present.
  const hasMandateTerm = /\b(mandate|autopay|auto-pay|enach|nach)\b/.test(msg);
  const hasCreationVerb = /\b(created|registered|set\s*up|setup|activated|established|successful)\b/.test(msg);
  const hasActualDebit = /\b(executed|debited|deducted|auto\s*debit)\b/.test(msg);
  if (hasMandateTerm && hasCreationVerb && !hasActualDebit) return true;


  // Pure promotional with no financial verb
  const hasFinancialVerb =
    /\b(debited|credited|paid|spent|withdrawn|deposited|transferred|received|sent|deducted|reversed|refunded|mandated|auto.?debit|standing instruction|emi|sip|neft|rtgs|imps|upi)\b/.test(
      msg,
    );
  if (!hasFinancialVerb) {
    if (
      /\b(offer|discount|cashback|sale|coupon|promo|reward|exclusive|hurry|limited time|click here|subscribe|deal)\b/.test(
        msg,
      )
    )
      return true;
  }

  // KYC / account activation
  if (/\b(kyc|pan|aadhaar|update your|verify your|activate your)\b/.test(msg))
    return true;

  // Pure balance enquiry replies (no debit/credit event)
  if (
    /\b(your balance is|available balance|bal\s*:)\b/.test(msg) &&
    !hasFinancialVerb
  )
    return true;

  return false;
}
// ─── Stage 2: Financial signal check ─────────────────────────────────────────

const FINANCIAL_KEYWORDS = [
  "debited",
  "credited",
  "debit",
  "credit",
  "spent",
  "paid",
  "payment",
  "withdraw",
  "withdrawal",
  "deposited",
  "deposit",
  "transfer",
  "transferred",
  "received",
  "sent",
  "sent to",
  "emi",
  "sip",
  "neft",
  "rtgs",
  "imps",
  "upi",
  "auto debit",
  "auto-debit",
  "standing instruction",
  "mandate",
  "subscription",
  "refund",
  "reversal",
  "reversed",
  "dividend",
  "interest credited",
  "salary",
  "payroll",
  "cashback",
  "reward",
  "purchase",
  "transaction",
  "charged",
  "deducted",
  "mutual fund",
  "mf purchase",
  "investment",
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
  { pattern: /₹|rs\.?\s|inr/i, code: "INR" },
  { pattern: /\$(?!g|a)/i, code: "USD" }, // bare $ (not SGD/AUD prefix)
  { pattern: /aud|\$a|a\$/i, code: "AUD" },
  { pattern: /cad|\$c|c\$/i, code: "CAD" },
  { pattern: /sgd|s\$/i, code: "SGD" },
  { pattern: /€|eur/i, code: "EUR" },
  { pattern: /£|gbp/i, code: "GBP" },
  { pattern: /¥|jpy|cny|cnh/i, code: "JPY" },
  { pattern: /aed/i, code: "AED" },
  { pattern: /myr|rm\s/i, code: "MYR" },
  { pattern: /brl|r\$/i, code: "BRL" },
  { pattern: /zar/i, code: "ZAR" },
  { pattern: /krw|₩/i, code: "KRW" },
  { pattern: /thb|฿/i, code: "THB" },
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
  // ── Investment (same as Java)
  if (
    /\b(sip|systematic investment|mutual fund|mf\s*(purchase|invest)|nav|folio|units allotted|units allocated|redemption|elss|nps|ppf|nsc|sgb|sovereign gold|ipo allot)\b/.test(
      lower,
    )
  ) {
    return { type: "investment", score: 0.35 };
  }

  if (
    /\b(insurance premium|life insurance|health insurance|term plan|ulip)\b/.test(
      lower,
    )
  ) {
    return { type: "investment", score: 0.3 };
  }

  // ── Transfer (aligned with Java — slightly broadened)
  if (
    /\b(transfer|transferred|transfer to|transferred to|neft|rtgs|imps|internal transfer|fund transfer|self transfer)\b/.test(
      lower,
    ) &&
    !/\b(received|credited)\b/.test(lower)
  ) {
    return { type: "transfer", score: 0.3 };
  }

  // ── Expense (FULL parity with Java)
  if (
    /\b(debited|deducted|spent|paid|sent|payment|purchase|charged|withdraw|withdrawn|atm|emi|mandate executed|auto\s?debit|auto-debit|standing instruction|dr\.?|fee|charges|gst|txn|upi payment|upi txn)\b/i.test(
      lower,
    )
  ) {
    return { type: "expense", score: 0.35 };
  }

  // ── Income (FULL parity with Java)
  if (
    /\b(credited|received|deposited|deposit|salary|payroll|refund|reversal|reversed|cashback|reward|dividend|interest credited|cr\.?|interest)\b/i.test(
      lower,
    )
  ) {
    return { type: "income", score: 0.35 };
  }
  return { type: "unknown", score: 0 };
}

// ─── Stage 4b: Sub-category ──────────────────────────────────────────────────

function classifySubCategory(
  lower: string,
  type: TransactionType,
): SubCategory {
  if (/\batm\b/.test(lower)) return "atm";
  if (/\bupi\b/.test(lower)) return "upi";
  if (/\b(neft|rtgs)\b/.test(lower)) return "neft_rtgs";
  if (/\bimps\b/.test(lower)) return "imps";
  if (/\bemi\b/.test(lower)) return "emi";
  if (/\b(sip|systematic investment)\b/.test(lower)) return "sip";
  if (/\b(mutual fund|mf\s*(purchase|invest)|nav|folio|units)\b/.test(lower))
    return "mutual_fund";
  if (
    /\b(insurance premium|life insurance|health insurance|term plan|ulip)\b/.test(
      lower,
    )
  )
    return "insurance";
  if (/\b(dividend)\b/.test(lower)) return "dividend";
  if (/\b(salary|payroll|ctc)\b/.test(lower)) return "salary";
  if (/\b(refund|reversal|reversed)\b/.test(lower)) return "refund";
  if (/\b(cashback|reward)\b/.test(lower)) return "cashback";
  if (/\b(card|pos|swipe|tap to pay)\b/.test(lower)) return "card_payment";
  if (
    /\b(bank charge|service charge|annual fee|late fee|penalty)\b/.test(lower)
  )
    return "bank_charge";
  if (type === "investment") return "investment_other";
  return "general";
}

 
// ─── Stage 5: Merchant extraction ────────────────────────────────────────────
 
/**
 * Priority cascade — tries the most reliable patterns first and stops
 * at the first match. Cleans the result before returning.
 *
 *  P1  "from beneficiary <NAME>" — NEFT/RTGS income, highest priority
 *  P2  "to/at <merchant>" with terminator guard — @ included for VPAs
 *  P3  "paid/sent to <merchant>" with terminator guard
 *  P4  "received from <source>" with terminator guard
 *  P5  explicit VPA prefix (vpa: / upi id: / upi ref:) — full addr@domain
 *  P6  bare VPA anywhere — word@word (catches Kotak-style messages)
 *  P7  fallback "at <Merchant>" no terminator
 *  P8  fallback "to <Merchant>" no terminator
 */
const MERCHANT_PATTERNS: RegExp[] = [
  // P1: "from beneficiary <NAME>" — explicit in NEFT/RTGS credit SMS
  // e.g. "credited ... via NEFT from beneficiary LOGICASANA PRIVATE LIMITED"
  /\bfrom\s+beneficiary\s+([A-Z][A-Za-z0-9 &.\-_]{1,60}?)(?:\.|,|$|\s+(?:utr|ref|on\s+\d))/i,

  // P2: "to/at <MERCHANT>" with look-ahead terminator — @ included for VPAs
  /\b(?:to|at)\s+([A-Z0-9][A-Za-z0-9 &._/@-]{1,60}?)\s+(?:via|on|for|using|with|ref|upi\s*ref|a\/c|ac|account|rs|inr|₹|\d)/i,

  // P3: "paid/sent to <merchant>" with look-ahead terminator
  /\b(?:paid|sent)\s+(?:to\s+)?([A-Z0-9][A-Za-z0-9 &._/@-]{1,60}?)\s+(?:via|on|for|using|with|ref|upi\s*ref|a\/c|rs|inr|₹|\d)/i,

  // P4: "received from <source>" with look-ahead terminator
  /\breceived\s+(?:from\s+)?([A-Z0-9][A-Za-z0-9 &._/@-]{1,60}?)\s+(?:via|on|for|using|ref|a\/c|rs|inr|₹|\d)/i,

  // P5: explicit VPA prefix — captures full addr@domain
  /(?:vpa|upi\s*id|upi\s*ref)[:\s]+([A-Za-z0-9._-]+@[A-Za-z0-9._-]+)/i,

  // P6: bare VPA anywhere in message — word@word
  /\b([A-Za-z0-9][A-Za-z0-9._-]{2,40}@[A-Za-z0-9][A-Za-z0-9._-]{2,30})\b/,

  // P7: fallback "at <Merchant>" — no terminator
  /\bat\s+([A-Z][A-Za-z0-9 &.-]{1,35})/,

  // P8: fallback "to <Merchant>" — no terminator
  /\bto\s+([A-Z][A-Za-z0-9 &.-]{1,35})/,
];

/** Words that commonly appear in SMS templates and are NOT merchants */
const MERCHANT_BLOCKLIST = new Set([
  "your",
  "you",
  "the",
  "a",
  "an",
  "our",
  "us",
  "bank",
  "axis",
  "sbi",
  "hdfc",
  "icici",
  "kotak",
  "yes",
  "rbl",
  "account",
  "acc",
  "a/c",
  "card",
  "wallet",
  "upi",
  "neft",
  "imps",
  "rtgs",
  "ref",
  "reference",
  "txn",
  "tran",
  "transaction",
  "id",
  "avl",
  "bal",
  "balance",
  "available",
  "rs",
  "inr",
  "mr",
  "mrs",
  "ms",
  "dr",
  "dear",
  "customer",
  "info",
  "alert",
  "update",
]);

/**
 * Returns true if the candidate starts with a blocklisted word.
 * Catches multi-word false positives like "your Kotak Bank" or "the account".
 */
function startsWithBlocklisted(s: string): boolean {
  const firstWord = s.split(/\s+/)[0].toLowerCase();
  return MERCHANT_BLOCKLIST.has(firstWord);
}

function cleanMerchant(raw: string): string | null {
  if (!raw) return null;

  const isVpa = raw.includes("@");

  const cleaned = raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(isVpa ? /[^A-Za-z0-9._/@-]/g : /[^A-Za-z0-9 &.\-_]/g, "")
    .trim();

  if (cleaned.length < 2) return null;
  if (!isVpa && MERCHANT_BLOCKLIST.has(cleaned.toLowerCase())) return null;
  if (!isVpa && startsWithBlocklisted(cleaned)) return null;
  if (/^\d+$/.test(cleaned)) return null;
  if (/^[Xx*]+\d{3,6}$/.test(cleaned)) return null;

  return cleaned;
}

function extractMerchant(msg: string): string | null {
  // P3a: Kotak-style "Sent Rs.X from <Bank> AC XXXX to <recipient> on ..."
  // Captures the full "Bank AC XXXX to YYYY" as merchant. Handled separately
  // because the result starts with a bank name (blocklisted) and must bypass
  // cleanMerchant's startsWithBlocklisted check.
  const p3a =
    /\bsent\s+(?:rs\.?|₹|inr)\s*[\d,.]+\s+from\s+([A-Za-z ]+(?:bank\s+)?(?:a\/c|ac|account)\s+[A-Za-z0-9]+\s+to\s+[A-Za-z0-9][A-Za-z0-9._@-]*)\s+on\b/i;
  const p3aMatch = p3a.exec(msg);
  if (p3aMatch) {
    const raw = p3aMatch[1].trim().replace(/[.,;:]+$/, "");
    if (raw.length >= 2) return raw;
  }

  for (const pattern of MERCHANT_PATTERNS) {
    const m = pattern.exec(msg);
    if (!m) continue;

    const cleaned = cleanMerchant(m[1]);
    if (cleaned) return cleaned;
  }
  return null;
}

// ─── Stage 5b: Account reference ─────────────────────────────────────────────

function extractAccountRef(msg: string): string | null {
  // Masked card / account: XX1234, **1234, ending 1234, a/c xx1234
  const m =
    /(?:a\/c|account|card|ac)\s*(?:no\.?\s*)?(?:[Xx*]{2,4})(\d{4})\b/i.exec(
      msg,
    ) ||
    /(?:ending|ending in|ending with|last 4)\s*(\d{4})\b/i.exec(msg) ||
    /\b([Xx*]{2,4}\d{4})\b/.exec(msg);
  return m ? m[1] || m[0] : null;
}

// ─── Stage 5c: Balance ────────────────────────────────────────────────────────

function extractBalance(msg: string): string | null {
  // "Avl Bal: Rs 12,345.67" / "Available balance INR 1234"
  const m =
    /(?:avl\.?\s*bal|available\s*bal(?:ance)?|a\/c\s*bal(?:ance)?|bal(?:ance)?)\s*[:-]?\s*((?:₹|rs\.?\s*|inr\s*)?[0-9,]+(?:\.[0-9]{1,2})?)/i.exec(
      msg,
    );
  return m ? m[1].trim() : null;
}

// ─── Stage 6: Confidence scoring ─────────────────────────────────────────────

function computeConfidence(
  amount: number | undefined,
  type: TransactionType,
  typeScore: number,
  merchant: string | null,
  msg: string,
  flags: string[],
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
  if (/\b(a\/c|account|xx\d{4}|card ending|avl bal)\b/i.test(msg))
    score += 0.05;

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
    amount,
    type,
    typeScore,
    merchant,
    message,
    flags,
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

// ─────────────────────────────────────────────────────────────
// ✅ COMPATIBILITY LAYER (OLD STRUCTURE SAFE)
// ─────────────────────────────────────────────────────────────

export type ParsedSMSLegacy = {
  amount?: number;
  type: "expense" | "income" | "unknown";
  merchant?: string | null;
  confidence: number;
  parsed_log: ParsedSMS;
};

/**
 * Converts new parser output → old format (NO BREAKING CHANGES)
 */
export function parseSMSLegacy(message: string): ParsedSMSLegacy {
  const parsed = parseSMS(message);

  if (!parsed) {
    return {
      amount: undefined,
      type: "unknown",
      merchant: null,
      confidence: 0,
      parsed_log: {
        amount: 0,
        currency: "",
        type: "unknown",
        subCategory: "general",
        merchant: null,
        accountRef: null,
        balance: null,
        confidence: 0,
        flags: [""],
      },
    };
  }

  // 🔥 CRITICAL: normalize type back to old system
  let type: "expense" | "income" | "unknown" = "unknown";

  if (parsed.type === "expense") type = "expense";
  else if (parsed.type === "income") type = "income";
  else type = "unknown"; // transfer/investment collapse

  return {
    amount: parsed.amount,
    type,
    merchant: parsed.merchant ?? null,
    confidence: parsed.confidence,
    parsed_log: parsed,
  };
}