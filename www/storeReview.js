// Nullfall - store ratings (App Store / Google Play)
// Thin wrapper over the app's local StoreReview Capacitor plugin
// (ios/App/App/StoreReviewPlugin.swift, android/.../StoreReviewPlugin.java).
// Uses each store's own rating prompt only: both stores forbid asking players
// anything first ("Enjoying the game?") or showing a custom rating prompt.
// On the web, or when the plugin isn't there, every call is a quiet no-op.

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(root);
    } else {
        root.NullfallStoreReview = factory(root);
    }
}(typeof self !== 'undefined' ? self : this, function (root) {

    // The numeric Apple ID from App Store Connect > App Information. Set to REPLACE_ME,
    // the Settings "Rate Null Fall" row stays hidden on iOS (the system prompt still works).
    const APP_STORE_ID = '6823532738';

    function plugin() {
        const cap = root.Capacitor;
        if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return null;
        return (cap.Plugins && cap.Plugins.StoreReview) || null;
    }

    function platform() {
        return root.Capacitor && root.Capacitor.getPlatform ? root.Capacitor.getPlatform() : 'web';
    }

    // The store decides whether its prompt actually appears; neither says if the player rated
    function requestReview() {
        const p = plugin();
        if (!p) return Promise.resolve(false);
        return p.requestReview().then(() => true).catch(() => false);
    }

    function canOpenStorePage() {
        if (!plugin()) return false;
        return platform() !== 'ios' || APP_STORE_ID !== 'REPLACE_ME';
    }

    function openStorePage() {
        if (!canOpenStorePage()) return Promise.resolve(false);
        return plugin().openStorePage({ appStoreId: APP_STORE_ID }).then(() => true).catch(() => false);
    }

    return { requestReview, openStorePage, canOpenStorePage, available: () => !!plugin() };
}));
