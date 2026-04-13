package com.xpensio.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "SmsListener")
public class SmsListenerPlugin extends Plugin {

    private static SmsListenerPlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    public static void notifySms(String message, String sender) {
        if (instance != null) {
            JSObject data = new JSObject();
            data.put("message", message);
            data.put("sender", sender);

            instance.notifyListeners("smsReceived", data);
        }
    }
}