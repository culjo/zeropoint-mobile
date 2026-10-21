/**
 * NULLFALL — Puzzle Cascade
 * Core Game Engine
 */

(function () {
    'use strict';

    // Game Constants
    const COLS = 6;
    const ROWS = 8;
    const DANGER_ROW = 1; // Row index where warning fires (0 is game over top)
    const MOVES_PER_RISE = 5;

    // Main gameplay (drag & place): maingameplay.html — the app's start page — sets
    // data-gameplay="maingameplay" on <body>. Orbs are dragged up from a two-slot tray instead of
    // dropped from the launcher, and swaps happen by sliding a board tile. index.html keeps the
    // classic drop controls, reachable from the Labs switch in debug mode.
    const MAIN_GAMEPLAY = document.body.dataset.gameplay === 'maingameplay';
    const DEBUG_MODE_KEY = 'zeropoint_debug_mode';

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
    const sectorPills = document.getElementById('sector-pills');
    const advWorldSealed = document.getElementById('adv-world-sealed');
    const advWorldSealedTitle = document.getElementById('adv-world-sealed-title');
    const advWorldSealedDesc = document.getElementById('adv-world-sealed-desc');
    const nodeSheet = document.getElementById('node-sheet');
    const nodeSheetKicker = document.getElementById('node-sheet-kicker');
    const nodeSheetTitle = document.getElementById('node-sheet-title');
    const nodeSheetDesc = document.getElementById('node-sheet-desc');
    const nodeSheetStars = document.getElementById('node-sheet-stars');
    const nodeSheetChips = document.getElementById('node-sheet-chips');
    const btnNodeSheetLaunch = document.getElementById('btn-node-sheet-launch');
    const nodeSheetCta = document.getElementById('node-sheet-cta');
    const nodeSheetLocked = document.getElementById('node-sheet-locked');
    const nodeSheetLockedText = document.getElementById('node-sheet-locked-text');

    // Challenges DOM Elements
    const btnChallengesToHome = document.getElementById('btn-challenges-to-home') || document.getElementById('btn-adv-to-home');
    const challengesHeaderStars = document.getElementById('challenges-header-stars') || document.getElementById('adv-header-stars');
    const challengesLevelsGrid = document.getElementById('challenges-levels-grid') || document.getElementById('adventure-levels-grid');
    const btnAdvToHome = document.getElementById('btn-adv-to-home');
    const advHeaderStars = document.getElementById('adv-header-stars');
    const adventureLevelsGrid = document.getElementById('adventure-levels-grid');
    const challengesKicker = document.getElementById('challenges-kicker');
    const chalTraining = document.getElementById('chal-training');
    const chalTrainingStars = document.getElementById('chal-training-stars');
    const chalSheet = document.getElementById('chal-sheet');
    const chalSheetKicker = document.getElementById('chal-sheet-kicker');
    const chalSheetTitle = document.getElementById('chal-sheet-title');
    const chalSheetDesc = document.getElementById('chal-sheet-desc');
    const chalSheetStars = document.getElementById('chal-sheet-stars');
    const chalSheetChips = document.getElementById('chal-sheet-chips');
    const btnChalLaunch = document.getElementById('btn-chal-launch');
    const chalSheetCta = document.getElementById('chal-sheet-cta');
    const chalSheetLocked = document.getElementById('chal-sheet-locked');
    const chalSheetLockedText = document.getElementById('chal-sheet-locked-text');

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
    const advObjDesc = document.getElementById('adv-obj-desc');
    const advObjProgress = document.getElementById('adv-obj-progress');

    // Objective / tutorial strip (collapsed when neither card is showing)
    const missionStrip = document.getElementById('mission-status-strip');
    const riseFill = document.getElementById('rise-fill');

    // Tactical Bounty Card (Classic) — hidden in the HUD, summarised on the pause screen
    const bountyCard = document.getElementById('bounty-card');
    const classicStrip = document.getElementById('classic-strip');

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

    // Drag & place tray (maingameplay.html only) and the debug-mode Labs switch on both entry pages
    const dragTraySlots = [document.getElementById('drag-slot-0'), document.getElementById('drag-slot-1')];
    const dragGhost = document.getElementById('drag-ghost');
    const labsSwitch = document.getElementById('labs-switch');
    const settingDebugToggle = document.getElementById('setting-debug-toggle');
    const homeTitle = document.querySelector('#screen-home .home-title');

    // How to play (maingameplay.html): 6 one-concept slides
    const htpRoot = document.getElementById('htp');

    // First-time play (maingameplay.html): coached run before Adventure node 1-1
    const fpCoach = document.getElementById('fp-coach');
    const fpHand = document.getElementById('fp-hand');
    const fpHandOrb = document.getElementById('fp-hand-orb');

    // Pause Modal
    // Pause screen (objective core)
    const pauseRing = document.getElementById('pause-ring');
    const pauseRingLabel = document.getElementById('pause-ring-label');
    const pauseRingValue = document.getElementById('pause-ring-value');
    const pauseRingSub = document.getElementById('pause-ring-sub');
    const pauseOrbs = document.getElementById('pause-orbs');
    const pauseTitle = document.getElementById('pause-title');
    const pauseChip = document.getElementById('pause-chip');
    const pauseGoals = document.getElementById('pause-goals');
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
    const settingReduceEffectsToggle = document.getElementById('setting-reduce-effects-toggle');
    const settingShakePills = document.querySelectorAll('#setting-shake-pills .qs-pill');
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
    // 2: Adventure rebuilt on fixed level data with drops-left stars (old node progress wiped)
    const ADVENTURE_SAVE_VERSION = 2;

    function loadCareerData() {
        const defaultCareer = {
            highScore: 0,
            unlockedLevel: 1, // for Challenges
            levelStars: {},
            levelHighScores: {},
            adventureNodes: {}, // { [nodeId]: { cleared: true, stars: 3, bestScore: 210, bestDrops: 5 } }
            unlockedNodes: ['1-1'],
            currentSector: 1,
            tutorialDone: false,
            tutorialSkipped: false,
            seenOverdriveTip: false,
            adventureSaveVersion: ADVENTURE_SAVE_VERSION,
            seenConcepts: {},      // concept id -> true once introduced (GDD §6.1)
            discoveriesNew: {},    // concept ids / 'tier:N' not yet viewed in Discoveries
            orbTiersMade: {},      // tier size -> true the first time it's made
            bestOrb: 0,            // lifetime biggest orb made
            usedHold: false,
            usedSwap: false,
            hints: { hold: { shown: 0, lastOrder: -99 }, swap: { shown: 0, lastOrder: -99 } },
            levelFails: {},        // node id -> { noHold, noSwap } fails without using the tool
            settings: {
                sfx: true,
                bgm: true,
                bgmOnMigrated: true,
                vibration: true,
                shake: 'high'
            }
        };

        try {
            const raw = localStorage.getItem('zeropoint_career');
            if (raw) {
                const parsed = JSON.parse(raw);
                // One-time: the soundtrack has landed, so switch music back on for existing saves
                // (an earlier one-time step forced it off while it was a placeholder drone)
                if (parsed.settings && !parsed.settings.bgmOnMigrated) {
                    parsed.settings.bgm = true;
                    parsed.settings.bgmOnMigrated = true;
                }
                // One-time: Adventure moved to fixed level data and drops-left stars, so
                // old node progress no longer matches. Wipe it (Classic, Challenges and settings stay).
                if ((parsed.adventureSaveVersion || 1) < ADVENTURE_SAVE_VERSION) {
                    parsed.adventureNodes = {};
                    parsed.unlockedNodes = ['1-1'];
                    parsed.currentSector = 1;
                    parsed.adventureSaveVersion = ADVENTURE_SAVE_VERSION;
                    try { localStorage.setItem('zeropoint_career', JSON.stringify(parsed)); } catch (e) { /* saved on next write */ }
                }
                return backfillConcepts({
                    ...defaultCareer,
                    ...parsed,
                    hints: { ...defaultCareer.hints, ...(parsed.hints || {}) },
                    adventureNodes: parsed.adventureNodes || {},
                    unlockedNodes: (parsed.unlockedNodes && parsed.unlockedNodes.length > 0) ? parsed.unlockedNodes : ['1-1'],
                    currentSector: parsed.currentSector || 1,
                    settings: { ...defaultCareer.settings, ...(parsed.settings || {}) }
                });
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

    // Existing saves: concepts count as seen if their node is already cleared, and the basics
    // once first play is done, so returning players don't get intros for things they know
    function backfillConcepts(c) {
        const concepts = (typeof NullfallConcepts !== 'undefined') ? NullfallConcepts.CONCEPTS : [];
        concepts.forEach((k) => {
            if (c.seenConcepts[k.id]) return;
            const cleared = k.unlock !== 'start' && c.adventureNodes[k.unlock] && c.adventureNodes[k.unlock].cleared;
            // Hold and Swap are discovered by using them or by their hint, not by first play
            const taughtInFirstPlay = ['zero_blast', 'merge', 'red_line'].includes(k.id) && c.firstPlayDone;
            if (cleared || taughtInFirstPlay) c.seenConcepts[k.id] = true;
        });
        return c;
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
        if (typeof updateDiscoveryDots === 'function') updateDiscoveryDots();
        const totalChallengeStars = getTotalStars();
        const campaignLevels = ADVENTURE_LEVELS.filter(lvl => !lvl.isTutorial);
        const maxChallengeStars = campaignLevels.length * 3;
        const totalNodeStars = getNodeTotalStars();
        const clearedNodes = getClearedNodesCount();
        const best = career.highScore || 0;

        if (homeBestPill) homeBestPill.textContent = `🏆 Best: ${best.toLocaleString()} pts`;
        if (homeStarsPill) homeStarsPill.textContent = `⭐ ${totalNodeStars} Stars (${clearedNodes} Nodes)`;
        if (homeCardHighscore) homeCardHighscore.textContent = `BEST ${best.toLocaleString()}`;
        if (homeCardStars) homeCardStars.textContent = `SECTOR ${career.currentSector || 1} - ${totalNodeStars} ★`;
        if (homeCardChallengeStars) homeCardChallengeStars.textContent = `${totalChallengeStars} / ${maxChallengeStars} ★`;
        if (challengesHeaderStars) challengesHeaderStars.textContent = `★ ${totalChallengeStars}/${maxChallengeStars}`;
        if (advHeaderStars) advHeaderStars.textContent = `⭐ ${totalChallengeStars} / ${maxChallengeStars}`;
        if (advNodesStarsPill) advNodesStarsPill.textContent = `★ ${totalNodeStars}`;

        if (settingSfxToggle && career.settings) settingSfxToggle.checked = !!career.settings.sfx;
        if (settingBgmToggle && career.settings) settingBgmToggle.checked = !!career.settings.bgm;
        if (settingVibrationToggle && career.settings) settingVibrationToggle.checked = career.settings.vibration !== false;
        syncReduceEffects();
        syncShakePills();
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
    let lastCoreHighlight = false; // gold target brackets on the final dark core
    const SHOW_LAST_CORE_MARKER = false; // marker hidden for now; flip to re-enable
    let adventureObjectiveMet = false;
    let starCells = [];        // Catch the Stars: fixed board cells { r, c, caught }
    let sealedCols = [];       // Sealed columns: no drops until a tile inside is cleared (GDD §5.2)
    let sealCounts = {};       // tiles tagged in each sealed column at the last check
    let sealOpenings = [];     // { col, at } clamp-opening animations
    let riserClock = 0;        // drops since the last Riser spawned
    let pendingDeals = [];     // tray guarantees, e.g. a Riser's opposite: { value, due }
    let orbDealer = null;      // OrbBag dealer for the current run (bag randomizer + guarantees)
    let guide = null;          // one guided move on a mechanic's intro level: { col, slot, kind, line, why, riseAfter, busy, anim }
    let pendingGuide = null;   // starts when the level card is dismissed
    let pendingJit = [];       // Classic/Challenges: concepts met for the first time, shown when the turn ends
    let runBestOrb = 0;        // biggest orb made this run
    let runUsedHold = false;
    let runUsedSwap = false;
    let runHintShown = {};     // tool -> true once its hint showed this run
    let toolHint = null;       // active Hold/Swap hint: { tool, kind, slot, from, to, anim }
    let orbDealerKey = null;   // what the dealer was built for (level config or 'classic:<tide>')
    let classicTide = 0;       // Number Tide in Classic: rises every CLASSIC_TIDE_EVERY drops
    let classicDrops = 0;
    const CLASSIC_TIDE_EVERY = 25; // to be tuned (GDD §3.1)
    const CLASSIC_TIDE_MAX = 4;
    // Classic Heat: +1 every CLASSIC_TIDE_EVERY drops with no cap (the tide stops at CLASSIC_TIDE_MAX).
    // Pressure climbs with it (index = heat, last entry holds), and so does the score multiplier.
    let classicHeat = 0;
    const CLASSIC_RISE_EVERY = [5, 4, 4, 3, 3, 3, 3, 3, 2];                       // moves between rising rows
    const CLASSIC_DM_CHANCE = [0.6, 0.66, 0.72, 0.79, 0.85, 0.88, 0.91, 0.93, 0.95]; // Dark Matter share of a rising row
    const CLASSIC_PAIR_BIAS = [0.2, 0.15, 0.1, 0.07, 0.05, 0.04, 0.03, 0.02];       // chance the tray deals a match
    const CLASSIC_HEAT_SCORE_STEP = 0.25; // score ×(1 + 0.25 per heat)
    // Adventure elements join Classic by Heat (concept id → Heat it unlocks at). They arrive in
    // rising rows (Risers push up on their own); unseen ones get their concept card just in time.
    const CLASSIC_ELEMENTS = { risers: 1, dense_cores: 2, webbed_orbs: 3, entangled_pairs: 4, static_blocks: 5 };
    const CLASSIC_RISER_EVERY = 6;   // moves between Riser spawns
    const CLASSIC_STATIC_MAX = 4;    // walls on the board at once
    const CLASSIC_WALL_LIFE = 6;     // rising rows a Classic wall lasts (rows push walls up, so they crumble)
    const CLASSIC_ELEMENT_BONUS = 40; // points for clearing a Riser, a dense core or an entangled pair
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
    let gameOverFallAt = 0;    // performance.now() when a lost board starts falling away; 0 = not falling
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

    // Frenzy power-ups (Vortex, Nova, Nuke): round glowing orbs with an icon and a badge
    // showing the blast area. No text label: the name is announced when it detonates.
    const POWER_UP_LOOK = {
        blackhole: {
            rim: '#ffd700', glow: 'rgba(188, 19, 254, 0.75)', ink: '#ffd700',
            body: [[0, '#020005'], [0.55, '#0a0118'], [1, '#2a0750']],
            icon: 'vortex', area: 'column'
        },
        supernova_core: {
            rim: '#ffe45c', glow: 'rgba(249, 212, 35, 0.7)', ink: '#fff6c2',
            body: [[0, '#8a6a0a'], [0.5, '#3a2a05'], [1, '#1a1202']],
            icon: 'nova', area: 'crater'
        },
        antimatter_nuke: {
            rim: '#ff4e50', glow: 'rgba(255, 60, 80, 0.7)', ink: '#ffd0c8',
            body: [[0, '#7a1420'], [0.52, '#3a0a12'], [1, '#1c0509']],
            icon: 'nuke', area: 'square'
        }
    };
    // Icon paths in a 24×24 box (the nuke blade is drawn three times, 120° apart)
    const POWER_UP_PATHS = {
        vortex: 'M12.6 12.4a1 1 0 1 1-1.2-1.3 2.6 2.6 0 0 1 3.1 2.3 4 4 0 0 1-4 4.1 5.4 5.4 0 0 1-5.4-5.4A6.8 6.8 0 0 1 12 5.2a8.2 8.2 0 0 1 8.2 8.2',
        nova: 'M12 2.5c.7 5 2.3 7.3 7.5 9.5-5.2 2.2-6.8 4.5-7.5 9.5-.7-5-2.3-7.3-7.5-9.5 5.2-2.2 6.8-4.5 7.5-9.5z',
        nukeBlade: 'M14 8.54L16.5 4.21A9 9 0 0 0 7.5 4.21L10 8.54A4 4 0 0 1 14 8.54Z'
    };
    // Quantum Swap State
    let swapTokens = 1;
    const maxSwapTokens = 3;
    let isSwapModeActive = false;
    let firstSwapTile = null; // { r, c }
    let dropsSinceSwapCharge = 0;

    // Classic run systems (classicRun.js, GDD §4.1): Bounty Ladder, Surges, tide waiting on a Surge
    let bountyLadder = null;
    let classicSurge = null;     // the running Surge, or null
    let surgeBag = null;
    let surgeCount = 0;
    let tidePending = false;
    let ladderWeaponIndex = 0;
    let ladderWasPaused = false;

    // Tactical Orbs
    let currentOrb = null;
    let heldOrb = null;
    let nextQueue = [];

    // Main gameplay: two tray orbs (a used slot refills instantly), the orb being dragged,
    // and a board tile being slid onto a neighbour to swap
    let dragTray = [null, null];
    let activeDrag = null;     // { source: 'tray' | 'hold', slot, orb, col, ghostY, overHold }
    let boardSwapDrag = null;  // { r, c, x0, y0, target: { r, c } | null, warned }
    let firstPlay = null;      // coached first run: { step, node, kind, slot, col, from, to, keep, dim, busy, anim }

    // Falling Projectile Animation
    let activeProjectile = null; // { col, startY, targetY, y, vy, orb, targetRow, isImpact }

    // Visual Effects & Active Dynamic Animations
    let activeMergeAnimations = [];
    let activeZeroPointCollapses = [];
    let particles = [];
    let shockwaves = [];
    let laserBeams = [];
    let screenFlash = 0;           // current flash opacity at its centre
    let screenFlashColor = '#ffffff';
    let screenFlashX = null;       // canvas px the flash spreads from; null = board centre
    let screenFlashY = null;
    let floatingTexts = [];
    let comboCounter = null;   // the single on-board ×N that follows a cascade
    let dangerLevel = 0;       // 0–1, eased toward the board's danger; drives vignette, heartbeat, muffle
    let dangerBeatAt = 0;      // performance.now() of the last heartbeat
    let dangerSentToAudio = -1;
    let shakeTrauma = 0;       // 0–1; hits add to it, it drains over time, shake grows with its square
    let shakeKickX = 0;        // one-off shove away from a blast, springs back on its own
    let shakeKickY = 0;
    let starfield = null;      // background stars, built on first draw
    let starJoltX = 0;         // starfield shove from a big blast, springs back
    let starJoltY = 0;
    let slowMoAt = 0;          // performance.now() when Overdrive's slow-motion began; 0 = off
    let denyShakeAt = 0;       // performance.now() of the last "can't do that" head-shake
    let hitStopUntil = 0;      // performance.now() timestamp; the board freezes until then
    let scoreShown = 0;        // value the HUD has caught up to (flyers add on arrival)
    let scoreFlySession = 0;   // bumped on reset so stale flyers don't add
    let lastScoreFlyAt = 0;
    let objDisplay = null;     // objective state the strip shows while badges are in flight
    let objFlyersInFlight = 0;
    let dropCancelArmed = false; // drag is outside the board; release won't drop
    let scoreFlyStagger = 0;

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
        if (screenId !== 'game' && firstPlay) fpTeardown();
        if (screenId !== 'game') hideObjectiveIntro();
        if (screenId !== 'game' && sfx && sfx.onBossTrack()) sfx.rotateBGM(false); // leaving a boss
        currentScreen = screenId;
        const screens = [screenHome, screenAdventureNodes, screenChallenges, screenAdventureMap, screenGame, screenCodex];
        screens.forEach(s => {
            if (s) s.classList.remove('active');
        });

        if (screenId !== 'game' && isTutorial) {
            isTutorial = false;
            if (tutorialCard) tutorialCard.style.display = 'none';
        }
        if (screenId !== 'game') {
            hideTutHand();
            hideTutFail();
        }
        if (screenGame) {
            const training = screenId === 'game' && isTutorial;
            screenGame.classList.toggle('tut-mode', training);
            if (!training) screenGame.classList.remove('tut-rise', 'tut-allow-hold', 'tut-allow-swap', 'tut-swap-locked');
            const tutHeader = document.getElementById('tut-header');
            if (tutHeader) tutHeader.hidden = !training;
            const hintEl = screenGame.querySelector('.cockpit-hint');
            if (hintEl) hintEl.innerHTML = training ? 'Tap a column<br>to drop' : 'Drag to aim<br>Release to drop';
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
            renderAcademy();
        }

        syncAudioUI();
    }

    // ==========================================================
    // ACADEMY LESSON DECK
    // ==========================================================
    const ACADEMY_TINT = {
        cyan: ['#00f2fe', 'rgba(0, 242, 254, 0.14)'],
        purple: ['#c471ed', 'rgba(196, 113, 237, 0.16)'],
        gold: ['#f9d423', 'rgba(249, 212, 35, 0.14)'],
        red: ['#ff4e50', 'rgba(255, 78, 80, 0.15)']
    };

    const ACADEMY_LESSONS = [
        {
            glyph: '0', short: 'ZERO BLAST', kicker: 'LESSON 1 · CORE RULE', accent: '#00f2fe', haze: 'rgba(196, 113, 237, 0.22)',
            demo: [['pos', '+3'], ['op', '+'], ['neg', '-3'], ['op', '='], ['zero', '0']],
            title: 'Opposites cancel to zero',
            body: 'Every orb is cyan +N or coral −N. When opposites touch they add up to 0 and detonate a Zero Blast. Bigger numbers, bigger blasts.',
            facts: [
                ['cyan', '±1', 'Micro Pop', 'Basic single-cell clear'],
                ['purple', '±2', 'Shockwave', 'Cracks nearby Dark Matter'],
                ['gold', '±4', 'Cross Laser', 'Beams across row and column'],
                ['red', '±8+', 'Supernova', '3×3 blast + bonus Swap Token']
            ]
        },
        {
            glyph: '×2', short: 'MERGE', kicker: 'LESSON 2 · BUILD UP', accent: '#f9d423', haze: 'rgba(249, 212, 35, 0.18)',
            demo: [['pos', '+2'], ['op', '+'], ['pos', '+2'], ['op', '='], ['gold', '+4']],
            title: 'Same sign? Merge & double',
            body: 'Matching orbs fuse into one with double the value. Build big numbers, then hit them with their opposite for a stronger blast.',
            facts: [
                ['cyan', '+4', '+4 & +4 = +8', 'Positives stack upward'],
                ['red', '−6', '−3 & −3 = −6', 'Negatives stack too'],
                ['gold', '2x+', 'Chain Reaction', 'Cascades multiply score & recharge Swaps']
            ]
        },
        {
            glyph: '◈', short: 'SPECIALS', kicker: 'LESSON 3 · SPECIAL ORBS', accent: '#c471ed', haze: 'rgba(196, 113, 237, 0.24)',
            demo: [['sp', '±'], ['op', '→'], ['pos', '+5'], ['op', '='], ['neg', '-5']],
            title: 'Special orbs bend the rules',
            body: 'Specials act on the orb they land next to. Flip a sign to set up a blast, or reach for a bomb when the board gets crowded.',
            facts: [
                ['purple', '±', 'Flip Sign', 'Flips the sign of a number'],
                ['cyan', '÷2 ×2', 'Divide / Double Up', 'Halves or doubles a number'],
                ['gold', '0', 'Core Bomb', 'Clears a 3×3 area'],
                ['red', '⚫ 💥', 'Frenzy: Black Hole / Nuke', 'Whole column or 3×3 explosion']
            ]
        },
        {
            glyph: 'S', short: 'TACTICS', kicker: 'LESSON 4 · TACTICS', accent: '#f9d423', haze: 'rgba(0, 242, 254, 0.16)',
            demo: [['pos', '+2'], ['op', '⇄'], ['neg', '-2']],
            title: 'Play the long game',
            body: 'Tools for getting out of tight spots and scoring big in Classic. Save them for when they matter.',
            facts: [
                ['cyan', 'S', 'Quantum Swap', 'Swap two adjacent tiles'],
                ['purple', 'C', 'Hold Slot', 'Stash an orb for later'],
                ['gold', '★', 'Tactical Bounties', 'Classic mini-missions for points & Swaps']
            ]
        }
    ];

    let academyLesson = 0;

    function renderAcademy() {
        const lesson = ACADEMY_LESSONS[academyLesson];
        if (!lesson) return;
        const el = (id) => document.getElementById(id);

        const counter = el('acad-counter');
        if (counter) counter.textContent = `${academyLesson + 1}/${ACADEMY_LESSONS.length}`;

        const chips = el('acad-chips');
        if (chips) {
            chips.innerHTML = '';
            ACADEMY_LESSONS.forEach((l, i) => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'acad-chip' + (i === academyLesson ? ' on' : (i < academyLesson ? ' done' : ''));
                chip.setAttribute('role', 'tab');
                chip.setAttribute('aria-selected', i === academyLesson ? 'true' : 'false');
                chip.setAttribute('aria-label', l.title);
                const g = document.createElement('span');
                g.className = 'g';
                g.textContent = l.glyph;
                const s = document.createElement('span');
                s.className = 's';
                s.textContent = l.short;
                chip.append(g, s);
                chip.addEventListener('click', () => {
                    if (academyLesson === i) return;
                    academyLesson = i;
                    renderAcademy();
                    sfx.playMove();
                });
                chips.appendChild(chip);
            });
        }

        const demo = el('acad-demo');
        if (demo) {
            demo.style.setProperty('--acad-haze', lesson.haze);
            demo.style.setProperty('--acad-accent', lesson.accent);
        }
        const kicker = el('acad-lesson-kicker');
        if (kicker) kicker.textContent = lesson.kicker;

        const row = el('acad-demo-row');
        if (row) {
            row.innerHTML = '';
            lesson.demo.forEach(([kind, text]) => {
                const tok = document.createElement('span');
                tok.className = `acad-tok ${kind}`;
                tok.textContent = text;
                row.appendChild(tok);
            });
            row.classList.remove('enter');
            void row.offsetWidth;
            row.classList.add('enter');
        }

        const title = el('acad-title');
        if (title) title.textContent = lesson.title;
        const text = el('acad-text');
        if (text) text.textContent = lesson.body;

        const facts = el('acad-facts');
        if (facts) {
            facts.innerHTML = '';
            lesson.facts.forEach(([tint, key, name, desc]) => {
                const [color, bg] = ACADEMY_TINT[tint];
                const row = document.createElement('div');
                row.className = 'acad-fact';
                const k = document.createElement('span');
                k.className = 'k';
                k.style.color = color;
                k.style.background = bg;
                k.textContent = key;
                const t = document.createElement('span');
                t.className = 't';
                const n = document.createElement('span');
                n.className = 'n';
                n.textContent = name;
                const d = document.createElement('span');
                d.className = 'd';
                d.textContent = desc;
                t.append(n, d);
                row.append(k, t);
                facts.appendChild(row);
            });
        }
        const body = document.querySelector('#screen-codex .acad-body');
        if (body) body.scrollTop = 0;

        const nextLabel = el('acad-next-label');
        if (nextLabel) nextLabel.textContent = academyLesson < ACADEMY_LESSONS.length - 1 ? 'Next lesson' : 'Start training';
    }

    // ==========================================================
    // CONSTELLATION NODE MAP RENDERER
    // ==========================================================
    // Constellation map state (selected node per render)
    let mapSelectedNodeId = null;
    let mapGraphNodes = [];
    let mapSectorUnlocked = true;

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const ICON_LOCK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>';
    const ICON_BOSS = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9" opacity=".35"></circle><circle cx="12" cy="12" r="5.5" opacity=".65"></circle><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"></circle></svg>';

    function isSectorUnlocked(sectorNum, unlockedSet) {
        return sectorNum === 1 || unlockedSet.has(`${sectorNum}-1`);
    }

    function getNodeStatus(node, unlockedSet) {
        const data = career.adventureNodes ? career.adventureNodes[node.id] : null;
        const cleared = !!(data && data.cleared);
        const stars = data ? (data.stars || 0) : 0;
        const unlocked = cleared || unlockedSet.has(node.id) || node.id === '1-1';
        return { cleared, stars, unlocked };
    }

    function renderAdventureNodeMap(sectorNum = 1) {
        if (!advMapNodesLayer || !advMapSvg || typeof NodeGenerator === 'undefined') return;

        const sectorCount = NodeGenerator.SECTOR_METADATA.length;
        currentViewingSector = sectorNum;

        const graph = NodeGenerator.getSectorGraph(sectorNum);
        const sectorMeta = graph.sectorMeta;
        const unlockedSet = new Set(career.unlockedNodes || ['1-1']);
        unlockedSet.add('1-1');
        mapSectorUnlocked = isSectorUnlocked(sectorNum, unlockedSet);
        if (mapSectorUnlocked) career.currentSector = sectorNum;

        // Header + world colour
        if (screenAdventureNodes) screenAdventureNodes.style.setProperty('--world', sectorMeta.color);
        if (advNodesSectorBadge) advNodesSectorBadge.textContent = `SECTOR 0${sectorNum}`;
        if (advNodesSectorTitle) advNodesSectorTitle.textContent = sectorMeta.name;
        if (sectorIndicatorText) sectorIndicatorText.textContent = `Sector ${sectorNum} of ${sectorCount}`;
        if (btnPrevSector) btnPrevSector.disabled = sectorNum <= 1;
        if (btnNextSector) btnNextSector.disabled = sectorNum >= sectorCount;

        // World pills
        if (sectorPills) {
            sectorPills.innerHTML = '';
            NodeGenerator.SECTOR_METADATA.forEach((meta, i) => {
                const num = i + 1;
                const open = isSectorUnlocked(num, unlockedSet);
                const pill = document.createElement('button');
                pill.type = 'button';
                pill.className = `sector-pill${num === sectorNum ? ' is-active' : ''}${open ? '' : ' is-locked'}`;
                pill.style.setProperty('--pill', meta.color);
                pill.setAttribute('role', 'tab');
                pill.setAttribute('aria-selected', num === sectorNum ? 'true' : 'false');
                pill.setAttribute('aria-label', `Sector ${num}: ${meta.name}${open ? '' : ' (locked)'}`);
                pill.innerHTML = `${num}${open ? '' : `<span class="sector-pill-lock">${ICON_LOCK}</span>`}`;
                pill.addEventListener('click', () => {
                    if (num === currentViewingSector) return;
                    sfx.playMove();
                    triggerHaptic('tick');
                    renderAdventureNodeMap(num);
                });
                sectorPills.appendChild(pill);
            });
            // Keep the current world centred in the scrolling pill row
            const active = sectorPills.querySelector('.is-active');
            if (active) sectorPills.scrollLeft = active.offsetLeft - sectorPills.offsetLeft - (sectorPills.clientWidth - active.offsetWidth) / 2;
        }

        // Sealed world overlay
        if (advWorldSealed) {
            advWorldSealed.hidden = mapSectorUnlocked;
            if (!mapSectorUnlocked) {
                const prevMeta = NodeGenerator.SECTOR_METADATA[sectorNum - 2];
                if (advWorldSealedTitle) advWorldSealedTitle.textContent = `${sectorMeta.name} is sealed`;
                if (advWorldSealedDesc) advWorldSealedDesc.textContent = prevMeta
                    ? `Defeat the boss of ${prevMeta.name} to open this world.`
                    : 'Clear the previous world to open this one.';
            }
        }

        advMapNodesLayer.innerHTML = '';
        advMapSvg.innerHTML = '';

        const statusById = new Map();
        graph.nodes.forEach(n => statusById.set(n.id, getNodeStatus(n, unlockedSet)));

        // "Current" = first unlocked, uncleared main-path node (else the first open bonus rift)
        const firstOpen = (pred) => graph.nodes.find(n => pred(n) && statusById.get(n.id).unlocked && !statusById.get(n.id).cleared);
        const currentNode = mapSectorUnlocked ? (firstOpen(n => n.type !== 'bonus') || firstOpen(n => n.type === 'bonus')) : null;
        const currentId = currentNode ? currentNode.id : null;

        // Links
        const nodeById = new Map(graph.nodes.map(n => [n.id, n]));
        graph.links.forEach(link => {
            const from = nodeById.get(link.from);
            const to = nodeById.get(link.to);
            if (!from || !to) return;
            const toStatus = statusById.get(to.id);
            let cls = 'clink clink-locked';
            if (link.isBonusBranch) cls = `clink clink-bonus${toStatus.unlocked ? ' is-open' : ''}`;
            else if (toStatus.cleared) cls = 'clink clink-done';
            else if (to.id === currentId) cls = 'clink clink-next';
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', from.x);
            line.setAttribute('y1', from.y);
            line.setAttribute('x2', to.x);
            line.setAttribute('y2', to.y);
            line.setAttribute('vector-effect', 'non-scaling-stroke');
            line.setAttribute('class', cls);
            advMapSvg.appendChild(line);
        });

        // Nodes
        mapGraphNodes = graph.nodes;
        graph.nodes.forEach(node => {
            const st = statusById.get(node.id);
            const isCurrent = node.id === currentId;
            const state = st.cleared ? 'is-cleared' : (isCurrent || st.unlocked ? 'is-current' : 'is-locked');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `cnode ${state} type-${node.type}`;
            btn.dataset.nodeId = node.id;
            btn.style.left = `${node.x}%`;
            btn.style.top = `${node.y}%`;
            btn.setAttribute('aria-label', `${node.type === 'boss' ? 'Boss node' : node.type === 'bonus' ? 'Bonus rift' : 'Node'} ${node.id}${st.cleared ? `, ${st.stars} stars` : st.unlocked ? '' : ', locked'}`);

            let inner;
            if (node.type === 'boss') inner = ICON_BOSS;
            else if (!st.unlocked && node.type !== 'bonus') inner = ICON_LOCK;
            else inner = `<span class="cnode-num">${node.num}</span>`;

            const starsHtml = st.cleared
                ? `<span class="cnode-stars">${[1, 2, 3].map(k => `<span class="${k <= st.stars ? '' : 'off'}">★</span>`).join('')}</span>`
                : '';
            btn.innerHTML = `<span class="cnode-core">${isCurrent ? '<span class="cnode-ring"></span>' : ''}${inner}</span>${starsHtml}`;
            btn.addEventListener('click', () => {
                sfx.init();
                sfx.playMove();
                triggerHaptic('tick');
                selectMapNode(node.id);
            });
            advMapNodesLayer.appendChild(btn);
        });

        updateCareerDisplays();
        const lastCleared = [...graph.nodes].reverse().find(n => statusById.get(n.id).cleared && n.type !== 'bonus');
        selectMapNode(currentId || (lastCleared ? lastCleared.id : graph.nodes[0].id));
    }

    function selectMapNode(nodeId) {
        const node = mapGraphNodes.find(n => n.id === nodeId);
        if (!node) return;
        mapSelectedNodeId = nodeId;
        advMapNodesLayer.querySelectorAll('.cnode').forEach(el => {
            el.classList.toggle('is-selected', el.dataset.nodeId === nodeId && !el.classList.contains('is-current'));
        });
        renderNodeSheet(node);
    }

    function renderNodeSheet(node) {
        if (!nodeSheet) return;
        const unlockedSet = new Set(career.unlockedNodes || ['1-1']);
        unlockedSet.add('1-1');
        const st = getNodeStatus(node, unlockedSet);
        const config = node.config;
        const canPlay = mapSectorUnlocked && st.unlocked;

        nodeSheet.dataset.kind = node.type === 'boss' ? 'boss' : (node.type === 'bonus' ? 'bonus' : 'node');
        if (nodeSheetKicker) nodeSheetKicker.textContent = node.type === 'boss'
            ? `BOSS · NODE ${node.id}`
            : (node.type === 'bonus' ? `BONUS RIFT · ${node.num}` : `NODE ${node.id}`);
        if (nodeSheetTitle) nodeSheetTitle.textContent = (config.title || '').replace(/^(Sector Boss|Bonus):\s*/, '');
        if (nodeSheetDesc) nodeSheetDesc.textContent = config.desc || '';
        if (nodeSheetStars) {
            nodeSheetStars.setAttribute('aria-label', `${st.stars} of 3 stars`);
            nodeSheetStars.innerHTML = [1, 2, 3].map(k => `<span class="${k <= st.stars ? '' : 'off'}">★</span>`).join('');
        }

        if (nodeSheetChips) {
            const chips = [];
            if (config.maxDrops) chips.push(`<span class="node-chip">↓ ${config.maxDrops} moves</span>`);
            (config.rules?.modifiers || []).forEach(m => chips.push(`<span class="node-chip node-chip-icon">${pauseGlyphHtml(m.icon)}${m.label}</span>`));
            if (config.stars) chips.push(config.stars.kind === 'headroom'
                ? `<span class="node-chip">★★ ${config.stars.two} free rows · ★★★ ${config.stars.three}</span>`
                : `<span class="node-chip">★★ ${config.stars.two} left · ★★★ ${config.stars.three} left</span>`);
            // Debug: placeholder levels say what they stand in for (levels.js `temp`)
            if (config.temp && isDebugMode()) chips.push(`<span class="node-chip">TEMP · planned ${config.planned}</span>`);
            nodeSheetChips.innerHTML = chips.join('');
        }

        if (btnNodeSheetLaunch) btnNodeSheetLaunch.hidden = !canPlay;
        if (nodeSheetCta) nodeSheetCta.textContent = st.cleared ? 'REPLAY' : 'LAUNCH';
        if (nodeSheetLocked) {
            nodeSheetLocked.hidden = canPlay;
            if (!canPlay && nodeSheetLockedText) {
                nodeSheetLockedText.textContent = !mapSectorUnlocked
                    ? 'World sealed'
                    : (node.type === 'boss' ? 'Clear every node to face the boss'
                        : node.type === 'bonus' ? 'Clear the node it branches from'
                        : 'Clear the previous node to unlock');
            }
        }
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
                    pill.innerHTML = `${pauseGlyphHtml(m.icon)} ${m.label}`;
                    nodePreviewModifiers.appendChild(pill);
                });
            }
        }

        // Star targets
        if (starDesc2) starDesc2.textContent = starGoalText(config.stars, config.stars.two);
        if (starDesc3) starDesc3.textContent = starGoalText(config.stars, config.stars.three);

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
        if (nodeBestDrops) nodeBestDrops.textContent = nodeData && nodeData.bestDrops ? `${nodeData.bestDrops} moves` : '-';

        modalNodePreview.classList.add('visible');
    }

    function isBossLevel() {
        const lvl = activeAdventureLevel;
        return gameMode === 'adventure' && !isTutorial && !!lvl && (!!lvl.isBoss || /boss/i.test(lvl.sector || ''));
    }

    function startNodeLevel(config) {
        if (!config) return;
        // First Adventure node on the main gameplay: run the coached first play before it
        // (new players only; debug mode can force it for testing)
        const hasAdventureProgress = Object.values(career.adventureNodes || {}).some((n) => n && n.cleared);
        if (MAIN_GAMEPLAY && config.id === '1-1' && !config.devJump && !career.firstPlayDone && !firstPlay && fpCoach
            && (!hasAdventureProgress || isDebugMode())) {
            startFirstPlay(config);
            return;
        }
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
        if (adventureObjectiveCard) adventureObjectiveCard.style.display = 'flex';
        if (tutorialCard) tutorialCard.style.display = 'none';
        if (advObjDesc) advObjDesc.textContent = config.desc;
        if (bestLabel) bestLabel.textContent = 'Node Best';
        const nodeRecord = career.adventureNodes ? career.adventureNodes[config.id] : null;
        const nodeBest = nodeRecord && nodeRecord.bestScore ? nodeRecord.bestScore : 0;
        if (bestVal) bestVal.textContent = nodeBest.toLocaleString();
        if (turnCounterLabel) turnCounterLabel.textContent = config.rules?.fluxRate ? 'Dark Matter Rises In' : 'Moves Left';

        showScreen('game');
        startNewGame();

        if (config.setupBoard) {
            grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
            config.setupBoard(grid, ROWS, COLS, createTile);
        }
        starCells = config.starCells ? config.starCells(ROWS) : [];
        sealedCols = ((config.rules && config.rules.sealed) || []).slice();
        tagSealedCols();
        const riserRules = config.rules && config.rules.risers;
        for (let i = 0; i < ((riserRules && riserRules.start) || 0); i++) spawnRiser(false);
        ensureRiserOpposites();

        // Concepts introduced here (GDD §6.4): a NEW card + one guided move for a mechanic,
        // a NEW GOAL badge for a goal. Introductions never repeat.
        const fresh = config.editorTest ? [] : CONCEPTS.filter((k) => k.unlock === config.id && !career.seenConcepts[k.id]);
        const freshMechanics = fresh.filter((k) => k.kind === 'mechanic');
        const freshGoal = fresh.some((k) => k.kind === 'goal' && !k.silent);
        fresh.forEach((k) => markConceptSeen(k.id));
        pendingGuide = freshMechanics.length && config.guide ? config.guide : null;
        if (pendingGuide && dragTray) {
            dragTray[0] = pendingGuide.orb === 'zero'
                ? { type: 'special', subType: 'zero', label: '0' }
                : numberOrb(pendingGuide.orb);
        }
        updateAdventureObjectiveUI();
        updateHUD();
        showObjectiveIntro(config, { newGoal: freshGoal });
        if (freshMechanics.length) showConceptCards(freshMechanics.map((k) => k.id), 'new');
    }

    // ==========================================================
    // TACTICAL CHALLENGES RENDERER (Handcrafted Campaign)
    // ==========================================================
    // Challenges mission grid state
    let selectedChallengeId = null; // level id, or 'train' for the academy

    const CHALLENGE_GLYPHS = {
        annihilations: () => '0',
        synthesis_tier: (o) => `+${o.target}`,
        clear_dark_matter: () => '◈',
        trigger_laser: () => '✚',
        activate_frenzy: () => 'ϟ'
    };

    function starsHtml(n) {
        return [1, 2, 3].map(k => `<span class="${k <= n ? '' : 'off'}">★</span>`).join('');
    }

    function getChallengeStatus(lvl) {
        const stars = career.levelStars[lvl.id] || 0;
        const unlocked = lvl.id <= career.unlockedLevel;
        const isBoss = /boss/i.test(lvl.sector || '');
        const state = isBoss ? (unlocked ? 'boss-open' : 'boss') : (stars > 0 ? 'cleared' : (unlocked ? 'current' : 'locked'));
        return { stars, unlocked, isBoss, state };
    }

    function renderChallenges() {
        const gridEl = challengesLevelsGrid || adventureLevelsGrid;
        if (!gridEl) return;
        gridEl.innerHTML = '';

        const missions = ADVENTURE_LEVELS.filter(l => !l.isTutorial);
        const training = ADVENTURE_LEVELS.find(l => l.isTutorial);

        // Default selection: the first unlocked, unplayed mission (else the last unlocked one)
        const isValidSelection = selectedChallengeId === 'train' || missions.some(l => l.id === selectedChallengeId);
        if (!isValidSelection) {
            const next = missions.find(l => { const st = getChallengeStatus(l); return st.unlocked && st.stars === 0; });
            const lastOpen = [...missions].reverse().find(l => getChallengeStatus(l).unlocked);
            selectedChallengeId = next ? next.id : (lastOpen ? lastOpen.id : 'train');
        }

        if (chalTrainingStars && training) chalTrainingStars.innerHTML = starsHtml(career.levelStars[training.id] || 0);
        if (chalTraining) chalTraining.classList.toggle('is-selected', selectedChallengeId === 'train');

        // Group missions by sector number ("Sector 01-2" -> "01")
        const groups = [];
        missions.forEach(lvl => {
            const m = /Sector\s*(\d+)/i.exec(lvl.sector || '');
            const key = m ? m[1] : '01';
            let g = groups.find(x => x.key === key);
            if (!g) groups.push(g = { key, levels: [] });
            g.levels.push(lvl);
        });
        if (challengesKicker) challengesKicker.textContent = groups.length > 1 ? `CHALLENGES · ${missions.length} MISSIONS` : `CHALLENGES · SECTOR ${groups[0] ? groups[0].key : '01'}`;

        groups.forEach(group => {
            if (groups.length > 1) {
                const earned = group.levels.reduce((a, l) => a + (career.levelStars[l.id] || 0), 0);
                const head = document.createElement('div');
                head.className = 'chal-sector-head';
                head.innerHTML = `<span class="chal-sector-name">SECTOR ${group.key}</span><span class="chal-sector-stars">★ ${earned}/${group.levels.length * 3}</span>`;
                gridEl.appendChild(head);
            }
            let missionNum = 0;
            group.levels.forEach(lvl => {
                const st = getChallengeStatus(lvl);
                if (!st.isBoss) missionNum++;
                const obj = lvl.objective || {};
                const glyph = (CHALLENGE_GLYPHS[obj.type] || (() => '★'))(obj);
                const locked = !st.unlocked;
                const tile = document.createElement('button');
                tile.type = 'button';
                tile.className = `chal-tile is-${st.state}${st.isBoss ? ' is-boss-tile' : ''}${selectedChallengeId === lvl.id ? ' is-selected' : ''}`;
                tile.dataset.levelId = lvl.id;
                tile.setAttribute('aria-label', `${lvl.title}${locked ? ', locked' : st.stars ? `, ${st.stars} stars` : ''}`);
                const lockIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>';
                const corner = locked ? `<span class="chal-tile-lock">${lockIcon}</span>` : `<span class="chal-stars">${starsHtml(st.stars)}</span>`;
                tile.innerHTML = `
                    <span class="chal-tile-top"><span class="chal-tile-num">${st.isBoss ? 'SECTOR BOSS' : `MISSION ${missionNum}`}</span>${corner}</span>
                    <span class="chal-tile-glyph">${glyph}</span>
                    <span class="chal-tile-title"></span>`;
                tile.querySelector('.chal-tile-title').textContent = lvl.title;
                tile.addEventListener('click', () => {
                    sfx.init();
                    sfx.playMove();
                    triggerHaptic('tick');
                    selectChallenge(lvl.id);
                });
                gridEl.appendChild(tile);
            });
        });

        renderChallengeSheet();
        updateCareerDisplays();
    }

    function selectChallenge(id) {
        selectedChallengeId = id;
        if (chalTraining) chalTraining.classList.toggle('is-selected', id === 'train');
        const gridEl = challengesLevelsGrid || adventureLevelsGrid;
        if (gridEl) gridEl.querySelectorAll('.chal-tile').forEach(el => {
            el.classList.toggle('is-selected', Number(el.dataset.levelId) === id);
        });
        renderChallengeSheet();
    }

    function renderChallengeSheet() {
        if (!chalSheet) return;
        const isTrain = selectedChallengeId === 'train';
        const lvl = isTrain ? ADVENTURE_LEVELS.find(l => l.isTutorial) : ADVENTURE_LEVELS.find(l => l.id === selectedChallengeId);
        if (!lvl) return;
        const st = isTrain ? { stars: career.levelStars[lvl.id] || 0, unlocked: true, isBoss: false, state: 'train' } : getChallengeStatus(lvl);

        chalSheet.dataset.kind = isTrain ? 'train' : (st.isBoss ? 'boss' : (st.state === 'cleared' ? 'cleared' : (st.unlocked ? 'current' : 'locked')));
        const code = String(lvl.sector || '').replace(/^Sector\s*/i, '').toUpperCase();
        if (chalSheetKicker) chalSheetKicker.textContent = isTrain ? 'ACADEMY · TRAINING' : (st.isBoss ? `SECTOR BOSS · ${code.replace(/-BOSS$/, '')}` : `MISSION ${code}`);
        if (chalSheetTitle) chalSheetTitle.textContent = lvl.title;
        if (chalSheetDesc) chalSheetDesc.textContent = lvl.desc;
        if (chalSheetStars) chalSheetStars.innerHTML = starsHtml(st.stars);
        if (chalSheetChips) {
            chalSheetChips.innerHTML = isTrain
                ? '<span class="chal-chip">4 guided steps</span>'
                : `<span class="chal-chip">↓ ${lvl.maxDrops} moves</span><span class="chal-chip">★ within ${lvl.targetDropsForStar} moves</span><span class="chal-chip">★ ${lvl.targetScoreForStar}+ pts</span>`;
        }
        if (btnChalLaunch) btnChalLaunch.hidden = !st.unlocked;
        if (chalSheetCta) chalSheetCta.textContent = st.stars > 0 ? 'REPLAY' : 'LAUNCH';
        if (chalSheetLocked) {
            chalSheetLocked.hidden = st.unlocked;
            if (!st.unlocked && chalSheetLockedText) {
                chalSheetLockedText.textContent = st.isBoss ? 'Clear every mission to face the boss' : 'Clear the previous mission to unlock';
            }
        }
    }

    // Alias for backward compatibility
    function renderAdventureMap() {
        renderChallenges();
    }

    function startClassicMode() {
        hideObjectiveIntro();
        gameMode = 'classic';
        isTutorial = false;
        activeAdventureLevel = null;
        isGameOver = false;
        isPaused = false;
        if (modalPause) modalPause.classList.remove('visible');
        if (modalVictory) modalVictory.classList.remove('visible');
        if (modalGameOver) modalGameOver.classList.remove('visible');

        if (gameModeDisplay) gameModeDisplay.textContent = 'NULLFALL';
        if (gameModeSub) gameModeSub.textContent = 'Puzzle Cascade';
        if (bountyCard) bountyCard.style.display = 'none';
        if (adventureObjectiveCard) adventureObjectiveCard.style.display = 'none';
        if (tutorialCard) tutorialCard.style.display = 'none';
        if (bestLabel) bestLabel.textContent = 'Best';
        if (bestVal) bestVal.textContent = (career.highScore || 0).toLocaleString();
        if (turnCounterLabel) turnCounterLabel.textContent = 'Dark Matter Rises In';

        showScreen('game');
        startNewGame();
    }

    function startAdventureLevel(levelId) {
        const lvl = levelId === GRADUATION_LEVEL.id
            ? GRADUATION_LEVEL
            : (ADVENTURE_LEVELS.find(l => l.id === levelId) || ADVENTURE_LEVELS[1] || ADVENTURE_LEVELS[0]);
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
        if (adventureObjectiveCard) adventureObjectiveCard.style.display = 'flex';
        if (tutorialCard) tutorialCard.style.display = 'none';
        if (advObjDesc) advObjDesc.textContent = lvl.desc;
        if (bestLabel) bestLabel.textContent = 'Sector Best';
        const lvlBest = career.levelHighScores[lvl.id] || 0;
        if (bestVal) bestVal.textContent = lvlBest.toLocaleString();
        if (turnCounterLabel) turnCounterLabel.textContent = 'Moves Left';

        showScreen('game');
        startNewGame();

        if (lvl.setupBoard) {
            grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
            lvl.setupBoard(grid);
        }
        updateAdventureObjectiveUI();
        showObjectiveIntro(lvl);
    }

    // ==========================================================
    // ACADEMY TRAINING — six hands-on lessons (can fail → try again)
    // ==========================================================
    // Each lesson sets a board and an orb queue, then runs one or more phases.
    // A phase passes or fails from what happened during the player's turn
    // (blasts, merges, chain depth, hold, swap, flip, breach).
    const TUT_LESSONS = [
        {
            kicker: 'LESSON 1 · ZERO BLAST', color: '#00f2fe',
            board: { '7,1': 3, '7,4': 2 }, orbs: [-3],
            phases: [{
                line: 'Opposites cancel. Drop −3 on its match.',
                chips: [['−3', 'neg'], '+', ['+3', 'pos'], '=', ['0', 'zero']],
                hint: { col: 1 },
                check: (t) => t.blasts > 0 ? 'pass' : (t.dropped ? 'fail' : null),
                fail: { title: 'No opposite there', body: 'Only exact opposites make 0. Find the <b class="c-pos">+3</b> and drop on it.' }
            }]
        },
        {
            kicker: 'LESSON 2 · MERGE', color: '#f9d423',
            board: { '7,2': 2, '7,0': -1, '7,5': 1 }, orbs: [2, -4],
            phases: [{
                line: 'Same numbers merge and double. Drop +2 on the +2.',
                chips: [['+2', 'pos'], '&', ['+2', 'pos'], '=', ['+4', 'pos']],
                hint: { col: 2 },
                check: (t) => t.merges.includes(4) ? 'pass' : (t.dropped ? 'fail' : null),
                fail: { title: 'No merge', body: 'Only identical numbers merge. Drop your <b class="c-pos">+2</b> right on the <b class="c-pos">+2</b>.' }
            }, {
                line: 'Now cancel the +4 with −4. Big blasts fire a Cross Laser!',
                chips: [['−4', 'neg'], '+', ['+4', 'pos'], '=', ['CROSS LASER', 'gold']],
                hint: { find: 4 },
                check: (t) => t.maxMag >= 4 ? 'pass' : (t.dropped ? 'fail' : null),
                fail: { title: '−4 needs the +4', body: 'Drop <b class="c-neg">−4</b> right next to the <b class="c-pos">+4</b> you built.' }
            }]
        },
        {
            kicker: 'LESSON 3 · CHAIN', color: '#00f2fe',
            board: { '7,2': -2, '7,3': 1, '6,3': 2 }, orbs: [-1],
            phases: [{
                line: 'One move, two blasts. Find the move that sets off a chain.',
                chips: [['2x', 'gold'], '→', ['3x', 'gold'], '→', ['4x', 'gold'], '· chains multiply your score'],
                hint: { col: 4 },
                check: (t) => t.chain >= 2 ? 'pass' : (t.dropped ? 'fail' : null),
                fail: (t) => t.blasts === 1
                    ? { title: 'Only one blast', body: 'Close! Find the move where a falling tile lands next to its opposite.' }
                    : { title: 'No blast', body: 'Drop <b class="c-neg">−1</b> beside the <b class="c-pos">+1</b>, then watch the <b class="c-pos">+2</b> fall onto the <b class="c-neg">−2</b>.' }
            }]
        },
        {
            kicker: 'LESSON 4 · DANGER', color: '#ff6b8a',
            board: { '1,4': 3, '2,4': 1, '3,4': 3, '4,4': 1, '5,4': 3, '6,4': 1, '7,4': 3 }, orbs: [-3],
            rise: true,
            phases: [{
                line: 'Dark Matter pushes the board up after this move. Clear the tall stack before it crosses the red line.',
                chips: [],
                hint: { col: 4 },
                check: (t) => t.breach ? 'fail' : (t.dropped ? (t.blasts > 0 ? 'pass' : 'fail') : null),
                fail: { title: 'Breach!', body: 'A tile crossed the red line and the reactor blew. Blast the top of the tall stack first.' }
            }]
        },
        {
            kicker: 'LESSON 5 · TOOLS', color: '#c471ed',
            board: { '7,1': 3, '7,2': -2, '7,3': -3, '7,4': 4 }, orbs: [1, -1],
            phases: [{
                line: 'This +1 fits nowhere. Tap HOLD to save it for later.',
                chips: [],
                hint: { target: 'hold' }, tools: { hold: true, swap: false },
                check: (t) => t.held ? 'pass' : (t.dropped ? 'fail' : null),
                fail: { title: 'That +1 had nowhere to go', body: 'When an orb doesn\'t fit, tap <b>HOLD</b> to stash it for later.' }
            }, {
                line: 'Now tap SWAP and swap the −2 and −3 so the −3 touches the +3.',
                chips: [['−2', 'neg'], '⇆', ['−3', 'neg'], '→', ['−3', 'neg'], '+', ['+3', 'pos'], '=', ['0', 'zero']],
                hint: { target: 'swap' }, tools: { hold: false, swap: true },
                check: (t) => (t.swapped && t.blasts > 0) ? 'pass' : ((t.swapped || t.dropped) ? 'fail' : null),
                fail: { title: 'No blast yet', body: 'Swap the <b class="c-neg">−2</b> and <b class="c-neg">−3</b> so the <b class="c-neg">−3</b> sits right next to the <b class="c-pos">+3</b>.' }
            }]
        },
        {
            kicker: 'LESSON 6 · FLIP', color: '#c471ed',
            board: { '7,2': 3, '7,4': -2 }, orbs: ['invert', 3],
            phases: [{
                line: '± flips a sign. Drop it on the +3.',
                chips: [['±', 'sp'], '→', ['+3', 'pos'], '=', ['−3', 'neg']],
                hint: { col: 2 },
                check: (t) => t.flipFrom !== null ? (t.flipFrom === 3 ? 'pass' : 'fail') : (t.dropped ? 'fail' : null),
                fail: { title: 'Flip the +3', body: 'Drop <b class="c-sp">±</b> straight onto the <b class="c-pos">+3</b> to turn it into <b class="c-neg">−3</b>.' }
            }, {
                line: 'Now cancel it. Drop your +3 on the −3.',
                chips: [['+3', 'pos'], '+', ['−3', 'neg'], '=', ['0', 'zero']],
                hint: { col: 2 },
                check: (t) => t.blasts > 0 ? 'pass' : (t.dropped ? 'fail' : null),
                fail: { title: '+3 needs the −3', body: 'Drop your <b class="c-pos">+3</b> beside the <b class="c-neg">−3</b> you just flipped.' }
            }]
        }
    ];

    // Graduation: a short free-play round on the real HUD, then into Adventure.
    const GRADUATION_LEVEL = {
        id: 'academy-grad',
        isGraduation: true,
        title: 'Flight Training Passed',
        sector: 'Academy',
        desc: 'Trigger 3 Zero Blasts',
        maxDrops: 10,
        targetDropsForStar: 7,
        targetScoreForStar: 200,
        objective: { type: 'annihilations', target: 3, label: 'Zero Blasts' },
        setupBoard: (g) => {
            const preset = { '7,0': 2, '7,1': -1, '7,2': 3, '7,3': -2, '7,4': 1, '7,5': -3, '6,1': 2, '6,4': -1 };
            Object.entries(preset).forEach(([k, v]) => { const [r, c] = k.split(',').map(Number); g[r][c] = createTile(v); });
        }
    };

    let tutLesson = 1;
    let tutPhase = 0;
    let tutBusy = false;
    let tutRisePending = false;
    let tutTurn = null;

    function newTutTurn() {
        return { dropped: false, swapped: false, held: false, blasts: 0, maxMag: 0, merges: [], chain: 0, flipFrom: null, breach: false };
    }
    function tutRecordBlast(magnitude) { if (tutTurn) { tutTurn.blasts++; tutTurn.maxMag = Math.max(tutTurn.maxMag, magnitude); } }
    function tutRecordMerge(value) { if (tutTurn) tutTurn.merges.push(value); }
    function tutRecordFlip(fromValue) { if (tutTurn && tutTurn.flipFrom === null) tutTurn.flipFrom = fromValue; }

    function tutPhaseDef() {
        const lesson = TUT_LESSONS[tutLesson - 1];
        return lesson ? lesson.phases[tutPhase] : null;
    }
    function tutToolAllowed(tool) {
        const ph = tutPhaseDef();
        return !!(ph && ph.tools && ph.tools[tool]);
    }

    function startTutorialMode() {
        // Lessons are written for the classic drop controls, so they run on the classic page (index.html)
        if (MAIN_GAMEPLAY) {
            window.location.href = 'index.html';
            return;
        }
        hideObjectiveIntro();
        hideTutWelcome();
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
        if (bountyCard) bountyCard.style.display = 'none';
        if (adventureObjectiveCard) adventureObjectiveCard.style.display = 'none';
        if (tutorialCard) tutorialCard.style.display = 'flex';

        showScreen('game');
        startNewGame();
        loadLesson(1);
    }

    function loadLesson(n) {
        const lesson = TUT_LESSONS[n - 1];
        if (!lesson) return;
        tutLesson = n;
        tutPhase = 0;
        tutBusy = false;
        tutorialTargetCol = null;
        hideTutFail();

        grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
        Object.entries(lesson.board).forEach(([k, v]) => {
            const [r, c] = k.split(',').map(Number);
            grid[r][c] = createTile(v);
        });
        particles = [];
        shockwaves = [];
        laserBeams = [];
        activeMergeAnimations = [];
        activeZeroPointCollapses = [];
        floatingTexts = [];
        comboCounter = null;
        activeProjectile = null;
        isProcessing = false;
        isSwapModeActive = false;
        firstSwapTile = null;
        if (swapBanner) swapBanner.style.display = 'none';
        heldOrb = null;
        swapTokens = 1;
        combo = 1;
        tutRisePending = !!lesson.rise;
        aimCol = Math.floor(COLS / 2);

        const orbs = lesson.orbs.map(tutMakeOrb);
        currentOrb = orbs[0];
        nextQueue = orbs.slice(1);
        while (nextQueue.length < 3) nextQueue.push(generateOrb());

        renderTutPips();
        applyTutPhase();
    }

    function tutMakeOrb(v) {
        if (v === 'invert') return { type: 'special', subType: 'invert', label: '±' };
        return { type: 'number', value: v, label: v > 0 ? `+${v}` : `${v}` };
    }

    function applyTutPhase() {
        const lesson = TUT_LESSONS[tutLesson - 1];
        const ph = tutPhaseDef();
        if (!lesson || !ph) return;
        tutTurn = newTutTurn();
        canHold = tutToolAllowed('hold');

        if (tutorialCard) tutorialCard.style.setProperty('--coach', lesson.color);
        if (tutorialStepBadge) tutorialStepBadge.textContent = lesson.kicker;
        if (tutorialTitle) tutorialTitle.textContent = ph.line;
        if (tutorialDesc) {
            tutorialDesc.innerHTML = '';
            ph.chips.forEach((chip) => {
                const el = document.createElement('span');
                if (Array.isArray(chip)) {
                    el.className = `coach-chip ${chip[1]}`;
                    el.textContent = chip[0];
                } else {
                    el.className = 'coach-op';
                    el.textContent = chip;
                }
                tutorialDesc.appendChild(el);
            });
            tutorialDesc.hidden = ph.chips.length === 0;
        }
        if (screenGame) {
            screenGame.classList.toggle('tut-rise', !!lesson.rise && tutRisePending);
            screenGame.classList.toggle('tut-allow-hold', tutToolAllowed('hold') || (lesson.phases.some(p => p.tools && p.tools.hold)));
            screenGame.classList.toggle('tut-allow-swap', !!(lesson.phases.some(p => p.tools && p.tools.swap)));
            screenGame.classList.toggle('tut-swap-locked', !tutToolAllowed('swap'));
        }
        updateHUD();
        setTimeout(() => showTutHint(), 350);
    }

    function renderTutPips() {
        const pips = document.getElementById('tut-pips');
        if (!pips) return;
        pips.innerHTML = '';
        TUT_LESSONS.forEach((_, i) => {
            const pip = document.createElement('span');
            pip.className = 'tut-pip' + (i < tutLesson - 1 ? ' done' : (i === tutLesson - 1 ? ' on' : ''));
            pips.appendChild(pip);
        });
        pips.setAttribute('aria-valuenow', String(tutLesson));
        pips.setAttribute('aria-valuemax', String(TUT_LESSONS.length));
    }

    // Called when a turn finishes (drop or swap resolved) or right after HOLD.
    function tutEvaluate(source) {
        if (!isTutorial || tutBusy || !tutTurn) return;
        const ph = tutPhaseDef();
        if (!ph) return;
        if (source === 'drop') tutTurn.dropped = true;
        if (source === 'swap') tutTurn.swapped = true;
        if (source === 'hold') tutTurn.held = true;
        tutTurn.breach = grid[0].some(Boolean);

        const result = ph.check(tutTurn);
        if (result === 'pass') {
            tutPassPhase();
        } else if (result === 'fail') {
            tutBusy = true;
            if (tutTurn.breach) {
                triggerScreenShake(16);
                triggerScreenFlash(0.6, '#ff4e50');
                sfx.playGameOver();
            } else {
                sfx.playWarning();
            }
            triggerHaptic('overdrive');
            const f = typeof ph.fail === 'function' ? ph.fail(tutTurn) : ph.fail;
            setTimeout(() => showTutFail(f), tutTurn.breach ? 700 : 450);
        } else {
            tutTurn = newTutTurn();
        }
    }

    function tutPassPhase() {
        const lesson = TUT_LESSONS[tutLesson - 1];
        tutBusy = true;
        hideTutHand();
        if (tutPhase < lesson.phases.length - 1) {
            setTimeout(() => {
                tutBusy = false;
                tutPhase++;
                applyTutPhase();
            }, 650);
            return;
        }
        // Lesson complete
        addFloatingText('✓ NICE!', canvas.width / (2 * dpr), boardOffsetY + cellH * 2.2, '#f9d423', 1.6);
        sfx.playPowerup();
        triggerHaptic('zero');
        const pips = document.querySelectorAll('#tut-pips .tut-pip');
        if (pips[tutLesson - 1]) { pips[tutLesson - 1].classList.remove('on'); pips[tutLesson - 1].classList.add('done', 'pop'); }
        setTimeout(() => {
            if (!isTutorial) return;
            if (tutLesson < TUT_LESSONS.length) {
                loadLesson(tutLesson + 1);
            } else {
                startGraduation();
            }
        }, 1100);
    }

    function startGraduation() {
        isTutorial = false;
        hideTutHand();
        hideTutFail();
        if (screenGame) screenGame.classList.remove('tut-mode', 'tut-rise', 'tut-allow-hold', 'tut-allow-swap', 'tut-swap-locked');
        startAdventureLevel(GRADUATION_LEVEL.id);
    }

    function exitTutorial(markSkipped) {
        hideTutHand();
        hideTutFail();
        if (markSkipped && career && !career.tutorialDone) {
            career.tutorialSkipped = true;
            saveCareerData();
        }
        isTutorial = false;
        showScreen('home');
    }

    // ---------- Ghost hand ----------
    function showTutHint() {
        const hand = document.getElementById('tut-hand');
        const ph = tutPhaseDef();
        if (!hand || !ph || !isTutorial || tutBusy) return;
        const hint = ph.hint || {};
        let x = null, y = null;
        if (hint.target === 'hold' || hint.target === 'swap') {
            const btn = hint.target === 'hold' ? btnTouchHold : btnTouchSwap;
            if (!btn) return;
            const r = btn.getBoundingClientRect();
            x = r.left + r.width / 2; y = r.top + r.height / 2;
        } else if (hint.cells) {
            const rect = canvas.getBoundingClientRect();
            const [r1, c1] = hint.cells[0];
            x = rect.left + boardOffsetX + (c1 + 0.5) * cellW;
            y = rect.top + boardOffsetY + (r1 + 0.5) * cellH;
        } else {
            let col = hint.col;
            if (hint.find !== undefined) {
                for (let r = 0; r < ROWS && col === undefined; r++) {
                    for (let c = 0; c < COLS; c++) {
                        if (grid[r][c] && grid[r][c].type === 'number' && grid[r][c].value === hint.find) { col = c; break; }
                    }
                }
            }
            if (col === undefined) return;
            const rect = canvas.getBoundingClientRect();
            x = rect.left + boardOffsetX + (col + 0.5) * cellW;
            y = rect.top + boardOffsetY + cellH * 2.2;
        }
        hand.style.left = `${x}px`;
        hand.style.top = `${y}px`;
        hand.hidden = false;
    }

    function hideTutHand() {
        const hand = document.getElementById('tut-hand');
        if (hand) hand.hidden = true;
    }

    // When the player enters swap mode in lesson 5, point at the −2 tile
    function tutOnSwapMode(active) {
        if (!isTutorial) return;
        if (active) {
            const hand = document.getElementById('tut-hand');
            if (!hand) return;
            const rect = canvas.getBoundingClientRect();
            hand.style.left = `${rect.left + boardOffsetX + 2.5 * cellW}px`;
            hand.style.top = `${rect.top + boardOffsetY + 7.5 * cellH}px`;
            hand.hidden = false;
        } else {
            hideTutHand();
        }
    }

    // ---------- Try-again sheet ----------
    function showTutFail(f) {
        const sheet = document.getElementById('tut-fail');
        if (!sheet) return;
        hideTutHand();
        const title = document.getElementById('tut-fail-title');
        const body = document.getElementById('tut-fail-body');
        if (title) title.textContent = f.title;
        if (body) body.innerHTML = f.body;
        sheet.hidden = false;
    }

    function hideTutFail() {
        const sheet = document.getElementById('tut-fail');
        if (sheet) sheet.hidden = true;
    }

    // ---------- First-launch welcome ----------
    function shouldOfferTutorial() {
        if (MAIN_GAMEPLAY) return false; // lessons are written for the classic drop controls
        if (!career || career.tutorialDone || career.tutorialSkipped) return false;
        const hasProgress = (career.highScore || 0) > 0
            || (career.levelStars && career.levelStars[0])
            || (career.adventureNodes && Object.keys(career.adventureNodes).length > 0);
        return !hasProgress;
    }

    function showTutWelcome() {
        const el = document.getElementById('tut-welcome');
        if (el) el.hidden = false;
    }

    function hideTutWelcome() {
        const el = document.getElementById('tut-welcome');
        if (el) el.hidden = true;
    }

    // ---------- Real game: first Overdrive tip ----------
    function maybeShowOverdriveTip() {
        if (isTutorial || !career || career.seenOverdriveTip) return;
        career.seenOverdriveTip = true;
        saveCareerData();
        const tip = document.getElementById('od-tip');
        if (tip) setTimeout(() => { tip.hidden = false; }, 350);
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

    // Node to launch from the success screen's Next button (adventure node runs)
    let victoryNextNode = null;

    // Next node on the sector's main path. A bonus node continues from the
    // node it branched off; a cleared boss leads into the next sector's first node.
    function getNextNodeConfig(level) {
        if (!level || !level.sectorNum || typeof NodeGenerator === 'undefined') return null;
        const graph = NodeGenerator.getSectorGraph(level.sectorNum);
        const self = graph.nodes.find(n => n.id === level.id);
        const fromId = self && self.type === 'bonus' ? self.branchOf : level.id;
        const link = graph.links.find(l => l.from === fromId && !l.isBonusBranch);
        if (link) {
            const next = graph.nodes.find(n => n.id === link.to);
            return next ? next.config : null;
        }
        if (level.isBoss && level.sectorNum < NodeGenerator.SECTOR_METADATA.length) {
            const nextSector = level.sectorNum + 1;
            const root = NodeGenerator.getSectorGraph(nextSector).nodes.find(n => n.id === `${nextSector}-1`);
            return root ? root.config : null;
        }
        return null;
    }

    function setVictoryNextLabel(text) {
        const label = document.getElementById('vic-next-label');
        if (label) label.textContent = text;
    }

    function renderVictoryScreen(v) {
        clearFlyingChips();
        const kicker = document.getElementById('victory-kicker');
        const vicBest = document.getElementById('vic-best');
        const dropsLabel = document.getElementById('vic-drops-label');
        if (kicker) kicker.textContent = v.kicker;
        if (victoryTitle) victoryTitle.textContent = v.title;
        if (vicScore) {
            vicScore.textContent = '0';
            vicScore._countValue = 0;
            const target = v.score;
            setTimeout(() => {
                animateCount(vicScore, target, 1200, 0, scoreTicks);
                setTimeout(() => retriggerClass(vicScore, 'count-done'), 1200);
            }, 900);
        }
        if (vicBonus) vicBonus.textContent = v.bonus;
        if (vicDrops) vicDrops.textContent = v.drops;
        if (dropsLabel) dropsLabel.textContent = v.dropsLabel;
        if (vicCascade) vicCascade.textContent = `${maxCombo}x`;
        if (vicBest) vicBest.textContent = v.best;
        if (victoryStarsContainer) {
            // Each star lights for its own goal (objective · drops · score) when flags are given
            let earned = 0;
            victoryStarsContainer.querySelectorAll('.win-star').forEach((el, i) => {
                const off = v.starFlags ? !v.starFlags[i] : i >= v.stars;
                el.classList.toggle('off', off);
                el.classList.remove('stamped');
                // Earned stars slam down (CSS); each landing gets a ring, a haptic and a rising note
                if (!off) {
                    const nth = earned++;
                    setTimeout(() => {
                        if (!modalVictory || !modalVictory.classList.contains('visible')) return;
                        if (!prefersReducedMotion()) retriggerClass(el, 'stamped');
                        sfx.playStarStamp(nth);
                        triggerHaptic(STAR_STAMP_HAPTICS[nth] || 'laser');
                    }, VICTORY_PANEL_MS + STAR_DELAYS_MS[i] + STAR_LAND_MS);
                }
            });
            victoryStarsContainer.setAttribute('aria-label', `${v.stars} of 3 stars`);
        }
        renderVictoryGoals(v.goals || []);
        if (btnVicMap) btnVicMap.hidden = !v.showMap;
    }

    // "How you earned your stars": one row per star goal with its real value
    function renderVictoryGoals(goals) {
        const wrap = document.getElementById('vic-goals');
        const list = document.getElementById('vic-goals-list');
        if (!wrap || !list) return;
        list.innerHTML = '';
        wrap.hidden = goals.length === 0;
        goals.forEach((g) => {
            const row = document.createElement('div');
            row.className = `win-goal ${g.got ? 'got' : 'miss'}`;
            row.setAttribute('role', 'listitem');
            row.innerHTML = '<span class="win-goal-star" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6L2.5 9.5l6.6-.8z"></path></svg></span>';
            const text = document.createElement('span');
            text.className = 'win-goal-text';
            const b = document.createElement('b');
            b.textContent = g.title;
            const sub = document.createElement('span');
            sub.textContent = g.sub;
            text.append(b, sub);
            const val = document.createElement('span');
            val.className = 'win-goal-val';
            val.textContent = g.val;
            row.append(text, val);
            row.setAttribute('aria-label', `${g.got ? 'Earned' : 'Missed'}: ${g.title}, ${g.sub}`);
            list.appendChild(row);
        });
    }

    function restartCurrentGame() {
        if (firstPlay) {
            fpLoadStep(firstPlay.step);
            return;
        }
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

    const TUTORIAL_STEP_TITLES = [
        'Zero Blast: cancel opposites',
        'Merge, then fire a Cross Laser',
        'Chain reaction',
        'Danger: Dark Matter rises',
        'Tools: Hold & Swap',
        'Flip a sign with ±'
    ];

    // Builds the pause screen model for the active mode: ring (objective), title/chip,
    // and goals (star goals for adventure/challenges, run goals for classic, steps for the tutorial).
    function getPauseModel() {
        const lvl = activeAdventureLevel;
        const isNode = gameMode === 'adventure' && lvl && lvl.sectorNum;

        if (isTutorial) {
            const total = TUTORIAL_STEP_TITLES.length;
            const step = Math.max(1, Math.min(total, tutLesson || 1));
            return {
                accent: '#f9d423', chip: 'ACADEMY TRAINING', title: 'Flight Training',
                ringLabel: 'LESSON', ringValue: `${step} / ${total}`, ringSub: TUTORIAL_STEP_TITLES[step - 1],
                pct: Math.round(((step - 1) / total) * 100),
                goals: TUTORIAL_STEP_TITLES.map((t, i) => {
                    const n = i + 1;
                    const state = n < step ? 'done' : (n === step ? 'track' : 'todo');
                    return { glyph: state === 'done' ? '✓' : String(n), label: t, detail: state === 'done' ? 'Done' : (state === 'track' ? 'Now' : ''), state };
                }),
                restart: 'Restart lesson', exit: 'Exit training'
            };
        }

        if (gameMode === 'adventure' && lvl && isGoalLevel(lvl)) {
            const obj = lvl.goal;
            const meta = OBJECTIVE_META[obj.type];
            const { cur, tgt, left } = getObjectiveCounts(obj);
            const met = adventureObjectiveMet;
            const have = getStarMeasure(lvl.stars);
            const headroom = lvl.stars.kind === 'headroom';
            const starGoal = (need) => {
                const ok = have >= need;
                const now = headroom ? `${starUnit(lvl.stars, have)} free` : `${have} left`;
                return { glyph: '★', label: starGoalText(lvl.stars, need), detail: `${now} · ${ok ? 'on track' : (headroom ? 'not yet' : 'missed')}`, state: ok ? 'track' : 'todo' };
            };
            const meta2 = typeof NodeGenerator !== 'undefined' ? NodeGenerator.SECTOR_METADATA[lvl.sectorNum - 1] : null;
            return {
                accent: meta2 ? meta2.color : '#00f2fe',
                chip: `ADVENTURE · NODE ${lvl.id}`,
                title: String(lvl.title || '').replace(/^(Sector Boss|Bonus):\s*/, ''),
                ringLabel: 'GOAL', ringValue: met ? 'Done' : `${left} left`, ringSub: meta ? meta.short(obj) : lvl.desc,
                pct: met ? 100 : Math.round((cur / tgt) * 100),
                goals: [
                    { glyph: '★', label: meta ? meta.short(obj) : 'Complete the goal', detail: met ? 'Done' : `${left} left`, state: met ? 'done' : 'progress' },
                    starGoal(lvl.stars.two),
                    starGoal(lvl.stars.three)
                ],
                restart: 'Restart node',
                exit: 'Exit to star map'
            };
        }

        if (gameMode === 'adventure' && lvl) {
            const obj = lvl.objective || { target: 1, label: 'Objective' };
            const tgt = obj.target || 1;
            const cur = Math.min(adventureProgress, tgt);
            const met = adventureObjectiveMet || adventureProgress >= tgt;
            let value = `${cur} / ${tgt}`;
            if (obj.type === 'synthesis_tier') value = met ? 'Done' : `+${cur} / +${tgt}`;
            else if (obj.type === 'activate_frenzy' || obj.type === 'trigger_laser') value = met ? 'Done' : '0 / 1';
            const pct = met ? 100 : Math.round((cur / tgt) * 100);

            const dropsOk = dropsUsed <= lvl.targetDropsForStar;
            const scoreOk = score >= lvl.targetScoreForStar;
            const goals = [
                { glyph: '★', label: 'Complete the objective', detail: met ? 'Done' : value, state: met ? 'done' : 'progress' },
                { glyph: '★', label: `Finish within ${lvl.targetDropsForStar} moves`, detail: dropsOk ? `${dropsUsed} used · on track` : `${dropsUsed} used · missed`, state: dropsOk ? 'track' : 'todo' },
                { glyph: '★', label: `Score ${lvl.targetScoreForStar.toLocaleString()}+ points`, detail: scoreOk ? `${score.toLocaleString()} ✓` : `${score.toLocaleString()} / ${lvl.targetScoreForStar.toLocaleString()}`, state: scoreOk ? 'done' : 'progress' }
            ];
            let accent = '#c471ed';
            if (isNode && typeof NodeGenerator !== 'undefined') {
                const meta = NodeGenerator.SECTOR_METADATA[lvl.sectorNum - 1];
                accent = meta ? meta.color : '#00f2fe';
            }
            return {
                accent,
                chip: isNode ? `ADVENTURE · NODE ${lvl.id}` : `CHALLENGE · ${String(lvl.sector || '').replace(/^Sector\s*/i, '').toUpperCase()}`,
                title: String(lvl.title || '').replace(/^(Sector Boss|Bonus):\s*/, ''),
                ringLabel: 'OBJECTIVE', ringValue: value, ringSub: obj.label || lvl.desc || '',
                pct, goals,
                restart: isNode ? 'Restart node' : 'Restart mission',
                exit: isNode ? 'Exit to star map' : 'Exit to missions'
            };
        }

        // Classic survival
        const best = career.highScore || 0;
        const isNewBest = score > best && best > 0;
        const goals = [];
        if (classicSurge) {
            goals.push({ glyph: classicSurge.glyph, label: `Surge: ${ClassicRun.describe(classicSurge, tideUnit())}`, detail: `${goalCount(classicSurge, classicSurge.progress)} · ${classicSurge.dropsLeft} move${classicSurge.dropsLeft === 1 ? '' : 's'} left`, state: 'progress' });
        }
        if (bountyLadder) {
            const rung = ClassicRun.currentRung(bountyLadder);
            goals.push({ glyph: rung.glyph, label: `Bounty ${rung.index + 1}: ${ClassicRun.describe(rung, tideUnit())}`, detail: `${goalCount(rung, bountyLadder.progress)} · ${ClassicRun.describeReward(rung.reward)}`, state: 'progress' });
        }
        const swapIn = Math.max(1, 8 - dropsSinceSwapCharge);
        goals.push({ glyph: '⇄', label: 'Next swap token', detail: `in ${swapIn} move${swapIn === 1 ? '' : 's'}`, state: 'track' });
        goals.push({ glyph: '↑', label: 'Dark matter rises', detail: `in ${movesUntilRise} move${movesUntilRise === 1 ? '' : 's'}`, state: movesUntilRise <= 1 ? 'todo' : 'progress' });
        return {
            accent: '#00f2fe', chip: 'CLASSIC SURVIVAL', title: `Score ${score.toLocaleString()}`,
            ringLabel: best > 0 ? `BEST ${best.toLocaleString()}` : 'FIRST RUN',
            ringValue: best > 0 ? (isNewBest ? 'NEW!' : `${Math.min(100, Math.round((score / best) * 100))}%`) : score.toLocaleString(),
            ringSub: best > 0 ? (isNewBest ? 'New best score' : 'of your best score') : 'points so far',
            pct: best > 0 ? Math.min(100, Math.round((score / best) * 100)) : 100,
            goals, restart: 'Restart run', exit: 'Exit to menu'
        };
    }

    // Pause screen: goal glyphs drawn as icons (symbol characters can render as emoji on iOS)
    const PAUSE_GLYPH_SVG = {
        '★': '<path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" fill="currentColor"/>',
        '✓': '<path d="M4.5 12.5 9.5 17.5 19.5 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
        '◈': '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 8 16 12 12 16 8 12z" fill="currentColor"/>',
        '◆': '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z" fill="currentColor"/>',
        '○': '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2.6"/>',
        '◎': '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" stroke-width="2.4"/>',
        '◉': '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="4" fill="currentColor"/>',
        '▲': '<path d="M12 4 21 19.5H3z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
        '⏳': '<path d="M6.5 3h11M6.5 21h11M7.5 3c0 5 9 5 9 9s-9 4-9 9M16.5 3c0 5-9 5-9 9s9 4 9 9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
        '✚': '<path d="M12 3v18M3 12h18" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
        'ϟ': '<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor"/>',
        '⇄': '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
        '↑': '<path d="M12 20V4M5.5 10.5 12 4l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
        '⊕': '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
        '✹': '<path d="M12 1.5l2.1 5.4 4.9-3.3-1.4 5.7 5.9.5-4.6 3.7 4.1 4.3-5.9.3.6 5.9-4.6-3.6-3.4 4.9-1.2-5.8-5.6 1.9 2.7-5.3-5.5-2.3 5.6-1.9-1.5-5.7 5.1 3z" fill="currentColor"/>',
        '×': '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
        '🔒': '<path d="M7.5 11V8a4.5 4.5 0 0 1 9 0v3M5 11h14v10H5z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>'
    };

    function pauseGlyphHtml(glyph) {
        const g = String(glyph);
        const svg = PAUSE_GLYPH_SVG[g.replace(/️/g, '')];
        if (svg) return `<svg class="pause-glyph-icon" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">${svg}</svg>`;
        return g.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }

    function renderPauseScreen() {
        if (!modalPause) return;
        const m = getPauseModel();
        const n = parseInt(m.accent.slice(1), 16);
        const tint = (a) => `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
        modalPause.style.setProperty('--pause-accent', m.accent);
        modalPause.style.setProperty('--pause-haze', tint(0.14));
        modalPause.style.setProperty('--pause-glow', tint(0.3));
        modalPause.style.setProperty('--pause-dash', tint(0.25));
        modalPause.style.setProperty('--pause-chip', tint(0.12));
        modalPause.style.setProperty('--pause-pct', `${m.pct}%`);
        if (pauseRingLabel) pauseRingLabel.textContent = m.ringLabel;
        if (pauseRingValue) pauseRingValue.textContent = m.ringValue;
        if (pauseRingSub) pauseRingSub.textContent = m.ringSub;
        if (pauseRing) pauseRing.setAttribute('aria-label', `${m.ringLabel}: ${m.ringValue}`);
        if (pauseTitle) pauseTitle.textContent = m.title;
        if (pauseChip) pauseChip.textContent = m.chip;
        if (btnPauseRestart) btnPauseRestart.setAttribute('aria-label', m.restart);
        if (btnPauseQuit) btnPauseQuit.setAttribute('aria-label', m.exit);

        // Goal medals orbit the top of the ring (up to 4)
        if (pauseOrbs) {
            const orbGoals = m.goals.slice(0, 4);
            const n = orbGoals.length;
            pauseOrbs.innerHTML = orbGoals.map((g, i) => {
                const a = (-90 + (i - (n - 1) / 2) * 36) * Math.PI / 180;
                const x = 50 + 50 * Math.cos(a);
                const y = 50 + 50 * Math.sin(a);
                return `<span class="pause-orb is-${g.state}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%">${pauseGlyphHtml(g.glyph)}</span>`;
            }).join('');
        }

        if (pauseGoals) {
            pauseGoals.innerHTML = '';
            m.goals.forEach(g => {
                const row = document.createElement('div');
                row.className = `pause-goal is-${g.state}`;
                const glyph = document.createElement('span');
                glyph.className = 'pause-goal-glyph';
                glyph.innerHTML = pauseGlyphHtml(g.glyph);
                const label = document.createElement('span');
                label.className = 'pause-goal-label';
                label.textContent = g.label;
                const detail = document.createElement('span');
                detail.className = 'pause-goal-detail';
                detail.textContent = g.detail;
                row.append(glyph, label, detail);
                pauseGoals.appendChild(row);
            });
        }
    }

    function togglePause(forceState) {
        if (currentScreen !== 'game' || isGameOver) return;
        if (modalVictory && modalVictory.classList.contains('visible')) return;

        isPaused = (forceState !== undefined) ? forceState : !isPaused;
        if (firstPlay) {
            if (isPaused) fpHideHand();
            else setTimeout(fpStartHand, 120);
        }

        if (isPaused) {
            renderPauseScreen();
            if (modalPause) modalPause.classList.add('visible');
        } else {
            if (modalPause) modalPause.classList.remove('visible');
            lastTime = performance.now();
        }
    }

    function syncShakePills() {
        const level = (career.settings && career.settings.shake) || 'high';
        settingShakePills.forEach((pill) => {
            const on = pill.dataset.shake === level;
            pill.classList.toggle('on', on);
            pill.setAttribute('aria-checked', on ? 'true' : 'false');
        });
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

        // Each app open starts on the next soundtrack in the rotation
        if (sfx) { sfx.prepare(); sfx.rotateBGM(); }

        // Music starts just after the first tap, so the tap itself stays instant
        const initAudioOnGesture = () => {
            sfx.init();
            if (career.settings && career.settings.bgm && !sfx.muted) {
                setTimeout(() => sfx.startBGM(), 60);
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
        // Main gameplay opens the How to play slides; the old interactive lessons stay on index.html as a backup
        const openTutorial = (MAIN_GAMEPLAY && htpRoot) ? openHowToPlay : startTutorialMode;
        if (btnHomeTutorial) btnHomeTutorial.addEventListener('click', openTutorial);
        if (btnCodexTutorial) btnCodexTutorial.addEventListener('click', openTutorial);
        if (MAIN_GAMEPLAY && htpRoot) setupHowToPlay();
        if (MAIN_GAMEPLAY) setupFirstPlay();
        setupConceptCard();
        setupLadder();
        setupDiscoveries();
        const hintX = document.getElementById('tool-hint-x');
        if (hintX) hintX.addEventListener('click', (e) => { e.stopPropagation(); hideToolHint(); });
        window.addEventListener('resize', () => { if (toolHint) positionToolHint(); });
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

        // Node sheet: launch the selected node
        if (btnNodeSheetLaunch) btnNodeSheetLaunch.addEventListener('click', () => {
            const node = mapGraphNodes.find(n => n.id === mapSelectedNodeId);
            if (node && node.config) startNodeLevel(node.config);
        });

        // Node Preview Modal Actions (legacy modal, no longer opened from the map)
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
        if (chalTraining) chalTraining.addEventListener('click', () => {
            sfx.init();
            sfx.playMove();
            triggerHaptic('tick');
            selectChallenge('train');
        });
        if (btnChalLaunch) btnChalLaunch.addEventListener('click', () => {
            if (selectedChallengeId === 'train') startTutorialMode();
            else if (selectedChallengeId !== null) startAdventureLevel(selectedChallengeId);
        });
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
            // Hide the pause card while Academy is open; it comes back on return
            if (modalPause) modalPause.classList.remove('visible');
            showScreen('codex');
        });
        if (btnPauseSettings) btnPauseSettings.addEventListener('click', () => {
            if (modalSettings) modalSettings.classList.add('visible');
        });
        if (btnPauseQuit) btnPauseQuit.addEventListener('click', () => {
            togglePause(false);
            if (isTutorial || (activeAdventureLevel && activeAdventureLevel.isGraduation)) {
                exitTutorial(false);
                return;
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
            if (activeAdventureLevel && activeAdventureLevel.editorTest && typeof NullfallLevelEditor !== 'undefined') {
                showScreen('adventure-nodes');
                NullfallLevelEditor.open();
            } else if (activeAdventureLevel && activeAdventureLevel.isGraduation) {
                const first = victoryNextNode;
                victoryNextNode = null;
                if (first) {
                    career.currentSector = 1;
                    saveCareerData();
                    startNodeLevel(first);
                } else {
                    showScreen('adventure-nodes');
                }
            } else if (activeAdventureLevel && activeAdventureLevel.sectorNum) {
                const next = victoryNextNode;
                victoryNextNode = null;
                if (next) {
                    if (next.sectorNum && next.sectorNum !== career.currentSector) {
                        career.currentSector = next.sectorNum;
                        saveCareerData();
                    }
                    startNodeLevel(next);
                } else {
                    showScreen('adventure-nodes');
                }
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

        if (settingDebugToggle) {
            settingDebugToggle.addEventListener('change', (e) => {
                setDebugMode(e.target.checked);
                if (sfx) sfx.playMove();
            });
        }

        // Hidden gesture: tap the NULLFALL title 5 times quickly to toggle debug mode
        if (homeTitle) {
            let taps = [];
            // pointerup, not click: iOS WebKit doesn't send click to non-interactive elements
            homeTitle.addEventListener('pointerup', () => {
                const now = Date.now();
                taps = taps.filter((t) => now - t < 2500);
                taps.push(now);
                if (taps.length >= 5) {
                    taps = [];
                    setDebugMode(!isDebugMode());
                    triggerHaptic('swap');
                    if (sfx) sfx.playPowerup();
                }
            });
        }

        // Tap feedback for every button: a soft click and a light haptic
        const TAP_TARGETS = 'button, [role="button"], [role="switch"], label.qs-row, a[href]';
        document.addEventListener('pointerdown', (e) => {
            const el = e.target.closest && e.target.closest(TAP_TARGETS);
            if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[data-no-tap]')) return;
            sfx.init();
            sfx.playTap();
            triggerHaptic('tap');
        }, { passive: true });

        // Native: always full screen; re-hide the system bars and refresh reminders around app switches
        const systemBars = nativePlugin('SystemBars');
        const hideBars = () => { if (systemBars) systemBars.hide().catch(() => {}); };
        hideBars();
        scheduleReminders();
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                scheduleReminders();
            } else {
                hideBars();
                cancelReminders();
            }
        });

        if (settingVibrationToggle) {
            settingVibrationToggle.addEventListener('change', (e) => {
                career.settings.vibration = e.target.checked;
                saveCareerData();
                if (e.target.checked) {
                    triggerHaptic('tick');
                }
            });
        }

        if (settingReduceEffectsToggle) {
            settingReduceEffectsToggle.addEventListener('change', (e) => {
                career.settings.reduceEffects = e.target.checked; // an explicit choice now overrides the system
                saveCareerData();
                syncReduceEffects();
                if (sfx) sfx.playMove();
            });
        }

        settingShakePills.forEach((pill) => {
            pill.addEventListener('click', () => {
                career.settings.shake = pill.dataset.shake;
                saveCareerData();
                syncShakePills();
                if (sfx) sfx.playMove();
            });
        });

        // Tapping the dimmed backdrop above the sheet closes it
        if (modalSettings) modalSettings.addEventListener('click', (e) => {
            if (e.target === modalSettings) modalSettings.classList.remove('visible');
        });

        if (btnResetData) {
            btnResetData.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all stars, campaign progress, and high scores?')) {
                    career = {
                        highScore: 0,
                        unlockedLevel: 1,
                        levelStars: {},
                        levelHighScores: {},
                        settings: { sfx: true, bgm: true, bgmOnMigrated: true, vibration: true, shake: 'high' }
                    };
                    saveCareerData();
                    updateCareerDisplays();
                    renderAdventureMap();
                    alert('Career progress has been reset.');
                }
            });
        }

        // Codex Tabs & Buttons
        const leaveCodex = () => {
            showScreen(codexPreviousScreen);
            // Back into a paused game: show the pause card again
            if (codexPreviousScreen === 'game' && isPaused && modalPause) {
                renderPauseScreen();
                modalPause.classList.add('visible');
            }
        };
        if (btnCodexToHome) btnCodexToHome.addEventListener('click', leaveCodex);
        if (btnCodexClose) btnCodexClose.addEventListener('click', leaveCodex);

        const btnCodexNext = document.getElementById('btn-codex-next');
        if (btnCodexNext) btnCodexNext.addEventListener('click', () => {
            if (academyLesson >= ACADEMY_LESSONS.length - 1) {
                startTutorialMode();
                return;
            }
            academyLesson++;
            renderAcademy();
            sfx.playMove();
        });

        // Training chrome
        const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
        on('btn-tut-exit', () => exitTutorial(false));
        on('btn-tut-skip', () => exitTutorial(true));
        on('btn-tut-retry', () => { sfx.playMove(); loadLesson(tutLesson); });
        on('btn-tut-showme', () => { sfx.playMove(); loadLesson(tutLesson); });
        on('btn-tut-welcome-start', () => { sfx.init(); startTutorialMode(); });
        on('btn-tut-welcome-skip', () => {
            career.tutorialSkipped = true;
            saveCareerData();
            hideTutWelcome();
        });
        on('btn-od-tip-ok', () => { const tip = document.getElementById('od-tip'); if (tip) tip.hidden = true; });
        window.addEventListener('resize', () => { const hand = document.getElementById('tut-hand'); if (hand && !hand.hidden) showTutHint(); });

        const objIntroOverlay = document.getElementById('obj-intro');
        if (objIntroOverlay) objIntroOverlay.addEventListener('click', dismissObjectiveIntro);

        // Tapping the objective strip (expanded or collapsed) reopens the objective card
        if (adventureObjectiveCard) {
            const openReview = () => {
                if (gameMode !== 'adventure' || !activeAdventureLevel || isGameOver || isPaused) return;
                if (objIntroOverlay && !objIntroOverlay.hidden) return;
                if (sfx) sfx.playMove();
                triggerHaptic('tick');
                showObjectiveIntro(activeAdventureLevel, { review: true });
            };
            adventureObjectiveCard.tabIndex = 0;
            adventureObjectiveCard.setAttribute('aria-haspopup', 'dialog');
            adventureObjectiveCard.addEventListener('click', openReview);
            adventureObjectiveCard.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReview(); }
            });
        }

        // Game Over Menu Action
        if (btnGoMenu) {
            btnGoMenu.addEventListener('click', () => {
                if (modalGameOver) modalGameOver.classList.remove('visible');
                if (isTutorial) {
                    isTutorial = false;
                    if (tutorialCard) tutorialCard.style.display = 'none';
                }
                showScreen('home');
            });
        }

        const btnGoMap = document.getElementById('btn-go-map');
        if (btnGoMap) {
            btnGoMap.addEventListener('click', () => {
                if (modalGameOver) modalGameOver.classList.remove('visible');
                if (activeAdventureLevel && activeAdventureLevel.sectorNum) {
                    showScreen('adventure-nodes');
                } else {
                    showScreen('challenges');
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

        // Debug mode can also be flipped from the URL: ?debug=1 (on) / ?debug=0 (off)
        const debugParam = new URLSearchParams(window.location.search).get('debug');
        if (debugParam === '1') setDebugMode(true);
        else if (debugParam === '0') setDebugMode(false);
        // ?firstplay=1 replays the coached first play on the next launch of node 1-1
        if (new URLSearchParams(window.location.search).get('firstplay') === '1' && career.firstPlayDone) {
            career.firstPlayDone = false;
            saveCareerData();
        }
        if (applyDevGameplayPreference()) return;
        setupDevTools();
        syncLabsUI();
        // ?dev=1 opens the dev tools sheet straight away (turns debug mode on)
        if (new URLSearchParams(window.location.search).get('dev') === '1') {
            if (!isDebugMode()) setDebugMode(true);
            openDevTools();
        }

        showScreen('home');
        if (shouldOfferTutorial()) showTutWelcome();
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

        // Square cells sized to whichever axis is tighter: +1.2 rows at the top for the launcher and
        // +1 row at the bottom for the Dark Matter banner. Extra width centers the board; extra
        // height becomes drop space above it.
        // Main gameplay has no launcher, so it only keeps a sliver of headroom for floating text.
        const cell = Math.min(rect.width / COLS, rect.height / (ROWS + (MAIN_GAMEPLAY ? 1.3 : 2.2)));
        cellW = cell;
        cellH = cell;
        boardOffsetX = (rect.width - cell * COLS) / 2;
        boardOffsetY = rect.height - cell * (ROWS + 1);
        if (riseStatusBar) riseStatusBar.style.height = `${cell}px`;
        if (canvas.parentElement) canvas.parentElement.style.setProperty('--rise-h', `${cell}px`);
    }

    function startNewGame() {
        // Every new game moves the soundtrack on; boss levels get the upbeat tracks
        if (sfx) sfx.rotateBGM(isBossLevel());
        // Main gameplay: Classic uses the new header (BEST · score · pause, overdrive row below);
        // Adventure and Challenges keep the original layout
        if (MAIN_GAMEPLAY && screenGame) {
            const wasClassic = screenGame.classList.contains('hud-classic');
            const isClassic = gameMode === 'classic' && !isTutorial;
            screenGame.classList.toggle('hud-classic', isClassic);
            if (wasClassic !== isClassic) setTimeout(resizeCanvas, 60); // header height changed
        }
        grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
        starCells = [];
        sealedCols = [];
        sealCounts = {};
        sealOpenings = [];
        riserClock = 0;
        pendingDeals = [];
        orbDealer = null;
        orbDealerKey = null;
        classicTide = 0;
        classicDrops = 0;
        classicHeat = 0;
        runBestOrb = 0;
        runUsedHold = false;
        runUsedSwap = false;
        runHintShown = {};
        if (guide) endGuide();
        pendingGuide = null;
        hideToolHint();
        score = 0;
        resetScoreFlyers();
        setScoreDisplay(0, true);
        lastCoreHighlight = false;
        combo = 1;
        maxCombo = 1;
        totalZeroPoints = 0;
        if (gameMode === 'adventure' && activeAdventureLevel && activeAdventureLevel.rules && activeAdventureLevel.rules.fluxRate > 0) {
            movesUntilRise = activeAdventureLevel.rules.fluxRate;
        } else {
            movesUntilRise = classicRisePeriod();
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
        screenFlashX = screenFlashY = null;
        floatingTexts = [];
        comboCounter = null;
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

        bountyLadder = null;
        classicSurge = null;
        surgeBag = null;
        surgeCount = 0;
        tidePending = false;
        ladderWeaponIndex = 0;
        if (isTutorial) {
            adventureProgress = 0;
            adventureObjectiveMet = false;
            dropsUsed = 0;
            maxDrops = 99;
            canHold = false;
        } else if (gameMode === 'classic') {
            if (typeof ClassicRun !== 'undefined') {
                bountyLadder = ClassicRun.createLadder();
                surgeBag = ClassicRun.createSurgeBag();
            }
            populateInitialBoard();
        } else if (gameMode === 'adventure') {
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
            if (MAIN_GAMEPLAY) {
                // The tray replaces the launcher; currentOrb is only set while an orb is dragged
                dragTray = [generateOrb(), generateOrb()];
                currentOrb = null;
            }
        }
        activeDrag = null;
        boardSwapDrag = null;
        if (dragGhost) dragGhost.classList.remove('show');

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

    function makeSpecialOrb() {
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

    // pool: { values: [magnitudes], specials: chance, favor?: magnitude dealt twice as often }
    // Guarantees first (a Riser's opposite turns up within a few deals)
    function takeDueDeal() {
        if (!pendingDeals.length) return null;
        pendingDeals.forEach((d) => { d.due--; });
        const dueIdx = pendingDeals.findIndex((d) => d.due <= 0);
        if (dueIdx < 0) return null;
        const v = pendingDeals.splice(dueIdx, 1)[0].value;
        return { type: 'number', value: v, label: v > 0 ? `+${v}` : `${v}` };
    }

    function generateLevelPoolOrb(pool) {
        const due = takeDueDeal();
        if (due) return due;
        if (pool.specials && Math.random() < pool.specials) return makeSpecialOrb();
        if (orbDealerKey !== activeAdventureLevel) {
            const goal = activeAdventureLevel.goal;
            orbDealer = OrbBag.createDealer({
                values: pool.values,
                favor: pool.favor,
                pairBias: pool.pairBias,
                // Collect: the target number turns up at least every 4 deals
                collect: goal && goal.type === 'collect' ? { number: goal.number, every: 4 } : null
            });
            orbDealerKey = activeAdventureLevel;
        }
        return numberOrb(orbDealer.next({ exposed: getExposedValues() }));
    }

    function numberOrb(val) {
        return { type: 'number', value: val, label: val > 0 ? `+${val}` : `${val}` };
    }

    // Signed values of the number orb on top of each column (what a dealt orb could merge with)
    function getExposedValues() {
        const out = [];
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS; r++) {
                const t = grid[r][c];
                if (!t) continue;
                if (t.type === 'number') out.push(t.value);
                break;
            }
        }
        return out;
    }

    // Number magnitudes for Dark Matter shatters and rising rows: follow the level's tide
    // (Adventure) or Classic's tide; small numbers elsewhere
    function currentTide() {
        const pool = gameMode === 'adventure' && activeAdventureLevel && activeAdventureLevel.rules && activeAdventureLevel.rules.pool;
        return pool ? (pool.tide || 0) : (gameMode === 'classic' && !isTutorial ? classicTide : 0);
    }

    function randomBoardMagnitude(maxBase) {
        return (Math.floor(Math.random() * maxBase) + 1) * OrbBag.tideScale(currentTide());
    }

    function classicTideStep(table) {
        return table[Math.min(classicHeat, table.length - 1)];
    }

    function classicHas(id) {
        return gameMode === 'classic' && !isTutorial && !firstPlay && classicHeat >= CLASSIC_ELEMENTS[id];
    }

    // Classic: Risers climb every move and a new one pushes up every few moves
    async function runClassicElementEffects(state) {
        if (countRisers() > 0 && climbRisers()) {
            await delay(200);
            await settleBoard(state);
            for (let c = 0; c < COLS; c++) {
                if (grid[0][c] && grid[0][c].riser) return; // checkGameOver ends the run
            }
            ensureRiserOpposites();
        }
        if (!classicHas('risers')) return;
        riserClock++;
        if (riserClock < CLASSIC_RISER_EVERY) return;
        riserClock = 0;
        if (countRisers() < (classicHeat >= 5 ? 2 : 1) && spawnRiser(true)) {
            queueJit('risers');
            await delay(200);
            await settleBoard(state);
        }
    }

    // Classic: dress a new rising row with the elements unlocked so far
    function decorateClassicRow(row) {
        const pick = (pred) => {
            const cols = row.map((t, c) => (t && pred(t) ? c : -1)).filter((c) => c >= 0);
            return cols.length ? cols[Math.floor(Math.random() * cols.length)] : -1;
        };
        const isDM = (t) => t.type === 'dark_matter' && !t.dense;
        const isPlain = (t) => t.type === 'number' && !t.web && !t.link;
        if (classicHas('static_blocks') && Math.random() < 0.25) {
            let walls = 0;
            forEachTile((t) => { if (t.type === 'static') walls++; });
            const c = walls < CLASSIC_STATIC_MAX ? pick(isDM) : -1;
            if (c >= 0) {
                row[c] = createTile(0, 'static');
                row[c].wallLife = CLASSIC_WALL_LIFE;
                queueJit('static_blocks');
            }
        }
        if (classicHas('dense_cores') && Math.random() < 0.5) {
            const c = pick(isDM);
            if (c >= 0) {
                row[c].hp = 4;
                row[c].dense = true;
                queueJit('dense_cores');
            }
        }
        if (classicHas('webbed_orbs')) {
            for (let i = 0; i < 2; i++) {
                const c = Math.random() < 0.35 ? pick(isPlain) : -1;
                if (c < 0) continue;
                row[c].web = true;
                queueJit('webbed_orbs');
            }
        }
        if (classicHas('entangled_pairs') && Math.random() < 0.5) {
            const a = pick(isPlain);
            if (a >= 0) {
                row[a].link = -1; // placeholder so the twin pick skips it
                const b = pick(isPlain);
                if (b >= 0) {
                    let link = 0;
                    forEachTile((t) => { if (t.link) link = Math.max(link, t.link); });
                    row[a].link = row[b].link = link + 1;
                    queueJit('entangled_pairs');
                } else {
                    delete row[a].link;
                }
            }
        }
    }

    // Classic walls ride rising rows up, so each crumbles after a few rows instead of
    // walking into the red line
    function ageClassicWalls() {
        forEachTile((t, r, c) => {
            if (t.type !== 'static' || !t.wallLife) return;
            t.wallLife--;
            if (t.wallLife > 0) return;
            grid[r][c] = null;
            const x = boardOffsetX + c * cellW + cellW / 2;
            const y = boardOffsetY + r * cellH + cellH / 2;
            createSparks(x, y, '#9aa4c4', 14);
            addFloatingText('WALL CRUMBLES', x, y - cellH * 0.3, '#9aa4c4', 0.95);
            sfx.playCrack();
        });
    }

    function classicScoreMult() {
        return gameMode === 'classic' && !isTutorial && !firstPlay ? 1 + CLASSIC_HEAT_SCORE_STEP * classicHeat : 1;
    }

    function classicRisePeriod() {
        return gameMode === 'classic' && !isTutorial ? classicTideStep(CLASSIC_RISE_EVERY) : MOVES_PER_RISE;
    }

    // Classic Number Tide: the pool doubles every CLASSIC_TIDE_EVERY drops
    // A rise that lands during a Surge waits until the Surge ends (GDD §4.1)
    function tickClassicTide() {
        classicDrops++;
        if (classicDrops % CLASSIC_TIDE_EVERY === 0) tidePending = true;
        if (!tidePending || classicSurge) return;
        tidePending = false;
        classicHeat++;
        const multText = `SCORE ×${classicScoreMult().toFixed(2).replace(/\.?0+$/, '')}`;
        if (classicTide < CLASSIC_TIDE_MAX) {
            classicTide++;
            const vals = OrbBag.tideValues(classicTide);
            addFloatingText(`NUMBER TIDE ↑ ±${vals[0]}–±${vals[vals.length - 1]}`, canvas.width / (2 * dpr), boardOffsetY + cellH * 2, '#00f2fe', 1.3);
            addFloatingText(multText, canvas.width / (2 * dpr), boardOffsetY + cellH * 2.8, '#f9d423', 1.1);
        } else {
            addFloatingText(`HEAT ${classicHeat} · ${multText}`, canvas.width / (2 * dpr), boardOffsetY + cellH * 2, '#ff6b3d', 1.3);
        }
        sfx.playSpecial();
    }

    // Orb Generator
    function generateOrb() {
        // Dynamic spawn pool mutators from procedural node rules
        const poolType = (gameMode === 'adventure' && activeAdventureLevel && activeAdventureLevel.rules && activeAdventureLevel.rules.spawnPoolType) || 'standard';
        // Adventure nodes deal from the level's own pool (levels.js)
        const levelPool = gameMode === 'adventure' && activeAdventureLevel && activeAdventureLevel.rules && activeAdventureLevel.rules.pool;
        if (levelPool) return generateLevelPoolOrb(levelPool);

        let specialChance = poolType === 'wildcards' ? 0.25 : (poolType === 'singles' ? 0.05 : 0.12);

        if (Math.random() < specialChance) {
            if (!isTutorial) queueJit('power_ups');
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
        } else if (gameMode === 'classic' && !isTutorial && typeof OrbBag !== 'undefined') {
            // Classic: bag randomizer over the current Number Tide, leaning toward pairs less as it climbs
            const due = takeDueDeal();
            if (due) return due;
            const key = `classic:${classicTide}:${classicHeat}`;
            if (orbDealerKey !== key) {
                orbDealer = OrbBag.createDealer({ values: OrbBag.tideValues(classicTide), pairBias: classicTideStep(CLASSIC_PAIR_BIAS) });
                orbDealerKey = key;
            }
            return numberOrb(orbDealer.next({ exposed: getExposedValues() }));
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
    // opts (main gameplay): startY = where the released orb is, dragSource = tray slot / hold it came from.
    // Returns true when the orb was launched.
    function dropActiveOrb(opts = {}) {
        if (isProcessing || isGameOver || activeProjectile || !currentOrb) return false;
        if (isTutorial) {
            if (tutBusy || isSwapModeActive) return;
            hideTutHand();
        }

        sfx.init();

        if (sealedCols.includes(aimCol)) {
            triggerDenyShake();
            sfx.playWarning();
            addFloatingText('🔒 SEALED · CLEAR A TILE INSIDE', boardOffsetX + aimCol * cellW + cellW / 2, boardOffsetY + cellH * 1.5, '#7fb0ff', 1.0);
            return false;
        }

        dropsSinceSwapCharge++;
        if (dropsSinceSwapCharge >= 8) {
            dropsSinceSwapCharge = 0;
            if (swapTokens < maxSwapTokens) {
                addSwapToken(1);
            }
        }

        const col = aimCol;

        // Find landing row in this column (on top of the stack; Risers can float)
        const landingRow = columnLandingRow(col);

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
            triggerDenyShake();
            sfx.playWarning();
            return false;
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
            // A dragged orb falls from where it was released (never from below its landing cell)
            y: opts.startY != null ? Math.min(opts.startY, targetY) : cellH * 0.55,
            targetY: targetY,
            vy: 8,
            landingRow: landingRow,
            impactRow: isImpact ? topOccupiedRow : landingRow,
            isImpact: isImpact
        };

        sfx.playDrop();
        triggerHaptic('drop');
        return true;
    }

    function swapHold() {
        if ((isTutorial && (!tutToolAllowed('hold') || tutBusy)) || !canHold || isProcessing || isGameOver) return;
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
        retriggerClass(btnTouchHold, 'hold-pop');
        if (isTutorial) { hideTutHand(); tutEvaluate('hold'); }
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

            // Advance queue (main gameplay already refilled its tray slot when the orb was released)
            if (MAIN_GAMEPLAY && !isTutorial) {
                currentOrb = null;
                canHold = true;
            } else if (!isTutorial) {
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
            triggerScreenFlash(0.55, '#bc13fe', { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + cellH * 2.5 });

            shockwaves.push({ 
                x: boardOffsetX + col * cellW + cellW / 2, 
                y: boardOffsetY + (ROWS / 2) * cellH, 
                radius: 15, 
                maxRadius: cellW * 4.8, 
                alpha: 1, 
                color: '#bc13fe' 
            });

            // Annihilate all tiles in this column
            const crushed = [];
            hitNullCoreArea(0, ROWS - 1, col, col, 3, 1, { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + cellH * 2.5 });
            for (let r = 0; r < ROWS; r++) {
                if (grid[r][col] && !isFixedTile(grid[r][col])) {
                    const cx = boardOffsetX + col * cellW + cellW / 2;
                    const cy = boardOffsetY + r * cellH + cellH / 2;
                    createSparks(cx, cy, '#bc13fe', 12);
                    createSparks(cx, cy, '#ffd700', 8);
                    crushed.push(grid[r][col]);
                    grid[r][col] = null;
                }
            }
            noteTilesRemoved(crushed, { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + cellH * 2.5 });

            // Damage neighboring Dark Matter columns
            for (let r = 0; r < ROWS; r++) {
                damageDarkMatterTile(r, col - 1, 1);
                damageDarkMatterTile(r, col + 1, 1);
            }

            addFloatingText('⚫ GRAVITATIONAL CRUSH!', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + cellH * 2.5, '#ffd700', 1.4);
            addScore(100, { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + cellH * 2.5 });
        } else if (sub === 'supernova_core') {
            // Supernova Core: Detonates Tier 4 Supernova Crater at target area
            sfx.playAnnihilate(combo, 4);
            triggerScreenShake(22);
            triggerScreenFlash(0.65, '#ffd700', { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + Math.max(0, Math.min(ROWS - 1, row >= 0 ? row : ROWS - 1)) * cellH });

            const epicR = Math.max(0, Math.min(ROWS - 1, row >= 0 ? row : ROWS - 1));
            damageSupernovaArea(epicR, col, epicR, col);
            hitNullCoreArea(epicR - 1, epicR + 1, col - 1, col + 1, 3, 1, { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + epicR * cellH });
            addFloatingText('🌟 SUPERNOVA CORE!', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + epicR * cellH, '#ffd700', 1.45);
            addScore(120, { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + epicR * cellH });
        } else if (sub === 'antimatter_nuke') {
            // Antimatter Nuke: Heavy 3x3 blast
            sfx.playAnnihilate(combo, 3);
            triggerScreenShake(18);
            const epicR = Math.max(0, Math.min(ROWS - 1, row >= 0 ? row : ROWS - 1));
            damageSupernovaArea(epicR, col, epicR, col);
            hitNullCoreArea(epicR - 1, epicR + 1, col - 1, col + 1, 3, 1, { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + epicR * cellH });
            addFloatingText('💥 ANTIMATTER NUKE!', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + epicR * cellH, '#ff4e50', 1.35);
            addScore(90, { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + epicR * cellH });
        } else if (sub === 'zero') {
            // Singularity Bomb: clears 3x3 radius
            sfx.playAnnihilate(3);
            triggerScreenShake(12);
            const blasted = [];
            hitNullCoreArea(row - 1, row + 1, col - 1, col + 1, 1, 1, { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + row * cellH + cellH / 2 });
            for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
                    if (grid[r][c] && !isFixedTile(grid[r][c])) {
                        createSparks(boardOffsetX + c * cellW + cellW / 2, boardOffsetY + r * cellH + cellH / 2, '#c471ed', 12);
                        blasted.push(grid[r][c]);
                        grid[r][c] = null;
                    }
                }
            }
            noteTilesRemoved(blasted, { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + row * cellH + cellH / 2 });
            addFloatingText('0 SINGULARITY!', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + row * cellH, '#c471ed');
            addScore(40, { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + row * cellH });
        } else if (targetTile && !isFixedTile(targetTile)) {
            sfx.playSpecial();
            if (sub === 'invert') {
                targetTile.value = -targetTile.value;
                targetTile.flash = 1;
                addFloatingText('INVERTED!', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + row * cellH, '#c471ed');

                if (isTutorial) tutRecordFlip(-targetTile.value);
            } else if (sub === 'div2') {
                if (Math.abs(targetTile.value) > 1) {
                    targetTile.value = Math.sign(targetTile.value) * Math.floor(Math.abs(targetTile.value) / 2);
                }
                targetTile.flash = 1;
                addFloatingText('DIVIDE ÷2', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + row * cellH, '#00f2fe');
            } else if (sub === 'mul2') {
                targetTile.value = targetTile.value * 2;
                targetTile.flash = 1;
                noteOrbMade(Math.abs(targetTile.value), { x: boardOffsetX + col * cellW + cellW / 2, y: boardOffsetY + row * cellH + cellH / 2 });
                addFloatingText('AMPLIFY ×2', boardOffsetX + col * cellW + cellW / 2, boardOffsetY + row * cellH, '#f9d423');
            }
        }
    }

    // Cascade Pipeline: Gravity -> Adjacency -> Gravity until stable
    // Gravity -> matches until the board is stable. `state` carries the chain across calls
    // so Riser climbs and spawns keep the combo going.
    // Long cascades speed up: each step runs at 0.88x the pace of the one before, down to 0.6x,
    // then the chain holds a beat on its last blast before the turn ends
    const CASCADE_PACE_STEP = 0.88;
    const CASCADE_PACE_MIN = 0.6;
    const CASCADE_FINAL_HOLD = 200; // ms, for chains of 2+ steps
    function cascadePace(chainStep) {
        return Math.max(CASCADE_PACE_MIN, Math.pow(CASCADE_PACE_STEP, chainStep || 0));
    }

    async function settleBoard(state) {
        const maxChainSteps = 40;
        while (state.chainStep < maxChainSteps) {
            const pace = cascadePace(state.chainStep);
            // 1. Apply Gravity with smooth downward slide
            const fell = applyGravity();
            if (fell) {
                await delay(160 * pace);
            }
            checkStarCatches();

            // 2. Scan Adjacency Matches with animated merges and collapses
            const matchFound = await scanAndResolveMatches(state.chainStep);
            if (matchFound) {
                state.cascadeOccurred = true;
                state.chainStep++;
                combo++;
                if (combo > maxCombo) maxCombo = combo;
                if (isTutorial && tutTurn) tutTurn.chain = Math.max(tutTurn.chain, state.chainStep);
                if (combo >= 2) classicEvent('combo', combo);
                updateHUD();
                await delay(120 * pace);
                continue; // Re-check gravity and subsequent cascades
            }

            // If no fell and no matches, board is in equilibrium!
            if (state.chainStep >= 2) await delay(CASCADE_FINAL_HOLD);
            break;
        }
    }

    async function resolveBoardCascades(isSwap = false) {
        try {
            const state = { chainStep: 0, cascadeOccurred: false };
            sfx.resetCascade();

            // Initial settle pause so player clearly sees the landed orb / swapped tile
            await delay(120);
            await settleBoard(state);
            const cascadeOccurred = state.cascadeOccurred;

            // End of player turn actions:
            if (!cascadeOccurred) {
                combo = 1;
                updateHUD();
            }

            if (!isSwap && isTutorial && tutRisePending) {
                tutRisePending = false;
                if (screenGame) screenGame.classList.remove('tut-rise');
                await pushTutorialRiseRow();
            } else if (!isSwap && !firstPlay) {
                if (gameMode === 'classic') {
                    if (!isTutorial) {
                        tickSurge();
                        tickClassicTide();
                        await runClassicElementEffects(state);
                    }
                    let rose = false;
                    if (!isTutorial && isBoardEmpty()) {
                        await celebrateBoardClear(); // resets the rise countdown instead of a rise
                    } else {
                        movesUntilRise--;
                        if (movesUntilRise <= 0) {
                            movesUntilRise = classicRisePeriod();
                            await pushRisingRow();
                            rose = true;
                        }
                    }
                    if (!isTutorial && bountyLadder && classicDrops % ClassicRun.SURGE_EVERY === 0) {
                        await startSurge(rose);
                    }
                } else if (gameMode === 'adventure' && activeAdventureLevel) {
                    // Board clear on an Adventure node (not Challenges): the rise countdown resets instead of ticking
                    const cleared = !!activeAdventureLevel.sectorNum && isBoardEmpty();
                    if (cleared) await celebrateBoardClear();
                    await runAdventureTurnEffects(state, { skipRiseTick: cleared });
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
            if (gameMode === 'adventure') updateSealedCols();
            checkGameOver();
            isProcessing = false;
            if (guide && guide.busy) endGuide();
            if (!isGameOver) {
                flushJit();
                maybeShowToolHint();
            }
            if (pendingOverdriveActivation && !isGameOver) {
                pendingOverdriveActivation = false;
                activateOverdrive();
            }
            updateHUD();

            if (isTutorial) tutEvaluate(isSwap ? 'swap' : 'drop');
            if (firstPlay) fpOnTurnEnd();
        }
    }

    function applyGravity() {
        let moved = false;
        for (let c = 0; c < COLS; c++) {
            for (let r = ROWS - 2; r >= 0; r--) {
                if (grid[r][c] && !grid[r + 1][c] && !isAnchoredTile(grid[r][c])) {
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

    // Pair animations run in two phases so players can see which orbs react:
    // a lock-on (both orbs pulse with a glowing outline and tether) then the move.
    const MERGE_ANIM_DURATION = 0.45;
    const COLLAPSE_ANIM_DURATION = 0.5;
    const PAIR_LOCK_PHASE = 0.35;

    function easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    // Splits progress into the lock-on amount (0→1) and the eased move amount (0→1)
    function pairPhases(t) {
        const lock = Math.min(1, t / PAIR_LOCK_PHASE);
        const move = t <= PAIR_LOCK_PHASE ? 0 : (t - PAIR_LOCK_PHASE) / (1 - PAIR_LOCK_PHASE);
        return { lock, move, ease: easeInOutCubic(move) };
    }

    // Glowing rounded outline drawn around an orb during the lock-on phase
    function drawPairLockRing(x, y, size, color, alpha) {
        if (alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.roundRect(x - size / 2, y - size / 2, size, size, 14);
        ctx.stroke();
        ctx.restore();
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
                duration: MERGE_ANIM_DURATION * cascadePace(chainStep),
                elapsed: 0,
                progress: 0,
                onComplete: () => {
                    // Place new fused tile at (rB, cB) with squash/stretch pop & white flash
                    grid[rB][cB] = createTile(fusedVal);
                    // A merged Riser keeps climbing (+3R and +3 make a +6 Riser)
                    if (tileA.riser || tileB.riser) grid[rB][cB].riser = true;
                    passEntangledLink(tileA, tileB, grid[rB][cB]);
                    grid[rB][cB].flash = 1;
                    grid[rB][cB].scaleX = 1.45;
                    grid[rB][cB].scaleY = 1.45;

                    sfx.playMerge();
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
                    addScore(5 * (chainStep + 1), { x: xB, y: yB });
                    addOverdriveCharge(2);
                    classicEvent('merge', 1);

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
                duration: COLLAPSE_ANIM_DURATION * cascadePace(chainStep),
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
                        classicEvent('zero_blast', 1);
                        checkAdventureObjective('annihilations', 1, cellCenterBetween(r, c, r, c + 1));
                        noteTilesRemoved([tileA, tileB], cellCenterBetween(r, c, r, c + 1));
                        const magnitude = Math.abs(tileA.value);

                        if (isTutorial) tutRecordBlast(magnitude);

                        await playZeroPointCollapseAnim(r, c, r, c + 1, tileA, tileB, magnitude, chainStep);
                        return true;
                    }
                }

                // Check Down neighbor
                if (r + 1 < ROWS) {
                    const tileB = grid[r + 1][c];
                    if (tileB && tileB.type === 'number' && tileA.value + tileB.value === 0) {
                        totalZeroPoints++;
                        classicEvent('zero_blast', 1);
                        checkAdventureObjective('annihilations', 1, cellCenterBetween(r, c, r + 1, c));
                        noteTilesRemoved([tileA, tileB], cellCenterBetween(r, c, r + 1, c));
                        const magnitude = Math.abs(tileA.value);

                        if (isTutorial) tutRecordBlast(magnitude);

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
                        checkAdventureObjective('synthesis_tier', Math.abs(fusedVal), cellCenterBetween(r, c, r, c + 1));
                        noteOrbMade(Math.abs(fusedVal), cellCenterBetween(r, c, r, c + 1));

                        if (isTutorial) tutRecordMerge(Math.abs(fusedVal));

                        await playSynthesisMergeAnim(r, c, r, c + 1, tileA, tileB, fusedVal, chainStep);
                        return true;
                    }
                }

                // Check Down neighbor
                if (r + 1 < ROWS) {
                    const tileB = grid[r + 1][c];
                    if (tileB && tileB.type === 'number' && tileA.value === tileB.value) {
                        const fusedVal = tileA.value * 2;
                        checkAdventureObjective('synthesis_tier', Math.abs(fusedVal), cellCenterBetween(r, c, r + 1, c));
                        noteOrbMade(Math.abs(fusedVal), cellCenterBetween(r, c, r + 1, c));

                        if (isTutorial) tutRecordMerge(Math.abs(fusedVal));

                        await playSynthesisMergeAnim(r, c, r + 1, c, tileA, tileB, fusedVal, chainStep);
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // Blast tiers follow the tide: the magnitude is measured in units of the tide's smallest
    // orb, so a ±64 blast at Tide 4 hits like a ±4 at Tide 0 (GDD §2.3)
    function getTier(magnitude) {
        magnitude /= OrbBag.tideScale(currentTide());
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
        triggerHaptic(BLAST_HAPTICS[tier] || 'pop');

        let bannerText = 'ZERO POINT!';
        let bannerColor = '#00f2fe';
        let bannerScale = 1.1;

        if (tier === 1) {
            // Tier 1: Micro Detonation (Magnitude 1)
            triggerScreenShake(6 + Math.min(combo * 2, 8), { x, y });
            shockwaves.push({ x: x, y: y, radius: 10, maxRadius: cellW * 2.0, alpha: 1, color: '#fff' });
            createSparks(x, y, '#00f2fe', 14);
            createSparks(x, y, '#ff4e50', 14);
            damageAdjacentDarkMatter(r, c);
            damageAdjacentDarkMatter(r2, c2);
            bannerText = 'MICRO POP!';
            bannerColor = '#00f2fe';
        } else if (tier === 2) {
            // Tier 2: Pulse Detonation (Magnitude 2-3)
            triggerScreenShake(10 + Math.min(combo * 2, 10), { x, y });
            shockwaves.push({ x: x, y: y, radius: 12, maxRadius: cellW * 3.0, alpha: 1, color: '#00f2fe' });
            createSparks(x, y, '#00f2fe', 22);
            createSparks(x, y, '#ff4e50', 22);
            damageAdjacentDarkMatter(r, c);
            damageAdjacentDarkMatter(r2, c2);
            bannerText = '⚡ SHOCKWAVE!';
            bannerColor = '#00f2fe';
            bannerScale = 1.25;
        } else if (tier === 3) {
            // Tier 3: Cross Laser Blast (Magnitude 4-7)
            triggerScreenShake(16, { x, y });
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
            triggerScreenShake(24, { x, y });
            triggerScreenFlash(0.65, '#ffd700', { x, y });

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
            triggerScreenShake(32, { x, y });
            triggerScreenFlash(0.85, '#ffffff', { x, y });

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

        triggerHitStop(HIT_STOP_MS[tier] || 0);
        if (tier >= 3) joltStarfield(x, y, tier);

        damageNullCoreForBlast(r, c, r2, c2, tier, { x, y });

        // Equation on every blast; tier names only for the big ones; the cascade gets one counter
        addFloatingText(equationText, x, y - 14, '#ffffff', 1.05);
        if (tier >= 3) addFloatingText(bannerText, x, y + 20, bannerColor, bannerScale);
        if (combo > 1) bumpComboCounter(combo, x, y);

        // Tier-scaled score bonus (Base 10 for Tier 1)
        // Tiers follow the tide, so score is scaled back up: bigger numbers, bigger points
        const baseScore = 10 * Math.pow(2, tier - 1) * OrbBag.tideScale(currentTide());
        addScore(baseScore * combo * (chainStep + 1), { x, y });

        // Balanced Overdrive charge: Tier 1 (+2%), Tier 2 (+4%), Tier 3 (+7%), Tier 4 (+12%), Tier 5 (+18%)
        const tierChargeTable = [0, 2, 4, 7, 12, 18];
        const baseCharge = tierChargeTable[tier] || 2;
        const chargeBonus = Math.round(baseCharge * (1 + (combo - 1) * 0.25));
        addOverdriveCharge(chargeBonus);

        // Tactical Bounty checks & Supernova Token Bonus
        if (tier >= 3) {
            classicEvent('laser', 1);
            checkAdventureObjective('trigger_laser', magnitude, cellCenterBetween(r, c, r2, c2));
        }
        if (tier >= 4) {
            classicEvent('supernova', 1);
            if (swapTokens < maxSwapTokens) {
                addSwapToken(1);
            }
        }
    }

    function damageDarkMatterTile(r, c, dmg = 1) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
        const target = grid[r][c];
        if (target && target.web) { snapWeb(r, c, target); return; }
        if (target && target.type === 'dark_matter') {
            target.hp -= dmg;
            sfx.playCrack();
            classicEvent('dark_matter', dmg);
            const nx = boardOffsetX + c * cellW + cellW / 2;
            const ny = boardOffsetY + r * cellH + cellH / 2;
            createSparks(nx, ny, '#888', 8);

            if (target.hp <= 0) {
                // Shattered into a fresh random number!
                const val = (Math.random() < 0.5 ? 1 : -1) * randomBoardMagnitude(4);
                grid[r][c] = createTile(val);
                addFloatingText('SHATTERED!', nx, ny, '#fff');
                addScore(classicSurge && classicSurge.id === 'dark_storm' ? 30 : 15, { x: nx, y: ny });
                checkAdventureObjective('clear_dark_matter', 1, { x: nx, y: ny });
                classicEvent('dm_shatter', 1);
                noteTilesRemoved([target], { x: nx, y: ny });
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
        const vaporized = [];

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
                        vaporized.push(tile);
                        grid[r][c] = null;
                    } else if (tile.web) {
                        snapWeb(r, c, tile);
                    }
                }
            }
        }
        noteTilesRemoved(vaporized, cellCenterBetween(r1, c1, r2, c2));
    }

    function damageHyperspace() {
        const swept = [];
        for (let r = ROWS - 3; r < ROWS; r++) {
            if (r >= 0) {
                for (let c = 0; c < COLS; c++) {
                    const tile = grid[r][c];
                    if (tile && !isFixedTile(tile)) {
                        const tx = boardOffsetX + c * cellW + cellW / 2;
                        const ty = boardOffsetY + r * cellH + cellH / 2;
                        createSparks(tx, ty, '#c471ed', 12);
                        swept.push(tile);
                        grid[r][c] = null;
                    }
                }
            }
        }
        noteTilesRemoved(swept, { x: boardOffsetX + (COLS * cellW) / 2, y: boardOffsetY + (ROWS - 2) * cellH });
    }

    async function pushRisingRow() {
        if (gameMode === 'classic' && !isTutorial) queueJit('rising_rows', 'dark_matter');
        sfx.playWarning();
        triggerScreenShake(5);
        const classicRow = gameMode === 'classic' && !isTutorial;
        if (classicRow) ageClassicWalls();

        // Shift all rows up by 1
        for (let r = 0; r < ROWS - 1; r++) {
            grid[r] = grid[r + 1];
        }

        // Create new bottom row of Dark Matter blocks with a few number gaps (fewer as Classic's tide climbs)
        const dmChance = gameMode === 'classic' && !isTutorial ? classicTideStep(CLASSIC_DM_CHANCE) : 0.6;
        const newRow = [];
        for (let c = 0; c < COLS; c++) {
            if (Math.random() < dmChance) {
                newRow.push(createTile(0, 'dark_matter'));
            } else {
                const val = (Math.random() < 0.5 ? 1 : -1) * randomBoardMagnitude(3);
                newRow.push(createTile(val));
            }
        }
        if (classicRow) decorateClassicRow(newRow);
        grid[ROWS - 1] = newRow;

        addFloatingText('REACTOR PRESSURE RISE!', canvas.width / (2 * dpr), boardOffsetY + cellH * 3, 'var(--danger)', 1.3);
        await delay(200);
    }

    // Lesson 4: a fixed, all-Dark-Matter rise so the outcome is the same every time
    async function pushTutorialRiseRow() {
        sfx.playWarning();
        triggerScreenShake(6);
        for (let r = 0; r < ROWS - 1; r++) grid[r] = grid[r + 1];
        grid[ROWS - 1] = Array(COLS).fill(null).map(() => createTile(0, 'dark_matter'));
        addFloatingText('DARK MATTER RISES!', canvas.width / (2 * dpr), boardOffsetY + cellH * 3, 'var(--danger)', 1.3);
        await delay(450);
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

    // Short label, intro hint and on-board callout text per objective type
    const OBJECTIVE_META = {
        annihilations: { short: (o) => `Make ${o.target} Zero Blasts`, hint: 'Touch opposites like [pos:+3] [neg:−3] to cancel them', event: 'ZERO BLAST' },
        synthesis_tier: { short: (o) => `Merge up to +${o.target}`, hint: 'Merge matching numbers like [pos:+2] [pos:+2] to double them', event: 'MERGED' },
        clear_dark_matter: { short: () => 'Break Dark Matter cores', hint: 'Blast next to a [dm:◈] core twice to break it', event: 'CORE BROKEN' },
        trigger_laser: { short: () => 'Fire a Cross Laser', hint: 'Cancel a [pos:+4] [neg:−4] pair to fire across the row and column', event: 'CROSS LASER!' },
        activate_frenzy: { short: () => 'Fill Overdrive', hint: 'Blast to fill the [od:ϟ] Overdrive bar to 100%', event: 'FRENZY!' },
        // Adventure goals (one per level; the counter only counts down)
        zero_out: { short: (o) => `Clear ${o.target} orbs`, strip: () => 'Clear orbs', hint: 'Cancel opposites like [pos:+3] [neg:−3] to clear them', event: 'CLEARED' },
        collect: { short: (o) => `Clear ${o.target} orbs showing ${o.number}`, strip: (o) => `Clear ${o.number}s`, hint: (o) => `[pos:+${o.number}] and [neg:−${o.number}] both count`, event: 'CLEARED' },
        break_cores: { short: (o) => `Break ${o.target} Dark Matter cores`, strip: () => 'Break cores', hint: 'Blast next to a [dm:◈] core twice to break it', event: 'CORE BROKEN' },
        catch_stars: { short: (o) => `Catch ${o.target} stars`, strip: () => 'Catch stars', hint: 'Land an orb on a ★ cell to catch it. Stars stay put', event: 'STAR CAUGHT' },
        risers: { short: (o) => `Clear ${o.target} Risers`, strip: () => 'Clear Risers', hint: 'Risers climb every move. Cancel one with its opposite, like [pos:+3] [neg:−3]', event: 'RISER CLEARED' },
        survive: { short: (o) => `Survive ${o.target} moves`, strip: () => 'Survive', hint: 'Rows keep rising. Keep the stack below the red line', event: 'SURVIVED' },
        null_core: { short: (o) => `Break the big core (${o.target} HP)`, strip: () => 'Break the big core', hint: 'Blast next to the core. Cross Lasers and big blasts hit it for 3', event: 'CORE HIT' },
        big_orb: { short: (o) => `Merge up to ${o.size}`, strip: (o) => `Merge up to ${o.size}`, hint: () => 'Merge pairs like [pos:+2] [pos:+2] to double them', event: 'BIG ORB!' }
    };

    const GOAL_GLYPHS = {
        zero_out: () => '○',
        collect: (o) => String(o.number),
        break_cores: () => '◈',
        catch_stars: () => '★',
        risers: () => '▲',
        survive: () => '⏳',
        null_core: () => '◉',
        big_orb: (o) => String(o.size)
    };

    // Ring strip title and unit per goal: "Break 6 ◈" over "6 CORES LEFT".
    // A third `false` leaves the glyph out of the title when the title already says it
    const GOAL_RING = {
        zero_out: (o) => [`Clear ${o.target}`, 'ORBS'],
        collect: (o) => [`Clear ${o.number}s`, 'ORBS', false],
        break_cores: (o) => [`Break ${o.target}`, 'CORES'],
        catch_stars: (o) => [`Catch ${o.target}`, 'STARS'],
        risers: (o) => [`Clear ${o.target}`, 'RISERS'],
        survive: (o) => [`Survive ${o.target}`, 'MOVES'],
        null_core: () => ['Break the big core', 'HP'],
        big_orb: () => ['Merge up to', '']
    };

    // Objective strip look for Adventure goals: 'ring' (default) or the older 'bar'. Dev tools switch it
    const OBJ_STRIP_KEY = 'nullfall_objective_strip';
    function getObjStripStyle() {
        try { return localStorage.getItem(OBJ_STRIP_KEY) === 'bar' ? 'bar' : 'ring'; } catch (e) { return 'ring'; }
    }
    function setObjStripStyle(style) {
        try { localStorage.setItem(OBJ_STRIP_KEY, style); } catch (e) { /* storage blocked */ }
        updateAdventureObjectiveUI();
    }

    // The active level's goal (Adventure nodes) or objective (Challenges)
    function getLevelGoal(lvl) {
        return lvl ? (lvl.goal || lvl.objective || null) : null;
    }

    function isGoalLevel(lvl) {
        return !!(lvl && lvl.goal);
    }

    function getObjectiveGlyph(obj) {
        return (GOAL_GLYPHS[obj.type] || CHALLENGE_GLYPHS[obj.type] || (() => '★'))(obj);
    }

    // How much a batch of removed tiles moves the goal counter
    function goalCountForRemoved(goal, tiles) {
        if (!goal) return 0;
        if (goal.type === 'zero_out') return tiles.filter((t) => t && t.type === 'number').length;
        if (goal.type === 'collect') return tiles.filter((t) => t && t.type === 'number' && Math.abs(t.value) === goal.number).length;
        if (goal.type === 'break_cores') return tiles.filter((t) => t && t.type === 'dark_matter').length;
        if (goal.type === 'risers') return tiles.filter((t) => t && t.riser).length;
        return 0;
    }

    // Tiles that left the board by any cause except merging (blasts, specials, craters, vortex)
    function noteTilesRemoved(tiles, pos = null, seen = new Set()) {
        if (gameMode === 'classic' && !isTutorial && !firstPlay) {
            const special = tiles.filter((t) => t && (t.riser || t.dense || t.link) && !seen.has(t)).length;
            if (special) addScore(CLASSIC_ELEMENT_BONUS * special, pos);
        }
        if (gameMode === 'adventure' && isGoalLevel(activeAdventureLevel)) {
            const n = goalCountForRemoved(activeAdventureLevel.goal, tiles);
            if (n > 0) checkAdventureObjective('goal', n, pos);
        }
        popEntangledTwins(tiles, seen);
    }

    function getDropsLeft() {
        return Math.max(0, maxDrops - dropsUsed);
    }

    function forEachTile(fn) {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c]) fn(grid[r][c], r, c);
            }
        }
    }

    // Fixed in place and unbreakable: the Null Core and static blocks
    function isFixedTile(t) {
        return !!(t && (t.type === 'null_core' || t.type === 'static'));
    }

    // Risers, webbed orbs, the Null Core and static blocks ignore gravity
    function isAnchoredTile(t) {
        return !!(t && (t.riser || t.web || t.type === 'null_core' || t.type === 'static'));
    }

    // ---------- Sealed columns (GDD §5.2) ----------
    // A sealed column takes no drops. It opens for good once a tile in it is cleared, merged or
    // broken (one of the tiles tagged at the last check is gone), or when it has no tiles.
    // tools/sim/engine.js mirrors this.
    function tagSealedCols() {
        forEachTile((t, r, c) => {
            if (sealedCols.includes(c)) t.sealedIn = c;
            else delete t.sealedIn;
        });
        sealedCols.forEach((col) => { sealCounts[col] = countSealTags(col); });
    }

    function countSealTags(col) {
        let n = 0;
        forEachTile((t) => { if (t.sealedIn === col) n++; });
        return n;
    }

    function updateSealedCols() {
        if (!sealedCols.length) return;
        sealedCols = sealedCols.filter((col) => {
            const empty = grid.every((row) => !row[col]);
            if (!empty && countSealTags(col) >= (sealCounts[col] || 0)) return true;
            const x = boardOffsetX + col * cellW + cellW / 2;
            sealOpenings.push({ col, at: performance.now() });
            shockwaves.push({ x, y: boardOffsetY + cellH * 0.5, radius: 8, maxRadius: cellW * 2.2, alpha: 1, color: '#4f8cff' });
            createSparks(x, boardOffsetY + cellH * 0.5, '#7fb0ff', 16);
            addFloatingText('🔓 SEAL OPEN', x, boardOffsetY + cellH * 1.3, '#7fb0ff', 1.1);
            sfx.playSpecial();
            return false;
        });
        tagSealedCols();
    }

    // ---------- Webbed orbs and entangled pairs (GDD §5.2) ----------
    // The hits that crack Dark Matter snap a web; the orb is then a plain orb and falls
    function snapWeb(r, c, t) {
        t.web = false;
        t.flash = 0.6;
        const x = boardOffsetX + c * cellW + cellW / 2;
        const y = boardOffsetY + r * cellH + cellH / 2;
        createSparks(x, y, '#dfe6ff', 10);
        sfx.playCrack();
        addFloatingText('WEB SNAPPED', x, y - cellH * 0.3, '#dfe6ff', 0.9);
    }

    // A merge snaps a web (the fused orb is a fresh tile) and passes an entangled link on.
    // Twins that merge into each other lose the link; two different links keep A's.
    function passEntangledLink(a, b, fused) {
        if (a.link && b.link) {
            if (a.link === b.link) return;
            forEachTile((t) => { if (t !== b && t.link === b.link) delete t.link; });
        }
        const link = a.link || b.link;
        if (link) fused.link = link;
    }

    // A cleared entangled orb pops its twin at the same moment: a plain pop, no blast.
    // `seen` holds every tile already removed this way (a blast notes its pair before the
    // animation clears their cells, so they're still on the grid here).
    function popEntangledTwins(tiles, seen) {
        tiles.forEach((t) => seen.add(t));
        tiles.forEach((t) => {
            if (!t || !t.link) return;
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const u = grid[r][c];
                    if (!u || u.link !== t.link || seen.has(u)) continue;
                    grid[r][c] = null;
                    const x = boardOffsetX + c * cellW + cellW / 2;
                    const y = boardOffsetY + r * cellH + cellH / 2;
                    const color = linkColor(u.link);
                    createSparks(x, y, color, 16);
                    shockwaves.push({ x, y, radius: 6, maxRadius: cellW * 1.3, alpha: 1, color });
                    addFloatingText('ENTANGLED!', x, y - cellH * 0.3, color, 1.0);
                    sfx.playSpecial();
                    noteTilesRemoved([u], { x, y }, seen);
                    return;
                }
            }
        });
    }

    const LINK_COLORS = ['#7cffb2', '#ffb86b', '#ff7bea'];
    function linkColor(link) {
        return LINK_COLORS[(link - 1) % LINK_COLORS.length];
    }

    // Orbs land on top of the stack (Risers can float with empty cells under them)
    function columnLandingRow(col) {
        for (let r = 0; r < ROWS; r++) {
            if (grid[r][col]) return r - 1;
        }
        return ROWS - 1;
    }

    // Empty rows above the stack in the emptiest-filled column (red line excluded); Survive stars
    function minColumnHeadroom() {
        let min = ROWS - 1;
        for (let c = 0; c < COLS; c++) {
            let top = ROWS;
            for (let r = 0; r < ROWS; r++) { if (grid[r][c]) { top = r; break; } }
            min = Math.min(min, Math.max(0, top - 1));
        }
        return min;
    }

    // Value the star thresholds compare against: drops left, or headroom for Survive
    function getStarMeasure(stars) {
        return stars && stars.kind === 'headroom' ? minColumnHeadroom() : getDropsLeft();
    }

    function starGoalText(stars, need) {
        return stars && stars.kind === 'headroom'
            ? `End with ${need}+ empty rows in every column`
            : `Finish with ${need}+ moves left`;
    }

    function starUnit(stars, n) {
        return stars && stars.kind === 'headroom' ? `${n} row${n === 1 ? '' : 's'}` : String(n);
    }

    // Big Orb: any orb reaching the target size (merge or ×2) wins
    function noteOrbMade(magnitude, pos) {
        if (!isTutorial && !firstPlay) noteOrbRecord(magnitude, pos);
        classicEvent('orb', magnitude);
        const goal = gameMode === 'adventure' && activeAdventureLevel && activeAdventureLevel.goal;
        if (goal && goal.type === 'big_orb' && magnitude >= goal.size) checkAdventureObjective('goal', 1, pos);
    }

    // Catch the Stars: an orb resting on a star cell collects it
    function checkStarCatches() {
        if (!starCells.length) return;
        starCells.forEach((st) => {
            if (st.caught || !grid[st.r] || !grid[st.r][st.c]) return;
            st.caught = true;
            const x = boardOffsetX + st.c * cellW + cellW / 2;
            const y = boardOffsetY + st.r * cellH + cellH / 2;
            createSparks(x, y, '#f9d423', 18);
            shockwaves.push({ x, y, radius: 6, maxRadius: cellW * 1.6, alpha: 1, color: '#f9d423' });
            sfx.playSpecial();
            const goal = activeAdventureLevel && activeAdventureLevel.goal;
            if (goal && goal.type === 'catch_stars') checkAdventureObjective('goal', 1, { x, y });
        });
    }

    // ---------- Risers ----------
    function countRisers() {
        let n = 0;
        forEachTile((t) => { if (t.riser) n++; });
        return n;
    }

    // Deal this value's opposite within a few tray refills (GDD §5.5)
    function queueOpposite(value, due = 3) {
        const v = -value;
        const pending = pendingDeals.find((d) => d.value === v);
        if (pending) pending.due = Math.min(pending.due, due);
        else pendingDeals.push({ value: v, due });
    }

    // Once per Riser value (a merge changes it), make sure its opposite gets dealt,
    // sooner as the Riser nears the red line (row = rows left)
    function ensureRiserOpposites() {
        forEachTile((t, r) => {
            if (!t.riser) return;
            const due = Math.max(1, Math.min(3, r - 2));
            if (t.oppQueued !== t.value) {
                queueOpposite(t.value, due);
                t.oppQueued = t.value;
            } else {
                const pending = pendingDeals.find((d) => d.value === -t.value);
                if (pending) pending.due = Math.min(pending.due, due);
            }
        });
    }

    // Every Riser climbs one row: it swaps with the tile above or floats into the empty cell
    function climbRisers() {
        let moved = false;
        for (let r = 1; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const t = grid[r][c];
                if (!t || !t.riser) continue;
                const above = grid[r - 1][c];
                if (isFixedTile(above) || (above && above.web)) continue; // walls and webs stop it
                grid[r - 1][c] = t;
                grid[r][c] = above || null;
                t.animY = cellH;
                t.climbAt = performance.now(); // trail shows while it moves up
                if (above) above.animY = -cellH;
                moved = true;
            }
        }
        if (moved) sfx.playMove();
        return moved;
    }

    // A new Riser pushes up from the bottom of the emptiest column (never the core's columns)
    function spawnRiser(announce = true) {
        const pool = gameMode === 'classic' ? { values: OrbBag.tideValues(classicTide).slice(0, 3) }
            : (activeAdventureLevel && activeAdventureLevel.rules && activeAdventureLevel.rules.pool) || { values: [1, 2, 3] };
        const columns = [];
        for (let c = 0; c < COLS; c++) {
            let hasCore = false;
            let top = ROWS;
            for (let r = 0; r < ROWS; r++) {
                const t = grid[r][c];
                if (isFixedTile(t) || sealedCols.includes(c)) hasCore = true; // never push a core or wall up, never into a seal
                if (t && top === ROWS) top = r;
            }
            if (!hasCore) columns.push({ c, top });
        }
        if (!columns.length) return false;
        const best = Math.max(...columns.map((x) => x.top));
        const pick = columns.filter((x) => x.top === best);
        const c = pick[Math.floor(Math.random() * pick.length)].c;

        // Pick a value that won't react with its new neighbours straight away
        const below = grid[ROWS - 1][c];
        const sideL = c > 0 ? grid[ROWS - 1][c - 1] : null;
        const sideR = c < COLS - 1 ? grid[ROWS - 1][c + 1] : null;
        const touching = [below, sideL, sideR].filter((t) => t && t.type === 'number').map((t) => Math.abs(t.value));
        const values = (pool.values || [1, 2, 3]).filter((v) => !touching.includes(v));
        const mags = values.length ? values : (pool.values || [1, 2, 3]);
        const val = mags[Math.floor(Math.random() * mags.length)] * (Math.random() < 0.5 ? 1 : -1);

        for (let r = 0; r < ROWS - 1; r++) {
            grid[r][c] = grid[r + 1][c];
            if (grid[r][c]) grid[r][c].animY = cellH;
        }
        const riser = createTile(val);
        riser.riser = true;
        riser.animY = cellH;
        riser.climbAt = performance.now();
        riser.flash = 1;
        grid[ROWS - 1][c] = riser;
        ensureRiserOpposites();
        if (announce) {
            addFloatingText('▲ RISER!', boardOffsetX + c * cellW + cellW / 2, boardOffsetY + (ROWS - 1.5) * cellH, '#f9d423', 1.2);
            sfx.playWarning();
        }
        return true;
    }

    // Turn effects for Adventure nodes, after the board settles (not on swaps):
    // Risers climb, new Risers spawn, rows rise, Survive counts the drop
    async function runAdventureTurnEffects(state, opts = {}) {
        const lvl = activeAdventureLevel;
        const rules = lvl.rules || {};
        if (countRisers() > 0 && climbRisers()) {
            await delay(200);
            await settleBoard(state);
            for (let c = 0; c < COLS; c++) {
                if (grid[0][c] && grid[0][c].riser) return; // checkGameOver ends the run
            }
            ensureRiserOpposites();
        }
        if (rules.risers && rules.risers.every) {
            riserClock++;
            if (riserClock >= rules.risers.every) {
                riserClock = 0;
                if (countRisers() < (rules.risers.max || 1) && spawnRiser(true)) {
                    await delay(200);
                    await settleBoard(state);
                }
            }
        }
        if (rules.fluxRate > 0 && !opts.skipRiseTick) {
            movesUntilRise--;
            if (movesUntilRise <= 0) {
                movesUntilRise = rules.fluxRate;
                await pushRisingRow();
                checkStarCatches();
            }
        }
        if (lvl.goal && lvl.goal.type === 'survive' && dropsUsed > adventureProgress) {
            checkAdventureObjective('goal', dropsUsed - adventureProgress, false);
        }
    }

    // ---------- Null Core boss ----------
    function findNullCoreCells() {
        const cells = [];
        forEachTile((t, r, c) => { if (t.type === 'null_core') cells.push({ r, c, tile: t }); });
        return cells;
    }

    function damageNullCore(core, dmg, pos) {
        if (!core || core.hp <= 0 || dmg <= 0) return;
        const d = Math.min(dmg, core.hp);
        core.hp -= d;
        core.flash = 1;
        sfx.playCrack();
        triggerScreenShake(6 + d * 2);
        if (pos) addFloatingText(`-${d} HP`, pos.x, pos.y - 20, '#ff4e50', d >= 3 ? 1.35 : 1.1);
        const goal = activeAdventureLevel && activeAdventureLevel.goal;
        if (goal && goal.type === 'null_core') checkAdventureObjective('goal', d, pos);
        if (core.hp <= 0) {
            // Core collapses: its cells leave the board
            findNullCoreCells().forEach(({ r, c, tile }) => {
                if (tile.core !== core) return;
                createSparks(boardOffsetX + c * cellW + cellW / 2, boardOffsetY + r * cellH + cellH / 2, '#ff4e50', 24);
                grid[r][c] = null;
            });
            triggerScreenFlash(0.6, '#ff4e50', pos);
        }
    }

    // A blast touching the core hits for 1; a Cross Laser through it, a Supernova crater
    // over it, or Hyperspace hits for 3. One hit per blast however many core cells it touches.
    function damageNullCoreForBlast(r, c, r2, c2, tier, pos) {
        const cells = findNullCoreCells();
        if (!cells.length) return;
        const core = cells[0].tile.core;
        const adjacent = (cr, cc) => [[r, c], [r2, c2]].some(([br, bc]) => Math.abs(br - cr) + Math.abs(bc - cc) === 1);
        let dmg = 0;
        cells.forEach(({ r: cr, c: cc }) => {
            if (tier === 3 && (cr === r || cr === r2 || cc === c || cc === c2)) dmg = Math.max(dmg, 3);
            else if (tier === 4 && cr >= Math.min(r, r2) - 1 && cr <= Math.max(r, r2) + 1 && cc >= Math.min(c, c2) - 1 && cc <= Math.max(c, c2) + 1) dmg = Math.max(dmg, 3);
            else if (tier >= 5) dmg = Math.max(dmg, 3);
            else if (adjacent(cr, cc)) dmg = Math.max(dmg, 1);
        });
        damageNullCore(core, dmg, pos);
    }

    // Specials: `dmgIn` when the area covers a core cell, `dmgNear` when it only touches one
    function hitNullCoreArea(r1, r2, c1, c2, dmgIn, dmgNear, pos) {
        const cells = findNullCoreCells();
        if (!cells.length) return;
        let dmg = 0;
        cells.forEach(({ r, c }) => {
            if (r >= r1 && r <= r2 && c >= c1 && c <= c2) dmg = Math.max(dmg, dmgIn);
            else if ((r >= r1 - 1 && r <= r2 + 1 && c >= c1 && c <= c2) || (c >= c1 - 1 && c <= c2 + 1 && r >= r1 && r <= r2)) dmg = Math.max(dmg, dmgNear);
        });
        damageNullCore(cells[0].tile.core, dmg, pos);
    }

    // Board-space midpoint of two cells (canvas CSS pixels)
    function cellCenterBetween(r1, c1, r2, c2) {
        return {
            x: boardOffsetX + ((c1 + c2) / 2) * cellW + cellW / 2,
            y: boardOffsetY + ((r1 + r2) / 2) * cellH + cellH / 2
        };
    }

    function getObjectiveCounts(obj, progress = adventureProgress, met = adventureObjectiveMet) {
        if (GOAL_GLYPHS[obj.type]) {
            const cur = Math.min(progress, obj.target);
            const left = met ? 0 : Math.max(0, obj.target - cur);
            return { cur, tgt: obj.target, left, text: met ? 'DONE' : String(left) };
        }
        if (obj.type === 'synthesis_tier') {
            return { cur: met ? obj.target : progress, tgt: obj.target, text: met ? 'DONE' : `+${progress || 0}/+${obj.target}` };
        }
        if (obj.type === 'trigger_laser' || obj.type === 'activate_frenzy') {
            return { cur: met ? 1 : 0, tgt: 1, text: met ? 'DONE' : '0/1' };
        }
        const cur = Math.min(progress, obj.target);
        return { cur, tgt: obj.target, text: `${cur}/${obj.target}` };
    }

    function checkAdventureObjective(type, payload = 1, pos = null) {
        if (gameMode !== 'adventure' || !activeAdventureLevel || isGameOver) return;
        const obj = getLevelGoal(activeAdventureLevel);
        if (!obj) return;
        const prevProgress = adventureProgress;
        const prevMet = adventureObjectiveMet;

        if (isGoalLevel(activeAdventureLevel)) {
            // Goal counters only count down: progress only ever grows
            if (type !== 'goal' || adventureObjectiveMet) return;
            adventureProgress = Math.min(obj.target, adventureProgress + payload);
            if (adventureProgress >= obj.target) adventureObjectiveMet = true;
        } else if (obj.type === 'annihilations' && type === 'annihilations') {
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

        const advanced = adventureProgress > prevProgress || (adventureObjectiveMet && !prevMet);
        // Hold the strip at its old value until the flying badge lands
        if (advanced && !objDisplay) objDisplay = { progress: prevProgress, met: prevMet };
        const snap = { progress: adventureProgress, met: adventureObjectiveMet };
        const session = scoreFlySession;
        const flew = advanced && pos !== false && showObjectiveCallout(obj, pos, () => {
            if (session !== scoreFlySession) return;
            objFlyersInFlight = Math.max(0, objFlyersInFlight - 1);
            objDisplay = objFlyersInFlight > 0 ? snap : null;
            updateAdventureObjectiveUI(true);
        });
        if (flew) {
            objFlyersInFlight++;
        } else {
            if (objFlyersInFlight === 0) objDisplay = null;
            updateAdventureObjectiveUI(advanced);
        }
    }

    function updateAdventureObjectiveUI(bump = false) {
        if (!activeAdventureLevel || gameMode !== 'adventure') return;
        const obj = getLevelGoal(activeAdventureLevel);
        if (!obj) return;

        const meta = OBJECTIVE_META[obj.type];
        const goalLevel = isGoalLevel(activeAdventureLevel);
        const met = objDisplay ? objDisplay.met : adventureObjectiveMet;
        const { cur, tgt, text } = objDisplay ? getObjectiveCounts(obj, objDisplay.progress, met) : getObjectiveCounts(obj);
        const countable = (goalLevel && obj.type !== 'big_orb') || obj.type === 'annihilations' || obj.type === 'clear_dark_matter';
        const oneToGo = countable && !met && tgt - cur === 1;

        const glyphEl = document.getElementById('adv-obj-glyph');
        const togoEl = document.getElementById('adv-obj-togo');
        if (glyphEl) glyphEl.textContent = met ? '✓' : getObjectiveGlyph(obj);
        if (advObjDesc) advObjDesc.textContent = meta ? (goalLevel && meta.strip ? meta.strip(obj) : meta.short(obj)) : activeAdventureLevel.desc;
        if (advObjProgress) advObjProgress.textContent = text;
        if (togoEl) togoEl.hidden = !oneToGo;
        renderObjectiveRing(obj, cur, tgt, met, oneToGo);
        if (adventureObjectiveCard) {
            adventureObjectiveCard.classList.toggle('one-to-go', oneToGo);
            adventureObjectiveCard.classList.toggle('complete', met);
            if (bump) {
                adventureObjectiveCard.classList.remove('bump');
                void adventureObjectiveCard.offsetWidth;
                adventureObjectiveCard.classList.add('bump');
            }
        }

        lastCoreHighlight = SHOW_LAST_CORE_MARKER && (obj.type === 'clear_dark_matter' || (obj.type === 'break_cores' && tgt - cur === 1))
            && !adventureObjectiveMet && countRemainingDarkMatter() === 1;
    }

    // Ring style: dial with what's left, collapses to "cur/tgt" after the first hit
    function renderObjectiveRing(obj, cur, tgt, met, oneToGo) {
        const card = adventureObjectiveCard;
        const dial = document.getElementById('adv-ring-dial');
        const ringOn = !!(card && dial && isGoalLevel(activeAdventureLevel) && getObjStripStyle() === 'ring');
        if (!card) return;
        card.classList.toggle('ring-mode', ringOn);
        if (!ringOn) {
            card.classList.remove('collapsed');
            card.removeAttribute('aria-label');
            return;
        }
        const left = Math.max(0, tgt - cur);
        const collapsed = !met && cur > 0;
        const [title, unit, titleGlyph = true] = (GOAL_RING[obj.type] || (() => [OBJECTIVE_META[obj.type] ? OBJECTIVE_META[obj.type].short(obj) : '', '']))(obj);
        const glyph = getObjectiveGlyph(obj);
        card.classList.toggle('collapsed', collapsed);
        card.style.setProperty('--ring-p', `${met ? 100 : Math.round((cur / Math.max(1, tgt)) * 100)}%`);
        const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
        set('adv-ring-count', met ? 'DONE' : collapsed ? `${cur}/${tgt}` : String(left));
        set('adv-ring-badge', glyph);
        set('adv-ring-title', title);
        set('adv-ring-glyph', titleGlyph ? glyph : '');
        set('adv-ring-sub', met ? 'GOAL DONE!' : oneToGo ? '1 LEFT!' : obj.type === 'big_orb' ? 'BONUS GOAL' : `${left} ${unit} LEFT`);
        card.setAttribute('aria-label', met ? 'Goal done' : `${title} ${unit.toLowerCase()}, ${left} left`.replace(' ,', ','));
    }

    // Badge pops where the objective progressed ("◈ 3/4"), then flies into the
    // objective strip, which updates and bumps when it lands. Returns false when
    // it couldn't fly (strip hidden, reduced motion) so the caller updates at once.
    function showObjectiveCallout(obj, pos, onArrive) {
        const host = document.getElementById('canvas-container');
        const ringOn = adventureObjectiveCard && adventureObjectiveCard.classList.contains('ring-mode');
        const targetEl = ringOn ? document.getElementById('adv-ring-dial') : advObjProgress;
        const target = targetEl && targetEl.getBoundingClientRect();
        const reduce = prefersReducedMotion();
        if (!host || !target || !target.width || reduce || typeof document.body.animate !== 'function') return false;

        const { cur, tgt } = getObjectiveCounts(obj);
        const left = Math.max(0, tgt - cur);
        const point = pos || { x: boardOffsetX + (COLS * cellW) / 2, y: boardOffsetY + (ROWS * cellH) / 2 };
        const hr = host.getBoundingClientRect();
        const sx = hr.left + Math.min(Math.max(point.x, 50), host.clientWidth - 50);
        const sy = hr.top + Math.max(point.y, 40);
        const tx = target.left + target.width / 2;
        const ty = target.top + target.height / 2;

        const el = document.createElement('div');
        el.className = 'obj-callout' + (adventureObjectiveMet || left === 1 ? ' gold' : '');
        el.style.left = `${sx}px`;
        el.style.top = `${sy}px`;
        const badge = document.createElement('span');
        badge.className = 'badge';
        const g = document.createElement('span');
        g.className = 'g';
        g.textContent = adventureObjectiveMet ? '✓' : getObjectiveGlyph(obj);
        const n = document.createElement('span');
        n.className = 'n';
        n.textContent = GOAL_GLYPHS[obj.type] ? (adventureObjectiveMet ? '0' : String(left))
            : (obj.type === 'synthesis_tier' && !adventureObjectiveMet ? `+${cur}` : `${cur}/${tgt}`);
        badge.append(g, n);
        el.append(badge);
        document.body.appendChild(el);

        const dx = tx - sx;
        const dy = ty - sy;
        const anim = el.animate([
            { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
            { transform: 'translate(-50%, calc(-50% - 14px)) scale(1.1)', opacity: 1, offset: 0.22 },
            { transform: 'translate(-50%, calc(-50% - 16px)) scale(1)', opacity: 1, offset: 0.36, easing: 'cubic-bezier(0.5, 0, 0.75, 0.3)' },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.45)`, opacity: 0.7 }
        ], { duration: 780, fill: 'both' });
        anim.onfinish = () => {
            el.remove();
            if (onArrive) onArrive();
        };
        triggerHaptic(adventureObjectiveMet ? 'zero' : 'tick');
        return true;
    }

    // ---------- Intro A: mission card before the first drop ----------
    let objIntroTimer = null;

    function showObjectiveIntro(level, opts = {}) {
        const overlay = document.getElementById('obj-intro');
        const obj = getLevelGoal(level);
        if (!overlay || !obj || level.isTutorial) return;
        const meta = OBJECTIVE_META[obj.type];
        const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
        set('obj-intro-kicker', `${getLevelCode(level)} · ${isGoalLevel(level) ? 'GOAL' : 'OBJECTIVE'}`);
        const newBadge = document.getElementById('obj-intro-new');
        if (newBadge) newBadge.hidden = !opts.newGoal || !!opts.review;
        const tap = overlay.querySelector('.obj-intro-tap');
        if (tap) tap.textContent = opts.review ? 'TAP TO CLOSE' : 'TAP TO START';
        set('obj-intro-glyph', getObjectiveGlyph(obj));
        set('obj-intro-title', level.desc || (meta ? meta.short(obj) : 'Complete the objective'));
        renderIntroHint(document.getElementById('obj-intro-hint'), meta ? (typeof meta.hint === 'function' ? meta.hint(obj) : meta.hint) : '');

        // One row per rule, then one per star goal
        const rules = document.getElementById('obj-intro-rules');
        if (rules) {
            rules.innerHTML = '';
            rules.classList.toggle('has-multi', !!level.stars);
            const row = (icon, kind, text, parent = rules) => {
                const r = document.createElement('div');
                r.className = 'obj-intro-rule';
                r.setAttribute('role', 'listitem');
                const i = document.createElement('span');
                i.className = `obj-intro-rule-icon ${kind}`;
                i.setAttribute('aria-hidden', 'true');
                i.textContent = icon;
                const t = document.createElement('span');
                t.className = 'obj-intro-rule-text';
                t.textContent = text;
                r.append(i, t);
                parent.appendChild(r);
            };
            // Mid-game review (tapped the strip): live progress first, then drops left
            if (opts.review) {
                const { cur, tgt } = getObjectiveCounts(obj);
                const left = Math.max(0, tgt - cur);
                row(adventureObjectiveMet ? '✓' : getObjectiveGlyph(obj), 'progress',
                    adventureObjectiveMet ? 'Objective complete' : `${cur} of ${tgt} done · ${left} to go`);
            }
            if (opts.review) {
                if (!(level.goal && level.goal.type === 'survive')) row('↓', 'drops', `${getDropsLeft()} of ${level.maxDrops} moves left`);
            } else if (!(level.goal && level.goal.type === 'survive')) row('↓', 'drops', `${level.maxDrops} moves available`);
            if (level.rules && level.rules.fluxRate) row('↑', 'drops', `A row rises every ${level.rules.fluxRate} moves`);

            // Star goals start collapsed behind a "Star goals" bar; the arrow expands them
            const stars = document.createElement('div');
            stars.className = 'obj-intro-stars';
            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'obj-intro-stars-toggle';
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-controls', 'obj-intro-stars-list');
            toggle.innerHTML = '<span class="obj-intro-stars-badge" aria-hidden="true">★★★</span>'
                + '<span class="obj-intro-stars-label">Star goals</span>'
                + '<svg class="obj-intro-stars-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
            const list = document.createElement('div');
            list.className = 'obj-intro-stars-list';
            list.id = 'obj-intro-stars-list';
            list.hidden = true;
            toggle.addEventListener('click', (e) => {
                e.stopPropagation(); // the overlay's tap-to-start must not fire
                const open = list.hidden;
                list.hidden = !open;
                stars.classList.toggle('open', open);
                toggle.setAttribute('aria-expanded', String(open));
                triggerHaptic('tick');
            });
            stars.append(toggle, list);
            rules.appendChild(stars);

            row('★', 'star', meta ? meta.short(obj) : (level.desc || 'Complete the objective'), list);
            if (level.stars) {
                row('★★', 'star multi', starGoalText(level.stars, level.stars.two), list);
                row('★★★', 'star multi', starGoalText(level.stars, level.stars.three), list);
            } else {
                row('★', 'star', `Finish within ${level.targetDropsForStar} moves`, list);
                row('★', 'star', `Score ${level.targetScoreForStar.toLocaleString()}+ points`, list);
            }
        }

        const card = document.getElementById('obj-intro-card');
        overlay.classList.remove('leaving');
        if (card) { card.style.transform = ''; card.style.opacity = ''; card.style.animation = 'none'; void card.offsetWidth; card.style.animation = ''; }
        overlay.hidden = false;
        clearTimeout(objIntroTimer);
    }

    // Renders hint text where [kind:label] becomes a mini game orb (pos / neg / dm / od)
    function renderIntroHint(el, text) {
        if (!el) return;
        el.innerHTML = '';
        String(text).split(/(\[[a-z]+:[^\]]+\])/).forEach((part) => {
            const m = part.match(/^\[([a-z]+):([^\]]+)\]$/);
            if (m) {
                const orb = document.createElement('span');
                orb.className = `obj-intro-orb ${m[1]}`;
                orb.textContent = m[2];
                el.appendChild(orb);
            } else if (part) {
                el.appendChild(document.createTextNode(part));
            }
        });
    }

    function dismissObjectiveIntro() {
        const overlay = document.getElementById('obj-intro');
        if (!overlay || overlay.hidden || overlay.classList.contains('leaving')) return;
        clearTimeout(objIntroTimer);
        const card = document.getElementById('obj-intro-card');
        const target = adventureObjectiveCard && adventureObjectiveCard.offsetParent ? adventureObjectiveCard.getBoundingClientRect() : null;
        overlay.classList.add('leaving');
        if (card && target) {
            const from = card.getBoundingClientRect();
            const dx = (target.left + target.width / 2) - (from.left + from.width / 2);
            const dy = (target.top + target.height / 2) - (from.top + from.height / 2);
            const scale = Math.max(0.1, target.width / from.width);
            card.style.animation = 'none';
            card.style.transform = `translate(${dx}px, ${dy}px) scale(${scale}, ${Math.max(0.08, target.height / from.height)})`;
            card.style.opacity = '0';
        }
        setTimeout(() => {
            overlay.hidden = true;
            overlay.classList.remove('leaving');
            if (pendingGuide && gameMode === 'adventure') {
                startGuide(pendingGuide);
                pendingGuide = null;
            }
            if (adventureObjectiveCard) {
                adventureObjectiveCard.classList.remove('bump');
                void adventureObjectiveCard.offsetWidth;
                adventureObjectiveCard.classList.add('bump');
            }
        }, 460);
    }

    function hideObjectiveIntro() {
        const overlay = document.getElementById('obj-intro');
        clearTimeout(objIntroTimer);
        if (overlay) { overlay.hidden = true; overlay.classList.remove('leaving'); }
    }

    function checkGameOver() {
        if (isTutorial || isGameOver) return; // Tutorial mode never triggers game over
        // 0. A Riser on the red line loses, the same as a breach
        for (let c = 0; c < COLS; c++) {
            if (grid[0][c] && grid[0][c].riser) {
                triggerGameOver('A Riser reached the red line!');
                return;
            }
        }
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
                triggerGameOver("Out of moves! The sector could not be stabilized in time.");
                return;
            }
        }
    }

    function getStoredLevelBest(level) {
        if (!level) return 0;
        if (level.sectorNum) {
            return (career.adventureNodes && career.adventureNodes[level.id] && career.adventureNodes[level.id].bestScore) || 0;
        }
        return career.levelHighScores[level.id] || 0;
    }

    function getLevelCode(level) {
        if (!level) return '';
        if (level.sectorNum) return `NODE ${level.id}`;
        if (level.isTutorial) return 'ACADEMY';
        if (level.isGraduation) return 'GRADUATION';
        const code = String(level.sector || '').replace(/^Sector\s*/i, '').toUpperCase();
        return code ? `MISSION ${code}` : 'MISSION';
    }

    function triggerGameOver(message = "The reactor exceeded critical threshold capacity!") {
        isGameOver = true;
        clearFlyingChips();
        sfx.playGameOver();
        triggerScreenShake(18);
        // The board greys out and (unless effects are reduced) falls away before the panel opens
        const still = prefersReducedMotion();
        gameOverFallAt = performance.now() + (still ? 1e9 : 0);
        const panelAt = still ? GAME_OVER_PANEL_MS_STILL : GAME_OVER_PANEL_MS;

        const isAdventureRun = gameMode === 'adventure' && !!activeAdventureLevel;
        const outOfDrops = /drops/i.test(message);
        if (isAdventureRun && activeAdventureLevel.sectorNum && !activeAdventureLevel.editorTest) {
            const f = career.levelFails[activeAdventureLevel.id] || { noHold: 0, noSwap: 0 };
            if (!runUsedHold) f.noHold++;
            if (!runUsedSwap) f.noSwap++;
            career.levelFails[activeAdventureLevel.id] = f;
            saveCareerData();
        }
        hideToolHint();
        const best = isAdventureRun ? getStoredLevelBest(activeAdventureLevel) : (career.highScore || 0);
        const isNewBest = score > 0 && (isAdventureRun ? score > best : score >= best);

        const goKicker = document.getElementById('go-kicker');
        const goReason = document.getElementById('go-reason');
        const goScore = document.getElementById('go-score');
        const goBest = document.getElementById('go-best');
        const goCascade = document.getElementById('go-cascade');
        const goZeroes = document.getElementById('go-zeroes');
        const btnGoMap = document.getElementById('btn-go-map');

        if (goKicker) goKicker.textContent = outOfDrops ? 'OUT OF MOVES' : 'REACTOR OVERLOAD';
        if (goReason) {
            goReason.textContent = isAdventureRun
                ? `${getLevelCode(activeAdventureLevel)} · ${activeAdventureLevel.title}`
                : message;
        }
        if (goScore) {
            goScore.textContent = '0';
            goScore._countValue = 0;
            const target = score;
            setTimeout(() => {
                animateCount(goScore, target, 1100, 0, scoreTicks);
                setTimeout(() => retriggerClass(goScore, 'count-done'), 1100);
            }, panelAt + 250);
        }
        if (goBest) {
            if (isNewBest) {
                goBest.textContent = '🏆 NEW BEST!';
            } else if (best > 0) {
                goBest.textContent = `🏆 BEST ${best.toLocaleString()} · ${(best - score).toLocaleString()} TO GO`;
            } else {
                goBest.textContent = '🏆 NO BEST YET';
            }
        }
        if (goCascade) goCascade.textContent = `${maxCombo}x`;
        if (goZeroes) goZeroes.textContent = totalZeroPoints;
        if (btnGoMap) btnGoMap.hidden = !isAdventureRun || isTutorial || !!(activeAdventureLevel && activeAdventureLevel.isGraduation);
        renderBreachWhy(isAdventureRun && !isTutorial, outOfDrops, /riser/i.test(message));
        showRunOrb('go-orb');

        setTimeout(() => {
            if (modalGameOver) modalGameOver.classList.add('visible');
        }, panelAt);
    }

    // Fail tips per objective type (shown under the breach reasons)
    const OBJECTIVE_FAIL_TIPS = {
        annihilations: 'Look for opposite numbers that touch, like +3 and −3.',
        synthesis_tier: 'Merge matching numbers to grow them before they run out.',
        clear_dark_matter: 'Blast next to a core twice to break it.',
        trigger_laser: 'Build a ±4 pair first, then cancel it.',
        activate_frenzy: 'Chain blasts together to charge Overdrive faster.',
        zero_out: 'Every blast clears two orbs. Set up chains so one move clears more.',
        collect: 'Pair the target number with its opposite: both orbs count.',
        break_cores: 'Blast right beside a core. Big blasts hit several cores at once.',
        catch_stars: 'Catch the low stars first, then build up carefully toward the high ones.',
        risers: 'Keep the Riser\'s opposite in Hold so you can cancel it when it climbs.',
        survive: 'Clear the tallest column first. A rising row lifts everything by one.',
        null_core: 'Build ±4 pairs next to the core: a Cross Laser hits it for 3.',
        big_orb: 'Keep matching numbers apart until you can merge them in a chain.'
    };

    function renderBreachWhy(show, outOfDrops, riserBreach = false) {
        const panel = document.getElementById('breach-why');
        const list = document.getElementById('breach-why-list');
        const tip = document.getElementById('breach-why-tip');
        const stats = document.querySelector('#modal-gameover .breach-stats');
        if (modalGameOver) modalGameOver.classList.toggle('has-why', !!show);
        if (stats) stats.hidden = !!show;
        if (!panel || !list) return;
        panel.hidden = !show;
        if (!show) return;

        const lvl = activeAdventureLevel;
        const obj = getLevelGoal(lvl);
        const meta = obj ? OBJECTIVE_META[obj.type] : null;
        list.innerHTML = '';
        const row = (glyph, glyphClass, title, pct, value) => {
            const r = document.createElement('div');
            r.className = 'breach-why-row';
            const g = document.createElement('span');
            g.className = `breach-why-icon ${glyphClass}`;
            g.setAttribute('aria-hidden', 'true');
            g.textContent = glyph;
            const t = document.createElement('span');
            t.className = 'breach-why-text';
            const b = document.createElement('b');
            b.textContent = title;
            const bar = document.createElement('span');
            bar.className = 'breach-why-bar';
            const fill = document.createElement('i');
            fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
            bar.appendChild(fill);
            t.append(b, bar);
            const v = document.createElement('span');
            v.className = 'breach-why-val';
            v.textContent = value;
            r.append(g, t, v);
            list.appendChild(r);
        };

        let remaining = null;
        if (obj) {
            const { cur, tgt, text } = getObjectiveCounts(obj);
            remaining = Math.max(0, tgt - cur);
            row(getObjectiveGlyph(obj), (obj.type === 'clear_dark_matter' || obj.type === 'break_cores') ? 'dm' : 'obj',
                meta ? meta.short(obj) : (lvl.desc || 'Objective'), tgt ? (cur / tgt) * 100 : 0,
                isGoalLevel(lvl) ? `${remaining} left` : text);
        }
        if (outOfDrops) {
            row('↓', 'drops', 'Moves ran out', 100, `${dropsUsed}/${maxDrops}`);
        } else {
            row(riserBreach ? '▲' : '⚠', 'drops', riserBreach ? 'A Riser reached the red line' : 'A tile crossed the red line', 100, 'BREACH');
        }

        if (tip) {
            const base = obj ? (OBJECTIVE_FAIL_TIPS[obj.type] || '') : '';
            const close = remaining === 1 ? 'So close: just 1 to go. ' : '';
            const overload = !outOfDrops ? 'Keep stacks low and clear the tallest column first. ' : '';
            tip.textContent = `💡 ${close}${overload}${base}`.trim();
        }
    }

    // ---------- Native helpers: plugins and game reminders ----------
    function nativePlugin(name) {
        const cap = window.Capacitor;
        return cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins ? cap.Plugins[name] || null : null;
    }

    const REMINDERS = [
        { id: 101, days: 1, title: 'The reactor misses you', body: 'Your board is waiting. Drop in for a quick run.' },
        { id: 102, days: 3, title: 'Numbers are piling up', body: 'Come back and zero them out before the tide rises.' },
        { id: 103, days: 7, title: 'New stars to earn', body: 'Pick up where you left off in Nullfall.' }
    ];

    // Asked once, after the first win, so the prompt lands on a good moment
    async function askReminderPermission() {
        const notifs = nativePlugin('LocalNotifications');
        if (!notifs || !career.settings || career.settings.remindersAsked) return;
        career.settings.remindersAsked = true;
        saveCareerData();
        try {
            const res = await notifs.requestPermissions();
            if (res.display === 'granted') scheduleReminders();
        } catch (e) { /* plugin unavailable */ }
    }

    async function cancelReminders() {
        const notifs = nativePlugin('LocalNotifications');
        if (!notifs) return;
        try { await notifs.cancel({ notifications: REMINDERS.map((r) => ({ id: r.id })) }); } catch (e) { /* none pending */ }
    }

    // Reminders count from the last time the app was left, so they never fire mid-session
    async function scheduleReminders() {
        const notifs = nativePlugin('LocalNotifications');
        if (!notifs) return;
        try {
            const perm = await notifs.checkPermissions();
            if (perm.display !== 'granted') return;
            await cancelReminders();
            const now = Date.now();
            await notifs.schedule({
                notifications: REMINDERS.map((r) => ({
                    id: r.id, title: r.title, body: r.body,
                    schedule: { at: new Date(now + r.days * 86400000), allowWhileIdle: true }
                }))
            });
        } catch (e) { /* scheduling failed; try again next time */ }
    }

    function triggerAdventureVictory() {
        if (isGameOver || (modalVictory && modalVictory.classList.contains('visible'))) return;
        isGameOver = true;
        sfx.playVictory();
        triggerScreenShake(8);
        setTimeout(askReminderPermission, 1800);

        // Adventure nodes: stars from drops left. Challenges keep their drops + score stars.
        const goalLevel = isGoalLevel(activeAdventureLevel);
        const starDropsLeft = goalLevel ? getStarMeasure(activeAdventureLevel.stars) : getDropsLeft();
        const star1 = 1;
        const star2 = goalLevel ? (starDropsLeft >= activeAdventureLevel.stars.two ? 1 : 0)
            : (dropsUsed <= activeAdventureLevel.targetDropsForStar ? 1 : 0);
        const star3 = goalLevel ? (starDropsLeft >= activeAdventureLevel.stars.three ? 1 : 0)
            : (score >= activeAdventureLevel.targetScoreForStar ? 1 : 0);
        const totalStars = goalLevel ? star1 + star2 + (star2 ? star3 : 0) : star1 + star2 + star3;
        const starScore = score;

        const prevBest = getStoredLevelBest(activeAdventureLevel);
        const dropsLeft = Math.max(0, maxDrops - dropsUsed);
        const dropBonus = dropsLeft * 20;
        const finalScore = score + dropBonus;
        score = finalScore;
        scoreFlySession++;
        scoreShown = score;
        setScoreDisplay(score);

        addFloatingText('SECTOR CLEARED!', canvas.width / (2 * dpr), boardOffsetY + cellH * 2.5, 'var(--gold)', 1.5);

        const isNodeLevel = !!(activeAdventureLevel && activeAdventureLevel.sectorNum);
        if (activeAdventureLevel && activeAdventureLevel.isGraduation) {
            career.tutorialDone = true;
            career.levelStars[0] = 3;
            career.levelHighScores[GRADUATION_LEVEL.id] = Math.max(career.levelHighScores[GRADUATION_LEVEL.id] || 0, finalScore);
            if (career.unlockedLevel < 1) career.unlockedLevel = 1;
            saveCareerData();
            victoryNextNode = (typeof NodeGenerator !== 'undefined') ? NodeGenerator.generateNodeConfig(1, '1-1') : null;
            setVictoryNextLabel('Start Adventure');
        } else if (isNodeLevel && activeAdventureLevel.editorTest) {
            // Level editor play-test: nothing is saved
            victoryNextNode = null;
            setVictoryNextLabel('Back to editor');
        } else if (isNodeLevel) {
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

            victoryNextNode = getNextNodeConfig(activeAdventureLevel);
            setVictoryNextLabel(victoryNextNode ? 'Next mission' : 'Return to map');
        } else {
            // Handcrafted Challenge Level
            const lvlId = activeAdventureLevel.id;
            career.levelStars[lvlId] = Math.max(career.levelStars[lvlId] || 0, totalStars);
            career.levelHighScores[lvlId] = Math.max(career.levelHighScores[lvlId] || 0, finalScore);
            if (lvlId >= career.unlockedLevel && lvlId < ADVENTURE_LEVELS.length) {
                career.unlockedLevel = lvlId + 1;
            }
            saveCareerData();

            setVictoryNextLabel(lvlId < ADVENTURE_LEVELS.length ? 'Next mission' : 'All missions complete');
        }

        const lvlObj = getLevelGoal(activeAdventureLevel);
        const objMeta = lvlObj ? OBJECTIVE_META[lvlObj.type] : null;
        const dropTarget = activeAdventureLevel.targetDropsForStar;
        const scoreTarget = activeAdventureLevel.targetScoreForStar;
        const headroomStars = goalLevel && activeAdventureLevel.stars.kind === 'headroom';
        const starRow = (need, got) => ({
            got,
            title: starGoalText(activeAdventureLevel.stars, need),
            sub: headroomStars
                ? (got ? `Tallest column has ${starUnit(activeAdventureLevel.stars, starDropsLeft)} free` : `Tallest column has ${starUnit(activeAdventureLevel.stars, starDropsLeft)} free · replay for this star`)
                : (got ? `${starDropsLeft} moves left` : `${starDropsLeft} left · ${need - starDropsLeft} short · replay for this star`),
            val: String(starDropsLeft)
        });
        const goals = goalLevel ? [
            {
                got: true,
                title: objMeta ? objMeta.short(lvlObj) : (activeAdventureLevel.desc || 'Complete the goal'),
                sub: 'Goal complete',
                val: '✓'
            },
            starRow(activeAdventureLevel.stars.two, !!star2),
            starRow(activeAdventureLevel.stars.three, totalStars >= 3)
        ] : [
            {
                got: true,
                title: objMeta ? objMeta.short(lvlObj) : (activeAdventureLevel.desc || 'Complete the objective'),
                sub: 'Objective complete',
                val: lvlObj ? getObjectiveCounts(lvlObj).text : '✓'
            },
            {
                got: !!star2,
                title: `Finish within ${dropTarget} moves`,
                sub: star2 ? `Done in ${dropsUsed} moves` : `Used ${dropsUsed} · ${dropsUsed - dropTarget} over · replay for this star`,
                val: String(dropsUsed)
            },
            {
                got: !!star3,
                title: `Score ${scoreTarget.toLocaleString()}+`,
                sub: star3 ? `You scored ${starScore.toLocaleString()}` : `${(scoreTarget - starScore).toLocaleString()} short · replay for this star`,
                val: starScore.toLocaleString()
            }
        ];

        showRunOrb('vic-orb');
        renderVictoryScreen({
            goals,
            starFlags: goalLevel ? [true, totalStars >= 2, totalStars >= 3] : [true, !!star2, !!star3],
            kicker: `${getLevelCode(activeAdventureLevel)} · SUCCESS`,
            title: activeAdventureLevel.title,
            stars: totalStars,
            score: finalScore,
            bonus: `+${dropBonus.toLocaleString()} MOVES BONUS`,
            drops: `${dropsUsed} / ${maxDrops}`,
            dropsLabel: 'MOVES USED',
            best: finalScore > prevBest ? 'NEW' : prevBest.toLocaleString(),
            showMap: !activeAdventureLevel.isGraduation
        });

        setTimeout(() => {
            if (modalVictory) modalVictory.classList.add('visible');
        }, VICTORY_PANEL_MS);
    }

    // Victory panel timing (the star delays match #modal-victory .win-star in style.css)
    const VICTORY_PANEL_MS = 500;
    const STAR_DELAYS_MS = [150, 400, 650];
    const STAR_LAND_MS = 275;     // the stamp hits at 55% of its 0.5s animation
    const STAR_STAMP_HAPTICS = ['pop', 'pulse', 'laser'];
    // Count-ups tick as they climb; the tick rises in pitch with the count
    const scoreTicks = { everyMs: 70 };

    // Ease a number element from its current value up to `to` (rAF, ease-out cubic)
    function animateCount(el, to, duration = 900, from = null, ticks = null) {
        if (!el) return;
        cancelAnimationFrame(el._countRaf);
        const start = from !== null ? from : (typeof el._countValue === 'number' ? el._countValue : (parseInt(String(el.textContent).replace(/[^0-9-]/g, ''), 10) || 0));
        const t0 = performance.now();
        el._countValue = start;
        let lastTick = -Infinity;
        const step = (now) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = Math.round(start + (to - start) * eased);
            if (ticks && v !== el._countValue && now - lastTick >= ticks.everyMs) {
                lastTick = now;
                sfx.playCountTick(eased);
            }
            el._countValue = v;
            el.textContent = v.toLocaleString();
            if (p < 1) el._countRaf = requestAnimationFrame(step);
        };
        el._countRaf = requestAnimationFrame(step);
    }

    function retriggerClass(el, cls) {
        if (!el) return;
        el.classList.remove(cls);
        void el.offsetWidth;
        el.classList.add(cls);
    }

    // In-game score: tween to the new value with a small pop
    function setScoreDisplay(value, instant = false) {
        if (!scoreVal) return;
        if (instant) {
            cancelAnimationFrame(scoreVal._countRaf);
            scoreVal._countValue = value;
            scoreVal.textContent = value.toLocaleString();
            return;
        }
        animateCount(scoreVal, value, 420);
        retriggerClass(scoreVal, 'score-pop');
    }

    // Floating "+N" chip that pops at the event, then flies into the HUD score
    // Drop any chips still in flight (new run, or a result screen opening)
    function clearFlyingChips() {
        scoreFlySession++;
        objDisplay = null;
        objFlyersInFlight = 0;
        document.querySelectorAll('.score-fly, .obj-callout').forEach((el) => el.remove());
    }

    function resetScoreFlyers() {
        clearFlyingChips();
        scoreShown = 0;
    }

    function spawnScoreFlyer(pts, x, y) {
        const target = scoreVal && scoreVal.getBoundingClientRect();
        const reduce = prefersReducedMotion();
        if (!target || !target.width || reduce || typeof document.body.animate !== 'function') return false;

        const cr = canvas.getBoundingClientRect();
        const sx = cr.left + x;
        const sy = cr.top + y;
        const tx = target.left + Math.min(target.width / 2, 22);
        const ty = target.top + target.height / 2;

        const el = document.createElement('span');
        el.className = 'score-fly' + (pts >= 100 ? ' score-fly-big' : '');
        el.textContent = `+${pts.toLocaleString()}`;
        el.style.left = `${sx}px`;
        el.style.top = `${sy}px`;
        document.body.appendChild(el);

        // Stagger chips spawned in the same burst so they arrive one after another
        const now = performance.now();
        scoreFlyStagger = now - lastScoreFlyAt < 120 ? Math.min(scoreFlyStagger + 90, 450) : 0;
        lastScoreFlyAt = now;

        const dx = tx - sx;
        const dy = ty - sy;
        const anim = el.animate([
            { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
            { transform: 'translate(-50%, calc(-50% - 18px)) scale(1.15)', opacity: 1, offset: 0.18 },
            { transform: 'translate(-50%, calc(-50% - 22px)) scale(1)', opacity: 1, offset: 0.4, easing: 'cubic-bezier(0.55, 0, 0.8, 0.4)' },
            { transform: `translate(calc(-50% + ${dx * 0.45}px), calc(-50% + ${dy * 0.45 - 40}px)) scale(0.85)`, opacity: 1, offset: 0.72, easing: 'cubic-bezier(0.3, 0.4, 0.6, 1)' },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.45)`, opacity: 0.85 }
        ], { duration: 1000, delay: scoreFlyStagger, fill: 'both' });

        const session = scoreFlySession;
        anim.onfinish = () => {
            el.remove();
            if (session !== scoreFlySession) return;
            scoreShown += pts;
            setScoreDisplay(Math.min(scoreShown, score));
            retriggerClass(scoreVal, 'score-hit');
        };
        return true;
    }

    function addScore(pts, at = null) {
        pts = Math.round(pts * classicScoreMult());
        score += pts;
        if (gameMode === 'classic' && !firstPlay) {
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
        if (!(at && spawnScoreFlyer(pts, at.x, at.y))) {
            scoreShown += pts;
            setScoreDisplay(Math.min(scoreShown, score));
        }
    }

    function addOverdriveCharge(pts) {
        if (isFrenzyActive || !conceptActive('power_ups')) return;
        if (gameMode === 'classic' || !(activeAdventureLevel && activeAdventureLevel.sectorNum)) queueJit('power_ups');
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
        triggerScreenFlash(0.75, '#ffd700');
        startSlowMo();

        // Select the next special in rotation (Vortex -> Supernova Core -> Antimatter Nuke -> repeat)
        const special = FRENZY_SPECIALS[frenzySpecialIndex % FRENZY_SPECIALS.length];
        frenzySpecialIndex++;

        // Load ONLY this 1 special into the active launcher; upcoming queue remains untouched!
        // (Main gameplay: it takes the first tray slot instead.)
        if (MAIN_GAMEPLAY) dragTray[0] = { ...special };
        else currentOrb = { ...special };

        addFloatingText(`🔥 OVERDRIVE: ${special.label}!`, canvas.width / (2 * dpr), boardOffsetY + cellH * 3, '#ffd700', 1.5);
        checkAdventureObjective('activate_frenzy', 1);
        updateHUD();
        maybeShowOverdriveTip();
    }

    // ---------- Classic: Bounty Ladder and Surges (classicRun.js, GDD §4.1.2–4.1.3) ----------
    function tideUnit() {
        return OrbBag.tideScale(classicTide);
    }

    function goalCount(goal, progress) {
        if (goal.kind === 'orb') return progress ? 'Done' : '0/1';
        if (goal.kind === 'max') return `×${Math.max(1, progress)}/${goal.target}`;
        return `${Math.min(progress, goal.target)}/${goal.target}`;
    }

    // Every scoring moment in Classic feeds the current bounty rung and the running Surge
    function classicEvent(type, value = 1) {
        if (gameMode !== 'classic' || isTutorial || firstPlay || isGameOver || !bountyLadder) return;
        const unit = tideUnit();
        if (classicSurge) {
            const next = ClassicRun.goalProgress(classicSurge, classicSurge.progress, type, value, unit);
            if (next !== classicSurge.progress) {
                classicSurge.progress = next;
                bumpClassicStrip();
                if (ClassicRun.goalDone(classicSurge, next)) endSurge(true);
            }
        }
        const before = bountyLadder.progress;
        const done = ClassicRun.ladderEvent(bountyLadder, type, value, unit);
        if (done) completeRung(done);
        else if (bountyLadder.progress !== before && !classicSurge) bumpClassicStrip();
        renderClassicStrip();
    }

    function completeRung(rung) {
        sfx.playBountyComplete();
        triggerHaptic('zero');
        addFloatingText(`BOUNTY ${rung.index + 1} DONE`, canvas.width / (2 * dpr), boardOffsetY + cellH * 2.2, '#ffd700', 1.3);
        grantReward(rung.reward);
        if (classicStrip) retriggerClass(classicStrip, 'rung-done');
        if (!ladderTipShown && career && !career.hints.ladderTip) {
            ladderTipShown = true;
            addFloatingText('Tap the bounty strip to see the ladder', canvas.width / (2 * dpr), boardOffsetY + cellH * 3, '#c3cadf', 0.95);
            career.hints.ladderTip = true;
            saveCareerData();
        }
    }
    let ladderTipShown = false;

    function grantReward(reward) {
        if (reward.score) addScore(reward.score, { x: canvas.width / (2 * dpr), y: boardOffsetY + cellH * 2.6 });
        if (reward.swap) addSwapToken(reward.swap);
        if (reward.overdrive) addOverdriveCharge(reward.overdrive);
        if (reward.weapon) {
            const special = { ...FRENZY_SPECIALS[ladderWeaponIndex % FRENZY_SPECIALS.length] };
            ladderWeaponIndex++;
            if (MAIN_GAMEPLAY) dragTray[1] = special;
            else nextQueue[0] = special;
            addFloatingText(`SUPER-WEAPON: ${special.label}`, canvas.width / (2 * dpr), boardOffsetY + cellH * 3.2, '#ffd700', 1.3);
        }
        updateHUD();
    }

    // Starts on every SURGE_EVERY-th drop. Dark Storm raises a row straight away,
    // unless one already rose this turn.
    async function startSurge(roseThisTurn) {
        classicSurge = ClassicRun.scaleSurge(surgeBag(), classicHeat);
        const s = classicSurge;
        sfx.playWarning();
        triggerHaptic('overdrive');
        showRunBanner('SURGE', s.name, `${ClassicRun.describe(s, tideUnit())} in ${s.dropsLeft} moves`, 'surge');
        renderClassicStrip();
        if (s.id === 'dark_storm' && !roseThisTurn) {
            await delay(500);
            await pushRisingRow();
        }
    }

    // Counts a drop off the running Surge (called after the drop's events)
    function tickSurge() {
        if (!classicSurge) return;
        classicSurge.dropsLeft--;
        if (classicSurge.dropsLeft <= 0) endSurge(false);
        else renderClassicStrip();
    }

    function endSurge(won) {
        const s = classicSurge;
        classicSurge = null;
        if (won) {
            const reward = ClassicRun.surgeReward(classicTide, surgeCount++);
            sfx.playBountyComplete();
            triggerHaptic('zero');
            showRunBanner('SURGE CLEARED', s.name, ClassicRun.describeReward(reward), 'win');
            grantReward(reward);
        } else {
            addFloatingText('SURGE MISSED', canvas.width / (2 * dpr), boardOffsetY + cellH * 2.2, '#8892b0', 1.1);
        }
        renderClassicStrip();
    }

    function bumpClassicStrip() {
        if (classicStrip) retriggerClass(classicStrip, 'bump');
    }

    // Strip: the current bounty, or the running Surge with the bounty as a small chip
    function renderClassicStrip() {
        if (!classicStrip) return;
        const show = gameMode === 'classic' && !isTutorial && !firstPlay && !!bountyLadder;
        if (classicStrip.hidden === show) {
            classicStrip.hidden = !show;
            if (missionStrip) missionStrip.style.display = show ? '' : missionStrip.style.display;
        }
        if (!show) return;
        const unit = tideUnit();
        const rung = ClassicRun.currentRung(bountyLadder);
        const set = (sel, text) => { const el = classicStrip.querySelector(sel); if (el) el.textContent = text; };
        const chip = classicStrip.querySelector('.cs-chip');
        classicStrip.classList.toggle('surge', !!classicSurge);
        if (classicSurge) {
            set('.cs-glyph', classicSurge.glyph);
            const n = classicSurge.dropsLeft;
            set('.cs-kicker', `SURGE · ${n} MOVE${n === 1 ? '' : 'S'} LEFT`);
            set('.cs-desc', ClassicRun.describe(classicSurge, unit));
            set('.cs-progress', goalCount(classicSurge, classicSurge.progress));
            if (chip) { chip.hidden = false; chip.textContent = `${rung.glyph} ${goalCount(rung, bountyLadder.progress).replace('×', '')}`; }
        } else {
            set('.cs-glyph', rung.glyph);
            set('.cs-kicker', `BOUNTY ${rung.index + 1}`);
            set('.cs-desc', ClassicRun.describe(rung, unit));
            set('.cs-progress', goalCount(rung, bountyLadder.progress));
            if (chip) chip.hidden = true;
        }
        classicStrip.setAttribute('aria-label', `${classicSurge ? 'Surge' : 'Bounty'}: ${classicStrip.querySelector('.cs-desc').textContent}. Open the bounty ladder`);
    }

    // Bounty Ladder screen: done rungs ticked, current with progress, next 2 shown, then "?"
    function openLadder() {
        const root = document.getElementById('ladder');
        if (!root || !bountyLadder || isGameOver) return;
        ladderWasPaused = isPaused;
        isPaused = true;
        renderLadder();
        root.hidden = false;
        const card = document.getElementById('ladder-card');
        if (card) retriggerClass(card, 'concept-in');
    }

    function closeLadder() {
        const root = document.getElementById('ladder');
        if (!root || root.hidden) return;
        root.hidden = true;
        isPaused = ladderWasPaused;
        lastTime = performance.now();
    }

    function renderLadder() {
        const list = document.getElementById('ladder-rungs');
        if (!list) return;
        const unit = tideUnit();
        const cur = bountyLadder.index;
        const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
        const rows = [];
        const bigAt = (i) => (i + 1) % ClassicRun.BIG_RUNG_EVERY === 0;
        // Top of the ladder first: locked "?" rungs, the next 2, the current one, then the last 3 done
        for (let i = cur + 4; i >= cur + 3; i--) {
            rows.push(`<li class="rung locked${bigAt(i) ? ' big' : ''}"><span class="rung-no">${i + 1}</span><span class="rung-glyph">?</span><span class="rung-body"><span class="rung-task">${bigAt(i) ? 'Super-weapon rung' : 'Unlocks as you climb'}</span></span></li>`);
        }
        for (let i = cur + 2; i >= Math.max(0, cur - 3); i--) {
            const r = bountyLadder.rungs[i];
            const state = i < cur ? 'done' : (i === cur ? 'current' : 'next');
            const pct = i === cur ? Math.min(100, Math.round((r.kind === 'orb' ? bountyLadder.progress : bountyLadder.progress / r.target) * 100)) : 0;
            rows.push(`<li class="rung ${state}${r.reward.weapon ? ' big' : ''}">
                <span class="rung-no">${i + 1}</span>
                <span class="rung-glyph">${state === 'done' ? '✓' : esc(r.glyph)}</span>
                <span class="rung-body">
                    <span class="rung-task">${esc(ClassicRun.describe(r, unit))}</span>
                    <span class="rung-reward">${esc(ClassicRun.describeReward(r.reward))}</span>
                    ${state === 'current' ? `<span class="rung-track"><span class="rung-fill" style="width:${pct}%"></span></span>` : ''}
                </span>
                ${state === 'current' ? `<span class="rung-count">${esc(goalCount(r, bountyLadder.progress))}</span>` : ''}
            </li>`);
        }
        list.innerHTML = rows.join('');
        const count = document.getElementById('ladder-count');
        if (count) count.textContent = cur === 0 ? 'Climb as you play' : `${cur} done this run`;
        const surge = document.getElementById('ladder-surge');
        if (surge) {
            surge.hidden = !classicSurge;
            if (classicSurge) surge.textContent = `Surge: ${ClassicRun.describe(classicSurge, unit)} · ${goalCount(classicSurge, classicSurge.progress)} · ${classicSurge.dropsLeft} moves left`;
        }
    }

    // ---------- Board clear: Classic (GDD §4.1.1) and Adventure (GDD §5.6) ----------
    function isBoardEmpty() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) if (grid[r][c]) return false;
        }
        return true;
    }

    async function celebrateBoardClear() {
        const cx = boardOffsetX + (COLS * cellW) / 2;
        const cy = boardOffsetY + (ROWS * cellH) / 2;
        triggerScreenFlash(0.9, '#ffffff', { x: cx, y: cy });
        triggerScreenShake(10);
        triggerHaptic('zero');
        sfx.playBountyComplete();
        setTimeout(() => sfx.playSpecial(), 220);
        const colors = ['#00f2fe', '#f9d423', '#ff4e50', '#c471ed', '#7ff8ff'];
        for (let i = 0; i < 14; i++) {
            createSparks(boardOffsetX + Math.random() * COLS * cellW, boardOffsetY + Math.random() * ROWS * cellH, colors[i % colors.length], 14);
        }
        shockwaves.push({ x: cx, y: cy, radius: 10, maxRadius: COLS * cellW, alpha: 1, color: '#ffffff' });

        // Adventure: +2 drops left and +15% Overdrive; no score, no Swap, no refill (levels stay fixed data)
        if (gameMode === 'adventure') {
            const survive = activeAdventureLevel && activeAdventureLevel.goal && activeAdventureLevel.goal.type === 'survive';
            const od = conceptActive('power_ups');
            const parts = [];
            if (!survive) {
                maxDrops += 2; // drops left feed the stars; Survive counts drops to survive instead
                parts.push('+2 Moves');
            }
            if (od) parts.push('+15% Overdrive');
            showRunBanner('PERFECT', 'BOARD CLEAR', parts.join(' · '), 'clear');
            if (od) addOverdriveCharge(15);
            if (activeAdventureLevel && activeAdventureLevel.rules && activeAdventureLevel.rules.fluxRate > 0) movesUntilRise = 5;
            updateHUD();
            await delay(1100);
            return;
        }

        const bonus = 1000 * (classicTide + 1);
        showRunBanner('PERFECT', 'BOARD CLEAR', `+${bonus.toLocaleString()} · +1 Swap · +15% Overdrive`, 'clear');
        addScore(bonus, { x: cx, y: cy });
        addSwapToken(1);
        addOverdriveCharge(15);
        await delay(1100);

        // Refill the bottom two rows from the weighted tile mix, dropping in from above
        const rows = ClassicRun.buildRefill({ cols: COLS, values: OrbBag.tideValues(classicTide) });
        rows.forEach((row, i) => {
            const r = ROWS - rows.length + i;
            row.forEach((spec, c) => {
                if (!spec) return;
                const tile = spec.type === 'number' ? createTile(spec.value) : createTile(0, spec.type);
                tile.animY = -(r + 1) * cellH;
                tile.flash = 1;
                grid[r][c] = tile;
            });
        });
        sfx.playDrop();
        movesUntilRise = classicRisePeriod();
        await delay(400);
    }

    // Big centred callout over the board for Surges and board clears
    let runBannerTimer = null;
    function showRunBanner(kicker, title, sub, tone) {
        const el = document.getElementById('run-banner');
        if (!el) {
            addFloatingText(`${title}!`, canvas.width / (2 * dpr), boardOffsetY + cellH * 2.5, '#ffd700', 1.5);
            return;
        }
        el.querySelector('.rb-kicker').textContent = kicker;
        el.querySelector('.rb-title').textContent = title;
        el.querySelector('.rb-sub').textContent = sub;
        el.dataset.tone = tone;
        el.hidden = false;
        retriggerClass(el, 'rb-in');
        clearTimeout(runBannerTimer);
        runBannerTimer = setTimeout(() => { el.hidden = true; }, 1900);
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
        if (isProcessing || isGameOver || (isTutorial && (!tutToolAllowed('swap') || tutBusy))) return;
        if (!isSwapModeActive && swapTokens <= 0) {
            triggerDenyShake();
            sfx.playWarning();
            addFloatingText('NO SWAP TOKENS! Earn via 8 moves or Bounties', canvas.width / (2 * dpr), boardOffsetY + cellH * 3, '#ff4e50', 1.1);
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
        tutOnSwapMode(isSwapModeActive);
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
            performSwap(firstSwapTile.r, firstSwapTile.c, r, c);
        }
    }

    // Swaps two orthogonally adjacent cells, spends a token and runs the cascade
    function performSwap(r1, c1, r, c) {
        const t1 = grid[r1][c1];
        const t2 = grid[r][c];
        // The Null Core, static blocks and webbed orbs are fixed in place
        if (isFixedTile(t1) || isFixedTile(t2) || (t1 && t1.web) || (t2 && t2.web)) {
            isSwapModeActive = false;
            firstSwapTile = null;
            if (swapBanner) swapBanner.style.display = 'none';
            updateHUD();
            return;
        }

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
        noteToolUsed('swap');
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

            // Main gameplay: the neighbour the slid tile will trade places with
            const target = boardSwapDrag && boardSwapDrag.target;
            if (target) {
                ctx.setLineDash([]);
                ctx.strokeStyle = '#ffffff';
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 12;
                ctx.lineWidth = 3;
                ctx.strokeRect(boardOffsetX + target.c * cellW + 3, boardOffsetY + target.r * cellH + 3, cellW - 6, cellH - 6);
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
        // Main gameplay fades the chip out at ×1, so it keeps showing the last combo while it fades
        if (!(MAIN_GAMEPLAY && combo <= 1)) comboVal.textContent = `×${combo}`;
        comboVal.classList.toggle('is-idle', combo <= 1);

        if (missionStrip) {
            const cardShown = (el) => el && el.style.display !== 'none' && el.style.display !== '';
            const classicShown = classicStrip && !classicStrip.hidden;
            missionStrip.style.display = (cardShown(adventureObjectiveCard) || cardShown(tutorialCard) || classicShown) ? '' : 'none';
        }

        if (gameMode === 'adventure') {
            const dropsRemaining = Math.max(0, maxDrops - dropsUsed);
            riseCounter.textContent = isTutorial ? (tutRisePending ? '1' : '') : `${dropsRemaining}`;
            if (turnCounterLabel) turnCounterLabel.textContent = isTutorial ? (tutRisePending ? 'Dark Matter Rises In' : '') : 'Moves Left';
            if (riseFill) riseFill.style.height = isTutorial ? '0%' : `${Math.round((1 - dropsRemaining / Math.max(1, maxDrops)) * 100)}%`;
            if (riseStatusBar) {
                if (dropsRemaining <= 3) {
                    riseStatusBar.classList.add('danger-pulse');
                } else {
                    riseStatusBar.classList.remove('danger-pulse');
                }
            }
            updateAdventureObjectiveUI();
        } else {
            // First play doesn't mention Dark Matter or rising rows (they unlock later)
            riseCounter.textContent = firstPlay ? '' : `${movesUntilRise}`;
            if (turnCounterLabel) turnCounterLabel.textContent = firstPlay ? '' : 'Dark Matter Rises In';
            if (riseFill) riseFill.style.height = `${Math.round(Math.min(1, (classicRisePeriod() - movesUntilRise + 1) / classicRisePeriod()) * 100)}%`;
            if (riseStatusBar) {
                if (movesUntilRise <= 1) {
                    riseStatusBar.classList.add('danger-pulse');
                } else {
                    riseStatusBar.classList.remove('danger-pulse');
                }
            }
        }

        // Update Overdrive Gauge
        // Overdrive doesn't exist before power-ups unlock (Adventure 1-5) or during first play
        if (overdriveContainer) overdriveContainer.style.visibility = conceptActive('power_ups') ? '' : 'hidden';
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
        if (btnTouchSwap) {
            btnTouchSwap.classList.toggle('swap-max', swapTokens >= maxSwapTokens && !isSwapModeActive);
            if (MAIN_GAMEPLAY) btnTouchSwap.setAttribute('aria-label', swapTokens >= maxSwapTokens
                ? `Swaps full (${swapTokens}). Slide a tile onto its neighbour to swap`
                : `${swapTokens} board swaps left. Slide a tile onto its neighbour to swap`);
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

        renderClassicStrip();

        // Update Hold Slot UI
        if (heldOrb) {
            holdText.textContent = heldOrb.label;
            holdText.style.color = heldOrb.type === 'special' ? (heldOrb.subType === 'blackhole' ? '#ffd700' : 'var(--purple)') :
                                  (heldOrb.value > 0 ? 'var(--cyan)' : 'var(--orange)');
            holdText.style.fontSize = (heldOrb.label && heldOrb.label.length > 2) ? '0.95rem' : '1.12rem';
            holdText.style.fontWeight = (heldOrb.label === '±' || (heldOrb.label && heldOrb.label.startsWith('÷'))) ? '700' : '900';
            holdSlot.classList.add('active');
            if (btnTouchHold) btnTouchHold.classList.add('has-content');
        } else {
            holdText.textContent = '-';
            holdText.style.color = 'var(--text-muted)';
            holdText.style.fontSize = '1.12rem';
            holdText.style.fontWeight = '900';
            holdSlot.classList.remove('active');
            if (btnTouchHold) btnTouchHold.classList.remove('has-content');
        }

        // Update Next Queue UI (maingameplay.html has no NEXT preview: the tray shows the orbs)
        if (nextSlot1) renderQueueSlot(nextSlot1, nextQueue[0]);
        if (nextSlot2) renderQueueSlot(nextSlot2, nextQueue[1]);

        if (MAIN_GAMEPLAY) renderDragTray();
    }

    // Main gameplay tray: HOLD (label inside when empty) · two orbs. A lifted orb leaves its slot empty.
    function renderDragTray() {
        dragTraySlots.forEach((el, i) => {
            if (!el) return;
            const lifted = activeDrag && activeDrag.source === 'tray' && activeDrag.slot === i;
            renderQueueSlot(el, lifted ? null : dragTray[i]);
        });
        if (holdSlot) {
            const shown = activeDrag && activeDrag.source === 'hold' ? null : heldOrb;
            renderQueueSlot(holdSlot, shown);
            if (!shown) holdSlot.innerHTML = '<span class="dt-hold-label">HOLD</span>';
            holdSlot.classList.toggle('active', !!shown);
            holdSlot.classList.toggle('used', !canHold);
        }
    }

    // DOM version of drawPowerUpOrb for the tray, HOLD and the drag ghost
    function renderPowerUpSlot(element, look) {
        element.classList.add('q-special', 'q-power');
        Object.assign(element.style, {
            borderColor: look.rim,
            background: `radial-gradient(circle, ${look.body.map(([at, c]) => `${c} ${Math.round(at * 100)}%`).join(', ')})`,
            boxShadow: `0 0 16px ${look.glow}, inset 0 0 10px rgba(255, 255, 255, 0.12)`
        });
        let icon;
        if (look.icon === 'vortex') {
            icon = `<path d="${POWER_UP_PATHS.vortex}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`;
        } else if (look.icon === 'nova') {
            icon = `<path d="${POWER_UP_PATHS.nova}"/><circle cx="19" cy="5" r="1.4"/><circle cx="5" cy="19" r="1.1"/>`;
        } else {
            icon = [0, 120, 240].map((a) => `<path d="${POWER_UP_PATHS.nukeBlade}" transform="rotate(${a} 12 12)"/>`).join('') + '<circle cx="12" cy="12" r="2.2"/>';
        }
        const { cols, cells } = powerUpAreaCells(look.area);
        const area = cells.map((o) => `<i style="opacity:${o}"></i>`).join('');
        element.innerHTML = `<svg class="pu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="color:${look.ink};filter:drop-shadow(0 0 4px ${look.glow})">${icon}</svg>`
            + `<span class="pu-area" aria-hidden="true" style="--pu-cols:${cols};--pu-rim:${look.rim}">${area}</span>`;
    }

    function renderQueueSlot(element, orb) {
        element.classList.remove('q-pos', 'q-neg', 'q-special');
        element.classList.remove('q-power');
        const tier = orb && orb.type !== 'special' ? tierFor(Math.abs(orb.value)) : null;
        const css = tier ? tierCss(tier, orb.value > 0) : { borderColor: '', background: '', boxShadow: '' };
        Object.assign(element.style, css);
        if (!orb) {
            element.innerHTML = '';
            return;
        }
        const power = orb.type === 'special' ? POWER_UP_LOOK[orb.subType] : null;
        if (power) {
            renderPowerUpSlot(element, power);
            return;
        }
        // Numbers render like board tiles (white label, signed border); specials keep their accent colour
        const isSpecial = orb.type === 'special';
        element.classList.add(isSpecial ? 'q-special' : (orb.value > 0 ? 'q-pos' : 'q-neg'));
        const color = isSpecial ?
            (orb.subType === 'blackhole' || orb.subType === 'supernova_core' ? 'var(--gold)' :
             orb.subType === 'antimatter_nuke' ? 'var(--orange)' : 'var(--purple)') :
            'var(--text-primary)';

        const isSpecialOp = orb.label === '±' || (orb.label && orb.label.startsWith('÷'));
        const fontWeight = isSpecialOp ? '700' : '900';
        const isLarge = element.classList.contains('next-orb-lg');
        const longLabel = orb.label && orb.label.length > 2;
        const fontSize = isLarge ? (longLabel ? '0.95rem' : '1.12rem') : (longLabel ? '0.62rem' : '0.75rem');
        const lift = tier ? ' text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);' : '';
        element.innerHTML = `<span class="queue-orb-label" style="font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color};${lift}">${orb.label}</span>`;
    }

    // Input Handlers
    function setupInputs() {
        // Mouse Hover & Click
        canvas.addEventListener('mousemove', (e) => {
            if (MAIN_GAMEPLAY) return;
            if (isProcessing || isGameOver || isPaused || currentScreen !== 'game') return;
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const col = Math.floor((mouseX - boardOffsetX) / cellW);
            if (col >= 0 && col < COLS && col !== aimCol) {
                aimCol = col;
                sfx.playMove();
            }
        });

        // Touch Interaction - Direct Drag-to-Aim & Release-to-Drop
        let lastTouchTime = 0;
        let isTouchingCanvas = false;
        let touchCanceled = false;
        const cancelHint = document.getElementById('drop-cancel-hint');
        const canvasHost = document.getElementById('canvas-container');

        // Arm / disarm the "release to cancel" state (side: 'top' | 'bottom')
        function setDropCancel(armed, side = 'top') {
            if (armed === dropCancelArmed && (!armed || (cancelHint && cancelHint.dataset.side === side))) return;
            const entering = armed && !dropCancelArmed;
            dropCancelArmed = armed;
            if (cancelHint) {
                cancelHint.dataset.side = side;
                cancelHint.classList.toggle('show', armed);
            }
            if (canvasHost) canvasHost.classList.toggle('drop-cancel', armed);
            if (entering) triggerHaptic('tick');
        }

        canvas.addEventListener('click', (e) => {
            if (MAIN_GAMEPLAY) return;
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

            const col = Math.floor((mouseX - boardOffsetX) / cellW);
            if (col >= 0 && col < COLS) {
                aimCol = col;
                dropActiveOrb();
            }
        });

        canvas.addEventListener('touchstart', (e) => {
            if (MAIN_GAMEPLAY) return;
            if (isProcessing || isGameOver || isPaused || currentScreen !== 'game') return;
            if (e.touches.length > 1) return; // Ignore multitouch gestures
            if (e.cancelable) e.preventDefault();

            lastTouchTime = Date.now();
            isTouchingCanvas = true;
            touchCanceled = false;
            setDropCancel(false);

            const rect = canvas.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;
            const touchY = e.touches[0].clientY - rect.top;

            if (isSwapModeActive) {
                handleSwapClick(touchX, touchY);
                isTouchingCanvas = false;
                return;
            }

            const col = Math.floor((touchX - boardOffsetX) / cellW);
            if (col >= 0 && col < COLS) {
                if (col !== aimCol) {
                    aimCol = col;
                    sfx.playMove();
                    triggerHaptic('tick');
                }
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            if (MAIN_GAMEPLAY) return;
            if (!isTouchingCanvas || isProcessing || isGameOver || isPaused || currentScreen !== 'game' || isSwapModeActive) return;
            if (e.cancelable) e.preventDefault(); // Prevents pull-to-refresh & screen dragging

            const rect = canvas.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;
            const touchY = e.touches[0].clientY - rect.top;

            // If dragged up past the top header or down past the board, safely cancel drop intent
            if (touchY < -40 || touchY > rect.height + 40) {
                touchCanceled = true;
                setDropCancel(true, touchY < 0 ? 'top' : 'bottom');
                return;
            } else {
                touchCanceled = false;
                setDropCancel(false);
            }

            const col = Math.floor((touchX - boardOffsetX) / cellW);
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
            setDropCancel(false);

            if (touchCanceled || isProcessing || isGameOver || isPaused || currentScreen !== 'game' || isSwapModeActive) return;

            // Direct release-to-drop!
            dropActiveOrb();
        });

        canvas.addEventListener('touchcancel', () => {
            isTouchingCanvas = false;
            touchCanceled = true;
            setDropCancel(false);
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
            // Main gameplay has no aim/drop/hold/swap keys; Overdrive and restart still work
            if (MAIN_GAMEPLAY && !['f', 'F', 'r', 'R'].includes(e.key)) return;

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

        // Button Listeners with event propagation protection (prevents bubbling double-toggle)
        const handleSwapButtonClick = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            toggleSwapMode();
        };

        const handleHoldButtonClick = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            swapHold();
        };

        if (MAIN_GAMEPLAY) {
            setupDragInputs();
        } else {
            if (btnSwapToken) btnSwapToken.addEventListener('click', handleSwapButtonClick);
            if (btnTouchSwap && btnTouchSwap !== btnSwapToken) {
                btnTouchSwap.addEventListener('click', handleSwapButtonClick);
            }
            if (holdSlot) holdSlot.addEventListener('click', handleHoldButtonClick);
            if (btnTouchHold && btnTouchHold !== holdSlot) {
                btnTouchHold.addEventListener('click', handleHoldButtonClick);
            }
        }
        if (btnTouchDrop) btnTouchDrop.addEventListener('click', dropActiveOrb);
        if (btnOverdrive) btnOverdrive.addEventListener('click', activateOverdrive);
        if (btnTouchFrenzy) btnTouchFrenzy.addEventListener('click', activateOverdrive);

        if (btnRestart) btnRestart.addEventListener('click', restartCurrentGame);
        if (btnPlayAgain) btnPlayAgain.addEventListener('click', restartCurrentGame);

        // Resume audio and unstick processing on tab visibility changes / play breaks
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (sfx) sfx.pause();
            } else {
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
        // iOS bfcache / WebView restore: pageshow can fire without a visibilitychange
        window.addEventListener('pageshow', () => { if (sfx) sfx.resume(); });
    }

    // ---------- Main gameplay input: drag & place (maingameplay.html) ----------
    // Tray orb → drag up onto a column (it falls onto that column's stack) or onto HOLD.
    // HOLD orb → drag onto a column. Board tile → slide onto a neighbour to swap (spends a token).
    function setupDragInputs() {
        const LIFT = 64; // the dragged orb floats above the finger so the thumb never hides it
        const canPlay = () => !isProcessing && !isGameOver && !isPaused && currentScreen === 'game' && !activeProjectile;

        const canvasPoint = (clientX, clientY) => {
            const rect = canvas.getBoundingClientRect();
            return { x: clientX - rect.left, y: clientY - rect.top };
        };
        const isOver = (el, x, y) => {
            if (!el) return false;
            const r = el.getBoundingClientRect();
            return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        };
        // Hold catches drops in a padded area around the box (less on top, so the board keeps its
        // bottom row); the first play's hold step pads it more
        const isOverHold = (x, y) => {
            if (!btnTouchHold) return false;
            const r = btnTouchHold.getBoundingClientRect();
            const pad = firstPlay && firstPlay.kind === 'hold' ? 40 : 28;
            return x >= r.left - pad && x <= r.right + pad && y >= r.top - 16 && y <= r.bottom + pad;
        };

        // The ghost eases toward its target each frame, so it can tilt with its speed,
        // lean toward the column under it and glide home when a drag goes nowhere
        const GHOST_FOLLOW = 38;      // per second; high enough to feel attached to the finger
        const GHOST_LIFT_SCALE = 1.1; // size while held
        const GHOST_PICKUP_MS = 160;  // pop-up from 0.85 to the held size, with an overshoot
        const GHOST_TILT_PER_PX = 0.012; // degrees per px/s of sideways speed
        const GHOST_TILT_MAX = 12;
        const GHOST_SNAP = 0.55;      // share of the way the ghost is pulled to the column centre
        const GHOST_RETURN_MS = 180;
        const ghost = { x: 0, y: 0, tx: 0, ty: 0, tilt: 0, size: 40, pickAt: 0, last: 0, raf: 0, ret: null };

        function ghostSize() { return Math.max(40, cellW - 6); }

        function placeGhost(clientX, clientY, snapX = null) {
            if (!dragGhost) return;
            ghost.tx = snapX == null ? clientX : clientX + (snapX - clientX) * GHOST_SNAP;
            ghost.ty = clientY - LIFT;
        }

        function backEase(t) {
            const c = 1.7;
            return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
        }

        function ghostFrame(now) {
            ghost.raf = 0;
            if (!dragGhost) return;
            const dt = Math.min(0.05, ghost.last ? (now - ghost.last) / 1000 : 0.016);
            ghost.last = now;
            const still = prefersReducedMotion();
            let scale;
            if (ghost.ret) {
                const r = ghost.ret;
                const t = Math.min(1, (now - r.start) / GHOST_RETURN_MS);
                const e = still ? 1 : 1 - Math.pow(1 - t, 3);
                ghost.x = r.fromX + (r.toX - r.fromX) * e;
                ghost.y = r.fromY + (r.toY - r.fromY) * e;
                scale = r.fromScale + (r.toScale - r.fromScale) * e;
                ghost.tilt *= 1 - e;
                if (t >= 1 || still) { finishReturn(); return; }
            } else {
                const k = still ? 1 : 1 - Math.exp(-GHOST_FOLLOW * dt);
                const prevX = ghost.x;
                ghost.x += (ghost.tx - ghost.x) * k;
                ghost.y += (ghost.ty - ghost.y) * k;
                const vx = dt > 0 ? (ghost.x - prevX) / dt : 0;
                const tiltTarget = still ? 0 : Math.max(-GHOST_TILT_MAX, Math.min(GHOST_TILT_MAX, vx * GHOST_TILT_PER_PX));
                ghost.tilt += (tiltTarget - ghost.tilt) * (1 - Math.exp(-14 * dt));
                const p = Math.min(1, (now - ghost.pickAt) / GHOST_PICKUP_MS);
                scale = still ? GHOST_LIFT_SCALE : 0.85 + (GHOST_LIFT_SCALE - 0.85) * backEase(p);
            }
            const size = ghost.size;
            dragGhost.style.width = `${size}px`;
            dragGhost.style.height = `${size}px`;
            dragGhost.style.transform = `translate(${ghost.x - size / 2}px, ${ghost.y - size / 2}px) rotate(${ghost.tilt.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
            if (activeDrag || ghost.ret) ghost.raf = requestAnimationFrame(ghostFrame);
        }

        function runGhost() {
            if (!ghost.raf) ghost.raf = requestAnimationFrame(ghostFrame);
        }

        // Released without being used: glide back into the slot it came from
        function returnGhost(slotEl) {
            if (!dragGhost || !slotEl) { if (dragGhost) dragGhost.classList.remove('show'); return; }
            const r = slotEl.getBoundingClientRect();
            const held = GHOST_LIFT_SCALE;
            ghost.ret = {
                fromX: ghost.x, fromY: ghost.y, fromScale: held,
                toX: r.left + r.width / 2, toY: r.top + r.height / 2,
                toScale: r.width / ghost.size,
                start: performance.now(), slotEl
            };
            slotEl.style.visibility = 'hidden'; // the ghost is the orb until it lands
            runGhost();
        }

        function finishReturn() {
            const r = ghost.ret;
            ghost.ret = null;
            if (r && r.slotEl) r.slotEl.style.visibility = '';
            if (dragGhost && !activeDrag) dragGhost.classList.remove('show');
        }

        // A refilled tray slot pops in instead of appearing
        function popTraySlot(i) {
            const el = dragTraySlots[i];
            if (el) retriggerClass(el, 'dt-pop');
        }

        function beginDrag(source, slot, e) {
            const orb = source === 'hold' ? heldOrb : dragTray[slot];
            if (!orb || activeDrag || boardSwapDrag || !canPlay()) return;
            if (firstPlay) {
                if (!fpAllowsDrag(source, slot)) { fpNudge(); return; }
                fpHideHand();
            }
            // Guided move: only the taught orb can be picked up
            if (guide && !guide.busy) {
                if (source !== 'tray' || slot !== guide.slot) { guideNudge(); return; }
                fpHideHand(guide);
            }
            if (toolHint) fpHideHand(toolHint);
            e.preventDefault();
            sfx.init();
            activeDrag = { source, slot, orb, col: -1, ghostY: 0, overHold: false };
            currentOrb = orb; // drives the column beam + landing preview
            dropCancelArmed = true;
            if (ghost.ret) finishReturn();
            if (dragGhost) {
                renderQueueSlot(dragGhost, orb);
                dragGhost.classList.add('show');
            }
            ghost.size = ghostSize();
            ghost.pickAt = performance.now();
            ghost.tilt = 0;
            moveDrag(e.clientX, e.clientY);
            ghost.x = ghost.tx; // start under the finger, then follow
            ghost.y = ghost.ty;
            runGhost();
            sfx.playMove();
            triggerHaptic('tick');
            updateHUD();
        }

        function moveDrag(clientX, clientY) {
            const d = activeDrag;
            const p = canvasPoint(clientX, clientY - LIFT);
            d.ghostY = p.y;
            const fpHoldOnly = firstPlay && firstPlay.kind === 'hold';
            d.overHold = d.source === 'tray' && (!firstPlay || fpHoldOnly) && isOverHold(clientX, clientY);
            const overBoard = !d.overHold && !fpHoldOnly
                && p.x >= boardOffsetX && p.x < boardOffsetX + cellW * COLS
                && p.y >= 0 && p.y < boardOffsetY + cellH * ROWS;
            const col = overBoard ? Math.floor((p.x - boardOffsetX) / cellW) : -1;
            if (col !== d.col) {
                d.col = col;
                if (col >= 0) {
                    aimCol = col;
                    sfx.playMove();
                    triggerHaptic('tick');
                }
            }
            dropCancelArmed = d.col < 0; // hides the beam/preview while off the board
            if (btnTouchHold) btnTouchHold.classList.toggle('drop-target', d.overHold);
            const snapX = d.col >= 0 ? canvas.getBoundingClientRect().left + boardOffsetX + d.col * cellW + cellW / 2 : null;
            placeGhost(clientX, clientY, snapX);
        }

        function endDrag(cancelled) {
            const d = activeDrag;
            if (!d) return;
            activeDrag = null;
            dropCancelArmed = false;
            if (btnTouchHold) btnTouchHold.classList.remove('drop-target');

            // First play: only the move this step teaches counts; anything else snaps back
            if (!cancelled && firstPlay) {
                const ok = firstPlay.kind === 'hold'
                    ? d.overHold
                    : (firstPlay.kind === 'place' && !d.overHold && d.col === firstPlay.col);
                if (!ok) {
                    cancelled = true;
                    if (d.col >= 0 || d.overHold) fpNudge();
                }
            }

            if (!cancelled && guide && !guide.busy && (d.overHold || d.col !== guide.col)) {
                cancelled = true;
                if (d.col >= 0 || d.overHold) guideNudge();
            }

            if (!cancelled && d.overHold) {
                holdFromTray(d.slot);
                if (firstPlay) {
                    firstPlay.busy = true;
                    fpAdvanceSoon();
                }
            } else if (!cancelled && d.col >= 0 && canPlay()) {
                aimCol = d.col;
                currentOrb = d.orb;
                if (dropActiveOrb({ startY: d.ghostY })) {
                    hideToolHint(); // the moment has passed
                    // The orb is in flight: refill its slot straight away
                    if (d.source === 'tray') dragTray[d.slot] = generateOrb();
                    else heldOrb = null;
                    if (firstPlay) firstPlay.busy = true;
                    if (guide && !guide.busy) {
                        guide.busy = true;
                        // Rising rows intro: the row rises right after the guided drop
                        if (guide.riseAfter && activeAdventureLevel && activeAdventureLevel.rules && activeAdventureLevel.rules.fluxRate) movesUntilRise = 1;
                    }
                }
            }
            // Used (dropped or held): the ghost vanishes into the move. Not used: it glides home.
            const used = d.source === 'tray' ? dragTray[d.slot] !== d.orb : heldOrb !== d.orb;
            if (used) {
                if (dragGhost) dragGhost.classList.remove('show');
                if (d.source === 'tray') popTraySlot(d.slot);
            }
            if (firstPlay && !firstPlay.busy) fpStartHand();
            if (guide && !guide.busy) fpStartHand(guide);
            if (toolHint && !activeProjectile) fpStartHand(toolHint);
            if (!activeProjectile) currentOrb = null;
            updateHUD();
            if (!used) returnGhost(d.source === 'tray' ? dragTraySlots[d.slot] : holdSlot);
        }

        function holdFromTray(slot) {
            if (!canHold) {
                sfx.playWarning();
                addFloatingText('HOLD USED · PLACE AN ORB FIRST', canvas.width / (2 * dpr), boardOffsetY + cellH * 3, '#c471ed', 1.05);
                return;
            }
            const orb = dragTray[slot];
            dragTray[slot] = heldOrb || generateOrb(); // a held orb trades places, else the slot refills
            heldOrb = orb;
            canHold = false;
            noteToolUsed('hold');
            sfx.playMove();
            triggerHaptic('swap');
            retriggerClass(btnTouchHold, 'hold-pop');
        }

        function beginBoardSwap(e) {
            if (activeDrag || boardSwapDrag || !canPlay()) return;
            const p = canvasPoint(e.clientX, e.clientY);
            const c = Math.floor((p.x - boardOffsetX) / cellW);
            const r = Math.floor((p.y - boardOffsetY) / cellH);
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS || !grid[r][c]) return;
            if (firstPlay) {
                const f = firstPlay;
                const onPair = f.kind === 'swap' && !f.busy
                    && ((r === f.from.r && c === f.from.c) || (r === f.to.r && c === f.to.c));
                if (!onPair) { fpNudge(); return; }
                fpHideHand();
            }
            e.preventDefault();
            sfx.init();
            boardSwapDrag = { r, c, x0: p.x, y0: p.y, target: null, warned: false };
        }

        function moveBoardSwap(clientX, clientY) {
            const s = boardSwapDrag;
            const p = canvasPoint(clientX, clientY);
            const dx = p.x - s.x0;
            const dy = p.y - s.y0;
            let target = null;
            if (Math.max(Math.abs(dx), Math.abs(dy)) >= cellW * 0.45) {
                const tr = Math.abs(dy) > Math.abs(dx) ? s.r + Math.sign(dy) : s.r;
                const tc = Math.abs(dy) > Math.abs(dx) ? s.c : s.c + Math.sign(dx);
                if (tr >= 0 && tr < ROWS && tc >= 0 && tc < COLS) target = { r: tr, c: tc };
            }
            if (target && swapTokens <= 0) {
                if (!s.warned) {
                    s.warned = true;
                    triggerDenyShake();
                    sfx.playWarning();
                    addFloatingText('NO SWAPS LEFT · EARN ONE EVERY 8 MOVES', canvas.width / (2 * dpr), boardOffsetY + cellH * 3, '#ff4e50', 1.05);
                }
                target = null;
            }
            const changed = (target && (!s.target || s.target.r !== target.r || s.target.c !== target.c)) || (!target && s.target);
            s.target = target;
            // Reuse the classic swap highlights: selected tile, neighbours, and the chosen target
            isSwapModeActive = !!target;
            firstSwapTile = target ? { r: s.r, c: s.c } : null;
            if (changed) {
                if (target) {
                    sfx.playMove();
                    triggerHaptic('tick');
                }
                updateHUD(); // lights the swap counter while a target is chosen
            }
        }

        function endBoardSwap(cancelled) {
            const s = boardSwapDrag;
            boardSwapDrag = null;
            isSwapModeActive = false;
            firstSwapTile = null;
            if (!cancelled && firstPlay && s && s.target) {
                const f = firstPlay;
                const pairOk = (s.r === f.from.r && s.c === f.from.c && s.target.r === f.to.r && s.target.c === f.to.c)
                    || (s.r === f.to.r && s.c === f.to.c && s.target.r === f.from.r && s.target.c === f.from.c);
                if (!pairOk) {
                    cancelled = true;
                    fpNudge();
                }
            }
            if (toolHint) fpHideHand(toolHint);
            if (!cancelled && guide && !guide.busy) {
                cancelled = true;
                guideNudge();
            }
            if (!cancelled && s && s.target && swapTokens > 0 && canPlay()) {
                performSwap(s.r, s.c, s.target.r, s.target.c);
                if (firstPlay) firstPlay.busy = true;
            } else {
                updateHUD();
                if (firstPlay) fpStartHand();
            }
        }

        dragTraySlots.forEach((el, i) => {
            const btn = el && el.closest('button');
            if (btn) btn.addEventListener('pointerdown', (e) => beginDrag('tray', i, e));
        });
        if (btnTouchHold) btnTouchHold.addEventListener('pointerdown', (e) => beginDrag('hold', 0, e));
        canvas.addEventListener('pointerdown', beginBoardSwap);

        window.addEventListener('pointermove', (e) => {
            if (activeDrag) moveDrag(e.clientX, e.clientY);
            else if (boardSwapDrag) moveBoardSwap(e.clientX, e.clientY);
        });
        window.addEventListener('pointerup', (e) => {
            if (activeDrag) {
                moveDrag(e.clientX, e.clientY); // settle the target on the release point
                endDrag(false);
            } else if (boardSwapDrag) {
                moveBoardSwap(e.clientX, e.clientY);
                endBoardSwap(false);
            }
        });
        window.addEventListener('pointercancel', () => {
            if (activeDrag) endDrag(true);
            else if (boardSwapDrag) endBoardSwap(true);
        });

        // The swap counter is a read-out; tapping it explains the gesture
        if (btnTouchSwap) {
            btnTouchSwap.addEventListener('click', () => {
                sfx.init();
                sfx.playMove();
                addFloatingText('SLIDE A TILE ONTO ITS NEIGHBOUR TO SWAP', canvas.width / (2 * dpr), boardOffsetY + cellH * 3, '#00f2fe', 1.05);
            });
        }
    }

    // ==========================================================
    // CONCEPTS, NEW CARDS, GUIDED MOVES, HINTS, TIERS, DISCOVERIES (GDD §3.3, §6)
    // ==========================================================
    const CONCEPTS = (typeof NullfallConcepts !== 'undefined') ? NullfallConcepts.CONCEPTS : [];
    const ORB_TIERS = (typeof NullfallConcepts !== 'undefined') ? NullfallConcepts.TIERS : [];

    function conceptById(id) {
        return CONCEPTS.find((k) => k.id === id) || null;
    }

    function nodeOrderOf(id) {
        return typeof NodeGenerator !== 'undefined' && NodeGenerator.nodeOrder ? NodeGenerator.nodeOrder(id) : 0;
    }

    // In Adventure a concept doesn't exist before its node (GDD §6.1); Classic and Challenges have
    // everything; first play has none of the extras
    function conceptActive(id) {
        if (firstPlay) return false;
        const k = conceptById(id);
        if (!k) return true;
        if (gameMode === 'adventure' && activeAdventureLevel && activeAdventureLevel.sectorNum) {
            return nodeOrderOf(k.unlock) <= nodeOrderOf(activeAdventureLevel.id);
        }
        return true;
    }

    function markConceptSeen(id, quiet = false) {
        if (!career || career.seenConcepts[id]) return;
        career.seenConcepts[id] = true;
        const k = conceptById(id);
        if (k && !k.silent && !quiet) career.discoveriesNew[id] = true;
        saveCareerData();
    }

    // Classic / Challenges: the first time an unseen concept appears, its card shows just in time
    function queueJit(...ids) {
        if (firstPlay || isTutorial || (gameMode === 'adventure' && activeAdventureLevel && activeAdventureLevel.sectorNum)) return;
        ids.forEach((id) => {
            if (!career.seenConcepts[id] && !pendingJit.includes(id)) pendingJit.push(id);
        });
    }

    function flushJit() {
        if (!pendingJit.length || conceptOpen) return;
        const ids = pendingJit.slice();
        pendingJit = [];
        ids.forEach((id) => markConceptSeen(id));
        showConceptCards(ids, 'new');
    }

    // ---------- Concept card (NEW intro, JIT, Discoveries detail) ----------
    let conceptOpen = null; // { pages, index, onDone, wasPaused }

    function showConceptCards(ids, mode, onDone) {
        const root = document.getElementById('concept');
        if (!root) { if (onDone) onDone(); return; }
        const pages = [];
        ids.forEach((id) => {
            const k = conceptById(id);
            if (!k) return;
            pages.push({ name: k.name, rule: k.rule, demo: k.demo, kind: k.kind });
            (k.pages || []).forEach((p) => pages.push({ ...p, kind: k.kind }));
        });
        if (!pages.length) { if (onDone) onDone(); return; }
        conceptOpen = { pages, index: 0, onDone, mode, wasPaused: isPaused };
        if (mode !== 'view') isPaused = true;
        root.hidden = false;
        renderConceptPage();
    }

    function renderConceptPage() {
        const c = conceptOpen;
        if (!c) return;
        const page = c.pages[c.index];
        const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
        set('concept-kicker', c.mode === 'view' ? 'DISCOVERY' : (page.kind === 'goal' ? 'NEW GOAL' : 'NEW'));
        set('concept-title', page.name);
        set('concept-rule', page.rule);
        renderConceptDemo(document.getElementById('concept-demo'), page.demo);
        const pips = document.getElementById('concept-pips');
        if (pips) {
            pips.innerHTML = c.pages.length > 1 ? c.pages.map((_, i) => `<span class="${i === c.index ? 'on' : ''}"></span>`).join('') : '';
        }
        const last = c.index === c.pages.length - 1;
        set('concept-go', last ? (c.mode === 'view' ? 'Close' : 'Got it') : 'Next');
        const skip = document.getElementById('concept-skip');
        if (skip) skip.hidden = c.mode === 'view'; // every intro card can be skipped (GDD §6.1)
        const card = document.getElementById('concept-card');
        if (card) retriggerClass(card, 'concept-in');
    }

    function closeConceptCards() {
        const c = conceptOpen;
        conceptOpen = null;
        const root = document.getElementById('concept');
        if (root) root.hidden = true;
        if (!c) return;
        if (c.mode !== 'view') isPaused = c.wasPaused;
        if (c.onDone) c.onDone();
        if (pendingJit.length && currentScreen === 'game' && !isProcessing && !isGameOver) flushJit();
    }

    // Small looping demos built from the How to play tile styles (CSS animations in maingameplay.css)
    function renderConceptDemo(el, demo) {
        if (!el) return;
        const t = (v, cls = '') => {
            const kind = v === '0' ? 'zero' : (String(v).startsWith('-') || String(v).startsWith('−') ? 'neg' : 'pos');
            const label = typeof v === 'number' ? (v > 0 ? `+${v}` : `−${-v}`) : v;
            return `<span class="cc-tile cc-${kind} ${cls}">${label}</span>`;
        };
        const html = {
            blast: `<div class="cc-row cc-blast">${t(3, 'cc-in-l')}${t(-3, 'cc-in-r')}<span class="cc-burst"></span></div>`,
            merge: `<div class="cc-row cc-merge">${t(2, 'cc-in-l')}${t(2, 'cc-in-r')}${t(4, 'cc-out')}</div>`,
            redline: `<div class="cc-col cc-redline"><span class="cc-line"></span>${t(2, 'cc-warn')}${t(-1)}${t(3)}</div>`,
            hold: `<div class="cc-row">${t(-4, 'cc-to-hold')}<span class="cc-hold">HOLD</span></div>`,
            swap: `<div class="cc-row cc-swap">${t(2, 'cc-swap-a')}${t(-4, 'cc-swap-b')}</div>`,
            dark_matter: `<div class="cc-row">${t(-1, 'cc-drop')}<span class="cc-tile cc-dm cc-crack">◈</span></div>`,
            specials: `<div class="cc-row">${t('0', 'cc-pulse')}<span class="cc-tile cc-spec">±</span><span class="cc-tile cc-spec">×2</span><span class="cc-tile cc-spec">÷2</span></div>`,
            overdrive: `<div class="cc-col"><span class="cc-bar"><i></i></span><span class="cc-tag">SUPER-WEAPON → TRAY</span></div>`,
            collect: `<div class="cc-row"><span class="cc-chip">3</span>${t(3, 'cc-pop')}${t(-3, 'cc-pop cc-late')}</div>`,
            stars: `<div class="cc-col"><span class="cc-star">★</span>${t(2, 'cc-drop-star')}</div>`,
            rise: `<div class="cc-col cc-rise">${t(1)}${t(-3)}<span class="cc-tile cc-dm">◈</span></div>`,
            null_core: `<div class="cc-row"><span class="cc-core"><b class="cc-hp"></b></span></div>`,
            riser: `<div class="cc-col cc-climb">${t(2, 'cc-riser')}</div>`,
            wall: `<div class="cc-col">${t(-2)}<span class="cc-tile cc-wall">0</span></div>`,
            web: `<div class="cc-col">${t(2, 'cc-web')}<span class="cc-gap"></span><span class="cc-gap"></span></div>`,
            dense: `<div class="cc-row">${t(-1, 'cc-drop')}<span class="cc-tile cc-dm cc-dense">◈</span></div>`,
            seal: `<div class="cc-row"><span class="cc-sealcol"><span class="cc-clamp">🔒</span>${t(2)}</span>${t(-2, 'cc-drop')}</div>`,
            entangle: `<div class="cc-row">${t(3, 'cc-twin cc-pop')}${t(-3, 'cc-pop')}<span class="cc-gap"></span>${t(-1, 'cc-twin cc-pop')}</div>`
        }[demo] || '';
        el.innerHTML = html;
    }

    function setupConceptCard() {
        const go = document.getElementById('concept-go');
        const skip = document.getElementById('concept-skip');
        if (go) go.addEventListener('click', () => {
            if (!conceptOpen) return;
            sfx.init();
            sfx.playMove();
            if (conceptOpen.index < conceptOpen.pages.length - 1) {
                conceptOpen.index++;
                renderConceptPage();
            } else {
                closeConceptCards();
            }
        });
        if (skip) skip.addEventListener('click', () => closeConceptCards());
    }

    function setupLadder() {
        if (classicStrip) classicStrip.addEventListener('click', () => { sfx.init(); sfx.playMove(); openLadder(); });
        const close = document.getElementById('ladder-close');
        if (close) close.addEventListener('click', () => { sfx.playMove(); closeLadder(); });
        const root = document.getElementById('ladder');
        if (root) root.addEventListener('click', (e) => { if (e.target === root) closeLadder(); });
    }

    // ---------- One guided move (GDD §6.4) ----------
    function startGuide(g) {
        if (!fpCoach) return;
        guide = { ...g, kind: 'place', slot: 0, busy: false, anim: null };
        fpCoach.hidden = false;
        fpCoach.classList.remove('is-ready', 'fp-nudge', 'fp-low');
        retriggerClass(fpCoach, 'fp-in');
        document.getElementById('fp-kicker').textContent = 'TRY IT';
        document.getElementById('fp-line').textContent = g.line;
        document.getElementById('fp-why').textContent = g.why;
        document.getElementById('fp-cta').hidden = true;
        const skip = document.getElementById('fp-skip');
        skip.hidden = false;
        skip.textContent = 'Skip';
        setTimeout(() => fpStartHand(guide), 160);
    }

    function endGuide() {
        if (!guide) return;
        fpHideHand(guide);
        guide = null;
        if (fpCoach && !firstPlay) fpCoach.hidden = true;
        const skip = document.getElementById('fp-skip');
        if (skip) skip.textContent = 'Skip tips';
    }

    function guideNudge() {
        if (!guide) return;
        sfx.playWarning();
        triggerHaptic('tick');
        fpCoach.classList.remove('fp-in');
        retriggerClass(fpCoach, 'fp-nudge');
        fpStartHand(guide);
    }

    // ---------- Hold and Swap behaviour hints (GDD §6.5) ----------
    const TOOL_HINT_FROM = { hold: '1-3', swap: '1-4' };

    function noteToolUsed(tool) {
        if (tool === 'hold') runUsedHold = true;
        else runUsedSwap = true;
        markConceptSeen(tool);
        const key = tool === 'hold' ? 'usedHold' : 'usedSwap';
        if (!career[key]) {
            career[key] = true;
            saveCareerData();
        }
        if (toolHint && toolHint.tool === tool) hideToolHint();
    }

    function toolHintEligible(tool) {
        const lvl = activeAdventureLevel;
        if (gameMode !== 'adventure' || !lvl || !lvl.sectorNum || firstPlay || guide || conceptOpen || toolHint) return false;
        if (career[tool === 'hold' ? 'usedHold' : 'usedSwap'] || runHintShown[tool]) return false;
        if (dropsUsed < 3) return false; // let the level settle in first
        const order = nodeOrderOf(lvl.id);
        if (order < nodeOrderOf(TOOL_HINT_FROM[tool])) return false;
        const h = career.hints[tool] || { shown: 0, lastOrder: -99 };
        if (h.shown >= 2) return false;
        const fails = career.levelFails[lvl.id] || {};
        const failedWithout = (tool === 'hold' ? fails.noHold : fails.noSwap) >= 2;
        return h.shown === 0 || order >= h.lastOrder + 3 || failedWithout;
    }

    // A tray orb with nowhere to blast or merge: a good moment for Hold
    function findHoldMoment() {
        const tops = getExposedValues();
        for (let slot = 0; slot < (dragTray ? dragTray.length : 0); slot++) {
            const orb = dragTray[slot];
            if (!orb || orb.type !== 'number') continue;
            if (!tops.some((v) => v === -orb.value || v === orb.value)) return { slot };
        }
        return null;
    }

    // One swap that would put two opposites side by side: a good moment for Swap
    function findSwapMoment() {
        if (swapTokens <= 0) return null;
        const isNum = (t) => t && t.type === 'number' && !t.riser;
        const blastsAt = (r, c, v, skipR, skipC) => [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(([rr, cc]) =>
            rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && !(rr === skipR && cc === skipC) && isNum(grid[rr][cc]) && grid[rr][cc].value === -v);
        for (let r = 1; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const a = grid[r][c];
                if (!isNum(a)) continue;
                for (const [dr, dc] of [[0, 1], [1, 0]]) {
                    const r2 = r + dr;
                    const c2 = c + dc;
                    if (r2 >= ROWS || c2 >= COLS) continue;
                    const b = grid[r2][c2];
                    if (!isNum(b) || a.value === -b.value) continue;
                    if (blastsAt(r2, c2, a.value, r, c) || blastsAt(r, c, b.value, r2, c2)) return { from: { r, c }, to: { r: r2, c: c2 } };
                }
            }
        }
        return null;
    }

    function maybeShowToolHint() {
        if (toolHintEligible('hold')) {
            const m = findHoldMoment();
            if (m) return showToolHint('hold', { kind: 'hold', slot: m.slot }, 'Nothing fits this one? Drag it into Hold and use it later.');
        }
        if (toolHintEligible('swap')) {
            const m = findSwapMoment();
            if (m) return showToolHint('swap', { kind: 'swap', from: m.from, to: m.to }, 'Slide a tile onto its neighbour to swap. This swap sets off a blast.');
        }
    }

    function showToolHint(tool, handTarget, text) {
        const el = document.getElementById('tool-hint');
        if (!el) return;
        runHintShown[tool] = true;
        markConceptSeen(tool);
        const h = career.hints[tool] || { shown: 0, lastOrder: -99 };
        h.shown++;
        h.lastOrder = nodeOrderOf(activeAdventureLevel.id);
        career.hints[tool] = h;
        saveCareerData();
        toolHint = { tool, ...handTarget, busy: false, anim: null };
        document.getElementById('tool-hint-text').textContent = text;
        el.dataset.tool = tool;
        el.hidden = false;
        retriggerClass(el, 'tool-hint-in');
        positionToolHint();
        fpStartHand(toolHint);
    }

    function positionToolHint() {
        const el = document.getElementById('tool-hint');
        const anchor = toolHint && (toolHint.tool === 'hold' ? btnTouchHold : btnTouchSwap);
        const host = document.getElementById('canvas-container');
        if (!el || !anchor || !host) return;
        const a = anchor.getBoundingClientRect();
        const hr = host.getBoundingClientRect();
        const left = Math.max(8, Math.min(hr.width - el.offsetWidth - 8, a.left - hr.left + a.width / 2 - el.offsetWidth / 2));
        el.style.left = `${left}px`;
        // Sit above the ghost hand's carried orb so the text stays readable
        el.style.top = `${Math.max(8, a.top - hr.top - el.offsetHeight - 108)}px`;
        el.style.setProperty('--arrow-x', `${a.left - hr.left + a.width / 2 - left}px`);
    }

    function hideToolHint() {
        if (!toolHint) return;
        fpHideHand(toolHint);
        toolHint = null;
        const el = document.getElementById('tool-hint');
        if (el) el.hidden = true;
    }

    // ---------- Orb tiers and records (GDD §3.3) ----------
    function tierFor(magnitude) {
        let found = null;
        ORB_TIERS.forEach((t) => { if (magnitude >= t.size) found = t; });
        return found;
    }

    function noteOrbRecord(magnitude, pos) {
        runBestOrb = Math.max(runBestOrb, magnitude);
        let changed = false;
        if (magnitude > (career.bestOrb || 0)) {
            career.bestOrb = magnitude;
            changed = true;
        }
        const tier = ORB_TIERS.filter((t) => magnitude >= t.size && !career.orbTiersMade[t.size]).pop();
        if (tier) {
            ORB_TIERS.forEach((t) => { if (magnitude >= t.size) career.orbTiersMade[t.size] = true; });
            career.discoveriesNew[`tier:${tier.size}`] = true;
            changed = true;
            const x = pos ? pos.x : canvas.width / (2 * dpr);
            const y = pos ? pos.y : boardOffsetY + cellH * 3;
            const color = tier.color === 'rainbow' ? '#ffffff' : tier.color;
            addFloatingText(`${tier.name.toUpperCase()}!`, x, y - cellH * 0.9, color, 1.6);
            addFloatingText(`First ${tier.size} ever!`, x, y - cellH * 0.35, color, 1.05);
            triggerScreenShake(10);
            sfx.playVictory();
        }
        if (changed) saveCareerData();
    }

    // CSS version of drawTierBody for DOM orbs (tray, hold, Discoveries)
    function tierCss(tier, positive) {
        const rainbow = tier.color === 'rainbow';
        const c = rainbow ? '#ffffff' : tier.color;
        const rainbowGrad = 'linear-gradient(135deg,#ff4e50,#f9d423,#00f2fe,#b46cff,#ff4fd8)';
        const idx = ORB_TIERS.indexOf(tier);
        if (positive) {
            return {
                borderColor: c,
                background: rainbow ? `linear-gradient(rgba(10,12,20,0.5),rgba(10,12,20,0.5)),${rainbowGrad}`
                    : `linear-gradient(135deg,${tierRgba(c, 0.45)},${tierRgba(c, 0.16)}),#0d0f1a`,
                boxShadow: rainbow ? '0 0 12px #f9d423,0 0 20px #b46cff' : `0 0 ${8 + idx * 4}px ${tierRgba(c, 0.75)}`
            };
        }
        return {
            borderColor: c,
            background: rainbow ? 'radial-gradient(circle closest-side,rgba(42,14,21,0) 0,rgba(42,14,21,0.15) 35%,#2a0e15 85%),conic-gradient(#ff4e50,#f9d423,#00f2fe,#b46cff,#ff4fd8,#ff4e50)'
                : `radial-gradient(circle closest-side,${tierRgba(c, 0.72)} 0,${tierRgba(c, 0.32)} 45%,${tierRgba(c, 0)} 85%),#2a0e15`,
            boxShadow: rainbow ? '0 0 8px rgba(249,212,35,0.55),0 0 14px rgba(180,108,255,0.45)' : `0 0 ${5 + idx * 3}px ${tierRgba(c, 0.5)}`
        };
    }

    function discTierStyle(tier) {
        const css = tierCss(tier, true);
        return `border-color:${css.borderColor};background:${css.background};box-shadow:${css.boxShadow}`;
    }

    function tierRgba(hex, a) {
        const n = parseInt(hex.slice(1), 16);
        return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
    }

    // Orbs from 8 up take their tier colour (GDD §3.3): border and glow in the tier colour.
    // Positive: tier-tinted body. Negative: dark red body with a glowing tier-colour core
    // and a softer glow. Expects the orb's rounded-rect path to be current, origin at its centre.
    function drawTierBody(w, h, positive, tier) {
        const idx = ORB_TIERS.indexOf(tier);
        const rainbow = tier.color === 'rainbow';
        const c = rainbow ? '#ffffff' : tier.color;
        const rainbowStops = ['#ff4e50', '#f9d423', '#00f2fe', '#b46cff', '#ff4fd8'];

        if (positive) {
            ctx.fillStyle = '#0d0f1a';
            ctx.fill();
            const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
            if (rainbow) {
                rainbowStops.forEach((s, i) => grad.addColorStop(i / (rainbowStops.length - 1), s));
            } else {
                grad.addColorStop(0, tierRgba(c, 0.45));
                grad.addColorStop(1, tierRgba(c, 0.16));
            }
            ctx.fillStyle = grad;
            ctx.fill();
            if (rainbow) {
                ctx.fillStyle = 'rgba(10, 12, 20, 0.5)';
                ctx.fill();
            }
        } else {
            // The core is sized to the orb's sides (not its corners) so the dark red rim
            // closes evenly all the way round, just inside the border
            const negBg = '#2a0e15';
            // Clamped: tiles can be drawn at a negative size mid-animation
            const reach = Math.max(0, Math.min(w, h) / 2);
            ctx.fillStyle = negBg;
            ctx.fill();
            if (rainbow) {
                if (typeof ctx.createConicGradient === 'function') {
                    const conic = ctx.createConicGradient(0, 0, 0);
                    [...rainbowStops, rainbowStops[0]].forEach((s, i) => conic.addColorStop(i / rainbowStops.length, s));
                    ctx.fillStyle = conic;
                    ctx.fill();
                }
                const vignette = ctx.createRadialGradient(0, 0, 0, 0, 0, reach);
                vignette.addColorStop(0, 'rgba(42, 14, 21, 0)');
                vignette.addColorStop(0.35, 'rgba(42, 14, 21, 0.15)');
                vignette.addColorStop(0.85, negBg);
                vignette.addColorStop(1, negBg);
                ctx.fillStyle = vignette;
                ctx.fill();
            } else {
                const core = ctx.createRadialGradient(0, 0, 0, 0, 0, reach);
                core.addColorStop(0, tierRgba(c, 0.72));
                core.addColorStop(0.45, tierRgba(c, 0.32));
                core.addColorStop(0.85, tierRgba(c, 0));
                core.addColorStop(1, tierRgba(c, 0));
                ctx.fillStyle = core;
                ctx.fill();
            }
        }

        ctx.strokeStyle = c;
        ctx.lineWidth = 2.5;
        if (rainbow) {
            ctx.shadowColor = positive ? '#f9d423' : 'rgba(249, 212, 35, 0.55)';
            ctx.shadowBlur = positive ? 12 : 8;
            ctx.stroke();
            ctx.shadowColor = positive ? '#b46cff' : 'rgba(180, 108, 255, 0.45)';
            ctx.shadowBlur = positive ? 20 : 14;
        } else {
            ctx.shadowColor = tierRgba(c, positive ? 0.75 : 0.5);
            ctx.shadowBlur = positive ? 8 + idx * 4 : 5 + idx * 3;
        }
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
    }

    function runOrbLine() {
        if (!runBestOrb) return '';
        const tier = tierFor(runBestOrb);
        return `Best orb ${runBestOrb}${tier ? ` · ${tier.name}` : ''}`;
    }

    function showRunOrb(id) {
        const el = document.getElementById(id);
        if (!el) return;
        const text = runOrbLine();
        el.hidden = !text;
        el.textContent = text;
    }

    // ---------- Discoveries page (GDD §6.6) ----------
    function hasUnseenDiscoveries() {
        return !!(career && career.discoveriesNew && Object.keys(career.discoveriesNew).length);
    }

    // Home Discoveries button: a red badge counts finds not yet viewed
    function updateDiscoveryDots() {
        const n = career && career.discoveriesNew ? Object.keys(career.discoveriesNew).length : 0;
        const badge = document.getElementById('home-disc-count');
        if (badge) {
            badge.textContent = n > 9 ? '9+' : String(n);
            badge.hidden = n === 0;
        }
        const btn = document.getElementById('btn-home-disc');
        if (btn) btn.setAttribute('aria-label', n ? `Discoveries, ${n} new` : 'Discoveries');
    }

    function openDiscoveries() {
        const root = document.getElementById('disc');
        if (!root) return;
        const fresh = { ...(career.discoveriesNew || {}) };
        const list = CONCEPTS.filter((k) => !k.silent);
        const found = list.filter((k) => career.seenConcepts[k.id]).length;
        const tiersMade = ORB_TIERS.filter((t) => career.orbTiersMade[t.size]).length;
        document.getElementById('disc-sub').textContent = `${found} of ${list.length} concepts · ${tiersMade} of ${ORB_TIERS.length} tiers · best orb ${career.bestOrb || '-'}`;

        const grid = document.getElementById('disc-concepts');
        grid.innerHTML = '';
        list.forEach((k) => {
            const open = !!career.seenConcepts[k.id];
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `disc-card${open ? '' : ' locked'}${fresh[k.id] ? ' is-new' : ''}`;
            b.innerHTML = open
                ? `<span class="disc-demo"></span><b></b><span class="disc-rule"></span>`
                : `<span class="disc-demo disc-q">?</span><b>???</b><span class="disc-rule">Keep playing to discover</span>`;
            if (open) {
                renderConceptDemo(b.querySelector('.disc-demo'), k.demo);
                b.querySelector('b').textContent = k.name;
                b.querySelector('.disc-rule').textContent = k.rule;
                b.addEventListener('click', () => showConceptCards([k.id], 'view'));
            } else {
                b.disabled = true;
            }
            grid.appendChild(b);
        });

        const tiers = document.getElementById('disc-tiers');
        tiers.innerHTML = '';
        ORB_TIERS.forEach((t) => {
            const made = !!career.orbTiersMade[t.size];
            const d = document.createElement('div');
            d.className = `disc-tier${made ? '' : ' locked'}${fresh[`tier:${t.size}`] ? ' is-new' : ''}`;
            d.innerHTML = `<span class="disc-orb"${made ? ` style="${discTierStyle(t)}"` : ''}>${t.size}</span><b>${made ? t.name : '???'}</b>`;
            tiers.appendChild(d);
        });

        career.discoveriesNew = {};
        saveCareerData();
        root.hidden = false;
    }

    function setupDiscoveries() {
        const close = document.getElementById('disc-close');
        if (close) close.addEventListener('click', () => { document.getElementById('disc').hidden = true; });
        const fromHome = document.getElementById('btn-home-disc');
        if (fromHome) fromHome.addEventListener('click', () => { sfx.init(); sfx.playMove(); openDiscoveries(); });
        updateDiscoveryDots();
    }

    // ---------- How to play (main gameplay): 6 one-concept slides ----------
    const HTP_SLIDES = [
        { title: 'Opposites cancel', body: 'Put a number next to its opposite and both vanish in a Zero Blast.' },
        { title: 'Twins merge', body: 'Two matching numbers fuse into one bigger orb. Bigger orbs set off bigger blasts.' },
        { title: 'Drag up to place', body: 'Drag an orb up from the tray. It drops onto the top of the column you let go over.' },
        { title: 'Keep one for later', body: 'Not the number you need? Drop it into HOLD and bring it back when it fits.' },
        { title: 'Slide to swap', body: 'Slide a tile onto its neighbour to trade places. You earn a new swap every 8 moves.' },
        { title: 'Stay under the line', body: 'Dark Matter pushes the stack up. If it crosses the red line, the reactor breaches.' }
    ];
    let htpIndex = 0;

    function htpEl(id) { return document.getElementById(id); }

    function openHowToPlay() {
        if (!htpRoot) return;
        if (sfx) { sfx.init(); sfx.playMove(); }
        hideTutWelcome();
        htpRoot.hidden = false;
        showHtpSlide(0, 0);
    }

    // Done goes back to the main menu; Close / Skip just dismiss (back to wherever it was opened from)
    function closeHowToPlay(toMenu) {
        if (!htpRoot || htpRoot.hidden) return;
        htpRoot.hidden = true;
        if (sfx) sfx.playMove();
        if (toMenu && currentScreen !== 'home') showScreen('home');
    }

    function showHtpSlide(i, dir) {
        const last = HTP_SLIDES.length - 1;
        htpIndex = Math.max(0, Math.min(last, i));
        const slide = HTP_SLIDES[htpIndex];
        htpRoot.querySelectorAll('.htp-slide').forEach((el, n) => {
            const on = n === htpIndex;
            el.classList.toggle('is-active', on);
            el.setAttribute('aria-hidden', on ? 'false' : 'true');
            if (on) el.style.setProperty('--htp-dir', dir < 0 ? '-24px' : (dir > 0 ? '24px' : '0px'));
        });
        htpEl('htp-kicker').textContent = `HOW TO PLAY · ${htpIndex + 1} OF ${HTP_SLIDES.length}`;
        htpEl('htp-title').textContent = slide.title;
        htpEl('htp-body').textContent = slide.body;
        const pips = htpEl('htp-pips');
        pips.setAttribute('aria-label', `Lesson ${htpIndex + 1} of ${HTP_SLIDES.length}`);
        Array.from(pips.children).forEach((p, n) => {
            p.classList.toggle('on', n === htpIndex);
            p.classList.toggle('done', n < htpIndex);
        });
        const isLast = htpIndex === last;
        htpEl('htp-back').hidden = htpIndex === 0 || isLast;
        htpEl('htp-next').hidden = isLast;
        htpEl('htp-replay').hidden = !isLast;
        htpEl('htp-done').hidden = !isLast;
        htpEl('htp-skip').hidden = isLast;
        fitHtpSlide();
    }

    // Scale the active slide's art down to fit the stage on short phones
    function fitHtpSlide() {
        const stage = htpEl('htp-stage');
        const fit = stage && stage.querySelector('.htp-slide.is-active .htp-fit');
        if (!fit) return;
        fit.style.transform = 'none';
        const pad = 24;
        const scale = Math.min(1,
            (stage.clientWidth - pad) / Math.max(1, fit.offsetWidth),
            (stage.clientHeight - pad) / Math.max(1, fit.offsetHeight));
        fit.style.transform = scale < 1 ? `scale(${scale})` : 'none';
    }

    function setupHowToPlay() {
        const go = (step) => {
            const next = htpIndex + step;
            if (next < 0 || next >= HTP_SLIDES.length) return;
            if (sfx) sfx.playMove();
            triggerHaptic('tick');
            showHtpSlide(next, step);
        };
        htpEl('htp-next').addEventListener('click', () => go(1));
        htpEl('htp-back').addEventListener('click', () => go(-1));
        htpEl('htp-replay').addEventListener('click', () => {
            if (sfx) sfx.playMove();
            showHtpSlide(0, -1);
        });
        htpEl('htp-done').addEventListener('click', () => closeHowToPlay(true));
        htpEl('htp-close').addEventListener('click', () => closeHowToPlay(false));
        htpEl('htp-skip').addEventListener('click', () => closeHowToPlay(false));

        // Swipe left / right on the art to move between slides
        const stage = htpEl('htp-stage');
        let startX = null;
        stage.addEventListener('pointerdown', (e) => { startX = e.clientX; });
        stage.addEventListener('pointerup', (e) => {
            if (startX === null) return;
            const dx = e.clientX - startX;
            startX = null;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        });
        stage.addEventListener('pointercancel', () => { startX = null; });

        window.addEventListener('keydown', (e) => {
            if (htpRoot.hidden) return;
            if (e.key === 'ArrowRight') go(1);
            else if (e.key === 'ArrowLeft') go(-1);
            else if (e.key === 'Escape') closeHowToPlay(false);
        });
        window.addEventListener('resize', () => { if (!htpRoot.hidden) fitHtpSlide(); });
    }

    // ---------- First-time play: coached run before Adventure node 1-1 (main gameplay) ----------
    // Each step loads a small scripted board + tray, shows a coach card and a ghost hand, and only
    // accepts the move it teaches. Boards are built so nothing blasts or merges at rest.
    const FP_STEPS = [
        {
            kind: 'place', kicker: 'DRAG &amp; DROP', line: ['Drag the ', 3, ' up onto the ', -3, '.'],
            why: 'Opposite numbers cancel out. Both orbs vanish in a Zero Blast and you score.',
            tiles: [[7, 0, 2], [7, 1, -4], [7, 2, 1], [7, 3, -2], [7, 4, 3], [7, 5, -1], [6, 2, -3], [6, 0, -1], [6, 5, 4]],
            tray: [3, -2], slot: 0, col: 2, keep: ['6-2', '7-2'], rise: 5
        },
        {
            kind: 'place', kicker: 'MERGE', line: ['Nice blast! Now drop ', 2, ' on the ', 2, '.'],
            why: 'Matching numbers fuse into one bigger orb, ready for a bigger blast.',
            tiles: [[7, 0, -1], [6, 0, 2], [7, 1, -4], [7, 2, 1], [7, 3, -2], [7, 4, 3], [7, 5, -1], [6, 5, 4]],
            tray: [2, -2], slot: 0, col: 0, keep: ['6-0', '7-0'], rise: 4
        },
        {
            kind: 'tap', kicker: 'THE RED LINE', line: ['Keep every column below the red line.'],
            why: 'If a tile crosses it, the run ends. Tap anywhere to continue.',
            tiles: [[7, 0, -1], [6, 0, 4], [5, 0, 1], [7, 1, -4], [6, 1, 3], [7, 2, 1], [6, 2, -2], [5, 2, 3], [4, 2, 1], [3, 2, -3], [2, 2, 2], [7, 3, -4], [6, 3, 2], [7, 4, 3], [7, 5, 2], [6, 5, 4], [5, 5, -1]],
            tray: [1, -2], keep: ['2-2', '3-2', '4-2', '5-2', '6-2', '7-2'], rise: 99
        },
        {
            kind: 'ready', kicker: 'YOU’RE READY', line: ['That’s everything. Time for your first mission!'],
            why: 'Replay the basics any time from How to play.',
            tiles: [[7, 0, -1], [6, 0, 4], [7, 1, -4], [6, 1, 3], [7, 2, 1], [7, 3, -4], [6, 3, 2], [7, 4, 3], [7, 5, 2], [6, 5, 4]],
            tray: [-3, 2], keep: null, rise: 5
        }
    ];

    function fpOrb(v) {
        return { type: 'number', value: v, label: v > 0 ? `+${v}` : `${v}` };
    }

    function fpChip(v) {
        return `<span class="fp-chip ${v > 0 ? 'pos' : 'neg'}">${v > 0 ? '+' + v : '−' + (-v)}</span>`;
    }

    function startFirstPlay(node) {
        firstPlay = { step: 0, node };
        gameMode = 'classic';
        isTutorial = false;
        activeAdventureLevel = null;
        isGameOver = false;
        isPaused = false;
        [modalPause, modalVictory, modalGameOver, modalNodePreview].forEach((m) => { if (m) m.classList.remove('visible'); });
        if (bountyCard) bountyCard.style.display = 'none';
        if (adventureObjectiveCard) adventureObjectiveCard.style.display = 'none';
        if (tutorialCard) tutorialCard.style.display = 'none';
        if (bestLabel) bestLabel.textContent = 'Best';
        if (bestVal) bestVal.textContent = (career.highScore || 0).toLocaleString();
        showScreen('game');
        startNewGame();
        fpLoadStep(0);
    }

    function fpLoadStep(i) {
        if (!firstPlay) return;
        const st = FP_STEPS[i];
        Object.assign(firstPlay, {
            step: i, kind: st.kind, slot: st.slot || 0, col: st.col, from: st.from, to: st.to,
            keep: new Set(st.keep || []), dim: Array.isArray(st.keep), busy: false
        });

        grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
        st.tiles.forEach(([r, c, v]) => { grid[r][c] = createTile(v); });
        dragTray = st.tray.map(fpOrb);
        heldOrb = null;
        canHold = true;
        currentOrb = null;
        activeProjectile = null;
        isProcessing = false;
        isSwapModeActive = false;
        firstSwapTile = null;
        combo = 1;
        swapTokens = st.swaps || 1;
        movesUntilRise = st.rise;

        fpCoach.hidden = false;
        fpCoach.classList.toggle('is-ready', st.kind === 'ready');
        fpCoach.classList.toggle('fp-low', st.kind === 'tap'); // keep the red line in view
        fpCoach.classList.remove('fp-nudge');
        retriggerClass(fpCoach, 'fp-in');
        document.getElementById('fp-kicker').innerHTML = st.kicker;
        document.getElementById('fp-line').innerHTML = st.line.map((p) => (typeof p === 'number' ? fpChip(p) : p)).join('');
        document.getElementById('fp-why').textContent = st.why;
        document.getElementById('fp-cta').hidden = st.kind !== 'ready';
        document.getElementById('fp-skip').hidden = st.kind === 'ready';
        fpApplyFocus(st.kind);
        updateHUD();
        setTimeout(fpStartHand, 160);
    }

    // Dim the tray pieces this step doesn't use; highlight the one it does
    function fpApplyFocus(kind) {
        const slot0 = dragTraySlots[0] && dragTraySlots[0].closest('button');
        const slot1 = dragTraySlots[1] && dragTraySlots[1].closest('button');
        const all = [btnTouchHold, slot0, slot1, btnTouchSwap].filter(Boolean);
        all.forEach((el) => el.classList.remove('fp-dim', 'fp-glow'));
        if (holdSlot) holdSlot.classList.remove('fp-target');
        if (riseStatusBar) riseStatusBar.classList.remove('fp-hl', 'fp-dim');
        if (!kind) return;
        const focusSlot = firstPlay && firstPlay.slot === 1 ? slot1 : slot0;
        const dim = (els) => els.forEach((el) => el && el.classList.add('fp-dim'));
        if (kind === 'place') {
            dim(all.filter((el) => el !== focusSlot));
            if (focusSlot) focusSlot.classList.add('fp-glow');
        } else if (kind === 'hold') {
            dim([slot0, slot1, btnTouchSwap].filter((el) => el !== focusSlot));
            if (focusSlot) focusSlot.classList.add('fp-glow');
            if (holdSlot) holdSlot.classList.add('fp-target');
        } else if (kind === 'swap') {
            dim([btnTouchHold, slot0, slot1]);
            if (btnTouchSwap) btnTouchSwap.classList.add('fp-glow');
        } else if (kind === 'tap') {
            dim(all);
        }
        // Rising rows aren't introduced until 1-9, so the rise bar stays dimmed in first play
        if (riseStatusBar && kind !== 'ready') riseStatusBar.classList.add('fp-dim');
    }

    function fpLandingRow(col) {
        return Math.max(0, columnLandingRow(col));
    }

    // Ghost hand: presses the source, carries the orb to the target, lets go, loops
    // f: the first-play step, a guided move or a Hold/Swap hint ({ kind, slot, col, from, to, busy, anim })
    function fpStartHand(f = firstPlay) {
        fpHideHand(f);
        if (!f || f.busy || isPaused || !fpHand || !['place', 'hold', 'swap'].includes(f.kind)) return;
        const cr = canvas.getBoundingClientRect();
        const cellPt = (r, c) => ({ x: cr.left + boardOffsetX + (c + 0.5) * cellW, y: cr.top + boardOffsetY + (r + 0.5) * cellH });
        const mid = (el) => { const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; };
        const LIFT = 64; // same lift as the real drag, so the orb lands where the hand shows
        let start;
        let end;
        let orb = null;
        if (f.kind === 'swap') {
            start = cellPt(f.from.r, f.from.c);
            end = cellPt(f.to.r, f.to.c);
        } else {
            const slotBtn = dragTraySlots[f.slot] && dragTraySlots[f.slot].closest('button');
            if (!slotBtn) return;
            start = mid(slotBtn);
            orb = dragTray[f.slot];
            if (f.kind === 'place') {
                end = cellPt(fpLandingRow(f.col), f.col);
                end.y += LIFT;
            } else {
                end = mid(btnTouchHold);
            }
        }
        if (orb) {
            renderQueueSlot(fpHandOrb, orb);
            fpHandOrb.style.top = `${-LIFT - 28}px`;
            fpHandOrb.hidden = false;
        } else {
            fpHandOrb.hidden = true;
        }
        fpHand.hidden = false;
        if (f === firstPlay) fpShowScrim(f);
        const at = (p) => `translate(${p.x}px, ${p.y}px)`;
        if (prefersReducedMotion()) {
            fpHand.style.transform = at(start);
            return;
        }
        f.anim = fpHand.animate([
            { transform: at(start), opacity: 0, offset: 0 },
            { transform: at(start), opacity: 1, offset: 0.1 },
            { transform: at(start), opacity: 1, offset: 0.2 },
            { transform: at(end), opacity: 1, offset: 0.68 },
            { transform: at(end), opacity: 1, offset: 0.82 },
            { transform: at(end), opacity: 0, offset: 1 }
        ], { duration: 2800, iterations: Infinity, easing: 'ease-in-out' });
    }

    function fpHideHand(f = firstPlay) {
        if (f && f.anim) {
            f.anim.cancel();
            f.anim = null;
        }
        if (fpHand) fpHand.hidden = true;
        fpHideScrim();
    }

    // Spotlight scrim: darkens the whole screen except the coach card, the orb to move and
    // its target, so the hand and the guide stand out. Taps pass through it.
    let fpScrim = null;

    function fpScrimHoles(f) {
        const pad = 6;
        const box = (b, p = pad) => b && b.width > 0 ? { x: b.left - p, y: b.top - p, w: b.width + p * 2, h: b.height + p * 2 } : null;
        const elBox = (el, p) => el ? box(el.getBoundingClientRect(), p) : null;
        const cr = canvas.getBoundingClientRect();
        // Bounding box of board cells, in screen px
        const cellsBox = (cells) => {
            if (!cells.length) return null;
            const xs = cells.map(([, c]) => c);
            const ys = cells.map(([r]) => r);
            const minC = Math.min(...xs), maxC = Math.max(...xs), minR = Math.min(...ys), maxR = Math.max(...ys);
            return box({ left: cr.left + boardOffsetX + minC * cellW, top: cr.top + boardOffsetY + minR * cellH,
                width: (maxC - minC + 1) * cellW, height: (maxR - minR + 1) * cellH }, 2);
        };
        const keep = [...(f.keep || [])].map((k) => k.split('-').map(Number));
        const slotBtn = dragTraySlots[f.slot] && dragTraySlots[f.slot].closest('button');
        const holes = [{ ...elBox(fpCoach, 0), plain: true }];
        if (f.kind === 'place') {
            holes.push(elBox(slotBtn));
            holes.push({ ...cellsBox([[fpLandingRow(f.col), f.col], ...keep.filter(([, c]) => c === f.col)]), target: true });
        } else if (f.kind === 'hold') {
            holes.push(elBox(slotBtn));
            holes.push({ ...elBox(btnTouchHold), target: true });
        } else if (f.kind === 'swap') {
            holes.push({ ...cellsBox([[f.from.r, f.from.c], [f.to.r, f.to.c]]), target: true });
        }
        return holes.filter((h) => h && h.w > 0);
    }

    function fpShowScrim(f) {
        if (!fpScrim) {
            fpScrim = document.createElement('canvas');
            fpScrim.className = 'fp-scrim';
            fpScrim.setAttribute('aria-hidden', 'true');
            document.body.appendChild(fpScrim);
        }
        const holes = fpScrimHoles(f);
        const W = window.innerWidth;
        const H = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        fpScrim.width = Math.round(W * dpr);
        fpScrim.height = Math.round(H * dpr);
        fpScrim.style.width = `${W}px`;
        fpScrim.style.height = `${H}px`;
        const g = fpScrim.getContext('2d');
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);
        g.fillStyle = 'rgba(2, 3, 8, 0.8)';
        g.fillRect(0, 0, W, H);
        // Cut the holes out of the shade
        g.globalCompositeOperation = 'destination-out';
        holes.forEach((h) => { g.beginPath(); g.roundRect(h.x, h.y, h.w, h.h, 16); g.fill(); });
        g.globalCompositeOperation = 'source-over';
        // Dashed ring around the target
        g.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        g.lineWidth = 2;
        g.setLineDash([6, 5]);
        holes.filter((h) => h.target).forEach((h) => { g.beginPath(); g.roundRect(h.x, h.y, h.w, h.h, 16); g.stroke(); });
        fpScrim.hidden = false;
        requestAnimationFrame(() => fpScrim && fpScrim.classList.add('show'));
    }

    function fpHideScrim() {
        if (!fpScrim) return;
        fpScrim.classList.remove('show');
        fpScrim.hidden = true;
    }

    function fpAllowsDrag(source, slot) {
        const f = firstPlay;
        return !f || ((f.kind === 'place' || f.kind === 'hold') && !f.busy && source === 'tray' && slot === f.slot);
    }

    // Wrong move: a little shake on the coach card instead of an error
    function fpNudge() {
        if (!firstPlay || !['place', 'hold', 'swap'].includes(firstPlay.kind)) return;
        if (sfx) sfx.playWarning();
        triggerHaptic('tick');
        fpCoach.classList.remove('fp-in');
        retriggerClass(fpCoach, 'fp-nudge');
        fpStartHand();
    }

    function fpAdvanceSoon(delayMs = 700) {
        const step = firstPlay.step;
        setTimeout(() => {
            if (!firstPlay || firstPlay.step !== step) return;
            if (step + 1 < FP_STEPS.length) fpLoadStep(step + 1);
        }, delayMs);
    }

    // Called when a placed orb / swap has finished cascading
    function fpOnTurnEnd() {
        if (firstPlay && firstPlay.busy && (firstPlay.kind === 'place' || firstPlay.kind === 'swap')) fpAdvanceSoon();
    }

    function fpFinish() {
        if (!firstPlay) return;
        const node = firstPlay.node;
        career.firstPlayDone = true;
        ['zero_blast', 'merge', 'red_line'].forEach((id) => markConceptSeen(id, true));
        saveCareerData();
        fpTeardown();
        startNodeLevel(node);
    }

    function fpTeardown() {
        fpHideHand();
        firstPlay = null;
        if (fpCoach) fpCoach.hidden = true;
        fpApplyFocus(null);
    }

    function drawFirstPlayHints() {
        const f = firstPlay;
        // Dim tiles outside the step's focus with a board-coloured wash (WebKit ignores globalAlpha
        // around the tile drawing, so this paints over them instead)
        if (f.dim) {
            ctx.save();
            ctx.fillStyle = 'rgba(10, 14, 24, 0.72)';
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const tile = grid[r][c];
                    if (!tile || f.keep.has(`${r}-${c}`)) continue;
                    const x = boardOffsetX + c * cellW + (tile.animX || 0);
                    const y = boardOffsetY + r * cellH + (tile.animY || 0);
                    ctx.beginPath();
                    ctx.roundRect(x + 1, y + 1, cellW - 2, cellH - 2, 14);
                    ctx.fill();
                }
            }
            ctx.restore();
        }
        if (f.kind === 'tap') {
            const pulse = 0.55 + 0.45 * Math.sin(performance.now() / 180);
            ctx.save();
            ctx.strokeStyle = `rgba(255, 42, 95, ${pulse})`;
            ctx.shadowColor = '#ff2a5f';
            ctx.shadowBlur = 16;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(boardOffsetX, boardOffsetY + cellH);
            ctx.lineTo(boardOffsetX + COLS * cellW, boardOffsetY + cellH);
            ctx.stroke();
            ctx.restore();
        }
        if (f.busy || activeProjectile) return;
        if (f.kind === 'place' && !activeDrag) {
            const row = fpLandingRow(f.col);
            drawLandingCellReticle(boardOffsetX + f.col * cellW, boardOffsetY + row * cellH, cellW, cellH, 'zero');
        } else if (f.kind === 'swap' && !boardSwapDrag) {
            ctx.save();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#f9d423';
            ctx.shadowColor = '#f9d423';
            ctx.shadowBlur = 12;
            ctx.strokeRect(boardOffsetX + f.from.c * cellW + 3, boardOffsetY + f.from.r * cellH + 3, cellW - 6, cellH - 6);
            ctx.strokeStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.strokeRect(boardOffsetX + f.to.c * cellW + 3, boardOffsetY + f.to.r * cellH + 3, cellW - 6, cellH - 6);
            ctx.restore();
        }
    }

    function setupFirstPlay() {
        if (!fpCoach) return;
        document.getElementById('fp-skip').addEventListener('click', (e) => {
            e.stopPropagation();
            if (guide) endGuide();
            else fpFinish();
        });
        document.getElementById('fp-cta').addEventListener('click', (e) => { e.stopPropagation(); fpFinish(); });
        // "Tap anywhere to continue" on the rise step
        if (screenGame) {
            screenGame.addEventListener('pointerdown', (e) => {
                if (!firstPlay || firstPlay.kind !== 'tap' || isPaused) return;
                if (e.target.closest('#btn-pause, #fp-skip')) return;
                fpLoadStep(firstPlay.step + 1);
            });
        }
        window.addEventListener('resize', () => { if (firstPlay) setTimeout(fpStartHand, 120); });
    }

    // ---------- Debug mode (shows the Labs switch between main gameplay and classic drop) ----------
    function isDebugMode() {
        try { return localStorage.getItem(DEBUG_MODE_KEY) === '1'; } catch (e) { return false; }
    }

    function setDebugMode(on) {
        try {
            if (on) localStorage.setItem(DEBUG_MODE_KEY, '1');
            else localStorage.removeItem(DEBUG_MODE_KEY);
        } catch (e) { /* storage unavailable: debug mode just won't persist */ }
        syncLabsUI();
    }

    // The Labs switch and the Settings "Debug mode" row only appear while debug mode is on
    function syncLabsUI() {
        const on = isDebugMode();
        if (settingDebugToggle) {
            settingDebugToggle.checked = on;
            const row = settingDebugToggle.closest('.qs-row');
            if (row) row.hidden = !on;
        }
        if (labsSwitch) labsSwitch.hidden = !on;
        const devRow = document.getElementById('btn-open-devtools');
        if (devRow) devRow.hidden = !on;
        if (!on) closeDevTools();
    }

    // ---------- Dev tools (debug mode only) ----------
    // A sheet of developer operations: wipe data, pick gameplay, unlock content.
    // Built from JS so index.html and maingameplay.html share one copy.
    const DEV_GAMEPLAY_KEY = 'zeropoint_dev_gameplay';
    const GAMEPLAY_PAGES = { main: 'maingameplay.html', classic: 'index.html' };
    let devRoot = null;

    function getDevGameplay() {
        try { return localStorage.getItem(DEV_GAMEPLAY_KEY); } catch (e) { return null; }
    }

    // In debug mode the chosen gameplay also opens on launch; returns true when it redirects
    // (only on a fresh launch, so in-app links like the Labs switch aren't bounced back)
    function applyDevGameplayPreference() {
        if (!isDebugMode()) return false;
        try {
            if (sessionStorage.getItem('zeropoint_dev_launched')) return false;
            sessionStorage.setItem('zeropoint_dev_launched', '1');
        } catch (e) { return false; }
        const pref = getDevGameplay();
        const current = MAIN_GAMEPLAY ? 'main' : 'classic';
        if (!pref || pref === current || !GAMEPLAY_PAGES[pref]) return false;
        // On iOS, navigating before the web view has its safe-area insets leaves the next page
        // with a zero inset (top bar under the status bar), so wait for the inset (max 1.5s)
        document.documentElement.style.visibility = 'hidden';
        const started = Date.now();
        const tryGo = () => {
            if (safeAreaTop() > 0 || Date.now() - started > 1500) window.location.replace(GAMEPLAY_PAGES[pref]);
            else setTimeout(tryGo, 50);
        };
        tryGo();
        return true;
    }

    function switchGameplay(mode) {
        try { localStorage.setItem(DEV_GAMEPLAY_KEY, mode); } catch (e) { /* switch still works for this launch */ }
        if (mode === (MAIN_GAMEPLAY ? 'main' : 'classic')) { renderDevTools(); return; }
        window.location.href = GAMEPLAY_PAGES[mode];
    }

    function storageBytes() {
        let total = 0;
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                total += k.length + (localStorage.getItem(k) || '').length;
            }
        } catch (e) { return 0; }
        return total * 2; // UTF-16
    }

    // Reads env(safe-area-inset-*) through a probe element, in CSS px
    function readSafeArea() {
        const probe = document.createElement('div');
        probe.style.cssText = 'position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
        document.body.appendChild(probe);
        const cs = getComputedStyle(probe);
        const out = { top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 };
        probe.remove();
        return out;
    }

    function safeAreaTop() { return readSafeArea().top; }

    function safeAreaText() {
        const sa = readSafeArea();
        return `top ${sa.top} · bottom ${sa.bottom}`;
    }

    function wipeAllData(keepDebug) {
        try { localStorage.clear(); } catch (e) { /* nothing stored */ }
        try { sessionStorage.clear(); } catch (e) { /* nothing stored */ }
        if (keepDebug) setDebugMode(true);
        // Reload the app's start page, as a fresh install would open
        window.location.replace(GAMEPLAY_PAGES.main);
    }

    function unlockAllNodes() {
        if (typeof NodeGenerator === 'undefined') return 0;
        const set = new Set(career.unlockedNodes || ['1-1']);
        NodeGenerator.SECTOR_LAYOUTS.forEach((layout) => layout.forEach((n) => set.add(n.id)));
        const added = set.size - (career.unlockedNodes || []).length;
        career.unlockedNodes = [...set];
        saveCareerData();
        return added;
    }

    function resetTutorialFlags() {
        career.tutorialDone = false;
        career.tutorialSkipped = false;
        career.seenOverdriveTip = false;
        career.firstPlayDone = false;
        saveCareerData();
    }

    function devToast(text) {
        const el = devRoot && devRoot.querySelector('.dev-toast');
        if (!el) return;
        el.textContent = text;
        el.classList.remove('show');
        void el.offsetWidth;
        el.classList.add('show');
    }

    const DEV_ACTIONS = {
        'level-editor': () => {
            closeDevTools();
            if (typeof NullfallLevelEditor !== 'undefined') NullfallLevelEditor.open();
        },
        'unlock-nodes': () => {
            const n = unlockAllNodes();
            devToast(n > 0 ? `Unlocked ${n} nodes across all sectors` : 'Every node is already unlocked');
        },
        'replay-first-play': () => {
            career.firstPlayDone = false;
            saveCareerData();
            devToast('First play runs on the next launch of node 1-1');
        },
        'reset-tutorials': () => {
            resetTutorialFlags();
            devToast('Tutorials, first play and tips will show again');
        },
        'copy-save': async () => {
            let raw = '';
            try { raw = localStorage.getItem('zeropoint_career') || '{}'; } catch (e) { raw = '{}'; }
            try {
                await navigator.clipboard.writeText(raw);
                devToast(`Copied save data (${raw.length} chars)`);
            } catch (e) {
                console.log('[dev] zeropoint_career', raw);
                devToast('Clipboard blocked: save data logged to the console');
            }
        },
        'debug-off': () => {
            setDebugMode(false);
            if (modalSettings) modalSettings.classList.remove('visible');
        }
    };

    function devRowHTML(action, title, sub, tone) {
        return `<button type="button" class="dev-row${tone ? ` dev-row-${tone}` : ''}" data-dev="${action}">`
            + `<span class="dev-row-text"><strong>${title}</strong><span>${sub}</span></span>`
            + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>'
            + '</button>';
    }

    function buildDevTools() {
        if (devRoot) return devRoot;
        devRoot = document.createElement('div');
        devRoot.id = 'dev-tools';
        devRoot.className = 'dev-overlay';
        devRoot.hidden = true;
        devRoot.innerHTML = `
            <div class="dev-sheet" role="dialog" aria-modal="true" aria-labelledby="dev-title">
                <div class="dev-head">
                    <div><span class="dev-kicker">DEBUG MODE</span><h2 id="dev-title">Dev tools</h2></div>
                    <button type="button" class="dev-close" data-dev="close" aria-label="Close dev tools">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
                    </button>
                </div>

                <h3 class="dev-section">Gameplay</h3>
                <div class="dev-seg" role="radiogroup" aria-label="Gameplay">
                    <button type="button" role="radio" data-gameplay-mode="main"><strong>Main</strong><span>Drag &amp; place</span></button>
                    <button type="button" role="radio" data-gameplay-mode="classic"><strong>Old play</strong><span>Classic drop</span></button>
                </div>
                <p class="dev-note">Your pick also opens on launch while debug mode is on.</p>

                <h3 class="dev-section">Objective strip</h3>
                <div class="dev-seg" role="radiogroup" aria-label="Objective strip">
                    <button type="button" role="radio" data-obj-strip="ring"><strong>Ring</strong><span>Dial, collapses</span></button>
                    <button type="button" role="radio" data-obj-strip="bar"><strong>Bar</strong><span>Previous strip</span></button>
                </div>
                <p class="dev-note">Adventure goals only. Challenges keep the bar.</p>

                <h3 class="dev-section">Game feel</h3>
                <div class="dev-seg" role="radiogroup" aria-label="Hit-stop">
                    <button type="button" role="radio" data-hit-stop="on"><strong>Hit-stop on</strong><span>Freeze on big blasts</span></button>
                    <button type="button" role="radio" data-hit-stop="off"><strong>Hit-stop off</strong><span>No freeze</span></button>
                </div>
                <p class="dev-note">Cross Laser 60ms, Supernova 90ms, Hyperspace 120ms.</p>

                <h3 class="dev-section">Music</h3>
                <div class="dev-seg dev-music" id="dev-music" role="radiogroup" aria-label="Music track"></div>
                <p class="dev-note" id="dev-music-note"></p>

                <h3 class="dev-section">Button sound</h3>
                <div class="dev-seg dev-music" id="dev-tap" role="radiogroup" aria-label="Button sound" data-no-tap></div>
                <p class="dev-note">Tap one to hear it and use it for every button. Saved on this device.</p>

                <h3 class="dev-section">Levels</h3>
                ${devRowHTML('level-editor', 'Level editor', 'Paint a board, play-test it, export to levels.js')}
                <div class="dev-jump">
                    <div class="dev-jump-head"><strong>Jump to node</strong><span>Starts it now, locked or not</span></div>
                    <div class="dev-jump-sectors" id="dev-jump-sectors" role="tablist" aria-label="Sector"></div>
                    <div class="dev-jump-grid" id="dev-jump-grid"></div>
                </div>

                <h3 class="dev-section">Progress</h3>
                ${devRowHTML('unlock-nodes', 'Unlock all Adventure nodes', 'Opens every node and sector, keeps stars')}
                ${devRowHTML('replay-first-play', 'Replay first play', 'Coached tutorial on node 1-1 runs again')}
                ${devRowHTML('reset-tutorials', 'Reset tutorials &amp; tips', 'Welcome prompt, first play, Overdrive tip')}

                <h3 class="dev-section">Data</h3>
                ${devRowHTML('copy-save', 'Copy save data', 'Career JSON to the clipboard')}
                <div class="dev-wipe">
                    <label class="dev-check"><input type="checkbox" id="dev-keep-debug" checked> Keep debug mode on after wiping</label>
                    <button type="button" class="dev-danger" data-dev="wipe">Clear all user data</button>
                </div>

                <h3 class="dev-section">Device</h3>
                <dl class="dev-info" id="dev-info"></dl>

                <button type="button" class="dev-off" data-dev="debug-off">Turn off debug mode</button>
                <div class="dev-toast" role="status" aria-live="polite"></div>
            </div>`;
        document.body.appendChild(devRoot);

        devRoot.addEventListener('click', (e) => {
            if (e.target === devRoot) { closeDevTools(); return; }
            const seg = e.target.closest('[data-gameplay-mode]');
            if (seg) { switchGameplay(seg.dataset.gameplayMode); return; }
            const stripSeg = e.target.closest('[data-obj-strip]');
            if (stripSeg) {
                if (sfx) sfx.playMove();
                setObjStripStyle(stripSeg.dataset.objStrip);
                renderDevTools();
                return;
            }
            const hitStopSeg = e.target.closest('[data-hit-stop]');
            if (hitStopSeg) {
                if (sfx) sfx.playMove();
                setHitStopEnabled(hitStopSeg.dataset.hitStop === 'on');
                renderDevTools();
                return;
            }
            const tapChip = e.target.closest('[data-tap-sound]');
            if (tapChip) {
                sfx.init();
                sfx.setTapSound(tapChip.dataset.tapSound);
                sfx.playTap();
                renderDevTap();
                return;
            }
            const musicChip = e.target.closest('[data-music]');
            if (musicChip) {
                const id = musicChip.dataset.music;
                if (id === 'stop') sfx.stopBGM();
                else sfx.previewBGM(id);
                setTimeout(renderDevMusic, 0);
                return;
            }
            const sectorPill = e.target.closest('[data-jump-sector]');
            if (sectorPill) {
                devJumpSector = Number(sectorPill.dataset.jumpSector);
                if (sfx) sfx.playMove();
                renderDevJump();
                return;
            }
            const nodeChip = e.target.closest('[data-jump-node]');
            if (nodeChip) { jumpToNode(devJumpSector, nodeChip.dataset.jumpNode); return; }
            const btn = e.target.closest('[data-dev]');
            if (!btn) return;
            const action = btn.dataset.dev;
            if (sfx) sfx.playMove();
            if (action === 'close') { closeDevTools(); return; }
            if (action === 'wipe') {
                // Two taps: the first arms the button, the second wipes
                if (!btn.classList.contains('armed')) {
                    btn.classList.add('armed');
                    btn.textContent = 'Tap again to wipe everything';
                    clearTimeout(btn._disarm);
                    btn._disarm = setTimeout(() => {
                        btn.classList.remove('armed');
                        btn.textContent = 'Clear all user data';
                    }, 3000);
                    return;
                }
                const keep = devRoot.querySelector('#dev-keep-debug');
                wipeAllData(!keep || keep.checked);
                return;
            }
            if (DEV_ACTIONS[action]) { DEV_ACTIONS[action](); renderDevTools(); }
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && devRoot && !devRoot.hidden) closeDevTools();
        });
        return devRoot;
    }

    function renderDevTools() {
        if (!devRoot) return;
        const current = MAIN_GAMEPLAY ? 'main' : 'classic';
        devRoot.querySelectorAll('[data-gameplay-mode]').forEach((b) => {
            const on = b.dataset.gameplayMode === current;
            b.classList.toggle('is-on', on);
            b.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        const stripStyle = getObjStripStyle();
        devRoot.querySelectorAll('[data-obj-strip]').forEach((b) => {
            const on = b.dataset.objStrip === stripStyle;
            b.classList.toggle('is-on', on);
            b.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        const hitStopOn = isHitStopEnabled();
        devRoot.querySelectorAll('[data-hit-stop]').forEach((b) => {
            const on = (b.dataset.hitStop === 'on') === hitStopOn;
            b.classList.toggle('is-on', on);
            b.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        const cleared = Object.values(career.adventureNodes || {}).filter((n) => n && n.cleared).length;
        const rows = [
            ['Page', GAMEPLAY_PAGES[current]],
            ['Viewport', `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio || 1}x`],
            ['Safe area', safeAreaText()],
            ['Storage', `${(storageBytes() / 1024).toFixed(1)} KB`],
            ['Nodes', `${cleared} cleared · ${(career.unlockedNodes || []).length} unlocked`],
            ['Best', String(career.highScore || 0)],
            ['First play', career.firstPlayDone ? 'done' : 'pending']
        ];
        const info = devRoot.querySelector('#dev-info');
        if (info) info.innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
        renderDevJump();
        renderDevMusic();
        renderDevTap();
    }

    function renderDevTap() {
        const box = devRoot && devRoot.querySelector('#dev-tap');
        if (!box || !sfx) return;
        const sounds = sfx.constructor.tapSounds;
        box.innerHTML = Object.keys(sounds).map((id) => {
            const on = id === sfx.tapSound;
            return `<button type="button" role="radio" aria-checked="${on}" class="${on ? 'is-on' : ''}" data-tap-sound="${id}">`
                + `<strong>${sounds[id].name}</strong><span>${sounds[id].desc}</span></button>`;
        }).join('');
    }

    // Music: a chip per track (plays it now, even with music switched off) and Stop
    function renderDevMusic() {
        const box = devRoot && devRoot.querySelector('#dev-music');
        if (!box || !sfx || typeof AmbientMusic === 'undefined') return;
        const tracks = AmbientMusic.tracks;
        const playing = sfx.playingBGM();
        const tagLabel = { ambient: 'Ambient', lofi: 'Lo-fi', upbeat: 'Upbeat · boss' };
        box.innerHTML = Object.keys(tracks).map((id) => {
            const t = tracks[id];
            const on = id === playing;
            return `<button type="button" role="radio" aria-checked="${on}" class="${on ? 'is-on' : ''}" data-music="${id}">`
                + `<strong>${t.name}</strong><span>${tagLabel[t.tag] || t.tag} · ${t.bpm} bpm</span></button>`;
        }).join('') + `<button type="button" class="dev-music-stop" data-music="stop"><strong>Stop</strong><span>${playing ? 'Silence music' : 'Nothing playing'}</span></button>`;
        const note = devRoot.querySelector('#dev-music-note');
        if (note) note.textContent = 'Plays straight away, even with music off. The rotation picks up again on the next game.';
    }

    // Jump to node: sector tabs + a chip per node (main path, bonus rifts and the boss)
    let devJumpSector = null;

    function renderDevJump() {
        if (!devRoot || typeof NodeGenerator === 'undefined') return;
        const sectors = NodeGenerator.SECTOR_METADATA;
        if (!devJumpSector || devJumpSector > sectors.length) devJumpSector = career.currentSector || 1;
        const tabs = devRoot.querySelector('#dev-jump-sectors');
        if (tabs) tabs.innerHTML = sectors.map((meta, i) => {
            const num = i + 1;
            const on = num === devJumpSector;
            return `<button type="button" role="tab" aria-selected="${on}" class="${on ? 'is-on' : ''}" style="--c:${meta.color}" data-jump-sector="${num}">`
                + `<strong>${num}</strong><span>${meta.name}</span></button>`;
        }).join('');
        const grid = devRoot.querySelector('#dev-jump-grid');
        if (!grid) return;
        const unlocked = new Set(career.unlockedNodes || ['1-1']);
        const layout = NodeGenerator.SECTOR_LAYOUTS[devJumpSector - 1] || [];
        grid.style.setProperty('--c', sectors[devJumpSector - 1].color);
        grid.innerHTML = layout.map((n) => {
            const rec = career.adventureNodes ? career.adventureNodes[n.id] : null;
            const stars = rec && rec.cleared ? rec.stars || 0 : -1;
            const open = n.id === '1-1' || unlocked.has(n.id) || stars >= 0;
            const label = n.type === 'boss' ? 'BOSS' : n.num;
            const state = stars >= 0 ? `${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 3 - stars))}` : (open ? 'open' : 'locked');
            return `<button type="button" class="dev-node dev-node-${n.type}${open ? '' : ' is-locked'}${stars >= 0 ? ' is-cleared' : ''}" data-jump-node="${n.id}" aria-label="Start node ${n.id} (${state})">`
                + `<strong>${label}</strong><span>${state}</span></button>`;
        }).join('');
    }

    function jumpToNode(sectorNum, nodeId) {
        if (typeof NodeGenerator === 'undefined') return;
        const config = NodeGenerator.generateNodeConfig(sectorNum, nodeId);
        if (!config) return;
        config.devJump = true; // skips the coached first play on 1-1
        if (sfx) sfx.playMove();
        triggerHaptic('tick');
        closeDevTools();
        if (modalSettings) modalSettings.classList.remove('visible');
        startNodeLevel(config);
    }

    function openDevTools() {
        buildDevTools();
        renderDevTools();
        if (modalSettings) modalSettings.classList.remove('visible');
        devRoot.hidden = false;
        requestAnimationFrame(() => devRoot.classList.add('visible'));
    }

    function closeDevTools() {
        if (!devRoot || devRoot.hidden) return;
        devRoot.classList.remove('visible');
        setTimeout(() => { if (!devRoot.classList.contains('visible')) devRoot.hidden = true; }, 260);
        if (currentScreen === 'home') updateCareerDisplays();
    }

    // Level editor hook (debug mode only): play a draft level without saving progress
    if (typeof window !== 'undefined') {
        window.NullfallDev = {
            enabled: () => isDebugMode(),
            playLevel(sectorNum, nodeId, data) {
                if (!isDebugMode() || typeof NodeGenerator === 'undefined') return;
                const config = NodeGenerator.generateNodeConfig(sectorNum, nodeId, data);
                config.editorTest = true;
                config.title = `Editor: ${config.title}`;
                startNodeLevel(config);
            },
            // Fire a board clear on the current Classic run or Adventure node, or start a Surge (Classic)
            async boardClear() {
                const adventureNode = gameMode === 'adventure' && activeAdventureLevel && activeAdventureLevel.sectorNum;
                if (!isDebugMode() || currentScreen !== 'game' || !(gameMode === 'classic' || adventureNode) || isProcessing || firstPlay || isTutorial) return;
                isProcessing = true;
                grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
                await celebrateBoardClear();
                isProcessing = false;
                updateHUD();
            },
            // Jump Classic to a Heat level (tide follows, up to its max) and raise a row
            async heat(n) {
                if (!isDebugMode() || currentScreen !== 'game' || gameMode !== 'classic') return;
                classicHeat = Math.max(0, n | 0);
                classicTide = Math.min(CLASSIC_TIDE_MAX, classicHeat);
                isProcessing = true;
                await pushRisingRow();
                isProcessing = false;
                updateHUD();
                return { heat: classicHeat, tide: classicTide, rise: classicRisePeriod() };
            },
            async surge() {
                if (!isDebugMode() || currentScreen !== 'game' || gameMode !== 'classic' || !surgeBag || classicSurge) return;
                await startSurge(false);
                updateHUD();
            },
            // Fire the next Overdrive power-up now (Vortex → Nova → Nuke) to check how it looks
            frenzy() {
                if (!isDebugMode() || currentScreen !== 'game') return;
                activateOverdrive();
            },
            // Advance the Adventure goal by n to check the objective strip states
            goal(n = 1) {
                if (!isDebugMode() || currentScreen !== 'game') return;
                checkAdventureObjective('goal', n, false);
            },
            // Fire a blast of the given magnitude to check effects (8 = Supernova); comboN previews the counter
            blast(magnitude = 8, comboN = null, col = null) {
                if (!isDebugMode() || currentScreen !== 'game') return;
                const r = Math.floor(ROWS / 2), c = col == null ? Math.floor(COLS / 2) : col;
                const keep = combo;
                if (comboN) combo = comboN;
                triggerZeroPointBlast(r, c, `${magnitude} + (-${magnitude}) = 0!`, 0, magnitude, r, c);
                combo = keep;
            },
            // Stack column col so it leaves `free` empty rows above it (danger state); value fills it with one orb
            stack(free = 0, col = 0, value = null) {
                if (!isDebugMode() || currentScreen !== 'game') return;
                for (let r = 0; r < ROWS; r++) grid[r][col] = r > free ? createTile(value || (r % 2 ? 3 : 5)) : null;
                return minColumnHeadroom();
            },
            // Turn hit-stop off/on to compare the feel
            hitStop(on = true) {
                setHitStopEnabled(!!on);
                return isHitStopEnabled();
            }
        };
    }

    // Adds the "Dev tools" row to the Settings sheet (listed only in debug mode)
    function setupDevTools() {
        const anchor = document.getElementById('btn-reset-data');
        if (!anchor || document.getElementById('btn-open-devtools')) return;
        const row = document.createElement('button');
        row.type = 'button';
        row.id = 'btn-open-devtools';
        row.className = 'qs-row';
        row.hidden = true;
        row.innerHTML = '<span class="qs-ic" style="color:#f9d423;background:rgba(249, 212, 35, 0.13)">'
            + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"></path></svg>'
            + '</span><span class="qs-text"><strong>Dev tools</strong><span>Wipe data, switch gameplay, unlock content</span></span>'
            + '<svg class="qs-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>';
        anchor.parentNode.insertBefore(row, anchor);
        // The Labs switch is a gameplay switch too: remember it for the next launch
        if (labsSwitch) labsSwitch.addEventListener('click', () => {
            try { localStorage.setItem(DEV_GAMEPLAY_KEY, MAIN_GAMEPLAY ? 'classic' : 'main'); } catch (e) { /* ignore */ }
        });
        row.addEventListener('click', () => {
            if (sfx) sfx.playMove();
            openDevTools();
        });
    }

    // Main Game Loop (60 FPS)
    let lastTime = performance.now();
    function gameLoop(now) {
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (!isPaused && currentScreen === 'game') {
            update(dt * slowMoScale(now));
        }
        updateDanger(dt, now);
        if (currentScreen === 'game') {
            render();
        }

        requestAnimationFrame(gameLoop);
    }

    function update(dt) {
        // Hit-stop: hold the frame on impact; render keeps drawing the shake and flash
        if (performance.now() < hitStopUntil) return;

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

        updateStarfield(dt);

        // Shake decay: trauma drains steadily, the blast shove springs back fast
        if (shakeTrauma > 0) shakeTrauma = Math.max(0, shakeTrauma - SHAKE_TRAUMA_DECAY * dt);
        if (shakeKickX || shakeKickY) {
            const k = Math.exp(-SHAKE_KICK_RETURN * dt);
            shakeKickX *= k;
            shakeKickY *= k;
            if (Math.abs(shakeKickX) < 0.05 && Math.abs(shakeKickY) < 0.05) shakeKickX = shakeKickY = 0;
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
            screenFlash = Math.max(0, screenFlash - FLASH_DECAY * dt);
        }

        // Sparks update: oldest go first past the cap; sparks burst out then hang on air drag,
        // embers drift up slowly
        if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
        const f = dt * 60;
        for (let i = particles.length - 1; i >= 0; i--) {
            const sp = particles[i];
            const kind = PARTICLE_KINDS[sp.kind] || PARTICLE_KINDS.dot;
            const drag = Math.pow(kind.drag, f);
            sp.vx *= drag;
            sp.vy *= drag;
            sp.x += sp.vx * f;
            sp.y += sp.vy * f;
            sp.vy += kind.gravity * f;
            sp.alpha -= sp.decay * f;
            if (sp.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        // Floating texts update: rise with an ease-out, hold, then fade
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.age += dt;
            const p = Math.min(1, ft.age / FLOAT_TEXT_LIFE);
            ft.y = ft.y0 - FLOAT_TEXT_RISE * (1 - Math.pow(1 - p, 3));
            ft.alpha = p < FLOAT_TEXT_HOLD ? 1 : 1 - (p - FLOAT_TEXT_HOLD) / (1 - FLOAT_TEXT_HOLD);
            if (p >= 1) {
                floatingTexts.splice(i, 1);
            }
        }

        if (comboCounter) {
            const cc = comboCounter;
            cc.age += dt;
            cc.punch *= Math.exp(-COMBO_PUNCH_DECAY * dt);
            // Glide toward the latest blast instead of jumping
            const k = 1 - Math.exp(-COMBO_FOLLOW * dt);
            cc.x += (cc.tx - cc.x) * k;
            cc.y += (cc.ty - cc.y) * k;
            if (cc.age > COMBO_SHOW + COMBO_FADE) comboCounter = null;
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

        if (!isGameOver && gameOverFallAt) gameOverFallAt = 0;
        canvas.classList.toggle('board-dead', !!gameOverFallAt);

        // Clear before the shake moves the canvas, so no strip is left uncleared at the edges
        ctx.clearRect(0, 0, w, h);

        ctx.save();
        applyScreenShake(w, h);

        // 1. Draw Grid Background & Danger Threshold
        drawGridBackground(w, h);

        // 2. Draw Aim Line & Landing Ghost Preview
        drawAimerAndPreview();

        // 3. Draw Board Tiles (star cells sit underneath)
        drawStarCells();
        drawSealedColumns();
        drawEntangleLinks();
        drawTiles();
        drawSealClamps();
        if (firstPlay) drawFirstPlayHints();
        if (guide && !guide.busy && !activeDrag && !activeProjectile) {
            drawLandingCellReticle(boardOffsetX + guide.col * cellW, boardOffsetY + columnLandingRow(guide.col) * cellH, cellW, cellH, 'zero');
        }

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

        // 6.5 Danger: red vignette and a glow under the threshold line, beating with the heart
        drawDanger(w, h);

        // 7. Draw Floating Texts, then the cascade's combo counter on top
        drawFloatingTexts();
        drawComboCounter();

        ctx.restore();
    }

    function drawGridBackground(w, h) {
        drawStarfield(w, h);

        // Grid column highlights
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let c = 1; c < COLS; c++) {
            const x = boardOffsetX + c * cellW;
            ctx.beginPath();
            ctx.moveTo(x, boardOffsetY);
            ctx.lineTo(x, boardOffsetY + cellH * ROWS);
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
        if (isGameOver || isSwapModeActive || dropCancelArmed) return;
        if (MAIN_GAMEPLAY && !activeDrag) return; // only preview while an orb is held over the board
        const col = aimCol;
        const centerX = boardOffsetX + col * cellW + cellW / 2;

        // Sealed column: a red beam and no landing preview
        if (sealedCols.includes(col)) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 78, 80, 0.16)';
            ctx.fillRect(boardOffsetX + col * cellW, boardOffsetY, cellW, cellH * ROWS);
            ctx.fillStyle = '#ff8a8c';
            ctx.font = '900 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('SEALED', centerX, boardOffsetY + cellH * 1.25);
            ctx.restore();
            return;
        }

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
            const landingRow = columnLandingRow(col);

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
                    fillPopupText('⚫ VORTEX (CRUSH COLUMN!)', centerX, boardOffsetY + 16);

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
                    fillPopupText(textLabel, centerX, ghostY - cellH / 2 - 4);

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
                    fillPopupText(specialLabel, centerX, ghostY - cellH / 2 - 4);

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
                    let previewLabel = '💥 MICRO POP';
                    let previewColor = '#ffffff';

                    if (previewTier === 2) {
                        previewLabel = '⚡ SHOCKWAVE';
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
                    fillPopupText(previewLabel, centerX, ghostY - cellH / 2 - 4);
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
                    fillPopupText(`✨ MERGE (➜ ${nextVal})`, centerX, ghostY - cellH / 2 - 4);
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

                const fallen = applyTileFall(r, c, x, y);
                if (fallen === 'gone') continue;

                if (tile.type === 'dark_matter') {
                    drawDarkMatterTile(x, y, tw, th, tile.hp, tile.flash, tile.dense);
                } else if (tile.type === 'static') {
                    drawStaticBlock(x, y, tw, th);
                } else if (tile.type === 'null_core') {
                    // One 2×2 graphic, drawn from the top-left cell
                    if (tile.part === 'tl') drawNullCore(x + cellW / 2, y + cellH / 2, cellW * 2 - 8, cellH * 2 - 8, tile.core);
                } else {
                    const flavor = tile.value > 0 ? 'pos' : 'neg';
                    const label = tile.value > 0 ? `+${tile.value}` : `${tile.value}`;
                    if (tile.riser) drawRiserTrail(x, y, tw, th, r, tile.climbAt);
                    if (tile.link) drawLinkHalo(x, y, tw, th, tile.link);
                    drawOrbBreath(x, y, tw, tile.value, r, c);
                    drawTileGraphic(x, y, tw, th, label, flavor, tile.flash);
                    if (tile.riser) drawRiserCap(x, y, tw, th, r);
                    if (tile.web) drawWebOverlay(x, y, tw, th);
                }
                if (fallen) ctx.restore();
            }
        }
    }

    // Game over: columns let go left to right, lower tiles first, and fall off the board
    const FALL_COL_STAGGER = 70;  // ms between columns
    const FALL_ROW_STAGGER = 12;  // ms between rows, bottom first
    const FALL_GRAVITY = 2600;    // px/s²
    const FALL_SPIN = 2.2;        // radians per second
    const FALL_FADE = 0.7;        // seconds to fade out once falling
    const GAME_OVER_PANEL_MS = 1100; // the breach panel opens once the board has fallen
    const GAME_OVER_PANEL_MS_STILL = 450;

    // Sets up the canvas for a falling tile; returns true (caller restores), false, or 'gone'
    function applyTileFall(r, c, x, y) {
        if (!gameOverFallAt || !isGameOver) return false;
        const t = (performance.now() - gameOverFallAt - c * FALL_COL_STAGGER - (ROWS - 1 - r) * FALL_ROW_STAGGER) / 1000;
        if (t <= 0) return false;
        const alpha = 1 - t / FALL_FADE;
        if (alpha <= 0) return 'gone';
        const dir = c % 2 ? 1 : -1;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y + 0.5 * FALL_GRAVITY * t * t);
        ctx.rotate(dir * FALL_SPIN * t);
        ctx.translate(-x, -y);
        return true;
    }

    // Static block: a fixed, unbreakable 0 wall
    function drawStaticBlock(x, y, w, h) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 8);
        ctx.fillStyle = '#232838';
        ctx.fill();
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 4;
        for (let k = -w; k < w; k += 11) {
            ctx.beginPath();
            ctx.moveTo(k, h / 2);
            ctx.lineTo(k + h, -h / 2);
            ctx.stroke();
        }
        ctx.restore();
        ctx.beginPath(); // the hatch lines replaced the path; outline the block again
        ctx.roundRect(-w / 2, -h / 2, w, h, 8);
        ctx.strokeStyle = '#5a6380';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#8a93b0';
        ctx.font = `900 ${Math.round(cellW * 0.3)}px 'Lato', 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('0', 0, 1);
        ctx.restore();
    }

    // Webbed orb: silver threads round the edge (the number stays readable) and strands to the corners
    function drawWebOverlay(x, y, w, h) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = 'rgba(225, 233, 255, 0.7)';
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        const rx = w / 2;
        const ry = h / 2;
        const ang = (i) => i * Math.PI / 3 + Math.PI / 6;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            ctx.moveTo(Math.cos(ang(i)) * rx * 0.5, Math.sin(ang(i)) * ry * 0.5);
            ctx.lineTo(Math.cos(ang(i)) * rx * 0.98, Math.sin(ang(i)) * ry * 0.98);
        }
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
            ctx.moveTo(sx * rx * 0.72, sy * ry * 0.72);
            ctx.lineTo(sx * (rx + 3), sy * (ry + 3));
        });
        ctx.stroke();
        [0.62, 0.9].forEach((k) => {
            ctx.beginPath();
            for (let i = 0; i <= 6; i++) {
                const px = Math.cos(ang(i)) * rx * k;
                const py = Math.sin(ang(i)) * ry * k;
                if (i) ctx.quadraticCurveTo(Math.cos(ang(i - 0.5)) * rx * k * 0.86, Math.sin(ang(i - 0.5)) * ry * k * 0.86, px, py);
                else ctx.moveTo(px, py);
            }
            ctx.stroke();
        });
        ctx.restore();
    }

    // Entangled orb: a halo in its pair's colour
    function drawLinkHalo(x, y, w, h, link) {
        const color = linkColor(link);
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 260 + link);
        ctx.save();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.55 + pulse * 0.35;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 + pulse * 6;
        ctx.beginPath();
        ctx.roundRect(x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, 14);
        ctx.stroke();
        ctx.restore();
    }

    // A thin dashed arc between each entangled pair
    function drawEntangleLinks() {
        const ends = {};
        forEachTile((t, r, c) => {
            if (t.type !== 'number' || !t.link) return;
            (ends[t.link] = ends[t.link] || []).push({
                x: boardOffsetX + c * cellW + cellW / 2 + (t.animX || 0),
                y: boardOffsetY + r * cellH + cellH / 2 + (t.animY || 0)
            });
        });
        const now = performance.now();
        Object.keys(ends).forEach((link) => {
            const [a, b] = ends[link];
            if (!a || !b) return;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const bend = Math.min(cellW * 0.8, len * 0.25);
            ctx.save();
            ctx.strokeStyle = linkColor(Number(link));
            ctx.globalAlpha = 0.35 + 0.2 * Math.sin(now / 300 + Number(link));
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.lineDashOffset = -now / 40;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.quadraticCurveTo(mx - (dy / len) * bend, my + (dx / len) * bend, b.x, b.y);
            ctx.stroke();
            ctx.restore();
        });
    }

    // Sealed column: a faint blue field down the column, under the tiles
    function drawSealedColumns() {
        if (!sealedCols.length) return;
        const t = performance.now() / 1000;
        sealedCols.forEach((col) => {
            const x = boardOffsetX + col * cellW;
            ctx.save();
            const grad = ctx.createLinearGradient(0, boardOffsetY, 0, boardOffsetY + cellH * ROWS);
            grad.addColorStop(0, `rgba(79, 140, 255, ${0.16 + 0.05 * Math.sin(t * 2 + col)})`);
            grad.addColorStop(1, 'rgba(79, 140, 255, 0.04)');
            ctx.fillStyle = grad;
            ctx.fillRect(x + 1, boardOffsetY, cellW - 2, cellH * ROWS);
            ctx.strokeStyle = 'rgba(127, 176, 255, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 7]);
            ctx.lineDashOffset = -t * 18;
            ctx.beginPath();
            ctx.moveTo(x + 2, boardOffsetY);
            ctx.lineTo(x + 2, boardOffsetY + cellH * ROWS);
            ctx.moveTo(x + cellW - 2, boardOffsetY);
            ctx.lineTo(x + cellW - 2, boardOffsetY + cellH * ROWS);
            ctx.stroke();
            ctx.restore();
        });
    }

    // The magnetic clamp at the red line (two bars and a lock), and its opening slide
    function drawSealClamps() {
        const now = performance.now();
        sealOpenings = sealOpenings.filter((o) => now - o.at < 600);
        const clamp = (col, open) => {
            const x = boardOffsetX + col * cellW;
            const y = boardOffsetY + cellH * 0.5;
            const slide = open * cellW * 0.6;
            ctx.save();
            ctx.globalAlpha = 1 - open;
            ctx.fillStyle = '#4f8cff';
            ctx.shadowColor = '#4f8cff';
            ctx.shadowBlur = 10;
            [-1, 1].forEach((side) => {
                ctx.beginPath();
                ctx.roundRect(x + 5 + side * slide, y + side * cellH * 0.16 - 3, cellW - 10, 6, 3);
                ctx.fill();
            });
            // Lock glyph
            ctx.shadowBlur = 0;
            const s = Math.min(cellW, cellH) * 0.14;
            ctx.fillStyle = '#0d1220';
            ctx.strokeStyle = '#cfe0ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x + cellW / 2 - s, y - s * 0.4, s * 2, s * 1.5, 3);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + cellW / 2, y - s * 0.4, s * 0.65, Math.PI, 0);
            ctx.stroke();
            ctx.restore();
        };
        sealedCols.forEach((col) => clamp(col, 0));
        sealOpenings.forEach((o) => clamp(o.col, (now - o.at) / 600));
    }

    // Catch the Stars: gold star in each uncaught star cell, under the tiles
    function drawStarCells() {
        if (!starCells.length) return;
        const t = performance.now() / 1000;
        starCells.forEach((st, i) => {
            if (st.caught || (grid[st.r] && grid[st.r][st.c])) return;
            const x = boardOffsetX + st.c * cellW + cellW / 2;
            const y = boardOffsetY + st.r * cellH + cellH / 2;
            const pulse = 0.75 + 0.25 * Math.sin(t * 3 + i);
            ctx.save();
            ctx.globalAlpha = 0.9 * pulse;
            ctx.fillStyle = 'rgba(249, 212, 35, 0.08)';
            ctx.beginPath();
            ctx.roundRect(x - cellW / 2 + 5, y - cellH / 2 + 5, cellW - 10, cellH - 10, 12);
            ctx.fill();
            ctx.shadowColor = '#f9d423';
            ctx.shadowBlur = 14 * pulse;
            ctx.fillStyle = '#f9d423';
            ctx.font = `900 ${Math.round(cellW * 0.42)}px 'Lato', 'Inter', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', x, y + 1);
            ctx.restore();
        });
    }

    // Riser: upward streaks under the orb while it climbs (fade out ~0.7s after the move)
    const RISER_TRAIL_MS = 700;
    function drawRiserTrail(x, y, w, h, row, climbAt) {
        const age = climbAt ? performance.now() - climbAt : Infinity;
        if (age >= RISER_TRAIL_MS) return;
        const fade = 1 - age / RISER_TRAIL_MS;
        const t = performance.now() / 1000;
        ctx.save();
        ctx.strokeStyle = row <= 1 ? '#ff4e50' : '#f9d423';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        [-0.25, 0, 0.25].forEach((k, i) => {
            const phase = (t * 2.4 + i * 0.33) % 1;
            ctx.globalAlpha = 0.6 * fade * (1 - phase * 0.6);
            const sx = x + k * w;
            const top = y + h / 2 + 2;
            ctx.beginPath();
            ctx.moveTo(sx, top);
            ctx.lineTo(sx, top + cellH * (0.25 + 0.2 * fade) - phase * cellH * 0.1);
            ctx.stroke();
        });
        ctx.restore();
    }

    // Riser: glowing ▲ chevron on the top edge plus a rows-left badge in the top-right
    // corner (rows before the red line); both turn red and pulse at 1
    function drawRiserCap(x, y, w, h, row) {
        const danger = row <= 1;
        const now = performance.now();
        const pulse = danger ? 0.6 + 0.4 * Math.sin(now / 120) : 0.85 + 0.15 * Math.sin(now / 330);
        const color = danger ? '#ff4e50' : '#f9d423';
        const top = y - h / 2;
        const cw = Math.max(9, w * 0.2);
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(x - cw, top + 3);
        ctx.lineTo(x, top - cw * 0.85);
        ctx.lineTo(x + cw, top + 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        const br = Math.max(8, Math.round(cellW * 0.16));
        const bx = x + w / 2 - br * 0.55;
        const by = top + br * 0.55;
        ctx.save();
        ctx.globalAlpha = danger ? pulse : 1;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(10, 14, 24, 0.9)';
        ctx.stroke();
        ctx.fillStyle = danger ? '#ffffff' : '#1a1302';
        ctx.font = `900 ${Math.round(br * 1.15)}px 'Lato', 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(row), bx, by + 1);
        ctx.restore();
    }

    // Null Core boss: a 2×2 red core with its HP and an HP ring
    function drawNullCore(x, y, w, h, core) {
        const radius = Math.min(w, h) / 2;
        if (!core || !(radius > 10)) return; // board not laid out yet
        const t = performance.now() / 1000;
        core.flash = Math.max(0, (core.flash || 0) * 0.92 - 0.005);
        ctx.save();
        ctx.translate(x, y);
        const grad = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
        grad.addColorStop(0, '#3a0d16');
        grad.addColorStop(1, '#12060a');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#ff4e50';
        ctx.shadowBlur = 18 + 8 * Math.sin(t * 2.5) + core.flash * 20;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // HP ring
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(255, 78, 80, 0.18)';
        ctx.beginPath();
        ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ff4e50';
        ctx.beginPath();
        ctx.arc(0, 0, radius - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (core.hp / Math.max(1, core.maxHp)));
        ctx.stroke();
        if (core.flash > 0.05) {
            ctx.fillStyle = `rgba(255, 255, 255, ${core.flash * 0.35})`;
            ctx.beginPath();
            ctx.arc(0, 0, radius - 8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#ffe3e4';
        ctx.font = `900 ${Math.round(radius * 0.62)}px 'Lato', 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        // Centre the HP on the digits' real height (the objective bar names the core)
        ctx.textBaseline = 'alphabetic';
        const hpText = String(core.hp);
        const m = ctx.measureText(hpText);
        ctx.fillText(hpText, 0, (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
        ctx.restore();
    }

    function drawMergeAndCollapseAnimations() {
        // 1. Draw Active Synthesis Merges
        for (const anim of activeMergeAnimations) {
            const t = anim.progress;
            const { lock, move, ease } = pairPhases(t);
            const curAX = anim.xA + (anim.xB - anim.xA) * ease;
            const curAY = anim.yA + (anim.yB - anim.yA) * ease;

            // Lock-on: both orbs pulse in place; then A glides into B, shrinking only at the end
            const lockPulse = Math.sin(lock * Math.PI) * 0.1;
            const scaleA = move > 0 ? Math.max(0.6, 1.0 - Math.max(0, ease - 0.55) * 0.9) : 1.0 + lockPulse;
            const scaleB = 1.0 + lockPulse + Math.sin(move * Math.PI) * 0.2;
            const ringAlpha = move > 0 ? Math.max(0, 1 - move * 1.6) : lock;
            const ringColor = anim.fusedVal > 0 ? '#00f2fe' : '#ff4e50';
            drawPairLockRing(anim.xA, anim.yA, (cellW - 2) * (1 + lockPulse), ringColor, move > 0 ? 0 : ringAlpha);
            drawPairLockRing(anim.xB, anim.yB, (cellW - 2) * (1 + lockPulse), ringColor, ringAlpha);

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
            ctx.globalAlpha = 0.4 + lock * 0.6;
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
            drawTileGraphic(anim.xB, anim.yB, twB, thB, labelB, flavorB, 0.15 + 0.35 * Math.sin(t * Math.PI));

            // Draw moving Tile A (sliding with luminous wake)
            const twA = (cellW - 8) * scaleA;
            const thA = (cellH - 8) * scaleA;
            drawTileGraphic(curAX, curAY, twA, thA, labelA, flavorA, 0.15 + lock * 0.3);
            ctx.restore();

            // Spawn fusion spark trail while moving
            if (move > 0 && Math.random() < 0.65) {
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
            const { lock, move, ease } = pairPhases(t);
            const curAX = anim.xA + (anim.midX - anim.xA) * ease;
            const curAY = anim.yA + (anim.midY - anim.yA) * ease;
            const curBX = anim.xB + (anim.midX - anim.xB) * ease;
            const curBY = anim.yB + (anim.midY - anim.yB) * ease;

            // Lock-on pulse, then both glide together and only shrink in the last stretch
            const lockPulse = Math.sin(lock * Math.PI) * 0.1;
            const scale = move > 0 ? Math.max(0.18, 1.0 - Math.max(0, ease - 0.5) * 1.64) : 1.0 + lockPulse;
            const ringAlpha = move > 0 ? Math.max(0, 1 - move * 1.8) : lock;
            drawPairLockRing(anim.xA, anim.yA, (cellW - 2) * (1 + lockPulse), anim.tileA.value > 0 ? '#00f2fe' : '#ff4e50', ringAlpha);
            drawPairLockRing(anim.xB, anim.yB, (cellW - 2) * (1 + lockPulse), anim.tileB.value > 0 ? '#00f2fe' : '#ff4e50', ringAlpha);
            const flavorA = anim.tileA.value > 0 ? 'pos' : 'neg';
            const flavorB = anim.tileB.value > 0 ? 'pos' : 'neg';
            const labelA = anim.tileA.value > 0 ? `+${anim.tileA.value}` : `${anim.tileA.value}`;
            const labelB = anim.tileB.value > 0 ? `+${anim.tileB.value}` : `${anim.tileB.value}`;

            // Singularity Accretion Vortex at midpoint
            ctx.save();
            const vortexR = (cellW * 0.44) * Math.sin(move * Math.PI * 0.95);
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
            drawTileGraphic(curAX, curAY, twA, thA, labelA, flavorA, 0.2 + lock * 0.2 + move * 0.6);

            const twB = (cellW - 8) * scale;
            const thB = (cellH - 8) * scale;
            drawTileGraphic(curBX, curBY, twB, thB, labelB, flavorB, 0.2 + lock * 0.2 + move * 0.6);
            ctx.restore();

            // Inward spiral suction sparks while the pair is moving
            if (move > 0 && Math.random() < 0.7) {
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

    let powerUpPath2D = null;

    function powerUpAreaCells(area) {
        // 1 = blast cell, 0.7 = outer crater cell (Nova's centre burns brightest)
        if (area === 'column') return { cols: 1, cells: [1, 1, 1] };
        return { cols: 3, cells: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (area === 'crater' && i !== 4 ? 0.7 : 1)) };
    }

    // Canvas power-up orb, centred on the current origin
    function drawPowerUpOrb(w, h, look, flash, isGhost) {
        if (!powerUpPath2D) {
            powerUpPath2D = {
                vortex: new Path2D(POWER_UP_PATHS.vortex),
                nova: new Path2D(POWER_UP_PATHS.nova),
                nukeBlade: new Path2D(POWER_UP_PATHS.nukeBlade)
            };
        }
        const size = Math.min(w, h);
        const k = size / 58;
        const radius = size / 2 - 1;
        if (isGhost) ctx.globalAlpha *= 0.6;

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        const body = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        look.body.forEach(([at, c]) => body.addColorStop(at, c));
        ctx.fillStyle = body;
        ctx.fill();
        if (flash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
            ctx.fill();
        }
        ctx.strokeStyle = look.rim;
        ctx.lineWidth = Math.max(2, 2.5 * k);
        if (isGhost) ctx.setLineDash([4, 4]);
        ctx.shadowColor = look.glow;
        ctx.shadowBlur = 16 * k;
        ctx.stroke();
        ctx.setLineDash([]);

        // Icon
        const iconPx = size * 0.5;
        ctx.save();
        ctx.translate(-iconPx / 2, -iconPx / 2);
        ctx.scale(iconPx / 24, iconPx / 24);
        ctx.shadowColor = look.glow;
        ctx.shadowBlur = 4 * k;
        ctx.fillStyle = look.ink;
        ctx.strokeStyle = look.ink;
        if (look.icon === 'vortex') {
            ctx.lineWidth = 2.4;
            ctx.lineCap = 'round';
            ctx.stroke(powerUpPath2D.vortex);
        } else if (look.icon === 'nova') {
            ctx.fill(powerUpPath2D.nova);
            ctx.beginPath(); ctx.arc(19, 5, 1.4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, 19, 1.1, 0, Math.PI * 2); ctx.fill();
        } else {
            for (let i = 0; i < 3; i++) {
                ctx.save();
                ctx.translate(12, 12);
                ctx.rotate((i * 2 * Math.PI) / 3);
                ctx.translate(-12, -12);
                ctx.fill(powerUpPath2D.nukeBlade);
                ctx.restore();
            }
            ctx.beginPath(); ctx.arc(12, 12, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();

        // Blast-area badge, bottom right
        const { cols, cells } = powerUpAreaCells(look.area);
        const rows = cells.length / cols;
        const cell = Math.max(3, 3.6 * k);
        const pad = 3 * k;
        const bw = pad * 2 + cols * cell + (cols - 1);
        const bh = pad * 2 + rows * cell + (rows - 1);
        const bx = size / 2 - size * 0.02 - bw;
        const by = size / 2 - size * 0.02 - bh;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 6 * k);
        ctx.fillStyle = '#0b0f1a';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = look.rim;
        ctx.stroke();
        ctx.fillStyle = look.rim;
        cells.forEach((o, i) => {
            ctx.globalAlpha = (isGhost ? 0.6 : 1) * o;
            ctx.fillRect(bx + pad + (i % cols) * (cell + 1), by + pad + Math.floor(i / cols) * (cell + 1), cell, cell);
        });
    }

    function drawTileGraphic(x, y, w, h, label, flavor, flash = 0, isGhost = false) {
        ctx.save();
        ctx.translate(x, y);

        if (POWER_UP_LOOK[flavor]) {
            drawPowerUpOrb(w, h, POWER_UP_LOOK[flavor], flash, isGhost);
            ctx.restore();
            return;
        }

        const r = 12; // Corner radius
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, r);
        let numberShadow = false; // tier orbs lift the number off their brighter body

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
            const tier = (flavor === 'pos' || flavor === 'neg') ? tierFor(Math.abs(parseInt(label, 10)) || 0) : null;
            if (tier) {
                drawTierBody(w, h, flavor === 'pos', tier);
                numberShadow = true;
            } else if (flavor === 'pos') {
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
        if (numberShadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 1;
        }
        ctx.fillText(label, 0, 1);

        ctx.restore();
    }

    function drawDarkMatterTile(x, y, w, h, hp, flash, dense = false) {
        ctx.save();
        ctx.translate(x, y);

        const r = 10;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, r);
        ctx.fillStyle = dense ? '#10121d' : '#161a29';
        ctx.fill();

        ctx.strokeStyle = hp > 1 ? (dense ? '#6b5fa0' : '#3a445d') : '#e06c75';
        ctx.lineWidth = dense ? 3 : 2;
        ctx.stroke();

        // Dense core: one armour plate per HP left (top, right, bottom, left); each hit knocks one off
        if (dense && hp > 1) {
            ctx.save();
            ctx.fillStyle = '#9a8ad6';
            const t = Math.max(3, Math.min(w, h) * 0.08);
            const len = Math.min(w, h) * 0.42;
            [[0, -h / 2 + t * 1.2, len, t], [w / 2 - t * 1.2, 0, t, len], [0, h / 2 - t * 1.2, len, t], [-w / 2 + t * 1.2, 0, t, len]]
                .slice(0, Math.min(4, hp))
                .forEach(([px, py, pw, ph]) => {
                    ctx.beginPath();
                    ctx.roundRect(px - pw / 2, py - ph / 2, pw, ph, 2);
                    ctx.fill();
                });
            ctx.restore();
            ctx.beginPath();
            ctx.roundRect(-w / 2, -h / 2, w, h, r); // the plates replaced the path; keep the flash fill below right
        }

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

        // Core icon: a diamond shell with a glowing nucleus (red when cracked)
        const s = Math.min(w, h) * 0.24;
        const iconColor = hp > 1 ? '#7a889b' : '#e06c75';
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = iconColor;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.42);
        ctx.lineTo(s * 0.42, 0);
        ctx.lineTo(0, s * 0.42);
        ctx.lineTo(-s * 0.42, 0);
        ctx.closePath();
        ctx.fill();

        // Last remaining core of a clear-dark-matter objective: pulsing gold target brackets
        if (lastCoreHighlight) {
            const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 160);
            const inset = -3 - pulse * 3;
            const bx = -w / 2 + inset, by = -h / 2 + inset;
            const bw = w - inset * 2, bh = h - inset * 2;
            const arm = Math.min(w, h) * 0.26;
            ctx.strokeStyle = `rgba(249, 212, 35, ${0.65 + pulse * 0.35})`;
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(bx, by + arm); ctx.lineTo(bx, by); ctx.lineTo(bx + arm, by);
            ctx.moveTo(bx + bw - arm, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + arm);
            ctx.moveTo(bx + bw, by + bh - arm); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - arm, by + bh);
            ctx.moveTo(bx + arm, by + bh); ctx.lineTo(bx, by + bh); ctx.lineTo(bx, by + bh - arm);
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawLauncher() {
        if (isGameOver || MAIN_GAMEPLAY) return;
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
            const beamAlpha = Math.max(0, beam.alpha);
            ctx.globalCompositeOperation = 'lighter';

            if (beam.type === 'horizontal') {
                const by = boardOffsetY + beam.row * cellH + cellH / 2;
                ctx.fillStyle = beam.color || '#00f2fe';
                ctx.globalAlpha = beamAlpha * 0.25;
                ctx.fillRect(0, by - beam.width * 1.4, w, beam.width * 2.8);
                ctx.globalAlpha = beamAlpha;
                ctx.fillRect(0, by - beam.width / 2, w, beam.width);

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, by - beam.width / 4, w, beam.width / 2);
            } else if (beam.type === 'vertical') {
                const bx = boardOffsetX + beam.col * cellW + cellW / 2;
                ctx.fillStyle = beam.color || '#00f2fe';
                ctx.globalAlpha = beamAlpha * 0.25;
                ctx.fillRect(bx - beam.width * 1.4, boardOffsetY, beam.width * 2.8, h - boardOffsetY);
                ctx.globalAlpha = beamAlpha;
                ctx.fillRect(bx - beam.width / 2, boardOffsetY, beam.width, h - boardOffsetY);

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(bx - beam.width / 4, boardOffsetY, beam.width / 2, h - boardOffsetY);
            }
            ctx.restore();
        }

        // 2. Shockwaves: a soft colored band under a thin white ring, added light instead of blur
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const sw of shockwaves) {
            const a = Math.max(0, sw.alpha);
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.globalAlpha = a * 0.35;
            ctx.strokeStyle = sw.color || '#ffffff';
            ctx.lineWidth = 10;
            ctx.stroke();
            ctx.globalAlpha = a;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }
        ctx.restore();

        // 3. Sparks (streaks along their motion) and embers / trail dots (glow sprites)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        for (const sp of particles) {
            ctx.globalAlpha = Math.max(0, Math.min(1, sp.alpha));
            const size = sp.size || 2.5;
            if (sp.kind === 'spark') {
                const tail = SPARK_TAIL_FRAMES;
                ctx.strokeStyle = sp.color;
                ctx.lineWidth = size * 0.9;
                ctx.beginPath();
                ctx.moveTo(sp.x, sp.y);
                ctx.lineTo(sp.x - sp.vx * tail, sp.y - sp.vy * tail);
                ctx.stroke();
            } else {
                const r = size * 2.6;
                ctx.drawImage(glowSprite(sp.color), sp.x - r, sp.y - r, r * 2, r * 2);
            }
        }
        ctx.restore();

        // 4. Screen Flash: a glow spreading from the blast, brightest at its centre
        if (screenFlash > 0) {
            const fx = screenFlashX != null ? screenFlashX : boardOffsetX + (COLS * cellW) / 2;
            const fy = screenFlashY != null ? screenFlashY : boardOffsetY + (ROWS * cellH) / 2;
            const reach = Math.hypot(w, h) * FLASH_REACH;
            const color = screenFlashColor || '#ffffff';
            const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, reach);
            grad.addColorStop(0, tierRgba(color, screenFlash));
            grad.addColorStop(0.35, tierRgba(color, screenFlash * 0.45));
            grad.addColorStop(1, tierRgba(color, 0));
            ctx.save();
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        }
    }

    const FLOAT_TEXT_BASE_PX = 12;
    const FLOAT_TEXT_SCALE_SPREAD = 0.4; // compresses the 1.0–1.65 scales to roughly 12–15px
    const FLOAT_TEXT_LIFE = 0.9;   // seconds on screen
    const FLOAT_TEXT_RISE = 28;    // px risen over its life, eased out
    const FLOAT_TEXT_HOLD = 0.55;  // share of its life at full opacity before fading
    const FLOAT_TEXT_POP = 0.14;   // seconds for the pop-in overshoot
    const COMBO_SHOW = 0.9;        // seconds the counter stays after its last bump
    const COMBO_FADE = 0.3;
    const COMBO_PUNCH_DECAY = 9;   // how fast the bump punch settles (per second)
    const COMBO_FOLLOW = 14;       // how fast it glides to the newest blast (per second)

    // ---------- Popup icons: drawn in place of emoji in board texts ----------
    // [svg path in a 24px box, fill or stroke]
    const POPUP_ICONS = {
        bolt: ['M13 2 4 14h7l-1 8 9-12h-7z', 'fill'],
        vortex: ['M12 12a1.6 1.6 0 1 1 1.6 1.6M12 12a4.2 4.2 0 1 0 4.2-4.2M12 12a7 7 0 1 1-7-7', 'stroke'],
        nova: ['M12 2l2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3z', 'fill'],
        blast: ['M12 1.5l2.1 5.4 4.9-3.3-1.4 5.7 5.9.5-4.6 3.7 4.1 4.3-5.9.3.6 5.9-4.6-3.6-3.4 4.9-1.2-5.8-5.6 1.9 2.7-5.3-5.5-2.3 5.6-1.9-1.5-5.7 5.1 3z', 'fill'],
        lock: ['M7.5 11V8a4.5 4.5 0 0 1 9 0v3M5 11h14v10H5z', 'stroke'],
        unlock: ['M7.5 11V8a4.5 4.5 0 0 1 8.7-1.6M5 11h14v10H5z', 'stroke'],
        flame: ['M12 2c.8 3.6 5.5 5.6 5.5 11.2a5.5 5.5 0 0 1-11 0c0-2.8 1.6-4.6 2.6-6.4.2 1.9 1 3 2.1 3.2-.3-2.8-.1-5.6.8-8z', 'fill'],
        check: ['M4 12.5 9.5 18 20 6', 'stroke'],
        arrow: ['M4 12h15M13 6l6 6-6 6', 'stroke']
    };
    const POPUP_ICON_FOR = { '⚡': 'bolt', '⚫': 'vortex', '\u{1F31F}': 'nova', '✨': 'nova', '\u{1F4A5}': 'blast',
        '\u{1F512}': 'lock', '\u{1F513}': 'unlock', '\u{1F525}': 'flame', '✓': 'check', '➜': 'arrow' };
    const POPUP_EMOJI = /[☀-➿⭐\u{1F300}-\u{1FAFF}]️?/gu;
    const popupPaths = {};

    // '⚡ SHOCKWAVE!' -> { icon: 'bolt', text: 'SHOCKWAVE!' }; other emoji in the text are dropped
    function splitPopupIcon(raw) {
        const m = String(raw).match(/^\s*([☀-➿⭐\u{1F300}-\u{1FAFF}])️?\s*/u);
        const icon = m ? (POPUP_ICON_FOR[m[1]] || null) : null;
        const text = (m ? raw.slice(m[0].length) : String(raw)).replace(/➜/g, '→')
            .replace(POPUP_EMOJI, '').replace(/\s{2,}/g, ' ').trim();
        return { icon, text };
    }

    function drawPopupIcon(name, x, y, size) {
        const def = POPUP_ICONS[name];
        if (!def) return;
        if (!popupPaths[name]) popupPaths[name] = new Path2D(def[0]);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 24, size / 24);
        if (def[1] === 'fill') {
            ctx.fill(popupPaths[name]);
        } else {
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 2.6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke(popupPaths[name]);
        }
        ctx.restore();
    }

    // Width of a split popup at the current font, icon included
    function popupWidth(p, fontPx) {
        return ctx.measureText(p.text).width + (p.icon ? fontPx * 1.2 : 0);
    }

    // fillText for centred popup text: draws an icon for a leading emoji instead of the emoji
    function fillPopupText(raw, x, y, split) {
        const p = split || splitPopupIcon(raw);
        if (!p.icon) { ctx.fillText(p.text, x, y); return; }
        const fontPx = parseFloat((ctx.font.match(/(\d+(?:\.\d+)?)px/) || [0, 12])[1]);
        const iconSize = fontPx * 0.95;
        const total = popupWidth(p, fontPx);
        const left = x - total / 2;
        drawPopupIcon(p.icon, left, y - fontPx * 0.36 - iconSize / 2, iconSize);
        const align = ctx.textAlign;
        ctx.textAlign = 'left';
        ctx.fillText(p.text, left + fontPx * 1.2, y);
        ctx.textAlign = align;
    }

    function drawFloatingTexts() {
        const boardLeft = boardOffsetX;
        const boardW = COLS * cellW;
        const maxW = boardW - 16;
        for (const ft of floatingTexts) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.alpha);
            let size = FLOAT_TEXT_BASE_PX * (1 + ((ft.scale || 1) - 1) * FLOAT_TEXT_SCALE_SPREAD);
            ctx.font = `900 ${size}px 'Lato', 'Inter', sans-serif`;
            // Shrink long banners to fit inside the board instead of clipping at the edge
            if (!ft.split) ft.split = splitPopupIcon(ft.text);
            let w = popupWidth(ft.split, size);
            if (w > maxW && w > 0) {
                size = Math.max(9, size * (maxW / w));
                ctx.font = `900 ${size}px 'Lato', 'Inter', sans-serif`;
                w = popupWidth(ft.split, size);
            }
            const half = w / 2;
            const x = boardW > 0 ? Math.min(Math.max(ft.x, boardLeft + 8 + half), boardLeft + boardW - 8 - half) : ft.x;
            const pop = popScale(ft.age || 0);
            ctx.translate(x, ft.y);
            ctx.scale(pop, pop);
            ctx.fillStyle = ft.color;
            ctx.textAlign = 'center';
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 6;
            fillPopupText(ft.text, 0, 0, ft.split);
            ctx.restore();
        }
    }

    // Overshoot pop: 0.6 → ~1.15 → 1 over the first FLOAT_TEXT_POP seconds
    function popScale(age) {
        const t = Math.min(1, age / FLOAT_TEXT_POP);
        const c = 2.2; // back-ease overshoot strength
        const e = 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
        return 0.6 + 0.4 * e;
    }

    // Combo color climbs with the chain: cyan, then gold, then purple
    function comboColor(n) {
        return n >= 6 ? '#c471ed' : n >= 4 ? '#ffd700' : '#00f2fe';
    }

    function bumpComboCounter(n, x, y) {
        const ty = y - cellH * 0.95; // sits above the blast so it doesn't cover the equation
        if (!comboCounter) comboCounter = { n, x, y: ty, tx: x, ty, age: 0, punch: 1 };
        const cc = comboCounter;
        cc.n = Math.max(cc.n, n);
        cc.tx = x;
        cc.ty = ty;
        cc.age = 0;
        cc.punch = 1;
    }

    function drawComboCounter() {
        const cc = comboCounter;
        if (!cc) return;
        const alpha = cc.age < COMBO_SHOW ? 1 : Math.max(0, 1 - (cc.age - COMBO_SHOW) / COMBO_FADE);
        const size = Math.min(34, 22 + (cc.n - 2) * 3);
        const scale = 1 + 0.45 * cc.punch;
        const color = comboColor(cc.n);
        const boardW = COLS * cellW;
        const half = size * 1.2;
        const x = Math.min(Math.max(cc.x, boardOffsetX + half), boardOffsetX + boardW - half);
        const y = Math.max(cc.y, boardOffsetY + size);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.textAlign = 'center';
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 + 10 * cc.punch;
        ctx.fillStyle = color;
        ctx.font = `900 ${size}px 'Lato', 'Inter', sans-serif`;
        ctx.fillText(`×${cc.n}`, 0, 0);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 9px 'Lato', 'Inter', sans-serif`;
        ctx.fillText('COMBO', 0, 11);
        ctx.restore();
    }

    // Particle behaviour by kind; drag and gravity are per 60fps frame
    const PARTICLE_KINDS = {
        spark: { drag: 0.92, gravity: 0.18 },   // fast streaks that burst out then hang
        ember: { drag: 0.97, gravity: -0.025 }, // slow glowing motes that drift up
        dot: { drag: 1, gravity: 0.25 }         // trail sparks from merges and collapses
    };
    const MAX_PARTICLES = 400;
    const SPARK_TAIL_FRAMES = 2.4; // streak length in frames of motion
    const EMBER_SHARE = 0.25;      // share of each burst that becomes slow embers

    // One soft radial glow per color, drawn once and reused instead of shadowBlur
    const glowSprites = new Map();
    function glowSprite(color) {
        let spr = glowSprites.get(color);
        if (spr) return spr;
        const size = 64;
        spr = document.createElement('canvas');
        spr.width = spr.height = size;
        const g = spr.getContext('2d');
        // The canvas normalises any CSS colour (#888, names, rgb()) to #rrggbb for opaque ones
        g.fillStyle = color;
        const hex = /^#[0-9a-f]{6}$/i.test(g.fillStyle) ? g.fillStyle : '#ffffff';
        const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.18, hex);
        grad.addColorStop(0.45, tierRgba(hex, 0.35));
        grad.addColorStop(1, tierRgba(hex, 0));
        g.fillStyle = grad;
        g.fillRect(0, 0, size, size);
        glowSprites.set(color, spr);
        return spr;
    }

    function createSparks(x, y, color, count = 12) {
        const embers = Math.round(count * EMBER_SHARE);
        for (let i = 0; i < count - embers; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 7;
            particles.push({
                kind: 'spark',
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1.5 + Math.random() * 2,
                color: color,
                alpha: 1,
                decay: 0.025 + Math.random() * 0.03
            });
        }
        for (let i = 0; i < embers; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.6 + Math.random() * 1.6;
            particles.push({
                kind: 'ember',
                x: x + (Math.random() - 0.5) * cellW * 0.4,
                y: y + (Math.random() - 0.5) * cellH * 0.4,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.4,
                size: 1.5 + Math.random() * 2,
                color: color,
                alpha: 0.9,
                decay: 0.009 + Math.random() * 0.008
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
            scale: scale,
            y0: y,
            age: 0
        });
    }

    // Danger state: once the tallest column is a row from the line the screen pulses red like a
    // heartbeat, a light haptic beats with it, and the music goes muffled. It clears as soon as
    // space opens.
    const DANGER_BY_HEADROOM = [1, 0.7]; // free rows above the tallest column: 0, 1 (2+ is safe)
    const DANGER_EASE = 4;           // per second, toward the target level
    const DANGER_BEAT_SLOW = 1.2;    // seconds between beats at the mild end
    const DANGER_BEAT_FAST = 0.75;   // seconds between beats at critical
    const DANGER_DUB_DELAY = 0.22;   // seconds from "lub" to "dub"
    const DANGER_VIGNETTE = 0.32;    // edge opacity at full danger, top of the beat

    function boardDangerTarget() {
        if (currentScreen !== 'game' || isPaused || isGameOver || !grid || !grid.length) return 0;
        return DANGER_BY_HEADROOM[minColumnHeadroom()] || 0;
    }

    function dangerBeatPeriod() {
        return DANGER_BEAT_SLOW + (DANGER_BEAT_FAST - DANGER_BEAT_SLOW) * dangerLevel;
    }

    // 0–1 heartbeat envelope: a strong "lub" then a softer "dub"
    function dangerPulse(now) {
        if (prefersReducedMotion()) return 0.5;
        const t = (now - dangerBeatAt) / 1000;
        const bump = (at, width) => Math.exp(-Math.pow((t - at) / width, 2));
        return Math.max(bump(0.03, 0.06), 0.6 * bump(DANGER_DUB_DELAY + 0.03, 0.06));
    }

    function updateDanger(dt, now) {
        const target = boardDangerTarget();
        dangerLevel += (target - dangerLevel) * (1 - Math.exp(-DANGER_EASE * dt));
        if (dangerLevel < 0.01 && target === 0) dangerLevel = 0;
        if (target > 0 && now - dangerBeatAt >= dangerBeatPeriod() * 1000) {
            dangerBeatAt = now;
            triggerHaptic('heartbeat');
            setTimeout(() => { if (boardDangerTarget() > 0) triggerHaptic('heartbeat-dub'); }, DANGER_DUB_DELAY * 1000);
        }
        // Only tell the audio when the level has moved enough to hear
        const q = Math.round(dangerLevel * 20) / 20;
        if (q !== dangerSentToAudio && sfx && sfx.setDanger) {
            dangerSentToAudio = q;
            sfx.setDanger(q);
        }
    }

    function drawDanger(w, h) {
        if (dangerLevel <= 0) return;
        const pulse = dangerPulse(performance.now());
        const a = dangerLevel * DANGER_VIGNETTE * (0.55 + 0.45 * pulse);
        ctx.save();
        const cx = w / 2, cy = h / 2;
        const vg = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.3, cx, cy, Math.hypot(w, h) * 0.6);
        vg.addColorStop(0, 'rgba(255, 30, 60, 0)');
        vg.addColorStop(1, `rgba(255, 30, 60, ${a.toFixed(3)})`);
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);
        // A glow hanging under the threshold line
        const lineY = boardOffsetY + cellH;
        const band = ctx.createLinearGradient(0, lineY, 0, lineY + cellH * 0.9);
        band.addColorStop(0, `rgba(255, 78, 80, ${(dangerLevel * (0.22 + 0.25 * pulse)).toFixed(3)})`);
        band.addColorStop(1, 'rgba(255, 78, 80, 0)');
        ctx.fillStyle = band;
        ctx.fillRect(boardOffsetX, lineY, COLS * cellW, cellH * 0.9);
        ctx.restore();
    }

    // Screen flash: old strengths (0.55–0.9) scale down and cap, so even Hyperspace stays gentle
    const FLASH_SCALE = 0.42;
    const FLASH_MAX = 0.35;
    const FLASH_REACH = 0.75;      // gradient radius as a share of the screen diagonal
    const FLASH_DECAY = 1.3;       // opacity per second (0.35 clears in about 0.27s)
    // A function declaration, so Settings can read it during startup before this line runs
    function systemReducedMotion() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    // Reduce Effects (Settings): follows the system's reduced-motion until the player picks
    function prefersReducedMotion() {
        const pick = career && career.settings ? career.settings.reduceEffects : null;
        return typeof pick === 'boolean' ? pick : systemReducedMotion();
    }

    // Keeps the switch and the page class (for CSS-only animations) in step with the setting
    function syncReduceEffects() {
        const on = prefersReducedMotion();
        if (settingReduceEffectsToggle) settingReduceEffectsToggle.checked = on;
        document.documentElement.classList.toggle('reduce-effects', on);
    }

    // origin (canvas px) is where the glow spreads from; default is the board centre
    function triggerScreenFlash(strength, color = '#ffffff', origin = null) {
        if (prefersReducedMotion()) return; // full-screen flashes are the effect people most often need gone
        screenFlash = Math.max(screenFlash, Math.min(FLASH_MAX, strength * FLASH_SCALE));
        screenFlashColor = color;
        screenFlashX = origin ? origin.x : null;
        screenFlashY = origin ? origin.y : null;
    }

    // Freeze-frame length per blast tier; only the big blasts get one
    const HIT_STOP_MS = [0, 0, 0, 60, 90, 120];

    const HIT_STOP_KEY = 'zeropoint_hit_stop';

    function isHitStopEnabled() {
        try { return localStorage.getItem(HIT_STOP_KEY) !== 'off'; } catch (e) { return true; }
    }
    function setHitStopEnabled(on) {
        try { localStorage.setItem(HIT_STOP_KEY, on ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
    }

    function triggerHitStop(ms) {
        if (ms <= 0 || !isHitStopEnabled() || prefersReducedMotion()) return;
        hitStopUntil = Math.max(hitStopUntil, performance.now() + ms);
    }

    // Trauma shake: hits add trauma, offset = max × trauma², moved by smooth noise
    const SHAKE_MAX_PX = 9;            // noise ceiling; with the shove the peak stays near 12px on a phone
    const SHAKE_MAX_ROT = 0.008;       // radians (~0.45°) at full trauma
    const SHAKE_TRAUMA_PER_PX = 1 / 20; // old magnitudes (3–32) map onto trauma
    const SHAKE_TRAUMA_DECAY = 1.6;    // trauma per second
    const SHAKE_KICK_PER_PX = 0.18;    // shove away from a blast per unit of magnitude
    const SHAKE_KICK_MAX_PX = 4;
    const SHAKE_KICK_RETURN = 16;      // how fast the shove springs back (per second)
    const shakeSeed = [Math.random() * 100, Math.random() * 100, Math.random() * 100];

    function shakeFactor() {
        if (!career || !career.settings) return 1;
        return career.settings.shake === 'off' ? 0 : career.settings.shake === 'mild' ? 0.4 : 1;
    }

    // origin (canvas px) shoves the board away from that point
    function triggerScreenShake(magnitude = 6, origin = null) {
        if (shakeFactor() === 0) return;
        shakeTrauma = Math.min(1, shakeTrauma + magnitude * SHAKE_TRAUMA_PER_PX);
        if (origin && cellW) {
            const cx = boardOffsetX + (COLS * cellW) / 2;
            const cy = boardOffsetY + (ROWS * cellH) / 2;
            let dx = cx - origin.x;
            let dy = cy - origin.y;
            const len = Math.hypot(dx, dy);
            // A blast near the middle pushes the board down, like a weight landing
            if (len < cellW * 0.5) { dx = 0; dy = 1; } else { dx /= len; dy /= len; }
            const kick = Math.min(SHAKE_KICK_MAX_PX, magnitude * SHAKE_KICK_PER_PX);
            shakeKickX += dx * kick;
            shakeKickY += dy * kick;
        }
    }

    // Ambient: orbs of 8 and up breathe a soft glow in their tier colour, each on its own phase
    const BREATH_RAINBOW = ['#ff4e50', '#f9d423', '#00f2fe', '#b46cff'];
    const BREATH_SPEED = 2.1;     // radians per second
    const BREATH_MIN = 0.16;
    const BREATH_RANGE = 0.16;

    function drawOrbBreath(x, y, tw, value, r, c) {
        const tier = Math.abs(value) >= 8 ? tierFor(Math.abs(value)) : null;
        if (!tier) return;
        const t = performance.now() / 1000;
        const color = tier.color === 'rainbow'
            ? BREATH_RAINBOW[Math.floor(t * 1.5 + r + c) % BREATH_RAINBOW.length]
            : tier.color;
        const wave = prefersReducedMotion() ? 0.5 : 0.5 + 0.5 * Math.sin(t * BREATH_SPEED + r * 1.7 + c * 2.3);
        const radius = tw * (0.85 + 0.12 * wave);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = BREATH_MIN + BREATH_RANGE * wave;
        ctx.drawImage(glowSprite(color), x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();
    }

    // Ambient: a sparse starfield behind the board drifts down slowly at three depths and
    // jolts away from big blasts (nearer stars move more), then settles
    const STAR_COUNT = 70;
    const STAR_DRIFT = 7;         // px/s for the nearest layer
    const STAR_JOLT_PX = 10;      // shove per tier above Cross Laser (tier 3 = 1 unit)
    const STAR_JOLT_RETURN = 5;   // per second

    function buildStarfield(w, h) {
        starfield = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            const z = [0.35, 0.6, 1][i % 3];
            starfield.push({ x: Math.random() * w, y: Math.random() * h, z, size: 0.5 + z * 0.9, phase: Math.random() * 6.3, w, h });
        }
    }

    function updateStarfield(dt) {
        if (!starfield) return;
        for (const st of starfield) {
            st.y += STAR_DRIFT * st.z * dt;
            if (st.y > st.h) { st.y -= st.h; st.x = Math.random() * st.w; }
        }
        const k = Math.exp(-STAR_JOLT_RETURN * dt);
        starJoltX *= k;
        starJoltY *= k;
    }

    function joltStarfield(x, y, tier) {
        if (prefersReducedMotion() || !cellW) return;
        const cx = boardOffsetX + (COLS * cellW) / 2;
        const cy = boardOffsetY + (ROWS * cellH) / 2;
        let dx = cx - x, dy = cy - y;
        const len = Math.hypot(dx, dy);
        if (len < 1) { dx = 0; dy = 1; } else { dx /= len; dy /= len; }
        const push = STAR_JOLT_PX * (tier - 2);
        starJoltX += dx * push;
        starJoltY += dy * push;
    }

    function drawStarfield(w, h) {
        if (!starfield || starfield.length && starfield[0].w !== w) buildStarfield(w, h);
        const t = performance.now() / 1000;
        const still = prefersReducedMotion();
        ctx.save();
        ctx.fillStyle = '#dfe6ff';
        for (const st of starfield) {
            const twinkle = still ? 0.7 : 0.55 + 0.45 * Math.sin(t * (0.8 + st.z) + st.phase);
            ctx.globalAlpha = (0.12 + 0.3 * st.z) * twinkle;
            const sx = ((st.x + starJoltX * st.z) % w + w) % w;
            const sy = ((st.y + starJoltY * st.z) % h + h) % h;
            ctx.fillRect(sx, sy, st.size, st.size);
        }
        ctx.restore();
    }

    // Overdrive: the board drops to slow motion and runs hot in colour, then snaps back.
    // Only the simulation slows (animations, particles, shake); input and turn logic don't.
    const SLOWMO_SCALE = 0.35;   // speed at the bottom of the dip
    const SLOWMO_HOLD = 0.2;     // seconds held at that speed
    const SLOWMO_RETURN = 0.3;   // seconds to ease back to full speed
    const SLOWMO_TINT_MS = 300;  // the colour shift lasts this long, then fades out in CSS

    function startSlowMo() {
        if (prefersReducedMotion()) return;
        slowMoAt = performance.now();
        retriggerClass(canvas, 'overdrive-shift');
        setTimeout(() => canvas.classList.remove('overdrive-shift'), SLOWMO_TINT_MS);
    }

    function slowMoScale(now) {
        if (!slowMoAt) return 1;
        const t = (now - slowMoAt) / 1000;
        if (t < SLOWMO_HOLD) return SLOWMO_SCALE;
        const p = (t - SLOWMO_HOLD) / SLOWMO_RETURN;
        if (p >= 1) { slowMoAt = 0; return 1; }
        return SLOWMO_SCALE + (1 - SLOWMO_SCALE) * (1 - Math.pow(1 - p, 2));
    }

    // "Can't do that": a quick side-to-side head-shake plus an error buzz, instead of a rumble
    const DENY_SHAKE_PX = 7;
    const DENY_SHAKE_HZ = 11;
    const DENY_SHAKE_MS = 360;

    function triggerDenyShake() {
        triggerHaptic('deny');
        if (shakeFactor() === 0) return;
        denyShakeAt = performance.now();
    }

    function denyShakeOffset() {
        if (!denyShakeAt) return 0;
        const t = (performance.now() - denyShakeAt) / DENY_SHAKE_MS;
        if (t >= 1) { denyShakeAt = 0; return 0; }
        return DENY_SHAKE_PX * Math.sin(t * DENY_SHAKE_HZ * (DENY_SHAKE_MS / 1000) * Math.PI * 2) * (1 - t) * (1 - t);
    }

    function applyScreenShake(w, h) {
        const factor = shakeFactor();
        const deny = denyShakeOffset() * factor;
        if (factor === 0 || (shakeTrauma <= 0 && !shakeKickX && !shakeKickY && !deny)) return;
        const t = performance.now() / 1000;
        // Two sines per axis at unrelated speeds read as smooth noise, not per-frame jitter
        const wave = (seed, a, b) => 0.6 * Math.sin(t * a + seed) + 0.4 * Math.sin(t * b + seed * 1.7);
        const amount = shakeTrauma * shakeTrauma * factor;
        const sx = SHAKE_MAX_PX * amount * wave(shakeSeed[0], 47, 83) + shakeKickX * factor + deny;
        const sy = SHAKE_MAX_PX * amount * wave(shakeSeed[1], 53, 91) + shakeKickY * factor;
        const rot = SHAKE_MAX_ROT * amount * wave(shakeSeed[2], 37, 71);
        ctx.translate(w / 2 + sx, h / 2 + sy);
        ctx.rotate(rot);
        ctx.translate(-w / 2, -h / 2);
    }

    // Blast strength by tier: light, medium, heavy, then the success buzz for the biggest
    const BLAST_HAPTICS = [null, 'pop', 'pulse', 'laser', 'supernova', 'supernova'];

    // Cascades fire many haptics at once: within the gap, only a stronger one gets through
    const HAPTIC_MIN_GAP_MS = 60;
    const HAPTIC_RANK = { tick: 0, swap: 0, tap: 0, light: 0, 'heartbeat-dub': 0, heartbeat: 1, merge: 1, pop: 1, drop: 2, pulse: 2, laser: 3, overdrive: 3, deny: 3, zero: 4, supernova: 4 };
    let lastHapticAt = -Infinity;
    let lastHapticRank = -1;

    function hapticAllowed(type) {
        const now = performance.now();
        const rank = HAPTIC_RANK[type] ?? 0;
        if (now - lastHapticAt < HAPTIC_MIN_GAP_MS && rank <= lastHapticRank) return false;
        lastHapticAt = now;
        lastHapticRank = rank;
        return true;
    }

    // Native & Web Haptics Controller (Unified Capacitor & Browser)
    function triggerHaptic(type = 'light') {
        if (!career || !career.settings || career.settings.vibration === false) return;
        if (!hapticAllowed(type)) return;

        // Capacitor Native Plugin support (@capacitor/haptics)
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
            try {
                const Haptics = window.Capacitor.Plugins.Haptics;
                switch (type) {
                    case 'tick':
                    case 'heartbeat-dub':
                        if (Haptics.selectionChanged) Haptics.selectionChanged();
                        return;
                    case 'heartbeat':
                        if (Haptics.impact) Haptics.impact({ style: 'LIGHT' });
                        return;
                    case 'drop':
                        if (Haptics.impact) Haptics.impact({ style: 'MEDIUM' });
                        return;
                    case 'merge':
                    case 'pop':
                        if (Haptics.impact) Haptics.impact({ style: 'LIGHT' });
                        return;
                    case 'pulse':
                        if (Haptics.impact) Haptics.impact({ style: 'MEDIUM' });
                        return;
                    case 'swap':
                        if (Haptics.selectionChanged) Haptics.selectionChanged();
                        return;
                    case 'zero':
                        if (Haptics.notification) Haptics.notification({ type: 'SUCCESS' });
                        else if (Haptics.impact) Haptics.impact({ style: 'HEAVY' });
                        return;
                    case 'laser':
                        if (Haptics.impact) Haptics.impact({ style: 'HEAVY' });
                        return;
                    case 'supernova':
                        if (Haptics.notification) Haptics.notification({ type: 'SUCCESS' });
                        else if (Haptics.impact) Haptics.impact({ style: 'HEAVY' });
                        return;
                    case 'overdrive':
                        if (Haptics.notification) Haptics.notification({ type: 'WARNING' });
                        return;
                    case 'deny':
                        if (Haptics.notification) Haptics.notification({ type: 'ERROR' });
                        else if (Haptics.impact) Haptics.impact({ style: 'MEDIUM' });
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
                    case 'heartbeat-dub':
                        navigator.vibrate(8);
                        break;
                    case 'heartbeat':
                        navigator.vibrate(14);
                        break;
                    case 'drop':
                        navigator.vibrate(18);
                        break;
                    case 'merge':
                        navigator.vibrate(28);
                        break;
                    case 'pop':
                        navigator.vibrate(15);
                        break;
                    case 'pulse':
                        navigator.vibrate(30);
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
                    case 'deny':
                        navigator.vibrate([18, 40, 18]);
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

    // Waits ms, plus any hit-stop still running, so turn pacing pauses with the board
    async function delay(ms) {
        await new Promise(resolve => setTimeout(resolve, ms));
        let held = hitStopUntil - performance.now();
        while (held > 0) {
            await new Promise(resolve => setTimeout(resolve, held));
            held = hitStopUntil - performance.now();
        }
    }

    // Run Game
    init();
})();
