// Nullfall - level templates and generated slots (GDD §5.3)
// A template turns a seed into level data: a starting board (written at Tide 0, like levels.js),
// an orb pool and the slot's goal and obstacle. Slots say which template fills each node.

'use strict';

const path = require('path');
const NodeGenerator = require(path.join(__dirname, '..', 'www', 'nodeGenerator.js'));

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
 *       dense (cores that become 4 HP dense cores) · webs (webbed orbs hanging one cell above a column top)
 *       links (entangled pairs) · sealed (sealed columns, written to out.sealed)
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

    // Dense cores: some of the cores get armour
    // (each step only draws from the rng when asked for, so older slots generate the same boards)
    if (opts.dense) shuffle(rng, filled.filter(([r, c]) => cells[r][c] === 'D')).slice(0, opts.dense || 0).forEach(([r, c]) => { cells[r][c] = 'H'; });

    // Risers sit on column tops
    const tops = [];
    for (let c = 0; c < COLS; c++) if (heights[c] > 0 && isNum(heights[c] - 1, c)) tops.push(c);
    shuffle(rng, tops).slice(0, opts.risers || 0).forEach((c) => { cells[heights[c] - 1][c] = `${cells[heights[c] - 1][c]}R`; });

    // Entangled pairs: number orbs anywhere in the stack (paired in reading order)
    const marks = {};
    const mark = (r, c, m) => { marks[`${r},${c}`] = m; };
    if (opts.links) shuffle(rng, filled.filter(([r, c]) => isNum(r, c) && !String(cells[r][c]).endsWith('R'))).slice(0, 2 * (opts.links || 0)).forEach(([r, c]) => mark(r, c, 'E'));

    // Webbed orbs hang one empty cell above a column top (rows 2–4), away from the walls
    if (opts.webs) shuffle(rng, [...Array(COLS).keys()]).filter((c) => heights[c] + 1 <= 4).slice(0, opts.webs || 0).forEach((c) => {
        const r = heights[c] + 1;
        let v = null;
        for (let tries = 0; tries < 30 && v === null; tries++) {
            const cand = pick(rng, values) * (rng.next() < 0.5 ? 1 : -1);
            if (!reacts(cand, numberAt(r, c - 1)) && !reacts(cand, numberAt(r, c + 1))) v = cand;
        }
        if (v === null) return;
        cells[r][c] = v;
        mark(r, c, 'W');
    });

    // Sealed columns: one tall enough that a shorter open neighbour lets a drop land beside its tiles
    if (opts.sealed && opts.out) {
        const top = (c) => { let h = 0; for (let r = 0; r < ROWS; r++) if (cells[r][c] !== null) h = r + 1; return h; };
        const sealed = [];
        shuffle(rng, [...Array(COLS).keys()]).forEach((c) => {
            if (sealed.length >= opts.sealed || top(c) < 2) return;
            if (sealed.some((x) => Math.abs(x - c) <= 1)) return;
            const side = [c - 1, c + 1].filter((n) => n >= 0 && n < COLS);
            const hasNum = Array.from({ length: top(c) }, (_, r) => r).some((r) => isNum(r, c) && side.some((n) => top(n) <= r));
            if (hasNum) sealed.push(c);
        });
        opts.out.sealed = sealed.sort((a, b) => a - b);
    }

    // Stars: 1–3 rows above a column top, never above rowFromBottom 5
    const stars = [];
    const cols = shuffle(rng, [...Array(COLS).keys()]);
    for (let i = 0; i < (opts.stars || 0); i++) {
        const c = cols[i % COLS];
        let r = heights[c] + Math.min(i < 2 ? 0 : randInt(rng, 0, 2), 5);
        // (never in a gap under a webbed orb: that's a handcrafted puzzle, too slow with rising rows)
        const webAbove = (rr) => Object.keys(marks).some((k) => marks[k] === 'W' && Number(k.split(',')[1]) === c && Number(k.split(',')[0]) > rr);
        while (r <= 5 && (cells[r][c] !== null || stars.some((s) => s.r === r && s.c === c) || webAbove(r))) r++;
        if (r > 5) continue;
        stars.push({ r, c });
        cells[r][c] = '*';
    }

    // Rows top to bottom, trimmed to the tallest used row
    let topRow = 0;
    for (let r = 0; r < ROWS; r++) if (cells[r].some((x) => x !== null)) topRow = r;
    const rows = [];
    for (let r = topRow; r >= 0; r--) {
        rows.push(cells[r].map((x, c) => (x === null ? '.' : (typeof x === 'number' ? `${x > 0 ? `+${x}` : `${x}`}${marks[`${r},${c}`] || ''}` : String(x).replace(/^(\d)/, '+$1')))).join(' '));
    }
    return rows;
}

// The board plus any late board elements the slot asks for (GDD §5.2): webs, links, sealed
// columns and dense cores. A sealed column also lands in the level data.
function boardFor(rng, s, opts) {
    const out = {};
    const board = buildBoard(rng, { ...opts, webs: s.webs, links: s.links, sealed: s.sealed, dense: s.dense, out });
    return out.sealed && out.sealed.length ? { board, sealed: out.sealed } : { board };
}

