// Nullfall - Firebase Analytics (GA4)
// Thin wrapper over @capacitor-firebase/analytics. Uses GA4's recommended game events
// where one fits (level_start, level_end, post_score, tutorial_begin, tutorial_complete).
// On the web, or when the plugin isn't there, every call is a quiet no-op.

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(root);
    } else {
        root.NullfallAnalytics = factory(root);
    }
}(typeof self !== 'undefined' ? self : this, function (root) {

    function plugin() {
        const cap = root.Capacitor;
        if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return null;
        return (cap.Plugins && cap.Plugins.FirebaseAnalytics) || null;
    }

    // GA4 params must be strings or numbers; drop anything else
    function clean(params) {
        const out = {};
        Object.keys(params || {}).forEach((k) => {
            const v = params[k];
            if (typeof v === 'number' && isFinite(v)) out[k] = v;
            else if (typeof v === 'string' && v) out[k] = v.slice(0, 100);
            else if (typeof v === 'boolean') out[k] = v ? 1 : 0;
        });
        return out;
    }

    function log(name, params) {
        const p = plugin();
        if (!p) return;
        p.logEvent({ name, params: clean(params) }).catch(() => { /* not configured */ });
    }

    // Debug mode turns collection off, so staged captures and dev play stay out of the numbers
    function setEnabled(enabled) {
        const p = plugin();
        if (p) p.setEnabled({ enabled: !!enabled }).catch(() => { /* not configured */ });
    }

    return {
        setEnabled,
        // level: '1-3', 'mission-2' or 'classic' · mode: adventure | challenge | classic | tutorial
        levelStart: (level, mode) => log('level_start', { level_name: level, mode }),
        // result: cleared | out_of_moves | overload | riser
        levelEnd: (level, mode, success, details) => log('level_end', { level_name: level, mode, success, ...details }),
        postScore: (score, level) => log('post_score', { score, level_name: level }),
        tutorialBegin: (kind) => log('tutorial_begin', { tutorial: kind }),
        tutorialComplete: (kind) => log('tutorial_complete', { tutorial: kind }),
        tutorialSkip: (kind) => log('tutorial_skip', { tutorial: kind }),
        toolFirstUse: (tool, level) => log('tool_first_use', { tool, level_name: level }),
        orbTier: (size, name, level) => log('orb_tier_reached', { tier_size: size, tier_name: name, level_name: level })
    };
}));
