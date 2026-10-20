// Nullfall - level editor (debug mode, GDD §5.3)
// Paint a 6×8 board, set the goal and rules, play-test it in the real game (nothing is saved) and
// export a levels.js entry. Numbers are entered at Tide 0, like levels.js; the loader doubles them
// per sector tide.

(function (root) {
    const ROWS = 8;
    const COLS = 6;
    const GOALS = ['zero_out', 'collect', 'break_cores', 'catch_stars', 'risers', 'survive', 'null_core', 'big_orb'];
    const BRUSHES = [
        { id: 'num', label: 'Orb' },
        { id: 'riser', label: 'Riser' },
        { id: 'D', label: 'Core ◈' },
        { id: 'H', label: 'Dense ◈' },
        { id: 'web', label: 'Webbed' },
        { id: 'link', label: 'Entangled' },
        { id: 'seal', label: 'Seal col' },
        { id: 'N', label: 'Null 2×2' },
        { id: '#', label: 'Wall 0' },
        { id: '*', label: 'Star ★' },
        { id: '.', label: 'Erase' }
    ];

    let el = null;
    let state = null; // { id, cells[r][c] (r = 0 is the top row), sealed [cols], brush, value, form, extra, showAll }

    // Fields the form doesn't edit but the level keeps (guide, placeholder notes, tide override)
    const KEPT = ['guide', 'temp', 'planned', 'tide'];

    function blank() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill('.'));
    }

    function defaultForm() {
        return {
            title: 'Draft level', goal: 'zero_out', target: 12, number: 3, size: 8, drops: 16,
            values: '1,2,3,4', specials: 0.12, favor: '', pairBias: '', rise: 0,
            risersStart: 0, risersEvery: 0, risersMax: 1
        };
    }

    // ---------- load / export ----------
    function loadLevel(id) {
        const data = (typeof NodeGenerator !== 'undefined' && NodeGenerator.LEVEL_DATA[id]) || null;
        state.id = id;
        state.cells = blank();
        state.sealed = [];
        state.form = defaultForm();
        state.extra = {};
        if (!data) return;
        state.sealed = (data.sealed || []).slice();
        KEPT.forEach((k) => { if (data[k] !== undefined) state.extra[k] = data[k]; });
        const rows = data.board || [];
        rows.forEach((line, i) => {
            const r = ROWS - rows.length + i;
            String(line).trim().split(/\s+/).forEach((tok, c) => { if (r >= 0 && c < COLS) state.cells[r][c] = tok; });
        });
        const g = data.goal || {};
        const p = data.pool || {};
        const rr = data.risers || {};
        Object.assign(state.form, {
            title: data.title || '', goal: g.type || 'zero_out', target: g.target || 1, number: g.number || 3, size: g.size || 8,
            drops: data.drops || 16, values: (p.values || [1, 2, 3, 4]).join(','), specials: p.specials ?? 0.12,
            favor: p.favor || '', pairBias: p.pairBias ?? '', rise: data.rise || 0,
            risersStart: rr.start || 0, risersEvery: rr.every || 0, risersMax: rr.max || 1
        });
    }

    function boardRows() {
        let top = ROWS;
        for (let r = 0; r < ROWS; r++) if (state.cells[r].some((t) => t !== '.')) { top = r; break; }
        const rows = [];
        for (let r = top; r < ROWS; r++) rows.push(state.cells[r].map((t) => t.padEnd(2)).join(' ').trimEnd());
        return rows;
    }

    function levelData() {
        const f = state.form;
        const goal = { type: f.goal, target: Number(f.target) || 1 };
        if (f.goal === 'collect') goal.number = Number(f.number);
        if (f.goal === 'big_orb') { goal.target = 1; goal.size = Number(f.size); }
        const pool = { values: String(f.values).split(',').map(Number).filter(Boolean), specials: Number(f.specials) || 0 };
        if (f.favor) pool.favor = Number(f.favor);
        if (f.pairBias !== '' && f.pairBias !== undefined) pool.pairBias = Number(f.pairBias);
        const data = { title: f.title, goal, drops: Number(f.drops) || 16, board: boardRows(), pool };
        if (Number(f.rise)) data.rise = Number(f.rise);
        if (state.sealed.length) data.sealed = state.sealed.slice().sort((a, b) => a - b);
        Object.assign(data, state.extra);
        if (Number(f.risersStart) || Number(f.risersEvery)) {
            data.risers = {};
            if (Number(f.risersStart)) data.risers.start = Number(f.risersStart);
            if (Number(f.risersEvery)) { data.risers.every = Number(f.risersEvery); data.risers.max = Number(f.risersMax) || 1; }
        }
        return data;
    }

    // A levels.js entry (JSON is a valid object literal there)
    function exportText() {
        const body = JSON.stringify(levelData(), null, 4)
            .replace(/\[\s+([-\d.,\s]+?)\s+\]/g, (m, inner) => `[${inner.split(/,\s+/).join(', ')}]`) // numbers on one line
            .replace(/\n/g, '\n        ');
        return `        '${state.id}': ${body},`;
    }

    // ---------- objectives ----------
    const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    const sectorOf = (id) => parseInt(id, 10) || 1;

    // What the game will show for this level: goal at the sector's tide, star goals and rules
    function objective(id, data) {
        if (typeof NodeGenerator === 'undefined' || !data) return null;
        const cfg = NodeGenerator.generateNodeConfig(sectorOf(id), id, data);
        const s = cfg.stars;
        const unit = s.kind === 'headroom' ? 'empty rows in every column' : 'drops left';
        const stars = [`${s.two}+ ${unit}`, `${s.three}+ ${unit}`];
        return { cfg, stars };
    }

    function sourceOf(id) {
        if (typeof NodeGenerator === 'undefined') return '';
        if (NodeGenerator.HANDCRAFTED[id]) return 'handcrafted';
        if (NodeGenerator.GENERATED[id]) return 'generated';
        return 'missing';
    }

    function botText(id) {
        const g = typeof NodeGenerator !== 'undefined' && !NodeGenerator.HANDCRAFTED[id] && NodeGenerator.GENERATED[id];
        if (!g || !g.bot) return '';
        return `Bot win ${Math.round(g.bot.winRate * 100)}% (aim ${Math.round(g.bot.target * 100)}%, ${g.bot.games} games)`;
    }

    // Objectives card for the draft being edited
    function objectiveHtml() {
        const o = objective(state.id, levelData());
        if (!o) return '';
        const { cfg } = o;
        const rules = [`${cfg.maxDrops} drops`, `Tide ${cfg.rules.pool.tide} · pool ${cfg.rules.pool.values.join(', ')}`]
            .concat(cfg.rules.modifiers.map((m) => `${m.icon} ${m.label}`));
        const tags = [sourceOf(state.id)];
        if (cfg.isBoss) tags.push('boss');
        if (cfg.isBonus) tags.push('bonus');
        const bot = botText(state.id);
        return `
            <div class="le-obj-head"><span class="le-obj-kicker">${esc(state.id)} · OBJECTIVE</span>${tags.map((t) => `<span class="le-tag">${esc(t)}</span>`).join('')}</div>
            <p class="le-obj-goal">${esc(cfg.desc)}</p>
            <ul class="le-obj-list">
                <li><b>★</b> Complete the objective</li>
                <li><b>★★</b> ${esc(o.stars[0])}</li>
                <li><b>★★★</b> ${esc(o.stars[1])}</li>
                ${rules.map((r) => `<li>${esc(r)}</li>`).join('')}
                ${cfg.guide ? `<li><b>Guide</b> ${esc(cfg.guide.line)} <i>${esc(cfg.guide.why)}</i></li>` : ''}
                ${cfg.temp ? `<li class="le-warn"><b>Stand-in</b> planned: ${esc(cfg.planned || 'not set')}</li>` : ''}
                ${bot ? `<li>${esc(bot)}</li>` : ''}
            </ul>`;
    }

    // Every node's objective in progression order; tap a row to load it
    function allHtml() {
        return NodeGenerator.NODE_ORDER.map((id) => {
            const data = NodeGenerator.LEVEL_DATA[id];
            const o = objective(id, data);
            if (!o) return `<button type="button" class="le-all-row" data-load="${id}"><span class="le-all-id">${id}</span><span class="le-warn">No level data</span></button>`;
            const { cfg } = o;
            const flags = [`${cfg.maxDrops} drops`].concat(cfg.rules.modifiers.map((m) => m.icon));
            if (cfg.guide) flags.push('guide');
            if (cfg.temp) flags.push('stand-in');
            if (!NodeGenerator.HANDCRAFTED[id]) flags.push('gen');
            return `<button type="button" class="le-all-row${id === state.id ? ' on' : ''}" data-load="${id}">
                <span class="le-all-id">${id}</span>
                <span class="le-all-main"><b>${esc(data.title || '')}</b><span>${esc(cfg.desc)}</span></span>
                <span class="le-all-flags">${esc(flags.join(' · '))}</span>
            </button>`;
        }).join('');
    }

    function nodeLabel(id) {
        const data = NodeGenerator.LEVEL_DATA[id];
        if (!data) return `${id} · no data`;
        const o = objective(id, data);
        return `${id} · ${o ? o.cfg.desc : data.goal.type}${NodeGenerator.HANDCRAFTED[id] ? '' : ' (gen)'}${data.temp ? ' ⚠' : ''}`;
    }

    function renderObjective() {
        el.querySelector('[data-obj]').innerHTML = objectiveHtml();
        const all = el.querySelector('[data-all]');
        all.hidden = !state.showAll;
        el.querySelector('[data-a="all"]').textContent = state.showAll ? 'Hide all objectives' : 'All objectives';
        el.querySelector('[data-a="all"]').setAttribute('aria-expanded', String(!!state.showAll));
        if (state.showAll) all.innerHTML = allHtml();
    }

    // ---------- UI ----------
    function cellLabel(t) {
        if (t === '.') return '';
        if (t === 'D') return '◈';
        if (t === 'N') return '●';
        if (t === 'H') return '◈◈';
        if (t === '#') return '0';
        if (t === '*') return '★';
        return t.replace('R', '▲').replace('W', '🕸').replace('E', '∞');
    }

    function cellClass(t) {
        if (t === '.') return '';
        if (t === 'D') return 'le-dm';
        if (t === 'H') return 'le-dm le-dense';
        if (t === 'N') return 'le-core';
        if (t === '#') return 'le-wall';
        if (t === '*') return 'le-star';
        return (t.startsWith('-') ? 'le-neg' : 'le-pos') + (t.endsWith('R') ? ' le-riser' : '')
            + (t.endsWith('W') ? ' le-web' : '') + (t.endsWith('E') ? ' le-link' : '');
    }

    function paint(r, c) {
        const b = state.brush;
        const v = Number(state.value) || 1;
        const tok = (v > 0 ? `+${v}` : `${v}`);
        if (b === 'num') state.cells[r][c] = tok;
        else if (b === 'riser') state.cells[r][c] = `${tok}R`;
        else if (b === 'web') state.cells[r][c] = `${tok}W`;
        else if (b === 'link') state.cells[r][c] = `${tok}E`; // paired in reading order: 1st with 2nd, 3rd with 4th
        else if (b === 'seal') {
            // Toggles the whole column (at most 2 per level)
            if (state.sealed.includes(c)) state.sealed = state.sealed.filter((x) => x !== c);
            else if (state.sealed.length < 2) state.sealed.push(c);
        }
        else if (b === 'N') {
            // 2×2 core with the tapped cell as its top-left
            const r0 = Math.min(r, ROWS - 2);
            const c0 = Math.min(c, COLS - 2);
            for (let rr = 0; rr < ROWS; rr++) for (let cc = 0; cc < COLS; cc++) if (state.cells[rr][cc] === 'N') state.cells[rr][cc] = '.';
            [[r0, c0], [r0, c0 + 1], [r0 + 1, c0], [r0 + 1, c0 + 1]].forEach(([a, b2]) => { state.cells[a][b2] = 'N'; });
        } else state.cells[r][c] = b;
        render();
    }

    function field(name, label, type = 'number', extra = '') {
        return `<label class="le-field"><span>${label}</span><input data-f="${name}" type="${type}" ${extra}></label>`;
    }

    function build() {
        el = document.createElement('div');
        el.className = 'le';
        el.hidden = true;
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.setAttribute('aria-label', 'Level editor');
        el.innerHTML = `
            <div class="le-inner">
                <div class="le-top">
                    <h1>Level editor</h1>
                    <button type="button" class="le-x" data-a="close" aria-label="Close level editor">✕</button>
                </div>
                <div class="le-row">
                    <label class="le-field le-grow"><span>Node</span><select data-a="node"></select></label>
                    <button type="button" class="le-btn" data-a="load" title="Discard edits and reload this node">Reload</button>
                    <button type="button" class="le-btn" data-a="clear">Clear</button>
                </div>
                <div class="le-obj" data-obj aria-live="polite"></div>
                <button type="button" class="le-btn le-all-toggle" data-a="all" aria-expanded="false">All objectives</button>
                <div class="le-all" data-all hidden></div>
                <div class="le-brushes" data-brushes></div>
                <div class="le-row">
                    <label class="le-field"><span>Orb value (Tide 0)</span><input data-value type="number" step="1"></label>
                    <p class="le-note">Tap a cell to paint. Board numbers are Tide 0: Sector 2 doubles them, Sector 3 ×4.</p>
                </div>
                <div class="le-grid" data-grid></div>
                <div class="le-form">
                    ${field('title', 'Title', 'text')}
                    <label class="le-field"><span>Goal</span><select data-f="goal">${GOALS.map((g) => `<option value="${g}">${g}</option>`).join('')}</select></label>
                    ${field('target', 'Target')}
                    ${field('number', 'Collect number (real)')}
                    ${field('size', 'Big Orb size')}
                    ${field('drops', 'Drops')}
                    ${field('values', 'Pool values (Tide 0)', 'text')}
                    ${field('specials', 'Special chance', 'number', 'step="0.01"')}
                    ${field('favor', 'Favor (Tide 0)')}
                    ${field('pairBias', 'Pair bias', 'number', 'step="0.05"')}
                    ${field('rise', 'Row rises every')}
                    ${field('risersStart', 'Risers at start')}
                    ${field('risersEvery', 'New Riser every')}
                    ${field('risersMax', 'Risers at once')}
                </div>
                <div class="le-row le-actions">
                    <button type="button" class="le-btn le-primary" data-a="play">Play-test</button>
                    <button type="button" class="le-btn" data-a="export">Copy for levels.js</button>
                </div>
                <textarea class="le-out" data-out readonly rows="8" aria-label="Exported level"></textarea>
                <p class="le-note">To check difficulty, paste it into levels.js and run: node tools/playtest.js --level ${'<id>'}</p>
            </div>`;
        document.body.appendChild(el);

        const sel = el.querySelector('[data-a="node"]');
        const ids = (typeof NodeGenerator !== 'undefined' ? NodeGenerator.NODE_ORDER : []);
        sel.innerHTML = ids.map((id) => `<option value="${id}">${esc(nodeLabel(id))}</option>`).join('');
        el.querySelector('[data-brushes]').innerHTML = BRUSHES.map((b) => `<button type="button" class="le-brush" data-brush="${b.id}">${b.label}</button>`).join('');

        el.addEventListener('click', (e) => {
            const brush = e.target.closest('[data-brush]');
            if (brush) { state.brush = brush.dataset.brush; render(); return; }
            const row = e.target.closest('[data-load]');
            if (row) { loadLevel(row.dataset.load); render(); el.querySelector('[data-obj]').scrollIntoView({ block: 'nearest' }); return; }
            const cell = e.target.closest('[data-cell]');
            if (cell) { const [r, c] = cell.dataset.cell.split(',').map(Number); paint(r, c); return; }
            const a = e.target.closest('[data-a]');
            if (!a) return;
            const act = a.dataset.a;
            if (act === 'close') close();
            else if (act === 'load') { loadLevel(sel.value); render(); }
            else if (act === 'clear') { state.cells = blank(); state.sealed = []; render(); }
            else if (act === 'all') { state.showAll = !state.showAll; renderObjective(); }
            else if (act === 'play') {
                const sector = parseInt(state.id, 10) || 1;
                close();
                if (root.NullfallDev) root.NullfallDev.playLevel(sector, state.id, levelData());
            } else if (act === 'export') {
                const text = exportText();
                el.querySelector('[data-out]').value = text;
                if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
            }
        });
        el.addEventListener('input', (e) => {
            const f = e.target.dataset.f;
            if (f) { state.form[f] = e.target.value; renderObjective(); }
            if (e.target.hasAttribute('data-value')) state.value = e.target.value;
        });
        el.addEventListener('change', (e) => {
            if (e.target.dataset.f === 'goal') { state.form.goal = e.target.value; renderObjective(); }
            // Picking a node loads it so its objective shows straight away
            if (e.target.dataset.a === 'node') { loadLevel(e.target.value); render(); }
        });
    }

    function render() {
        const grid = el.querySelector('[data-grid]');
        grid.innerHTML = state.cells.map((row, r) => row.map((t, c) =>
            `<button type="button" class="le-cell ${r === 0 ? 'le-redline ' : ''}${state.sealed.includes(c) ? 'le-sealed ' : ''}${cellClass(t)}" data-cell="${r},${c}" aria-label="Row ${r + 1} column ${c + 1}: ${t === '.' ? 'empty' : t}${state.sealed.includes(c) ? ', sealed column' : ''}">${r === 0 && t === '.' && state.sealed.includes(c) ? '🔒' : cellLabel(t)}</button>`).join('')).join('');
        el.querySelectorAll('[data-brush]').forEach((b) => b.classList.toggle('on', b.dataset.brush === state.brush));
        el.querySelector('[data-value]').value = state.value;
        el.querySelector('[data-a="node"]').value = state.id;
        el.querySelectorAll('[data-f]').forEach((i) => { i.value = state.form[i.dataset.f]; });
        renderObjective();
    }

    function open() {
        if (!el) build();
        if (!state) {
            state = { id: '1-1', cells: blank(), sealed: [], brush: 'num', value: 1, form: defaultForm(), extra: {}, showAll: false };
            loadLevel('1-1');
        }
        render();
        el.hidden = false;
    }

    function close() {
        if (el) el.hidden = true;
    }

    root.NullfallLevelEditor = { open, close };
}(typeof self !== 'undefined' ? self : this));
