// Null Fall - Meta (Facebook) app events, for Meta ad attribution
// Installs and app opens are logged by the native SDK on its own. This file adds:
//   - the iOS App Tracking Transparency prompt, shortly after launch
//   - a few Meta standard events, mirrored from the NullfallAnalytics calls the game already makes
//     (so game code doesn't change), which Meta can optimise ad delivery for.
// Native side: MetaEventsPlugin (iOS Swift, Android Java). Load after analytics.js.
// On the web, or when the plugin isn't there, every call is a quiet no-op.

(function (root) {
    function plugin() {
        const cap = root.Capacitor;
        if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return null;
        return (cap.Plugins && cap.Plugins.MetaEvents) || null;
    }

    function clean(params) {
        const out = {};
        Object.keys(params || {}).forEach((k) => {
            const v = params[k];
            if (typeof v === 'number' && isFinite(v)) out[k] = v;
            else if (typeof v === 'string' && v) out[k] = v.slice(0, 100);
        });
        return out;
    }

    function log(name, params) {
        const p = plugin();
        if (p) p.logEvent({ name, params: clean(params) }).catch(() => { /* not configured */ });
    }

    // Wraps one NullfallAnalytics method so it also reports to Meta
    function mirror(method, toMeta) {
        const a = root.NullfallAnalytics;
        if (!a || typeof a[method] !== 'function') return;
        const original = a[method];
        a[method] = function () {
            try { toMeta.apply(null, arguments); } catch (e) { /* never break the game */ }
            return original.apply(this, arguments);
        };
    }

    // Meta standard event names (fb_mobile_*) and params (fb_*)
    mirror('setEnabled', (enabled) => {
        const p = plugin();
        if (p) p.setEnabled({ enabled: !!enabled }).catch(() => { /* not configured */ });
    });
    mirror('levelEnd', (level, mode, success) => {
        if (success) log('fb_mobile_level_achieved', { fb_level: level, mode });
    });
    mirror('tutorialComplete', (kind) => {
        log('fb_mobile_tutorial_completion', { fb_content_id: kind, fb_success: 1 });
    });
    mirror('spendCoins', (value, item) => {
        log('fb_mobile_spent_credits', { fb_content_type: item, _valueToSum: value });
    });

    // iOS only: Apple wants the prompt while the app is active, so wait for the first screen
    function requestTracking() {
        const cap = root.Capacitor;
        const p = plugin();
        if (!p || !cap.getPlatform || cap.getPlatform() !== 'ios') return;
        setTimeout(() => {
            p.requestTracking().catch(() => { /* iOS 14.4 and older, or not configured */ });
        }, 1200);
    }

    if (root.document && root.document.readyState === 'loading') {
        root.document.addEventListener('DOMContentLoaded', requestTracking);
    } else {
        requestTracking();
    }
}(typeof self !== 'undefined' ? self : this));
