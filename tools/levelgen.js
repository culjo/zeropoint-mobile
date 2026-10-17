#!/usr/bin/env node
// Nullfall - level generator (GDD §5.3)
// For each generated slot: build ~20 candidate boards from seeds with the slot's template, let the
// bot play each one with an open drop budget, keep the candidate that best fits the slot's target
// clear rate, set the drop budget from the bot's results, confirm it with a full run and write
// www/levelsGenerated.js. Handcrafted levels (www/levels.js) are only budget-tuned with --tune-hand.
//
// Usage:
//   node tools/levelgen.js                 generate every slot
//   node tools/levelgen.js --slot 2-7      one slot (others in levelsGenerated.js are kept)
//   node tools/levelgen.js --tune-hand     also print budgets for handcrafted levels (--apply writes them)
//   options: --candidates 20 --games 60 --confirm 200

'use strict';

const fs = require('fs');
const path = require('path');
const WWW = path.join(__dirname, '..', 'www');
const NodeGenerator = require(path.join(WWW, 'nodeGenerator.js'));
const { makeRng } = require('./sim/engine');
const { playGame, runLevel } = require('./sim/bot');
const { targetFor } = require('./targets');
const { SLOTS, TEMPLATES } = require('./templates');

function arg(name, fallback) {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 ? process.argv[i + 1] : fallback;
}

const CANDIDATES = parseInt(arg('candidates', '20'), 10);
const GAMES = parseInt(arg('games', '60'), 10);
const CONFIRM = parseInt(arg('confirm', '200'), 10);
const ONLY = arg('slot', null);
const OPEN_BUDGET = 60;

function hashId(id) {
    let h = 2166136261;
    for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    return h;
}

// Drops the bot needed on each run with an open budget (Infinity when it lost another way)
function dropsCurve(sector, id, data, games, seedBase) {
    const config = NodeGenerator.generateNodeConfig(sector, id, { ...data, drops: OPEN_BUDGET });
    const used = [];
    for (let i = 0; i < games; i++) {
        const r = playGame(config, seedBase + i * 7919);
        used.push(r.won ? r.dropsUsed : Infinity);
    }
    return used.sort((a, b) => a - b);
}

// Smallest budget that lets the bot clear `target` of runs (null if it can't, even with no limit)
function budgetFor(used, target) {
    const k = Math.ceil(target * used.length) - 1;
    const b = used[Math.max(0, k)];
    return Number.isFinite(b) ? b : null;
}

function maxWin(used) {
    return used.filter(Number.isFinite).length / used.length;
}

function generateSlot(id, slot) {
    const sector = parseInt(id, 10);
    const target = targetFor(id);
    const template = TEMPLATES[slot.template];
    let best = null;
    for (let k = 0; k < CANDIDATES; k++) {
        const seed = (hashId(id) + k * 104729) >>> 0;
        const data = template.build(makeRng(seed), slot);
        const used = dropsCurve(sector, id, data, GAMES, 1000 + k);
        const mw = maxWin(used);
        let score;
        let drops;
        if (slot.goal.type === 'survive') {
            score = Math.abs(mw - target);
            drops = slot.goal.target;
        } else {
            drops = budgetFor(used, target);
            // Needs headroom above the target (the budget does the rest), and a budget in a sane range
            score = drops === null ? 10 : Math.abs(mw - Math.min(1, target + 0.15)) + (drops < 8 || drops > 40 ? 1 : 0);
        }
        if (!best || score < best.score) best = { score, data: { ...data, drops: drops || OPEN_BUDGET }, seed, maxWin: mw };
    }
    const data = { ...best.data, template: slot.template, seed: best.seed };
    let confirm = runLevel(NodeGenerator.generateNodeConfig(sector, id, data), CONFIRM, 50000);
    // Small samples drift: nudge the budget until the full run lands near the target
    for (let i = 0; i < 6 && slot.goal.type !== 'survive'; i++) {
        if (confirm.winRate < target - 0.04) data.drops++;
        else if (confirm.winRate > target + 0.06 && data.drops > 8) data.drops--;
        else break;
        confirm = runLevel(NodeGenerator.generateNodeConfig(sector, id, data), CONFIRM, 50000);
    }
    data.bot = { winRate: Math.round(confirm.winRate * 100) / 100, target: Math.round(target * 100) / 100, games: CONFIRM };
    return data;
}

function writeGenerated(levels) {
    const ids = Object.keys(levels).sort((a, b) => NodeGenerator.nodeOrder(a) - NodeGenerator.nodeOrder(b));
    const body = ids.map((id) => `        ${JSON.stringify(id)}: ${JSON.stringify(levels[id])}`).join(',\n');
    const src = `// Nullfall - Generated Adventure levels
// Written by tools/levelgen.js: do not edit by hand. To handcraft a level, copy it into levels.js
// (handcrafted entries override these). Each level records its template, seed and bot result.
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.NullfallGeneratedLevels = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    const LEVELS = {
${body}
    };
    return { LEVELS };
}));
`;
    fs.writeFileSync(path.join(WWW, 'levelsGenerated.js'), src);
}

function main() {
    const levels = { ...NodeGenerator.GENERATED };
    Object.keys(SLOTS).forEach((id) => {
        if (ONLY && id !== ONLY) return;
        const t0 = Date.now();
        levels[id] = generateSlot(id, SLOTS[id]);
        const l = levels[id];
        console.log(`${id.padEnd(10)} ${l.template.padEnd(14)} drops ${String(l.drops).padStart(2)}  bot ${Math.round(l.bot.winRate * 100)}% (target ${Math.round(l.bot.target * 100)}%)  ${Date.now() - t0}ms`);
    });
    writeGenerated(levels);

    if (process.argv.includes('--tune-hand')) tuneHandcrafted(process.argv.includes('--apply'));
}

// Budget suggestions for handcrafted levels (boards untouched); --apply rewrites `drops:` in levels.js
function tuneHandcrafted(apply) {
    const file = path.join(WWW, 'levels.js');
    let src = fs.readFileSync(file, 'utf8');
    Object.keys(NodeGenerator.HANDCRAFTED).forEach((id) => {
        const sector = parseInt(id, 10);
        const data = NodeGenerator.HANDCRAFTED[id];
        if (data.goal.type === 'survive' || id === '1-1') return; // survive has no budget; 1-1 follows first play
        const used = dropsCurve(sector, id, data, 120, 7000);
        const target = targetFor(id);
        const raw = budgetFor(used, target);
        const drops = raw === null ? null : Math.max(10, Math.min(40, raw)); // keep intros playable, cap long ones
        console.log(`hand ${id.padEnd(10)} drops ${data.drops} -> ${drops === null ? `n/a (bot max ${Math.round(maxWin(used) * 100)}%)` : drops}  target ${Math.round(target * 100)}%`);
        if (apply && drops !== null) {
            const start = src.indexOf(`'${id}': {`);
            const end = src.indexOf('\n        \'', start + 1);
            const block = src.slice(start, end < 0 ? undefined : end);
            src = src.replace(block, block.replace(/drops: \d+/, `drops: ${drops}`));
        }
    });
    if (apply) fs.writeFileSync(file, src);
}

main();
