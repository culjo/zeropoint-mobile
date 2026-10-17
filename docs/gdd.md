# Nullfall: Game Design Document

Version 0.1 · 2026-10-17 · Owner: Lekan

Store title: **Nullfall: Puzzle Cascade**. Bundle ID: `com.noviac.nullfall`.

**How to read this document.** Each section is tagged:
- **[LIVE]**: what the game does today.
- **[PLANNED]**: agreed, but not built yet.
- **[OPEN]**: still to decide.

Detailed Adventure goal rules are in [adventure-objectives.md](adventure-objectives.md).

---

## 1. Vision

**What it is:** a fast, tactile number puzzle. Positive meets negative, and everything goes to zero.

**Who it's for:** casual mobile puzzle players (match-3, 2048 and merge fans). Sessions run 2–5 minutes, played in portrait with one thumb.

**Pillars**
1. **Simple to read.** One rule per idea. Every goal is one icon, one number and drops left.
2. **Physical, satisfying chains.** Drag, drop, blast, cascade. Big numbers make big booms.
3. **Build bigger.** The game should feel like it's growing: bigger numbers, bigger blasts, new records.
4. **Fair.** Losing should feel like your own mistake, never the random orbs.

**Naming:** the visible name is **Nullfall**. Save keys stay `zeropoint_*`, and the in-game blast callout stays **"ZERO POINT!"**.

---

## 2. Core loop [LIVE]

```
pick an orb from the tray → drag it onto a column → it lands
   → opposites cancel (Zero Blast) / matching orbs merge → gravity → cascade
   → board settles → turn effects (rising rows, Risers) → next drop
```

### 2.1 Board
- **Size:** 6 columns × 8 rows. Orbs stack from the bottom.
- **The red line:** the top row. A tile that reaches it means **Breach**, and you lose.

### 2.2 Controls (drag & place, the main gameplay)
- **Tray:** two orbs. Drag either one onto a column and it drops there. A used slot refills straight away.
- **Cancel:** releasing outside the board cancels the drop.
- **Hold:** drag an orb into the Hold slot to save it, and drag it out later. One use per drop.
- **Swap:** slide a board tile onto its neighbour to swap them. Each swap costs one token.
  - You start with 1 token and can hold up to 3.
  - Earn +1 every 8 drops, and more from bonuses.
  - Swaps don't count as drops.
- **Classic drop controls** (aim, then drop) still exist on `index.html`. They're only shown in debug mode, through the Labs switch.

### 2.3 Rules
- **Zero Blast:** two touching orbs that are exact opposites (`+3` and `−3`) cancel and both disappear.
- **Merge:** two touching orbs with the same value and sign fuse into double (`+2 +2 → +4`).
- **Cascade:** after a clear, gravity pulls tiles down and new neighbours are checked again. Each step in the chain raises the combo multiplier.

**Blast tiers:** bigger numbers make bigger blasts.

| Size | Tier | Effect |
|---|---|---|
| ±1 | 1 | Small pop |
| ±2–3 | 2 | Pulse: 1 damage to Dark Matter next to it |
| ±4–7 | 3 | **Cross Laser:** hits the whole row and column |
| ±8–15 | 4 | **Supernova:** 3×3 crater |
| ±16+ | 5 | **Hyperspace Singularity:** clears the bottom rows and all Dark Matter |

### 2.4 Special orbs [LIVE]
These appear in the tray now and then:
- **± Invert:** flips a tile's sign.
- **÷2:** halves a tile.
- **×2:** doubles a tile.
- **0:** a 3×3 blast.

### 2.5 Dark Matter [LIVE]
- A core with 2 HP. Each blast touching it removes 1 HP.
- When it shatters it becomes a random ±1 to ±4 orb and gives +15 score.

### 2.6 Overdrive [LIVE]
- **Charging:** blasts fill the bar, scaled by tier and combo (+2% up to +18%).
- **At 100%:** it fires on its own and puts one super-weapon into the tray. Each fill gives the next one in this order:
  1. **Vortex:** clears a whole column.
  2. **Nova:** a 3×3 Supernova.
  3. **Nuke:** a 3×3 blast.

  After that the bar resets to 0.
- **Role:** a tool and a reward, never a goal.

### 2.7 Scoring [LIVE]
- **Blasts:** `10 × 2^(tier−1) × combo × chain step`.
- **Other sources:** shattering Dark Matter, bounties, and +20 for each drop left when you clear a level.
- **What score is used for:** best scores per mode and per level. It doesn't decide stars (§6).

---

## 3. Build bigger [PLANNED]

**The problem:** playtesters wanted higher numbers. Orbs start small (±1 to ±4) and big numbers get blasted before they can grow.

### 3.1 Number Tide
The smallest orb in the pool climbs over time, so the board keeps getting bigger.

| Tide | Orb pool |
|---|---|
| 0 | ±1 – ±4 |
| 1 | ±2 – ±8 |
| 2 | ±4 – ±16 |
| 3 | ±8 – ±32 |
| … | doubles each step |

