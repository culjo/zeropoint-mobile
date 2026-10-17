// Nullfall - Adventure level data
// Every node ships as fixed data (GDD §5.3). One goal per level; the counter only counts down.
// Stars come from drops left (≥25% ★★, ≥45% ★★★), worked out by the loader in nodeGenerator.js.
//
// Level fields
//   title    node name shown on the map and cards
//   goal     { type, target, number? }  type: zero_out | collect | break_cores
//            (catch_stars, risers, survive, null_core and big_orb arrive in phase 2)
//   drops    drop budget
//   board    rows top to bottom, aligned to the bottom of the 6×8 board.
//            Tokens: .  empty   +3 / -3  number orb   D  Dark Matter core
//   pool     { values: [magnitudes], specials: chance of a special orb, favor?: magnitude dealt twice as often }
//   rise     a rising row every N drops (0 or missing = none)
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
        ]
    };

    const POOL_FIRST = { values: [1, 2], specials: 0 };
    const POOL_EARLY = { values: [1, 2, 3], specials: 0 };   // before power-ups unlock at 1-5
    const POOL_STD = { values: [1, 2, 3, 4], specials: 0.12 };

    const zeroOut = (n) => ({ type: 'zero_out', target: n });
    const collect = (n, number) => ({ type: 'collect', target: n, number });
    const breakCores = (n) => ({ type: 'break_cores', target: n });

    // Placeholder: a stand-in goal plays until the planned one is built
    const temp = (planned, level) => ({ ...level, temp: true, planned });

    const LEVELS = {
        // ===== Sector 1: Subatomic Genesis =====
        '1-1': { title: 'Subatomic Spark', goal: zeroOut(10), drops: 14, board: B.firstRow, pool: POOL_FIRST },
        '1-2': { title: 'Particle Pulse', goal: zeroOut(16), drops: 16, board: B.twoRows, pool: POOL_EARLY },
        '1-3': { title: 'Charge Alignment', goal: breakCores(4), drops: 16, board: B.cores4, pool: POOL_EARLY },
        '1-4': { title: 'Resonance Lock', goal: breakCores(6), drops: 20, board: B.cores6, pool: POOL_EARLY },
        '1-bonus-1': temp('big_orb 8', { title: 'Flux Barrier', goal: zeroOut(12), drops: 14, board: B.twoRows, pool: POOL_EARLY }),
        '1-5': { title: 'Quantum Leap', goal: zeroOut(18), drops: 18, board: B.threeRows, pool: POOL_STD },
        '1-6': { title: 'Ion Core', goal: collect(8, 3), drops: 18, board: B.threeRows, pool: { ...POOL_STD, favor: 3 } },
        '1-7': temp('catch_stars 3', { title: 'Supernova Cradle', goal: zeroOut(14), drops: 16, board: B.twoRows, pool: POOL_STD }),
        '1-8': temp('catch_stars 5', { title: 'Vortex Gate', goal: zeroOut(18), drops: 18, board: B.threeRows, pool: POOL_STD }),
        '1-bonus-2': temp('big_orb 8', { title: 'Singularity Rift', goal: zeroOut(14), drops: 16, board: B.twoRows, pool: POOL_STD }),
        '1-9': temp('survive 12, row every 5', { title: 'Event Spark', goal: zeroOut(16), drops: 18, board: B.twoRows, pool: POOL_STD, rise: 5 }),
        '1-10': temp('null_core 12', { title: 'Singularity Breach', goal: breakCores(6), drops: 20, board: B.cores6, pool: POOL_STD, rise: 5 }),

        // ===== Sector 2: Ion Nebula =====
        '2-1': { title: 'Plasma Surge', goal: zeroOut(20), drops: 20, board: B.threeRows, pool: POOL_STD },
        '2-2': temp('risers 2', { title: 'Nebula Drift', goal: zeroOut(18), drops: 18, board: B.twoRows, pool: POOL_STD }),
        '2-3': temp('static blocks intro', { title: 'Ion Cascade', goal: collect(12, 2), drops: 20, board: B.twoRows, pool: { ...POOL_STD, favor: 2 } }),
        '2-bonus-1': temp('big_orb 16', { title: 'Charged Rift', goal: zeroOut(16), drops: 18, board: B.twoRows, pool: POOL_STD }),
        '2-4': temp('catch_stars 5 + 1 riser', { title: 'Charged Helix', goal: zeroOut(20), drops: 20, board: B.threeRows, pool: POOL_STD }),
        '2-5': { title: 'Solar Lattice', goal: breakCores(6), drops: 20, board: B.cores6, pool: POOL_STD, rise: 6 },
        '2-6': temp('risers 4, new every 6', { title: 'Magnetar Pulse', goal: zeroOut(20), drops: 20, board: B.threeRows, pool: POOL_STD }),
        '2-bonus-2': temp('big_orb 16', { title: 'Plasma Rift', goal: zeroOut(16), drops: 18, board: B.twoRows, pool: POOL_STD }),
        '2-7': temp('survive 15, row every 4', { title: 'Chromosphere', goal: zeroOut(20), drops: 20, board: B.twoRows, pool: POOL_STD, rise: 4 }),
        '2-8': temp('catch_stars 6 + rising rows', { title: 'Fusion Conduit', goal: zeroOut(22), drops: 22, board: B.threeRows, pool: POOL_STD, rise: 5 }),
        '2-9': temp('1 riser obstacle', { title: 'Corona Spark', goal: breakCores(8), drops: 22, board: B.cores8, pool: POOL_STD }),
        '2-10': temp('null_core 20', { title: 'Hypernova Gate', goal: breakCores(8), drops: 22, board: B.cores8, pool: POOL_STD, rise: 4 }),

        // ===== Sector 3: Event Horizon =====
        '3-1': temp('1 riser obstacle', { title: 'Graviton Well', goal: collect(14, 4), drops: 22, board: B.threeRows, pool: { ...POOL_STD, favor: 4 } }),
        '3-2': temp('risers 5, 2 at once', { title: 'Dark Barrier', goal: zeroOut(22), drops: 22, board: B.threeRows, pool: POOL_STD }),
        '3-3': temp('catch_stars 6 + 2 risers', { title: 'Event Perimeter', goal: zeroOut(22), drops: 22, board: B.threeRows, pool: POOL_STD }),
        '3-bonus-1': temp('big_orb 32', { title: 'Horizon Rift', goal: zeroOut(20), drops: 22, board: B.twoRows, pool: POOL_STD }),
        '3-4': { title: 'Singularity Trench', goal: zeroOut(30), drops: 26, board: B.threeRows, pool: POOL_STD, rise: 5 },
        '3-5': temp('2 risers obstacle', { title: 'Void Horizon', goal: breakCores(10), drops: 24, board: B.cores10, pool: POOL_STD }),
        '3-6': temp('survive 18, row every 4 + 1 riser', { title: 'Tidal Breach', goal: zeroOut(24), drops: 24, board: B.twoRows, pool: POOL_STD, rise: 4 }),
        '3-bonus-2': temp('big_orb 32', { title: 'Photon Rift', goal: zeroOut(20), drops: 22, board: B.twoRows, pool: POOL_STD }),
        '3-7': temp('risers 6, 3 at once', { title: 'Relativistic Shear', goal: zeroOut(24), drops: 24, board: B.threeRows, pool: POOL_STD }),
        '3-8': temp('catch_stars 7 + rising rows', { title: 'Photon Ring', goal: zeroOut(24), drops: 24, board: B.threeRows, pool: POOL_STD, rise: 5 }),
        '3-9': { title: 'Accretion Wall', goal: breakCores(10), drops: 24, board: B.cores8, pool: POOL_STD, rise: 5 },
        '3-10': temp('null_core 30', { title: 'The Zero Point Core', goal: breakCores(10), drops: 26, board: B.cores10, pool: POOL_STD, rise: 4 })
    };

    return { LEVELS };
}));
