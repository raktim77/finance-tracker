package com.xpensio.app;

import android.graphics.Color;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.util.WebColor;

@CapacitorPlugin(name = "NativeChrome")
public class NativeChromePlugin extends Plugin {

    @PluginMethod
    public void setBackgroundColor(final PluginCall call) {
        final String color = call.getString("color");
        if (color == null) {
            call.reject("Color must be provided");
            return;
        }

        getBridge().executeOnMainThread(() -> {
            try {
                final int parsedColor = WebColor.parseColor(color);
                applyBackgroundColor(parsedColor);
                JSObject result = new JSObject();
                result.put("color", color);
                call.resolve(result);
            } catch (IllegalArgumentException ex) {
                call.reject("Invalid color provided. Must be a hex string like #0B0F1A");
            }
        });
    }

    @PluginMethod
    public void setSystemBarIcons(final PluginCall call) {
        final String style = call.getString("style", "light");

        getBridge().executeOnMainThread(() -> {
            boolean useDarkIcons = "dark".equalsIgnoreCase(style);
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(
                getActivity().getWindow(),
                getActivity().getWindow().getDecorView()
            );

            if (controller != null) {
                controller.setAppearanceLightStatusBars(useDarkIcons);
                controller.setAppearanceLightNavigationBars(useDarkIcons);
            }

            JSObject result = new JSObject();
            result.put("style", useDarkIcons ? "dark" : "light");
            call.resolve(result);
        });
    }

    private void applyBackgroundColor(int color) {
        getActivity().getWindow().getDecorView().setBackgroundColor(color);
        View rootView = getActivity().findViewById(android.R.id.content);
        if (rootView != null) {
            rootView.setBackgroundColor(color);
            if (rootView instanceof ViewGroup) {
                tintWebViews((ViewGroup) rootView, color);
            }
        }
    }

    private void tintWebViews(ViewGroup parent, int color) {
        for (int i = 0; i < parent.getChildCount(); i++) {
            View child = parent.getChildAt(i);
            child.setBackgroundColor(color);

            if (child instanceof WebView) {
                child.setBackgroundColor(Color.TRANSPARENT);
                continue;
            }

            if (child instanceof ViewGroup) {
                tintWebViews((ViewGroup) child, color);
            }
        }
    }
}
