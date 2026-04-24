package com.xpensio.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * SmsReceiver — Xpensio Financial SMS Detector
 *
 * Detection pipeline (mirrors parseSMS.ts):
 *  1. Noise / spam gate     — blocks OTPs, delivery alerts, promos
 *  2. Financial signal      — keywords + currency patterns
 *  3. Amount validation     — multi-currency, lakh/crore multipliers
 *  4. Transaction type      — EXPENSE · INCOME · TRANSFER · INVESTMENT
 *  5. Notification assembly — merchant / amount / type → summary line
 */
public class SmsReceiver extends BroadcastReceiver {

    private static final String TAG = "XPENSIO_SMS";
    private static final String CHANNEL_ID = "xpensio_sms_channel";

    private static class ParsedResult {
    String amount;
    String merchant;
    String sender;
    String message;
    long timestamp;
    TxType type;
    } 

    private ParsedResult buildNormalizedResult(
        String message,
        String sender,
        long timestamp,
        String lower
    ) {
        ParsedResult r = new ParsedResult();

        r.message = message;
        r.sender = sender;
        r.timestamp = timestamp;

        // ✅ USE YOUR NEW PIPELINE (NO CHANGE)
        r.type = classifyType(lower);
        r.amount = extractAmountForDisplay(message);
        r.merchant = extractMerchant(message);

        // 🔥 BACKWARD COMPATIBILITY (THIS IS THE FIX)

        // Old behavior: merchant fallback to sender
        if (r.merchant == null || r.merchant.isEmpty()) {
            r.merchant = sender;
        }

        // Old behavior: amount can be null (do NOT force anything)
        // keep as-is

        return r;
    }
    // ─── Stage 1: Noise / spam gate ──────────────────────────────────────────

    /**
     * Returns true when the message is spam / noise and should be IGNORED.
     * OTPs, promotions, delivery alerts, and KYC messages are rejected here
     * before any financial parsing begins.
     */
    private boolean isNoise(String lower) {
        // OTP / authentication
        if (lower.contains("otp") ||
            lower.contains("one time password") ||
            lower.contains("verification code") ||
            lower.contains("auth code") ||
            lower.contains("login code")) return true;

        // Delivery / logistics
        if (lower.contains("out for delivery") ||
            lower.contains("your order") ||
            lower.contains("shipment") ||
            lower.contains("parcel") ||
            lower.contains("courier") ||
            lower.contains("awb no") ||
            lower.contains("tracking")) return true;

        // ── Merchant-side payment acknowledgements ────────────────────────────
        // The merchant / payment processor is confirming they received YOUR
        // payment. The bank already sent the real debit SMS. Letting these
        // through would double-count every expense.
        if (lower.contains("we have received") ||
            lower.contains("payment has been received") ||
            lower.contains("has been received") ||
            lower.contains("payment received successfully") ||
            lower.contains("payment successfully received")) return true;
 
        // "payment of Rs X for your <service> has been received" — Jio/telecom
        if (lower.matches(".*payment\\s+of\\s+(rs|inr|₹|\\$|€|£)[\\s.]?\\d.*") &&
            lower.contains("has been received")) return true;
 
        // "received payment of Rs X via BBPS" — starts from merchant POV
        if (lower.matches("^(dear\\s+\\w+[,.]?\\s+)?(we\\s+have\\s+)?received\\s+payment\\s+of.*")) return true;
 
        // ── Bill / due-date reminders ─────────────────────────────────────────
        // No real transaction — just a reminder that a payment is due.
        if (lower.contains("is due on") ||
            lower.contains("due date") ||
            lower.contains("minimum amount due") ||
            lower.contains("min. amount due") ||
            lower.contains("min amount due") ||
            lower.contains("payment due") ||
            lower.contains("please pay by") ||
            lower.contains("kindly pay") ||
            lower.contains("pay before") ||
            lower.contains("bill generated") ||
            lower.contains("bill amount due")) return true;
 
        // "outstanding of Rs X ... is due" — credit card statement reminder
        if (lower.contains("outstanding of") && lower.contains("is due")) return true;


        // Promotional — only reject if there is NO financial verb present
        boolean hasFinancialVerb = hasFinancialVerb(lower);
        if (!hasFinancialVerb) {
            if (lower.contains("offer") || lower.contains("discount") ||
                lower.contains("sale") || lower.contains("coupon") ||
                lower.contains("promo") || lower.contains("exclusive") || lower.contains("cashback") || 
                lower.contains("hurry") || lower.contains("limited time") ||
                lower.contains("click here") || lower.contains("subscribe")) {
                return true;
            }
        }

        // KYC / account activation
        if (lower.contains("kyc") || lower.contains("update your") ||
            lower.contains("verify your") || lower.contains("activate your")) return true;

        // Pure balance enquiry with no transaction event
        if ((lower.contains("your balance is") || lower.contains("bal :") ||
             lower.contains("available balance")) && !hasFinancialVerb) return true;

        return false;
    }

