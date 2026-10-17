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
        // Sector 2
        [
            { id: '2-1', num: 1, x: 25, y: 88, type: 'start', branchOf: null },
            { id: '2-2', num: 2, x: 52, y: 80, type: 'normal', branchOf: null },
            { id: '2-3', num: 3, x: 75, y: 72, type: 'normal', branchOf: null },
            { id: '2-bonus-1', num: 'B1', x: 85, y: 60, type: 'bonus', branchOf: '2-3' },
            { id: '2-4', num: 4, x: 45, y: 64, type: 'normal', branchOf: null },
            { id: '2-5', num: 5, x: 22, y: 56, type: 'normal', branchOf: null },
            { id: '2-6', num: 6, x: 45, y: 48, type: 'normal', branchOf: null },
            { id: '2-bonus-2', num: 'B2', x: 20, y: 38, type: 'bonus', branchOf: '2-5' },
            { id: '2-7', num: 7, x: 70, y: 40, type: 'normal', branchOf: null },
            { id: '2-8', num: 8, x: 48, y: 32, type: 'normal', branchOf: null },
            { id: '2-9', num: 9, x: 30, y: 22, type: 'normal', branchOf: null },
            { id: '2-10', num: 10, x: 50, y: 12, type: 'boss', branchOf: null }
        ],
        // Sector 3 (its own IDs; it used to fall back to Sector 1's and clash in saves)
        [
            { id: '3-1', num: 1, x: 75, y: 88, type: 'start', branchOf: null },
            { id: '3-2', num: 2, x: 48, y: 80, type: 'normal', branchOf: null },
            { id: '3-3', num: 3, x: 25, y: 72, type: 'normal', branchOf: null },
            { id: '3-bonus-1', num: 'B1', x: 15, y: 60, type: 'bonus', branchOf: '3-3' },
            { id: '3-4', num: 4, x: 55, y: 64, type: 'normal', branchOf: null },
            { id: '3-5', num: 5, x: 78, y: 56, type: 'normal', branchOf: null },
            { id: '3-6', num: 6, x: 55, y: 48, type: 'normal', branchOf: null },
            { id: '3-bonus-2', num: 'B2', x: 80, y: 38, type: 'bonus', branchOf: '3-6' },
            { id: '3-7', num: 7, x: 30, y: 40, type: 'normal', branchOf: null },
            { id: '3-8', num: 8, x: 52, y: 32, type: 'normal', branchOf: null },
            { id: '3-9', num: 9, x: 70, y: 22, type: 'normal', branchOf: null },
            { id: '3-10', num: 10, x: 50, y: 12, type: 'boss', branchOf: null }
        ]
    ];

    // Level data lives in levels.js (fixed data, GDD §5.3)
    const LEVEL_DATA = (typeof module === 'object' && module.exports)
        ? require('./levels.js').LEVELS
        : ((typeof NullfallLevels !== 'undefined' && NullfallLevels.LEVELS) || {});

    // Goals the game can play today; anything else needs a stand-in (see levels.js `temp`)
    const GOAL_TYPES = ['zero_out', 'collect', 'break_cores'];

    // Stars from drops left: ★★ at ≥25%, ★★★ at ≥45%, rounded up to whole drops
    function starThresholds(drops) {
        return { two: Math.ceil(drops * 0.25), three: Math.ceil(drops * 0.45) };
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
        return 'Complete the goal';
    }

    // Board rows (top to bottom) are aligned to the bottom of the grid
    function parseBoard(rows) {
        const cells = [];
        const lines = rows || [];
        lines.forEach((line, i) => {
            const rowFromBottom = lines.length - 1 - i;
            String(line).trim().split(/\s+/).forEach((tok, c) => {
                if (tok === '.' || tok === '') return;
                if (tok === 'D') cells.push({ rowFromBottom, c, value: 0, type: 'dark_matter' });
                else cells.push({ rowFromBottom, c, value: parseInt(tok, 10), type: 'number' });
            });
        });
        return cells;
    }

    /**
     * Builds the playable config for a node from its level data.
     * @param {number} sectorNum 1-based sector index (1, 2, 3...)
     * @param {string} nodeId Node identifier, e.g. '1-1' or '1-bonus-1'
     */
    function generateNodeConfig(sectorNum, nodeId) {
        const sectorMeta = SECTOR_METADATA[sectorNum - 1] || SECTOR_METADATA[0];
        const layoutList = SECTOR_LAYOUTS[sectorNum - 1] || SECTOR_LAYOUTS[0];
        const nodeLayout = layoutList.find(n => n.id === nodeId) || layoutList[0];
        const data = LEVEL_DATA[nodeLayout.id] || { title: `Node ${nodeLayout.id}`, goal: { type: 'zero_out', target: 10 }, drops: 14, temp: true, planned: 'missing level data' };

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

        const cells = parseBoard(data.board);
        const setupBoard = function (grid, ROWS, COLS, createTile) {
            cells.forEach(({ rowFromBottom, c, value, type }) => {
                const r = ROWS - 1 - rowFromBottom;
                if (r < 0 || c >= COLS) return;
                grid[r][c] = type === 'dark_matter' ? createTile(0, 'dark_matter') : createTile(value);
            });
        };

        return {
            id: nodeLayout.id,
            sectorNum,
            sectorName: sectorMeta.name,
            sectorColor: sectorMeta.color,
            title,
            desc: describeGoal(goal),
            isBoss,
            isBonus,
            maxDrops: data.drops,
            goal,
            stars: starThresholds(data.drops),
            temp: !!data.temp,
            planned: data.planned || null,
            rules: {
                fluxRate,
                pool: data.pool || { values: [1, 2, 3, 4], specials: 0.12 },
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
        GOAL_TYPES,
        starThresholds,
        starsForDropsLeft,
        describeGoal,
        parseBoard,
        generateNodeConfig,
        getSectorGraph
    };
}));
