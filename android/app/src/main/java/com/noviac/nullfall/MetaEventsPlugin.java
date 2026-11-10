package com.noviac.nullfall;

import android.app.Application;
import android.content.Context;
import android.os.Bundle;
import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Iterator;

// Meta (Facebook) SDK app events, for install and event attribution of Meta ads.
// The SDK starts from MainActivity (start()); installs and app opens are logged automatically.
// JS side: www/metaEvents.js (same plugin name as the iOS plugin).
// The App ID and Client Token live in res/values/strings.xml (facebook_app_id, facebook_client_token).
@CapacitorPlugin(name = "MetaEvents")
public class MetaEventsPlugin extends Plugin {

    private static boolean enabled = true;
    private AppEventsLogger logger;

    // False while strings.xml still holds a REPLACE_ME placeholder, so the SDK stays off
    static boolean isConfigured(Context context) {
        String appId = context.getString(R.string.facebook_app_id);
        String token = context.getString(R.string.facebook_client_token);
        return appId.matches("\\d+") && !token.isEmpty() && !"REPLACE_ME".equals(token);
    }

    // Called once from MainActivity. Auto-init is off in the manifest so a placeholder build never starts the SDK.
    static void start(Application application) {
        if (!isConfigured(application)) return;
        FacebookSdk.setAutoInitEnabled(true);
        FacebookSdk.fullyInitialize();
        AppEventsLogger.activateApp(application);
    }

    // Android has no tracking prompt: the advertising ID is used unless the player turned it off in system settings
    @PluginMethod
    public void requestTracking(PluginCall call) {
        JSObject result = new JSObject();
        result.put("status", "notApplicable");
        call.resolve(result);
    }

    // name: a Meta standard event (fb_mobile_…) or a custom one · params: strings and numbers
    @PluginMethod
    public void logEvent(PluginCall call) {
        if (!enabled || !isConfigured(getContext())) {
            call.resolve();
            return;
        }
        String name = call.getString("name");
        if (name == null || name.isEmpty()) {
            call.reject("name is required");
            return;
        }
        Bundle params = new Bundle();
        JSObject input = call.getObject("params", new JSObject());
        double valueToSum = 0;
        boolean hasValue = false;
        for (Iterator<String> keys = input.keys(); keys.hasNext(); ) {
            String key = keys.next();
            Object value = input.opt(key);
            if ("_valueToSum".equals(key) && value instanceof Number) {
                valueToSum = ((Number) value).doubleValue();
                hasValue = true;
            } else if (value instanceof String) {
                params.putString(key, (String) value);
            } else if (value instanceof Integer || value instanceof Long) {
                params.putLong(key, ((Number) value).longValue());
            } else if (value instanceof Number) {
                params.putDouble(key, ((Number) value).doubleValue());
            }
        }
        if (logger == null) logger = AppEventsLogger.newLogger(getContext());
        if (hasValue) logger.logEvent(name, valueToSum, params);
        else logger.logEvent(name, params);
        call.resolve();
    }

    // Debug mode turns events off so dev play stays out of the ad numbers
    @PluginMethod
    public void setEnabled(PluginCall call) {
        enabled = Boolean.TRUE.equals(call.getBoolean("enabled", true));
        if (isConfigured(getContext())) FacebookSdk.setAutoLogAppEventsEnabled(enabled);
        call.resolve();
    }
}
