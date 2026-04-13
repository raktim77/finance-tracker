package com.xpensio.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

public class SmsStorage {

    private static final String PREF_NAME = "xpensio_sms_store";
    private static final String KEY_SMS = "sms_list";

    public static void saveSms(Context context, String message, String sender) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
            String existing = prefs.getString(KEY_SMS, "[]");

            JSONArray array = new JSONArray(existing);

            JSONObject obj = new JSONObject();
            obj.put("message", message);
            obj.put("sender", sender);
            obj.put("timestamp", System.currentTimeMillis());

            array.put(obj);

            prefs.edit().putString(KEY_SMS, array.toString()).apply();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String getAllSms(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        return prefs.getString(KEY_SMS, "[]");
    }

    public static void clearSms(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        prefs.edit().remove(KEY_SMS).apply();
    }
}