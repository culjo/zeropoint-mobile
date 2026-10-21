// Nullfall - Adventure level data
// Every node ships as fixed data (GDD §5.3). One goal per level; the counter only counts down.
// Stars come from drops left (≥25% ★★, ≥45% ★★★), worked out by the loader in nodeGenerator.js.
//
// Level fields
//   title    node name shown on the map and cards
//   goal     { type, target, ... }
//            zero_out (orbs to clear) · collect (target, number) · break_cores (cores)
//            catch_stars (stars on the board) · risers (Risers to clear) · survive (drops to last)
//            null_core (core HP; needs a 2×2 N block) · big_orb (target 1, size to reach)
//   drops    drop budget (Survive uses its target instead)
//   board    rows top to bottom, aligned to the bottom of the 6×8 board.
//            Tokens: .  empty   +3 / -3  number orb   +3R  Riser   D  Dark Matter core
//                    N  Null Core cell (4 make the 2×2 core)   #  static block (fixed, unbreakable)
//                    *  star in an empty cell (never the top row)   H  dense core (4 HP)
//                    +3W  webbed orb (ignores gravity until a blast beside it or a merge snaps the web)
//                    +3E  entangled orb: E orbs pair up in reading order (1st with 2nd, 3rd with 4th);
//                         clearing one pops its twin
//   sealed   [columns] (0–5) that take no drops until a tile inside is cleared, merged or broken
//   pool     { values: [magnitudes], specials: chance of a special orb, favor?: magnitude dealt twice as often,
//              pairBias?: chance to deal a match for a column top (default 0.2, Big Orb 0.45) }
//            Values, favor and board numbers are written at Tide 0; the loader doubles them per tide step
//            (Sectors 1-3 = Tide 0-2, 4-5 = Tide 3, 6-7 = Tide 4, 8-9 = Tide 5, 10 = Tide 6; override with `tide`).
//            Collect `number` is the real number shown, so it must be in the doubled pool.
//   rise     a rising row every N drops (0 or missing = none)
//   risers   { start, every, max }  Risers added at the start, then one every `every` drops
//            while fewer than `max` are on the board (they push up from the bottom of the emptiest column)
//   guide    one guided move the first time a mechanic appears (GDD §6.4):
//            { orb: Tide-0 value or 'zero', col, line, why, riseAfter? } — the orb is dealt into the
//            first tray slot and only that drop is accepted
//   temp     placeholder until its planned goal is built; `planned` records the goal from
//            docs/adventure-objectives.md §5 and `goal` is the stand-in that plays today

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.NullfallLevels = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // ---------- Boards ----------
    const B = {
        // 1-1: one easy row, every orb has its opposite in the pool
        firstRow: [
            '+1 +2 -1 -2 +1 +2'
        ],
        twoRows: [
            '-1 .  +2 .  .  -2',
            '+2 +1 -3 -2 +3 -1'
        ],
        threeRows: [
            '.  +1 .  .  -3 .',
            '+3 -2 .  +1 +2 .',
            '-1 +3 +2 -3 -1 +4'
        ],
        // 1-3: four cores in a line, numbers around them to blast against
        cores4: [
            '+1 D  D  D  D  -1',
            '+2 -1 -3 +1 +3 -2'
        ],
        cores6: [
            '+2 D  -1 +3 D  -2',
            'D  +3 D  D  -3 D'
        ],
        cores8: [
            '+1 .  D  D  .  -1',
            '-2 D  +3 +1 D  +2',
            'D  +2 D  D  -2 D'
        ],
        cores10: [
            '+1 D  D  D  D  -1',
            '-2 D  +3 +1 D  +2',
            'D  +2 D  D  -2 D'
        ],
        // 2-3: static blocks split the board; opposites sit on either side of the wall
        walls: [
            '-1 .  +2 #  .  -2',
            '+2 +1 -3 #  +3 -1'
        ],
        // Catch the Stars: stars just above the stack first, higher ones later
        stars3: [
            '*  .  .  .  *  .',
            '-1 *  +2 .  .  -2',
            '+2 +1 -3 -2 +3 -1'
        ],
        stars5: [
            '.  .  .  .  *  .',
            '.  *  .  .  .  .',
            '*  +1 .  .  -3 .',
            '+3 -2 *  +1 +2 *',
            '-1 +3 +2 -3 -1 +4'
        ],
        stars6: [
            '.  .  .  .  *  .',
            '.  *  .  *  .  .',
            '*  +1 .  .  -3 .',
            '+3 -2 *  +1 +2 *',
            '-1 +3 +2 -3 -1 +4'
        ],
        stars7: [
            '.  .  .  .  *  .',
            '.  *  .  *  .  .',
            '*  +1 .  .  -3 *',
            '+3 -2 *  +1 +2 *',
            '-1 +3 +2 -3 -1 +4'
        ],
        // Risers: one, two or three already climbing
        risers1: [
            '-1 .  +2 .  +1R -2',
            '+2 +1 -3 -2 +3 -1'
        ],
        risers2: [
            '-1 -3R +2 .  +1R -2',
            '+2 +1 -3 -2 +3 -1'
        ],
        risers3: [
            '.  .  +3R .  .  .',
            '-1 -3R +2 .  +1R -2',
            '+2 +1 -3 -2 +3 -1'
        ],
        // Null Core boss: 2×2 core in the middle with orbs on both sides
        nullCore: [
            '.  +2 .  .  -3 .',
            '+2 +1 N  N  -1 -2',
            '-1 +3 N  N  -3 +1'
        ],
        // Late openers: walls split a low board, opposites on each side
        wallsWide: [
            '.  -2 .  .  +3 .',
            '-1 +3 #  #  -3 +1',
            '+2 -1 +4 -4 +1 -2'
        ],
        // ----- Late board elements (GDD §5.2) -----
        // 4-2: two webbed orbs hang over gaps
        webIntro: [
            '.  +2W .  .  -3W .',
            '.  .  +3 .  .  +2',
            '+2 -3 +1 -2 +3 -1'
        ],
        // 4-8: two of the six stars sit under webs
        webStars: [
            '.  +3W .  .  -2W .',
            '*  *  .  *  *  .',
            '+1 -2 .  *  +4 *',
            '-3 +4 +2 -1 -3 +2'
        ],
        // 5-2: two dense cores and two normal ones, opposites beside them
        denseIntro: [
            '+1 H  +3 -2 H  -1',
            '-2 +3 D  D  -3 +2'
        ],
        // 5-7: a Riser climbs into a web and sticks; reach it from the side
        webRisers: [
            '.  +2W .  .  +3W .',
            '.  .  .  .  .  .',
            '-1 +3R -2 +1 +4 -3R'
        ],
        // 6-2: column 3 is sealed (sealed: [2]); its +2 can be blasted from column 4
        sealIntro: [
            '-4 .  +2 .  .  -2',
            '+1 -3 +4 -2 +3 -1'
        ],
        // 6-8: cores locked in two sealed columns (sealed: [1, 4])
        sealCores: [
            '.  D  .  .  H  .',
            '+2 -3 D  D  +1 -2',
            '-1 H  +3 -4 D  +4'
        ],
        // 7-6: stars above a sealed column (sealed: [3]) and under a web
        sealStars: [
            '.  +3W .  *  .  .',
            '.  *  .  *  *  .',
            '*  .  .  +1 .  *',
            '-2 -4 +1 +3 -1 +2'
        ],
        // 8-2: one twin on top, the other under a wall
        linkIntro: [
            '-1 #  +2E .  +3 .',
            '+2 +3E -4 +1 -2 +4'
        ],
        // 8-9: three pairs, two of them reaching under walls
        linkChain: [
            '.  .  +1E .  .  .',
            '+3E #  -2 .  #  -1E',
            '-2 +4E +3 .  +1E -4',
            '+1 -3 +4E -1 +2 +3'
        ],
        // 9-5: twins in a sealed column (sealed: [0]) and under the stack
        linkSeal: [
            '+2E .  .  .  .  .',
            '-3 +1 .  +2E -4 +2E',
            '+4 -2E +3 -1 +2 -3'
        ],
        // 10-7: a web, a seal (sealed: [3]), a pair and a dense core
        allElements: [
            '.  -2W .  .  .  .',
            '.  .  .  +3E .  .',
            '+1E .  -3 +2 H  .',
            '-2 +4 +1 -4 +3 -1'
        ],
        // Late bosses: the Null Core with a touch of the sector's element
        nullCoreSealed: [
            '.  +2 .  .  .  -1',
            '+2 +1 N  N  -3 +2',
            '-1 +3 N  N  +1 -3'
        ],
        nullCoreLinked: [
            '.  +2E .  .  -3 .',
            '+2 +1 N  N  -1 -2',
            '-1 +3 N  N  -3 +1E'
        ],
        nullCoreWebbed: [
            '.  +2E .  .  -3W .',
            '+2 +1 N  N  .  -2',
            '-1 +3 N  N  -3 +1E'
        ],
        // Big Orb: matching pairs already in reach
        pairs: [
            '+1 .  .  .  .  +2',
            '+2 +1 -2 -1 +2 +1'
        ]
    };

    const POOL_FIRST = { values: [1, 2], specials: 0 };
    const POOL_EARLY = { values: [1, 2, 3], specials: 0 };   // before power-ups unlock at 1-5
    const POOL_STD = { values: [1, 2, 3, 4], specials: 0.12 };

    const zeroOut = (n) => ({ type: 'zero_out', target: n });
    const collect = (n, number) => ({ type: 'collect', target: n, number });
    const breakCores = (n) => ({ type: 'break_cores', target: n });
    const catchStars = (n) => ({ type: 'catch_stars', target: n });
    const clearRisers = (n) => ({ type: 'risers', target: n });
    const survive = (n) => ({ type: 'survive', target: n });
    const nullCore = (hp) => ({ type: 'null_core', target: hp });
    const bigOrb = (size) => ({ type: 'big_orb', target: 1, size });

    // Pair-friendly pools for Big Orb rifts (tide doubles them per sector: 8 / 16 / 32 targets)
    const POOL_PAIRS_1 = { values: [1, 2], specials: 0 };
    const POOL_PAIRS_2 = { values: [1, 2], specials: 0.08, favor: 1 };
    const POOL_PAIRS_3 = { values: [1, 2], specials: 0.08, favor: 1 };

    // Placeholder: a stand-in goal plays until the planned one is built
    const temp = (planned, level) => ({ ...level, temp: true, planned });

    // Handcrafted anchors (GDD §5.3): sector openers, first appearances, bosses and one showcase
    // per sector. Every other slot is generated by tools/levelgen.js into levelsGenerated.js.
    const LEVELS = {
        // ===== Sector 1: Subatomic Genesis =====
        '1-1': { title: 'Subatomic Spark', goal: zeroOut(10), drops: 14, board: B.firstRow, pool: POOL_FIRST },
        '1-2': { title: 'Particle Pulse', goal: zeroOut(16), drops: 13, board: B.twoRows, pool: POOL_EARLY },
        '1-3': {
            title: 'Charge Alignment', goal: breakCores(4), drops: 20, board: B.cores4, pool: POOL_EARLY,
            guide: { orb: -1, col: 0, line: 'Drop −1 on the +1 beside the core.', why: 'A blast next to Dark Matter cracks it. Two hits break it.' }
        },
        '1-4': { title: 'Resonance Lock', goal: breakCores(6), drops: 26, board: B.cores6, pool: POOL_EARLY },
        '1-bonus-1': { title: 'Flux Barrier', goal: bigOrb(8), drops: 20, board: B.pairs, pool: POOL_PAIRS_1 },
        '1-5': {
            title: 'Quantum Leap', goal: zeroOut(18), drops: 16, board: B.threeRows, pool: POOL_STD,
            guide: { orb: 'zero', col: 1, line: 'Drop the 0 orb on the tall stack.', why: 'It blasts every tile around where it lands.' }
        },
        '1-6': { title: 'Ion Core', goal: collect(8, 3), drops: 17, board: B.threeRows, pool: { ...POOL_STD, favor: 3 } },
        '1-7': { title: 'Supernova Cradle', goal: catchStars(3), drops: 10, board: B.stars3, pool: POOL_STD },
        '1-9': {
            title: 'Event Spark', goal: survive(12), board: B.twoRows, pool: POOL_STD, rise: 5,
            guide: { orb: 1, col: 0, line: 'Drop +1 on the −1, then watch the bottom.', why: 'Every 5 moves a new row pushes the whole board up.', riseAfter: true }
        },
        '1-10': { title: 'Singularity Breach', goal: nullCore(12), drops: 25, board: B.nullCore, pool: POOL_STD, rise: 5 },

        // ===== Sector 2: Ion Nebula =====
        '2-1': { title: 'Plasma Surge', goal: zeroOut(20), drops: 23, board: B.threeRows, pool: POOL_STD },
        '2-2': {
            title: 'Nebula Drift', goal: clearRisers(2), drops: 10, board: B.risers1, pool: POOL_STD, risers: { every: 6, max: 1 },
            guide: { orb: -1, col: 4, line: 'Drop the opposite onto the Riser.', why: 'Risers climb a row after every move. Cancel them before the red line.' }
        },
        '2-3': {
            title: 'Ion Cascade', goal: collect(8, 2), drops: 27, board: B.walls, pool: { ...POOL_STD, favor: 1 },
            guide: { orb: -2, col: 2, line: 'Drop −4 on the +4 next to the wall.', why: '0 walls never move or break. Build around them.' }
        },
        '2-4': { title: 'Charged Helix', goal: catchStars(5), drops: 10, board: B.stars5, pool: POOL_STD, risers: { start: 1 } },
        '2-6': { title: 'Magnetar Pulse', goal: clearRisers(4), drops: 22, board: B.risers1, pool: POOL_STD, risers: { every: 6, max: 2 } },
        '2-12': { title: 'Nebula Heart', goal: nullCore(12), drops: 21, board: B.nullCore, pool: POOL_STD, rise: 4, risers: { every: 8, max: 2 } },

        // ===== Sector 3: Event Horizon =====
        '3-1': { title: 'Graviton Well', goal: collect(8, 4), drops: 35, board: B.threeRows, pool: { ...POOL_STD, favor: 1 }, risers: { start: 1 } },
        '3-7': { title: 'Relativistic Shear', goal: clearRisers(6), drops: 19, board: B.risers3, pool: POOL_STD, risers: { every: 5, max: 3 } },
        '3-13': { title: 'The Zero Point Core', goal: nullCore(16), drops: 28, board: B.nullCore, pool: POOL_STD, rise: 5, risers: { every: 6, max: 2 } },

        // ===== Sectors 4–10: handcrafted opener, element intro (node 2 in 4, 5, 6, 8), one showcase
        // and the boss; the rest is generated =====
        // ===== Sector 4: Cosmic Web (Tide 3) =====
        '4-1': { title: 'Thread of Light', goal: zeroOut(20), drops: 23, board: B.threeRows, pool: POOL_STD },
        '4-2': {
            title: 'Strand Weaver', goal: zeroOut(18), drops: 17, board: B.webIntro, pool: POOL_STD,
            guide: { orb: -2, col: 1, line: 'Drop −2 on the webbed +2.', why: 'Webs hold orbs in the air. A blast beside one or a merge snaps the web.' }
        },
        '4-8': { title: 'Silk Horizon', goal: catchStars(6), drops: 10, board: B.webStars, pool: POOL_STD },
        '4-12': { title: 'The Weaver Core', goal: nullCore(16), drops: 28, board: B.nullCore, pool: POOL_STD, rise: 5, risers: { every: 7, max: 2 } },

        // ===== Sector 5: Pulsar Fields (Tide 3) =====
        '5-1': { title: 'First Beacon', goal: catchStars(5), drops: 10, board: B.stars5, pool: POOL_STD },
        '5-2': {
            title: 'Beacon Sweep', goal: breakCores(4), drops: 18, board: B.denseIntro, pool: POOL_STD,
            guide: { orb: -1, col: 0, line: 'Drop −1 on the +1 beside the dense core.', why: 'Dense cores wear armour. Each blast knocks off a plate: four hits break one.' }
        },
        '5-7': { title: 'Timing Array', goal: clearRisers(5), drops: 19, board: B.webRisers, pool: POOL_STD, risers: { every: 5, max: 3 } },
        '5-11': { title: 'The Clockwork Pulsar', goal: nullCore(16), drops: 28, board: B.nullCore, pool: POOL_STD, rise: 5, risers: { every: 6, max: 2 } },

        // ===== Sector 6: Magnetar Reach (Tide 4) =====
        '6-1': { title: 'Magnetic North', goal: breakCores(6), drops: 24, board: B.cores6, pool: POOL_STD },
        '6-2': {
            title: 'Crust Quake', goal: zeroOut(16), drops: 17, board: B.sealIntro, pool: POOL_STD, sealed: [2],
            guide: { orb: -2, col: 3, line: 'Drop −2 beside the +2 in the sealed column.', why: 'You can’t drop into a sealed column. Clear a tile inside it to open it for good.' }
        },
        '6-8': { title: 'Magnetic Storm', goal: breakCores(6), drops: 21, board: B.sealCores, pool: POOL_STD, sealed: [1, 4] },
        '6-13': { title: 'The Magnetar Heart', goal: nullCore(18), drops: 32, board: B.nullCoreSealed, pool: POOL_STD, rise: 6, risers: { every: 6, max: 2 }, sealed: [5] },

        // ===== Sector 7: Quasar Drift (Tide 4) =====
        '7-1': { title: 'Distant Light', goal: collect(10, 32), drops: 35, board: B.threeRows, pool: { ...POOL_STD, favor: 2 } },
        '7-6': { title: 'Radio Lobe', goal: catchStars(6), drops: 12, board: B.sealStars, pool: POOL_STD, sealed: [3] },
        '7-11': { title: 'The Quasar Engine', goal: nullCore(18), drops: 30, board: B.nullCore, pool: POOL_STD, rise: 6, risers: { every: 5, max: 3 } },

        // ===== Sector 8: Void Expanse (Tide 5) =====
        '8-1': { title: 'Edge of Nothing', goal: zeroOut(22), drops: 26, board: B.wallsWide, pool: POOL_STD },
        '8-2': {
            title: 'Empty Reach', goal: zeroOut(18), drops: 20, board: B.linkIntro, pool: POOL_STD,
            guide: { orb: -2, col: 2, line: 'Drop −2 on the linked +2.', why: 'Entangled orbs share a fate: clear one and its twin pops too, even under a wall.' }
        },
        '8-9': { title: 'Bootes Gap', goal: zeroOut(26), drops: 23, board: B.linkChain, pool: POOL_STD },
        '8-14': { title: 'The Void Warden', goal: nullCore(18), drops: 27, board: B.nullCoreLinked, pool: POOL_STD, rise: 6, risers: { every: 4, max: 2 } },

        // ===== Sector 9: Entropy Shoals (Tide 5) =====
        '9-1': { title: 'Arrow of Time', goal: clearRisers(3), drops: 12, board: B.risers2, pool: POOL_STD, risers: { every: 6, max: 1 } },
        '9-5': { title: 'Faded Star', goal: collect(12, 64), drops: 28, board: B.linkSeal, pool: { ...POOL_STD, favor: 2 }, sealed: [0] },
        '9-10': { title: 'The Entropy Core', goal: nullCore(18), drops: 29, board: B.nullCore, pool: POOL_STD, rise: 6, risers: { start: 1, every: 6, max: 3 } },

        // ===== Sector 10: Nullfall (Tide 6) =====
        '10-1': { title: 'The Last Sector', goal: zeroOut(24), drops: 30, board: B.wallsWide, pool: POOL_STD },
        '10-7': { title: 'Fallen Light', goal: zeroOut(28), drops: 30, board: B.allElements, pool: POOL_STD, sealed: [3] },
        '10-14': { title: 'Nullfall', goal: nullCore(20), drops: 33, board: B.nullCoreWebbed, pool: POOL_STD, rise: 6, risers: { every: 4, max: 2 } }
    };

    return { LEVELS };
}));