    private boolean hasFinancialVerb(String lower) {
        return lower.contains("debited") || lower.contains("credited") ||
               lower.contains("paid") || lower.contains("spent") ||
               lower.contains("withdrawn") || lower.contains("deposited") ||
               lower.contains("transferred") || lower.contains("received") ||
               lower.contains("sent") || lower.contains("deducted") ||
               lower.contains("reversed") || lower.contains("refunded") ||
               lower.contains("auto debit") || lower.contains("auto-debit") ||
               lower.contains("standing instruction") || lower.contains("mandate") ||
               lower.contains("emi") || lower.contains("sip") ||
               lower.contains("neft") || lower.contains("rtgs") ||
               lower.contains("imps") || lower.contains("upi");
    }

    // ─── Stage 2: Financial signal ────────────────────────────────────────────

    /**
     * Returns true only when the message shows clear signs of a financial event.
     * Requires at least a financial keyword OR (currency symbol + digit).
     */
    private boolean isFinancialSMS(String lower, String original) {
        boolean hasKeyword =
            lower.contains("debited") || lower.contains("credited") ||
            lower.contains("debit") || lower.contains("credit") ||
            lower.contains("spent") || lower.contains("paid") ||
            lower.contains("payment") || lower.contains("withdraw") ||
            lower.contains("deposit") || lower.contains("transfer") ||
            lower.contains("received") || lower.contains("sent") ||
            lower.contains("emi") || lower.contains("sip") ||
            lower.contains("neft") || lower.contains("rtgs") ||
            lower.contains("imps") || lower.contains("upi") ||
            lower.contains("auto debit") || lower.contains("mandate") ||
            lower.contains("standing instruction") ||
            lower.contains("mutual fund") || lower.contains("mf purchase") ||
            lower.contains("refund") || lower.contains("reversal") ||
            lower.contains("dividend") || lower.contains("salary") || lower.contains("investment") ||
            lower.contains("insurance premium") || lower.contains("atm") ||
            lower.contains("purchase") || lower.contains("transaction") ||
            lower.contains("charged") || lower.contains("withdrawal") ||
            lower.contains("subscription");

        boolean hasCurrencyAndDigit = hasCurrencySymbol(original) && original.matches(".*\\d+.*");

        return hasKeyword || hasCurrencyAndDigit;
    }

    private boolean hasCurrencySymbol(String text) {
        // Covers INR, USD, EUR, GBP, JPY, AED, SGD, MYR, BRL, ZAR, KRW, THB, etc.
        return text.matches("(?i).*(\u20B9|rs\\.?|inr|\\$|usd|aud|cad|sgd|€|eur|£|gbp|¥|jpy|cny|aed|myr|rm\\s|brl|r\\$|zar|krw|\u20A9|thb|\u0E3F).*");
    }

    // ─── Stage 3: Amount validation ───────────────────────────────────────────

