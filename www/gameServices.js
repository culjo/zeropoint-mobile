// Nullfall - Game Center (iOS) and Google Play Games (Android)
// Thin wrapper over the app's local GameServices Capacitor plugin
// (ios/App/App/GameServicesPlugin.swift, android/.../GameServicesPlugin.java).
// On the web, or when the plugin isn't there, every call is a quiet no-op.

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(root);
    } else {
        root.NullfallGameServices = factory(root);
    }
}(typeof self !== 'undefined' ? self : this, function (root) {

    // Leaderboard ids as set up in App Store Connect and the Play Console.
    // The Play Console generates its own ids (CgkI…): paste it in once the leaderboard exists.
    const LEADERBOARDS = {
        classic: { ios: 'nullfall.classic.highscore', android: 'REPLACE_ME' }
    };

    let signedIn = false;
    const listeners = [];

    function plugin() {
        const cap = root.Capacitor;
        if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return null;
        return (cap.Plugins && cap.Plugins.GameServices) || null;
    }

    function leaderboardId(board) {
        const ids = LEADERBOARDS[board];
        const id = ids && ids[root.Capacitor.getPlatform()];
        return id && id !== 'REPLACE_ME' ? id : null;
    }

    function setSignedIn(value) {
        if (signedIn === value) return;
        signedIn = value;
        listeners.forEach((fn) => fn(signedIn));
    }

    // Silent on Android (Play Games signs in on launch); on iOS Game Center shows
    // its own sign-in sheet once. A cancelled sign-in just leaves the game offline.
    function signIn(interactive = false) {
        const p = plugin();
        if (!p) return Promise.resolve(false);
        return p.signIn({ interactive })
            .then((res) => { setSignedIn(!!(res && res.signedIn)); return signedIn; })
            .catch(() => false);
    }

    // The stores keep each player's best, so any score can be sent
    function submitScore(board, score) {
        const p = plugin();
        const id = p && signedIn && leaderboardId(board);
        if (!id || !(score > 0)) return Promise.resolve(false);
        return p.submitScore({ leaderboardId: id, score: Math.floor(score) })
            .then(() => true)
            .catch((e) => { console.warn('Leaderboard submit failed', e); return false; });
    }

    function showLeaderboard(board) {
        const p = plugin();
        const id = p && signedIn && leaderboardId(board);
        if (!id) return Promise.resolve(false);
        return p.showLeaderboard({ leaderboardId: id })
            .then(() => true)
            .catch((e) => { console.warn('Leaderboard failed to open', e); return false; });
    }

    // True when this board can be shown right now (native, signed in, id configured)
    function canShow(board) {
        return !!(plugin() && signedIn && leaderboardId(board));
    }

    function onSignInChange(fn) { listeners.push(fn); }

    return { signIn, submitScore, showLeaderboard, canShow, onSignInChange, get signedIn() { return signedIn; } };
}));
