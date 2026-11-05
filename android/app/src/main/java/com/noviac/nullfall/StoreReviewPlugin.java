package com.noviac.nullfall;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;

// Google Play rating: the in-app review card, and the store page for a Settings link.
// JS side: www/storeReview.js (same plugin name as the iOS App Store plugin).
@CapacitorPlugin(name = "StoreReview")
public class StoreReviewPlugin extends Plugin {

    // Play decides whether the card actually shows (it has its own quota), and never
    // says whether the player rated, so this resolves once the flow is over either way
    @PluginMethod
    public void requestReview(PluginCall call) {
        ReviewManager manager = ReviewManagerFactory.create(getContext());
        manager.requestReviewFlow().addOnCompleteListener(task -> {
            if (!task.isSuccessful()) {
                call.reject("Review flow unavailable");
                return;
            }
            manager.launchReviewFlow(getActivity(), task.getResult()).addOnCompleteListener(done -> call.resolve());
        });
    }

    // Opens the game's Play Store page (the Play Store app, or the website without it)
    @PluginMethod
    public void openStorePage(PluginCall call) {
        String pkg = getContext().getPackageName();
        try {
            launch("market://details?id=" + pkg);
        } catch (ActivityNotFoundException e) {
            launch("https://play.google.com/store/apps/details?id=" + pkg);
        }
        call.resolve();
    }

    private void launch(String url) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
    }
}
