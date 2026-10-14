/**
 * ZERO POINT — Quantum Math Cascade
 * Core Game Engine
 */

(function () {
    'use strict';

    // Game Constants
    const COLS = 6;
    const ROWS = 8;
    const DANGER_ROW = 1; // Row index where warning fires (0 is game over top)
    const MOVES_PER_RISE = 5;

    // Canvas & Rendering Context
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('canvas-container');

    // Screens & Views
    const screenHome = document.getElementById('screen-home');
    const screenAdventureNodes = document.getElementById('screen-adventure-nodes');
    const screenChallenges = document.getElementById('screen-challenges');
    const screenAdventureMap = document.getElementById('screen-adventure-map') || screenChallenges;
    const screenGame = document.getElementById('screen-game');
    const screenCodex = document.getElementById('screen-codex');

    // Modals
    const modalPause = document.getElementById('modal-pause');
    const modalVictory = document.getElementById('modal-victory');
    const modalSettings = document.getElementById('modal-settings');
    const modalGameOver = document.getElementById('modal-gameover');
    const modalNodePreview = document.getElementById('modal-node-preview');

    // Home Screen DOM Elements
    const btnHomeSound = document.getElementById('btn-home-sound');
    const btnHomeSettings = document.getElementById('btn-home-settings');
    const homeBestPill = document.getElementById('home-best-pill');
    const homeStarsPill = document.getElementById('home-stars-pill');
    const cardPlayClassic = document.getElementById('card-play-classic');
    const cardPlayAdventure = document.getElementById('card-play-adventure');
    const cardPlayChallenges = document.getElementById('card-play-challenges');
    const homeCardHighscore = document.getElementById('home-card-highscore');
    const homeCardStars = document.getElementById('home-card-stars');
    const homeCardChallengeStars = document.getElementById('home-card-challenge-stars');
    const btnOpenCodex = document.getElementById('btn-open-codex');
    const btnOpenSettings = document.getElementById('btn-open-settings');

    // Interactive Tutorial DOM Elements
    const btnHomeTutorial = document.getElementById('btn-home-tutorial');
    const btnCodexTutorial = document.getElementById('btn-codex-tutorial');
    const tutorialCard = document.getElementById('tutorial-card');
    const tutorialStepBadge = document.getElementById('tutorial-step-badge');
    const tutorialTitle = document.getElementById('tutorial-title');
    const tutorialDesc = document.getElementById('tutorial-desc');

    // Adventure Constellation Nodes DOM Elements
    const btnAdvNodesBack = document.getElementById('btn-adv-nodes-back');
    const advNodesSectorBadge = document.getElementById('adv-nodes-sector-badge');
    const advNodesSectorTitle = document.getElementById('adv-nodes-sector-title');
    const advNodesStarsPill = document.getElementById('adv-nodes-stars-pill');
    const btnPrevSector = document.getElementById('btn-prev-sector');
    const btnNextSector = document.getElementById('btn-next-sector');
    const sectorIndicatorText = document.getElementById('sector-indicator-text');
    const advMapViewport = document.getElementById('adv-map-viewport');
    const advMapSvg = document.getElementById('adv-map-svg');
    const advMapNodesLayer = document.getElementById('adv-map-nodes-layer');

    // Challenges DOM Elements
    const btnChallengesToHome = document.getElementById('btn-challenges-to-home') || document.getElementById('btn-adv-to-home');
    const challengesHeaderStars = document.getElementById('challenges-header-stars') || document.getElementById('adv-header-stars');
    const challengesLevelsGrid = document.getElementById('challenges-levels-grid') || document.getElementById('adventure-levels-grid');
    const btnAdvToHome = document.getElementById('btn-adv-to-home');
    const advHeaderStars = document.getElementById('adv-header-stars');
    const adventureLevelsGrid = document.getElementById('adventure-levels-grid');

    // Node Preview Modal DOM Elements
    const nodePreviewSectorBadge = document.getElementById('node-preview-sector-badge');
    const nodePreviewIdBadge = document.getElementById('node-preview-id-badge');
    const nodePreviewTitle = document.getElementById('node-preview-title');
    const nodePreviewDesc = document.getElementById('node-preview-desc');
    const nodePreviewModifiers = document.getElementById('node-preview-modifiers');
    const starStatus1 = document.getElementById('star-status-1');
    const starStatus2 = document.getElementById('star-status-2');
    const starStatus3 = document.getElementById('star-status-3');
    const starDesc2 = document.getElementById('star-desc-2');
    const starDesc3 = document.getElementById('star-desc-3');
    const nodeBestScore = document.getElementById('node-best-score');
    const nodeBestDrops = document.getElementById('node-best-drops');
    const btnLaunchNode = document.getElementById('btn-launch-node');
    const btnCloseNodePreview = document.getElementById('btn-close-node-preview');

    // Game Arena Header & Stats
    const gameModeDisplay = document.getElementById('game-mode-display');
    const gameModeSub = document.getElementById('game-mode-sub');
    const btnPause = document.getElementById('btn-pause');
    const btnSound = document.getElementById('btn-sound');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const iconExpand = document.getElementById('icon-expand');
    const iconCompress = document.getElementById('icon-compress');
    const btnRestart = document.getElementById('btn-restart');
    const appEl = document.getElementById('app');

    const scoreVal = document.getElementById('score-val');
    const bestVal = document.getElementById('best-val');
    const bestLabel = document.getElementById('best-label');
    const comboVal = document.getElementById('combo-val');
    const turnCounterLabel = document.getElementById('turn-counter-label');
    const riseCounter = document.getElementById('rise-counter');
    const riseStatusBar = document.getElementById('rise-status-bar');
    const holdSlot = document.getElementById('hold-slot');
    const holdText = document.getElementById('hold-text');
    const nextSlot1 = document.getElementById('next-slot-1');
    const nextSlot2 = document.getElementById('next-slot-2');

    // Adventure Objective HUD
    const adventureObjectiveCard = document.getElementById('adventure-objective-card');
    const advObjStars = document.getElementById('adv-obj-stars');
    const advObjDesc = document.getElementById('adv-obj-desc');
    const advObjProgress = document.getElementById('adv-obj-progress');
    const advObjFill = document.getElementById('adv-obj-fill');

    // Tactical Bounty Card (Classic)
    const bountyCard = document.getElementById('bounty-card');
    const bountyName = document.getElementById('bounty-name');
    const bountyReward = document.getElementById('bounty-reward');
    const bountyDesc = document.getElementById('bounty-desc');
    const bountyProgressText = document.getElementById('bounty-progress-text');
    const bountyProgressFill = document.getElementById('bounty-progress-fill');

    // Overdrive & Swaps
    const overdriveContainer = document.getElementById('overdrive-container');
    const overdrivePercent = document.getElementById('overdrive-percent');
    const overdriveFill = document.getElementById('overdrive-fill');
    const btnOverdrive = document.getElementById('btn-overdrive');
    const btnSwapToken = document.getElementById('btn-swap-token');
    const swapTokenCount = document.getElementById('swap-token-count');
    const swapBanner = document.getElementById('swap-banner');

    // Touch Controls
    const btnTouchHold = document.getElementById('btn-touch-hold');
    const btnTouchDrop = document.getElementById('btn-touch-drop');
    const btnTouchFrenzy = document.getElementById('btn-touch-frenzy');
    const btnTouchSwap = document.getElementById('btn-touch-swap');

    // Pause Modal
    const pauseModeName = document.getElementById('pause-mode-name');
    const pauseModeDetail = document.getElementById('pause-mode-detail');
    const btnPauseResume = document.getElementById('btn-pause-resume');
    const btnPauseRestart = document.getElementById('btn-pause-restart');
    const btnPauseCodex = document.getElementById('btn-pause-codex');
    const btnPauseSettings = document.getElementById('btn-pause-settings');
    const btnPauseQuit = document.getElementById('btn-pause-quit');

    // Victory Modal
    const victoryTitle = document.getElementById('victory-title');
    const victoryStarsContainer = document.getElementById('victory-stars-container');
    const vicScore = document.getElementById('vic-score');
    const vicDrops = document.getElementById('vic-drops');
    const vicBonus = document.getElementById('vic-bonus');
    const vicCascade = document.getElementById('vic-cascade');
    const btnVicNext = document.getElementById('btn-vic-next');
    const btnVicReplay = document.getElementById('btn-vic-replay');
    const btnVicMap = document.getElementById('btn-vic-map');

    // Settings Modal
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnSettingsSave = document.getElementById('btn-settings-save');
    const settingSfxToggle = document.getElementById('setting-sfx-toggle');
    const settingBgmToggle = document.getElementById('setting-bgm-toggle');
    const settingVibrationToggle = document.getElementById('setting-vibration-toggle');
    const settingShakeSelect = document.getElementById('setting-shake-select');
    const btnResetData = document.getElementById('btn-reset-data');

    // Codex Elements
    const btnCodexToHome = document.getElementById('btn-codex-to-home');
    const btnCodexClose = document.getElementById('btn-codex-close');

    // Game Over Actions
    const btnPlayAgain = document.getElementById('btn-play-again');
    const btnGoMenu = document.getElementById('btn-go-menu');

    // Sector 1: Subatomic Genesis Adventure Levels
    const ADVENTURE_LEVELS = [
        {
            id: 0,
            isTutorial: true,
            title: "Academy Flight Training",
            sector: "Tutorial",
            desc: "Learn Zero Blasts, Merging, Cross Lasers & Tactics step-by-step",
            maxDrops: 99,
            targetDropsForStar: 99,
            targetScoreForStar: 50,
            objective: {
                type: 'tutorial',
                target: 4,
                label: "Training Steps"
            }
        },
        {
            id: 1,
            title: "Subatomic Spark",
            sector: "Sector 01-1",
            desc: "Trigger 3 Zero Blasts (Cancel opposites to zero)",
            maxDrops: 15,
            targetDropsForStar: 10,
            targetScoreForStar: 120,
            objective: {
                type: 'annihilations',
                target: 3,
                label: "Zero Blasts"
            },
            setupBoard: (g) => {
                const pool = [1, -1, 2, -2, 1, -1];
                for (let c = 0; c < COLS; c++) {
                    g[ROWS - 1][c] = createTile(pool[c % pool.length]);
                    g[ROWS - 2][c] = createTile(c % 2 === 0 ? 2 : -2);
                }
            }
        },
        {
            id: 2,
            title: "Double Merge",
            sector: "Sector 01-2",
            desc: "Merge same numbers to reach a +4 or higher orb",
            maxDrops: 14,
            targetDropsForStar: 9,
            targetScoreForStar: 160,
            objective: {
                type: 'synthesis_tier',
                target: 4,
                label: "+4 Orb Merged"
            },
            setupBoard: (g) => {
                for (let c = 0; c < COLS; c++) {
                    g[ROWS - 1][c] = createTile(c % 2 === 0 ? 2 : 1);
                    g[ROWS - 2][c] = createTile(c % 2 === 0 ? 2 : 1);
                }
            }
        },
        {
            id: 3,
            title: "Dark Matter Breach",
            sector: "Sector 01-3",
            desc: "Shatter all 4 Dark Matter obstacles",
            maxDrops: 18,
            targetDropsForStar: 12,
            targetScoreForStar: 220,
            objective: {
                type: 'clear_dark_matter',
                target: 4,
                label: "Dark Matter Shattered"
            },
            setupBoard: (g) => {
                for (let c = 0; c < COLS; c++) {
                    g[ROWS - 1][c] = createTile(c % 2 === 0 ? 2 : -2);
                    if (c >= 1 && c <= 4) {
                        g[ROWS - 2][c] = createTile(0, 'dark_matter');
                    } else {
                        g[ROWS - 2][c] = createTile(c % 2 === 0 ? -1 : 1);
                    }
                }
            }
        },
        {
            id: 4,
            title: "Cross Laser Ignition",
            sector: "Sector 01-4",
            desc: "Fire a Cross Laser (Cancel a ±4 or higher pair)",
            maxDrops: 16,
            targetDropsForStar: 11,
            targetScoreForStar: 260,
            objective: {
                type: 'trigger_laser',
                target: 1,
                label: "Cross Laser Fired"
            },
            setupBoard: (g) => {
                g[ROWS - 1][0] = createTile(4);
                g[ROWS - 1][1] = createTile(-2);
                g[ROWS - 1][2] = createTile(-2);
                g[ROWS - 1][3] = createTile(3);
                g[ROWS - 1][4] = createTile(-3);
                g[ROWS - 1][5] = createTile(2);

                g[ROWS - 2][0] = createTile(2);
                g[ROWS - 2][1] = createTile(2);
                g[ROWS - 2][4] = createTile(-2);
            }
        },
        {
            id: 5,
            title: "Singularity Overdrive",
            sector: "Sector 01-Boss",
            desc: "Charge Overdrive to 100% & unleash Singularity Frenzy",
            maxDrops: 20,
            targetDropsForStar: 14,
            targetScoreForStar: 350,
            objective: {
                type: 'activate_frenzy',
                target: 1,
                label: "Unleash Singularity Frenzy"
            },
            setupBoard: (g) => {
                for (let c = 0; c < COLS; c++) {
                    g[ROWS - 1][c] = createTile(c % 2 === 0 ? 4 : -4);
                    if (c === 0 || c === 5) {
                        g[ROWS - 2][c] = createTile(0, 'dark_matter');
                    } else {
                        g[ROWS - 2][c] = createTile(c % 2 === 0 ? -2 : 2);
                    }
                }
            }
        }
    ];

    // Career Persistence Functions
    function loadCareerData() {
        const defaultCareer = {
            highScore: 0,
            unlockedLevel: 1, // for Challenges
            levelStars: {},
            levelHighScores: {},
            adventureNodes: {}, // { [nodeId]: { cleared: true, stars: 3, bestScore: 210, bestDrops: 5 } }
            unlockedNodes: ['1-1'],
            currentSector: 1,
            settings: {
                sfx: true,
                bgm: true,
                vibration: true,
                shake: 'high'
            }
        };

        try {
            const raw = localStorage.getItem('zeropoint_career');
            if (raw) {
                const parsed = JSON.parse(raw);
                return {
                    ...defaultCareer,
                    ...parsed,
                    adventureNodes: parsed.adventureNodes || {},
                    unlockedNodes: (parsed.unlockedNodes && parsed.unlockedNodes.length > 0) ? parsed.unlockedNodes : ['1-1'],
                    currentSector: parsed.currentSector || 1,
                    settings: { ...defaultCareer.settings, ...(parsed.settings || {}) }
                };
            }
            // Backward compatibility with legacy key
            const legacyBest = parseInt(localStorage.getItem('zeropoint_highscore') || '0', 10);
            if (legacyBest > 0) {
                defaultCareer.highScore = legacyBest;
            }
        } catch (e) {
            console.warn('Could not parse career data from storage', e);
        }
        return defaultCareer;
    }

    function saveCareerData() {
        try {
            localStorage.setItem('zeropoint_career', JSON.stringify(career));
            localStorage.setItem('zeropoint_highscore', (career.highScore || 0).toString());
        } catch (e) {
            console.warn('Could not save career data', e);
        }
        updateCareerDisplays();
    }

    function getTotalStars() {
        if (!career || !career.levelStars) return 0;
        let total = 0;
        ADVENTURE_LEVELS.forEach(lvl => {
            if (!lvl.isTutorial) {
                total += (career.levelStars[lvl.id] || 0);
            }
        });
        return total;
    }

    function getNodeTotalStars() {
        if (!career || !career.adventureNodes) return 0;
        let total = 0;
        Object.values(career.adventureNodes).forEach(node => {
            if (node && node.stars) total += node.stars;
        });
        return total;
    }

    function getClearedNodesCount() {
        if (!career || !career.adventureNodes) return 0;
        return Object.values(career.adventureNodes).filter(n => n && n.cleared).length;
    }

    function updateCareerDisplays() {
        const totalChallengeStars = getTotalStars();
        const campaignLevels = ADVENTURE_LEVELS.filter(lvl => !lvl.isTutorial);
        const maxChallengeStars = campaignLevels.length * 3;
        const totalNodeStars = getNodeTotalStars();
        const clearedNodes = getClearedNodesCount();
        const best = career.highScore || 0;

        if (homeBestPill) homeBestPill.textContent = `🏆 Best: ${best.toLocaleString()} pts`;
        if (homeStarsPill) homeStarsPill.textContent = `⭐ ${totalNodeStars} Stars (${clearedNodes} Nodes)`;
        if (homeCardHighscore) homeCardHighscore.textContent = `Best: ${best.toLocaleString()}`;
        if (homeCardStars) homeCardStars.textContent = `⭐ ${totalNodeStars} Stars (${clearedNodes} Cleared)`;
        if (homeCardChallengeStars) homeCardChallengeStars.textContent = `⭐ ${totalChallengeStars} / ${maxChallengeStars}`;
        if (challengesHeaderStars) challengesHeaderStars.textContent = `⭐ ${totalChallengeStars} / ${maxChallengeStars}`;
        if (advHeaderStars) advHeaderStars.textContent = `⭐ ${totalChallengeStars} / ${maxChallengeStars}`;
        if (advNodesStarsPill) advNodesStarsPill.textContent = `⭐ ${totalNodeStars} Stars`;

        if (settingSfxToggle && career.settings) settingSfxToggle.checked = !!career.settings.sfx;
        if (settingBgmToggle && career.settings) settingBgmToggle.checked = !!career.settings.bgm;
        if (settingVibrationToggle && career.settings) settingVibrationToggle.checked = career.settings.vibration !== false;
        if (settingShakeSelect && career.settings) settingShakeSelect.value = career.settings.shake || 'high';
    }

    // Career & Navigation State
    let career = loadCareerData();
    let currentScreen = 'home'; // 'home' | 'adventure-map' | 'game' | 'codex'
    let codexPreviousScreen = 'home';
    let isPaused = false;
    let isTutorial = false;
    let tutorialStep = 1;
    let tutorialTargetCol = 2;
    let tutorialStepCompleted = false;
    let gameMode = 'classic'; // 'classic' | 'adventure'
    let activeAdventureLevel = null;
    let adventureProgress = 0;
    let adventureObjectiveMet = false;
    let dropsUsed = 0;
    let maxDrops = 15;

    // Game Arena State
    let grid = []; // 2D array [row][col]
    let score = 0;
    let combo = 1;
    let maxCombo = 1;
    let totalZeroPoints = 0;
    let movesUntilRise = MOVES_PER_RISE;
    let isGameOver = false;
    let isProcessing = false; // true during animations/cascades
    let aimCol = 2; // Selected column (0..5)
    let canHold = true;

    // Overdrive Frenzy State
    let overdriveCharge = 0; // 0 to 100
    let isOverdriveReady = false;
    let isFrenzyActive = false;
    let frenzyTurnsRemaining = 0;
    let pendingOverdriveActivation = false;
    let frenzySpecialIndex = 0;
    const FRENZY_SPECIALS = [
        { type: 'special', subType: 'blackhole', label: '⚫ VORTEX' },
        { type: 'special', subType: 'supernova_core', label: '🌟 NOVA' },
        { type: 'special', subType: 'antimatter_nuke', label: '💥 NUKE' }
    ];

    // Quantum Swap State
    let swapTokens = 1;
    const maxSwapTokens = 3;
    let isSwapModeActive = false;
    let firstSwapTile = null; // { r, c }
    let dropsSinceSwapCharge = 0;

    // Tactical Bounties
    let currentBounty = null;

    // Tactical Orbs
    let currentOrb = null;
    let heldOrb = null;
    let nextQueue = [];

    // Falling Projectile Animation
    let activeProjectile = null; // { col, startY, targetY, y, vy, orb, targetRow, isImpact }

    // Visual Effects & Active Dynamic Animations
    let activeMergeAnimations = [];
    let activeZeroPointCollapses = [];
    let particles = [];
    let shockwaves = [];
    let laserBeams = [];
    let screenFlash = 0;
    let screenFlashColor = '#ffffff';
    let floatingTexts = [];
    let screenShake = 0;

    // Rendering Metrics
    let cellW = 0;
    let cellH = 0;
    let boardOffsetX = 0;
    let boardOffsetY = 0;
    let dpr = window.devicePixelRatio || 1;

    // Audio helper
    const sfx = window.soundFX;

    // Initialization
    // Screen Navigation & Flows
    let currentViewingSector = 1;
    let pendingNodeConfig = null;

    function showScreen(screenId) {
        currentScreen = screenId;
        const screens = [screenHome, screenAdventureNodes, screenChallenges, screenAdventureMap, screenGame, screenCodex];
        screens.forEach(s => {
            if (s) s.classList.remove('active');
        });

        if (screenId !== 'game' && isTutorial) {
            isTutorial = false;
            if (tutorialCard) tutorialCard.style.display = 'none';
        }

        if (screenId === 'home') {
            if (screenHome) screenHome.classList.add('active');
            updateCareerDisplays();
        } else if (screenId === 'adventure-nodes' || screenId === 'adventure-map') {
            if (screenAdventureNodes) screenAdventureNodes.classList.add('active');
            renderAdventureNodeMap(career.currentSector || 1);
        } else if (screenId === 'challenges') {
            if (screenChallenges) screenChallenges.classList.add('active');
            else if (screenAdventureMap) screenAdventureMap.classList.add('active');
            renderChallenges();
        } else if (screenId === 'game') {
            if (screenGame) screenGame.classList.add('active');
            setTimeout(resizeCanvas, 60);
        } else if (screenId === 'codex') {
            if (screenCodex) screenCodex.classList.add('active');
        }

        syncAudioUI();
    }

    // ==========================================================
    // CONSTELLATION NODE MAP RENDERER
    // ==========================================================
    function renderAdventureNodeMap(sectorNum = 1) {
        if (!advMapNodesLayer || !advMapSvg || typeof NodeGenerator === 'undefined') return;

        currentViewingSector = sectorNum;
        career.currentSector = sectorNum;

        const graph = NodeGenerator.getSectorGraph(sectorNum);
        const sectorMeta = graph.sectorMeta;

        if (advNodesSectorBadge) advNodesSectorBadge.textContent = `SECTOR 0${sectorNum}`;
        if (advNodesSectorTitle) advNodesSectorTitle.textContent = sectorMeta.name;
        if (sectorIndicatorText) sectorIndicatorText.textContent = `Sector ${sectorNum} of ${NodeGenerator.SECTOR_METADATA.length}`;

        if (btnPrevSector) btnPrevSector.disabled = sectorNum <= 1;
        if (btnNextSector) btnNextSector.disabled = sectorNum >= NodeGenerator.SECTOR_METADATA.length;

        // Clear existing nodes and SVG links
        advMapNodesLayer.innerHTML = '';
        advMapSvg.innerHTML = '';

        // Unlocked node IDs set
        const unlockedSet = new Set(career.unlockedNodes || ['1-1']);
        unlockedSet.add('1-1'); // Root node is always unlocked

        // Draw SVG Links first
        const nodeMap = new Map();
        graph.nodes.forEach(n => nodeMap.set(n.id, n));

        graph.links.forEach(link => {
            const fromNode = nodeMap.get(link.from);
            const toNode = nodeMap.get(link.to);
            if (!fromNode || !toNode) return;

            const isToUnlocked = unlockedSet.has(toNode.id);
            const isFromCleared = career.adventureNodes && career.adventureNodes[fromNode.id]?.cleared;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', `${fromNode.x}%`);
            line.setAttribute('y1', `${fromNode.y}%`);
            line.setAttribute('x2', `${toNode.x}%`);
            line.setAttribute('y2', `${toNode.y}%`);

            if (link.isBonusBranch) {
                line.setAttribute('class', 'map-link-bonus');
            } else if (isFromCleared && isToUnlocked) {
                line.setAttribute('class', 'map-link-active');
            } else {
                line.setAttribute('class', 'map-link-locked');
            }
            advMapSvg.appendChild(line);
        });

        // Draw Nodes
        graph.nodes.forEach(node => {
            const isCleared = career.adventureNodes && career.adventureNodes[node.id]?.cleared;
            const nodeData = career.adventureNodes ? career.adventureNodes[node.id] : null;
            const stars = nodeData ? (nodeData.stars || 0) : 0;
            const isUnlocked = unlockedSet.has(node.id) || isCleared;
            const isCurrent = isUnlocked && !isCleared;

            const nodeEl = document.createElement('div');
            let classList = `map-node ${isUnlocked ? 'node-unlocked' : 'node-locked'}`;
            if (isCurrent) classList += ' node-current';
            if (isCleared) classList += ' node-cleared';
            if (node.type === 'bonus') classList += ' node-bonus';
            if (node.type === 'boss') classList += ' node-boss';
            nodeEl.className = classList;

            nodeEl.style.left = `${node.x}%`;
            nodeEl.style.top = `${node.y}%`;

            let displayNum = node.num;
            if (node.type === 'boss') displayNum = '👑';
            else if (node.type === 'bonus') displayNum = '✦';

            let starBadgeHtml = '';
            if (isCleared && stars > 0) {
                const starsStr = [1, 2, 3].map(i => i <= stars ? '⭐' : '☆').join('');
                starBadgeHtml = `<div class="node-star-badge">${starsStr}</div>`;
            }

            nodeEl.innerHTML = `
                <span class="node-label-pill">${node.id}</span>
                <span class="node-num-label">${!isUnlocked ? '🔒' : displayNum}</span>
                ${starBadgeHtml}
            `;

            if (isUnlocked) {
                nodeEl.addEventListener('click', () => {
                    sfx.init();
                    sfx.playMove();
                    triggerHaptic('tick');
                    openNodePreview(node.config);
                });
            }

            advMapNodesLayer.appendChild(nodeEl);
        });

        updateCareerDisplays();

        // Auto-scroll to active node or bottom
        setTimeout(() => {
            if (advMapViewport) {
                const currentNodeEl = advMapNodesLayer.querySelector('.node-current');
                if (currentNodeEl) {
                    const topPos = currentNodeEl.offsetTop - (advMapViewport.clientHeight / 2);
                    advMapViewport.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
                } else {
                    advMapViewport.scrollTo({ top: advMapViewport.scrollHeight, behavior: 'smooth' });
                }
            }
        }, 80);
    }

    function openNodePreview(config) {
        if (!modalNodePreview || !config) return;
        pendingNodeConfig = config;

        const nodeData = career.adventureNodes ? career.adventureNodes[config.id] : null;
        const stars = nodeData ? (nodeData.stars || 0) : 0;

        if (nodePreviewSectorBadge) nodePreviewSectorBadge.textContent = `SECTOR 0${config.sectorNum}`;
        if (nodePreviewIdBadge) nodePreviewIdBadge.textContent = `NODE ${config.id.toUpperCase()}`;
        if (nodePreviewTitle) nodePreviewTitle.textContent = config.title;
        if (nodePreviewDesc) nodePreviewDesc.textContent = config.desc;

        // Modifiers list
        if (nodePreviewModifiers) {
            nodePreviewModifiers.innerHTML = '';
            const mods = config.rules?.modifiers || [];
            if (mods.length === 0) {
                const standardMod = document.createElement('span');
                standardMod.className = 'node-modifier-pill';
                standardMod.innerHTML = '⚛️ Standard Equilibrium';
                nodePreviewModifiers.appendChild(standardMod);
            } else {
                mods.forEach(m => {
                    const pill = document.createElement('span');
                    pill.className = 'node-modifier-pill';
                    pill.innerHTML = `${m.icon} ${m.label}`;
                    nodePreviewModifiers.appendChild(pill);
                });
            }
        }

        // Star targets
        if (starDesc2) starDesc2.textContent = `Finish within ${config.targetDropsForStar} Drops`;
        if (starDesc3) starDesc3.textContent = `Score ${config.targetScoreForStar}+ Points`;

        if (starStatus1) starStatus1.textContent = stars >= 1 ? '⭐' : '☆';
        if (starStatus2) starStatus2.textContent = stars >= 2 ? '⭐' : '☆';
        if (starStatus3) starStatus3.textContent = stars >= 3 ? '⭐' : '☆';

        const row1 = document.getElementById('target-star-1');
        const row2 = document.getElementById('target-star-2');
        const row3 = document.getElementById('target-star-3');
        if (row1) row1.className = `star-target-row ${stars >= 1 ? 'achieved' : ''}`;
        if (row2) row2.className = `star-target-row ${stars >= 2 ? 'achieved' : ''}`;
        if (row3) row3.className = `star-target-row ${stars >= 3 ? 'achieved' : ''}`;

        // Records
        if (nodeBestScore) nodeBestScore.textContent = nodeData && nodeData.bestScore ? `${nodeData.bestScore.toLocaleString()} pts` : '-';
        if (nodeBestDrops) nodeBestDrops.textContent = nodeData && nodeData.bestDrops ? `${nodeData.bestDrops} drops` : '-';

        modalNodePreview.classList.add('visible');
    }

    function startNodeLevel(config) {
        if (!config) return;
        gameMode = 'adventure';
        isTutorial = false;
        activeAdventureLevel = config;
        adventureProgress = 0;
        adventureObjectiveMet = false;
        dropsUsed = 0;
        maxDrops = config.maxDrops;
        isGameOver = false;
        isPaused = false;

        if (modalPause) modalPause.classList.remove('visible');
        if (modalVictory) modalVictory.classList.remove('visible');
        if (modalGameOver) modalGameOver.classList.remove('visible');
        if (modalNodePreview) modalNodePreview.classList.remove('visible');

        if (gameModeDisplay) gameModeDisplay.textContent = `NODE ${config.id}`;
        if (gameModeSub) gameModeSub.textContent = config.title;
        if (bountyCard) bountyCard.style.display = 'none';
        if (adventureObjectiveCard) adventureObjectiveCard.style.display = 'block';
        if (tutorialCard) tutorialCard.style.display = 'none';
        if (advObjDesc) advObjDesc.textContent = config.desc;
        if (bestLabel) bestLabel.textContent = 'Node Best';
        const nodeRecord = career.adventureNodes ? career.adventureNodes[config.id] : null;
        const nodeBest = nodeRecord && nodeRecord.bestScore ? nodeRecord.bestScore : 0;
        if (bestVal) bestVal.textContent = nodeBest.toLocaleString();
        if (turnCounterLabel) turnCounterLabel.textContent = config.rules?.fluxRate ? 'Rising In' : 'Drops Left';

        showScreen('game');
        startNewGame();

        if (config.setupBoard) {
            grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
            config.setupBoard(grid, ROWS, COLS, createTile);
        }
        updateAdventureObjectiveUI();
    }

    // ==========================================================
    // TACTICAL CHALLENGES RENDERER (Handcrafted Campaign)
    // ==========================================================
    function renderChallenges() {
        const gridEl = challengesLevelsGrid || adventureLevelsGrid;
        if (!gridEl) return;
        gridEl.innerHTML = '';

        ADVENTURE_LEVELS.forEach(lvl => {
            if (lvl.isTutorial) {
                const stars = career.levelStars[lvl.id] || 0;
                const starsDisplay = [1, 2, 3].map(i => i <= stars ? '⭐' : '☆').join('');

                const card = document.createElement('div');
                card.className = 'level-card training-card unlocked';
                card.innerHTML = `
                    <div class="level-header">
                        <span class="level-num-badge">🎓 TRAINING</span>
                        <span class="level-stars-display">${starsDisplay}</span>
                    </div>
                    <div class="level-title">${lvl.title}</div>
                    <div class="level-desc">${lvl.desc}</div>
                    <div class="level-meta-row">
                        <span class="level-drop-budget">🎯 4 Guided Steps</span>
                        <button class="btn-level-play">
                            ${stars > 0 ? 'Replay Training ➜' : 'Start Training ➜'}
                        </button>
                    </div>
                `;
                card.addEventListener('click', () => {
                    startTutorialMode();
                });
                gridEl.appendChild(card);
                return;
            }

            const isUnlocked = lvl.id <= career.unlockedLevel;
            const stars = career.levelStars[lvl.id] || 0;
            const starsDisplay = [1, 2, 3].map(i => i <= stars ? '⭐' : '☆').join('');

            const card = document.createElement('div');
            card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div class="level-header">
                    <span class="level-num-badge">${lvl.sector}</span>
                    <span class="level-stars-display">${starsDisplay}</span>
                </div>
                <div class="level-title">${lvl.title}</div>
                <div class="level-desc">${lvl.desc}</div>
                <div class="level-meta-row">
                    <span class="level-drop-budget">🎯 Limit: ${lvl.maxDrops} Drops</span>
                    <button class="btn-level-play" ${!isUnlocked ? 'disabled' : ''}>
                        ${isUnlocked ? (stars > 0 ? 'Replay ➜' : 'Launch ➜') : '🔒 Locked'}
                    </button>
                </div>
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    startAdventureLevel(lvl.id);
                });
            }

            gridEl.appendChild(card);
        });

        updateCareerDisplays();
    }

    // Alias for backward compatibility
    function renderAdventureMap() {
        renderChallenges();
    }

    function startClassicMode() {
        gameMode = 'classic';
        isTutorial = false;
        activeAdventureLevel = null;
        isGameOver = false;
        isPaused = false;
        if (modalPause) modalPause.classList.remove('visible');
        if (modalVictory) modalVictory.classList.remove('visible');
        if (modalGameOver) modalGameOver.classList.remove('visible');

        if (gameModeDisplay) gameModeDisplay.textContent = 'ZERO POINT';
        if (gameModeSub) gameModeSub.textContent = 'Quantum Math Cascade';
        if (bountyCard) bountyCard.style.display = 'block';
        if (adventureObjectiveCard) adventureObjectiveCard.style.display = 'none';
        if (tutorialCard) tutorialCard.style.display = 'none';
        if (bestLabel) bestLabel.textContent = 'Best';
        if (bestVal) bestVal.textContent = (career.highScore || 0).toLocaleString();
        if (turnCounterLabel) turnCounterLabel.textContent = 'Rising In';

        showScreen('game');
        startNewGame();
    }

    function startAdventureLevel(levelId) {
        const lvl = ADVENTURE_LEVELS.find(l => l.id === levelId) || ADVENTURE_LEVELS[1] || ADVENTURE_LEVELS[0];
        if (lvl.isTutorial) {
            startTutorialMode();
            return;
        }

        gameMode = 'adventure';
        isTutorial = false;
        activeAdventureLevel = lvl;
        adventureProgress = 0;
        adventureObjectiveMet = false;
        dropsUsed = 0;
        maxDrops = lvl.maxDrops;
        isGameOver = false;
        isPaused = false;
        if (modalPause) modalPause.classList.remove('visible');
        if (modalVictory) modalVictory.classList.remove('visible');
        if (modalGameOver) modalGameOver.classList.remove('visible');

        if (gameModeDisplay) gameModeDisplay.textContent = lvl.sector;
        if (gameModeSub) gameModeSub.textContent = lvl.title;
        if (bountyCard) bountyCard.style.display = 'none';
        if (adventureObjectiveCard) adventureObjectiveCard.style.display = 'block';
        if (tutorialCard) tutorialCard.style.display = 'none';
        if (advObjDesc) advObjDesc.textContent = lvl.desc;
        if (bestLabel) bestLabel.textContent = 'Sector Best';
        const lvlBest = career.levelHighScores[lvl.id] || 0;
        if (bestVal) bestVal.textContent = lvlBest.toLocaleString();
        if (turnCounterLabel) turnCounterLabel.textContent = 'Drops Left';

        showScreen('game');
        startNewGame();

        if (lvl.setupBoard) {
            grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
            lvl.setupBoard(grid);
        }
        updateAdventureObjectiveUI();
    }

    function startTutorialMode() {
        gameMode = 'adventure';
        isTutorial = true;
        activeAdventureLevel = ADVENTURE_LEVELS.find(l => l.isTutorial) || ADVENTURE_LEVELS[0];
        adventureProgress = 0;
        adventureObjectiveMet = false;
        dropsUsed = 0;
        maxDrops = 99;
        isGameOver = false;
        isPaused = false;

        if (modalPause) modalPause.classList.remove('visible');
        if (modalVictory) modalVictory.classList.remove('visible');
        if (modalGameOver) modalGameOver.classList.remove('visible');

        if (gameModeDisplay) gameModeDisplay.textContent = 'ACADEMY';
        if (gameModeSub) gameModeSub.textContent = 'Flight Training Level';
        if (bountyCard) bountyCard.style.display = 'none';
        if (adventureObjectiveCard) adventureObjectiveCard.style.display = 'none';
        if (tutorialCard) tutorialCard.style.display = 'flex';
        if (bestLabel) bestLabel.textContent = 'Training';
        if (bestVal) bestVal.textContent = 'Step 1/4';
        if (turnCounterLabel) turnCounterLabel.textContent = 'Phase';
        if (riseCounter) riseCounter.textContent = 'Guided';

        showScreen('game');
        startNewGame();
        loadTutorialStep(1);
    }

    function loadTutorialStep(step) {
        tutorialStep = step;
        tutorialStepCompleted = false;
        grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
        particles = [];
        shockwaves = [];
        laserBeams = [];
        activeMergeAnimations = [];
        activeZeroPointCollapses = [];
        activeProjectile = null;
        canHold = false;

        if (step === 1) {
            tutorialTargetCol = 2; // Column 3 (0-indexed 2)
            grid[ROWS - 1][2] = createTile(3);
            aimCol = 2;
            currentOrb = { type: 'number', value: -3, label: '-3' };
            nextQueue = [
                { type: 'number', value: 2, label: '+2' },
                { type: 'number', value: -4, label: '-4' },
                { type: 'special', subType: 'invert', label: '±' }
            ];
            if (tutorialStepBadge) tutorialStepBadge.textContent = 'STEP 1 / 4';
            if (tutorialTitle) tutorialTitle.textContent = 'Cancel Opposites to Zero (Zero Blast)';
            if (tutorialDesc) tutorialDesc.innerHTML = 'Dropping opposite numbers (like <strong>-3</strong> and <strong>+3</strong>) cancels them to zero. Drop your <strong>-3</strong> orb onto Column 3!';
            if (bestVal) bestVal.textContent = 'Step 1/4';
        } else if (step === 2) {
            tutorialTargetCol = 3; // Column 4 (0-indexed 3)
            grid[ROWS - 1][3] = createTile(2);
            aimCol = 3;
            currentOrb = { type: 'number', value: 2, label: '+2' };
            nextQueue = [
                { type: 'number', value: -4, label: '-4' },
                { type: 'special', subType: 'invert', label: '±' },
                { type: 'number', value: 3, label: '+3' }
            ];
            if (tutorialStepBadge) tutorialStepBadge.textContent = 'STEP 2 / 4';
            if (tutorialTitle) tutorialTitle.textContent = 'Merge & Double Matching Numbers';
            if (tutorialDesc) tutorialDesc.innerHTML = 'Dropping identical numbers merges and doubles them (<strong>+2</strong> + <strong>+2</strong> = <strong>+4</strong>). Drop your <strong>+2</strong> orb onto Column 4!';
            if (bestVal) bestVal.textContent = 'Step 2/4';
        } else if (step === 3) {
            tutorialTargetCol = 3; // Column 4
            grid[ROWS - 1][3] = createTile(4);
            grid[ROWS - 1][0] = createTile(-2);
            grid[ROWS - 1][1] = createTile(2);
            grid[ROWS - 1][5] = createTile(-2);
            aimCol = 3;
            currentOrb = { type: 'number', value: -4, label: '-4' };
            nextQueue = [
                { type: 'special', subType: 'invert', label: '±' },
                { type: 'number', value: 3, label: '+3' },
                { type: 'number', value: 1, label: '+1' }
            ];
            if (tutorialStepBadge) tutorialStepBadge.textContent = 'STEP 3 / 4';
            if (tutorialTitle) tutorialTitle.textContent = 'Cross Laser Power Blast';
            if (tutorialDesc) tutorialDesc.innerHTML = 'Canceling <strong>±4 or higher</strong> unleashes a Cross Laser that vaporizes entire rows and columns! Drop <strong>-4</strong> onto <strong>+4</strong> in Column 4!';
            if (bestVal) bestVal.textContent = 'Step 3/4';
        } else if (step === 4) {
            tutorialTargetCol = 2; // Column 3
            grid[ROWS - 1][2] = createTile(3);
            aimCol = 2;
            currentOrb = { type: 'special', subType: 'invert', label: '±' };
            nextQueue = [
                { type: 'number', value: 3, label: '+3' },
                { type: 'number', value: 1, label: '+1' },
                { type: 'number', value: 2, label: '+2' }
            ];
            if (tutorialStepBadge) tutorialStepBadge.textContent = 'STEP 4 / 4';
            if (tutorialTitle) tutorialTitle.textContent = 'Tactical Orbs: [±] Flip Sign';
            if (tutorialDesc) tutorialDesc.innerHTML = 'Special orbs modify existing tiles. Drop the <strong>[±] Flip Sign</strong> orb on Column 3 to invert <strong>+3</strong> to <strong>-3</strong>!';
            if (bestVal) bestVal.textContent = 'Step 4/4';
        }

        updateHUD();
    }

    function restoreTutorialStateForStep(step) {
        if (!isTutorial || tutorialStepCompleted) return;

        if (step === 1) {
            if (!grid[ROWS - 1][2] || grid[ROWS - 1][2].value !== 3) {
                grid[ROWS - 1][2] = createTile(3);
            }
            currentOrb = { type: 'number', value: -3, label: '-3' };
            addFloatingText("Drop -3 onto Column 3! 🎯", canvas.width / (2 * dpr), boardOffsetY + cellH * 2.5, '#ffd700', 1.25);
        } else if (step === 2) {
            if (!grid[ROWS - 1][3] || grid[ROWS - 1][3].value !== 2) {
                grid[ROWS - 1][3] = createTile(2);
            }
            currentOrb = { type: 'number', value: 2, label: '+2' };
            addFloatingText("Drop +2 onto Column 4! 🎯", canvas.width / (2 * dpr), boardOffsetY + cellH * 2.5, '#ffd700', 1.25);
        } else if (step === 3) {
            if (!grid[ROWS - 1][3] || grid[ROWS - 1][3].value !== 4) {
                grid[ROWS - 1][3] = createTile(4);
            }
            currentOrb = { type: 'number', value: -4, label: '-4' };
            addFloatingText("Drop -4 onto Column 4! 🎯", canvas.width / (2 * dpr), boardOffsetY + cellH * 2.5, '#ffd700', 1.25);
        } else if (step === 4) {
            const targetTile = grid[ROWS - 1][2];
            if (!targetTile) {
                grid[ROWS - 1][2] = createTile(3);
                currentOrb = { type: 'special', subType: 'invert', label: '±' };
                addFloatingText("Drop [±] onto Column 3! 🎯", canvas.width / (2 * dpr), boardOffsetY + cellH * 2.5, '#ffd700', 1.25);
            } else if (targetTile.value === 3) {
                currentOrb = { type: 'special', subType: 'invert', label: '±' };
                addFloatingText("Drop [±] onto Column 3! 🎯", canvas.width / (2 * dpr), boardOffsetY + cellH * 2.5, '#ffd700', 1.25);
            } else if (targetTile.value === -3) {
                currentOrb = { type: 'number', value: 3, label: '+3' };
                addFloatingText("Drop +3 onto Column 3! 🎯", canvas.width / (2 * dpr), boardOffsetY + cellH * 2.5, '#ffd700', 1.25);
            }
        }
        updateHUD();
    }

    function drawTutorialTargetIndicator() {
        if (!isTutorial || tutorialTargetCol === null) return;
        const col = tutorialTargetCol;
        const tx = boardOffsetX + col * cellW;
        const isAimingAtTarget = (aimCol === col);
        const bounce = Math.sin(Date.now() / 160) * 5;
        const pulse = 0.8 + Math.sin(Date.now() / 200) * 0.2;

        ctx.save();

        // 1. Highlight target column perimeter
        ctx.strokeStyle = isAimingAtTarget ? 'rgba(0, 242, 254, 0.75)' : 'rgba(249, 212, 35, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(tx + 2, boardOffsetY + 2, cellW - 4, cellH * ROWS - 4);
        ctx.setLineDash([]);

        // 2. Target beacon at bottom of column / tile
        const highlightColor = isAimingAtTarget ? '#00f2fe' : '#ffd700';
        ctx.fillStyle = highlightColor;
        ctx.shadowColor = highlightColor;
        ctx.shadowBlur = 12 * pulse;
        ctx.font = '900 11px Inter, sans-serif';
        ctx.textAlign = 'center';

        // 3. Floating pulsing target banner above column
        const tagY = boardOffsetY - 10 + bounce;
        ctx.fillText(isAimingAtTarget ? '▼ DROP HERE! ▼' : `▼ TARGET (COL ${col + 1}) ▼`, tx + cellW / 2, tagY);

        ctx.restore();
    }

    function triggerTutorialVictory() {
        if (isGameOver || (modalVictory && modalVictory.classList.contains('visible'))) return;
        isGameOver = true;
        sfx.playVictory();
        triggerScreenShake(12);

        career.levelStars[0] = 3;
        career.levelHighScores[0] = Math.max(career.levelHighScores[0] || 0, score + 1000);
        if (career.unlockedLevel < 1) {
            career.unlockedLevel = 1;
        }
        saveCareerData();

        if (victoryTitle) victoryTitle.textContent = "Academy Training Complete! 🎓";
        if (vicScore) vicScore.textContent = (score + 100).toLocaleString();
        if (vicDrops) vicDrops.textContent = "Passed (4/4)";
        if (vicBonus) vicBonus.textContent = "+100 Graduation Bonus";
        if (vicCascade) vicCascade.textContent = `${maxCombo}x`;

        if (victoryStarsContainer) {
            victoryStarsContainer.innerHTML = `
                <span class="vic-star active">⭐</span>
                <span class="vic-star active">⭐</span>
                <span class="vic-star active">⭐</span>
            `;
        }

        if (btnVicNext) {
            btnVicNext.textContent = "Launch Sector 01-1 ➜";
        }

        setTimeout(() => {
            if (modalVictory) modalVictory.classList.add('visible');
        }, 500);
    }

    function restartCurrentGame() {
        if (isTutorial) {
            startTutorialMode();
        } else if (gameMode === 'adventure' && activeAdventureLevel) {
            if (activeAdventureLevel.sectorNum) {
                startNodeLevel(activeAdventureLevel);
            } else {
                startAdventureLevel(activeAdventureLevel.id);
            }
        } else {
            startClassicMode();
        }
    }

    function togglePause(forceState) {
        if (currentScreen !== 'game' || isGameOver) return;
        if (modalVictory && modalVictory.classList.contains('visible')) return;

        isPaused = (forceState !== undefined) ? forceState : !isPaused;

        if (isPaused) {
            if (pauseModeName) {
                pauseModeName.textContent = isTutorial 
                    ? 'Academy Flight Training' 
                    : (gameMode === 'classic' 
                        ? 'Classic Survival' 
                        : (activeAdventureLevel && activeAdventureLevel.sectorNum 
                            ? `Node ${activeAdventureLevel.id}: ${activeAdventureLevel.title}` 
                            : `${activeAdventureLevel.sector}: ${activeAdventureLevel.title}`));
            }
            if (pauseModeDetail) {
                pauseModeDetail.textContent = isTutorial ? `Step ${tutorialStep} / 4 • Score: ${score.toLocaleString()}` : `Score: ${score.toLocaleString()} • Cascade: ${maxCombo}x • Zeroes: ${totalZeroPoints}`;
            }
            if (modalPause) modalPause.classList.add('visible');
        } else {
            if (modalPause) modalPause.classList.remove('visible');
            lastTime = performance.now();
        }
    }

    function syncAudioUI() {
        const isMuted = sfx ? sfx.muted : false;
        document.querySelectorAll('.icon-sound-on').forEach(el => el.style.display = isMuted ? 'none' : 'block');
        document.querySelectorAll('.icon-sound-off').forEach(el => el.style.display = isMuted ? 'block' : 'none');
        if (settingSfxToggle) settingSfxToggle.checked = !isMuted;
    }

    function setupAudioUI() {
        const toggleSound = () => {
            sfx.init();
            sfx.muted = !sfx.muted;
            if (career.settings) {
                career.settings.sfx = !sfx.muted;
                saveCareerData();
            }
            syncAudioUI();
        };

        if (btnSound) btnSound.addEventListener('click', toggleSound);
        if (btnHomeSound) btnHomeSound.addEventListener('click', toggleSound);

        const initAudioOnGesture = () => {
            sfx.init();
            if (career.settings && career.settings.bgm && !sfx.muted) {
                sfx.startBGM();
            }
        };

        window.addEventListener('click', initAudioOnGesture, { once: true });
        window.addEventListener('keydown', initAudioOnGesture, { once: true });
        window.addEventListener('touchstart', initAudioOnGesture, { once: true });
    }

    function setupScreenFlow() {
        // Home Screen Buttons
        if (cardPlayClassic) cardPlayClassic.addEventListener('click', startClassicMode);
        if (cardPlayAdventure) cardPlayAdventure.addEventListener('click', () => showScreen('adventure-nodes'));
        if (cardPlayChallenges) cardPlayChallenges.addEventListener('click', () => showScreen('challenges'));
        if (btnHomeTutorial) btnHomeTutorial.addEventListener('click', startTutorialMode);
        if (btnCodexTutorial) btnCodexTutorial.addEventListener('click', startTutorialMode);
        if (btnOpenCodex) btnOpenCodex.addEventListener('click', () => {
            codexPreviousScreen = 'home';
            showScreen('codex');
        });
        if (btnOpenSettings) btnOpenSettings.addEventListener('click', () => {
            if (modalSettings) modalSettings.classList.add('visible');
        });
        if (btnHomeSettings) btnHomeSettings.addEventListener('click', () => {
            if (modalSettings) modalSettings.classList.add('visible');
        });

        // Adventure Constellation Map Buttons
        if (btnAdvNodesBack) btnAdvNodesBack.addEventListener('click', () => showScreen('home'));
        if (btnPrevSector) btnPrevSector.addEventListener('click', () => {
            if (currentViewingSector > 1) {
                sfx.playMove();
                triggerHaptic('tick');
                renderAdventureNodeMap(currentViewingSector - 1);
            }
        });
        if (btnNextSector) btnNextSector.addEventListener('click', () => {
            if (typeof NodeGenerator !== 'undefined' && currentViewingSector < NodeGenerator.SECTOR_METADATA.length) {
                sfx.playMove();
                triggerHaptic('tick');
                renderAdventureNodeMap(currentViewingSector + 1);
            }
        });

        // Node Preview Modal Actions
        if (btnLaunchNode) btnLaunchNode.addEventListener('click', () => {
            if (modalNodePreview) modalNodePreview.classList.remove('visible');
            if (pendingNodeConfig) {
                startNodeLevel(pendingNodeConfig);
            }
        });
        if (btnCloseNodePreview) btnCloseNodePreview.addEventListener('click', () => {
            if (modalNodePreview) modalNodePreview.classList.remove('visible');
        });

        // Challenges Screen Buttons
        if (btnChallengesToHome) btnChallengesToHome.addEventListener('click', () => showScreen('home'));
        if (btnAdvToHome) btnAdvToHome.addEventListener('click', () => showScreen('home'));

        // Game Arena Buttons
        if (btnPause) btnPause.addEventListener('click', () => togglePause());

        // Pause Modal Actions
        if (btnPauseResume) btnPauseResume.addEventListener('click', () => togglePause(false));
        if (btnPauseRestart) btnPauseRestart.addEventListener('click', () => {
            togglePause(false);
            restartCurrentGame();
        });
        if (btnPauseCodex) btnPauseCodex.addEventListener('click', () => {
            codexPreviousScreen = 'game';
            showScreen('codex');
        });
        if (btnPauseSettings) btnPauseSettings.addEventListener('click', () => {
            if (modalSettings) modalSettings.classList.add('visible');
        });
        if (btnPauseQuit) btnPauseQuit.addEventListener('click', () => {
            togglePause(false);
            if (isTutorial) {
                isTutorial = false;
                if (tutorialCard) tutorialCard.style.display = 'none';
            }
            if (activeAdventureLevel && activeAdventureLevel.sectorNum) {
                showScreen('adventure-nodes');
            } else if (gameMode === 'adventure') {
                showScreen('challenges');
            } else {
                showScreen('home');
            }
        });

        // Victory Modal Actions
        if (btnVicNext) btnVicNext.addEventListener('click', () => {
            if (modalVictory) modalVictory.classList.remove('visible');
            if (activeAdventureLevel && activeAdventureLevel.sectorNum) {
                showScreen('adventure-nodes');
            } else if (isTutorial || (activeAdventureLevel && activeAdventureLevel.isTutorial)) {
                startAdventureLevel(1);
            } else if (activeAdventureLevel && activeAdventureLevel.id < ADVENTURE_LEVELS[ADVENTURE_LEVELS.length - 1].id) {
                startAdventureLevel(activeAdventureLevel.id + 1);
            } else {
                showScreen('challenges');
            }
        });
        if (btnVicReplay) btnVicReplay.addEventListener('click', () => {
            if (modalVictory) modalVictory.classList.remove('visible');
            if (activeAdventureLevel && activeAdventureLevel.sectorNum) {
                startNodeLevel(activeAdventureLevel);
            } else if (isTutorial || (activeAdventureLevel && activeAdventureLevel.isTutorial)) {
                startTutorialMode();
            } else if (activeAdventureLevel) {
                startAdventureLevel(activeAdventureLevel.id);
            }
        });
        if (btnVicMap) btnVicMap.addEventListener('click', () => {
            if (modalVictory) modalVictory.classList.remove('visible');
            if (activeAdventureLevel && activeAdventureLevel.sectorNum) {
                showScreen('adventure-nodes');
            } else {
                showScreen('challenges');
            }
        });

        // Settings Modal Actions
        if (btnCloseSettings) btnCloseSettings.addEventListener('click', () => {
            if (modalSettings) modalSettings.classList.remove('visible');
        });
        if (btnSettingsSave) btnSettingsSave.addEventListener('click', () => {
            if (modalSettings) modalSettings.classList.remove('visible');
        });

        if (settingSfxToggle) {
            settingSfxToggle.addEventListener('change', (e) => {
                sfx.muted = !e.target.checked;
                career.settings.sfx = e.target.checked;
                saveCareerData();
                syncAudioUI();
            });
        }

        if (settingBgmToggle) {
            settingBgmToggle.addEventListener('change', (e) => {
                career.settings.bgm = e.target.checked;
                sfx.toggleBGM(e.target.checked);
                saveCareerData();
            });
        }

        if (settingVibrationToggle) {
            settingVibrationToggle.addEventListener('change', (e) => {
                career.settings.vibration = e.target.checked;
                saveCareerData();
                if (e.target.checked) {
                    triggerHaptic('tick');
                }
            });
        }

        if (settingShakeSelect) {
            settingShakeSelect.addEventListener('change', (e) => {
                career.settings.shake = e.target.value;
                saveCareerData();
            });
        }

        if (btnResetData) {
            btnResetData.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all stars, campaign progress, and high scores?')) {
                    career = {
                        highScore: 0,
                        unlockedLevel: 1,
                        levelStars: {},
                        levelHighScores: {},
                        settings: { sfx: true, bgm: true, vibration: true, shake: 'high' }
                    };
                    saveCareerData();
                    updateCareerDisplays();
                    renderAdventureMap();
                    alert('Career progress has been reset.');
                }
            });
        }

        // Codex Tabs & Buttons
        if (btnCodexToHome) btnCodexToHome.addEventListener('click', () => showScreen(codexPreviousScreen));
        if (btnCodexClose) btnCodexClose.addEventListener('click', () => showScreen(codexPreviousScreen));

        const codexTabs = document.querySelectorAll('.codex-tab');
        const codexContents = document.querySelectorAll('.codex-tab-content');
        codexTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                codexTabs.forEach(t => t.classList.remove('active'));
                codexContents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const target = document.getElementById(`tab-${tabId}`);
                if (target) target.classList.add('active');
                sfx.playMove();
            });
        });

        // Game Over Menu Action
        if (btnGoMenu) {
            btnGoMenu.addEventListener('click', () => {
                if (modalGameOver) modalGameOver.classList.remove('visible');
                if (isTutorial) {
                    isTutorial = false;
                    if (tutorialCard) tutorialCard.style.display = 'none';
                }
                if (gameMode === 'adventure') {
                    showScreen('adventure-map');
                } else {
                    showScreen('home');
                }
            });
        }
    }

    // Initialization
    function init() {
        if (!CanvasRenderingContext2D.prototype.roundRect) {
            CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r = 8) {
                if (typeof r === 'number') r = [r, r, r, r];
                const [tl, tr, br, bl] = r;
                this.moveTo(x + tl, y);
                this.lineTo(x + w - tr, y);
                this.quadraticCurveTo(x + w, y, x + w, y + tr);
                this.lineTo(x + w, y + h - br);
                this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
                this.lineTo(x + bl, y + h);
                this.quadraticCurveTo(x, y + h, x, y + h - bl);
                this.lineTo(x, y + tl);
                this.quadraticCurveTo(x, y, x + tl, y);
                this.closePath();
                return this;
            };
        }

        // Apply audio settings
        if (sfx && career.settings) {
            sfx.muted = !career.settings.sfx;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        setupInputs();
        setupAudioUI();
        setupFullscreenUI();
        setupScreenFlow();

        showScreen('home');
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                if (currentScreen === 'game') {
                    render();
                }
            });
        }
        requestAnimationFrame(gameLoop);
    }

    function resizeCanvas() {
        const rect = container.getBoundingClientRect();
        dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        cellW = rect.width / COLS;
        cellH = rect.height / (ROWS + 1.2); // +1.2 space at the top for launcher
        boardOffsetX = 0;
        boardOffsetY = cellH * 1.2;
    }

    function startNewGame() {
        grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
        score = 0;
        combo = 1;
        maxCombo = 1;
        totalZeroPoints = 0;
        if (gameMode === 'adventure' && activeAdventureLevel && activeAdventureLevel.rules && activeAdventureLevel.rules.fluxRate > 0) {
            movesUntilRise = activeAdventureLevel.rules.fluxRate;
        } else {
            movesUntilRise = MOVES_PER_RISE;
        }
        isGameOver = false;
        isProcessing = false;
        aimCol = Math.floor(COLS / 2);
        canHold = true;
        heldOrb = null;
        particles = [];
        shockwaves = [];
        laserBeams = [];
        activeMergeAnimations = [];
        activeZeroPointCollapses = [];
        screenFlash = 0;
        floatingTexts = [];
        activeProjectile = null;
        overdriveCharge = 0;
        isOverdriveReady = false;
        isFrenzyActive = false;
        frenzyTurnsRemaining = 0;
        pendingOverdriveActivation = false;
        frenzySpecialIndex = 0;
        swapTokens = 1;
        isSwapModeActive = false;
        firstSwapTile = null;
        dropsSinceSwapCharge = 0;

        if (isTutorial) {
            currentBounty = null;
            adventureProgress = 0;
            adventureObjectiveMet = false;
            dropsUsed = 0;
            maxDrops = 99;
            canHold = false;
        } else if (gameMode === 'classic') {
            currentBounty = generateBounty();
            populateInitialBoard();
        } else if (gameMode === 'adventure') {
            currentBounty = null;
            adventureProgress = 0;
            adventureObjectiveMet = false;
            dropsUsed = 0;
            if (activeAdventureLevel) {
                maxDrops = activeAdventureLevel.maxDrops;
            }
        }

        // Initialize upcoming queues
        if (!isTutorial) {
            nextQueue = [generateOrb(), generateOrb(), generateOrb()];
            currentOrb = generateOrb();
        }

        updateHUD();
        if (modalGameOver) modalGameOver.classList.remove('visible');
    }

    function populateInitialBoard() {
        const starterValues = [1, 2, 3, 4, -1, -2, -3, -4];
        for (let r = ROWS - 2; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (Math.random() < 0.75) {
                    const val = starterValues[Math.floor(Math.random() * starterValues.length)];
                    grid[r][c] = createTile(val);
                }
            }
        }
    }

    function createTile(val, type = 'number') {
        return {
            value: val,
            type: type, // 'number', 'dark_matter', 'special'
            hp: type === 'dark_matter' ? 2 : 1,
            scaleX: 1,
            scaleY: 1,
            flash: 0,
            animX: 0,
            animY: 0
        };
    }

    // Orb Generator
    function generateOrb() {
        // Dynamic spawn pool mutators from procedural node rules
        const poolType = (gameMode === 'adventure' && activeAdventureLevel && activeAdventureLevel.rules)
            ? activeAdventureLevel.rules.spawnPoolType
            : 'standard';

        let specialChance = poolType === 'wildcards' ? 0.25 : (poolType === 'singles' ? 0.05 : 0.12);

        if (Math.random() < specialChance) {
            const specials = ['invert', 'div2', 'mul2', 'zero'];
            const chosen = specials[Math.floor(Math.random() * specials.length)];
            return {
                type: 'special',
                subType: chosen,
                label: chosen === 'invert' ? '±' :
                       chosen === 'div2' ? '÷2' :
                       chosen === 'mul2' ? '×2' : '0'
            };
        }

        let val = 1;
        if (poolType === 'singles') {
            val = 1;
        } else if (poolType === 'high_energy') {
            const energyPool = [2, 4];
            val = energyPool[Math.floor(Math.random() * energyPool.length)];
        } else {
            // Standard number orbs (range scales moderately with score)
            const maxVal = score > 5000 ? 8 : (score > 2000 ? 6 : 4);
            val = Math.floor(Math.random() * maxVal) + 1;
        }

        // 50% positive, 50% negative
        if (Math.random() < 0.5) val = -val;

        return {
            type: 'number',
            value: val,
            label: val > 0 ? `+${val}` : `${val}`
        };
    }

    // Drop Logic
    function dropActiveOrb() {
        if (isProcessing || isGameOver || activeProjectile) return;

        sfx.init();

        dropsSinceSwapCharge++;
        if (dropsSinceSwapCharge >= 8) {
            dropsSinceSwapCharge = 0;
            if (swapTokens < maxSwapTokens) {
                addSwapToken(1);
            }
        }

        const col = aimCol;

        // Find landing row in this column
        let landingRow = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!grid[r][col]) {
                landingRow = r;
                break;
            }
        }

        const topOccupiedRow = landingRow + 1;
        const hasTopTile = topOccupiedRow < ROWS && grid[topOccupiedRow][col] !== null;

        // Determine target position for projectile
        let targetY = 0;
        let isImpact = false;

        if (currentOrb.type === 'special' && hasTopTile) {
            // Special orb targets the top tile directly
            targetY = boardOffsetY + topOccupiedRow * cellH + cellH / 2;
            isImpact = true;
        } else if (landingRow >= 0) {
            // Number orbs (and specials with empty column) land on top of the column
            targetY = boardOffsetY + landingRow * cellH + cellH / 2;
            isImpact = false;
        } else {
            // Column is full to the brim!
            triggerScreenShake(8);
            sfx.playWarning();
            return;
        }

        isProcessing = true;
        if (gameMode === 'adventure') {
            dropsUsed++;
            updateHUD();
        }
        activeProjectile = {
            col: col,
            orb: currentOrb,
            x: boardOffsetX + col * cellW + cellW / 2,
            y: cellH * 0.55,
            targetY: targetY,
            vy: 8,
            landingRow: landingRow,
            impactRow: isImpact ? topOccupiedRow : landingRow,
            isImpact: isImpact
        };

        sfx.playDrop();
        triggerHaptic('drop');
    }

    function swapHold() {
        if (isTutorial || !canHold || isProcessing || isGameOver) return;
        sfx.init();
        sfx.playMove();
        triggerHaptic('swap');

        if (heldOrb === null) {
            heldOrb = currentOrb;
            currentOrb = nextQueue.shift();
            nextQueue.push(generateOrb());
        } else {
            const temp = currentOrb;
            currentOrb = heldOrb;
            heldOrb = temp;
        }

        canHold = false;
        updateHUD();
    }

    // Processing impact when projectile hits target
    function handleProjectileLanding() {
        try {
            const p = activeProjectile;
            activeProjectile = null;

            if (!p) {
                isProcessing = false;
                return;
            }

            const col = p.col;
            const orb = p.orb;

            if (orb.type === 'special') {
                applySpecialOrb(orb, col, p.impactRow);
            } else {
                // Number Orb lands in empty cell at landingRow
                if (p.landingRow >= 0 && p.landingRow < ROWS) {
                    grid[p.landingRow][col] = createTile(orb.value);
                    const tile = grid[p.landingRow][col];
                    if (tile) {
                        tile.scaleX = 1.35;
                        tile.scaleY = 0.68;
                        tile.flash = 0.85;
                    }

                    // Impact ground shockwave ripple & sparks
                    const landX = boardOffsetX + col * cellW + cellW / 2;
                    const landY = boardOffsetY + p.landingRow * cellH + cellH / 2;
                    shockwaves.push({
                        x: landX,
                        y: landY + cellH * 0.35,
                        radius: 6,
                        maxRadius: cellW * 0.95,
                        alpha: 0.85,
                        color: orb.value > 0 ? '#00f2fe' : '#ff4e50'
                    });
                    createSparks(landX, landY + cellH * 0.32, '#ffffff', 8);
                    triggerScreenShake(3);
                }
            }

            // Manage Frenzy turn duration (1 special drop)
            if (isFrenzyActive) {
                frenzyTurnsRemaining--;
            }

            // Advance queue
            if (!isTutorial) {
                currentOrb = nextQueue.shift();
                nextQueue.push(generateOrb());
                canHold = true;
            } else {
                currentOrb = nextQueue.shift() || generateOrb();
                canHold = false;
            }
            updateHUD();

            // Start cascade resolution pipeline
            resolveBoardCascades();
        } catch (err) {
            console.error('Error during handleProjectileLanding:', err);
            isProcessing = false;
            activeProjectile = null;
            updateHUD();
        }
    }

    function applySpecialOrb(orb, col, row) {
        const sub = orb.subType;
        const targetTile = (row >= 0 && row < ROWS) ? grid[row][col] : null;

        if (sub === 'blackhole') {
            // Black Hole Vortex: Sucks in and annihilates the entire column!
            sfx.playBlackHole();
            triggerScreenShake(26);
            screenFlash = 0.55;
            screenFlashColor = '#bc13fe';

            shockwaves.push({ 
                x: boardOffsetX + col * cellW + cellW / 2, 
                y: boardOffsetY + (ROWS / 2) * cellH, 
                radius: 15, 
                maxRadius: cellW * 4.8, 
                alpha: 1, 
                color: '#bc13fe' 
            });

            // Annihilate all tiles in this column
            for (let r = 0; r < ROWS; r++) {
                if (grid[r][col]) {
                    const cx = boardOffsetX + col * cellW + cellW / 2;
                    const cy = boardOffsetY + r * cellH + cellH / 2;
                    createSparks(cx, cy, '#bc13fe', 12);
                    createSparks(cx, cy, '#ffd700', 8);
                    grid[r][col] = null;
                }
            }

            // Damage neighboring Dark Matter columns
            for (let r = 0; r < ROWS; r++) {
                damageDarkMatterTile(r, col - 1, 1);
                damageDarkMatterTile(r, col + 1, 1);
            }

            addFloatingText('⚫ GRAVITATIONAL CRUSH!', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + cellH * 2.5, '#ffd700', 1.4);
            addScore(100);
        } else if (sub === 'supernova_core') {
            // Supernova Core: Detonates Tier 4 Supernova Crater at target area
            sfx.playAnnihilate(combo, 4);
            triggerScreenShake(22);
            screenFlash = 0.65;
            screenFlashColor = '#ffd700';

            const epicR = Math.max(0, Math.min(ROWS - 1, row >= 0 ? row : ROWS - 1));
            damageSupernovaArea(epicR, col, epicR, col);
            addFloatingText('🌟 SUPERNOVA CORE!', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + epicR * cellH, '#ffd700', 1.45);
            addScore(120);
        } else if (sub === 'antimatter_nuke') {
            // Antimatter Nuke: Heavy 3x3 blast
            sfx.playAnnihilate(combo, 3);
            triggerScreenShake(18);
            const epicR = Math.max(0, Math.min(ROWS - 1, row >= 0 ? row : ROWS - 1));
            damageSupernovaArea(epicR, col, epicR, col);
            addFloatingText('💥 ANTIMATTER NUKE!', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + epicR * cellH, '#ff4e50', 1.35);
            addScore(90);
        } else if (sub === 'zero') {
            // Singularity Bomb: clears 3x3 radius
            sfx.playAnnihilate(3);
            triggerScreenShake(12);
            for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
                    if (grid[r][c]) {
                        createSparks(boardOffsetX + c * cellW + cellW / 2, boardOffsetY + r * cellH + cellH / 2, '#c471ed', 12);
                        grid[r][c] = null;
                    }
                }
            }
            addFloatingText('0 SINGULARITY!', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + row * cellH, '#c471ed');
            addScore(40);
        } else if (targetTile) {
            sfx.playSpecial();
            if (sub === 'invert') {
                targetTile.value = -targetTile.value;
                targetTile.flash = 1;
                addFloatingText('INVERTED!', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + row * cellH, '#c471ed');

                if (isTutorial && tutorialStep === 4) {
                    if (tutorialStepBadge) tutorialStepBadge.textContent = 'STEP 4 / 4 - FINAL BLAST';
                    if (tutorialTitle) tutorialTitle.textContent = 'Cancel the Inverted Tile';
                    if (tutorialDesc) tutorialDesc.innerHTML = 'Tile inverted to <strong>-3</strong>! Now drop your <strong>+3</strong> orb on Column 3 to finish training!';
                    currentOrb = { type: 'number', value: 3, label: '+3' };
                    updateHUD();
                }
            } else if (sub === 'div2') {
                if (Math.abs(targetTile.value) > 1) {
                    targetTile.value = Math.sign(targetTile.value) * Math.floor(Math.abs(targetTile.value) / 2);
                }
                targetTile.flash = 1;
                addFloatingText('DIVIDE ÷2', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + row * cellH, '#00f2fe');
            } else if (sub === 'mul2') {
                targetTile.value = targetTile.value * 2;
                targetTile.flash = 1;
                addFloatingText('AMPLIFY ×2', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + row * cellH, '#f9d423');
            }
        }
    }

    // Cascade Pipeline: Gravity -> Adjacency -> Gravity until stable
    async function resolveBoardCascades(isSwap = false) {
        try {
            let cascadeOccurred = false;
            let chainStep = 0;
            const maxChainSteps = 40;

            // Initial settle pause so player clearly sees the landed orb / swapped tile
            await delay(120);

            while (chainStep < maxChainSteps) {
                // 1. Apply Gravity with smooth downward slide
                const fell = applyGravity();
                if (fell) {
                    await delay(160);
                }

                // 2. Scan Adjacency Matches with animated merges and collapses
                const matchFound = await scanAndResolveMatches(chainStep);
                if (matchFound) {
                    cascadeOccurred = true;
                    chainStep++;
                    combo++;
                    if (combo > maxCombo) maxCombo = combo;
                    if (combo >= 2) {
                        checkBountyProgress('cascade', 1);
                    }
                    updateHUD();
                    await delay(120);
                    continue; // Re-check gravity and subsequent cascades
                }

                // If no fell and no matches, board is in equilibrium!
                break;
            }

            // End of player turn actions:
            if (!cascadeOccurred) {
                combo = 1;
                updateHUD();
            }

            if (!isSwap) {
                if (gameMode === 'classic') {
                    movesUntilRise--;
                    if (movesUntilRise <= 0) {
                        movesUntilRise = MOVES_PER_RISE;
                        await pushRisingRow();
                    }
                } else if (gameMode === 'adventure' && activeAdventureLevel && activeAdventureLevel.rules && activeAdventureLevel.rules.fluxRate > 0) {
                    movesUntilRise--;
                    if (movesUntilRise <= 0) {
                        movesUntilRise = activeAdventureLevel.rules.fluxRate;
                        await pushRisingRow();
                    }
                }
            }

            if (isFrenzyActive && frenzyTurnsRemaining <= 0) {
                isFrenzyActive = false;
                overdriveCharge = 0;
                addFloatingText('Overdrive Discharged', canvas.width / (2 * dpr), boardOffsetY + cellH * 3, '#8892b0', 1.1);
            }
        } catch (err) {
            console.error('Error during cascade resolution:', err);
        } finally {
            checkGameOver();
            isProcessing = false;
            if (pendingOverdriveActivation && !isGameOver) {
                pendingOverdriveActivation = false;
                activateOverdrive();
            }
            updateHUD();

            if (isTutorial) {
                if (tutorialStepCompleted) {
                    if (tutorialStep < 4) {
                        setTimeout(() => {
                            loadTutorialStep(tutorialStep + 1);
                        }, 750);
                    } else {
                        setTimeout(() => {
                            triggerTutorialVictory();
                        }, 750);
                    }
                } else {
                    restoreTutorialStateForStep(tutorialStep);
                }
            }
        }
    }

    function applyGravity() {
        let moved = false;
        for (let c = 0; c < COLS; c++) {
            for (let r = ROWS - 2; r >= 0; r--) {
                if (grid[r][c] && !grid[r + 1][c]) {
                    // Fall down to the lowest open spot
                    let dropTo = r + 1;
                    while (dropTo + 1 < ROWS && !grid[dropTo + 1][c]) {
                        dropTo++;
                    }
                    const tile = grid[r][c];
                    grid[dropTo][c] = tile;
                    tile.animY = -(dropTo - r) * cellH; // Smooth downward slide from original height
                    grid[r][c] = null;
                    moved = true;
                }
            }
        }
        return moved;
    }

    function playSynthesisMergeAnim(rA, cA, rB, cB, tileA, tileB, fusedVal, chainStep) {
        return new Promise(resolvePromise => {
            // Temporarily clear grid slots so drawTiles() doesn't render static copies
            grid[rA][cA] = null;
            grid[rB][cB] = null;

            const xA = boardOffsetX + cA * cellW + cellW / 2;
            const yA = boardOffsetY + rA * cellH + cellH / 2;
            const xB = boardOffsetX + cB * cellW + cellW / 2;
            const yB = boardOffsetY + rB * cellH + cellH / 2;

            activeMergeAnimations.push({
                rA, cA, rB, cB,
                xA, yA, xB, yB,
                tileA: { ...tileA },
                tileB: { ...tileB },
                fusedVal,
                chainStep,
                duration: 0.22,
                elapsed: 0,
                progress: 0,
                onComplete: () => {
                    // Place new fused tile at (rB, cB) with squash/stretch pop & white flash
                    grid[rB][cB] = createTile(fusedVal);
                    grid[rB][cB].flash = 1;
                    grid[rB][cB].scaleX = 1.45;
                    grid[rB][cB].scaleY = 1.45;

                    sfx.playMerge(fusedVal);
                    triggerHaptic('merge');
                    shockwaves.push({
                        x: xB,
                        y: yB,
                        radius: 8,
                        maxRadius: cellW * 1.5,
                        alpha: 1,
                        color: fusedVal > 0 ? '#00f2fe' : '#ff4e50'
                    });
                    createSparks(xB, yB, fusedVal > 0 ? '#00f2fe' : '#ff4e50', 14);

                    addFloatingText(`${tileA.value} + ${tileB.value} = ${fusedVal}`, 
                        (xA + xB) / 2, 
                        (yA + yB) / 2 - cellH * 0.2, 
                        fusedVal > 0 ? 'var(--cyan)' : 'var(--orange)');
                    addScore(5 * (chainStep + 1));
                    addOverdriveCharge(2);
                    checkBountyProgress('synthesis', 1);

                    resolvePromise();
                }
            });
        });
    }

    function playZeroPointCollapseAnim(rA, cA, rB, cB, tileA, tileB, magnitude, chainStep) {
        return new Promise(resolvePromise => {
            // Clear grid slots
            grid[rA][cA] = null;
            grid[rB][cB] = null;

            const xA = boardOffsetX + cA * cellW + cellW / 2;
            const yA = boardOffsetY + rA * cellH + cellH / 2;
            const xB = boardOffsetX + cB * cellW + cellW / 2;
            const yB = boardOffsetY + rB * cellH + cellH / 2;
            const midX = (xA + xB) / 2;
            const midY = (yA + yB) / 2;

            sfx.playSingularitySuction();

            activeZeroPointCollapses.push({
                rA, cA, rB, cB,
                xA, yA, xB, yB,
                midX, midY,
                tileA: { ...tileA },
                tileB: { ...tileB },
                magnitude,
                chainStep,
                duration: 0.24,
                elapsed: 0,
                progress: 0,
                onComplete: () => {
                    triggerZeroPointBlast(rA, cA, `${tileA.value} + (${tileB.value}) = 0!`, chainStep, magnitude, rB, cB);
                    resolvePromise();
                }
            });
        });
    }

    async function scanAndResolveMatches(chainStep) {
        // Priority 1: ZERO POINT ANNIHILATION (Opposites: A + B == 0)
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tileA = grid[r][c];
                if (!tileA || tileA.type !== 'number') continue;

                // Check Right neighbor
                if (c + 1 < COLS) {
                    const tileB = grid[r][c + 1];
                    if (tileB && tileB.type === 'number' && tileA.value + tileB.value === 0) {
                        totalZeroPoints++;
                        checkAdventureObjective('annihilations', 1);
                        const magnitude = Math.abs(tileA.value);

                        if (isTutorial) {
                            if (tutorialStep === 1) {
                                tutorialStepCompleted = true;
                            } else if (tutorialStep === 3 && magnitude >= 4) {
                                tutorialStepCompleted = true;
                            } else if (tutorialStep === 4) {
                                tutorialStepCompleted = true;
                            }
                        }

                        await playZeroPointCollapseAnim(r, c, r, c + 1, tileA, tileB, magnitude, chainStep);
                        return true;
                    }
                }

                // Check Down neighbor
                if (r + 1 < ROWS) {
                    const tileB = grid[r + 1][c];
                    if (tileB && tileB.type === 'number' && tileA.value + tileB.value === 0) {
                        totalZeroPoints++;
                        checkAdventureObjective('annihilations', 1);
                        const magnitude = Math.abs(tileA.value);

                        if (isTutorial) {
                            if (tutorialStep === 1) {
                                tutorialStepCompleted = true;
                            } else if (tutorialStep === 3 && magnitude >= 4) {
                                tutorialStepCompleted = true;
                            } else if (tutorialStep === 4) {
                                tutorialStepCompleted = true;
                            }
                        }

                        await playZeroPointCollapseAnim(r, c, r + 1, c, tileA, tileB, magnitude, chainStep);
                        return true;
                    }
                }
            }
        }

        // Priority 2: SYNTHESIS (Identical value & sign: A == B)
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tileA = grid[r][c];
                if (!tileA || tileA.type !== 'number') continue;

                // Check Right neighbor
                if (c + 1 < COLS) {
                    const tileB = grid[r][c + 1];
                    if (tileB && tileB.type === 'number' && tileA.value === tileB.value) {
                        const fusedVal = tileA.value * 2;
                        checkAdventureObjective('synthesis_tier', Math.abs(fusedVal));

                        if (isTutorial && tutorialStep === 2) {
                            tutorialStepCompleted = true;
                        }

                        await playSynthesisMergeAnim(r, c, r, c + 1, tileA, tileB, fusedVal, chainStep);
                        return true;
                    }
                }

                // Check Down neighbor
                if (r + 1 < ROWS) {
                    const tileB = grid[r + 1][c];
                    if (tileB && tileB.type === 'number' && tileA.value === tileB.value) {
                        const fusedVal = tileA.value * 2;
                        checkAdventureObjective('synthesis_tier', Math.abs(fusedVal));

                        if (isTutorial && tutorialStep === 2) {
                            tutorialStepCompleted = true;
                        }

                        await playSynthesisMergeAnim(r, c, r + 1, c, tileA, tileB, fusedVal, chainStep);
                        return true;
                    }
                }
            }
        }

        return false;
    }

    function getTier(magnitude) {
        if (magnitude <= 1) return 1;
        if (magnitude <= 3) return 2;
        if (magnitude <= 7) return 3;
        if (magnitude <= 15) return 4;
        return 5;
    }

    function triggerZeroPointBlast(r, c, equationText, chainStep = 0, magnitude = 1, r2 = r, c2 = c) {
        const x1 = boardOffsetX + c * cellW + cellW / 2;
        const y1 = boardOffsetY + r * cellH + cellH / 2;
        const x2 = boardOffsetX + c2 * cellW + cellW / 2;
        const y2 = boardOffsetY + r2 * cellH + cellH / 2;
        const x = (x1 + x2) / 2;
        const y = (y1 + y2) / 2;

        const tier = getTier(magnitude);

        sfx.playAnnihilate(combo, tier);
        if (tier >= 4) {
            triggerHaptic('supernova');
        } else if (tier === 3) {
            triggerHaptic('laser');
        } else {
            triggerHaptic('zero');
        }

        let bannerText = 'ZERO POINT!';
        let bannerColor = '#00f2fe';
        let bannerScale = 1.1;

        if (tier === 1) {
            // Tier 1: Micro Detonation (Magnitude 1)
            triggerScreenShake(6 + Math.min(combo * 2, 8));
            shockwaves.push({ x: x, y: y, radius: 10, maxRadius: cellW * 2.0, alpha: 1, color: '#fff' });
            createSparks(x, y, '#00f2fe', 14);
            createSparks(x, y, '#ff4e50', 14);
            damageAdjacentDarkMatter(r, c);
            damageAdjacentDarkMatter(r2, c2);
            bannerText = 'ZERO POINT!';
            bannerColor = '#00f2fe';
        } else if (tier === 2) {
            // Tier 2: Pulse Detonation (Magnitude 2-3)
            triggerScreenShake(10 + Math.min(combo * 2, 10));
            shockwaves.push({ x: x, y: y, radius: 12, maxRadius: cellW * 3.0, alpha: 1, color: '#00f2fe' });
            createSparks(x, y, '#00f2fe', 22);
            createSparks(x, y, '#ff4e50', 22);
            damageAdjacentDarkMatter(r, c);
            damageAdjacentDarkMatter(r2, c2);
            bannerText = '⚡ PULSE BLAST!';
            bannerColor = '#00f2fe';
            bannerScale = 1.25;
        } else if (tier === 3) {
            // Tier 3: Cross Laser Blast (Magnitude 4-7)
            triggerScreenShake(16);
            shockwaves.push({ x: x, y: y, radius: 14, maxRadius: cellW * 4.2, alpha: 1, color: '#ffffff' });
            createSparks(x, y, '#00f2fe', 32);
            createSparks(x, y, '#ffd700', 20);

            // Radiant Cross Laser Beams
            laserBeams.push({ type: 'horizontal', row: r, alpha: 1.0, width: 20, color: '#00f2fe' });
            if (r2 !== r) laserBeams.push({ type: 'horizontal', row: r2, alpha: 1.0, width: 20, color: '#00f2fe' });
            laserBeams.push({ type: 'vertical', col: c, alpha: 1.0, width: 20, color: '#00f2fe' });
            if (c2 !== c) laserBeams.push({ type: 'vertical', col: c2, alpha: 1.0, width: 20, color: '#00f2fe' });

            damageLaserPath(r, c, r2, c2);
            bannerText = '⚡ CROSS LASER BLAST!';
            bannerColor = '#00f2fe';
            bannerScale = 1.35;
        } else if (tier === 4) {
            // Tier 4: Supernova Crater (Magnitude 8-15)
            triggerScreenShake(24);
            screenFlash = 0.65;
            screenFlashColor = '#ffd700';

            shockwaves.push({ x: x, y: y, radius: 15, maxRadius: cellW * 5.2, alpha: 1, color: '#ffd700' });
            shockwaves.push({ x: x, y: y, radius: 8, maxRadius: cellW * 3.5, alpha: 1, color: '#ffffff' });
            createSparks(x, y, '#ffd700', 36);
            createSparks(x, y, '#ff4e50', 24);
            createSparks(x, y, '#ffffff', 20);

            damageSupernovaArea(r, c, r2, c2);
            bannerText = '🌟 SUPERNOVA CRATER!';
            bannerColor = '#ffd700';
            bannerScale = 1.5;
        } else {
            // Tier 5: Hyperspace Singularity (Magnitude 16+)
            triggerScreenShake(32);
            screenFlash = 0.85;
            screenFlashColor = '#ffffff';

            shockwaves.push({ x: x, y: y, radius: 20, maxRadius: cellW * 7.5, alpha: 1, color: '#c471ed' });
            shockwaves.push({ x: x, y: y, radius: 10, maxRadius: cellW * 5.0, alpha: 1, color: '#00f2fe' });
            createSparks(x, y, '#c471ed', 45);
            createSparks(x, y, '#00f2fe', 45);
            createSparks(x, y, '#ffd700', 35);

            damageHyperspace();
            bannerText = '💥 HYPERSPACE SINGULARITY!';
            bannerColor = '#c471ed';
            bannerScale = 1.65;
        }

        // Float equation text & tier banner
        addFloatingText(equationText, x, y - 14, '#ffffff', 1.05);
        if (combo > 1) {
            addFloatingText(`${bannerText} (CASCADE ${combo}x!)`, x, y + 20, bannerColor, bannerScale);
        } else {
            addFloatingText(bannerText, x, y + 20, bannerColor, bannerScale);
        }

        // Tier-scaled score bonus (Base 10 for Tier 1)
        const baseScore = 10 * Math.pow(2, tier - 1);
        addScore(baseScore * combo * (chainStep + 1));

        // Balanced Overdrive charge: Tier 1 (+2%), Tier 2 (+4%), Tier 3 (+7%), Tier 4 (+12%), Tier 5 (+18%)
        const tierChargeTable = [0, 2, 4, 7, 12, 18];
        const baseCharge = tierChargeTable[tier] || 2;
        const chargeBonus = Math.round(baseCharge * (1 + (combo - 1) * 0.25));
        addOverdriveCharge(chargeBonus);

        // Tactical Bounty checks & Supernova Token Bonus
        if (tier >= 3) {
            checkBountyProgress('laser', 1);
            checkAdventureObjective('trigger_laser', magnitude);
        }
        if (tier >= 4) {
            checkBountyProgress('supernova', 1);
            if (swapTokens < maxSwapTokens) {
                addSwapToken(1);
            }
        }
    }

    function damageDarkMatterTile(r, c, dmg = 1) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
        const target = grid[r][c];
        if (target && target.type === 'dark_matter') {
            target.hp -= dmg;
            sfx.playCrack();
            checkBountyProgress('dark_matter', dmg);
            const nx = boardOffsetX + c * cellW + cellW / 2;
            const ny = boardOffsetY + r * cellH + cellH / 2;
            createSparks(nx, ny, '#888', 8);

            if (target.hp <= 0) {
                // Shattered into a fresh random number!
                const val = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
                grid[r][c] = createTile(val);
                addFloatingText('SHATTERED!', nx, ny, '#fff');
                addScore(15);
                checkAdventureObjective('clear_dark_matter', 1);
            } else {
                target.flash = 0.8;
            }
        }
    }

    function damageAdjacentDarkMatter(r, c) {
        const neighbors = [
            [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
        ];
        neighbors.forEach(([nr, nc]) => damageDarkMatterTile(nr, nc, 1));
    }

    function damageLaserPath(r1, c1, r2, c2) {
        const rowsToBlast = new Set([r1, r2]);
        const colsToBlast = new Set([c1, c2]);

        rowsToBlast.forEach(r => {
            for (let c = 0; c < COLS; c++) {
                damageDarkMatterTile(r, c, 1);
            }
        });

        colsToBlast.forEach(c => {
            for (let r = 0; r < ROWS; r++) {
                damageDarkMatterTile(r, c, 1);
            }
        });
    }

    function damageSupernovaArea(r1, c1, r2, c2) {
        const minR = Math.max(0, Math.min(r1, r2) - 1);
        const maxR = Math.min(ROWS - 1, Math.max(r1, r2) + 1);
        const minC = Math.max(0, Math.min(c1, c2) - 1);
        const maxC = Math.min(COLS - 1, Math.max(c1, c2) + 1);

        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                const tile = grid[r][c];
                if (!tile) continue;

                if (tile.type === 'dark_matter') {
                    // Deal 2 damage to Dark Matter (vaporizes it!)
                    damageDarkMatterTile(r, c, 2);
                } else if (tile.type === 'number') {
                    // Vaporize smaller clutter tiles in the crater
                    if (Math.abs(tile.value) <= 4) {
                        const tx = boardOffsetX + c * cellW + cellW / 2;
                        const ty = boardOffsetY + r * cellH + cellH / 2;
                        createSparks(tx, ty, '#ffd700', 10);
                        grid[r][c] = null;
                    }
                }
            }
        }
    }

    function damageHyperspace() {
        for (let r = ROWS - 3; r < ROWS; r++) {
            if (r >= 0) {
                for (let c = 0; c < COLS; c++) {
                    const tile = grid[r][c];
                    if (tile) {
                        const tx = boardOffsetX + c * cellW + cellW / 2;
                        const ty = boardOffsetY + r * cellH + cellH / 2;
                        createSparks(tx, ty, '#c471ed', 12);
                        grid[r][c] = null;
                    }
                }
            }
        }
    }

    async function pushRisingRow() {
        sfx.playWarning();
        triggerScreenShake(5);

        // Shift all rows up by 1
        for (let r = 0; r < ROWS - 1; r++) {
            grid[r] = grid[r + 1];
        }

        // Create new bottom row of Dark Matter blocks with a few number gaps
        const newRow = [];
        for (let c = 0; c < COLS; c++) {
            if (Math.random() < 0.6) {
                newRow.push(createTile(0, 'dark_matter'));
            } else {
                const val = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
                newRow.push(createTile(val));
            }
        }
        grid[ROWS - 1] = newRow;

        addFloatingText('REACTOR PRESSURE RISE!', canvas.width / (2 * dpr), boardOffsetY + cellH * 3, 'var(--danger)', 1.3);
        await delay(200);
    }

    function countRemainingDarkMatter() {
        let count = 0;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c] && grid[r][c].type === 'dark_matter') {
                    count++;
                }
            }
        }
        return count;
    }

    function checkAdventureObjective(type, payload = 1) {
        if (gameMode !== 'adventure' || !activeAdventureLevel || isGameOver) return;
        const obj = activeAdventureLevel.objective;
        if (!obj) return;

        if (obj.type === 'annihilations' && type === 'annihilations') {
            adventureProgress = Math.min(obj.target, adventureProgress + payload);
            if (adventureProgress >= obj.target) adventureObjectiveMet = true;
        } else if (obj.type === 'synthesis_tier' && type === 'synthesis_tier') {
            if (payload >= obj.target) {
                adventureProgress = obj.target;
                adventureObjectiveMet = true;
            } else {
                adventureProgress = Math.max(adventureProgress, payload);
            }
        } else if (obj.type === 'clear_dark_matter' && type === 'clear_dark_matter') {
            const remaining = countRemainingDarkMatter();
            adventureProgress = Math.max(0, obj.target - remaining);
            if (remaining === 0) {
                adventureProgress = obj.target;
                adventureObjectiveMet = true;
            }
        } else if (obj.type === 'trigger_laser' && type === 'trigger_laser') {
            adventureProgress = 1;
            adventureObjectiveMet = true;
        } else if (obj.type === 'activate_frenzy' && type === 'activate_frenzy') {
            adventureProgress = 1;
            adventureObjectiveMet = true;
        }

        updateAdventureObjectiveUI();
    }

    function updateAdventureObjectiveUI() {
        if (!activeAdventureLevel || gameMode !== 'adventure') return;
        const obj = activeAdventureLevel.objective;
        if (!obj) return;

        if (advObjDesc) advObjDesc.textContent = activeAdventureLevel.desc;

        let currentVal = adventureProgress;
        let targetVal = obj.target;
        let text = `${Math.min(currentVal, targetVal)} / ${targetVal}`;
        let pct = Math.min(100, Math.round((currentVal / targetVal) * 100));

        if (obj.type === 'synthesis_tier') {
            text = currentVal >= targetVal ? 'COMPLETE! ✨' : `+${currentVal} / +${targetVal}`;
            pct = currentVal >= targetVal ? 100 : Math.round((currentVal / targetVal) * 100);
        } else if (obj.type === 'activate_frenzy' || obj.type === 'trigger_laser') {
            text = currentVal >= targetVal ? 'COMPLETE! 🔥' : 'Pending...';
            pct = currentVal >= targetVal ? 100 : 0;
        }

        if (advObjProgress) advObjProgress.textContent = text;
        if (advObjFill) advObjFill.style.width = `${pct}%`;

        // Real-time 3-star preview
        const s1 = adventureProgress >= targetVal ? '⭐' : '☆';
        const s2 = dropsUsed <= activeAdventureLevel.targetDropsForStar ? '⭐' : '☆';
        const s3 = score >= activeAdventureLevel.targetScoreForStar ? '⭐' : '☆';
        if (advObjStars) advObjStars.textContent = `${s1}${s2}${s3}`;
    }

    function checkGameOver() {
        if (isTutorial) return; // Tutorial mode never triggers game over
        // 1. If any tile reaches row 0, reactor breach!
        for (let c = 0; c < COLS; c++) {
            if (grid[0][c]) {
                triggerGameOver("The reactor exceeded critical threshold capacity!");
                return;
            }
        }

        // 2. Adventure Mode Completion / Depletion checks
        if (gameMode === 'adventure') {
            if (adventureObjectiveMet) {
                triggerAdventureVictory();
                return;
            }
            if (dropsUsed >= maxDrops) {
                triggerGameOver("Out of Quantum Drops! The sector could not be stabilized in time.");
                return;
            }
        }
    }

    function triggerGameOver(message = "The reactor exceeded critical threshold capacity!") {
        isGameOver = true;
        sfx.playGameOver();
        triggerScreenShake(18);

        const goScore = document.getElementById('go-score');
        const goBest = document.getElementById('go-best');
        const goCascade = document.getElementById('go-cascade');
        const goZeroes = document.getElementById('go-zeroes');
        if (goScore) goScore.textContent = score.toLocaleString();
        if (goBest) {
            const best = gameMode === 'classic' ? (career.highScore || 0) : ((activeAdventureLevel && career.levelHighScores[activeAdventureLevel.id]) || 0);
            goBest.textContent = best.toLocaleString();
        }
        if (goCascade) goCascade.textContent = `${maxCombo}x`;
        if (goZeroes) goZeroes.textContent = totalZeroPoints;

        const descEl = modalGameOver.querySelector('p');
        if (descEl) descEl.textContent = message;

        setTimeout(() => {
            if (modalGameOver) modalGameOver.classList.add('visible');
        }, 400);
    }

    function triggerAdventureVictory() {
        if (isGameOver || (modalVictory && modalVictory.classList.contains('visible'))) return;
        isGameOver = true;
        sfx.playVictory();
        triggerScreenShake(8);

        const star1 = 1;
        const star2 = dropsUsed <= activeAdventureLevel.targetDropsForStar ? 1 : 0;
        const star3 = score >= activeAdventureLevel.targetScoreForStar ? 1 : 0;
        const totalStars = star1 + star2 + star3;

        const dropsLeft = Math.max(0, maxDrops - dropsUsed);
        const dropBonus = dropsLeft * 20;
        const finalScore = score + dropBonus;
        score = finalScore;
        scoreVal.textContent = score.toLocaleString();

        addFloatingText('SECTOR CLEARED!', canvas.width / (2 * dpr), boardOffsetY + cellH * 2.5, 'var(--gold)', 1.5);

        const isNodeLevel = !!(activeAdventureLevel && activeAdventureLevel.sectorNum);
        if (isNodeLevel) {
            const nodeId = activeAdventureLevel.id;
            const existingNode = (career.adventureNodes && career.adventureNodes[nodeId]) || {};
            if (!career.adventureNodes) career.adventureNodes = {};

            career.adventureNodes[nodeId] = {
                cleared: true,
                stars: Math.max(existingNode.stars || 0, totalStars),
                bestScore: Math.max(existingNode.bestScore || 0, finalScore),
                bestDrops: Math.min(existingNode.bestDrops || 999, dropsUsed)
            };

            // Unlock next connected node(s) in graph
            if (!career.unlockedNodes) career.unlockedNodes = ['1-1'];
            if (typeof NodeGenerator !== 'undefined') {
                const graph = NodeGenerator.getSectorGraph(activeAdventureLevel.sectorNum);
                const nextLinks = graph.links.filter(l => l.from === nodeId);
                nextLinks.forEach(l => {
                    if (!career.unlockedNodes.includes(l.to)) {
                        career.unlockedNodes.push(l.to);
                    }
                });

                // If cleared sector boss (e.g. 1-10), unlock next sector root node (e.g. 2-1)
                if (activeAdventureLevel.isBoss) {
                    const nextSectorRoot = `${activeAdventureLevel.sectorNum + 1}-1`;
                    if (!career.unlockedNodes.includes(nextSectorRoot)) {
                        career.unlockedNodes.push(nextSectorRoot);
                    }
                }
            }

            saveCareerData();

            if (victoryTitle) victoryTitle.textContent = `${activeAdventureLevel.title} Cleared!`;
            if (btnVicNext) {
                btnVicNext.textContent = 'Return to Map ➜';
            }
        } else {
            // Handcrafted Challenge Level
            const lvlId = activeAdventureLevel.id;
            career.levelStars[lvlId] = Math.max(career.levelStars[lvlId] || 0, totalStars);
            career.levelHighScores[lvlId] = Math.max(career.levelHighScores[lvlId] || 0, finalScore);
            if (lvlId >= career.unlockedLevel && lvlId < ADVENTURE_LEVELS.length) {
                career.unlockedLevel = lvlId + 1;
            }
            saveCareerData();

            if (victoryTitle) victoryTitle.textContent = `${activeAdventureLevel.sector || 'Mission'} Cleared!`;
            if (btnVicNext) {
                if (lvlId < ADVENTURE_LEVELS.length) {
                    btnVicNext.textContent = 'Next Challenge ➜';
                } else {
                    btnVicNext.textContent = 'Challenges Complete 🏆';
                }
            }
        }

        if (vicScore) vicScore.textContent = finalScore.toLocaleString();
        if (vicDrops) vicDrops.textContent = `${dropsUsed} / ${maxDrops}`;
        if (vicBonus) vicBonus.textContent = `+${dropBonus.toLocaleString()}`;
        if (vicCascade) vicCascade.textContent = `${maxCombo}x`;

        if (victoryStarsContainer) {
            victoryStarsContainer.innerHTML = `
                <span class="vic-star ${totalStars >= 1 ? 'active' : ''}">⭐</span>
                <span class="vic-star ${totalStars >= 2 ? 'active' : ''}">⭐</span>
                <span class="vic-star ${totalStars >= 3 ? 'active' : ''}">⭐</span>
            `;
        }

        setTimeout(() => {
            if (modalVictory) modalVictory.classList.add('visible');
        }, 500);
    }

    function addScore(pts) {
        score += pts;
        if (gameMode === 'classic') {
            if (score > career.highScore) {
                career.highScore = score;
                saveCareerData();
                bestVal.textContent = career.highScore.toLocaleString();
            }
        } else if (gameMode === 'adventure' && activeAdventureLevel) {
            if (activeAdventureLevel.sectorNum) {
                const existing = career.adventureNodes ? (career.adventureNodes[activeAdventureLevel.id]?.bestScore || 0) : 0;
                if (score > existing) {
                    bestVal.textContent = score.toLocaleString();
                }
            } else {
                const lvlBest = career.levelHighScores[activeAdventureLevel.id] || 0;
                if (score > lvlBest) {
                    bestVal.textContent = score.toLocaleString();
                }
            }
        }
        scoreVal.textContent = score.toLocaleString();
    }

    function addOverdriveCharge(pts) {
        if (isFrenzyActive) return;
        overdriveCharge = Math.min(100, Math.round(overdriveCharge + pts));
        if (overdriveCharge >= 100) {
            overdriveCharge = 100;
            if (!isProcessing && !isGameOver) {
                activateOverdrive();
            } else {
                pendingOverdriveActivation = true;
            }
        }
        updateHUD();
    }

    function activateOverdrive() {
        if (isFrenzyActive || isGameOver) return;

        isFrenzyActive = true;
        isOverdriveReady = false;
        frenzyTurnsRemaining = 1; // Auto-activated: triggers exactly ONE special power-up
        overdriveCharge = 0; // Resets immediately to 0% to begin charging towards the next special
        pendingOverdriveActivation = false;

        sfx.playOverdriveActivate();
        triggerHaptic('overdrive');
        triggerScreenShake(20);
        screenFlash = 0.75;
        screenFlashColor = '#ffd700';

        // Select the next special in rotation (Vortex -> Supernova Core -> Antimatter Nuke -> repeat)
        const special = FRENZY_SPECIALS[frenzySpecialIndex % FRENZY_SPECIALS.length];
        frenzySpecialIndex++;

        // Load ONLY this 1 special into the active launcher; upcoming queue remains untouched!
        currentOrb = { ...special };

        addFloatingText(`🔥 OVERDRIVE: ${special.label}! 🔥`, canvas.width / (2 * dpr), boardOffsetY + cellH * 3, '#ffd700', 1.5);
        checkBountyProgress('frenzy', 1);
        checkAdventureObjective('activate_frenzy', 1);
        updateHUD();
    }

    // Tactical Bounties System
    const BOUNTY_TEMPLATES = [
        {
            id: 'laser',
            title: 'Cross Laser Blast',
            desc: 'Detonate a ±4+ pair for a Tier 3+ Cross Laser',
            target: 1,
            rewardScore: 40,
            rewardSwap: 1,
            rewardOvd: 8,
            rewardText: '+40 PTS • +1 SWAP'
        },
        {
            id: 'supernova',
            title: 'Supernova Crater',
            desc: 'Trigger a Tier 4+ Supernova (±8 or higher)',
            target: 1,
            rewardScore: 60,
            rewardSwap: 1,
            rewardOvd: 12,
            rewardText: '+60 PTS • +1 SWAP'
        },
        {
            id: 'synthesis',
            title: 'Double Merge',
            desc: 'Merge identical numbers 2 times (e.g. +2 & +2)',
            target: 2,
            rewardScore: 30,
            rewardSwap: 1,
            rewardOvd: 6,
            rewardText: '+30 PTS • +1 SWAP'
        },
        {
            id: 'cascade',
            title: 'Cascade Surge',
            desc: 'Trigger a 2x or higher combo cascade chain',
            target: 1,
            rewardScore: 45,
            rewardSwap: 1,
            rewardOvd: 8,
            rewardText: '+45 PTS • +1 SWAP'
        },
        {
            id: 'dark_matter',
            title: 'Dark Matter Breach',
            desc: 'Damage or shatter 3 Dark Matter cores',
            target: 3,
            rewardScore: 40,
            rewardSwap: 1,
            rewardOvd: 8,
            rewardText: '+40 PTS • +1 SWAP'
        },
        {
            id: 'frenzy',
            title: 'Singularity Overdrive',
            desc: 'Activate Singularity Frenzy mode [F]',
            target: 1,
            rewardScore: 50,
            rewardSwap: 1,
            rewardOvd: 0,
            rewardText: '+50 PTS • +1 SWAP'
        }
    ];

    function generateBounty() {
        const pool = currentBounty 
            ? BOUNTY_TEMPLATES.filter(t => t.id !== currentBounty.id)
            : BOUNTY_TEMPLATES;
        const template = pool[Math.floor(Math.random() * pool.length)];
        return {
            ...template,
            progress: 0
        };
    }

    function updateBountyUI() {
        if (!currentBounty || !bountyCard) return;
        bountyName.textContent = currentBounty.title;
        bountyReward.textContent = currentBounty.rewardText;
        bountyDesc.textContent = currentBounty.desc;
        bountyProgressText.textContent = `${currentBounty.progress}/${currentBounty.target}`;
        const pct = Math.min(100, Math.round((currentBounty.progress / currentBounty.target) * 100));
        bountyProgressFill.style.width = `${pct}%`;
    }

    function checkBountyProgress(type, amount = 1) {
        if (!currentBounty || isGameOver) return;
        if (currentBounty.id === type) {
            currentBounty.progress = Math.min(currentBounty.target, currentBounty.progress + amount);
            updateBountyUI();
            if (currentBounty.progress >= currentBounty.target) {
                completeBounty();
            }
        }
    }

    function completeBounty() {
        if (!currentBounty) return;
        const b = currentBounty;
        addScore(b.rewardScore);
        if (b.rewardSwap) addSwapToken(b.rewardSwap);
        if (b.rewardOvd) addOverdriveCharge(b.rewardOvd);

        sfx.playBountyComplete();
        if (bountyCard) {
            bountyCard.classList.add('completed-flash');
            setTimeout(() => bountyCard.classList.remove('completed-flash'), 650);
        }

        addFloatingText(`🎯 BOUNTY: ${b.title}! ${b.rewardText}`, canvas.width / (2 * dpr), boardOffsetY + cellH * 2.2, '#ffd700', 1.35);

        currentBounty = generateBounty();
        updateBountyUI();
    }

    // Quantum Swap Mechanics
    function addSwapToken(qty = 1) {
        if (swapTokens >= maxSwapTokens) return;
        swapTokens = Math.min(maxSwapTokens, swapTokens + qty);
        sfx.playPowerup();
        addFloatingText('⚡ +1 SWAP TOKEN!', canvas.width / (2 * dpr), boardOffsetY + cellH * 1.5, '#00f2fe', 1.25);
        updateHUD();
    }

    function toggleSwapMode() {
        if (isProcessing || isGameOver || isTutorial) return;
        if (!isSwapModeActive && swapTokens <= 0) {
            triggerScreenShake(6);
            sfx.playWarning();
            addFloatingText('NO SWAP TOKENS! Earn via 8 drops or Bounties', canvas.width / (2 * dpr), boardOffsetY + cellH * 3, '#ff4e50', 1.1);
            return;
        }

        isSwapModeActive = !isSwapModeActive;
        firstSwapTile = null;

        if (isSwapModeActive) {
            sfx.playMove();
            triggerHaptic('swap');
            if (swapBanner) {
                swapBanner.style.display = 'block';
                swapBanner.textContent = 'SWAP MODE: Select first tile on board';
            }
        } else {
            if (swapBanner) swapBanner.style.display = 'none';
        }
        updateHUD();
    }

    function handleSwapClick(mouseX, mouseY) {
        if (!isSwapModeActive || isProcessing || isGameOver) return;

        const c = Math.floor((mouseX - boardOffsetX) / cellW);
        const r = Math.floor((mouseY - boardOffsetY) / cellH);

        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;

        if (!firstSwapTile) {
            // First selection must be an occupied tile
            if (!grid[r][c]) {
                sfx.playWarning();
                return;
            }
            firstSwapTile = { r, c };
            sfx.playMove();
            if (swapBanner) {
                swapBanner.textContent = 'Select adjacent tile to swap (or click same tile to cancel)';
            }
        } else {
            // Clicked same tile -> cancel selection
            if (firstSwapTile.r === r && firstSwapTile.c === c) {
                firstSwapTile = null;
                sfx.playMove();
                if (swapBanner) {
                    swapBanner.textContent = 'SWAP MODE: Select first tile on board';
                }
                return;
            }

            // Check orthogonal adjacency
            const isAdjacent = Math.abs(r - firstSwapTile.r) + Math.abs(c - firstSwapTile.c) === 1;

            if (!isAdjacent) {
                // If clicked another occupied tile, re-select it
                if (grid[r][c]) {
                    firstSwapTile = { r, c };
                    sfx.playMove();
                    if (swapBanner) {
                        swapBanner.textContent = 'Select adjacent tile to swap (or click same tile to cancel)';
                    }
                }
                return;
            }

            // Valid Swap Execution!
            const r1 = firstSwapTile.r;
            const c1 = firstSwapTile.c;
            const t1 = grid[r1][c1];
            const t2 = grid[r][c];

            grid[r1][c1] = t2;
            grid[r][c] = t1;

            // Smooth sliding animation for swap
            if (t2) {
                t2.animX = (c - c1) * cellW;
                t2.animY = (r - r1) * cellH;
                t2.flash = 0.8;
            }
            if (t1) {
                t1.animX = (c1 - c) * cellW;
                t1.animY = (r1 - r) * cellH;
                t1.flash = 0.8;
            }

            swapTokens = Math.max(0, swapTokens - 1);
            sfx.playQuantumSwap();
            triggerHaptic('swap');

            // Visual effects at both tiles
            const x1 = boardOffsetX + (c1 + 0.5) * cellW;
            const y1 = boardOffsetY + (r1 + 0.5) * cellH;
            const x2 = boardOffsetX + (c + 0.5) * cellW;
            const y2 = boardOffsetY + (r + 0.5) * cellH;
            createSparks(x1, y1, '#00f2fe', 16);
            createSparks(x2, y2, '#ffd700', 16);
            shockwaves.push({ x: (x1 + x2) / 2, y: (y1 + y2) / 2, radius: 10, maxRadius: cellW * 2.5, alpha: 1, color: '#00f2fe' });
            addFloatingText('QUANTUM SWAP!', (x1 + x2) / 2, (y1 + y2) / 2, '#ffd700', 1.3);

            isSwapModeActive = false;
            firstSwapTile = null;
            if (swapBanner) swapBanner.style.display = 'none';
            updateHUD();

            isProcessing = true;
            resolveBoardCascades(true); // isSwap = true
        }
    }

    function drawSwapModeHighlights() {
        if (!isSwapModeActive) return;

        ctx.save();
        // Pulsing border around the board
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(boardOffsetX + 2, boardOffsetY + 2, cellW * COLS - 4, cellH * ROWS - 4);

        if (firstSwapTile) {
            const selX = boardOffsetX + firstSwapTile.c * cellW + 3;
            const selY = boardOffsetY + firstSwapTile.r * cellH + 3;

            // Pulsing gold box around selected tile
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 14;
            ctx.strokeRect(selX, selY, cellW - 6, cellH - 6);

            // Adjacent target indicators
            const neighbors = [
                [firstSwapTile.r - 1, firstSwapTile.c],
                [firstSwapTile.r + 1, firstSwapTile.c],
                [firstSwapTile.r, firstSwapTile.c - 1],
                [firstSwapTile.r, firstSwapTile.c + 1]
            ];

            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00f2fe';
            ctx.strokeStyle = '#00f2fe';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);

            for (const [nr, nc] of neighbors) {
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    const nx = boardOffsetX + nc * cellW + 3;
                    const ny = boardOffsetY + nr * cellH + 3;
                    ctx.strokeRect(nx, ny, cellW - 6, cellH - 6);

                    // Small direction indicator dot toward neighbor
                    const cx = boardOffsetX + (nc + 0.5) * cellW;
                    const cy = boardOffsetY + (nr + 0.5) * cellH;
                    ctx.fillStyle = 'rgba(0, 242, 254, 0.7)';
                    ctx.beginPath();
                    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.restore();
    }

    // Fullscreen and Expanded View Controller
    function setupFullscreenUI() {
        if (!btnFullscreen) return;

        function updateFullscreenIcons() {
            const isFs = !!document.fullscreenElement || !!document.webkitFullscreenElement || (appEl && appEl.classList.contains('fullscreen-mode'));
            if (iconExpand) iconExpand.style.display = isFs ? 'none' : 'block';
            if (iconCompress) iconCompress.style.display = isFs ? 'block' : 'none';
        }

        btnFullscreen.addEventListener('click', () => {
            sfx.init();
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                const exitFs = document.exitFullscreen || document.webkitExitFullscreen;
                if (exitFs) exitFs.call(document).catch(() => {});
                if (appEl) appEl.classList.remove('fullscreen-mode');
                updateFullscreenIcons();
                setTimeout(resizeCanvas, 100);
            } else if (appEl && appEl.classList.contains('fullscreen-mode')) {
                appEl.classList.remove('fullscreen-mode');
                updateFullscreenIcons();
                setTimeout(resizeCanvas, 100);
            } else {
                const docEl = document.documentElement;
                const reqFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen;
                if (reqFs) {
                    reqFs.call(docEl).then(() => {
                        updateFullscreenIcons();
                        setTimeout(resizeCanvas, 100);
                    }).catch(() => {
                        if (appEl) appEl.classList.add('fullscreen-mode');
                        updateFullscreenIcons();
                        setTimeout(resizeCanvas, 100);
                    });
                } else {
                    if (appEl) appEl.classList.add('fullscreen-mode');
                    updateFullscreenIcons();
                    setTimeout(resizeCanvas, 100);
                }
            }
        });

        const onFsChange = () => {
            updateFullscreenIcons();
            setTimeout(resizeCanvas, 100);
        };

        document.addEventListener('fullscreenchange', onFsChange);
        document.addEventListener('webkitfullscreenchange', onFsChange);
    }

    function updateHUD() {
        comboVal.textContent = `${combo}x`;

        if (gameMode === 'adventure') {
            const dropsRemaining = Math.max(0, maxDrops - dropsUsed);
            riseCounter.textContent = `${dropsRemaining} Drop${dropsRemaining === 1 ? '' : 's'}`;
            if (turnCounterLabel) turnCounterLabel.textContent = 'Drops Left';
            if (riseStatusBar) {
                if (dropsRemaining <= 3) {
                    riseStatusBar.classList.add('danger-pulse');
                } else {
                    riseStatusBar.classList.remove('danger-pulse');
                }
            }
            updateAdventureObjectiveUI();
        } else {
            riseCounter.textContent = `${movesUntilRise} Drop${movesUntilRise === 1 ? '' : 's'}`;
            if (turnCounterLabel) turnCounterLabel.textContent = 'Rising In';
            if (riseStatusBar) {
                if (movesUntilRise <= 1) {
                    riseStatusBar.classList.add('danger-pulse');
                } else {
                    riseStatusBar.classList.remove('danger-pulse');
                }
            }
        }

        // Update Overdrive Gauge
        if (overdriveContainer && overdrivePercent && overdriveFill) {
            if (isFrenzyActive) {
                overdriveContainer.classList.add('frenzy-active');
                overdrivePercent.textContent = `OVERDRIVE ACTIVE`;
                overdrivePercent.style.color = '#ffd700';
                overdriveFill.style.width = `100%`;
            } else {
                overdriveContainer.classList.remove('frenzy-active');
                overdrivePercent.textContent = `${overdriveCharge}%`;
                overdrivePercent.style.color = 'var(--cyan)';
                overdriveFill.style.width = `${overdriveCharge}%`;
            }

            if (btnOverdrive) {
                btnOverdrive.style.display = 'none';
            }
            if (btnTouchFrenzy) {
                btnTouchFrenzy.style.display = 'none';
            }
        }

        // Update Swap Token UI
        if (swapTokenCount) {
            swapTokenCount.textContent = swapTokens;
        }
        if (btnSwapToken) {
            if (swapTokens > 0) {
                btnSwapToken.classList.add('has-tokens');
            } else {
                btnSwapToken.classList.remove('has-tokens');
            }
            if (isSwapModeActive) {
                btnSwapToken.classList.add('swap-mode-active');
            } else {
                btnSwapToken.classList.remove('swap-mode-active');
            }
        }
        if (btnTouchSwap) {
            if (isSwapModeActive) {
                btnTouchSwap.classList.add('swap-mode-active');
            } else {
                btnTouchSwap.classList.remove('swap-mode-active');
            }
        }

        // Update Tactical Bounty UI
        updateBountyUI();

        // Update Hold Slot UI
        if (heldOrb) {
            holdText.textContent = heldOrb.label;
            holdText.style.color = heldOrb.type === 'special' ? (heldOrb.subType === 'blackhole' ? '#ffd700' : 'var(--purple)') :
                                  (heldOrb.value > 0 ? 'var(--cyan)' : 'var(--orange)');
            holdText.style.fontSize = (heldOrb.label && heldOrb.label.length > 2) ? '1.05rem' : '1.25rem';
            holdText.style.fontWeight = (heldOrb.label === '±' || (heldOrb.label && heldOrb.label.startsWith('÷'))) ? '700' : '900';
            holdSlot.classList.add('active');
        } else {
            holdText.textContent = '-';
            holdText.style.color = 'var(--text-muted)';
            holdText.style.fontSize = '1.25rem';
            holdText.style.fontWeight = '900';
            holdSlot.classList.remove('active');
        }

        // Update Next Queue UI
        renderQueueSlot(nextSlot1, nextQueue[0]);
        renderQueueSlot(nextSlot2, nextQueue[1]);
    }

    function renderQueueSlot(element, orb) {
        if (!orb) {
            element.innerHTML = '';
            return;
        }
        const color = orb.type === 'special' ? 
            (orb.subType === 'blackhole' || orb.subType === 'supernova_core' ? 'var(--gold)' : 
             orb.subType === 'antimatter_nuke' ? 'var(--orange)' : 'var(--purple)') :
            (orb.value > 0 ? 'var(--cyan)' : 'var(--orange)');

        const isSpecialOp = orb.label === '±' || (orb.label && orb.label.startsWith('÷'));
        const fontWeight = isSpecialOp ? '700' : '900';
        const fontSize = (orb.label && orb.label.length > 2) ? '1.05rem' : '1.25rem';
        element.innerHTML = `<span class="queue-orb-label" style="font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color};">${orb.label}</span>`;
    }

    // Input Handlers
    function setupInputs() {
        // Mouse Hover & Click
        canvas.addEventListener('mousemove', (e) => {
            if (isProcessing || isGameOver || isPaused || currentScreen !== 'game') return;
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const col = Math.floor(mouseX / cellW);
            if (col >= 0 && col < COLS && col !== aimCol) {
                aimCol = col;
                sfx.playMove();
            }
        });

        // Touch Interaction - Direct Drag-to-Aim & Release-to-Drop
        let lastTouchTime = 0;
        let isTouchingCanvas = false;
        let touchCanceled = false;

        canvas.addEventListener('click', (e) => {
            if (isProcessing || isGameOver || isPaused || currentScreen !== 'game') return;
            // Prevent synthetic duplicate click right after mobile touchend
            if (Date.now() - lastTouchTime < 500) return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (isSwapModeActive) {
                handleSwapClick(mouseX, mouseY);
                return;
            }

            const col = Math.floor(mouseX / cellW);
            if (col >= 0 && col < COLS) {
                aimCol = col;
                dropActiveOrb();
            }
        });

        canvas.addEventListener('touchstart', (e) => {
            if (isProcessing || isGameOver || isPaused || currentScreen !== 'game') return;
            if (e.touches.length > 1) return; // Ignore multitouch gestures
            if (e.cancelable) e.preventDefault();

            lastTouchTime = Date.now();
            isTouchingCanvas = true;
            touchCanceled = false;

            const rect = canvas.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;
            const touchY = e.touches[0].clientY - rect.top;

            if (isSwapModeActive) {
                handleSwapClick(touchX, touchY);
                isTouchingCanvas = false;
                return;
            }

            const col = Math.floor(touchX / cellW);
            if (col >= 0 && col < COLS) {
                if (col !== aimCol) {
                    aimCol = col;
                    sfx.playMove();
                    triggerHaptic('tick');
                }
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            if (!isTouchingCanvas || isProcessing || isGameOver || isPaused || currentScreen !== 'game' || isSwapModeActive) return;
            if (e.cancelable) e.preventDefault(); // Prevents pull-to-refresh & screen dragging

            const rect = canvas.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;
            const touchY = e.touches[0].clientY - rect.top;

            // If dragged upwards past the top header, safely cancel drop intent
            if (touchY < -40) {
                touchCanceled = true;
                return;
            } else {
                touchCanceled = false;
            }

            const col = Math.floor(touchX / cellW);
            if (col >= 0 && col < COLS && col !== aimCol) {
                aimCol = col;
                sfx.playMove();
                triggerHaptic('tick');
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            if (!isTouchingCanvas) return;
            isTouchingCanvas = false;
            lastTouchTime = Date.now();

            if (touchCanceled || isProcessing || isGameOver || isPaused || currentScreen !== 'game' || isSwapModeActive) return;

            // Direct release-to-drop!
            dropActiveOrb();
        });

        canvas.addEventListener('touchcancel', () => {
            isTouchingCanvas = false;
            touchCanceled = true;
        });

        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' || e.key === 'p' || e.key === 'P') {
                if (currentScreen === 'game') {
                    if (isSwapModeActive) {
                        isSwapModeActive = false;
                        firstSwapTile = null;
                        if (swapBanner) swapBanner.style.display = 'none';
                        updateHUD();
                    } else {
                        togglePause();
                    }
                }
                return;
            }

            if (isGameOver || isPaused || currentScreen !== 'game') return;

            if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                if (aimCol > 0) {
                    aimCol--;
                    sfx.playMove();
                }
            } else if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                if (aimCol < COLS - 1) {
                    aimCol++;
                    sfx.playMove();
                }
            } else if (e.code === 'Space' || e.code === 'ArrowDown' || e.key === 'Enter') {
                e.preventDefault();
                if (!isSwapModeActive) {
                    dropActiveOrb();
                }
            } else if (e.key === 'c' || e.key === 'C') {
                swapHold();
            } else if (e.key === 's' || e.key === 'S') {
                toggleSwapMode();
            } else if (e.key === 'f' || e.key === 'F') {
                activateOverdrive();
            } else if (e.key === 'r' || e.key === 'R') {
                restartCurrentGame();
            }
        });

        // Button Listeners
        if (holdSlot) holdSlot.addEventListener('click', swapHold);
        if (btnTouchHold) btnTouchHold.addEventListener('click', swapHold);
        if (btnTouchDrop) btnTouchDrop.addEventListener('click', dropActiveOrb);
        if (btnSwapToken) btnSwapToken.addEventListener('click', toggleSwapMode);
        if (btnTouchSwap) btnTouchSwap.addEventListener('click', toggleSwapMode);
        if (btnOverdrive) btnOverdrive.addEventListener('click', activateOverdrive);
        if (btnTouchFrenzy) btnTouchFrenzy.addEventListener('click', activateOverdrive);

        if (btnRestart) btnRestart.addEventListener('click', restartCurrentGame);
        if (btnPlayAgain) btnPlayAgain.addEventListener('click', restartCurrentGame);

        // Resume audio and unstick processing on tab visibility changes / play breaks
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                lastTime = performance.now();
                if (sfx) sfx.resume();
                resizeCanvas();
                if (isProcessing && !activeProjectile) {
                    setTimeout(() => {
                        if (isProcessing && !activeProjectile) {
                            isProcessing = false;
                            updateHUD();
                        }
                    }, 250);
                }
            }
        });

        window.addEventListener('focus', () => {
            lastTime = performance.now();
            if (sfx) sfx.resume();
        });
    }

    // Main Game Loop (60 FPS)
    let lastTime = performance.now();
    function gameLoop(now) {
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (!isPaused && currentScreen === 'game') {
            update(dt);
        }
        if (currentScreen === 'game') {
            render();
        }

        requestAnimationFrame(gameLoop);
    }

    function update(dt) {
        // Projectile physics update
        if (activeProjectile) {
            const p = activeProjectile;
            p.y += p.vy;
            p.vy += 38 * dt * 60; // Gravity acceleration
            p.lifetime = (p.lifetime || 0) + dt;

            if (p.y >= p.targetY || p.lifetime > 2.5) {
                p.y = p.targetY;
                handleProjectileLanding();
            }
        }

        // Shake decay
        if (screenShake > 0) {
            screenShake = Math.max(0, screenShake - 30 * dt);
        }

        // Shockwaves update
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            const sw = shockwaves[i];
            sw.radius += (sw.maxRadius - sw.radius) * 12 * dt;
            sw.alpha -= 2.5 * dt;
            if (sw.alpha <= 0) {
                shockwaves.splice(i, 1);
            }
        }

        // Laser Beams update
        for (let i = laserBeams.length - 1; i >= 0; i--) {
            const b = laserBeams[i];
            b.alpha -= 3.5 * dt;
            if (b.alpha <= 0) {
                laserBeams.splice(i, 1);
            }
        }

        // Screen Flash decay
        if (screenFlash > 0) {
            screenFlash = Math.max(0, screenFlash - 4.5 * dt);
        }

        // Sparks update
        for (let i = particles.length - 1; i >= 0; i--) {
            const sp = particles[i];
            sp.x += sp.vx * dt * 60;
            sp.y += sp.vy * dt * 60;
            sp.vy += 0.25; // mild gravity
            sp.alpha -= sp.decay * dt * 60;
            if (sp.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        // Floating texts update
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.y -= 25 * dt;
            ft.alpha -= 1.2 * dt;
            if (ft.alpha <= 0) {
                floatingTexts.splice(i, 1);
            }
        }

        // Active Merge Animations update
        for (let i = activeMergeAnimations.length - 1; i >= 0; i--) {
            const a = activeMergeAnimations[i];
            a.elapsed += dt;
            a.progress = Math.min(1, a.elapsed / a.duration);
            if (a.progress >= 1) {
                if (a.onComplete) a.onComplete();
                activeMergeAnimations.splice(i, 1);
            }
        }

        // Active Zero Point Collapse Animations update
        for (let i = activeZeroPointCollapses.length - 1; i >= 0; i--) {
            const a = activeZeroPointCollapses[i];
            a.elapsed += dt;
            a.progress = Math.min(1, a.elapsed / a.duration);
            if (a.progress >= 1) {
                if (a.onComplete) a.onComplete();
                activeZeroPointCollapses.splice(i, 1);
            }
        }

        // Tile squash/stretch & positional slide return to 0/1
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const t = grid[r][c];
                if (t) {
                    t.scaleX += (1 - t.scaleX) * 12 * dt;
                    t.scaleY += (1 - t.scaleY) * 12 * dt;
                    if (t.animY !== 0) {
                        t.animY += (0 - t.animY) * Math.min(1, 22 * dt);
                        if (Math.abs(t.animY) < 1.0) {
                            t.animY = 0;
                            t.scaleX = 1.15;
                            t.scaleY = 0.85;
                        }
                    }
                    if (t.animX !== 0) {
                        t.animX += (0 - t.animX) * Math.min(1, 22 * dt);
                        if (Math.abs(t.animX) < 1.0) {
                            t.animX = 0;
                        }
                    }
                    if (t.flash > 0) {
                        t.flash = Math.max(0, t.flash - 3.5 * dt);
                    }
                }
            }
        }
    }

    // Rendering
    function render() {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.save();

        // Screen shake transform
        if (screenShake > 0) {
            const sx = (Math.random() - 0.5) * screenShake;
            const sy = (Math.random() - 0.5) * screenShake;
            ctx.translate(sx, sy);
        }

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        // 1. Draw Grid Background & Danger Threshold
        drawGridBackground(w, h);

        // 2. Draw Aim Line & Landing Ghost Preview
        drawAimerAndPreview();

        // 3. Draw Board Tiles
        drawTiles();

        // 3.2 Draw Active Merge & Collapse Animations (tethers, sliding orbs, vortices)
        drawMergeAndCollapseAnimations();

        // 3.5 Draw Swap Mode Selection Highlights
        drawSwapModeHighlights();

        // 4. Draw Active Falling Projectile
        drawActiveProjectile();

        // 5. Draw Launcher Capsule at the top
        drawLauncher();

        // 6. Draw Shockwaves & Sparks
        drawEffects();

        // 7. Draw Floating Texts
        drawFloatingTexts();

        ctx.restore();
    }

    function drawGridBackground(w, h) {
        // Grid column highlights
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let c = 1; c < COLS; c++) {
            const x = boardOffsetX + c * cellW;
            ctx.beginPath();
            ctx.moveTo(x, boardOffsetY);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        // Danger Line above Row 1
        const dangerY = boardOffsetY + cellH;
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(255, 42, 95, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, dangerY);
        ctx.lineTo(w, dangerY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 42, 95, 0.7)';
        ctx.font = '800 10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('CRITICAL THRESHOLD', w - 8, dangerY - 4);
        ctx.restore();
    }

    function getOrbFlavor(orb) {
        if (!orb) return 'pos';
        if (orb.type === 'special') {
            if (orb.subType === 'blackhole') return 'blackhole';
            if (orb.subType === 'supernova_core') return 'supernova_core';
            if (orb.subType === 'antimatter_nuke') return 'antimatter_nuke';
            return 'special';
        }
        return orb.value > 0 ? 'pos' : 'neg';
    }

    function drawLandingCellReticle(x, y, w, h, flavor) {
        ctx.save();
        const cx = x + w / 2;
        const cy = y + h / 2;
        const pulse = 0.88 + Math.sin(Date.now() / 220) * 0.12;

        // 1. Subtle, low-opacity landing cell wash
        let coreColor = 'rgba(255, 255, 255, 0.12)';
        let edgeColor = 'rgba(0, 242, 254, 0.08)';
        let strokeColor = 'rgba(0, 242, 254, 0.55)';

        if (flavor === 'neg') {
            edgeColor = 'rgba(255, 78, 80, 0.08)';
            strokeColor = 'rgba(255, 78, 80, 0.55)';
        } else if (flavor === 'synth') {
            coreColor = 'rgba(255, 255, 255, 0.16)';
            edgeColor = 'rgba(0, 242, 254, 0.12)';
            strokeColor = 'rgba(0, 242, 254, 0.65)';
        } else if (flavor === 'zero') {
            coreColor = 'rgba(255, 255, 255, 0.20)';
            edgeColor = 'rgba(0, 242, 254, 0.15)';
            strokeColor = 'rgba(255, 255, 255, 0.75)';
        } else if (flavor === 'blackhole') {
            coreColor = 'rgba(255, 255, 255, 0.14)';
            edgeColor = 'rgba(188, 19, 254, 0.12)';
            strokeColor = 'rgba(255, 215, 0, 0.65)';
        } else if (flavor === 'supernova_core') {
            coreColor = 'rgba(255, 255, 255, 0.16)';
            edgeColor = 'rgba(255, 215, 0, 0.12)';
            strokeColor = 'rgba(255, 215, 0, 0.65)';
        } else if (flavor === 'antimatter_nuke') {
            coreColor = 'rgba(255, 255, 255, 0.16)';
            edgeColor = 'rgba(255, 78, 80, 0.12)';
            strokeColor = 'rgba(255, 78, 80, 0.65)';
        } else if (flavor === 'special') {
            coreColor = 'rgba(255, 255, 255, 0.14)';
            edgeColor = 'rgba(196, 113, 237, 0.10)';
            strokeColor = 'rgba(196, 113, 237, 0.55)';
        }

        const padGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(w, h) * 0.7);
        padGrad.addColorStop(0, coreColor);
        padGrad.addColorStop(0.65, edgeColor);
        padGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

        ctx.fillStyle = padGrad;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 10);
        ctx.fill();

        // 2. Glowing perimeter border
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 4]);
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 6 * pulse;
        ctx.stroke();
        ctx.setLineDash([]);

        // 3. Delicate corner brackets
        const bracketLen = Math.min(8, w * 0.18);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 4 * pulse;

        // Top-Left
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 3 + bracketLen);
        ctx.lineTo(x + 3, y + 3);
        ctx.lineTo(x + 3 + bracketLen, y + 3);
        ctx.stroke();

        // Top-Right
        ctx.beginPath();
        ctx.moveTo(x + w - 3 - bracketLen, y + 3);
        ctx.lineTo(x + w - 3, y + 3);
        ctx.lineTo(x + w - 3, y + 3 + bracketLen);
        ctx.stroke();

        // Bottom-Left
        ctx.beginPath();
        ctx.moveTo(x + 3, y + h - 3 - bracketLen);
        ctx.lineTo(x + 3, y + h - 3);
        ctx.lineTo(x + 3 + bracketLen, y + h - 3);
        ctx.stroke();

        // Bottom-Right
        ctx.beginPath();
        ctx.moveTo(x + w - 3 - bracketLen, y + h - 3);
        ctx.lineTo(x + w - 3, y + h - 3);
        ctx.lineTo(x + w - 3, y + h - 3 - bracketLen);
        ctx.stroke();

        ctx.restore();
    }

    function drawAimerAndPreview() {
        if (isGameOver || isSwapModeActive) return;
        const col = aimCol;
        const centerX = boardOffsetX + col * cellW + cellW / 2;

        // Column highlight beam (lighter & luminous to guide eye down the board)
        if (currentOrb && currentOrb.subType === 'blackhole') {
            const beamGrad = ctx.createLinearGradient(0, boardOffsetY, 0, boardOffsetY + cellH * ROWS);
            beamGrad.addColorStop(0, 'rgba(255, 215, 0, 0.12)');
            beamGrad.addColorStop(1, 'rgba(188, 19, 254, 0.22)');
            ctx.fillStyle = beamGrad;
        } else {
            const isNeg = currentOrb && currentOrb.value < 0;
            const beamGrad = ctx.createLinearGradient(0, boardOffsetY, 0, boardOffsetY + cellH * ROWS);
            beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
            beamGrad.addColorStop(1, isNeg ? 'rgba(255, 78, 80, 0.16)' : 'rgba(0, 242, 254, 0.16)');
            ctx.fillStyle = beamGrad;
        }
        ctx.fillRect(boardOffsetX + col * cellW, boardOffsetY, cellW, cellH * ROWS);

        // Dashed trajectory centerline (hidden for now as requested)
        /*
        ctx.save();
        ctx.setLineDash([5, 5]);
        const centerLineColor = currentOrb && currentOrb.subType === 'blackhole' ? 'rgba(255, 215, 0, 0.70)' :
                                (currentOrb && currentOrb.value < 0 ? 'rgba(255, 120, 130, 0.65)' : 'rgba(100, 245, 255, 0.65)');
        ctx.strokeStyle = centerLineColor;
        ctx.shadowColor = centerLineColor;
        ctx.shadowBlur = 6;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(centerX, cellH * 0.9);
        ctx.lineTo(centerX, boardOffsetY + cellH * ROWS);
        ctx.stroke();
        ctx.restore();
        */

        // Ghost Tile & Mathematical Outcome Preview!
        if (!activeProjectile && currentOrb) {
            let landingRow = -1;
            for (let r = ROWS - 1; r >= 0; r--) {
                if (!grid[r][col]) {
                    landingRow = r;
                    break;
                }
            }

            const topRow = landingRow + 1;
            const hasTop = topRow < ROWS && grid[topRow][col] !== null;

            if (currentOrb.type === 'special') {
                const sub = currentOrb.subType;

                if (sub === 'blackhole') {
                    // Black Hole Vortex: entire column targeted!
                    ctx.save();
                    ctx.strokeStyle = '#ffd700';
                    ctx.lineWidth = 2.5;
                    ctx.shadowColor = '#bc13fe';
                    ctx.shadowBlur = 14;
                    ctx.strokeRect(boardOffsetX + col * cellW + 2, boardOffsetY + 2, cellW - 4, cellH * ROWS - 4);

                    ctx.fillStyle = '#ffd700';
                    ctx.font = '900 11px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('⚫ VORTEX (CRUSH COLUMN!)', centerX, boardOffsetY + 16);

                    const targetGhostRow = hasTop ? topRow : (landingRow >= 0 ? landingRow : 0);
                    const ghostY = boardOffsetY + targetGhostRow * cellH + cellH / 2;
                    drawLandingCellReticle(boardOffsetX + col * cellW, boardOffsetY + targetGhostRow * cellH, cellW, cellH, 'blackhole');
                    ctx.globalAlpha = 0.20;
                    drawTileGraphic(centerX, ghostY, cellW - 10, cellH - 10, currentOrb.label, 'blackhole', 0, true);
                    ctx.restore();
                } else if (sub === 'supernova_core' || sub === 'antimatter_nuke' || sub === 'zero') {
                    // 3x3 blast area weapon
                    const targetR = hasTop ? topRow : (landingRow >= 0 ? landingRow : ROWS - 1);
                    const rMin = Math.max(0, targetR - 1);
                    const rMax = Math.min(ROWS - 1, targetR + 1);
                    const cMin = Math.max(0, col - 1);
                    const cMax = Math.min(COLS - 1, col + 1);

                    const color = sub === 'supernova_core' ? '#ffd700' :
                                  sub === 'antimatter_nuke' ? '#ff4e50' : '#c471ed';
                    const textLabel = sub === 'supernova_core' ? '🌟 SUPERNOVA (3x3 CRATER!)' :
                                      sub === 'antimatter_nuke' ? '💥 NUKE (3x3 BLAST!)' : '💥 CLEAR 3x3';

                    ctx.save();
                    const areaX = boardOffsetX + cMin * cellW + 2;
                    const areaY = boardOffsetY + rMin * cellH + 2;
                    const areaW = (cMax - cMin + 1) * cellW - 4;
                    const areaH = (rMax - rMin + 1) * cellH - 4;

                    ctx.fillStyle = sub === 'supernova_core' ? 'rgba(255, 215, 0, 0.16)' :
                                    sub === 'antimatter_nuke' ? 'rgba(255, 78, 80, 0.16)' : 'rgba(196, 113, 237, 0.16)';
                    ctx.fillRect(areaX, areaY, areaW, areaH);

                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2.5;
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 12;
                    ctx.strokeRect(areaX, areaY, areaW, areaH);

                    ctx.fillStyle = color;
                    ctx.font = '900 11px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    const ghostY = boardOffsetY + targetR * cellH + cellH / 2;
                    ctx.fillText(textLabel, centerX, ghostY - cellH / 2 - 4);

                    drawLandingCellReticle(boardOffsetX + col * cellW, boardOffsetY + targetR * cellH, cellW, cellH, sub);
                    ctx.globalAlpha = 0.20;
                    drawTileGraphic(centerX, ghostY, cellW - 10, cellH - 10, currentOrb.label, getOrbFlavor(currentOrb), 0, true);
                    ctx.restore();
                } else if (hasTop) {
                    // Standard modifiers (invert, div2, mul2) affecting top tile
                    const ghostY = boardOffsetY + topRow * cellH + cellH / 2;

                    ctx.save();
                    drawLandingCellReticle(boardOffsetX + col * cellW, boardOffsetY + topRow * cellH, cellW, cellH, 'special');
                    ctx.strokeStyle = '#c471ed';
                    ctx.lineWidth = 2;
                    ctx.shadowColor = '#c471ed';
                    ctx.shadowBlur = 8;
                    ctx.strokeRect(boardOffsetX + col * cellW + 4, boardOffsetY + topRow * cellH + 4, cellW - 8, cellH - 8);

                    ctx.font = "700 11px 'Lato', 'Inter', sans-serif";
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = '#c471ed';
                    ctx.shadowBlur = 8;
                    const specialLabel = sub === 'invert' ? '➜ ± INVERT' :
                                         sub === 'div2' ? '➜ ÷2 DIVIDE' : '➜ ×2 AMPLIFY';
                    ctx.fillText(specialLabel, centerX, ghostY - cellH / 2 - 4);

                    ctx.globalAlpha = 0.20;
                    drawTileGraphic(centerX, ghostY, cellW - 10, cellH - 10, currentOrb.label, 'special', 0, true);
                    ctx.restore();
                } else if (landingRow >= 0) {
                    const ghostY = boardOffsetY + landingRow * cellH + cellH / 2;
                    ctx.save();
                    drawLandingCellReticle(boardOffsetX + col * cellW, boardOffsetY + landingRow * cellH, cellW, cellH, 'special');
                    ctx.globalAlpha = 0.20;
                    drawTileGraphic(centerX, ghostY, cellW - 10, cellH - 10, currentOrb.label, 'special', 0, true);
                    ctx.restore();
                }
            } else if (landingRow >= 0) {
                // Ghost preview at landingRow
                const ghostY = boardOffsetY + landingRow * cellH + cellH / 2;
                const cellLeft = boardOffsetX + col * cellW;
                const cellTop = boardOffsetY + landingRow * cellH;
                const orbVal = currentOrb.value;
                const orbFlavor = getOrbFlavor(currentOrb);

                // Check neighbors: below, left, right
                const neighbors = [];
                if (landingRow + 1 < ROWS && grid[landingRow + 1][col]) neighbors.push(grid[landingRow + 1][col]);
                if (col > 0 && grid[landingRow][col - 1]) neighbors.push(grid[landingRow][col - 1]);
                if (col < COLS - 1 && grid[landingRow][col + 1]) neighbors.push(grid[landingRow][col + 1]);

                let willZeroPoint = false;
                let willSynthesize = false;
                let previewTier = 1;

                if (currentOrb.type === 'number') {
                    for (const n of neighbors) {
                        if (n.type === 'number') {
                            if (n.value + orbVal === 0) {
                                willZeroPoint = true;
                                previewTier = Math.max(previewTier, getTier(Math.abs(orbVal)));
                            } else if (n.value === orbVal) {
                                willSynthesize = true;
                            }
                        }
                    }
                }

                // Draw lighter luminous landing cell reticle pad!
                drawLandingCellReticle(cellLeft, cellTop, cellW, cellH, willZeroPoint ? 'zero' : (willSynthesize ? 'synth' : orbFlavor));

                ctx.save();
                if (willZeroPoint) {
                    let previewLabel = '💥 ZERO BLAST (0)!';
                    let previewColor = '#ffffff';

                    if (previewTier === 2) {
                        previewLabel = '⚡ SHOCKWAVE BLAST!';
                        previewColor = '#00f2fe';
                    } else if (previewTier === 3) {
                        previewLabel = '⚡ CROSS LASER (Row & Col)!';
                        previewColor = '#00f2fe';
                    } else if (previewTier === 4) {
                        previewLabel = '🌟 SUPERNOVA (3x3 Area!)';
                        previewColor = '#ffd700';
                    } else if (previewTier === 5) {
                        previewLabel = '💥 HYPERSPACE SINGULARITY!';
                        previewColor = '#c471ed';
                    }

                    ctx.shadowColor = previewColor;
                    ctx.shadowBlur = 16;
                    ctx.strokeStyle = previewColor;
                    ctx.lineWidth = previewTier >= 3 ? 3 : 2.5;
                    ctx.strokeRect(cellLeft + 4, cellTop + 4, cellW - 8, cellH - 8);

                    ctx.fillStyle = previewColor;
                    ctx.font = '900 11px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(previewLabel, centerX, ghostY - cellH / 2 - 4);
                } else if (willSynthesize) {
                    const synthColor = orbVal > 0 ? '#00f2fe' : '#ff4e50';
                    ctx.shadowColor = synthColor;
                    ctx.shadowBlur = 12;
                    ctx.strokeStyle = synthColor;
                    ctx.lineWidth = 2.2;
                    ctx.strokeRect(cellLeft + 4, cellTop + 4, cellW - 8, cellH - 8);

                    ctx.fillStyle = '#ffffff';
                    ctx.font = "800 11px 'Lato', 'Inter', sans-serif";
                    ctx.textAlign = 'center';
                    ctx.shadowColor = synthColor;
                    ctx.shadowBlur = 8;
                    const nextVal = (orbVal * 2 > 0 ? '+' : '') + (orbVal * 2);
                    ctx.fillText(`✨ MERGE (➜ ${nextVal})`, centerX, ghostY - cellH / 2 - 4);
                } else {
                    // Standard drop indicator badge
                    const tagColor = orbFlavor === 'pos' ? '#a5f3fc' : '#fecdd3';
                    ctx.fillStyle = tagColor;
                    ctx.font = '800 10px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.shadowColor = orbFlavor === 'pos' ? '#00f2fe' : '#ff4e50';
                    ctx.shadowBlur = 8;
                    ctx.fillText('▼ LANDING', centerX, ghostY - cellH / 2 - 4);
                }

                // Render subtle low-opacity ghost tile (opacity 0.2)
                ctx.globalAlpha = 0.20;
                drawTileGraphic(centerX, ghostY, cellW - 10, cellH - 10, currentOrb.label, orbFlavor, 0, true);
                ctx.restore();
            }
        }

        // Tutorial Target Column Indicator
        if (isTutorial && tutorialTargetCol !== null) {
            drawTutorialTargetIndicator();
        }
    }

    function drawTiles() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile = grid[r][c];
                if (!tile) continue;

                const x = boardOffsetX + c * cellW + cellW / 2 + (tile.animX || 0);
                const y = boardOffsetY + r * cellH + cellH / 2 + (tile.animY || 0);
                const tw = (cellW - 8) * tile.scaleX;
                const th = (cellH - 8) * tile.scaleY;

                if (tile.type === 'dark_matter') {
                    drawDarkMatterTile(x, y, tw, th, tile.hp, tile.flash);
                } else {
                    const flavor = tile.value > 0 ? 'pos' : 'neg';
                    const label = tile.value > 0 ? `+${tile.value}` : `${tile.value}`;
                    drawTileGraphic(x, y, tw, th, label, flavor, tile.flash);
                }
            }
        }
    }

    function drawMergeAndCollapseAnimations() {
        // 1. Draw Active Synthesis Merges
        for (const anim of activeMergeAnimations) {
            const t = anim.progress;
            const ease = t * t * (3 - 2 * t); // smooth cubic curve
            const curAX = anim.xA + (anim.xB - anim.xA) * ease;
            const curAY = anim.yA + (anim.yB - anim.yA) * ease;

            const scaleA = Math.max(0.65, 1.0 - ease * 0.28);
            const scaleB = 1.0 + Math.sin(t * Math.PI) * 0.22;

            const flavorA = anim.tileA.value > 0 ? 'pos' : 'neg';
            const flavorB = anim.tileB.value > 0 ? 'pos' : 'neg';
            const labelA = anim.tileA.value > 0 ? `+${anim.tileA.value}` : `${anim.tileA.value}`;
            const labelB = anim.tileB.value > 0 ? `+${anim.tileB.value}` : `${anim.tileB.value}`;
            const beamColor = anim.fusedVal > 0 ? '#00f2fe' : '#ff4e50';

            // Energy fusion tether line connecting sliding A to target B
            ctx.save();
            ctx.strokeStyle = beamColor;
            ctx.lineWidth = 3.5 + Math.sin(t * Math.PI * 5) * 1.5;
            ctx.shadowColor = beamColor;
            ctx.shadowBlur = 12;
            ctx.setLineDash([6, 4]);
            ctx.lineDashOffset = -anim.elapsed * 140;
            ctx.beginPath();
            ctx.moveTo(curAX, curAY);
            ctx.lineTo(anim.xB, anim.yB);
            ctx.stroke();
            ctx.restore();

            // Pulsing absorption halo around target B
            ctx.save();
            const haloGrad = ctx.createRadialGradient(anim.xB, anim.yB, 4, anim.xB, anim.yB, (cellW / 1.7) * scaleB);
            haloGrad.addColorStop(0, anim.fusedVal > 0 ? 'rgba(0, 242, 254, 0.45)' : 'rgba(255, 78, 80, 0.45)');
            haloGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(anim.xB, anim.yB, (cellW / 1.7) * scaleB, 0, Math.PI * 2);
            ctx.fill();

            // Draw target Tile B (pulsing with absorption energy)
            const twB = (cellW - 8) * scaleB;
            const thB = (cellH - 8) * scaleB;
            drawTileGraphic(anim.xB, anim.yB, twB, thB, labelB, flavorB, 0.35 * Math.sin(t * Math.PI));

            // Draw moving Tile A (sliding with luminous wake)
            const twA = (cellW - 8) * scaleA;
            const thA = (cellH - 8) * scaleA;
            drawTileGraphic(curAX, curAY, twA, thA, labelA, flavorA, 0.45);
            ctx.restore();

            // Spawn fusion spark trail
            if (Math.random() < 0.65) {
                particles.push({
                    x: curAX + (Math.random() - 0.5) * 12,
                    y: curAY + (Math.random() - 0.5) * 12,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    alpha: 0.85,
                    decay: 0.045,
                    color: beamColor
                });
            }
        }

        // 2. Draw Active Zero Point Singularity Collapses
        for (const anim of activeZeroPointCollapses) {
            const t = anim.progress;
            const ease = t * t; // quadratic gravitational acceleration
            const curAX = anim.xA + (anim.midX - anim.xA) * ease;
            const curAY = anim.yA + (anim.midY - anim.yA) * ease;
            const curBX = anim.xB + (anim.midX - anim.xB) * ease;
            const curBY = anim.yB + (anim.midY - anim.yB) * ease;

            const scale = Math.max(0.18, 1.0 - ease * 0.82);
            const flavorA = anim.tileA.value > 0 ? 'pos' : 'neg';
            const flavorB = anim.tileB.value > 0 ? 'pos' : 'neg';
            const labelA = anim.tileA.value > 0 ? `+${anim.tileA.value}` : `${anim.tileA.value}`;
            const labelB = anim.tileB.value > 0 ? `+${anim.tileB.value}` : `${anim.tileB.value}`;

            // Singularity Accretion Vortex at midpoint
            ctx.save();
            const vortexR = (cellW * 0.44) * Math.sin(t * Math.PI * 0.95);
            const vortexGrad = ctx.createRadialGradient(anim.midX, anim.midY, 2, anim.midX, anim.midY, vortexR + 12);
            vortexGrad.addColorStop(0, '#000000');
            vortexGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.75)');
            vortexGrad.addColorStop(0.75, 'rgba(0, 242, 254, 0.45)');
            vortexGrad.addColorStop(1, 'rgba(255, 78, 80, 0)');
            ctx.fillStyle = vortexGrad;
            ctx.beginPath();
            ctx.arc(anim.midX, anim.midY, vortexR + 12, 0, Math.PI * 2);
            ctx.fill();

            // Dual rotating accretion arms (Cyan and Coral)
            const spin = anim.elapsed * 22;
            ctx.lineWidth = 2.8;
            ctx.shadowBlur = 12;

            // Cyan arm
            ctx.strokeStyle = '#00f2fe';
            ctx.shadowColor = '#00f2fe';
            ctx.beginPath();
            ctx.arc(anim.midX, anim.midY, vortexR * 0.85, spin, spin + Math.PI * 0.8);
            ctx.stroke();

            // Coral arm
            ctx.strokeStyle = '#ff4e50';
            ctx.shadowColor = '#ff4e50';
            ctx.beginPath();
            ctx.arc(anim.midX, anim.midY, vortexR * 0.85, spin + Math.PI, spin + Math.PI * 1.8);
            ctx.stroke();

            // Electric plasma tether linking the two collapsing orbs
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.4;
            ctx.shadowColor = '#00f2fe';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(curAX, curAY);
            ctx.lineTo(anim.midX, anim.midY);
            ctx.lineTo(curBX, curBY);
            ctx.stroke();
            ctx.restore();

            // Draw compressed collapsing orbs
            ctx.save();
            const twA = (cellW - 8) * scale;
            const thA = (cellH - 8) * scale;
            drawTileGraphic(curAX, curAY, twA, thA, labelA, flavorA, 0.5 + t * 0.5);

            const twB = (cellW - 8) * scale;
            const thB = (cellH - 8) * scale;
            drawTileGraphic(curBX, curBY, twB, thB, labelB, flavorB, 0.5 + t * 0.5);
            ctx.restore();

            // Inward spiral suction sparks
            if (Math.random() < 0.7) {
                const angle = Math.random() * Math.PI * 2;
                const dist = cellW * (0.3 + Math.random() * 0.4);
                particles.push({
                    x: anim.midX + Math.cos(angle) * dist,
                    y: anim.midY + Math.sin(angle) * dist,
                    vx: -Math.cos(angle) * 3,
                    vy: -Math.sin(angle) * 3,
                    alpha: 0.9,
                    decay: 0.05,
                    color: Math.random() < 0.5 ? '#00f2fe' : '#ff4e50'
                });
            }
        }
    }

    function drawTileGraphic(x, y, w, h, label, flavor, flash = 0, isGhost = false) {
        ctx.save();
        ctx.translate(x, y);

        const r = 12; // Corner radius
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, r);

        if (isGhost) {
            // Blueprint / Holographic ghost preview aesthetic (distinct from solid board tiles)
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.8;

            if (flavor === 'pos') {
                ctx.fillStyle = 'rgba(0, 242, 254, 0.20)';
                ctx.fill();
                ctx.strokeStyle = '#00f2fe';
                ctx.stroke();
                ctx.fillStyle = '#ffffff';
            } else if (flavor === 'neg') {
                ctx.fillStyle = 'rgba(255, 78, 80, 0.20)';
                ctx.fill();
                ctx.strokeStyle = '#ff4e50';
                ctx.stroke();
                ctx.fillStyle = '#ffffff';
            } else if (flavor === 'blackhole') {
                ctx.fillStyle = 'rgba(188, 19, 254, 0.25)';
                ctx.fill();
                ctx.strokeStyle = '#ffd700';
                ctx.stroke();
                ctx.fillStyle = '#ffd700';
            } else if (flavor === 'supernova_core') {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
                ctx.fill();
                ctx.strokeStyle = '#ffd700';
                ctx.stroke();
                ctx.fillStyle = '#ffffff';
            } else if (flavor === 'antimatter_nuke') {
                ctx.fillStyle = 'rgba(255, 78, 80, 0.25)';
                ctx.fill();
                ctx.strokeStyle = '#ff4e50';
                ctx.stroke();
                ctx.fillStyle = '#ffffff';
            } else { // 'special'
                ctx.fillStyle = 'rgba(196, 113, 237, 0.20)';
                ctx.fill();
                ctx.strokeStyle = '#c471ed';
                ctx.stroke();
                ctx.fillStyle = '#ffffff';
            }
            ctx.setLineDash([]);
        } else {
            // Standard tile rendering (solid, contrasty on board)
            if (flavor === 'pos') {
                // Cyan Glow Matter
                const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
                grad.addColorStop(0, 'rgba(0, 242, 254, 0.28)');
                grad.addColorStop(1, 'rgba(0, 160, 254, 0.12)');
                ctx.fillStyle = grad;
                ctx.fill();

                ctx.strokeStyle = '#00f2fe';
                ctx.lineWidth = 2;
                ctx.shadowColor = 'rgba(0, 242, 254, 0.5)';
                ctx.shadowBlur = 8;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
            } else if (flavor === 'neg') {
                // Neon Orange / Coral Anti-Matter
                const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
                grad.addColorStop(0, 'rgba(255, 78, 80, 0.28)');
                grad.addColorStop(1, 'rgba(255, 42, 95, 0.12)');
                ctx.fillStyle = grad;
                ctx.fill();

                ctx.strokeStyle = '#ff4e50';
                ctx.lineWidth = 2;
                ctx.shadowColor = 'rgba(255, 78, 80, 0.5)';
                ctx.shadowBlur = 8;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
            } else if (flavor === 'blackhole') {
                // Black Hole Vortex: Event Horizon Void & Gold/Violet Accretion Disk
                const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, Math.max(w, h) / 1.5);
                grad.addColorStop(0, '#020005');
                grad.addColorStop(0.65, '#0a0118');
                grad.addColorStop(1, '#1b0336');
                ctx.fillStyle = grad;
                ctx.fill();

                // Pulsing golden accretion boundary
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = '#bc13fe';
                ctx.shadowBlur = 14;
                ctx.stroke();

                // Subtle inner accretion ring
                ctx.beginPath();
                ctx.arc(0, 0, Math.min(w, h) * 0.32, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(188, 19, 254, 0.5)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#ffd700';
            } else if (flavor === 'supernova_core') {
                // Supernova Core: Blazing Solar Flare
                const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
                grad.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
                grad.addColorStop(1, 'rgba(255, 120, 0, 0.25)');
                ctx.fillStyle = grad;
                ctx.fill();

                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
                ctx.shadowBlur = 12;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
            } else if (flavor === 'antimatter_nuke') {
                // Antimatter Nuke: Crimson Warhead
                const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
                grad.addColorStop(0, 'rgba(255, 78, 80, 0.45)');
                grad.addColorStop(1, 'rgba(255, 0, 80, 0.25)');
                ctx.fillStyle = grad;
                ctx.fill();

                ctx.strokeStyle = '#ff4e50';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = 'rgba(255, 42, 95, 0.75)';
                ctx.shadowBlur = 12;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
            } else if (flavor === 'special') {
                // Purple Quantum Orb
                const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
                grad.addColorStop(0, 'rgba(196, 113, 237, 0.35)');
                grad.addColorStop(1, 'rgba(18, 194, 233, 0.2)');
                ctx.fillStyle = grad;
                ctx.fill();

                ctx.strokeStyle = '#c471ed';
                ctx.lineWidth = 2;
                ctx.shadowColor = 'rgba(196, 113, 237, 0.6)';
                ctx.shadowBlur = 10;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
            }
        }

        // Flash overlay on impact/fusion
        if (flash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
            ctx.fill();
        }

        // Draw Value Label (adapt font size to text length so labels fit nicely)
        ctx.shadowBlur = 0;
        if (isGhost) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        }
        // Use Lato for clean, unambiguous numbers and distinct ± and ÷ glyphs
        const isSpecialOp = (label === '±' || (label && label.startsWith('÷')));
        const weight = isSpecialOp ? '700' : '900';
        if (label.length > 5) {
            ctx.font = `${weight} 0.82rem 'Lato', 'Inter', sans-serif`;
        } else if (label.length > 2) {
            ctx.font = `${weight} 1.05rem 'Lato', 'Inter', sans-serif`;
        } else {
            ctx.font = `${weight} 1.25rem 'Lato', 'Inter', sans-serif`;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 1);

        ctx.restore();
    }

    function drawDarkMatterTile(x, y, w, h, hp, flash) {
        ctx.save();
        ctx.translate(x, y);

        const r = 10;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, r);
        ctx.fillStyle = '#161a29';
        ctx.fill();

        ctx.strokeStyle = hp > 1 ? '#3a445d' : '#e06c75';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cracks pattern if HP is 1
        if (hp === 1) {
            ctx.strokeStyle = '#e06c75';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-w * 0.3, -h * 0.2);
            ctx.lineTo(0, 0);
            ctx.lineTo(w * 0.3, h * 0.2);
            ctx.moveTo(0, 0);
            ctx.lineTo(-w * 0.1, h * 0.3);
            ctx.stroke();
        }

        if (flash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
            ctx.fill();
        }

        ctx.fillStyle = '#7a889b';
        ctx.font = '800 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hp > 1 ? 'DARK CORE' : 'CRACKED', 0, 0);

        ctx.restore();
    }

    function drawLauncher() {
        if (isGameOver) return;
        const col = aimCol;
        const centerX = boardOffsetX + col * cellW + cellW / 2;
        const centerY = cellH * 0.55;

        // Draw launcher cursor base
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(centerX - cellW * 0.45, centerY - cellH * 0.45, cellW * 0.9, cellH * 0.9, 14);
        ctx.fill();

        // Draw active orb in launcher if not currently flying
        if (!activeProjectile && currentOrb) {
            const flavor = getOrbFlavor(currentOrb);
            drawTileGraphic(centerX, centerY, cellW - 12, cellH - 12, currentOrb.label, flavor);
        }
        ctx.restore();
    }

    function drawActiveProjectile() {
        if (!activeProjectile) return;
        const p = activeProjectile;
        const flavor = getOrbFlavor(p.orb);
        drawTileGraphic(p.x, p.y, cellW - 10, cellH - 10, p.orb.label, flavor);
    }

    function drawEffects() {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        // 1. Cross Laser Beams (Tier 3)
        for (const beam of laserBeams) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, beam.alpha);
            ctx.shadowColor = beam.color || '#00f2fe';
            ctx.shadowBlur = 24;

            if (beam.type === 'horizontal') {
                const by = boardOffsetY + beam.row * cellH + cellH / 2;
                ctx.fillStyle = beam.color || '#00f2fe';
                ctx.fillRect(0, by - beam.width / 2, w, beam.width);

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, by - beam.width / 4, w, beam.width / 2);
            } else if (beam.type === 'vertical') {
                const bx = boardOffsetX + beam.col * cellW + cellW / 2;
                ctx.fillStyle = beam.color || '#00f2fe';
                ctx.fillRect(bx - beam.width / 2, boardOffsetY, beam.width, h - boardOffsetY);

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(bx - beam.width / 4, boardOffsetY, beam.width / 2, h - boardOffsetY);
            }
            ctx.restore();
        }

        // 2. Shockwaves
        for (const sw of shockwaves) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${sw.alpha})`;
            ctx.lineWidth = 3;
            ctx.shadowColor = sw.color;
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.restore();
        }

        // 3. Sparks
        for (const sp of particles) {
            ctx.save();
            ctx.fillStyle = sp.color;
            ctx.globalAlpha = sp.alpha;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 4. Screen Flash (Tier 4 / 5)
        if (screenFlash > 0) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, screenFlash);
            ctx.fillStyle = screenFlashColor || '#ffffff';
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        }
    }

    function drawFloatingTexts() {
        for (const ft of floatingTexts) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.font = `900 ${14 * (ft.scale || 1)}px 'Lato', 'Inter', sans-serif`;
            ctx.fillStyle = ft.color;
            ctx.textAlign = 'center';
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 8;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    }

    function createSparks(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                color: color,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.03
            });
        }
    }

    function addFloatingText(text, x, y, color = '#ffffff', scale = 1) {
        floatingTexts.push({
            text: text,
            x: x,
            y: y,
            color: color,
            alpha: 1,
            scale: scale
        });
    }

    function triggerScreenShake(magnitude = 6) {
        const factor = (career && career.settings) ? (career.settings.shake === 'off' ? 0 : career.settings.shake === 'mild' ? 0.4 : 1.0) : 1.0;
        screenShake = Math.max(screenShake, magnitude * factor);
    }

    // Native & Web Haptics Controller (Unified Capacitor & Browser)
    function triggerHaptic(type = 'light') {
        if (!career || !career.settings || career.settings.vibration === false) return;

        // Capacitor Native Plugin support (@capacitor/haptics)
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
            try {
                const Haptics = window.Capacitor.Plugins.Haptics;
                switch (type) {
                    case 'tick':
                        if (Haptics.selectionChanged) Haptics.selectionChanged();
                        return;
                    case 'drop':
                        if (Haptics.impact) Haptics.impact({ style: 'MEDIUM' });
                        return;
                    case 'merge':
                        if (Haptics.impact) Haptics.impact({ style: 'LIGHT' });
                        return;
                    case 'swap':
                        if (Haptics.selectionChanged) Haptics.selectionChanged();
                        return;
                    case 'zero':
                        if (Haptics.notification) Haptics.notification({ type: 'SUCCESS' });
                        else if (Haptics.impact) Haptics.impact({ style: 'HEAVY' });
                        return;
                    case 'laser':
                    case 'supernova':
                        if (Haptics.impact) Haptics.impact({ style: 'HEAVY' });
                        return;
                    case 'overdrive':
                        if (Haptics.notification) Haptics.notification({ type: 'WARNING' });
                        return;
                    default:
                        if (Haptics.impact) Haptics.impact({ style: 'LIGHT' });
                        return;
                }
            } catch (e) {
                // Fallback to navigator.vibrate if Capacitor call fails
            }
        }

        // Standard Web Vibration API
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            try {
                switch (type) {
                    case 'tick':
                        navigator.vibrate(8);
                        break;
                    case 'drop':
                        navigator.vibrate(18);
                        break;
                    case 'merge':
                        navigator.vibrate(28);
                        break;
                    case 'swap':
                        navigator.vibrate(12);
                        break;
                    case 'zero':
                        navigator.vibrate([25, 30, 35]);
                        break;
                    case 'laser':
                        navigator.vibrate([20, 30, 20, 30, 45]);
                        break;
                    case 'supernova':
                        navigator.vibrate([40, 30, 50, 30, 70]);
                        break;
                    case 'overdrive':
                        navigator.vibrate([30, 30, 50, 40, 60]);
                        break;
                    default:
                        navigator.vibrate(15);
                        break;
                }
            } catch (e) {
                // Silently ignore if blocked by browser policy
            }
        }
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Run Game
    init();
})();
