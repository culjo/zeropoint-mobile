package com.noviac.nullfall;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Local plugins register before the bridge starts
        registerPlugin(GameServicesPlugin.class);
        registerPlugin(StoreReviewPlugin.class);
        registerPlugin(MetaEventsPlugin.class);
        // Meta SDK: logs installs and app opens for Meta ad attribution
        MetaEventsPlugin.start(getApplication());
        super.onCreate(savedInstanceState);
        // Full screen: hidden bars peek in on swipe, then hide again
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView())
            .setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