    /**
     * Returns true when the SMS contains at least one valid financial amount.
     * Handles:
     *  - ₹1,23,456.78 / Rs 1234 / INR 500
     *  - $1,234.56 / €999 / £450
     *  - "2 lakh" / "1.5 crore" (Indian shorthand)
     */
    static boolean containsAmount(String message) {
        if (message == null) return false;

        // Standard currency + number pattern (multi-currency)
        if (message.matches(
                "(?i).*(\u20B9|rs\\.?\\s?|inr\\s?|\\$|usd\\s?|aud\\s?|cad\\s?|sgd\\s?|€|eur\\s?|£|gbp\\s?|¥|aed\\s?|myr\\s?|rm\\s)"
                + "[\\s]?[0-9,]+(\\.[0-9]{1,2})?.*")) {
            return true;
        }

        // Indian lakh / crore shorthand
        if (message.matches("(?i).*[0-9]+(\\.[0-9]+)?\\s*(lakh|lac|crore|cr)\\b.*")) {
            return true;
        }

        // Bare numeric amount with a financial verb nearby — last resort
        if (message.matches("(?i).*(debited|credited|paid|spent|withdrawn|deposited).*[0-9]{2,}.*")
                || message.matches("(?i).*[0-9]{2,}.*(debited|credited|paid|spent|withdrawn|deposited).*")) {
            return true;
        }

        return false;
    }

    // ─── Stage 4: Transaction type ────────────────────────────────────────────

    private enum TxType { EXPENSE, INCOME, TRANSFER, INVESTMENT, UNKNOWN }

    private TxType classifyType(String lower) {

    // ─── Investment (keep first) ───
    if (lower.contains("sip") || lower.contains("systematic investment") ||
        lower.contains("mutual fund") || lower.contains("mf purchase") ||
        lower.contains("mf invest") || lower.contains("nav") ||
        lower.contains("folio") || lower.contains("units allotted") ||
        lower.contains("units allocated") || lower.contains("elss") ||
        lower.contains("nps") || lower.contains("ppf") ||
        lower.contains("insurance premium") || lower.contains("ulip") ||
        lower.contains("ipo allot") || lower.contains("sovereign gold")) {
        return TxType.INVESTMENT;
    }

    // ─── Transfer (NEW — IMPORTANT) ───
    if ((lower.contains("transfer") || lower.contains("transferred") ||
         lower.contains("neft") || lower.contains("rtgs") ||
         lower.contains("imps") || lower.contains("fund transfer") ||
         lower.contains("self transfer")) &&
        !lower.contains("received") && !lower.contains("credited")) {
        return TxType.TRANSFER;
    }

    // ─── Expense ───
    if (lower.contains("debited") || lower.contains("deducted") ||
        lower.contains("spent") || lower.contains("paid") || lower.contains("sent") || 
        lower.contains("payment") || lower.contains("purchase") ||
        lower.contains("charged") || lower.contains("withdraw") ||
        lower.contains("withdrawn") || lower.contains("atm") ||
        lower.contains("emi") || lower.contains("mandate executed") ||
        lower.contains("auto debit") || lower.contains("auto-debit") ||
        lower.contains("standing instruction") ||

        // 🔥 NEW additions
        lower.contains("dr.") || lower.contains("dr ") ||
        lower.contains("fee") || lower.contains("charges") ||
        lower.contains("gst") || lower.contains("txn") ||
        lower.contains("upi payment") || lower.contains("upi txn")
    ) {
        return TxType.EXPENSE;
    }

    // ─── Income ───
    if (lower.contains("credited") || lower.contains("received") ||
        lower.contains("deposited") || lower.contains("deposit") ||
        lower.contains("salary") || lower.contains("payroll") ||
        lower.contains("refund") || lower.contains("reversal") ||
        lower.contains("reversed") ||
        lower.contains("reward") || lower.contains("dividend") ||
        lower.contains("interest credited") ||

        // 🔥 NEW additions
        lower.contains("cr.") || lower.contains("cr ") ||
        lower.contains("interest") // sometimes appears alone
    ) {
        return TxType.INCOME;
    }

    return TxType.UNKNOWN;
}

    // ─── Stage 5: Merchant extraction ────────────────────────────────────────
 
