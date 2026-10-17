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
//                    N  Null Core cell (4 make the 2×2 core)   *  star in an empty cell (never the top row)
//   pool     { values: [magnitudes], specials: chance of a special orb, favor?: magnitude dealt twice as often }
//   rise     a rising row every N drops (0 or missing = none)
//   risers   { start, every, max }  Risers added at the start, then one every `every` drops
//            while fewer than `max` are on the board (they push up from the bottom of the emptiest column)
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

    // Pair-friendly pools for Big Orb rifts (the bag randomizer in phase 3 takes over)
    const POOL_PAIRS_1 = { values: [1, 2], specials: 0 };
    const POOL_PAIRS_2 = { values: [1, 2, 4], specials: 0.08, favor: 2 };
    const POOL_PAIRS_3 = { values: [2, 4, 8], specials: 0.08, favor: 4 };

    // Placeholder: a stand-in goal plays until the planned one is built
    const temp = (planned, level) => ({ ...level, temp: true, planned });

    const LEVELS = {
        // ===== Sector 1: Subatomic Genesis =====
        '1-1': { title: 'Subatomic Spark', goal: zeroOut(10), drops: 14, board: B.firstRow, pool: POOL_FIRST },
        '1-2': { title: 'Particle Pulse', goal: zeroOut(16), drops: 16, board: B.twoRows, pool: POOL_EARLY },
        '1-3': { title: 'Charge Alignment', goal: breakCores(4), drops: 16, board: B.cores4, pool: POOL_EARLY },
        '1-4': { title: 'Resonance Lock', goal: breakCores(6), drops: 20, board: B.cores6, pool: POOL_EARLY },
        '1-bonus-1': { title: 'Flux Barrier', goal: bigOrb(8), drops: 14, board: B.pairs, pool: POOL_PAIRS_1 },
        '1-5': { title: 'Quantum Leap', goal: zeroOut(18), drops: 18, board: B.threeRows, pool: POOL_STD },
        '1-6': { title: 'Ion Core', goal: collect(8, 3), drops: 18, board: B.threeRows, pool: { ...POOL_STD, favor: 3 } },
        '1-7': { title: 'Supernova Cradle', goal: catchStars(3), drops: 12, board: B.stars3, pool: POOL_STD },
        '1-8': { title: 'Vortex Gate', goal: catchStars(5), drops: 16, board: B.stars5, pool: POOL_STD },
        '1-bonus-2': { title: 'Singularity Rift', goal: bigOrb(8), drops: 12, board: B.pairs, pool: POOL_PAIRS_1 },
        '1-9': { title: 'Event Spark', goal: survive(12), board: B.twoRows, pool: POOL_STD, rise: 5 },
        '1-10': { title: 'Singularity Breach', goal: nullCore(12), drops: 22, board: B.nullCore, pool: POOL_STD, rise: 5 },

        // ===== Sector 2: Ion Nebula =====
        '2-1': { title: 'Plasma Surge', goal: zeroOut(20), drops: 20, board: B.threeRows, pool: POOL_STD },
        '2-2': { title: 'Nebula Drift', goal: clearRisers(2), drops: 16, board: B.risers1, pool: POOL_STD, risers: { every: 6, max: 1 } },
        '2-3': temp('static blocks intro', { title: 'Ion Cascade', goal: collect(12, 2), drops: 20, board: B.twoRows, pool: { ...POOL_STD, favor: 2 } }),
        '2-bonus-1': { title: 'Charged Rift', goal: bigOrb(16), drops: 18, board: B.pairs, pool: POOL_PAIRS_2 },
        '2-4': { title: 'Charged Helix', goal: catchStars(5), drops: 16, board: B.stars5, pool: POOL_STD, risers: { start: 1 } },
        '2-5': { title: 'Solar Lattice', goal: breakCores(6), drops: 20, board: B.cores6, pool: POOL_STD, rise: 6 },
        '2-6': { title: 'Magnetar Pulse', goal: clearRisers(4), drops: 22, board: B.risers1, pool: POOL_STD, risers: { every: 6, max: 2 } },
        '2-bonus-2': { title: 'Plasma Rift', goal: bigOrb(16), drops: 18, board: B.pairs, pool: POOL_PAIRS_2 },
        '2-7': { title: 'Chromosphere', goal: survive(15), board: B.twoRows, pool: POOL_STD, rise: 4 },
        '2-8': { title: 'Fusion Conduit', goal: catchStars(6), drops: 18, board: B.stars6, pool: POOL_STD, rise: 5 },
        '2-9': { title: 'Corona Spark', goal: breakCores(8), drops: 22, board: B.cores8, pool: POOL_STD, risers: { start: 1 } },
        '2-10': { title: 'Hypernova Gate', goal: nullCore(20), drops: 26, board: B.nullCore, pool: POOL_STD, rise: 4, risers: { every: 8, max: 2 } },

        // ===== Sector 3: Event Horizon =====
        '3-1': { title: 'Graviton Well', goal: collect(14, 4), drops: 22, board: B.threeRows, pool: { ...POOL_STD, favor: 4 }, risers: { start: 1 } },
        '3-2': { title: 'Dark Barrier', goal: clearRisers(5), drops: 22, board: B.risers2, pool: POOL_STD, risers: { every: 5, max: 2 } },
        '3-3': { title: 'Event Perimeter', goal: catchStars(6), drops: 18, board: B.stars6, pool: POOL_STD, risers: { start: 2 } },
        '3-bonus-1': { title: 'Horizon Rift', goal: bigOrb(32), drops: 22, board: B.pairs, pool: POOL_PAIRS_3 },
        '3-4': { title: 'Singularity Trench', goal: zeroOut(30), drops: 26, board: B.threeRows, pool: POOL_STD, rise: 5 },
        '3-5': { title: 'Void Horizon', goal: breakCores(10), drops: 24, board: B.cores10, pool: POOL_STD, risers: { start: 2 } },
        '3-6': { title: 'Tidal Breach', goal: survive(18), board: B.twoRows, pool: POOL_STD, rise: 4, risers: { start: 1 } },
        '3-bonus-2': { title: 'Photon Rift', goal: bigOrb(32), drops: 22, board: B.pairs, pool: POOL_PAIRS_3 },
        '3-7': { title: 'Relativistic Shear', goal: clearRisers(6), drops: 24, board: B.risers3, pool: POOL_STD, risers: { every: 5, max: 3 } },
        '3-8': { title: 'Photon Ring', goal: catchStars(7), drops: 20, board: B.stars7, pool: POOL_STD, rise: 5 },
        '3-9': { title: 'Accretion Wall', goal: breakCores(10), drops: 24, board: B.cores8, pool: POOL_STD, rise: 5 },
        '3-10': { title: 'The Zero Point Core', goal: nullCore(30), drops: 30, board: B.nullCore, pool: POOL_STD, rise: 4, risers: { every: 6, max: 2 } }
    };

    return { LEVELS };
}));