- **Classic:** the tide rises every ~25 drops (to be tuned). This replaces today's score-based pool, which only reaches ±8.
- **Adventure:** each sector starts at a higher tide. Sector 1 is Tide 0, and later sectors go up from there (§5.4).

### 3.2 Merge-friendly tray
- The bag randomizer (§5.5) leans toward **pairs**. It often deals an orb that matches one already on the board, so merges happen naturally.

### 3.3 Celebrate new highs
- **Orbs never change physical size.** They stay one grid cell so the board stays readable. Size is shown through:
  - a **colour** for each doubling
  - **glow and aura** strength
  - a heavier number font
  - a **deeper impact sound** as numbers grow
- **Tier names**, announced the first time you make each one (draft names):

  | Size | Name |
  |---|---|
  | 8 | Nova |
  | 16 | Star |
  | 32 | Pulsar |
  | 64 | Quasar |
  | 128 | Magnetar |
  | 256+ | **[OPEN]** |

- **Records:**
  - **Best orb per run**, shown on the game-over and victory screens.
  - **Lifetime best orb**, celebrated as "First 128 ever!" and shown on the profile.

### 3.4 Rescue opposites [OPTION, not committed]
If a big orb sits on the board for a while, the tray deals its exact opposite within a few drops. We'll use this only if playtests show big numbers clogging the board.

---

## 4. Game modes

| Mode | Status | Summary |
|---|---|---|
| **Adventure** | LIVE, being redesigned | Node map, one goal per level, limited drops, 3 stars |
| **Classic** | LIVE | Endless. Dark Matter rises every 5 drops. Bounties. Go for a high score |
| **Challenges** | LIVE | Five handmade missions plus a boss, plus Training |
| **How to Play / First Play** | LIVE | A 6-slide How to Play, plus a 6-step coached first run on node 1-1 |
| **Academy lessons** | LIVE, classic controls only | Interactive lessons, kept as a backup on `index.html` |

### 4.1 Classic [LIVE + PLANNED]
- **[LIVE]**
  - A row (about 60% Dark Matter) rises every 5 drops.
  - Bounties are short side tasks for bonus score, Overdrive charge and Swap tokens.
  - You lose on breach.
- **[PLANNED]** Number Tide (§3.1), best orb records (§3.3) and the merge-friendly tray (§3.2).

### 4.2 Challenges [OPEN]
They currently use the old objective types. They need moving to the new goal set, or folding into Adventure. To be decided after the Adventure rebuild.

---

## 5. Adventure [PLANNED]

### 5.1 Structure
- **Map:** a node map per sector. Main nodes run in a line, with **bonus rifts** branching off. The last node is the **boss**.
- **Unlocking:** clearing a node opens the next one and any bonus rift linked to it. Beating the boss opens the next sector.
- **Size:** **100+ levels**. Sectors get longer as you go:

| Sector | Levels (main + bonus) |
|---|---|
| 1 | 12 |
| 2 | 14 |
| 3 | 15 |
| 4 | 16 |
| 5 | 18 |
| 6 | 20 |
| 7+ | 20 |

Six sectors give about 95 levels, so a seventh takes it past 100. **[OPEN]** sector names and themes after Sector 3.

The three current sectors are Subatomic Genesis, Ion Nebula and Event Horizon.

### 5.2 Goals
**One goal per level** and **at most one obstacle**. Full rules are in [adventure-objectives.md](adventure-objectives.md).

| Goal | Strip | Role |
|---|---|---|
| Zero Out | ○ Clear N orbs | Core, used to teach the game |
| Collect | `3` Pop N of a number (either sign) | Core |
| Break the Cores | ◈ Break N Dark Matter | Core |
| Catch the Stars | ⭐ Land orbs on N star cells | Core |
| Risers | ⬆ Clear N Risers | Goal and obstacle |
| Survive | ⏳ Last N drops | Tension levels |
| Drain the Null Core | 🔴 2×2 core with HP to 0 | **Boss** |
| Big Orb | `16` Merge to size X | **Bonus rifts** |

**Obstacles:** Risers and rising rows.

**Risers** are orbs that climb one row after each drop. You clear them by cancelling with their opposite. A merged Riser keeps climbing. A Riser reaching the red line means you lose. Later sectors have several at once.

**New content:** add **one new board element per sector or two**, never a new rule. Each one first appears in a handcrafted intro level. **[OPEN]** which ones. Ideas: 0 walls, sticky tiles, locked columns, portals.

### 5.3 Level building: hybrid
Every level ships as **fixed data**, so levels never change after an update and saved stars stay valid. Generation happens while we build the game, not on the player's device.

| Level | Made by |
|---|---|
| Sector opener (node 1) | Handcrafted |
| First appearance of any goal or obstacle | Handcrafted |
| Boss | Handcrafted |
| One showcase puzzle per sector | Handcrafted |
| Everything else | Generated from a template, then curated |

That's about 35% handcrafted overall.

