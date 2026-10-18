// Nullfall - level templates and generated slots (GDD §5.3)
// A template turns a seed into level data: a starting board (written at Tide 0, like levels.js),
// an orb pool and the slot's goal and obstacle. Slots say which template fills each node.

'use strict';

const ROWS = 8;
const COLS = 6;

const POOL_STD = { values: [1, 2, 3, 4], specials: 0.12 };
const POOL_PAIRS = { values: [1, 2], specials: 0.08, favor: 1 };

function randInt(rng, a, b) {
    return a + Math.floor(rng.next() * (b - a + 1));
}

function pick(rng, list) {
    return list[Math.floor(rng.next() * list.length)];
}

function shuffle(rng, list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Builds a board as level rows (top to bottom). Cells are indexed [rowFromBottom][col].
 * opts: height [min, max] · fill (chance a column reaches full height) · values (Tide-0 magnitudes)
 *       dm (cores) · statics (# walls) · risers (Riser orbs on column tops) · stars (star cells)
 *       mustHave: { value, count } numbers that must appear (Collect)
 */
function buildBoard(rng, opts) {
    const values = opts.values || [1, 2, 3, 4];
    const cells = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    const [hMin, hMax] = opts.height || [1, 2];
    const heights = [];
    for (let c = 0; c < COLS; c++) {
        const full = randInt(rng, hMin, hMax);
        heights.push(rng.next() < (opts.fill ?? 0.8) ? full : Math.max(0, full - 1));
    }
    // Enough cells for the cores, walls and must-have numbers
    const needed = (opts.dm || 0) + (opts.statics || 0) + ((opts.mustHave && opts.mustHave.count) || 0) + (opts.risers || 0);
    let total = heights.reduce((a, b) => a + b, 0);
    while (total < needed + 2) {
        const c = randInt(rng, 0, COLS - 1);
        if (heights[c] < 4) { heights[c]++; total++; }
    }

    const reacts = (a, b) => a && b && typeof a === 'number' && typeof b === 'number' && (a === b || a === -b);
    const numberAt = (r, c) => (r >= 0 && c >= 0 && c < COLS && typeof cells[r][c] === 'number' ? cells[r][c] : null);
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < heights[c]; r++) {
            let v = null;
            for (let tries = 0; tries < 30; tries++) {
                const cand = pick(rng, values) * (rng.next() < 0.5 ? 1 : -1);
                if (!reacts(cand, numberAt(r, c - 1)) && !reacts(cand, numberAt(r - 1, c))) { v = cand; break; }
            }
            cells[r][c] = v === null ? 'D' : v; // nothing fits: a core keeps the board calm
        }
    }

    const filled = [];
    for (let c = 0; c < COLS; c++) for (let r = 0; r < heights[c]; r++) filled.push([r, c]);

    // Must-have numbers (Collect): overwrite cells where the value doesn't react
    if (opts.mustHave) {
        let placed = 0;
        shuffle(rng, filled).forEach(([r, c]) => {
            if (placed >= opts.mustHave.count) return;
            const v = opts.mustHave.value * (rng.next() < 0.5 ? 1 : -1);
            const near = [numberAt(r, c - 1), numberAt(r, c + 1), numberAt(r - 1, c), numberAt(r + 1, c)];
            if (near.some((n) => reacts(v, n))) return;
            cells[r][c] = v;
            placed++;
        });
    }
    const isNum = (r, c) => typeof cells[r][c] === 'number';
    // Cores and walls replace numbers (walls in the bottom two rows)
    shuffle(rng, filled.filter(([r, c]) => isNum(r, c) && Math.abs(cells[r][c]) !== (opts.mustHave && opts.mustHave.value)))
        .slice(0, opts.dm || 0).forEach(([r, c]) => { cells[r][c] = 'D'; });
    shuffle(rng, filled.filter(([r, c]) => r <= 1 && isNum(r, c))).slice(0, opts.statics || 0).forEach(([r, c]) => { cells[r][c] = '#'; });

    // Risers sit on column tops
    const tops = [];
    for (let c = 0; c < COLS; c++) if (heights[c] > 0 && isNum(heights[c] - 1, c)) tops.push(c);
    shuffle(rng, tops).slice(0, opts.risers || 0).forEach((c) => { cells[heights[c] - 1][c] = `${cells[heights[c] - 1][c]}R`; });

    // Stars: 1–3 rows above a column top, never above rowFromBottom 5
    const stars = [];
    const cols = shuffle(rng, [...Array(COLS).keys()]);
    for (let i = 0; i < (opts.stars || 0); i++) {
        const c = cols[i % COLS];
        let r = heights[c] + Math.min(i < 2 ? 0 : randInt(rng, 0, 2), 5);
        while (r <= 5 && (cells[r][c] !== null || stars.some((s) => s.r === r && s.c === c))) r++;
        if (r > 5) continue;
        stars.push({ r, c });
        cells[r][c] = '*';
    }

    // Rows top to bottom, trimmed to the tallest used row
    let topRow = 0;
    for (let r = 0; r < ROWS; r++) if (cells[r].some((x) => x !== null)) topRow = r;
    const rows = [];
    for (let r = topRow; r >= 0; r--) {
        rows.push(cells[r].map((x) => (x === null ? '.' : (typeof x === 'number' ? (x > 0 ? `+${x}` : `${x}`) : String(x).replace(/^(\d)/, '+$1')))).join(' '));
    }
    return rows;
}

