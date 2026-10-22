package com.noviac.nullfall;

import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;

// Play Games Services v2 bridge: sign-in, leaderboard submit and the leaderboard screen.
// JS side: www/gameServices.js (same plugin name as the iOS Game Center plugin).
@CapacitorPlugin(name = "GameServices")
public class GameServicesPlugin extends Plugin {
    // Off until res/values/strings.xml has the real numeric Play Games project id,
    // so builds without it never touch the SDK
    private boolean configured;

    @Override
    public void load() {
        configured = getContext().getString(R.string.game_services_project_id).matches("\\d+");
        if (configured) PlayGamesSdk.initialize(getContext());
    }

    // v2 signs players in automatically on launch; this reports that result,
    // and with { interactive: true } asks the player to sign in if they aren't
    @PluginMethod
    public void signIn(PluginCall call) {
        if (!configured) {
            resolveSignedIn(call, false);
            return;
        }
        GamesSignInClient client = PlayGames.getGamesSignInClient(getActivity());
        client.isAuthenticated().addOnCompleteListener(task -> {
            if (task.isSuccessful() && task.getResult().isAuthenticated()) {
                resolveSignedIn(call, true);
            } else if (call.getBoolean("interactive", false)) {
                client.signIn().addOnCompleteListener(t ->
                    resolveSignedIn(call, t.isSuccessful() && t.getResult().isAuthenticated()));
            } else {
                resolveSignedIn(call, false);
            }
        });
    }

    @PluginMethod
    public void submitScore(PluginCall call) {
        String leaderboardId = call.getString("leaderboardId");
        Integer score = call.getInt("score");
        if (leaderboardId == null || score == null) {
            call.reject("leaderboardId and score are required");
            return;
        }
        if (!configured) {
            call.reject("Play Games is not configured");
            return;
        }
        PlayGames.getLeaderboardsClient(getActivity()).submitScore(leaderboardId, score);
        call.resolve();
    }

    @PluginMethod
    public void showLeaderboard(PluginCall call) {
        String leaderboardId = call.getString("leaderboardId");
        if (leaderboardId == null) {
            call.reject("leaderboardId is required");
            return;
        }
        if (!configured) {
            call.reject("Play Games is not configured");
            return;
        }
        PlayGames.getLeaderboardsClient(getActivity()).getLeaderboardIntent(leaderboardId)
            .addOnSuccessListener(intent -> startActivityForResult(call, intent, "leaderboardClosed"))
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }

    @ActivityCallback
    private void leaderboardClosed(PluginCall call, ActivityResult result) {
        call.resolve();
    }

    private void resolveSignedIn(PluginCall call, boolean signedIn) {
        JSObject ret = new JSObject();
        ret.put("signedIn", signedIn);
        call.resolve(ret);
    }
}
