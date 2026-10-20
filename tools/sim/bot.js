// Nullfall - playtest bot (GDD §5.3)
// One-move look-ahead: tries every tray / Hold orb in every column on a copy of the game,
// scores the result (goal progress first, then safety), plays the best. Not a perfect player:
// treat its win rate as a difficulty measure, not a prediction of human clear rates.

'use strict';

const { Game, ROWS, COLS, makeRng } = require('./engine');

function columnTops(g) {
    const tops = [];
    for (let c = 0; c < COLS; c++) {
        let top = ROWS;
        for (let r = 0; r < ROWS; r++) if (g.grid[r][c]) { top = r; break; }
        tops.push(top);
    }
    return tops;
}

function evaluate(g) {
    if (g.lost) return -1e6 + g.progress;
    if (g.met) return 1e6 + (g.maxDrops - g.dropsUsed) * 100;
    const goal = g.goal;
    let s = (g.progress / Math.max(1, goal.target)) * 1000;
    const tops = columnTops(g);

    // Goal shaping
    if (goal.type === 'break_cores') {
        g.grid.forEach((row) => row.forEach((t) => { if (t && t.type === 'dark_matter') s -= t.hp * 12; }));
    } else if (goal.type === 'catch_stars') {
        g.starCells.forEach((st) => {
            if (st.caught) return;
            const reach = tops[st.c] - 1; // the next landing row in that column
            s -= Math.abs(reach - st.r) * 14;
        });
    } else if (goal.type === 'survive') {
        s += g.headroom() * 40;
    } else if (goal.type === 'big_orb') {
        let best = 0;
        g.grid.forEach((row) => row.forEach((t) => { if (t && t.type === 'number') best = Math.max(best, Math.abs(t.value)); }));
        s += Math.log2(best + 1) * 60;
    }

    // Board elements: prefer snapping webs and opening seals (more room to play)
    g.grid.forEach((row) => row.forEach((t) => { if (t && t.web) s -= 10; }));
    s -= (g.sealed ? g.sealed.length : 0) * 30;

    // Safety: tall columns and Risers near the red line
    tops.forEach((top) => {
        const h = ROWS - top;
        if (h >= 5) s -= (h - 4) * (h - 4) * 45;
        s -= h * 3;
    });
    g.grid.forEach((row, r) => row.forEach((t) => {
        if (t && t.riser) s -= 160 / Math.max(1, r);
    }));
    return s;
}

function chooseMove(g, rng) {
    let best = null;
    let bestScore = -Infinity;
    g.moves().forEach((m) => {
        const copy = g.clone();
        copy.drop(m);
        const v = evaluate(copy) + rng.next() * 0.5; // tiny jitter breaks ties
        if (v > bestScore) { bestScore = v; best = m; }
    });
    return best;
}

// Stash a tray orb that has nothing to blast or merge with, if Hold is empty
function maybeStash(g, keepSlot) {
    if (g.hold) return;
    const other = keepSlot === 0 ? 1 : 0;
    const orb = g.tray[other];
    if (!orb || orb.type !== 'number') return;
    const tops = g.exposed();
    if (!tops.some((v) => v === -orb.value || v === orb.value)) g.stash(other);
}

function playGame(config, seed) {
    const g = new Game(config, seed);
    const rng = makeRng(seed ^ 0x9e3779b9);
    let guard = 0;
    while (!g.lost && !g.met && guard++ < 200) {
        const m = chooseMove(g, rng);
        if (!m) { g.lost = 'stuck'; break; }
        if (m.source !== 'hold') {
            maybeStash(g, m.source);
            // stashing refilled the other slot; the chosen slot is unchanged
        }
        g.drop(m);
    }
    return {
        won: !!(g.met && !g.lost),
        stars: g.stars(),
        dropsLeft: g.maxDrops - g.dropsUsed,
        dropsUsed: g.dropsUsed,
        lost: g.lost,
        progress: g.progress
    };
}

/** Play `games` runs of a level config; seeds are seedBase, seedBase+1, … */
function runLevel(config, games = 200, seedBase = 1) {
    let wins = 0;
    const stars = [0, 0, 0, 0];
    const losses = {};
    let leftOnWins = 0;
    for (let i = 0; i < games; i++) {
        const r = playGame(config, seedBase + i * 7919);
        stars[r.stars]++;
        if (r.won) { wins++; leftOnWins += r.dropsLeft; } else losses[r.lost] = (losses[r.lost] || 0) + 1;
    }
    return {
        games,
        winRate: wins / games,
        stars, // index = stars earned (0 = lost)
        avgDropsLeft: wins ? leftOnWins / wins : 0,
        losses
    };
}

module.exports = { evaluate, chooseMove, playGame, runLevel };