// slot -> level data (drops is set by the generator)
const TEMPLATES = {
    zero_out: {
        build: (rng, s) => ({
            title: s.title, goal: s.goal, rise: s.rise || 0, risers: s.risers,
            pool: POOL_STD,
            ...boardFor(rng, s, { height: [1, 3], fill: 0.75, statics: s.statics || 0, risers: (s.risers && s.risers.start) ? 0 : 0 })
        })
    },
    collect: {
        build: (rng, s) => ({
            title: s.title, goal: s.goal, rise: s.rise || 0, risers: s.risers,
            pool: { ...POOL_STD, favor: s.favor },
            ...boardFor(rng, s, { height: [2, 3], fill: 0.8, statics: s.statics || 0, mustHave: { value: s.favor, count: 3 } })
        })
    },
    cores: {
        build: (rng, s) => ({
            title: s.title, goal: s.goal, rise: s.rise || 0, risers: s.risers,
            pool: POOL_STD,
            ...boardFor(rng, s, { height: [2, 3], fill: 0.85, dm: s.rise ? Math.max(3, s.goal.target - 3) : s.goal.target + 1 })
        })
    },
    stars: {
        build: (rng, s) => ({
            title: s.title, goal: s.goal, rise: s.rise || 0, risers: s.risers,
            pool: POOL_STD,
            ...boardFor(rng, s, { height: [1, 3], fill: 0.7, stars: s.goal.target })
        })
    },
    risers: {
        build: (rng, s) => ({
            title: s.title, goal: s.goal, risers: s.risers,
            pool: POOL_STD,
            ...boardFor(rng, s, { height: [1, 2], fill: 0.75, risers: s.boardRisers || 1 })
        })
    },
    survive: {
        // Difficulty comes from how tall the stack starts, so candidates try 1–4 rows
        build: (rng, s) => {
            const h = randInt(rng, 1, 4);
            return {
                title: s.title, goal: s.goal, rise: s.rise, risers: s.risers,
                pool: POOL_STD,
                ...boardFor(rng, s, { height: [h, Math.min(5, h + 1)], fill: 0.85 })
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

// ---------- Sectors 4–10 ----------
// Each sector lists its generated main nodes (opener and boss are handcrafted in levels.js) as a
// goal order plus titles, and its bonus rift titles. Targets and obstacles grow with the sector
// (k = 0 at Sector 4 … 6 at Sector 10) and with the node's place in the sector (p = 0 … 1).
const LATE_SECTORS = {
    4: {
        goals: ['collect', 'cores', 'stars', 'zero_out', 'risers', 'survive', 'collect', 'cores', 'stars', 'zero_out'],
        titles: ['Strand Weaver', 'Filament Fork', 'Web Junction', 'Gossamer Drift', 'Node Cluster', 'Dark Thread', 'Silk Horizon', 'Lattice Knot', 'Cobweb Spiral', 'Strand Breaker'],
        bonus: ['Filament Rift', 'Web Rift']
    },
    5: {
        goals: ['risers', 'zero_out', 'survive', 'cores', 'collect', 'stars', 'risers', 'survive', 'cores'],
        titles: ['Beacon Sweep', 'Lighthouse Beam', 'Spin Down', 'Radio Pulse', 'Neutron Hum', 'Timing Array', 'Glitch Star', 'Beam Crossing', 'Millisecond Flash'],
        bonus: ['Beacon Rift']
    },
    6: {
        goals: ['stars', 'collect', 'cores', 'risers', 'zero_out', 'survive', 'stars', 'collect', 'risers', 'cores', 'survive'],
        titles: ['Crust Quake', 'Field Line', 'Starquake', 'Flux Tube', 'Iron Rain', 'Polar Cap', 'Magnetic Storm', 'Fracture Zone', 'Sheared Field', 'Twisted Pole', 'Flare Burst'],
        bonus: ['Crust Rift', 'Flux Rift']
    },
    7: {
        goals: ['zero_out', 'risers', 'cores', 'survive', 'collect', 'stars', 'cores', 'risers', 'survive'],
        titles: ['Jet Stream', 'Blazing Disc', 'Redshift Run', 'Lyman Forest', 'Radio Lobe', 'Hot Spot', 'Torus Ring', 'Broad Line', 'Beamed Light'],
        bonus: ['Jet Rift', 'Disc Rift']
    },
    8: {
        goals: ['collect', 'stars', 'risers', 'cores', 'zero_out', 'survive', 'collect', 'stars', 'risers', 'cores', 'zero_out', 'survive'],
        titles: ['Empty Reach', 'Silent Shell', 'Cold Wall', 'Void Bubble', 'Sparse Field', 'Lost Signal', 'Dim Halo', 'Bootes Gap', 'Echo Chamber', 'Hollow Sky', 'Thin Thread', 'Drift Line'],
        bonus: ['Void Rift', 'Hollow Rift']
    },
    9: {
        goals: ['cores', 'risers', 'survive', 'collect', 'stars', 'zero_out', 'risers', 'survive'],
        titles: ['Heat Death', 'Cooling Ember', 'Slow Decay', 'Faded Star', 'Last Light', 'Iron Star', 'Red Dwarf Sea', 'Frozen Time'],
        bonus: ['Ember Rift']
    },
    10: {
        goals: ['survive', 'collect', 'cores', 'risers', 'stars', 'zero_out', 'survive', 'collect', 'cores', 'risers', 'stars', 'zero_out'],
        titles: ['Collapse Front', 'Zero Field', 'Final Fold', 'Null Wave', 'Edge of Zero', 'Fallen Light', 'Last Horizon', 'Undoing', 'Silent Sum', 'Balance Point', 'Zero Crown', 'Fall Line'],
        bonus: ['Null Rift', 'Zero Rift']
    }
};

// Board elements by sector (GDD §5.2): webbed orbs from Sector 4, dense cores from 5 (core levels
// only), sealed columns from 6, entangled pairs from 8. Slots that take an element rotate through
// the unlocked ones, newest first, plus the old 0 walls. One element per level.
function elementsFor(k) {
    const list = ['webs'];
    if (k >= 2) list.unshift('sealed');
    if (k >= 4) list.unshift('links');
    return list.concat('statics');
}

function elementFields(element, k) {
    if (element === 'webs') return { webs: k >= 4 ? 3 : 2 };
    if (element === 'sealed') return { sealed: k >= 6 ? 2 : 1 };
    if (element === 'links') return { links: k >= 6 ? 2 : 1 };
    return { statics: 2 };
}

// One generated slot: goal size and obstacle from the sector (k), the node's place (p) and
// how many of this goal the sector has had so far (n, so repeats swap their obstacle).
// `element` is the board element for slots that take one (see elementsFor).
function lateSlot(goal, title, k, p, n, scale, element) {
    const alt = n % 2 === 1;
    const el = elementFields(element, k);
    if (goal === 'zero_out') {
        return { template: 'zero_out', title, goal: zeroOut(24 + k + Math.round(4 * p)), ...(alt ? { rise: 5 } : el) };
    }
    if (goal === 'collect') {
        const favor = [2, 3, 1, 4][(k + n) % 4];
        return { template: 'collect', title, goal: collect(10 + Math.floor(k / 3) + Math.round(2 * p), favor * scale), favor, ...(alt ? { risers: { start: 1 } } : el) };
    }
    if (goal === 'cores') {
        const target = Math.min(12, 8 + Math.floor(k / 3) + Math.round(2 * p));
        return { template: 'cores', title, goal: breakCores(target), ...(k >= 1 ? { dense: Math.ceil(target / 4) } : {}), ...(alt ? { risers: { start: 2 } } : { rise: 5 }) };
    }
    if (goal === 'stars') {
        return { template: 'stars', title, goal: catchStars(6 + Math.round(2 * p)), ...(alt ? { risers: { start: 1 } } : { rise: 5, ...el }) };
    }
    if (goal === 'risers') {
        return { template: 'risers', title, goal: clearRisers(5 + Math.floor(k / 2) + Math.round(p)), boardRisers: 2, risers: { every: Math.max(4, 5 - Math.floor(k / 3)), max: k >= 3 ? 3 : 2 }, ...(alt ? el : {}) };
    }
    // survive: no budget to tune, so pressure comes from faster rows later on and Risers that keep coming
    return { template: 'survive', title, goal: survive(18 + k + Math.round(4 * p)), rise: p >= 0.5 ? 3 : 4, risers: { every: 6, max: k >= 3 ? 2 : 1 } };
}

Object.keys(LATE_SECTORS).forEach((key) => {
    const sector = Number(key);
    const plan = LATE_SECTORS[key];
    const k = sector - 4;
    const scale = Math.pow(2, NodeGenerator.sectorTide(sector));
    const seen = {};
    const elements = elementsFor(k);
    let e = 0;
    plan.goals.forEach((goal, i) => {
        const id = `${sector}-${i + 2}`;
        if (NodeGenerator.HANDCRAFTED[id]) return; // element intros and showcases (levels.js)
        const p = plan.goals.length > 1 ? i / (plan.goals.length - 1) : 0;
        const n = seen[goal] || 0;
        seen[goal] = n + 1;
        const slot = lateSlot(goal, plan.titles[i], k, p, n, scale, elements[e % elements.length]);
        if (slot.webs || slot.sealed || slot.links || slot.statics) e++;
        SLOTS[id] = slot;
    });
    plan.bonus.forEach((title, i) => {
        SLOTS[`${sector}-bonus-${i + 1}`] = { template: 'big_orb', title, goal: bigOrb(8 * scale) };
    });
});

module.exports = { TEMPLATES, SLOTS, buildBoard };