**Pipeline**
1. **Templates:** a goal, a board pattern, an orb pool and difficulty settings.
2. **Generation:** ~20 candidates per level slot, each from a different seed.
3. **Bot testing:** a bot plays each candidate ~200 times and records win rate and drops left.
4. **Pick and tune:** keep the candidate closest to the slot's target difficulty, then tune the drop budget.
5. **Save:** store it as level data together with its seed and template ID.

**Difficulty curve**
- Within a sector it rises in a sawtooth: each sector starts easier than the previous one ended.
- Target clear rates are about 95% for openers, ~70% for hard nodes and ~55% for bosses (to be tuned).

**Roles:** Claude drafts the templates and handcrafted boards, and Lekan tweaks them.

**Tools to build:**
- the generator
- the playtest bot (runs in Node)
- a level editor behind debug mode: place tiles, stars, cores and Risers, then export

### 5.4 Orbs during a level
- Each level sets its **orb pool**, using the sector's Number Tide plus any level-specific weighting.
- **Fresh orbs on every attempt:** a new seed each attempt drives the tray, rising rows and shatters.

### 5.5 Fairness rules
- **Bag randomizer:** orbs are dealt from a shuffled bag, so there are no long droughts or streaks.
- **Guarantees:**
  - **Collect:** the target number turns up at least every N drops.
  - **Risers:** a matching opposite turns up within a few drops of a Riser appearing.
  - **Big Orb:** pairs are common.
  - **Everywhere:** the pair weighting from §3.2.

---

## 6. Stars and progression [PLANNED]

| Level type | ★ | ★★ | ★★★ |
|---|---|---|---|
| Any goal except Survive | Clear the level | ≥ 25% of drops left | ≥ 45% of drops left |
| Survive | Survive | Every column has ≥ 3 empty rows at the end | ≥ 5 empty rows |

- The thresholds are **shown on the intro card and the strip**, e.g. "★★ 4 left".
- The **score star is removed.**
- Stars count toward sector totals.

**You lose when:**
- a tile reaches the red line
- a Riser reaches the red line
- you run out of drops (except in Survive)

---

## 7. Screens and UI [LIVE]

**Screens**
- Home: a big Play button for Adventure, plus Classic and Challenges tiles.
- Constellation map, with a node sheet for the selected node.
- Game screen.
- Pause screen, with an objective ring.
- Victory screen, showing how you earned each star.
- Breach / out-of-drops screen, showing the reasons and a tip.
- Settings, with Dev tools in debug mode.

**Game screen layout**
- **Top bar:** best score, score, Overdrive and pause.
- **Strip:** the goal, or Classic info.
- **Board.**
- **Tray:** Hold, two orbs and the swap count.

**[PLANNED] Strip and intro card**
- One icon, a counter that counts down, drops left and the star thresholds.
- A level-start card states the goal in one line.

---

## 8. Audio and feel [LIVE]
- **Sound:** all generated in code with the Web Audio API, with no audio files. Audio warms up on the first tap.
- **Haptics:** on drop, blast and combo (Capacitor).
- **Screen:** locked to portrait, with a dark status bar.
- **Fonts:** Inter and Lato, bundled in the app.

## 9. Technology [LIVE]
- **Stack:** HTML5 Canvas and JavaScript, wrapped with Capacitor 7 for iOS and Android.
- **Start page:** `www/maingameplay.html` (drag & place).
- **Files:** game logic in `www/game.js`, the current map and level generator in `www/nodeGenerator.js`.
- **Saving:** progress is saved locally in `zeropoint_*` keys.
- **[PLANNED]**
  - A level data file.
  - The generator, bot and editor tools.
  - Save migration, because star rules change and existing saved stars may need resetting.

---

## 10. Open questions
1. Names and themes for Sector 4 onwards, plus the new board element for each sector.
2. Tier names from 256 up, and the colour for each doubling.
3. Classic tide speed. Should Classic also have Risers or Catch the Stars moments?
4. What happens to Challenges: move them to the new goals, or fold them into Adventure?
5. Whether Rescue opposites (§3.4) is needed, based on playtests.
6. Monetisation and meta-progression (cosmetics for orb records?). Not discussed yet.

## 11. Decision log
| Date | Decision |
|---|---|
| 2026-10-16 | Game renamed to Nullfall |
| 2026-10-17 | Drag & place is the main gameplay; classic drop stays on index.html behind debug mode |
| 2026-10-17 | Old objective redesign rejected; simple goal set adopted (§5.2) |
| 2026-10-17 | "Balance the Charge" rejected as too mathy |
| 2026-10-17 | Score star removed; stars come from drops left |
| 2026-10-17 | Bonus rifts kept |
| 2026-10-17 | Hybrid levels: handcrafted anchors plus generated levels, shipped as fixed data; fresh orbs each attempt |
| 2026-10-17 | 100+ levels; sectors grow from 12 to 20 levels |
| 2026-10-17 | Build bigger: Number Tide, merge-friendly tray, celebrations without changing orb size; Rescue opposites kept as an option |
