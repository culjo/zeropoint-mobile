#!/usr/bin/env node
// Nullfall - playtest report: the bot plays each Adventure level many times.
// Usage: node tools/playtest.js [--games 200] [--sector 1] [--level 1-3] [--json] [--details]
//   --details prints the config each level was played with (goal, drops, tide, pool, stars, rules, board)

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
const showDetails = process.argv.includes('--details');

// The rules the bot played: level data as loaded for its sector (pool and board at the sector's tide)
function configDetails(id, config) {
    const data = NodeGenerator.LEVEL_DATA[id] || {};
    const pool = (config.rules && config.rules.pool) || {};
    const risers = data.risers || null;
    return {
        title: config.title,
        goal: config.goal,
        drops: config.maxDrops,
        stars: config.stars,
        tide: pool.tide,
        pool: { values: pool.values, specials: pool.specials, favor: pool.favor || null, pairBias: pool.pairBias },
        rise: data.rise || 0,
        risers,
        sealed: data.sealed || [],
        guide: config.guide ? { orb: config.guide.orb, col: config.guide.col } : null,
        board: data.board || [],
        template: data.template || null,
        seed: data.seed || null
    };
}

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
        rows.push({ id, source, goal: `${config.goal.type} ${config.goal.size || config.goal.target}`, drops: config.maxDrops, target: targetFor(id), ...r, ms: Date.now() - t0, config: configDetails(id, config) });
    });
});

if (asJson) {
    console.log(JSON.stringify(showDetails ? rows : rows.map(({ config, ...rest }) => rest), null, 2));
} else {
    const pct = (x) => `${Math.round(x * 100)}%`.padStart(4);
    console.log(`games per level: ${games}`);
    console.log('level      src   goal               drops  win  target  ★0/★1/★2/★3        left  losses');
    rows.forEach((r) => {
        const st = r.stars.map((n) => pct(n / r.games)).join('/');
        const losses = Object.entries(r.losses).map(([k, v]) => `${k} ${v}`).join(', ');
        console.log(`${r.id.padEnd(10)} ${r.source.padEnd(5)} ${r.goal.padEnd(18)} ${String(r.drops).padStart(5)} ${pct(r.winRate)}  ${pct(r.target)}   ${st}  ${r.avgDropsLeft.toFixed(1).padStart(4)}  ${losses}`);
        if (showDetails) {
            const c = r.config;
            const g = c.goal;
            const goal = `${g.type} ${g.target}${g.number !== undefined ? ` × ${g.number}` : ''}${g.size ? ` (size ${g.size})` : ''}`;
            const stars = c.stars.kind === 'headroom' ? `★★ ${c.stars.two} / ★★★ ${c.stars.three} empty rows` : `★★ ${c.stars.two} / ★★★ ${c.stars.three} drops left`;
            const rules = [c.rise ? `row rises every ${c.rise}` : null,
                c.risers ? `risers ${JSON.stringify(c.risers)}` : null,
                c.sealed.length ? `sealed cols ${c.sealed.join(',')}` : null,
                c.guide ? `guide ${c.guide.orb} → col ${c.guide.col}` : null].filter(Boolean);
            console.log('--------------- DETAILS ------------');
            console.log(`    ${c.title} ▶ ${goal} · ${c.drops} drops ★ Start Goals: ${stars}`);
            console.log(`    tide ${c.tide} · pool ${c.pool.values.join(', ')} · specials ${c.pool.specials}${c.pool.favor ? ` · favor ${c.pool.favor}` : ''} · pair bias ${c.pool.pairBias}`);
            if (rules.length) console.log(`    ${rules.join(' · ')}`);
            if (c.template) console.log(`    template ${c.template} · seed ${c.seed}`);
            console.log(`    board (Tide 0, ×${Math.pow(2, c.tide || 0)} in play):`);
            c.board.forEach((line) => console.log(`      ${line}`));
            console.log('');
        }
    });
}
