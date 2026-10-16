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
            settings: {
                sfx: true,
                bgm: false, // ambient music off by default until the new soundtrack lands
                bgmOffMigrated: true,
                vibration: true,
                shake: 'high'
            }
        };

        try {
            const raw = localStorage.getItem('zeropoint_career');
            if (raw) {
                const parsed = JSON.parse(raw);
                // One-time: switch ambient music off for existing saves (players can turn it back on)
                if (parsed.settings && !parsed.settings.bgmOffMigrated) {
                    parsed.settings.bgm = false;
                    parsed.settings.bgmOffMigrated = true;
                }
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
        if (homeCardHighscore) homeCardHighscore.textContent = `BEST ${best.toLocaleString()}`;
        if (homeCardStars) homeCardStars.textContent = `SECTOR ${career.currentSector || 1} - ${totalNodeStars} ★`;
        if (homeCardChallengeStars) homeCardChallengeStars.textContent = `${totalChallengeStars} / ${maxChallengeStars} ★`;
        if (challengesHeaderStars) challengesHeaderStars.textContent = `★ ${totalChallengeStars}/${maxChallengeStars}`;
        if (advHeaderStars) advHeaderStars.textContent = `⭐ ${totalChallengeStars} / ${maxChallengeStars}`;
        if (advNodesStarsPill) advNodesStarsPill.textContent = `★ ${totalNodeStars}`;

        if (settingSfxToggle && career.settings) settingSfxToggle.checked = !!career.settings.sfx;
        if (settingBgmToggle && career.settings) settingBgmToggle.checked = !!career.settings.bgm;
        if (settingVibrationToggle && career.settings) settingVibrationToggle.checked = career.settings.vibration !== false;
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
        if (screenId !== 'game') hideObjectiveIntro();
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
            if (config.maxDrops) chips.push(`<span class="node-chip">↓ ${config.maxDrops} drops</span>`);
            if (config.rules && config.rules.fluxRate) chips.push(`<span class="node-chip">↑ Flux every ${config.rules.fluxRate}</span>`);
            (config.rules?.modifiers || []).forEach(m => chips.push(`<span class="node-chip">${m.icon} ${m.label}</span>`));
            if (config.targetScoreForStar) chips.push(`<span class="node-chip">★ ${config.targetScoreForStar}+ pts</span>`);
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
        if (adventureObjectiveCard) adventureObjectiveCard.style.display = 'flex';
        if (tutorialCard) tutorialCard.style.display = 'none';
        if (advObjDesc) advObjDesc.textContent = config.desc;
        if (bestLabel) bestLabel.textContent = 'Node Best';
        const nodeRecord = career.adventureNodes ? career.adventureNodes[config.id] : null;
        const nodeBest = nodeRecord && nodeRecord.bestScore ? nodeRecord.bestScore : 0;
        if (bestVal) bestVal.textContent = nodeBest.toLocaleString();
        if (turnCounterLabel) turnCounterLabel.textContent = config.rules?.fluxRate ? 'Dark Matter Rises In' : 'Drops Left';

        showScreen('game');
        startNewGame();

        if (config.setupBoard) {
            grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
            config.setupBoard(grid, ROWS, COLS, createTile);
        }
        updateAdventureObjectiveUI();
        showObjectiveIntro(config);
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
                : `<span class="chal-chip">↓ ${lvl.maxDrops} drops</span><span class="chal-chip">★ within ${lvl.targetDropsForStar} drops</span><span class="chal-chip">★ ${lvl.targetScoreForStar}+ pts</span>`;
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

        if (gameModeDisplay) gameModeDisplay.textContent = 'ZERO POINT';
        if (gameModeSub) gameModeSub.textContent = 'Quantum Math Cascade';
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
        if (turnCounterLabel) turnCounterLabel.textContent = 'Drops Left';

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
                line: 'One drop, two blasts. Find the drop that sets off a chain.',
                chips: [['2x', 'gold'], '→', ['3x', 'gold'], '→', ['4x', 'gold'], '· chains multiply your score'],
                hint: { col: 4 },
                check: (t) => t.chain >= 2 ? 'pass' : (t.dropped ? 'fail' : null),
                fail: (t) => t.blasts === 1
                    ? { title: 'Only one blast', body: 'Close! Find the drop where a falling tile lands next to its opposite.' }
                    : { title: 'No blast', body: 'Drop <b class="c-neg">−1</b> beside the <b class="c-pos">+1</b>, then watch the <b class="c-pos">+2</b> fall onto the <b class="c-neg">−2</b>.' }
            }]
        },
        {
            kicker: 'LESSON 4 · DANGER', color: '#ff6b8a',
            board: { '1,4': 3, '2,4': 1, '3,4': 3, '4,4': 1, '5,4': 3, '6,4': 1, '7,4': 3 }, orbs: [-3],
            rise: true,
            phases: [{
                line: 'Dark Matter pushes the board up after this drop. Clear the tall stack before it crosses the red line.',
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
                screenFlash = 0.6;
                screenFlashColor = '#ff4e50';
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
                animateCount(vicScore, target, 1200, 0);
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
            victoryStarsContainer.querySelectorAll('.win-star').forEach((el, i) => {
                el.classList.toggle('off', v.starFlags ? !v.starFlags[i] : i >= v.stars);
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
                { glyph: '★', label: `Finish within ${lvl.targetDropsForStar} drops`, detail: dropsOk ? `${dropsUsed} used · on track` : `${dropsUsed} used · missed`, state: dropsOk ? 'track' : 'todo' },
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
        if (currentBounty) {
            const done = currentBounty.progress >= currentBounty.target;
            const reward = String(currentBounty.rewardText || '').replace(/\s*PTS/i, '').replace(/\s*[•·]\s*/g, ' · ');
            goals.push({ glyph: '◎', label: currentBounty.title, detail: `${currentBounty.progress}/${currentBounty.target} · ${reward}`, state: done ? 'done' : 'progress' });
        }
        const swapIn = Math.max(1, 8 - dropsSinceSwapCharge);
        goals.push({ glyph: '⇄', label: 'Next swap token', detail: `in ${swapIn} drop${swapIn === 1 ? '' : 's'}`, state: 'track' });
        goals.push({ glyph: '↑', label: 'Dark matter rises', detail: `in ${movesUntilRise} drop${movesUntilRise === 1 ? '' : 's'}`, state: movesUntilRise <= 1 ? 'todo' : 'progress' });
        return {
            accent: '#00f2fe', chip: 'CLASSIC SURVIVAL', title: `Score ${score.toLocaleString()}`,
            ringLabel: best > 0 ? `BEST ${best.toLocaleString()}` : 'FIRST RUN',
            ringValue: best > 0 ? (isNewBest ? 'NEW!' : `${Math.min(100, Math.round((score / best) * 100))}%`) : score.toLocaleString(),
            ringSub: best > 0 ? (isNewBest ? 'New best score' : 'of your best score') : 'points so far',
            pct: best > 0 ? Math.min(100, Math.round((score / best) * 100)) : 100,
            goals, restart: 'Restart run', exit: 'Exit to menu'
        };
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
                return `<span class="pause-orb is-${g.state}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%">${g.glyph}</span>`;
            }).join('');
        }

        if (pauseGoals) {
            pauseGoals.innerHTML = '';
            m.goals.forEach(g => {
                const row = document.createElement('div');
                row.className = `pause-goal is-${g.state}`;
                const glyph = document.createElement('span');
                glyph.className = 'pause-goal-glyph';
                glyph.textContent = g.glyph;
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
            if (activeAdventureLevel && activeAdventureLevel.isGraduation) {
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

        if (settingVibrationToggle) {
            settingVibrationToggle.addEventListener('change', (e) => {
                career.settings.vibration = e.target.checked;
                saveCareerData();
                if (e.target.checked) {
                    triggerHaptic('tick');
                }
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
                        settings: { sfx: true, bgm: false, bgmOffMigrated: true, vibration: true, shake: 'high' }
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
        const cell = Math.min(rect.width / COLS, rect.height / (ROWS + 2.2));
        cellW = cell;
        cellH = cell;
        boardOffsetX = (rect.width - cell * COLS) / 2;
        boardOffsetY = rect.height - cell * (ROWS + 1);
        if (riseStatusBar) riseStatusBar.style.height = `${cell}px`;
    }

    function startNewGame() {
        grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
        score = 0;
        setScoreDisplay(0, true);
        lastCoreHighlight = false;
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
        if (isTutorial) {
            if (tutBusy || isSwapModeActive) return;
            hideTutHand();
        }

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
                    if (isTutorial && tutTurn) tutTurn.chain = Math.max(tutTurn.chain, chainStep);
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

            if (!isSwap && isTutorial && tutRisePending) {
                tutRisePending = false;
                if (screenGame) screenGame.classList.remove('tut-rise');
                await pushTutorialRiseRow();
            } else if (!isSwap) {
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

            if (isTutorial) tutEvaluate(isSwap ? 'swap' : 'drop');
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
                duration: MERGE_ANIM_DURATION,
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
                duration: COLLAPSE_ANIM_DURATION,
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
                        checkAdventureObjective('annihilations', 1, cellCenterBetween(r, c, r, c + 1));
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
                        checkAdventureObjective('annihilations', 1, cellCenterBetween(r, c, r + 1, c));
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

                        if (isTutorial) tutRecordMerge(Math.abs(fusedVal));

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
            bannerText = 'MICRO POP!';
            bannerColor = '#00f2fe';
        } else if (tier === 2) {
            // Tier 2: Pulse Detonation (Magnitude 2-3)
            triggerScreenShake(10 + Math.min(combo * 2, 10));
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
            checkAdventureObjective('trigger_laser', magnitude, cellCenterBetween(r, c, r2, c2));
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
                checkAdventureObjective('clear_dark_matter', 1, { x: nx, y: ny });
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
        annihilations: { short: (o) => `Trigger ${o.target} Zero Blasts`, hint: 'Touch opposites like [pos:+3] [neg:−3] to cancel them', event: 'ZERO BLAST' },
        synthesis_tier: { short: (o) => `Build a +${o.target} orb`, hint: 'Merge matching numbers like [pos:+2] [pos:+2] to double them', event: 'MERGED' },
        clear_dark_matter: { short: () => 'Shatter Dark Matter cores', hint: 'Blast beside a [dm:◈] core twice to shatter it', event: 'CORE SHATTERED' },
        trigger_laser: { short: () => 'Fire a Cross Laser', hint: 'Cancel a [pos:+4] [neg:−4] pair to fire across the row and column', event: 'CROSS LASER!' },
        activate_frenzy: { short: () => 'Unleash Frenzy', hint: 'Blast to fill the [od:ϟ] Overdrive bar to 100%', event: 'FRENZY!' }
    };

    function getObjectiveGlyph(obj) {
        return (CHALLENGE_GLYPHS[obj.type] || (() => '★'))(obj);
    }

    // Board-space midpoint of two cells (canvas CSS pixels)
    function cellCenterBetween(r1, c1, r2, c2) {
        return {
            x: boardOffsetX + ((c1 + c2) / 2) * cellW + cellW / 2,
            y: boardOffsetY + ((r1 + r2) / 2) * cellH + cellH / 2
        };
    }

    function getObjectiveCounts(obj) {
        if (obj.type === 'synthesis_tier') {
            return { cur: adventureObjectiveMet ? obj.target : adventureProgress, tgt: obj.target, text: adventureObjectiveMet ? 'DONE' : `+${adventureProgress || 0}/+${obj.target}` };
        }
        if (obj.type === 'trigger_laser' || obj.type === 'activate_frenzy') {
            return { cur: adventureObjectiveMet ? 1 : 0, tgt: 1, text: adventureObjectiveMet ? 'DONE' : '0/1' };
        }
        const cur = Math.min(adventureProgress, obj.target);
        return { cur, tgt: obj.target, text: `${cur}/${obj.target}` };
    }

    function checkAdventureObjective(type, payload = 1, pos = null) {
        if (gameMode !== 'adventure' || !activeAdventureLevel || isGameOver) return;
        const obj = activeAdventureLevel.objective;
        if (!obj) return;
        const prevProgress = adventureProgress;
        const prevMet = adventureObjectiveMet;

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

        const advanced = adventureProgress > prevProgress || (adventureObjectiveMet && !prevMet);
        updateAdventureObjectiveUI(advanced);
        if (advanced) showObjectiveCallout(obj, pos);
    }

    function updateAdventureObjectiveUI(bump = false) {
        if (!activeAdventureLevel || gameMode !== 'adventure') return;
        const obj = activeAdventureLevel.objective;
        if (!obj) return;

        const meta = OBJECTIVE_META[obj.type];
        const { cur, tgt, text } = getObjectiveCounts(obj);
        const countable = obj.type === 'annihilations' || obj.type === 'clear_dark_matter';
        const oneToGo = countable && !adventureObjectiveMet && tgt - cur === 1;

        const glyphEl = document.getElementById('adv-obj-glyph');
        const togoEl = document.getElementById('adv-obj-togo');
        if (glyphEl) glyphEl.textContent = adventureObjectiveMet ? '✓' : getObjectiveGlyph(obj);
        if (advObjDesc) advObjDesc.textContent = meta ? meta.short(obj) : activeAdventureLevel.desc;
        if (advObjProgress) advObjProgress.textContent = text;
        if (togoEl) togoEl.hidden = !oneToGo;
        if (adventureObjectiveCard) {
            adventureObjectiveCard.classList.toggle('one-to-go', oneToGo);
            adventureObjectiveCard.classList.toggle('complete', adventureObjectiveMet);
            if (bump) {
                adventureObjectiveCard.classList.remove('bump');
                void adventureObjectiveCard.offsetWidth;
                adventureObjectiveCard.classList.add('bump');
            }
        }

        lastCoreHighlight = SHOW_LAST_CORE_MARKER && obj.type === 'clear_dark_matter' && !adventureObjectiveMet && countRemainingDarkMatter() === 1;
    }

    // Badge that rises from where the objective progressed ("◈ 3/4 · CORE SHATTERED")
    function showObjectiveCallout(obj, pos) {
        const host = document.getElementById('canvas-container');
        if (!host) return;
        const meta = OBJECTIVE_META[obj.type];
        const { cur, tgt } = getObjectiveCounts(obj);
        const left = Math.max(0, tgt - cur);
        const point = pos || { x: boardOffsetX + (COLS * cellW) / 2, y: boardOffsetY + (ROWS * cellH) / 2 };

        const el = document.createElement('div');
        el.className = 'obj-callout' + (adventureObjectiveMet || left === 1 ? ' gold' : '');
        el.style.left = `${Math.min(Math.max(point.x, 70), host.clientWidth - 70)}px`;
        el.style.top = `${Math.max(point.y, 60)}px`;
        const badge = document.createElement('span');
        badge.className = 'badge';
        const g = document.createElement('span');
        g.className = 'g';
        g.textContent = getObjectiveGlyph(obj);
        const n = document.createElement('span');
        n.className = 'n';
        n.textContent = obj.type === 'synthesis_tier' && !adventureObjectiveMet ? `+${cur}` : `${cur}/${tgt}`;
        badge.append(g, n);
        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = adventureObjectiveMet ? 'OBJECTIVE COMPLETE!' : (left === 1 ? `${meta ? meta.event : 'PROGRESS'} · 1 TO GO` : (meta ? meta.event : 'PROGRESS'));
        el.append(badge, label);
        host.appendChild(el);
        setTimeout(() => el.remove(), 1600);
        triggerHaptic(adventureObjectiveMet ? 'zero' : 'tick');
    }

    // ---------- Intro A: mission card before the first drop ----------
    let objIntroTimer = null;

    function showObjectiveIntro(level) {
        const overlay = document.getElementById('obj-intro');
        const obj = level && level.objective;
        if (!overlay || !obj || level.isTutorial) return;
        const meta = OBJECTIVE_META[obj.type];
        const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
        set('obj-intro-kicker', `${getLevelCode(level)} · OBJECTIVE`);
        set('obj-intro-glyph', getObjectiveGlyph(obj));
        set('obj-intro-title', level.desc || (meta ? meta.short(obj) : 'Complete the objective'));
        renderIntroHint(document.getElementById('obj-intro-hint'), meta ? meta.hint : '');

        // One row per rule, then one per star goal
        const rules = document.getElementById('obj-intro-rules');
        if (rules) {
            rules.innerHTML = '';
            const row = (icon, kind, text) => {
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
                rules.appendChild(r);
            };
            row('↓', 'drops', `${level.maxDrops} drops available`);
            row('★', 'star', meta ? meta.short(obj) : (level.desc || 'Complete the objective'));
            row('★', 'star', `Finish within ${level.targetDropsForStar} drops`);
            row('★', 'star', `Score ${level.targetScoreForStar.toLocaleString()}+ points`);
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
        sfx.playGameOver();
        triggerScreenShake(18);

        const isAdventureRun = gameMode === 'adventure' && !!activeAdventureLevel;
        const outOfDrops = /drops/i.test(message);
        const best = isAdventureRun ? getStoredLevelBest(activeAdventureLevel) : (career.highScore || 0);
        const isNewBest = score > 0 && (isAdventureRun ? score > best : score >= best);

        const goKicker = document.getElementById('go-kicker');
        const goReason = document.getElementById('go-reason');
        const goScore = document.getElementById('go-score');
        const goBest = document.getElementById('go-best');
        const goCascade = document.getElementById('go-cascade');
        const goZeroes = document.getElementById('go-zeroes');
        const btnGoMap = document.getElementById('btn-go-map');

        if (goKicker) goKicker.textContent = outOfDrops ? 'OUT OF QUANTUM DROPS' : 'REACTOR OVERLOAD';
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
                animateCount(goScore, target, 1100, 0);
                setTimeout(() => retriggerClass(goScore, 'count-done'), 1100);
            }, 650);
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
        renderBreachWhy(isAdventureRun && !isTutorial, outOfDrops);

        setTimeout(() => {
            if (modalGameOver) modalGameOver.classList.add('visible');
        }, 400);
    }

    // Fail tips per objective type (shown under the breach reasons)
    const OBJECTIVE_FAIL_TIPS = {
        annihilations: 'Look for opposite numbers that touch, like +3 and −3.',
        synthesis_tier: 'Merge matching numbers to grow them before they run out.',
        clear_dark_matter: 'Blast beside a core twice to shatter it.',
        trigger_laser: 'Build a ±4 pair first, then cancel it.',
        activate_frenzy: 'Chain blasts together to charge Overdrive faster.'
    };

    function renderBreachWhy(show, outOfDrops) {
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
        const obj = lvl && lvl.objective;
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
            row(getObjectiveGlyph(obj), obj.type === 'clear_dark_matter' ? 'dm' : 'obj',
                meta ? meta.short(obj) : (lvl.desc || 'Objective'), tgt ? (cur / tgt) * 100 : 0, text);
        }
        if (outOfDrops) {
            row('↓', 'drops', 'Drops ran out', 100, `${dropsUsed}/${maxDrops}`);
        } else {
            row('⚠', 'drops', 'A tile crossed the red line', 100, 'BREACH');
        }

        if (tip) {
            const base = obj ? (OBJECTIVE_FAIL_TIPS[obj.type] || '') : '';
            const close = remaining === 1 ? 'So close: just 1 to go. ' : '';
            const overload = !outOfDrops ? 'Keep stacks low and clear the tallest column first. ' : '';
            tip.textContent = `💡 ${close}${overload}${base}`.trim();
        }
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
        const starScore = score;

        const prevBest = getStoredLevelBest(activeAdventureLevel);
        const dropsLeft = Math.max(0, maxDrops - dropsUsed);
        const dropBonus = dropsLeft * 20;
        const finalScore = score + dropBonus;
        score = finalScore;
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

        const lvlObj = activeAdventureLevel.objective;
        const objMeta = lvlObj ? OBJECTIVE_META[lvlObj.type] : null;
        const dropTarget = activeAdventureLevel.targetDropsForStar;
        const scoreTarget = activeAdventureLevel.targetScoreForStar;
        const goals = [
            {
                got: true,
                title: objMeta ? objMeta.short(lvlObj) : (activeAdventureLevel.desc || 'Complete the objective'),
                sub: 'Objective complete',
                val: lvlObj ? getObjectiveCounts(lvlObj).text : '✓'
            },
            {
                got: !!star2,
                title: `Finish within ${dropTarget} drops`,
                sub: star2 ? `Done in ${dropsUsed} drops` : `Used ${dropsUsed} · ${dropsUsed - dropTarget} over · replay for this star`,
                val: String(dropsUsed)
            },
            {
                got: !!star3,
                title: `Score ${scoreTarget.toLocaleString()}+`,
                sub: star3 ? `You scored ${starScore.toLocaleString()}` : `${(scoreTarget - starScore).toLocaleString()} short · replay for this star`,
                val: starScore.toLocaleString()
            }
        ];

        renderVictoryScreen({
            goals,
            starFlags: [true, !!star2, !!star3],
            kicker: `${getLevelCode(activeAdventureLevel)} · SUCCESS`,
            title: activeAdventureLevel.title,
            stars: totalStars,
            score: finalScore,
            bonus: `+${dropBonus.toLocaleString()} DROPS BONUS`,
            drops: `${dropsUsed} / ${maxDrops}`,
            dropsLabel: 'DROPS USED',
            best: finalScore > prevBest ? 'NEW' : prevBest.toLocaleString(),
            showMap: !activeAdventureLevel.isGraduation
        });

        setTimeout(() => {
            if (modalVictory) modalVictory.classList.add('visible');
        }, 500);
    }

    // Ease a number element from its current value up to `to` (rAF, ease-out cubic)
    function animateCount(el, to, duration = 900, from = null) {
        if (!el) return;
        cancelAnimationFrame(el._countRaf);
        const start = from !== null ? from : (typeof el._countValue === 'number' ? el._countValue : (parseInt(String(el.textContent).replace(/[^0-9-]/g, ''), 10) || 0));
        const t0 = performance.now();
        el._countValue = start;
        const step = (now) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = Math.round(start + (to - start) * eased);
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
        setScoreDisplay(score);
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
        maybeShowOverdriveTip();
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
        if (isProcessing || isGameOver || (isTutorial && (!tutToolAllowed('swap') || tutBusy))) return;
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
        comboVal.textContent = `×${combo}`;
        comboVal.classList.toggle('is-idle', combo <= 1);

        if (missionStrip) {
            const cardShown = (el) => el && el.style.display !== 'none' && el.style.display !== '';
            missionStrip.style.display = (cardShown(adventureObjectiveCard) || cardShown(tutorialCard)) ? '' : 'none';
        }

        if (gameMode === 'adventure') {
            const dropsRemaining = Math.max(0, maxDrops - dropsUsed);
            riseCounter.textContent = isTutorial ? (tutRisePending ? '1' : '') : `${dropsRemaining}`;
            if (turnCounterLabel) turnCounterLabel.textContent = isTutorial ? (tutRisePending ? 'Dark Matter Rises In' : '') : 'Drops Left';
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
            riseCounter.textContent = `${movesUntilRise}`;
            if (turnCounterLabel) turnCounterLabel.textContent = 'Dark Matter Rises In';
            if (riseFill) riseFill.style.height = `${Math.round(Math.min(1, (MOVES_PER_RISE - movesUntilRise + 1) / MOVES_PER_RISE) * 100)}%`;
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
        if (btnTouchSwap) {
            btnTouchSwap.classList.toggle('swap-max', swapTokens >= maxSwapTokens && !isSwapModeActive);
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

        // Update Next Queue UI
        renderQueueSlot(nextSlot1, nextQueue[0]);
        renderQueueSlot(nextSlot2, nextQueue[1]);
    }

    function renderQueueSlot(element, orb) {
        element.classList.remove('q-pos', 'q-neg', 'q-special');
        if (!orb) {
            element.innerHTML = '';
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
        element.innerHTML = `<span class="queue-orb-label" style="font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color};">${orb.label}</span>`;
    }

    // Input Handlers
    function setupInputs() {
        // Mouse Hover & Click
        canvas.addEventListener('mousemove', (e) => {
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

            const col = Math.floor((mouseX - boardOffsetX) / cellW);
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

        if (btnSwapToken) btnSwapToken.addEventListener('click', handleSwapButtonClick);
        if (btnTouchSwap && btnTouchSwap !== btnSwapToken) {
            btnTouchSwap.addEventListener('click', handleSwapButtonClick);
        }
        if (holdSlot) holdSlot.addEventListener('click', handleHoldButtonClick);
        if (btnTouchHold && btnTouchHold !== holdSlot) {
            btnTouchHold.addEventListener('click', handleHoldButtonClick);
        }
        if (btnTouchDrop) btnTouchDrop.addEventListener('click', dropActiveOrb);
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
