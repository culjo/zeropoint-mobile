// Zero Point - Procedural Adventure Node Generator
// Deterministic, seed-based procedural level generator for the Constellation Map.

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.NodeGenerator = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // Simple Mulberry32 deterministic PRNG
    function createPRNG(seed) {
        let s = seed >>> 0;
        return function () {
            s |= 0; s = s + 0x6D2B79F5 | 0;
            let t = Math.imul(s ^ s >>> 15, 1 | s);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

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

    const NODE_TITLES = [
        ["Subatomic Spark", "Particle Pulse", "Charge Alignment", "Resonance Lock", "Flux Barrier", "Quantum Leap", "Ion Core", "Supernova Cradle", "Vortex Gate", "Singularity Breach"],
        ["Plasma Surge", "Nebula Drift", "Ion Cascade", "Charged Helix", "Solar Lattice", "Magnetar Pulse", "Chromosphere", "Fusion Conduit", "Corona Spark", "Hypernova Gate"],
        ["Graviton Well", "Dark Barrier", "Event Perimeter", "Singularity Trench", "Void Horizon", "Tidal Breach", "Relativistic Shear", "Photon Ring", "Accretion Wall", "The Zero Point Core"]
    ];

    // Node graph spatial layouts for each sector (10 main nodes + 2 bonus branch nodes)
    // Coordinates normalized (0 to 100 percentage in scroll viewport)
    const SECTOR_LAYOUTS = [
        // Sector 1
        [
            { id: '1-1', num: 1, x: 20, y: 88, type: 'start', branchOf: null },
            { id: '1-2', num: 2, x: 42, y: 82, type: 'normal', branchOf: null },
            { id: '1-3', num: 3, x: 68, y: 76, type: 'normal', branchOf: null },
            { id: '1-bonus-1', num: 'B1', x: 84, y: 66, type: 'bonus', branchOf: '1-3' },
            { id: '1-4', num: 4, x: 50, y: 66, type: 'normal', branchOf: null },
            { id: '1-5', num: 5, x: 26, y: 58, type: 'normal', branchOf: null },
            { id: '1-6', num: 6, x: 48, y: 50, type: 'normal', branchOf: null },
            { id: '1-bonus-2', num: 'B2', x: 74, y: 44, type: 'bonus', branchOf: '1-6' },
            { id: '1-7', num: 7, x: 30, y: 40, type: 'normal', branchOf: null },
            { id: '1-8', num: 8, x: 55, y: 32, type: 'normal', branchOf: null },
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
        ]
    ];

    /**
     * Deterministically generates full level rules and configuration for a node.
     * @param {number} sectorNum 1-based sector index (1, 2, 3...)
     * @param {string|number} nodeId Node identifier, e.g. '1-1' or '1-bonus-1'
     */
    function generateNodeConfig(sectorNum, nodeId) {
        const sectorMeta = SECTOR_METADATA[sectorNum - 1] || SECTOR_METADATA[0];
        const layoutList = SECTOR_LAYOUTS[sectorNum - 1] || SECTOR_LAYOUTS[0];
        const nodeLayout = layoutList.find(n => n.id === nodeId) || layoutList[0];

        // Hash node ID string into unique numeric seed
        let seed = sectorNum * 10000;
        for (let i = 0; i < nodeId.length; i++) {
            seed = (seed * 31 + nodeId.charCodeAt(i)) >>> 0;
        }
        const rng = createPRNG(seed);

        const isBoss = nodeLayout.type === 'boss';
        const isBonus = nodeLayout.type === 'bonus';
        const isStart = nodeLayout.type === 'start';
        const nodeNumIndex = typeof nodeLayout.num === 'number' ? nodeLayout.num - 1 : 4;

        // Title selection
        const sectorTitles = NODE_TITLES[sectorNum - 1] || NODE_TITLES[0];
        let title = sectorTitles[Math.min(nodeNumIndex, sectorTitles.length - 1)];
        if (isBonus) title = `Bonus: ${title}`;
        if (isBoss) title = `Sector Boss: ${title}`;

        // 1. Objective Selection
        let objectiveType = 'annihilations';
        let objectiveTarget = 3;
        let objectiveLabel = "Zero Blasts";
        let objectiveDesc = "";

        if (isBoss) {
            objectiveType = 'activate_frenzy';
            objectiveTarget = 1;
            objectiveLabel = "Overdrive Discharged";
            objectiveDesc = "Charge Overdrive to 100% & unleash Singularity Frenzy";
        } else if (isBonus) {
            // Bonus nodes focus on high-tier synthesis or laser feats
            const bonusRoll = rng();
            if (bonusRoll < 0.5) {
                objectiveType = 'trigger_laser';
                objectiveTarget = 1;
                objectiveLabel = "Cross Laser Fired";
                objectiveDesc = "Detonate a ±4+ pair for a Radiant Cross Laser";
            } else {
                objectiveType = 'synthesis_tier';
                objectiveTarget = 8;
                objectiveLabel = "+8 Orb Merged";
                objectiveDesc = "Synthesize particles to create a massive +8 Orb";
            }
        } else {
            // Main progression objectives based on node index
            if (nodeNumIndex <= 1) {
                objectiveType = 'annihilations';
                objectiveTarget = 3 + Math.floor(nodeNumIndex * 0.5);
                objectiveLabel = "Zero Blasts";
                objectiveDesc = `Trigger ${objectiveTarget} Zero Blasts (cancel opposite pairs)`;
            } else if (nodeNumIndex <= 3) {
                objectiveType = 'synthesis_tier';
                objectiveTarget = 4;
                objectiveLabel = "+4 Orb Merged";
                objectiveDesc = "Merge identical numbers to reach a +4 or higher orb";
            } else if (nodeNumIndex <= 5) {
                objectiveType = 'clear_dark_matter';
                objectiveTarget = 3 + Math.floor(nodeNumIndex * 0.5);
                objectiveLabel = "Dark Matter Shattered";
                objectiveDesc = `Shatter ${objectiveTarget} Dark Matter obstacle cores`;
            } else if (nodeNumIndex <= 7) {
                objectiveType = 'trigger_laser';
                objectiveTarget = 1;
                objectiveLabel = "Cross Laser Fired";
                objectiveDesc = "Fire a Cross Laser (Cancel a ±4 or higher pair)";
            } else {
                objectiveType = 'annihilations';
                objectiveTarget = 4 + (sectorNum - 1) * 2;
                objectiveLabel = "Zero Blasts";
                objectiveDesc = `Trigger ${objectiveTarget} Zero Blasts under rising flux pressure`;
            }
        }

        // 2. Modifiers & Launcher Rules
        const modifiers = [];
        let spawnPoolType = 'standard'; // 'standard', 'singles', 'high_energy', 'wildcards'
        let fluxRate = 0; // 0 = none, 6 = standard, 4 = turbulent

        if (isBonus) {
            spawnPoolType = rng() < 0.5 ? 'high_energy' : 'wildcards';
            if (spawnPoolType === 'high_energy') {
                modifiers.push({ icon: '⚡', label: 'High Energy Orbs (±2, ±4)' });
            } else {
                modifiers.push({ icon: '✨', label: 'Wildcard Orbs Active' });
            }
        } else if (isBoss) {
            fluxRate = 4;
            modifiers.push({ icon: '🔥', label: 'Turbulent Flux (Rising every 4 drops)' });
            modifiers.push({ icon: '⚡', label: '100% Overdrive Required' });
        } else {
            // Node-specific mutators
            if (nodeNumIndex >= 4) {
                fluxRate = 6;
                modifiers.push({ icon: '⏳', label: 'Rising Flux (Every 6 drops)' });
            }
            if (nodeNumIndex === 2 || nodeNumIndex === 6) {
                spawnPoolType = 'singles';
                modifiers.push({ icon: '🧩', label: 'Pure Singles (±1 only)' });
            } else if (nodeNumIndex === 5 && sectorNum > 1) {
                spawnPoolType = 'high_energy';
                modifiers.push({ icon: '⚡', label: 'High Energy (±2, ±4)' });
            }
        }

        // 3. Drop Budget & Star Criteria
        let maxDrops = Math.max(10, 16 - Math.floor(nodeNumIndex * 0.5) + (isBoss ? 4 : 0));
        let targetDropsForStar = Math.max(7, Math.floor(maxDrops * 0.72));
        let targetScoreForStar = Math.round((100 + nodeNumIndex * 25 + (sectorNum - 1) * 80) / 10) * 10;
        if (isBoss) targetScoreForStar = Math.round(targetScoreForStar * 1.5 / 10) * 10;

        // 4. Board Setup Generator
        const setupBoard = function (grid, ROWS, COLS, createTile) {
            const bRoll = rng();
            if (isStart) {
                // Easy starter board
                const pool = [1, -1, 2, -2, 1, -1];
                for (let c = 0; c < COLS; c++) {
                    grid[ROWS - 1][c] = createTile(pool[c % pool.length]);
                }
            } else if (objectiveType === 'clear_dark_matter') {
                // Dark matter row setup
                for (let c = 0; c < COLS; c++) {
                    grid[ROWS - 1][c] = createTile(c % 2 === 0 ? 2 : -2);
                    if (c >= 1 && c <= 4) {
                        grid[ROWS - 2][c] = createTile(0, 'dark_matter');
                    } else {
                        grid[ROWS - 2][c] = createTile(c % 2 === 0 ? -1 : 1);
                    }
                }
            } else if (objectiveType === 'trigger_laser' || isBonus) {
                // Pre-seeded high numbers ready for synthesis or laser
                grid[ROWS - 1][0] = createTile(4);
                grid[ROWS - 1][1] = createTile(-2);
                grid[ROWS - 1][2] = createTile(-2);
                grid[ROWS - 1][3] = createTile(3);
                grid[ROWS - 1][4] = createTile(-3);
                grid[ROWS - 1][5] = createTile(2);

                grid[ROWS - 2][0] = createTile(2);
                grid[ROWS - 2][1] = createTile(2);
                grid[ROWS - 2][4] = createTile(-2);
            } else if (isBoss) {
                for (let c = 0; c < COLS; c++) {
                    grid[ROWS - 1][c] = createTile(c % 2 === 0 ? 4 : -4);
                    if (c === 0 || c === COLS - 1) {
                        grid[ROWS - 2][c] = createTile(0, 'dark_matter');
                    } else {
                        grid[ROWS - 2][c] = createTile(c % 2 === 0 ? -2 : 2);
                    }
                }
            } else {
                // General procedural board
                for (let c = 0; c < COLS; c++) {
                    const val = (bRoll > 0.5 ? 1 : -1) * (Math.floor(rng() * 2) + 1);
                    grid[ROWS - 1][c] = createTile(val);
                    if (nodeNumIndex >= 3 && rng() > 0.4) {
                        grid[ROWS - 2][c] = createTile(-val);
                    }
                }
            }
        };

        return {
            id: nodeId,
            sectorNum,
            sectorName: sectorMeta.name,
            sectorColor: sectorMeta.color,
            title,
            desc: objectiveDesc,
            isBoss,
            isBonus,
            maxDrops,
            targetDropsForStar,
            targetScoreForStar,
            objective: {
                type: objectiveType,
                target: objectiveTarget,
                label: objectiveLabel
            },
            rules: {
                spawnPoolType,
                fluxRate,
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
        generateNodeConfig,
        getSectorGraph
    };
}));