// slot -> level data (drops is set by the generator)
const TEMPLATES = {
    zero_out: {
        build: (rng, s) => ({
            title: s.title, goal: s.goal, rise: s.rise || 0, risers: s.risers,
            pool: POOL_STD,
            board: buildBoard(rng, { height: [1, 3], fill: 0.75, statics: s.statics || 0, risers: (s.risers && s.risers.start) ? 0 : 0 })
        })
    },
    collect: {
        build: (rng, s) => ({
            title: s.title, goal: s.goal, rise: s.rise || 0, risers: s.risers,
            pool: { ...POOL_STD, favor: s.favor },
            board: buildBoard(rng, { height: [2, 3], fill: 0.8, statics: s.statics || 0, mustHave: { value: s.favor, count: 3 } })
        })
    },
    cores: {
        build: (rng, s) => ({
            title: s.title, goal: s.goal, rise: s.rise || 0, risers: s.risers,
            pool: POOL_STD,
            board: buildBoard(rng, { height: [2, 3], fill: 0.85, dm: s.rise ? Math.max(3, s.goal.target - 3) : s.goal.target + 1 })
        })
    },
    stars: {
        build: (rng, s) => ({
            title: s.title, goal: s.goal, rise: s.rise || 0, risers: s.risers,
            pool: POOL_STD,
            board: buildBoard(rng, { height: [1, 3], fill: 0.7, stars: s.goal.target })
        })
    },
    risers: {
        build: (rng, s) => ({
            title: s.title, goal: s.goal, risers: s.risers,
            pool: POOL_STD,
            board: buildBoard(rng, { height: [1, 2], fill: 0.75, risers: s.boardRisers || 1 })
        })
    },
    survive: {
        // Difficulty comes from how tall the stack starts, so candidates try 1–4 rows
        build: (rng, s) => {
            const h = randInt(rng, 1, 4);
            return {
                title: s.title, goal: s.goal, rise: s.rise, risers: s.risers,
                pool: POOL_STD,
                board: buildBoard(rng, { height: [h, Math.min(5, h + 1)], fill: 0.85 })
            };
        }
    },
    big_orb: {
        build: (rng, s) => ({
            title: s.title, goal: s.goal,
            pool: POOL_PAIRS,
            board: buildBoard(rng, { height: [1, 2], fill: 0.7, values: [1, 2] })
        })
    }
};

const zeroOut = (n) => ({ type: 'zero_out', target: n });
const collect = (n, number) => ({ type: 'collect', target: n, number });
const breakCores = (n) => ({ type: 'break_cores', target: n });
const catchStars = (n) => ({ type: 'catch_stars', target: n });
const clearRisers = (n) => ({ type: 'risers', target: n });
const survive = (n) => ({ type: 'survive', target: n });
const bigOrb = (size) => ({ type: 'big_orb', target: 1, size });

// Generated slots (docs/adventure-objectives.md §5). Collect `number` is the real number at the
// sector's tide; `favor` is its Tide-0 value.
const SLOTS = {
    // Sector 1 (Tide 0)
    '1-8': { template: 'stars', title: 'Vortex Gate', goal: catchStars(5) },
    '1-bonus-2': { template: 'big_orb', title: 'Singularity Rift', goal: bigOrb(8) },
    // Sector 2 (Tide 1)
    '2-bonus-1': { template: 'big_orb', title: 'Charged Rift', goal: bigOrb(16) },
    '2-5': { template: 'cores', title: 'Solar Lattice', goal: breakCores(6), rise: 6 },
    '2-bonus-2': { template: 'big_orb', title: 'Plasma Rift', goal: bigOrb(16) },
    '2-7': { template: 'zero_out', title: 'Storm Front', goal: zeroOut(24), statics: 2 },
    '2-8': { template: 'survive', title: 'Chromosphere', goal: survive(15), rise: 4 },
    '2-9': { template: 'stars', title: 'Fusion Conduit', goal: catchStars(5), rise: 5 },
    '2-10': { template: 'collect', title: 'Aurora Veil', goal: collect(12, 4), favor: 2, risers: { start: 1 } },
    '2-11': { template: 'cores', title: 'Corona Spark', goal: breakCores(8), risers: { start: 1 } },
    // Sector 3 (Tide 2)
    '3-2': { template: 'risers', title: 'Dark Barrier', goal: clearRisers(5), boardRisers: 2, risers: { every: 5, max: 2 } },
    '3-3': { template: 'stars', title: 'Event Perimeter', goal: catchStars(6), risers: { start: 2 } },
    '3-bonus-1': { template: 'big_orb', title: 'Horizon Rift', goal: bigOrb(32) },
    '3-4': { template: 'zero_out', title: 'Singularity Trench', goal: zeroOut(30), rise: 5 },
    '3-5': { template: 'cores', title: 'Void Horizon', goal: breakCores(10), risers: { start: 2 } },
    '3-6': { template: 'survive', title: 'Tidal Breach', goal: survive(18), rise: 4, risers: { start: 1 } },
    '3-bonus-2': { template: 'big_orb', title: 'Photon Rift', goal: bigOrb(32) },
    '3-8': { template: 'stars', title: 'Photon Ring', goal: catchStars(7), rise: 5 },
    '3-9': { template: 'cores', title: 'Accretion Wall', goal: breakCores(10), rise: 5 },
    '3-10': { template: 'collect', title: 'Gravity Lens', goal: collect(12, 8), favor: 2, statics: 2 },
    '3-11': { template: 'survive', title: 'Dark Tide', goal: survive(20), rise: 4, risers: { start: 1 } },
    '3-12': { template: 'zero_out', title: 'Zero Horizon', goal: zeroOut(34), rise: 5, statics: 2 }
};

module.exports = { TEMPLATES, SLOTS, buildBoard };
