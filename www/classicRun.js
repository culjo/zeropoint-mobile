// Nullfall - Classic run systems: Bounty Ladder, Surges and the board-clear refill (GDD §4.1)
// Pure logic with no DOM, so it can be tested in Node.

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ClassicRun = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // ---------- goals shared by bounties and surges ----------
    // kind 'count' adds each event, 'max' keeps the best value seen, 'orb' is done once an orb
    // of size units × the tide's smallest orb is made. Event types come from game.js:
    // zero_blast, merge, laser, supernova, combo (value = combo), dark_matter (hits),
    // dm_shatter, orb (value = magnitude).
    function goalProgress(goal, progress, type, value, tideScale) {
        if (type !== goal.event) return progress;
        if (goal.kind === 'max') return Math.max(progress, value);
        if (goal.kind === 'orb') return value >= goal.units * tideScale ? 1 : progress;
        return progress + (value || 1);
    }

    function goalTarget(goal) {
        return goal.kind === 'orb' ? 1 : goal.target;
    }

    function goalDone(goal, progress) {
        return progress >= goalTarget(goal);
    }

    // ---------- Bounty Ladder ----------
    // base = target on rung 0; step = added every 2 rungs; max caps it
    const BOUNTY_TASKS = [
        { id: 'zero_blast', event: 'zero_blast', kind: 'count', glyph: '◎', base: 3, step: 1, max: 8, text: (n) => `Make ${n} Zero Blasts` },
        { id: 'merge', event: 'merge', kind: 'count', glyph: '⊕', base: 2, step: 1, max: 6, text: (n) => `Merge ${n} times` },
        { id: 'laser', event: 'laser', kind: 'count', glyph: '✚', base: 1, step: 1, max: 4, text: (n) => n === 1 ? 'Fire a Cross Laser' : `Fire ${n} Cross Lasers` },
        { id: 'supernova', event: 'supernova', kind: 'count', glyph: '✹', base: 1, step: 1, max: 3, from: 3, text: (n) => n === 1 ? 'Fire a Supernova' : `Fire ${n} Supernovas` },
        { id: 'combo', event: 'combo', kind: 'max', glyph: '×', base: 3, step: 1, max: 6, text: (n) => `Reach a ×${n} combo` },
        { id: 'dark_matter', event: 'dark_matter', kind: 'count', glyph: '◆', base: 3, step: 2, max: 10, text: (n) => `Hit Dark Matter ${n} times` },
        { id: 'build', event: 'orb', kind: 'orb', glyph: '▲', units: 8, from: 1, text: (n, size) => `Build a +${size} orb` }
    ];

    const BIG_RUNG_EVERY = 5;

    function rungReward(index) {
        const big = (index + 1) % BIG_RUNG_EVERY === 0;
        return {
            score: (50 + 25 * index) * (big ? 3 : 1),
            swap: !big && index % 2 === 0 ? 1 : 0,
            overdrive: !big && index % 2 === 1 ? 10 : 0,
            weapon: big
        };
    }

    function makeRung(index, prevId, rng) {
        const pool = BOUNTY_TASKS.filter((t) => t.id !== prevId && index >= (t.from || 0));
        const task = pool[Math.floor(rng() * pool.length)];
        const level = Math.floor(index / 2);
        const rung = { index, id: task.id, event: task.event, kind: task.kind, glyph: task.glyph, reward: rungReward(index) };
        if (task.kind === 'orb') rung.units = task.units * Math.pow(2, Math.min(2, Math.floor(index / 4)));
        else rung.target = Math.min(task.max + Math.floor(Math.max(0, index - 10) / 4), task.base + task.step * level);
        return rung;
    }

    // The ladder keeps the current rung plus the next 2 generated, so the screen can show them
    function createLadder(rng = Math.random) {
        const ladder = { index: 0, progress: 0, rungs: [], rng };
        while (ladder.rungs.length < 3) pushRung(ladder);
        return ladder;
    }

    function pushRung(ladder) {
        const prev = ladder.rungs[ladder.rungs.length - 1];
        ladder.rungs.push(makeRung(ladder.rungs.length, prev && prev.id, ladder.rng));
    }

    function currentRung(ladder) {
        return ladder.rungs[ladder.index];
    }

    // Feeds an event to the current rung; returns the finished rung, or null
    function ladderEvent(ladder, type, value, tideScale) {
        const rung = currentRung(ladder);
        const next = goalProgress(rung, ladder.progress, type, value, tideScale);
        if (next === ladder.progress) return null;
        ladder.progress = next;
        if (!goalDone(rung, next)) return null;
        ladder.index++;
        ladder.progress = 0;
        while (ladder.rungs.length < ladder.index + 3) pushRung(ladder);
        return rung;
    }

    function describe(goal, tideScale) {
        const task = BOUNTY_TASKS.find((t) => t.id === goal.id) || SURGES.find((s) => s.id === goal.id);
        return task.text(goal.target, goal.units * tideScale);
    }

    function describeReward(reward) {
        const parts = [`+${reward.score} pts`];
        if (reward.swap) parts.push(`+${reward.swap} Swap`);
        if (reward.overdrive) parts.push(`+${reward.overdrive}% Overdrive`);
        if (reward.weapon) parts.push('Super-weapon');
        return parts.join(' · ');
    }

    // ---------- Surges ----------
    const SURGE_EVERY = 20;
    const SURGE_DROPS = 6;

    const SURGES = [
        { id: 'zero_rush', name: 'Zero Rush', event: 'zero_blast', kind: 'count', glyph: '◎', target: 3, text: (n) => `Make ${n} Zero Blasts` },
        { id: 'chain', name: 'Chain Reaction', event: 'combo', kind: 'max', glyph: '×', target: 4, text: (n) => `Reach a ×${n} combo` },
        { id: 'build_it', name: 'Build It', event: 'orb', kind: 'orb', glyph: '▲', units: 8, text: (n, size) => `Build a +${size} orb` },
        // game.js raises a Dark Matter row when it starts and doubles shatter score while it runs
        { id: 'dark_storm', name: 'Dark Storm', event: 'dm_shatter', kind: 'count', glyph: '◆', target: 3, text: (n) => `Shatter ${n} Dark Matter` }
    ];

    // Shuffled bag so every surge shows up before one repeats, never twice in a row
    function createSurgeBag(rng = Math.random) {
        let bag = [];
        let last = null;
        return function next() {
            if (!bag.length) {
                bag = SURGES.slice();
                for (let i = bag.length - 1; i > 0; i--) {
                    const j = Math.floor(rng() * (i + 1));
                    [bag[i], bag[j]] = [bag[j], bag[i]];
                }
                if (bag[bag.length - 1] === last && bag.length > 1) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
            }
            last = bag.pop();
            return { ...last, progress: 0, dropsLeft: SURGE_DROPS };
        };
    }

    // Surges get tougher with Classic Heat: bigger targets, fewer moves
    function scaleSurge(surge, heat = 0) {
        const s = { ...surge };
        if (s.kind === 'count') s.target += Math.min(3, Math.floor(heat / 3));
        else if (s.kind === 'max') s.target = Math.min(8, s.target + Math.floor(heat / 3));
        else if (s.kind === 'orb' && heat >= 6) s.units *= 2;
        s.dropsLeft = Math.max(4, s.dropsLeft - Math.floor(heat / 3));
        return s;
    }

    function surgeReward(tide, count) {
        return {
            score: 300 * (tide + 1),
            swap: count % 2 === 0 ? 1 : 0,
            overdrive: count % 2 === 1 ? 15 : 0,
            weapon: false
        };
    }

    // ---------- Board-clear refill ----------
    // Weighted tile mix; add new tile kinds (stars, cores…) here as they arrive
    const REFILL_MIX = [
        { kind: 'number', weight: 7 },
        { kind: 'dark_matter', weight: 3 }
    ];

    // Returns rows (top to bottom) of null | { type: 'number', value } | { type: 'dark_matter' }.
    // The bottom row is mostly full; the row above only sits on filled cells. No number
    // touches its opposite or its match, so the refill can't set off a cascade.
    function buildRefill({ cols = 6, values = [1, 2, 3, 4], mix = REFILL_MIX, rng = Math.random } = {}) {
        const total = mix.reduce((s, m) => s + m.weight, 0);
        const pickKind = () => {
            let x = rng() * total;
            for (const m of mix) { x -= m.weight; if (x < 0) return m.kind; }
            return mix[mix.length - 1].kind;
        };
        const bottom = [];
        const top = [];
        const pickNumber = (neighbours) => {
            const bad = neighbours.filter((t) => t && t.type === 'number').map((t) => Math.abs(t.value));
            const ok = values.filter((v) => !bad.includes(v));
            if (!ok.length) return null;
            return ok[Math.floor(rng() * ok.length)] * (rng() < 0.5 ? 1 : -1);
        };
        const makeTile = (neighbours) => {
            const kind = pickKind();
            if (kind === 'number') {
                const value = pickNumber(neighbours);
                return value === null ? { type: 'dark_matter' } : { type: 'number', value };
            }
            return { type: kind };
        };
        for (let c = 0; c < cols; c++) {
            bottom.push(rng() < 0.85 ? makeTile([bottom[c - 1]]) : null);
        }
        for (let c = 0; c < cols; c++) {
            top.push(bottom[c] && rng() < 0.5 ? makeTile([top[c - 1], bottom[c]]) : null);
        }
        return [top, bottom];
    }

    return {
        BOUNTY_TASKS, BIG_RUNG_EVERY, createLadder, currentRung, ladderEvent,
        SURGES, SURGE_EVERY, SURGE_DROPS, createSurgeBag, scaleSurge, surgeReward,
        goalProgress, goalTarget, goalDone, describe, describeReward,
        REFILL_MIX, buildRefill
    };
}));