    /**
     * Priority cascade — tries reliable patterns first, stops on first clean match.
     *
     * Pattern parity with parseSMS.ts:
     *  P1  "to/at <merchant>" with terminator guard — @ included for VPAs
     *  P2  "paid/sent to <merchant>" with terminator guard
     *  P3  "received from <source>" with terminator guard
     *  P4  explicit VPA prefix (vpa: / upi id: / upi ref:) — full addr@domain
     *  P5  bare VPA anywhere — word@word (catches Kotak-style messages)
     *  P6  fallback "at <Merchant>" no terminator
     *  P7  fallback "to <Merchant>" no terminator
     */
    private String extractMerchant(String message) {
        // P1: "from beneficiary <n>" — explicit in NEFT/RTGS credit SMS
        // e.g. "credited ... via NEFT from beneficiary LOGICASANA PRIVATE LIMITED. UTR"
        Pattern p1 = Pattern.compile(
            "\\bfrom\\s+beneficiary\\s+([A-Z][A-Za-z0-9 &.\\-_]{1,60}?)(?:\\.|,|$|\\s+(?:utr|ref|on\\s+\\d))",
            Pattern.CASE_INSENSITIVE);
        String r1 = firstMatch(p1, message);
        if (r1 != null) return r1;
 
        // P2: "to/at <MERCHANT>" with look-ahead terminator; @ included for VPA addresses
        Pattern p2 = Pattern.compile(
            "\\b(?:to|at)\\s+([A-Z0-9][A-Za-z0-9 &.\\-_/@]{1,60}?)\\s+" +
            "(?:via|on|for|using|with|ref|upi\\s*ref|a\\/c|ac|account|rs|inr|\u20B9|\\d)",
            Pattern.CASE_INSENSITIVE);
        String r2 = firstMatch(p2, message);
        if (r2 != null) return r2;
 
        // P3a: Kotak-style "Sent Rs.X from <Bank> AC XXXX to <recipient> on ..."
        // Captures "Bank AC XXXX to YYYY" as merchant. Returned directly (no cleanMerchant)
        // because the result starts with a bank name which is blocklisted.
        Pattern p3a = Pattern.compile(
            "\\bsent\\s+(?:rs\\.?|\u20B9|inr)\\s*[\\d,.]+\\s+from\\s+" +
            "([A-Za-z ]+(?:bank\\s+)?(?:a\\/c|ac|account)\\s+[A-Za-z0-9]+\\s+to\\s+[A-Za-z0-9][A-Za-z0-9._@\\-]*)\\s+on\\b",
            Pattern.CASE_INSENSITIVE);
        Matcher m3a = p3a.matcher(message);
        if (m3a.find()) {
            String raw = m3a.group(1).trim().replaceAll("[.,;:]+$", "");
            if (raw.length() >= 2) return raw;
        }

        // P3: "paid/sent to <MERCHANT>" with look-ahead terminator
        Pattern p3 = Pattern.compile(
            "\\b(?:paid|sent)\\s+(?:to\\s+)?([A-Z0-9][A-Za-z0-9 &.\\-_/@]{1,60}?)\\s+" +
            "(?:via|on|for|using|with|ref|upi\\s*ref|a\\/c|rs|inr|\u20B9|\\d)",
            Pattern.CASE_INSENSITIVE);
        String r3 = firstMatch(p3, message);
        if (r3 != null) return r3;
 
        // P4: "received from <SOURCE>" with look-ahead terminator
        Pattern p4 = Pattern.compile(
            "\\breceived\\s+(?:from\\s+)?([A-Z0-9][A-Za-z0-9 &.\\-_/@]{1,60}?)\\s+" +
            "(?:via|on|for|using|ref|a\\/c|rs|inr|\u20B9|\\d)",
            Pattern.CASE_INSENSITIVE);
        String r4 = firstMatch(p4, message);
        if (r4 != null) return r4;
 
        // P5: explicit VPA prefix — captures full addr@domain
        Pattern p5 = Pattern.compile(
            "(?:vpa|upi\\s*id|upi\\s*ref)[:\\s]+([A-Za-z0-9.\\-_]+@[A-Za-z0-9.\\-_]+)",
            Pattern.CASE_INSENSITIVE);
        String r5 = firstMatch(p5, message);
        if (r5 != null) return r5;
 
        // P6: bare VPA anywhere in message — word@word (e.g. tataplaylt.bdpg@kotakpay)
        Pattern p6 = Pattern.compile(
            "\\b([A-Za-z0-9][A-Za-z0-9.\\-_]{2,40}@[A-Za-z0-9][A-Za-z0-9.\\-_]{2,30})\\b");
        String r6 = firstMatch(p6, message);
        if (r6 != null) return r6;
 
        // P7: fallback "at <MERCHANT>" — no terminator
        Pattern p7 = Pattern.compile(
            "\\bat\\s+([A-Z][A-Za-z0-9 &.\\-]{1,35})",
            Pattern.CASE_INSENSITIVE);
        String r7 = firstMatch(p7, message);
        if (r7 != null) return r7;
 
        // P8: fallback "to <MERCHANT>" — no terminator
        Pattern p8 = Pattern.compile(
            "\\bto\\s+([A-Z][A-Za-z0-9 &.\\-]{1,35})",
            Pattern.CASE_INSENSITIVE);
        return firstMatch(p8, message);
    }
 
