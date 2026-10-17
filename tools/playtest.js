#!/usr/bin/env node
// Nullfall - playtest report: the bot plays each Adventure level many times.
// Usage: node tools/playtest.js [--games 200] [--sector 1] [--level 1-3] [--json]

'use strict';

const path = require('path');
const NodeGenerator = require(path.join(__dirname, '..', 'www', 'nodeGenerator.js'));
const { runLevel } = require('./sim/bot');
const { targetFor } = require('./targets');

function arg(name, fallback) {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 ? process.argv[i + 1] : fallback;
}

const games = parseInt(arg('games', '200'), 10);
const onlySector = arg('sector', null);
const onlyLevel = arg('level', null);
const asJson = process.argv.includes('--json');

const rows = [];
NodeGenerator.SECTOR_LAYOUTS.forEach((layout, si) => {
    const sector = si + 1;
    if (onlySector && String(sector) !== onlySector) return;
    NodeGenerator.NODE_ORDER.filter((id) => layout.some((n) => n.id === id)).forEach((id) => {
        if (onlyLevel && id !== onlyLevel) return;
        const config = NodeGenerator.generateNodeConfig(sector, id);
        const t0 = Date.now();
        const r = runLevel(config, games);
        const source = NodeGenerator.HANDCRAFTED[id] ? 'hand' : (NodeGenerator.GENERATED[id] ? 'gen' : '-');
        rows.push({ id, source, goal: `${config.goal.type} ${config.goal.size || config.goal.target}`, drops: config.maxDrops, target: targetFor(id), ...r, ms: Date.now() - t0 });
    });
});

if (asJson) {
    console.log(JSON.stringify(rows, null, 2));
} else {
    const pct = (x) => `${Math.round(x * 100)}%`.padStart(4);
    console.log(`games per level: ${games}`);
    console.log('level      src   goal               drops  win  target  ★0/★1/★2/★3        left  losses');
    rows.forEach((r) => {
        const st = r.stars.map((n) => pct(n / r.games)).join('/');
        const losses = Object.entries(r.losses).map(([k, v]) => `${k} ${v}`).join(', ');
        console.log(`${r.id.padEnd(10)} ${r.source.padEnd(5)} ${r.goal.padEnd(18)} ${String(r.drops).padStart(5)} ${pct(r.winRate)}  ${pct(r.target)}   ${st}  ${r.avgDropsLeft.toFixed(1).padStart(4)}  ${losses}`);
    });
}
