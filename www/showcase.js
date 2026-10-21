// Nullfall - showcase autoplay (debug mode only)
// Plays Classic like a person would, for trailer and publisher capture: it picks a move with a
// two-orb look-ahead, then drags the orb from the tray with real pointer events, so the pickup,
// tilt, column snap and drop are the game's own. A touch marker shows where the "finger" is.
// Set-piece boards stage the big moments (a Singularity, a long cascade, a board clear).
// Nothing here runs unless debug mode is on. The rules model is a copy of tools/sim/engine.js:
// keep it in step with game.js when the board rules change.

(function (root) {
    'use strict';

    const ROWS = 8;
    const COLS = 6;

    // ---------- rules model (gravity, Zero Blasts and tiers, merges, Dark Matter, specials) ----------
    function tierOf(m, unit) {
        m /= unit;
        if (m <= 1) return 1;
        if (m <= 3) return 2;
        if (m <= 7) return 3;
        if (m <= 15) return 4;
        return 5;
    }

    // Board copy: number { n: value }, Dark Matter { d: hp }, fixed tile { x: 1 }; anchored tiles keep { a: 1 },
    // Risers { rs: 1 } and webs { w: 1 } on top of that
    function fromState(st) {
        return st.grid.map((row) => row.map((t) => {
            if (!t) return null;
            const a = t.riser || t.web ? 1 : 0;
            if (t.type === 'number') return { n: t.value, a, rs: t.riser ? 1 : 0, w: t.web ? 1 : 0, link: t.link };
            if (t.type === 'dark_matter') return { d: t.hp, a };
            return { x: 1, a: 1 };
        }));
    }

    function cloneBoard(g) {
        return g.map((row) => row.map((t) => t && { ...t }));
    }

    function landingRow(g, col) {
        for (let r = 0; r < ROWS; r++) if (g[r][col]) return r - 1;
        return ROWS - 1;
    }

    function makeTurn(g, unit) {
        return { g, unit, steps: 0, blasts: [], merges: 0, cleared: 0, dmHits: 0, bestOrb: 0, charge: 0, lost: false, risersBefore: riserRows(g).length };
    }

    function damageDM(T, r, c, dmg) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
        const t = T.g[r][c];
        if (!t) return;
        if (t.w) { t.w = 0; t.a = t.rs ? 1 : 0; return; } // a web snaps
        if (t.d == null) return;
        t.d -= dmg;
        T.dmHits++;
        if (t.d <= 0) {
            T.g[r][c] = { n: NaN, a: 0 }; // shatters into an orb we can't predict
            T.cleared++;
        }
    }

    function supernova(T, r1, c1, r2, c2) {
        for (let r = Math.max(0, Math.min(r1, r2) - 1); r <= Math.min(ROWS - 1, Math.max(r1, r2) + 1); r++) {
            for (let c = Math.max(0, Math.min(c1, c2) - 1); c <= Math.min(COLS - 1, Math.max(c1, c2) + 1); c++) {
                const t = T.g[r][c];
                if (!t) continue;
                if (t.d != null) damageDM(T, r, c, 2);
                else if (t.n != null && Math.abs(t.n) <= 4) { T.g[r][c] = null; T.cleared++; }
            }
        }
    }

    function blast(T, r, c, r2, c2, m) {
        T.g[r][c] = null;
        T.g[r2][c2] = null;
        T.cleared += 2;
        const tier = tierOf(m, T.unit);
        T.blasts.push(tier);
        if (tier <= 2) {
            [[r, c], [r2, c2]].forEach(([br, bc]) => [[br - 1, bc], [br + 1, bc], [br, bc - 1], [br, bc + 1]].forEach(([nr, nc]) => damageDM(T, nr, nc, 1)));
        } else if (tier === 3) {
            new Set([r, r2]).forEach((rr) => { for (let cc = 0; cc < COLS; cc++) damageDM(T, rr, cc, 1); });
            new Set([c, c2]).forEach((cc) => { for (let rr = 0; rr < ROWS; rr++) damageDM(T, rr, cc, 1); });
        } else if (tier === 4) {
            supernova(T, r, c, r2, c2);
        } else {
            for (let rr = ROWS - 3; rr < ROWS; rr++) for (let cc = 0; cc < COLS; cc++) {
                const t = T.g[rr][cc];
                if (t && !t.x) { T.g[rr][cc] = null; T.cleared++; }
            }
        }
        T.charge += [0, 2, 4, 7, 12, 18][tier];
    }

    function scan(T) {
        const g = T.g;
        const num = (t) => t && t.n != null && !Number.isNaN(t.n);
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const a = g[r][c];
            if (!num(a)) continue;
            if (c + 1 < COLS && num(g[r][c + 1]) && a.n + g[r][c + 1].n === 0) { blast(T, r, c, r, c + 1, Math.abs(a.n)); return true; }
            if (r + 1 < ROWS && num(g[r + 1][c]) && a.n + g[r + 1][c].n === 0) { blast(T, r, c, r + 1, c, Math.abs(a.n)); return true; }
        }
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const a = g[r][c];
            if (!num(a)) continue;
            for (const [r2, c2] of [[r, c + 1], [r + 1, c]]) {
                if (r2 >= ROWS || c2 >= COLS) continue;
                const b = g[r2][c2];
                if (!num(b) || a.n !== b.n) continue;
                g[r][c] = null;
                const rs = a.rs || b.rs ? 1 : 0; // a merged Riser keeps climbing
                g[r2][c2] = { n: a.n * 2, a: rs, rs };
                T.merges++;
                T.charge += 2;
                T.bestOrb = Math.max(T.bestOrb, Math.abs(a.n * 2));
                return true;
            }
        }
        return false;
    }

    function gravity(g) {
        for (let c = 0; c < COLS; c++) {
            for (let r = ROWS - 2; r >= 0; r--) {
                const t = g[r][c];
                if (t && !g[r + 1][c] && !t.a) {
                    let to = r + 1;
                    while (to + 1 < ROWS && !g[to + 1][c]) to++;
                    g[to][c] = t;
                    g[r][c] = null;
                }
            }
        }
    }

    function settle(T) {
        while (T.steps < 40) {
            gravity(T.g);
            if (!scan(T)) break;
            T.steps++;
        }
        return T;
    }

    function special(T, sub, col, row) {
        const g = T.g;
        const target = row >= 0 && row < ROWS ? g[row][col] : null;
        if (sub === 'blackhole') {
            for (let r = 0; r < ROWS; r++) if (g[r][col] && !g[r][col].x) { g[r][col] = null; T.cleared++; }
            for (let r = 0; r < ROWS; r++) { damageDM(T, r, col - 1, 1); damageDM(T, r, col + 1, 1); }
        } else if (sub === 'supernova_core' || sub === 'antimatter_nuke') {
            const er = Math.max(0, Math.min(ROWS - 1, row >= 0 ? row : ROWS - 1));
            supernova(T, er, col, er, col);
        } else if (sub === 'zero') {
            for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
                    if (g[r][c] && !g[r][c].x) { g[r][c] = null; T.cleared++; }
                }
            }
        } else if (target && target.n != null && !Number.isNaN(target.n)) {
            if (sub === 'invert') target.n = -target.n;
            else if (sub === 'div2' && Math.abs(target.n) > 1) target.n = Math.sign(target.n) * Math.floor(Math.abs(target.n) / 2);
            else if (sub === 'mul2') target.n *= 2;
        }
    }

    // One drop of `orb` into `col`; returns the turn, or null when the column takes no drop
    function simulateDrop(g, unit, orb, col) {
        const T = makeTurn(cloneBoard(g), unit);
        const land = landingRow(T.g, col);
        if (orb.type === 'special') {
            const hit = land + 1;
            if (land < 0 && hit >= ROWS) return null;
            special(T, orb.subType, col, hit < ROWS && T.g[hit] && T.g[hit][col] ? hit : land);
        } else {
            if (land < 0) return null;
            T.g[land][col] = { n: orb.value, a: 0 };
        }
        settle(T);
        climb(T);
        return T;
    }

    // Rows of the Risers on the board, top first
    function riserRows(g) {
        const out = [];
        g.forEach((row, r) => row.forEach((t) => { if (t && t.rs) out.push(r); }));
        return out;
    }

    // After a drop every Riser climbs a row, swapping with the tile above (walls and webs stop it);
    // one reaching the red line ends the run
    function climb(T) {
        const g = T.g;
        let moved = false;
        for (let r = 1; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const t = g[r][c];
            if (!t || !t.rs) continue;
            const above = g[r - 1][c];
            if (above && (above.x || above.w)) continue;
            g[r - 1][c] = t;
            g[r][c] = above || null;
            moved = true;
        }
        if (moved) settle(T);
        for (let c = 0; c < COLS; c++) if (g[0][c] && g[0][c].rs) T.lost = true;
    }

    function simulateSwap(g, unit, r1, c1, r2, c2) {
        const a = g[r1][c1];
        const b = g[r2][c2];
        if (!a || a.x || a.w || (b && (b.x || b.w))) return null; // walls and webs stay put; Risers can be swapped
        const T = makeTurn(cloneBoard(g), unit);
        T.g[r1][c1] = b ? { ...b } : null;
        T.g[r2][c2] = { ...a };
        return settle(T);
    }

    function heights(g) {
        const out = [];
        for (let c = 0; c < COLS; c++) {
            let top = ROWS;
            for (let r = 0; r < ROWS; r++) if (g[r][c]) { top = r; break; }
            out.push(ROWS - top);
        }
        return out;
    }

    function tileCount(g) {
        let n = 0;
        g.forEach((row) => row.forEach((t) => { if (t) n++; }));
        return n;
    }

    // ---------- play styles ----------
    // Each style scores a simulated turn. Cascade Chaser lives for chains: long cascades, big tiers,
    // keeping the combo alive turn after turn, and cashing Overdrive. Safety only bites near the line.
    const TIER_WEIGHT = [0, 10, 22, 55, 110, 220];
    const STYLES = {
        chaser: {
            label: 'Cascade Chaser',
            think: [260, 520],   // ms before picking up an orb
            drag: [300, 430],    // ms the drag takes
            score(T, ctx) {
                let s = 0;
                s += T.steps * T.steps * 40;
                T.blasts.forEach((t) => { s += TIER_WEIGHT[t]; });
                s += T.merges * 12 + T.dmHits * 8 + T.cleared * 4;
                if (!T.blasts.length) s -= 30 + ctx.combo * 25; // breaking the combo hurts
                s += safety(T.g, ctx, T);
                return s;
            },
            lookahead: 0.6
        },
        builder: {
            label: 'Build Bigger',
            think: [420, 760],
            drag: [360, 520],
            score(T, ctx) {
                let s = Math.log2(T.bestOrb + 1) * 70 + T.merges * 30;
                T.blasts.forEach((t) => { s += t >= 4 ? TIER_WEIGHT[t] * 2 : -15; }); // save small orbs to merge
                s += biggestOnBoard(T.g) * 1.5;
                s += safety(T.g, ctx, T);
                return s;
            },
            lookahead: 0.8
        },
        brink: {
            label: 'On the Brink',
            think: [600, 1100],  // hesitates: it's close to the line
            drag: [380, 560],
            score(T, ctx) {
                let s = T.steps * T.steps * 30 + T.cleared * 10;
                T.blasts.forEach((t) => { s += TIER_WEIGHT[t]; });
                // Lives near the line but never over it
                const h = Math.max(...heights(T.g));
                if (h >= ROWS || T.lost) s -= 1e5;
                else if (h === ROWS - 1) s -= 600;
                s += h >= 5 ? 40 : 0;
                return s;
            },
            lookahead: 0.5
        }
    };

    function safety(g, ctx, T) {
        let s = 0;
        if (T && T.lost) return -1e6;
        // A Riser n rows from the line breaches in n drops: clear it before it gets close
        riserRows(g).forEach((r) => { s -= r <= 1 ? 4000 : r <= 3 ? 1400 / r : 260 / r; });
        if (T) s += (T.risersBefore - riserRows(g).length) * 320;
        const hs = heights(g);
        const rising = ctx.movesUntilRise <= 1 ? 1 : 0;
        // Back off from 5 high: rising rows come every 2–5 drops and are mostly Dark Matter at high Heat
        hs.forEach((h0) => {
            const h = h0 + rising;
            if (h >= ROWS) s -= 1e5;
            else if (h >= 5) s -= (h - 4) * (h - 4) * 160;
            s -= h * 4;
        });
        return s;
    }

    function biggestOnBoard(g) {
        let best = 0;
        g.forEach((row) => row.forEach((t) => { if (t && t.n != null && !Number.isNaN(t.n)) best = Math.max(best, Math.abs(t.n)); }));
        return Math.log2(best + 1) * 20;
    }

    // Best action for a state: { kind: 'drop', source, slot, col } | { kind: 'swap', r1, c1, r2, c2 } | { kind: 'hold', slot }
    function chooseAction(st, styleName) {
        const style = STYLES[styleName] || STYLES.chaser;
        const g = fromState(st);
        const unit = st.tideUnit || 1;
        const ctx = { combo: st.combo, movesUntilRise: st.movesUntilRise };
        const sources = [];
        st.tray.forEach((o, i) => { if (o) sources.push({ source: 'tray', slot: i, orb: o }); });
        if (st.hold) sources.push({ source: 'hold', slot: 0, orb: st.hold });

        let best = null;
        sources.forEach((src) => {
            for (let col = 0; col < COLS; col++) {
                if (st.sealed.includes(col)) continue;
                const T = simulateDrop(g, unit, src.orb, col);
                if (!T) continue;
                let v = style.score(T, ctx);
                // Look one orb ahead: the best follow-up with the orb left in the tray
                const rest = sources.filter((o) => o !== src);
                let follow = -Infinity;
                rest.forEach((o) => {
                    for (let c2 = 0; c2 < COLS; c2++) {
                        const T2 = simulateDrop(T.g, unit, o.orb, c2);
                        if (T2) follow = Math.max(follow, style.score(T2, { combo: T.blasts.length ? ctx.combo + 1 : 1, movesUntilRise: ctx.movesUntilRise - 1 }));
                    }
                });
                if (follow > -Infinity) v += follow * style.lookahead;
                v += Math.random() * 6; // a person doesn't always pick the same column on a tie
                if (!best || v > best.v) best = { kind: 'drop', source: src.source, slot: src.slot, col, v, turn: T };
            }
        });

        // A swap is a free move (the drop still follows): spend a token on a 3+ chain,
        // or on clearing a Riser that is 4 rows or less from the line
        if (st.swapTokens > 0) {
            const nearRiser = riserRows(g).some((r) => r <= 4);
            let bestSwap = null;
            for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
                for (const [r2, c2] of [[r, c + 1], [r + 1, c]]) {
                    if (r2 >= ROWS || c2 >= COLS) continue;
                    const T = simulateSwap(g, unit, r, c, r2, c2);
                    if (!T) continue;
                    const clearsRiser = riserRows(T.g).length < T.risersBefore;
                    if (T.steps < 3 && !(clearsRiser && nearRiser)) continue;
                    const v = style.score(T, ctx);
                    if (!bestSwap || v > bestSwap.v) bestSwap = { kind: 'swap', r1: r, c1: c, r2, c2, v, turn: T };
                }
            }
            if (bestSwap) return bestSwap;
        }

        // Keep a Riser's opposite in Hold for when it can reach it (the game's own tip)
        if (best && best.kind === 'drop' && st.canHold && !st.hold && best.turn && best.turn.risersBefore
            && riserRows(best.turn.g).length >= best.turn.risersBefore) {
            const riserVals = [];
            g.forEach((row) => row.forEach((t) => { if (t && t.rs) riserVals.push(t.n); }));
            const keep = st.tray.findIndex((o, i) => o && o.type === 'number' && riserVals.includes(-o.value)
                && !(best.source === 'tray' && best.slot === i));
            if (keep >= 0) return { kind: 'hold', slot: keep };
        }

        // Nothing good to do with a tray orb and Hold is free: park the worse one
        if (best && best.kind === 'drop' && st.canHold && !st.hold && best.turn && !best.turn.blasts.length && !best.turn.merges && st.tray[1 - best.slot]) {
            const other = 1 - (best.source === 'tray' ? best.slot : 0);
            if (Math.random() < 0.6) return { kind: 'hold', slot: other };
        }
        return best;
    }

    // ---------- set-piece boards (rows top → bottom, bottom-aligned; see tools/showcase/setpieces.js) ----------
    const drop = (col, slot = 0) => ({ kind: 'drop', source: 'tray', slot, col });
    const SETPIECES = {
        // One +1 sets off a 16-step chain that empties the board; Overdrive fires partway through
        cascade: {
            stage: {
                rows: [
                    ['.', '.', 1, 4, '.', -2],
                    [1, '.', 3, -1, 3, -4],
                    [4, 2, -4, -3, -4, -3],
                    [-2, -1, 3, -4, 1, 4],
                    [-1, -3, 4, -1, 4, -2]
                ],
                tray: [1, -3], overdrive: 55, rise: 5
            },
            moves: [drop(1)]
        },
        // A 13-step chain that ends on ±16: Hyperspace Singularity, then BOARD CLEAR
        singularity: {
            stage: {
                rows: [
                    [1, -2, '.', 2, '.', '.'],
                    [-2, -3, 4, -16, -2, '.'],
                    [3, 1, -8, 3, 16, 1],
                    [2, -8, -3, 16, -4, 2]
                ],
                tray: [2, 1], rise: 5
            },
            moves: [drop(5, 1)]
        },
        // Seven high, one row from the red line: an 18-step chain pulls it back to three
        brink: {
            stage: {
                rows: [
                    [-1, '.', '.', '.', '.', '.'],
                    [4, -2, 3, 2, 3, '.'],
                    [-1, -3, -1, -3, -4, 1],
                    [-2, 4, 3, -4, 1, 4],
                    ['D', 'D', -1, -3, 4, 1],
                    ['D', 'D', -2, 4, -1, -2],
                    ['D', 'D', 4, 2, 'D', 'D']
                ],
                tray: [3, -2], rise: 3, swaps: 2
            },
            moves: [drop(1, 1)]
        }
    };

    // ---------- driver: real pointer events, a touch marker, pacing ----------
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const rand = ([a, b]) => a + Math.random() * (b - a);
    const LIFT = 64; // game.js holds the dragged orb this far above the finger

    let marker = null;
    function ensureMarker() {
        if (marker || typeof document === 'undefined') return marker;
        const style = document.createElement('style');
        style.textContent = `
            .showcase-touch { position: fixed; left: 0; top: 0; width: 46px; height: 46px; margin: -23px 0 0 -23px;
                border-radius: 50%; pointer-events: none; z-index: 2147483647; opacity: 0;
                background: radial-gradient(circle, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.18) 60%, rgba(255,255,255,0) 72%);
                box-shadow: 0 0 0 2px rgba(255,255,255,0.55); transition: opacity 140ms ease, transform 120ms ease; }
            .showcase-touch.down { opacity: 1; transform: scale(0.82); }
            .showcase-touch.hidden-marker { display: none; }`;
        document.head.appendChild(style);
        marker = document.createElement('div');
        marker.className = 'showcase-touch';
        document.body.appendChild(marker);
        return marker;
    }
    function moveMarker(x, y) { if (marker) marker.style.translate = `${x}px ${y}px`; }

    function pointer(type, x, y, target) {
        const ev = new PointerEvent(type, {
            bubbles: true, cancelable: true, composed: true,
            pointerId: 7, pointerType: 'touch', isPrimary: true,
            clientX: x, clientY: y, buttons: type === 'pointerup' ? 0 : 1, pressure: type === 'pointerup' ? 0 : 0.5
        });
        (target || document.elementFromPoint(x, y) || document.body).dispatchEvent(ev);
    }

    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    // Drag along a slight arc, like a thumb sweeping up from the tray
    async function drag(from, to, ms, target) {
        ensureMarker();
        moveMarker(from.x, from.y);
        marker.classList.add('down');
        pointer('pointerdown', from.x, from.y, target);
        await sleep(60);
        const bow = (Math.random() - 0.5) * 50;
        const start = performance.now();
        await new Promise((done) => {
            function frame(now) {
                const t = Math.min(1, (now - start) / ms);
                const e = ease(t);
                const x = from.x + (to.x - from.x) * e + Math.sin(Math.PI * e) * bow;
                const y = from.y + (to.y - from.y) * e;
                moveMarker(x, y);
                pointer('pointermove', x, y, window.document.body);
                if (t < 1) requestAnimationFrame(frame); else done();
            }
            requestAnimationFrame(frame);
        });
        await sleep(70 + Math.random() * 60); // settle over the column before letting go
        pointer('pointerup', to.x, to.y, window.document.body);
        marker.classList.remove('down');
    }

    async function waitIdle(H, timeout = 20000) {
        const t0 = performance.now();
        let calm = 0;
        while (performance.now() - t0 < timeout) {
            const st = H.state();
            if (!st) return null;
            if (st.isGameOver) return st;
            calm = st.busy ? 0 : calm + 1;
            if (calm >= 3) return st;
            await sleep(40);
        }
        return H.state();
    }

    async function perform(H, action, style) {
        const geo = H.geometry();
        if (action.kind === 'hold') {
            const btn = document.getElementById(`drag-slot-${action.slot}`);
            await drag(geo.tray[action.slot], geo.hold, rand(style.drag) * 0.8, btn && (btn.closest('button') || btn));
            return;
        }
        if (action.kind === 'swap') {
            const a = geo.cell(action.r1, action.c1);
            const b = geo.cell(action.r2, action.c2);
            await drag(a, b, 220, document.querySelector('canvas'));
            return;
        }
        const st = H.state();
        const g = fromState(st);
        const land = Math.max(0, landingRow(g, action.col));
        const cell = geo.cell(land, action.col);
        const to = { x: cell.x + (Math.random() - 0.5) * geo.cellW * 0.3, y: Math.max(cell.y + LIFT - geo.cellH * 0.6, geo.cell(0, 0).y + LIFT) };
        const from = action.source === 'hold' ? geo.hold : geo.tray[action.slot];
        const el = action.source === 'hold'
            ? document.getElementById('btn-touch-hold')
            : (document.getElementById(`drag-slot-${action.slot}`) || {}).closest?.('button');
        await drag(from, to, rand(style.drag), el);
    }

    // ---------- the run ----------
    const runner = { on: false, log: [], t0: 0, style: 'chaser' };

    function note(kind, data) {
        runner.log.push({ t: Math.round(performance.now() - runner.t0), kind, ...data });
    }

    async function play(opts = {}) {
        const H = root.NullfallShowcaseHooks;
        if (!H || !H.enabled()) { console.warn('[showcase] debug mode is off'); return null; }
        const styleName = opts.style || 'chaser';
        const style = STYLES[styleName];
        runner.on = true;
        runner.style = styleName;
        runner.log = [];
        runner.t0 = opts.t0 || performance.now();
        if (opts.setpiece) {
            const sp = SETPIECES[opts.setpiece];
            if (!sp) throw new Error(`no set-piece ${opts.setpiece}`);
            H.stage({ ...sp.stage, best: opts.best });
        } else if (opts.stage) {
            H.stage({ ...opts.stage, best: opts.best });
        } else if (!opts.keepBoard) {
            H.startClassic({ best: opts.best });
        }
        ensureMarker();
        note('start', { style: styleName, setpiece: opts.setpiece || null });
        await sleep(opts.lead != null ? opts.lead : 900);
        const script = opts.setpiece ? (SETPIECES[opts.setpiece].moves || []).slice() : [];
        const maxTurns = opts.turns || 400;
        let turns = 0;
        let lastOD = H.state().overdrive;
        while (runner.on && turns < maxTurns) {
            const st = await waitIdle(H);
            if (!st || st.isGameOver) { note('gameover', { score: st && st.score }); break; }
            if (lastOD >= 60 && st.overdrive < lastOD && st.tray.some((o) => o && ['blackhole', 'supernova_core', 'antimatter_nuke'].includes(o.subType))) {
                note('overdrive', {});
            }
            lastOD = st.overdrive;
            await sleep(rand(style.think));
            const action = script.length ? script.shift() : chooseAction(st, styleName);
            if (!action) { note('stuck', {}); break; }
            const before = H.state();
            await perform(H, action, style);
            // The turn has started once the board is busy; only then wait for it to settle
            const t1 = performance.now();
            while (performance.now() - t1 < 1500 && !H.state().busy) await sleep(20);
            const after = await waitIdle(H, 60000);
            if (!after) break;
            const T = action.turn;
            const risersOf = (x) => { const out = []; x.grid.forEach((row, r) => row.forEach((t, c) => { if (t && t.riser) out.push([r, c, t.value]); })); return out; };
            note('turn', {
                action: action.kind,
                at: action.kind === 'drop' ? [action.source, action.slot, action.col] : action.kind === 'swap' ? [action.r1, action.c1, action.r2, action.c2] : [action.slot],
                tray: before.tray.map((o) => o && (o.subType || o.value)).concat([before.hold && (before.hold.subType || before.hold.value)]),
                risersBefore: risersOf(before),
                risers: risersOf(after),
                combo: after.combo,
                gain: after.score - before.score,
                steps: T ? T.steps : null,
                tiers: T ? T.blasts : null,
                cleared: T ? T.cleared : null,
                tiles: tileCount(fromState(after)),
                maxHeight: Math.max(...heights(fromState(after)))
            });
            if (action.kind !== 'hold') turns++;
            if (opts.setpiece && !script.length && opts.stopAfterScript) break;
        }
        runner.on = false;
        note('end', { score: H.state() && H.state().score });
        return runner.log;
    }

    function stop() { runner.on = false; }

    // ---------- capture: record this tab (video + game audio) and upload it to tools/showcase/server.js ----------
    // Needs a user gesture (or Chrome's --auto-accept-this-tab-capture) for the tab-capture prompt.
    const rec = { recorder: null, chunks: [], t0: 0 };

    async function startRecording(opts = {}) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: 60, width: { ideal: 4096 }, height: { ideal: 4096 } },
            audio: { suppressLocalAudioPlayback: false, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
            preferCurrentTab: true, selfBrowserSurface: 'include', surfaceSwitching: 'exclude', systemAudio: 'exclude'
        });
        const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
        rec.chunks = [];
        rec.recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: opts.bitrate || 40e6, audioBitsPerSecond: 256000 });
        rec.recorder.ondataavailable = (e) => { if (e.data && e.data.size) rec.chunks.push(e.data); };
        rec.recorder.start(1000);
        rec.t0 = performance.now();
        const track = stream.getVideoTracks()[0];
        return { mime, settings: track.getSettings(), audio: stream.getAudioTracks().length };
    }

    async function stopRecording(name) {
        const r = rec.recorder;
        if (!r) return null;
        await new Promise((done) => { r.onstop = done; r.stop(); });
        r.stream.getTracks().forEach((t) => t.stop());
        rec.recorder = null;
        const blob = new Blob(rec.chunks, { type: r.mimeType });
        const res = await fetch(`/__capture?name=${encodeURIComponent(name)}`, { method: 'POST', body: blob });
        return res.json();
    }

    // Record one run: the log's times line up with the video (t = ms from the first frame)
    async function capture(name, playOpts = {}) {
        const info = await startRecording(playOpts);
        const log = await play({ ...playOpts, t0: rec.t0 });
        await sleep(playOpts.tail != null ? playOpts.tail : 2500);
        const saved = await stopRecording(`${name}.webm`);
        await fetch(`/__capture?name=${encodeURIComponent(name)}.json`, { method: 'POST', body: JSON.stringify({ info, log }, null, 1) });
        return { saved, info, turns: log.filter((e) => e.kind === 'turn').length };
    }

    const api = {
        ROWS, COLS, STYLES, SETPIECES,
        fromState, cloneBoard, simulateDrop, simulateSwap, settle, climb, riserRows, makeTurn, landingRow, heights, tileCount, tierOf,
        chooseAction, play, stop, runner, startRecording, stopRecording, capture,
        showMarker(on) { ensureMarker(); if (marker) marker.classList.toggle('hidden-marker', !on); }
    };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.NullfallShowcase = api;
})(typeof window !== 'undefined' ? window : globalThis);
