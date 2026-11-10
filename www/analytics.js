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

    // GA4 screen_view. The app is one web view, so screens are reported by hand
    function screen(name) {
        const p = plugin();
        if (!p || !name) return;
        const call = p.setCurrentScreen
            ? p.setCurrentScreen({ screenName: name, screenClassOverride: name })
            : p.logEvent({ name: 'screen_view', params: clean({ screen_name: name, screen_class: name }) });
        call.catch(() => { /* not configured */ });
    }

    return {
        setEnabled,
        // name: home | adventure_map | challenges | codex | game | settings | pause | ladder | discoveries | how_to_play | node_preview
        screenView: screen,
        // A mode entered from outside it · mode: adventure | challenge | classic | tutorial · source: the screen it was opened from
        modeOpen: (mode, source) => log('mode_open', { mode, source }),
        // level: '1-3', 'mission-2' or 'classic' · mode: adventure | challenge | classic | tutorial
        levelStart: (level, mode) => log('level_start', { level_name: level, mode }),
        // result: cleared | out_of_moves | overload | riser | quit | restart · duration_sec on every end
        levelEnd: (level, mode, success, details) => log('level_end', { level_name: level, mode, success, ...details }),
        postScore: (score, level) => log('post_score', { score, level_name: level }),
        // Coins (GDD §7.1) · source: level_clear | classic | welcome_gift · item: extra_moves | revive
        earnCoins: (value, source) => log('earn_virtual_currency', { virtual_currency_name: 'coins', value, source }),
        spendCoins: (value, item) => log('spend_virtual_currency', { virtual_currency_name: 'coins', value, item_name: item }),
        // tutorial: first_play | academy | how_to_play
        tutorialBegin: (kind) => log('tutorial_begin', { tutorial: kind }),
        // step is 1-based; step_name is the lesson or slide shown
        tutorialStep: (kind, step, name) => log('tutorial_step', { tutorial: kind, step, step_name: name }),
        tutorialComplete: (kind) => log('tutorial_complete', { tutorial: kind }),
        // step: where the player left (when known)
        tutorialSkip: (kind, step) => log('tutorial_skip', { tutorial: kind, step }),
        toolFirstUse: (tool, level) => log('tool_first_use', { tool, level_name: level }),
        orbTier: (size, name, level) => log('orb_tier_reached', { tier_size: size, tier_name: name, level_name: level }),
        // slot: d1 … d30 · hook: nearMiss | next | stars | classic | orb | generic
        reminderOpen: (slot, hook) => log('reminder_open', { slot, hook }),
        // source: prompt | settings
        remindersSet: (enabled, source) => log(enabled ? 'reminders_enabled' : 'reminders_disabled', { source }),
        // The store's own rating prompt was requested (it may not show) · moment: three_stars | boss_clear | classic_best
        reviewPrompt: (moment) => log('review_prompt', { moment }),
        rateTapped: () => log('rate_tapped', {}),
        // GA4's share event · method: the app picked (iOS only reports it), or copy / web
        share: (method) => log('share', { method, content_type: 'app', item_id: 'nullfall' })
    };
}));
