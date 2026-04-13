package com.xpensio.app;

import android.util.Log;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;

// 🔔 Notification imports
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.app.Notification;
import android.os.Build;

import androidx.core.app.NotificationCompat;

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

                    if (isFinancialSMS(message) && containsAmount(message)) {
                        Log.d("XPENSIO_SMS", "SMS: " + message);

                        // ✅ Save only financial SMS
                        SmsStorage.saveSms(context, message, sender);

                        // ✅ Send to JS if app open
                        SmsListenerPlugin.notifySms(message, sender);

                        // ✅ Show notification
                        showNotification(context, message);
                    }
                }
            }
        }
    }

    private void showNotification(Context context, String message) {

        String channelId = "xpensio_sms";

        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        // Create channel (Android 8+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    channelId,
                    "SMS Detection",
                    NotificationManager.IMPORTANCE_HIGH);
            manager.createNotificationChannel(channel);
        }
        String title = "Transaction detected 💸";

        if (message.toLowerCase().contains("debited")) {
            title = "Expense detected";
        } else if (message.toLowerCase().contains("credited")) {
            title = "Income detected";
        }
        Notification notification = new NotificationCompat.Builder(context, channelId)
                .setContentTitle(title)
                .setContentText(message)
                .setSmallIcon(R.drawable.ic_notification)
                .setAutoCancel(true)
                .setColor(0xFF7C6CFF)
                .build();

        manager.notify((int) System.currentTimeMillis(), notification);
    }

    private boolean isFinancialSMS(String message) {
        String lower = message.toLowerCase();

        return (lower.contains("debited") ||
                lower.contains("credited") ||
                lower.contains("spent") ||
                lower.contains("transaction") ||
                lower.contains("withdrawn") ||
                lower.contains("deposit") ||
                lower.contains("paid") ||
                lower.contains("upi") ||
                lower.contains("sent") ||
                lower.contains("received"));
    }
    private boolean containsAmount(String message) {
    return message.matches(".*(₹|rs\\.?|inr)\\s?\\d+.*");
}
}