    /** Runs a pattern against message, cleans result, returns null if blocklisted. */
    private String firstMatch(Pattern p, String message) {
        Matcher m = p.matcher(message);
        if (!m.find()) return null;
        return cleanMerchant(m.group(1));
    }
 
    private static final java.util.Set<String> MERCHANT_BLOCKLIST;
    static {
        MERCHANT_BLOCKLIST = new java.util.HashSet<>(java.util.Arrays.asList(
            "your", "you", "the", "a", "an", "our", "us",
            "bank", "axis", "sbi", "hdfc", "icici", "kotak", "yes", "rbl",
            "account", "acc", "a/c", "card", "wallet", "upi", "neft", "imps", "rtgs",
            "ref", "reference", "txn", "tran", "transaction", "id",
            "avl", "bal", "balance", "available",
            "rs", "inr", "mr", "mrs", "ms", "dr",
            "dear", "customer", "info", "alert", "update"
        ));
    }

      /**
     * Returns true if the candidate's first word is a blocklisted template word.
     * Catches multi-word false positives like "your Kotak Bank" or "the account".
     */
    private boolean startsWithBlocklisted(String s) {
        if (s == null || s.isEmpty()) return false;
        String firstWord = s.trim().split("\\s+")[0].toLowerCase();
        return MERCHANT_BLOCKLIST.contains(firstWord);
    }
 
    /**
     * Cleans a raw merchant candidate.
     * VPA strings (containing @) are treated differently — the blocklist is
     * not applied and @ is preserved, mirroring parseSMS.ts cleanMerchant().
     */
      private String cleanMerchant(String raw) {
        if (raw == null) return null;
        boolean isVpa = raw.contains("@");
        String cleaned = raw.trim()
            .replaceAll("\\s+", " ")
            .replaceAll(isVpa ? "[^A-Za-z0-9.\\-_/@]" : "[^A-Za-z0-9 &.\\-_]", "")
            .trim();
        if (cleaned.length() < 2) return null;
        if (!isVpa && MERCHANT_BLOCKLIST.contains(cleaned.toLowerCase())) return null;
        if (!isVpa && startsWithBlocklisted(cleaned)) return null;
        if (cleaned.matches("^\\d+$")) return null;           // pure number
        if (cleaned.matches("^[Xx*]+\\d{3,6}$")) return null; // masked account tail
        return cleaned;
    }

    // ─── Amount for notification ──────────────────────────────────────────────

    private String extractAmountForDisplay(String message) {
        // Lakh / crore shorthand
        Matcher lc = Pattern.compile(
            "(?i)(?:\u20B9|rs\\.?\\s?)?([0-9]+(?:\\.[0-9]+)?)\\s*(lakh|lac|crore|cr)\\b"
        ).matcher(message);
        if (lc.find()) {
            double base = Double.parseDouble(lc.group(1));
            String unit = lc.group(2).toLowerCase();
            double val = (unit.equals("crore") || unit.equals("cr")) ? base * 1e7 : base * 1e5;
            return "\u20B9" + String.format("%,.0f", val);
        }

        // Standard currency + amount
        Matcher m = Pattern.compile(
            "(?i)(?:\u20B9|rs\\.?\\s*|inr\\s*|\\$|€|£|¥|aed\\s*)([0-9,]+(?:\\.[0-9]{1,2})?)"
        ).matcher(message);
        if (m.find()) {
            String symbol = detectCurrencySymbol(message);
            return symbol + m.group(1);
        }
        return null;
    }

