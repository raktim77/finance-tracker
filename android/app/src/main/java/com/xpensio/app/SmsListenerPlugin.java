package com.xpensio.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginCall;

@CapacitorPlugin(name = "SmsListener")
public class SmsListenerPlugin extends Plugin {

    private static SmsListenerPlugin instance;

    // 🔥 store last clicked SMS (for notification click)
    private static String lastClickedMessage = null;
    private static String lastClickedSender = null;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    // 🔥 Send SMS to JS (when app is alive)
    public static void notifySms(String message, String sender, long timestamp) {
        if (instance != null) {
            JSObject data = new JSObject();
            data.put("message", message);
            data.put("sender", sender);
            data.put("timestamp", timestamp);
            instance.notifyListeners("smsReceived", data);
        }
    }

    // 🔥 Called when notification is clicked
    public static void setLastClickedSms(String message, String sender) {
        lastClickedMessage = message;
        lastClickedSender = sender;
    }

    // 🔥 Fetch last clicked SMS in React
    @PluginMethod
    public void getLastClickedSms(PluginCall call) {
        JSObject result = new JSObject();
        result.put("message", lastClickedMessage);
        result.put("sender", lastClickedSender);

        call.resolve(result);

        // optional: clear after fetch (prevents reuse)
        lastClickedMessage = null;
        lastClickedSender = null;
    }

    // 🔥 Fetch stored SMS from native (background sync)
    @PluginMethod
    public void getStoredSms(PluginCall call) {
        try {
            String data = SmsStorage.getAllSms(getContext());
            JSObject result = new JSObject();
            result.put("data", data);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to get stored SMS");
        }
    }

    // 🔥 Clear stored SMS after sync
    @PluginMethod
    public void clearStoredSms(PluginCall call) {
        try {
            SmsStorage.clearSms(getContext());
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to clear SMS");
        }
    }

    public static void notifyNotificationClick(String message, String sender, long timestamp) {
    if (instance != null) {
        JSObject data = new JSObject();
        data.put("message", message);
        data.put("sender", sender);
        data.put("timestamp", timestamp);

        instance.notifyListeners("notificationClicked", data, true);
    }
}
}