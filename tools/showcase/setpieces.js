// Nullfall - set-piece search for the showcase autoplay (www/showcase.js)
// Random-searches stable Classic boards for one drop that sets off a trailer moment, using the
// autoplay's own rules model, and prints them as SETPIECES entries.
//   node tools/showcase/setpieces.js [--tries 200000] [--seed 1]

'use strict';

const path = require('path');
const S = require(path.join(__dirname, '..', '..', 'www', 'showcase.js'));

const { ROWS, COLS } = S;
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? Number(args[i + 1]) : d; };
const TRIES = arg('tries', 150000);
let seed = arg('seed', 1) >>> 0;
const rnd = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), 1 | t); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];

// A tile that doesn't blast or merge with the neighbours already placed (left and below)
function calmTile(g, r, c, values, dmShare) {
    if (rnd() < dmShare) return { d: 2, a: 0 };
    const near = [g[r][c - 1], g[r + 1] && g[r + 1][c], g[r][c + 1], g[r - 1] && g[r - 1][c]].filter((t) => t && t.n != null);
    const ok = values.filter((v) => !near.some((t) => t.n === v || t.n === -v));
    return ok.length ? { n: pick(ok), a: 0 } : { d: 2, a: 0 };
}

function randomBoard(minH, maxH, values, dmShare) {
    const g = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    for (let c = 0; c < COLS; c++) {
        const h = minH + Math.floor(rnd() * (maxH - minH + 1));
        for (let i = 0; i < h; i++) {
            const r = ROWS - 1 - i;
            g[r][c] = calmTile(g, r, c, values, dmShare);
        }
    }
    return g;
}

// Re-roll one tile, keeping the board calm
function mutate(g, values, dmShare) {
    const cells = [];
    g.forEach((row, r) => row.forEach((t, c) => { if (t) cells.push([r, c]); }));
    const [r, c] = pick(cells);
    const m = S.cloneBoard(g);
    m[r][c] = null;
    m[r][c] = calmTile(m, r, c, values, dmShare);
    return m;
}

function stable(g) {
    const T = S.settle(S.makeTurn(S.cloneBoard(g), 1));
    return T.steps === 0;
}

function toRows(g) {
    let top = ROWS;
    g.forEach((row, r) => { if (row.some(Boolean)) top = Math.min(top, r); });
    return g.slice(top).map((row) => row.map((t) => (!t ? '.' : t.d != null ? 'D' : t.n)));
}

function bestDrop(g, orbs) {
    let best = null;
    orbs.forEach((v) => {
        for (let col = 0; col < COLS; col++) {
            const T = S.simulateDrop(g, 1, { type: 'number', value: v }, col);
            if (!T) continue;
            if (!best || T.steps > best.T.steps) best = { v, col, T };
        }
    });
    return best;
}

const SMALL = [1, 2, 3, 4, -1, -2, -3, -4];
const BIG = [1, 2, 4, 8, -1, -2, -4, -8, 3, -3, 16, -16];
const SEARCHES = {
    // One drop, the longest chain
    cascade: {
        board: () => randomBoard(3, 5, SMALL, 0),
        values: SMALL, dm: 0,
        orbs: SMALL,
        score: (T) => T.steps * 100 + T.blasts.reduce((a, t) => a + t * t, 0)
    },
    // A long chain that ends on a Hyperspace Singularity (±16) and leaves the board empty
    singularity: {
        board: () => randomBoard(2, 4, BIG, 0),
        values: BIG, dm: 0,
        orbs: [1, 2, 4, 8, -1, -2, -4, -8],
        score: (T) => (T.blasts.includes(5) ? 1000 : -1e9) + (S.tileCount(T.g) === 0 ? 2000 : -S.tileCount(T.g) * 200) + T.steps * 120
    },
    // One row from the red line, and one drop pulls it back
    brink: {
        board: () => randomBoard(5, 7, SMALL, 0.12),
        values: SMALL, dm: 0.12,
        orbs: SMALL,
        score: (T, g) => {
            const before = Math.max(...S.heights(g));
            if (before < 7) return -1e9;
            return T.steps * 60 + T.cleared * 20 - Math.max(...S.heights(T.g)) * 250;
        }
    }
};

const out = {};
Object.entries(SEARCHES).forEach(([name, cfg]) => {
    // Hill-climb from many random calm boards: re-roll a tile, keep it if the best drop got no worse
    let best = null;
    const restarts = Math.max(1, Math.round(TRIES / 2000));
    for (let k = 0; k < restarts; k++) {
        let g = cfg.board();
        if (!stable(g)) continue;
        let b = bestDrop(g, cfg.orbs);
        let s = b ? cfg.score(b.T, g) : -Infinity;
        for (let i = 0; i < 2000; i++) {
            const m = mutate(g, cfg.values, cfg.dm);
            if (!stable(m)) continue;
            const mb = bestDrop(m, cfg.orbs);
            if (!mb) continue;
            const ms = cfg.score(mb.T, m);
            if (ms >= s) { g = m; b = mb; s = ms; }
        }
        if (b && (!best || s > best.s)) best = { s, g, b };
    }
    const { g, b } = best;
    out[name] = {
        rows: toRows(g),
        orb: b.v,
        col: b.col,
        steps: b.T.steps,
        tiers: b.T.blasts,
        tilesAfter: S.tileCount(b.T.g),
        heightAfter: Math.max(...S.heights(b.T.g))
    };
    console.error(`${name}: ${b.T.steps} steps, tiers ${b.T.blasts.join(',')}, ${S.tileCount(b.T.g)} tiles left`);
});
console.log(JSON.stringify(out, null, 1));
