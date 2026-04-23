package com.xpensio.app;

import android.util.Log;
import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.telephony.SmsMessage;

// 🔔 Notification imports
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.app.Notification;
import android.os.Build;
import android.app.PendingIntent;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SmsReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {

        Log.d("XPENSIO_SMS", "Receiver triggered!");

        Bundle bundle = intent.getExtras();

        if (bundle != null) {
            Object[] pdus = (Object[]) bundle.get("pdus");

            if (pdus != null) {
                for (Object pdu : pdus) {
                    SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu);

                    String message = sms.getMessageBody();
                    String sender = sms.getOriginatingAddress();
                    long timestamp = sms.getTimestampMillis();

                    if (isFinancialSMS(message) && containsAmount(message)) {
                        Log.d("XPENSIO_SMS", "SMS: " + message);

                        // ✅ Save only financial SMS
                        SmsStorage.saveSms(context, message, sender, timestamp);

                        // ✅ Send to JS if app open
                        SmsListenerPlugin.notifySms(message, sender, timestamp);

                        // ✅ Show notification
                        showNotification(context, message, sender);
                    }
                }
            }
        }
    }

    private void showNotification(Context context, String message, String sender) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            Log.d("XPENSIO_SMS", "Notification permission not granted.");
            return;
        }

        String channelId = "xpensio_sms";

        NotificationManager manager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        // Create channel (Android 8+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    channelId,
                    "SMS Detection",
                    NotificationManager.IMPORTANCE_HIGH
            );
            manager.createNotificationChannel(channel);
        }

        String title = "Transaction detected";
        String lower = message.toLowerCase();

        if (lower.contains("debited") ||
                lower.contains("spent") ||
                lower.contains("paid") ||
                lower.contains("withdraw") ||
                lower.contains("sent")) {
            title = "Expense detected";
        } else if (lower.contains("credited") ||
                lower.contains("received") ||
                lower.contains("deposit")) {
            title = "Income detected";
        }

        String summary = buildNotificationSummary(message, sender);

        // 🔥 CREATE INTENT FIRST (THIS WAS MISSING)
        Intent clickIntent = new Intent(context, MainActivity.class);

        // 🔥 pass data
        clickIntent.putExtra("sms_message", message);

        clickIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                (int) System.currentTimeMillis(),
                clickIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new NotificationCompat.Builder(context, channelId)
                .setContentTitle(title)
                .setContentText(summary)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .setColor(0xFF7C6CFF)
                .build();

        manager.notify((int) System.currentTimeMillis(), notification);
    }

    private String buildNotificationSummary(String message, String sender) {
        String amount = extractAmount(message);
        String merchant = extractMerchant(message);

        if (merchant == null || merchant.isEmpty()) {
            merchant = sender;
        }

        if (amount != null && merchant != null && !merchant.isEmpty()) {
            return amount + " • " + merchant;
        }

        if (amount != null) {
            return amount + " • Tap to review";
        }

        if (merchant != null && !merchant.isEmpty()) {
            return merchant + " • Tap to review";
        }

        return "New transaction • Tap to review";
    }

    private String extractAmount(String message) {
        Matcher matcher = Pattern
                .compile("(?i)(?:₹|rs\\.?|inr)\\s?([0-9,]+(?:\\.\\d{1,2})?)")
                .matcher(message);

        if (matcher.find()) {
            return "₹" + matcher.group(1);
        }

        return null;
    }

    private String extractMerchant(String message) {
        Matcher matcher = Pattern
                .compile("(?i)(?:to|at|from)\\s+([A-Z0-9 &._-]{2,30})")
                .matcher(message);

        if (!matcher.find()) {
            return null;
        }

        return matcher.group(1)
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean isFinancialSMS(String message) {
        String lower = message.toLowerCase();

        return (lower.contains("debited") ||
                lower.contains("credited") ||
                lower.contains("spent") ||
                lower.contains("transaction") ||
                lower.contains("withdraw") ||
                lower.contains("deposit") ||
                lower.contains("paid") ||
                lower.contains("upi") ||
                lower.contains("sent") ||
                lower.contains("received"));
    }
    private static boolean containsAmount(String message) {
        if (message == null) return false;
        // (?i) handles Rs, RS, rs, etc.
        // \u20B9 is the Unicode for the Rupee symbol
        return message.matches("(?i).*(\u20B9|rs\\.?|inr)\\s?\\d+.*");
    }
}
