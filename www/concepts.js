// Nullfall - Concepts and orb tiers (GDD §3.3, §6)
// Every concept unlocks at a fixed node; a locked concept doesn't appear in Adventure.
// Discoveries lists these in order, plus the orb tier names.

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.NullfallConcepts = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // kind: 'basic' (first play / from the start) · 'mechanic' (NEW card + one guided move)
    //       'goal' (NEW GOAL badge on the level card)
    // unlock: node id where it's introduced ('start' = always known)
    // demo: which looping demo the card draws (see game.js renderConceptDemo)
    // pages: extra pages shown after the first (power-ups is one card, two pages)
    const CONCEPTS = [
        { id: 'zero_blast', kind: 'basic', unlock: 'start', name: 'Zero Blast', rule: 'Opposites cancel: +3 next to −3 and both vanish.', demo: 'blast' },
        { id: 'merge', kind: 'basic', unlock: 'start', name: 'Merge', rule: 'Matching numbers fuse into one orb twice the size.', demo: 'merge' },
        { id: 'red_line', kind: 'basic', unlock: 'start', name: 'The red line', rule: 'If any tile crosses the red line, the run ends.', demo: 'redline' },
        { id: 'hold', kind: 'basic', unlock: 'start', name: 'Hold', rule: 'Drag an orb into Hold to save it. One use per move.', demo: 'hold' },
        { id: 'swap', kind: 'basic', unlock: 'start', name: 'Swap', rule: 'Slide a tile onto its neighbour to trade places. Costs a token.', demo: 'swap' },
        { id: 'dark_matter', kind: 'mechanic', unlock: '1-3', name: 'Dark Matter', rule: 'Cores take two blasts to break, then turn into an orb.', demo: 'dark_matter' },
        { id: 'break_cores', kind: 'goal', unlock: '1-3', name: 'Break the Cores', rule: 'Goal: break a number of Dark Matter cores.', demo: 'dark_matter', silent: true },
        { id: 'big_orb', kind: 'goal', unlock: '1-bonus-1', name: 'Bonus rifts', rule: 'Bonus goal: merge one orb up to the target size.', demo: 'merge' },
        {
            id: 'power_ups', kind: 'mechanic', unlock: '1-5', name: 'Power-ups', rule: 'Special orbs: 0 blasts a 3×3 area, ± flips a sign, ×2 and ÷2 resize a tile.', demo: 'specials',
            pages: [{ name: 'Overdrive', rule: 'Blasts charge the bar. At 100% it drops a super-weapon into your tray.', demo: 'overdrive' }]
        },
        { id: 'collect', kind: 'goal', unlock: '1-6', name: 'Collect', rule: 'Goal: pop orbs showing one number. Either sign counts.', demo: 'collect' },
        { id: 'catch_stars', kind: 'goal', unlock: '1-7', name: 'Catch the Stars', rule: 'Goal: land an orb on every star cell.', demo: 'stars' },
        { id: 'rising_rows', kind: 'mechanic', unlock: '1-9', name: 'Rising rows', rule: 'Every few moves a new row pushes the whole board up.', demo: 'rise' },
        { id: 'survive', kind: 'goal', unlock: '1-9', name: 'Survive', rule: 'Goal: last a number of moves. Stars come from free rows.', demo: 'rise', silent: true },
        { id: 'null_core', kind: 'goal', unlock: '1-10', name: 'Null Core boss', rule: 'Boss: blast beside the core to drain its HP. Lasers hit for 3.', demo: 'null_core' },
        { id: 'risers', kind: 'mechanic', unlock: '2-2', name: 'Risers', rule: 'Risers climb a row after every drop. Cancel one before it reaches the red line.', demo: 'riser' },
        { id: 'static_blocks', kind: 'mechanic', unlock: '2-3', name: 'Static blocks', rule: '0 walls never move and can’t be cleared. Build around them.', demo: 'wall' },
        { id: 'webbed_orbs', kind: 'mechanic', unlock: '4-2', name: 'Webbed orbs', rule: 'Webs hold an orb in the air. A blast next to it or a merge snaps the web.', demo: 'web' },
        { id: 'dense_cores', kind: 'mechanic', unlock: '5-2', name: 'Dense cores', rule: 'Armoured cores take four hits to break. Each hit knocks off a plate.', demo: 'dense' },
        { id: 'sealed_columns', kind: 'mechanic', unlock: '6-2', name: 'Sealed columns', rule: 'You can’t drop into a sealed column. Clear a tile inside it to open it for good.', demo: 'seal' },
        { id: 'entangled_pairs', kind: 'mechanic', unlock: '8-2', name: 'Entangled pairs', rule: 'Linked orbs share a fate: clear one and its twin pops too.', demo: 'entangle' }
    ];

    // Orb tiers (GDD §3.3): announced the first time each size is made; ring colour per doubling
    const TIERS = [
        { size: 8, name: 'Nova', color: '#b46cff' },
        { size: 16, name: 'Star', color: '#f9d423' },
        { size: 32, name: 'Pulsar', color: '#ff9a3c' },
        { size: 64, name: 'Quasar', color: '#ff4fd8' },
        { size: 128, name: 'Magnetar', color: '#ffffff' },
        { size: 256, name: 'Hypernova', color: 'rainbow' },
        { size: 512, name: 'Blazar', color: 'rainbow' },
        { size: 1024, name: 'Singularity', color: 'rainbow' }
    ];

    // Highest tier reached by a magnitude (null below 8)
    function tierFor(magnitude) {
        let found = null;
        TIERS.forEach((t) => { if (magnitude >= t.size) found = t; });
        return found;
    }

    return { CONCEPTS, TIERS, tierFor };
}));
