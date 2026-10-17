// Nullfall - Adventure map and level loader
// Sector map layouts plus the loader that turns levels.js data into playable node configs.

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.NodeGenerator = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    const SECTOR_METADATA = [
        {
            sector: 1,
            name: "Subatomic Genesis",
            theme: "The Outer Aegis Ring",
            color: "#00f2fe",
            desc: "Stabilize basic particle rifts and clear initial dark matter fractures."
        },
        {
            sector: 2,
            name: "Ion Nebula",
            theme: "Turbulent Plasma Storm",
            color: "#c471ed",
            desc: "Dense charged ions create accelerating flux and high-energy fusions."
        },
        {
            sector: 3,
            name: "Event Horizon",
            theme: "Tartarus Gravitational Core",
            color: "#ffd700",
            desc: "Intense gravity well with massive dark matter shields and laser crossfires."
        }
    ];

    // Node graph spatial layouts for each sector (10 main nodes + 2 bonus branch nodes)
    // Coordinates normalized (0 to 100 percentage in scroll viewport)
    const SECTOR_LAYOUTS = [
        // Sector 1
        [
            { id: '1-1', num: 1, x: 20, y: 88, type: 'start', branchOf: null },
            { id: '1-2', num: 2, x: 42, y: 82, type: 'normal', branchOf: null },
            { id: '1-3', num: 3, x: 68, y: 76, type: 'normal', branchOf: null },
                        { id: '1-4', num: 4, x: 50, y: 66, type: 'normal', branchOf: null },
            { id: '1-bonus-1', num: 'B1', x: 80, y: 60, type: 'bonus', branchOf: '1-4' },
            { id: '1-5', num: 5, x: 26, y: 58, type: 'normal', branchOf: null },
            { id: '1-6', num: 6, x: 48, y: 50, type: 'normal', branchOf: null },
            { id: '1-7', num: 7, x: 30, y: 40, type: 'normal', branchOf: null },
            { id: '1-8', num: 8, x: 55, y: 32, type: 'normal', branchOf: null },
            { id: '1-bonus-2', num: 'B2', x: 24, y: 26, type: 'bonus', branchOf: '1-8' },
            { id: '1-9', num: 9, x: 72, y: 22, type: 'normal', branchOf: null },
            { id: '1-10', num: 10, x: 50, y: 12, type: 'boss', branchOf: null }
        ],
        // Sector 2 (12 main nodes + 2 bonus rifts = 14 levels, GDD §5.1)
        [
            { id: '2-1', num: 1, x: 25, y: 92, type: 'start', branchOf: null },
            { id: '2-2', num: 2, x: 52, y: 84, type: 'normal', branchOf: null },
            { id: '2-3', num: 3, x: 75, y: 77, type: 'normal', branchOf: null },
            { id: '2-bonus-1', num: 'B1', x: 88, y: 73, type: 'bonus', branchOf: '2-3' },
            { id: '2-4', num: 4, x: 48, y: 69, type: 'normal', branchOf: null },
            { id: '2-5', num: 5, x: 24, y: 61, type: 'normal', branchOf: null },
            { id: '2-6', num: 6, x: 46, y: 54, type: 'normal', branchOf: null },
            { id: '2-bonus-2', num: 'B2', x: 12, y: 50, type: 'bonus', branchOf: '2-6' },
            { id: '2-7', num: 7, x: 72, y: 46, type: 'normal', branchOf: null },
            { id: '2-8', num: 8, x: 50, y: 39, type: 'normal', branchOf: null },
            { id: '2-9', num: 9, x: 28, y: 31, type: 'normal', branchOf: null },
            { id: '2-10', num: 10, x: 54, y: 23, type: 'normal', branchOf: null },
            { id: '2-11', num: 11, x: 74, y: 16, type: 'normal', branchOf: null },
            { id: '2-12', num: 12, x: 50, y: 8, type: 'boss', branchOf: null }
        ],
        // Sector 3 (13 main nodes + 2 bonus rifts = 15 levels); its own 3-x IDs
        [
            { id: '3-1', num: 1, x: 75, y: 92, type: 'start', branchOf: null },
            { id: '3-2', num: 2, x: 48, y: 85, type: 'normal', branchOf: null },
            { id: '3-3', num: 3, x: 25, y: 78, type: 'normal', branchOf: null },
            { id: '3-bonus-1', num: 'B1', x: 12, y: 74, type: 'bonus', branchOf: '3-3' },
            { id: '3-4', num: 4, x: 50, y: 71, type: 'normal', branchOf: null },
            { id: '3-5', num: 5, x: 76, y: 64, type: 'normal', branchOf: null },
            { id: '3-6', num: 6, x: 54, y: 57, type: 'normal', branchOf: null },
            { id: '3-7', num: 7, x: 30, y: 50, type: 'normal', branchOf: null },
            { id: '3-bonus-2', num: 'B2', x: 86, y: 46, type: 'bonus', branchOf: '3-7' },
            { id: '3-8', num: 8, x: 50, y: 43, type: 'normal', branchOf: null },
            { id: '3-9', num: 9, x: 72, y: 36, type: 'normal', branchOf: null },
            { id: '3-10', num: 10, x: 48, y: 29, type: 'normal', branchOf: null },
            { id: '3-11', num: 11, x: 26, y: 22, type: 'normal', branchOf: null },
            { id: '3-12', num: 12, x: 74, y: 15, type: 'normal', branchOf: null },
            { id: '3-13', num: 13, x: 50, y: 8, type: 'boss', branchOf: null }
        ]
    ];

    // Progression order: each sector's main nodes in order, a bonus rift right after the node
    // it branches from. Concept unlocks compare positions in this list (GDD §6.1).
    const NODE_ORDER = [];
    SECTOR_LAYOUTS.forEach((layout) => {
        layout.filter((n) => n.type !== 'bonus').forEach((n) => {
            NODE_ORDER.push(n.id);
            layout.filter((b) => b.type === 'bonus' && b.branchOf === n.id).forEach((b) => NODE_ORDER.push(b.id));
        });
    });

    function nodeOrder(id) {
        if (id === 'start') return -1;
        const i = NODE_ORDER.indexOf(id);
        return i < 0 ? Infinity : i;
    }

    // Level data lives in levels.js (fixed data, GDD §5.3)
    // Generated levels (tools/levelgen.js) fill the slots; handcrafted levels.js entries win
    const IS_NODE = typeof module === 'object' && module.exports;
    const HANDCRAFTED = IS_NODE
        ? require('./levels.js').LEVELS
        : ((typeof NullfallLevels !== 'undefined' && NullfallLevels.LEVELS) || {});
    const GENERATED = IS_NODE
        ? require('./levelsGenerated.js').LEVELS
        : ((typeof NullfallGeneratedLevels !== 'undefined' && NullfallGeneratedLevels.LEVELS) || {});
    const LEVEL_DATA = { ...GENERATED, ...HANDCRAFTED };

    // Goals the game can play today; anything else needs a stand-in (see levels.js `temp`)
    const GOAL_TYPES = ['zero_out', 'collect', 'break_cores', 'catch_stars', 'risers', 'survive', 'null_core', 'big_orb'];

    // Stars from drops left: ★★ at ≥25%, ★★★ at ≥45%, rounded up to whole drops.
    // Survive uses headroom instead: every column ends with ≥3 (★★) / ≥5 (★★★) empty rows.
    function starThresholds(drops, goal) {
        if (goal && goal.type === 'survive') return { kind: 'headroom', two: 3, three: 5 };
        return { kind: 'drops', two: Math.ceil(drops * 0.25), three: Math.ceil(drops * 0.45) };
    }

    function starsForDropsLeft(dropsLeft, thresholds) {
        if (dropsLeft >= thresholds.three) return 3;
        if (dropsLeft >= thresholds.two) return 2;
        return 1;
    }

    // One-line goal text for cards and the strip
    function describeGoal(goal) {
        if (!goal) return 'Complete the goal';
        if (goal.type === 'zero_out') return `Clear ${goal.target} orbs`;
        if (goal.type === 'collect') return `Pop ${goal.target} orbs showing ${goal.number}`;
        if (goal.type === 'break_cores') return `Break ${goal.target} Dark Matter cores`;
        if (goal.type === 'catch_stars') return `Catch ${goal.target} stars`;
        if (goal.type === 'risers') return `Clear ${goal.target} Risers`;
        if (goal.type === 'survive') return `Survive ${goal.target} drops`;
        if (goal.type === 'null_core') return `Drain the Null Core (${goal.target} HP)`;
        if (goal.type === 'big_orb') return `Merge an orb up to ${goal.size}`;
        return 'Complete the goal';
    }

    // Board rows (top to bottom) are aligned to the bottom of the grid.
    // Tokens: .  empty   +3 / -3  orb   +3R  Riser   D  Dark Matter   N  Null Core cell (2×2)
    //         #  static block (0 wall)   *  star (empty cell)
    function parseBoard(rows) {
        const cells = [];
        const stars = [];
        const lines = rows || [];
        lines.forEach((line, i) => {
            const rowFromBottom = lines.length - 1 - i;
            String(line).trim().split(/\s+/).forEach((tok, c) => {
                if (tok === '.' || tok === '') return;
                if (tok === '*') stars.push({ rowFromBottom, c });
                else if (tok === 'D') cells.push({ rowFromBottom, c, value: 0, type: 'dark_matter' });
                else if (tok === 'N') cells.push({ rowFromBottom, c, value: 0, type: 'null_core' });
                else if (tok === '#') cells.push({ rowFromBottom, c, value: 0, type: 'static' });
                else cells.push({ rowFromBottom, c, value: parseInt(tok, 10), type: 'number', riser: /R$/.test(tok) });
            });
        });
        return { cells, stars };
    }

    /**
     * Builds the playable config for a node from its level data.
     * @param {number} sectorNum 1-based sector index (1, 2, 3...)
     * @param {string} nodeId Node identifier, e.g. '1-1' or '1-bonus-1'
     * @param {object} [override] level data to use instead of the stored level (tools, editor play-test)
     */
    function generateNodeConfig(sectorNum, nodeId, override) {
        const sectorMeta = SECTOR_METADATA[sectorNum - 1] || SECTOR_METADATA[0];
        const layoutList = SECTOR_LAYOUTS[sectorNum - 1] || SECTOR_LAYOUTS[0];
        const nodeLayout = layoutList.find(n => n.id === nodeId) || layoutList[0];
        const data = override || LEVEL_DATA[nodeLayout.id] || { title: `Node ${nodeLayout.id}`, goal: { type: 'zero_out', target: 10 }, drops: 14, temp: true, planned: 'missing level data' };

        const isBoss = nodeLayout.type === 'boss';
        const isBonus = nodeLayout.type === 'bonus';
        let title = data.title;
        if (isBonus) title = `Bonus: ${title}`;
        if (isBoss) title = `Sector Boss: ${title}`;

        const goal = { ...data.goal };
        if (!GOAL_TYPES.includes(goal.type)) console.warn(`[levels] ${nodeLayout.id}: goal ${goal.type} not built yet`);

        const modifiers = [];
        const fluxRate = data.rise || 0;
        if (fluxRate) modifiers.push({ icon: '⏳', label: `Rising rows (every ${fluxRate} drops)` });
        const risers = data.risers || null; // { start, every, max }
        if (risers && risers.every) modifiers.push({ icon: '▲', label: `New Riser every ${risers.every} drops` });
        else if (risers && risers.start) modifiers.push({ icon: '▲', label: `${risers.start} Riser${risers.start > 1 ? 's' : ''}` });

        // Number Tide (GDD §3.1): each sector starts one tide higher. Pool values, favor and
        // board numbers in levels.js are written at Tide 0 and doubled per tide step.
        const tide = typeof data.tide === 'number' ? data.tide : sectorNum - 1;
        const scale = Math.pow(2, tide);
        const basePool = data.pool || { values: [1, 2, 3, 4], specials: 0.12 };
        const pool = {
            values: (basePool.values || [1, 2, 3, 4]).map((v) => v * scale),
            specials: basePool.specials || 0,
            favor: basePool.favor ? basePool.favor * scale : 0,
            pairBias: typeof basePool.pairBias === 'number' ? basePool.pairBias : (goal.type === 'big_orb' ? 0.45 : 0.2),
            tide
        };
        if (goal.type === 'collect' && !pool.values.includes(goal.number)) console.warn(`[levels] ${nodeLayout.id}: collect ${goal.number} is not in the pool`);

        const { cells, stars } = parseBoard(data.board);
        const setupBoard = function (grid, ROWS, COLS, createTile) {
            // One shared Null Core (2×2); each cell knows its corner so it's drawn once
            const coreCells = cells.filter((cell) => cell.type === 'null_core');
            const core = coreCells.length ? { hp: goal.type === 'null_core' ? goal.target : 12, maxHp: goal.type === 'null_core' ? goal.target : 12, flash: 0 } : null;
            const coreTop = coreCells.length ? Math.max(...coreCells.map((cell) => cell.rowFromBottom)) : 0;
            const coreLeft = coreCells.length ? Math.min(...coreCells.map((cell) => cell.c)) : 0;
            cells.forEach(({ rowFromBottom, c, value, type, riser }) => {
                const r = ROWS - 1 - rowFromBottom;
                if (r < 0 || c >= COLS) return;
                if (type === 'dark_matter') grid[r][c] = createTile(0, 'dark_matter');
                else if (type === 'static') grid[r][c] = createTile(0, 'static');
                else if (type === 'null_core') {
                    const t = createTile(0, 'null_core');
                    t.core = core;
                    t.part = `${rowFromBottom === coreTop ? 't' : 'b'}${c === coreLeft ? 'l' : 'r'}`;
                    grid[r][c] = t;
                } else {
                    grid[r][c] = createTile(value * scale);
                    if (riser) grid[r][c].riser = true;
                }
            });
        };
        // Star cells in board coordinates (they never move)
        const starCells = (ROWS) => stars.map(({ rowFromBottom, c }) => ({ r: ROWS - 1 - rowFromBottom, c, caught: false }));
        const maxDrops = goal.type === 'survive' ? goal.target : data.drops;

        return {
            id: nodeLayout.id,
            sectorNum,
            sectorName: sectorMeta.name,
            sectorColor: sectorMeta.color,
            title,
            desc: describeGoal(goal),
            isBoss,
            isBonus,
            maxDrops,
            goal,
            stars: starThresholds(maxDrops, goal),
            starCells,
            // One guided move for a mechanic's first appearance (GDD §6.4); the orb is scaled to the tide
            guide: data.guide ? { ...data.guide, orb: data.guide.orb === 'zero' ? 'zero' : data.guide.orb * scale } : null,
            temp: !!data.temp,
            planned: data.planned || null,
            rules: {
                fluxRate,
                pool,
                risers,
                modifiers
            },
            setupBoard
        };
    }

    /**
     * Returns full sector layout with connections for map rendering.
     */
    function getSectorGraph(sectorNum) {
        const sectorMeta = SECTOR_METADATA[sectorNum - 1] || SECTOR_METADATA[0];
        const layoutList = SECTOR_LAYOUTS[sectorNum - 1] || SECTOR_LAYOUTS[0];

        const nodes = layoutList.map(node => {
            const config = generateNodeConfig(sectorNum, node.id);
            return {
                ...node,
                config
            };
        });

        // Compute directed graph edges
        const links = [];
        for (let i = 0; i < layoutList.length; i++) {
            const current = layoutList[i];
            if (current.type === 'bonus') {
                // Connected to the node it branches off of
                links.push({ from: current.branchOf, to: current.id, isBonusBranch: true });
            } else {
                // Find next main node
                const nextMain = layoutList.slice(i + 1).find(n => n.type !== 'bonus');
                if (nextMain) {
                    links.push({ from: current.id, to: nextMain.id, isBonusBranch: false });
                }
            }
        }

        return {
            sectorMeta,
            nodes,
            links
        };
    }

    return {
        SECTOR_METADATA,
        SECTOR_LAYOUTS,
        NODE_ORDER,
        nodeOrder,
        LEVEL_DATA,
        HANDCRAFTED,
        GENERATED,
        GOAL_TYPES,
        starThresholds,
        starsForDropsLeft,
        describeGoal,
        parseBoard,
        generateNodeConfig,
        getSectorGraph
    };
}));
