// Nullfall - headless rules engine for the playtest bot (GDD §5.3)
// A Node port of the board rules in www/game.js: gravity, Zero Blasts and blast tiers, merges,
// Dark Matter, specials and Overdrive, Risers, stars, the Null Core, static blocks, rising rows,
// goals and stars. No drawing, no timing. Keep it in step with game.js when rules change.
//
// Known simplifications: no swaps; Hold is a free stash before a drop; score and bounties aren't
// tracked; Overdrive deals its super-weapon as the next tray orb.

'use strict';

const path = require('path');
const WWW = path.join(__dirname, '..', '..', 'www');
const OrbBag = require(path.join(WWW, 'orbBag.js'));
const NodeGenerator = require(path.join(WWW, 'nodeGenerator.js'));

const ROWS = 8;
const COLS = 6;
const SUPER_WEAPONS = ['blackhole', 'supernova_core', 'antimatter_nuke'];
const SPECIALS = ['invert', 'div2', 'mul2', 'zero'];

// Seeded RNG with copyable state (Mulberry32)
function makeRng(seed) {
    const rng = { s: seed >>> 0 };
    rng.next = function () {
        rng.s = (rng.s + 0x6D2B79F5) >>> 0;
        let t = rng.s;
        t = Math.imul(t ^ (t >>> 15), 1 | t);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return rng;
}

function createTile(value, type = 'number') {
    return { type, value, hp: type === 'dark_matter' ? 2 : 1 };
}

function getTier(m) {
    if (m <= 1) return 1;
    if (m <= 3) return 2;
    if (m <= 7) return 3;
    if (m <= 15) return 4;
    return 5;
}

class Game {
    /**
     * @param {object} config node config from NodeGenerator.generateNodeConfig
     * @param {number} seed run seed (the tray, rising rows, shatters and spawns)
     */
    constructor(config, seed) {
        this.config = config;
        this.goal = config.goal;
        this.rules = config.rules || {};
        this.pool = this.rules.pool || { values: [1, 2, 3, 4], specials: 0.12 };
        this.tideScale = OrbBag.tideScale(this.pool.tide || 0);
        this.rng = makeRng(seed);
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        config.setupBoard(this.grid, ROWS, COLS, (v, t) => createTile(v, t));
        this.starCells = config.starCells ? config.starCells(ROWS) : [];
        this.maxDrops = config.maxDrops;
        this.dropsUsed = 0;
        this.progress = 0;
        this.met = false;
        this.lost = null;
        this.movesUntilRise = this.rules.fluxRate || 0;
        this.riserClock = 0;
        this.pendingDeals = [];
        this.overdrive = 0;
        this.superIdx = 0;
        this.pendingSuper = null;
        this.combo = 1;
        this.overdriveOn = NodeGenerator.nodeOrder('1-5') <= NodeGenerator.nodeOrder(config.id);
        this.dealer = OrbBag.createDealer({
            values: this.pool.values,
            favor: this.pool.favor,
            pairBias: this.pool.pairBias,
            collect: this.goal.type === 'collect' ? { number: this.goal.number, every: 4 } : null,
            rng: () => this.rng.next()
        });
        const rr = this.rules.risers;
        for (let i = 0; i < ((rr && rr.start) || 0); i++) this.spawnRiser();
        this.ensureRiserOpposites();
        this.tray = [this.deal(), this.deal()];
        this.hold = null;
        if (config.guide) this.tray[0] = config.guide.orb === 'zero' ? { type: 'special', subType: 'zero' } : { type: 'number', value: config.guide.orb };
    }

    // ---------- copying for look-ahead (the clone never deals) ----------
    clone() {
        const g = Object.create(Game.prototype);
        Object.assign(g, this);
        const cores = new Map();
        g.grid = this.grid.map((row) => row.map((t) => {
            if (!t) return null;
            const c = { ...t };
            if (t.core) {
                if (!cores.has(t.core)) cores.set(t.core, { ...t.core });
                c.core = cores.get(t.core);
            }
            return c;
        }));
        g.starCells = this.starCells.map((s) => ({ ...s }));
        g.pendingDeals = this.pendingDeals.map((d) => ({ ...d }));
        g.rng = makeRng(this.rng.s);
        g.tray = this.tray.slice();
        g.dealer = null;
        return g;
    }

    // ---------- dealing ----------
    exposed() {
        const out = [];
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS; r++) {
                const t = this.grid[r][c];
                if (!t) continue;
                if (t.type === 'number') out.push(t.value);
                break;
            }
        }
        return out;
    }

    deal() {
        if (!this.dealer) return null;
        if (this.pendingSuper) {
            const s = this.pendingSuper;
            this.pendingSuper = null;
            return { type: 'special', subType: s };
        }
        this.pendingDeals.forEach((d) => { d.due--; });
        const i = this.pendingDeals.findIndex((d) => d.due <= 0);
        if (i >= 0) return { type: 'number', value: this.pendingDeals.splice(i, 1)[0].value };
        if (this.pool.specials && this.rng.next() < this.pool.specials) {
            return { type: 'special', subType: SPECIALS[Math.floor(this.rng.next() * SPECIALS.length)] };
        }
        return { type: 'number', value: this.dealer.next({ exposed: this.exposed() }) };
    }

    // ---------- helpers ----------
    isFixed(t) { return !!(t && (t.type === 'null_core' || t.type === 'static')); }
    isAnchored(t) { return !!(t && (t.riser || this.isFixed(t))); }

    landingRow(col) {
        for (let r = 0; r < ROWS; r++) if (this.grid[r][col]) return r - 1;
        return ROWS - 1;
    }

    goalCountFor(tiles) {
        const g = this.goal;
        if (g.type === 'zero_out') return tiles.filter((t) => t.type === 'number').length;
        if (g.type === 'collect') return tiles.filter((t) => t.type === 'number' && Math.abs(t.value) === g.number).length;
        if (g.type === 'break_cores') return tiles.filter((t) => t.type === 'dark_matter').length;
        if (g.type === 'risers') return tiles.filter((t) => t.riser).length;
        return 0;
    }

    advance(n) {
        if (this.met || n <= 0) return;
        this.progress = Math.min(this.goal.target, this.progress + n);
        if (this.progress >= this.goal.target) this.met = true;
    }

    removed(tiles) {
        if (tiles.length) this.advance(this.goalCountFor(tiles));
    }

    orbMade(m) {
        if (this.goal.type === 'big_orb' && m >= this.goal.size) this.advance(1);
    }

    charge(pts) {
        if (!this.overdriveOn || this.pendingSuper) return;
        this.overdrive = Math.min(100, this.overdrive + pts);
        if (this.overdrive >= 100) {
            this.overdrive = 0;
            this.pendingSuper = SUPER_WEAPONS[this.superIdx++ % SUPER_WEAPONS.length];
        }
    }

    boardMag(maxBase) {
        return (Math.floor(this.rng.next() * maxBase) + 1) * this.tideScale;
    }

    // ---------- Dark Matter and the Null Core ----------
    damageDM(r, c, dmg) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
        const t = this.grid[r][c];
        if (!t || t.type !== 'dark_matter') return;
        t.hp -= dmg;
        if (t.hp <= 0) {
            this.grid[r][c] = createTile((this.rng.next() < 0.5 ? 1 : -1) * this.boardMag(4));
            this.removed([t]);
        }
    }

    coreCells() {
        const out = [];
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const t = this.grid[r][c];
            if (t && t.type === 'null_core') out.push({ r, c, t });
        }
        return out;
    }

    damageCore(dmg) {
        const cells = this.coreCells();
        if (!cells.length || dmg <= 0) return;
        const core = cells[0].t.core;
        const d = Math.min(dmg, core.hp);
        core.hp -= d;
        if (this.goal.type === 'null_core') this.advance(d);
        if (core.hp <= 0) cells.forEach(({ r, c }) => { this.grid[r][c] = null; });
    }

    coreBlast(r, c, r2, c2, tier) {
        const cells = this.coreCells();
        if (!cells.length) return;
        let dmg = 0;
        cells.forEach(({ r: cr, c: cc }) => {
            const adj = [[r, c], [r2, c2]].some(([br, bc]) => Math.abs(br - cr) + Math.abs(bc - cc) === 1);
            if (tier === 3 && (cr === r || cr === r2 || cc === c || cc === c2)) dmg = Math.max(dmg, 3);
            else if (tier === 4 && cr >= Math.min(r, r2) - 1 && cr <= Math.max(r, r2) + 1 && cc >= Math.min(c, c2) - 1 && cc <= Math.max(c, c2) + 1) dmg = Math.max(dmg, 3);
            else if (tier >= 5) dmg = Math.max(dmg, 3);
            else if (adj) dmg = Math.max(dmg, 1);
        });
        this.damageCore(dmg);
    }

    coreArea(r1, r2, c1, c2, dmgIn, dmgNear) {
        let dmg = 0;
        this.coreCells().forEach(({ r, c }) => {
            if (r >= r1 && r <= r2 && c >= c1 && c <= c2) dmg = Math.max(dmg, dmgIn);
            else if ((r >= r1 - 1 && r <= r2 + 1 && c >= c1 && c <= c2) || (c >= c1 - 1 && c <= c2 + 1 && r >= r1 && r <= r2)) dmg = Math.max(dmg, dmgNear);
        });
        this.damageCore(dmg);
    }

    supernovaArea(r1, c1, r2, c2) {
        const out = [];
        for (let r = Math.max(0, Math.min(r1, r2) - 1); r <= Math.min(ROWS - 1, Math.max(r1, r2) + 1); r++) {
            for (let c = Math.max(0, Math.min(c1, c2) - 1); c <= Math.min(COLS - 1, Math.max(c1, c2) + 1); c++) {
                const t = this.grid[r][c];
                if (!t) continue;
                if (t.type === 'dark_matter') this.damageDM(r, c, 2);
                else if (t.type === 'number' && Math.abs(t.value) <= 4) { out.push(t); this.grid[r][c] = null; }
            }
        }
        this.removed(out);
    }

    // ---------- blasts and merges ----------
    blast(r, c, r2, c2, a, b, chainStep) {
        this.grid[r][c] = null;
        this.grid[r2][c2] = null;
        this.removed([a, b]);
        const m = Math.abs(a.value);
        const tier = getTier(m);
        if (tier <= 2) {
            [[r, c], [r2, c2]].forEach(([br, bc]) => [[br - 1, bc], [br + 1, bc], [br, bc - 1], [br, bc + 1]].forEach(([nr, nc]) => this.damageDM(nr, nc, 1)));
        } else if (tier === 3) {
            new Set([r, r2]).forEach((rr) => { for (let cc = 0; cc < COLS; cc++) this.damageDM(rr, cc, 1); });
            new Set([c, c2]).forEach((cc) => { for (let rr = 0; rr < ROWS; rr++) this.damageDM(rr, cc, 1); });
        } else if (tier === 4) {
            this.supernovaArea(r, c, r2, c2);
        } else {
            const out = [];
            for (let rr = ROWS - 3; rr < ROWS; rr++) for (let cc = 0; cc < COLS; cc++) {
                const t = this.grid[rr][cc];
                if (t && !this.isFixed(t)) { out.push(t); this.grid[rr][cc] = null; }
            }
            this.removed(out);
        }
        this.coreBlast(r, c, r2, c2, tier);
        const table = [0, 2, 4, 7, 12, 18];
        this.charge(Math.round(table[tier] * (1 + (this.combo - 1) * 0.25)));
        this.blasts = (this.blasts || 0) + 1;
    }

    scan(chainStep) {
        const g = this.grid;
        const num = (t) => t && t.type === 'number';
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const a = g[r][c];
            if (!num(a)) continue;
            if (c + 1 < COLS && num(g[r][c + 1]) && a.value + g[r][c + 1].value === 0) { this.blast(r, c, r, c + 1, a, g[r][c + 1], chainStep); return true; }
            if (r + 1 < ROWS && num(g[r + 1][c]) && a.value + g[r + 1][c].value === 0) { this.blast(r, c, r + 1, c, a, g[r + 1][c], chainStep); return true; }
        }
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const a = g[r][c];
            if (!num(a)) continue;
            for (const [r2, c2] of [[r, c + 1], [r + 1, c]]) {
                if (r2 >= ROWS || c2 >= COLS) continue;
                const b = g[r2][c2];
                if (!num(b) || a.value !== b.value) continue;
                const fused = createTile(a.value * 2);
                if (a.riser || b.riser) fused.riser = true;
                g[r][c] = null;
                g[r2][c2] = fused;
                this.orbMade(Math.abs(fused.value));
                this.charge(2);
                this.merges = (this.merges || 0) + 1;
                return true;
            }
        }
        return false;
    }

    gravity() {
        let moved = false;
        for (let c = 0; c < COLS; c++) {
            for (let r = ROWS - 2; r >= 0; r--) {
                const t = this.grid[r][c];
                if (t && !this.grid[r + 1][c] && !this.isAnchored(t)) {
                    let to = r + 1;
                    while (to + 1 < ROWS && !this.grid[to + 1][c]) to++;
                    this.grid[to][c] = t;
                    this.grid[r][c] = null;
                    moved = true;
                }
            }
        }
        return moved;
    }

    catchStars() {
        this.starCells.forEach((s) => {
            if (!s.caught && this.grid[s.r][s.c]) {
                s.caught = true;
                if (this.goal.type === 'catch_stars') this.advance(1);
            }
        });
    }

    settle(state) {
        while (state.step < 40) {
            this.gravity();
            this.catchStars();
            if (this.scan(state.step)) {
                state.step++;
                this.combo++;
                continue;
            }
            break;
        }
    }

    // ---------- Risers ----------
    countRisers() {
        let n = 0;
        this.grid.forEach((row) => row.forEach((t) => { if (t && t.riser) n++; }));
        return n;
    }

    queueOpposite(value, due) {
        const v = -value;
        const p = this.pendingDeals.find((d) => d.value === v);
        if (p) p.due = Math.min(p.due, due);
        else this.pendingDeals.push({ value: v, due });
    }

    ensureRiserOpposites() {
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const t = this.grid[r][c];
            if (!t || !t.riser) continue;
            const due = Math.max(1, Math.min(3, r - 2));
            if (t.oppQueued !== t.value) { this.queueOpposite(t.value, due); t.oppQueued = t.value; }
            else { const p = this.pendingDeals.find((d) => d.value === -t.value); if (p) p.due = Math.min(p.due, due); }
        }
    }

    climbRisers() {
        let moved = false;
        for (let r = 1; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const t = this.grid[r][c];
            if (!t || !t.riser) continue;
            const above = this.grid[r - 1][c];
            if (this.isFixed(above)) continue;
            this.grid[r - 1][c] = t;
            this.grid[r][c] = above || null;
            moved = true;
        }
        return moved;
    }

    spawnRiser() {
        const cols = [];
        for (let c = 0; c < COLS; c++) {
            let fixed = false;
            let top = ROWS;
            for (let r = 0; r < ROWS; r++) {
                const t = this.grid[r][c];
                if (this.isFixed(t)) fixed = true;
                if (t && top === ROWS) top = r;
            }
            if (!fixed) cols.push({ c, top });
        }
        if (!cols.length) return false;
        const best = Math.max(...cols.map((x) => x.top));
        const pick = cols.filter((x) => x.top === best);
        const c = pick[Math.floor(this.rng.next() * pick.length)].c;
        const near = [this.grid[ROWS - 1][c], c > 0 ? this.grid[ROWS - 1][c - 1] : null, c < COLS - 1 ? this.grid[ROWS - 1][c + 1] : null]
            .filter((t) => t && t.type === 'number').map((t) => Math.abs(t.value));
        const mags = this.pool.values.filter((v) => !near.includes(v));
        const list = mags.length ? mags : this.pool.values;
        const val = list[Math.floor(this.rng.next() * list.length)] * (this.rng.next() < 0.5 ? 1 : -1);
        for (let r = 0; r < ROWS - 1; r++) this.grid[r][c] = this.grid[r + 1][c];
        const t = createTile(val);
        t.riser = true;
        this.grid[ROWS - 1][c] = t;
        this.ensureRiserOpposites();
        return true;
    }

    pushRow() {
        for (let r = 0; r < ROWS - 1; r++) this.grid[r] = this.grid[r + 1];
        this.grid[ROWS - 1] = Array.from({ length: COLS }, () => (this.rng.next() < 0.6
            ? createTile(0, 'dark_matter')
            : createTile((this.rng.next() < 0.5 ? 1 : -1) * this.boardMag(3))));
    }

    // ---------- specials ----------
    special(sub, col, row) {
        const g = this.grid;
        const target = row >= 0 && row < ROWS ? g[row][col] : null;
        if (sub === 'blackhole') {
            this.coreArea(0, ROWS - 1, col, col, 3, 1);
            const out = [];
            for (let r = 0; r < ROWS; r++) if (g[r][col] && !this.isFixed(g[r][col])) { out.push(g[r][col]); g[r][col] = null; }
            this.removed(out);
            for (let r = 0; r < ROWS; r++) { this.damageDM(r, col - 1, 1); this.damageDM(r, col + 1, 1); }
        } else if (sub === 'supernova_core' || sub === 'antimatter_nuke') {
            const er = Math.max(0, Math.min(ROWS - 1, row >= 0 ? row : ROWS - 1));
            this.supernovaArea(er, col, er, col);
            this.coreArea(er - 1, er + 1, col - 1, col + 1, 3, 1);
        } else if (sub === 'zero') {
            this.coreArea(row - 1, row + 1, col - 1, col + 1, 1, 1);
            const out = [];
            for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
                    if (g[r][c] && !this.isFixed(g[r][c])) { out.push(g[r][c]); g[r][c] = null; }
                }
            }
            this.removed(out);
        } else if (target && !this.isFixed(target) && target.type === 'number') {
            if (sub === 'invert') target.value = -target.value;
            else if (sub === 'div2' && Math.abs(target.value) > 1) target.value = Math.sign(target.value) * Math.floor(Math.abs(target.value) / 2);
            else if (sub === 'mul2') { target.value *= 2; this.orbMade(Math.abs(target.value)); }
        }
    }

    // ---------- a whole turn ----------
    /** Legal drops: [{ source: 0 | 1 | 'hold', col }] */
    moves() {
        const out = [];
        const sources = [0, 1];
        if (this.hold) sources.push('hold');
        sources.forEach((s) => {
            const orb = s === 'hold' ? this.hold : this.tray[s];
            if (!orb) return;
            for (let c = 0; c < COLS; c++) {
                if (orb.type === 'number' && this.landingRow(c) < 0) continue;
                out.push({ source: s, col: c });
            }
        });
        return out;
    }

    /** Stash a tray orb in Hold (free action, once per drop; the slot refills). */
    stash(slot) {
        if (this.hold || !this.tray[slot]) return false;
        this.hold = this.tray[slot];
        this.tray[slot] = this.deal();
        return true;
    }

    drop(move) {
        if (this.lost || this.met) return;
        const orb = move.source === 'hold' ? this.hold : this.tray[move.source];
        if (move.source === 'hold') this.hold = null;
        else this.tray[move.source] = this.deal();
        this.dropsUsed++;
        this.combo = 1;
        const col = move.col;
        const land = this.landingRow(col);
        if (orb.type === 'special') {
            this.special(orb.subType, col, land + 1 < ROWS && this.grid[land + 1] && this.grid[land + 1][col] ? land + 1 : land);
        } else if (land >= 0) {
            this.grid[land][col] = createTile(orb.value);
        }
        const state = { step: 0 };
        this.settle(state);
        this.turnEffects(state);
        this.checkEnd();
    }

    turnEffects(state) {
        if (this.countRisers() > 0 && this.climbRisers()) {
            this.settle(state);
            for (let c = 0; c < COLS; c++) if (this.grid[0][c] && this.grid[0][c].riser) return;
            this.ensureRiserOpposites();
        }
        const rr = this.rules.risers;
        if (rr && rr.every) {
            this.riserClock++;
            if (this.riserClock >= rr.every) {
                this.riserClock = 0;
                if (this.countRisers() < (rr.max || 1) && this.spawnRiser()) this.settle(state);
            }
        }
        if (this.rules.fluxRate > 0) {
            this.movesUntilRise--;
            if (this.movesUntilRise <= 0) {
                this.movesUntilRise = this.rules.fluxRate;
                this.pushRow();
                this.catchStars();
            }
        }
        if (this.goal.type === 'survive' && this.dropsUsed > this.progress) this.advance(this.dropsUsed - this.progress);
    }

    checkEnd() {
        for (let c = 0; c < COLS; c++) {
            if (this.grid[0][c] && this.grid[0][c].riser) { this.lost = 'riser'; return; }
        }
        for (let c = 0; c < COLS; c++) {
            if (this.grid[0][c]) { this.lost = 'breach'; return; }
        }
        if (this.met) return;
        if (this.dropsUsed >= this.maxDrops) this.lost = 'drops';
    }

    // ---------- stars ----------
    headroom() {
        let min = ROWS - 1;
        for (let c = 0; c < COLS; c++) {
            let top = ROWS;
            for (let r = 0; r < ROWS; r++) if (this.grid[r][c]) { top = r; break; }
            min = Math.min(min, Math.max(0, top - 1));
        }
        return min;
    }

    stars() {
        if (!this.met || this.lost) return 0;
        const s = this.config.stars;
        const have = s.kind === 'headroom' ? this.headroom() : this.maxDrops - this.dropsUsed;
        if (have >= s.three) return 3;
        if (have >= s.two) return 2;
        return 1;
    }
}

module.exports = { Game, ROWS, COLS, makeRng, createTile, getTier };