    private String detectCurrencySymbol(String text) {
        if (text.contains("\u20B9") || text.toLowerCase().contains("rs") || text.toLowerCase().contains("inr")) return "\u20B9";
        if (text.contains("$")) return "$";
        if (text.contains("€")) return "€";
        if (text.contains("£")) return "£";
        if (text.contains("¥")) return "¥";
        return "";
    }

    // ─── Main receiver ───────────────────────────────────────────────────────

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "Receiver triggered");

        Bundle bundle = intent.getExtras();
        if (bundle == null) return;

        Object[] pdus = (Object[]) bundle.get("pdus");
        if (pdus == null) return;

        StringBuilder fullMessage = new StringBuilder();
        String sender = null;
        long timestamp = 0;
        String format = bundle.getString("format");

        for (Object pdu : pdus) {
            SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu, format);
            if (sender == null) {
                sender = sms.getOriginatingAddress();
                timestamp = sms.getTimestampMillis();
            }
            fullMessage.append(sms.getMessageBody());
        }

        String message = fullMessage.toString();
        String lower = message.toLowerCase();

        // Pipeline: noise gate → financial signal → amount check
        if (isNoise(lower)) {
            Log.d(TAG, "Rejected (noise): " + sender);
            return;
        }

        if (!isFinancialSMS(lower, message)) {
            Log.d(TAG, "Rejected (not financial): " + sender);
            return;
        }

        if (!containsAmount(message)) {
            Log.d(TAG, "Rejected (no amount): " + sender);
            return;
        }

        Log.d(TAG, "Financial SMS accepted from " + sender + ": " + message);

        ParsedResult parsed = buildNormalizedResult(message, sender, timestamp, lower);

        // ✅ KEEP OLD STRUCTURE
        SmsStorage.saveSms(context, parsed.message, parsed.sender, parsed.timestamp);
        SmsListenerPlugin.notifySms(parsed.message, parsed.sender, parsed.timestamp);

        // ✅ use parsed for notification
        showNotification(context, parsed);
    }

    // ─── Notification ─────────────────────────────────────────────────────────

    private void showNotification(Context context, ParsedResult parsed) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            Log.d(TAG, "Notification permission not granted");
            return;
        }

        NotificationManager manager =
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Transaction Detected",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Xpensio financial SMS alerts");
            manager.createNotificationChannel(channel);
        }

        String lower = parsed.message.toLowerCase();


        TxType type = classifyType(lower);
        String title = buildNotificationTitle(parsed.type, lower);
        String summary = buildNotificationSummary(parsed.message, parsed.sender, type);

        Intent clickIntent = new Intent(context, MainActivity.class);
        clickIntent.putExtra("sms_message", parsed.message);
        clickIntent.putExtra("sms_sender", parsed.sender);
        clickIntent.putExtra("sms_timestamp", parsed.timestamp);
        clickIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            (int) System.currentTimeMillis(),
            clickIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(summary)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setColor(0xFF7C6CFF)
            .build();

        manager.notify((int) System.currentTimeMillis(), notification);
    }

    private String buildNotificationTitle(TxType type, String lower) {
        switch (type) {
            case EXPENSE:    return "Expense detected";
            case INCOME:     return "Income received";
            case TRANSFER:   return "Transfer detected";
            case INVESTMENT: return "Investment recorded";
            default:         return "Transaction detected";
        }
    }

    private String buildNotificationSummary(String message, String sender, TxType type) {
        String amount = extractAmountForDisplay(message);
        String merchant = extractMerchant(message);

        if (merchant == null || merchant.isEmpty()) {
            // Fall back to sender as display name for notification
            merchant = (sender != null && sender.length() <= 10) ? sender : null;
        }

        if (amount != null && merchant != null) return amount + " \u2022 " + merchant;
        if (amount != null)                     return amount + " \u2022 Tap to review";
        if (merchant != null)                   return merchant + " \u2022 Tap to review";
        return "New transaction \u2022 Tap to review";
    }
}