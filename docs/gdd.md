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
- **What score is used for:** best scores per mode and per level. It doesn't decide stars (§7).

---

## 3. Build bigger [LIVE]

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

- **Pool at each tide:** 1, 2, 3 and 4 times 2^tide, so Tide 1 deals ±2, 4, 6, 8 and Tide 2 deals ±4, 8, 12, 16. Every value doubles cleanly, so merges keep working.
- **Classic:** the tide rises every 25 drops (to be tuned), up to Tide 4, with a "NUMBER TIDE ↑" callout. This replaces today's score-based pool, which only reaches ±8.
- **Adventure:** each sector starts one tide higher: Sector 1 is Tide 0, Sector 2 is Tide 1 and Sector 3 is Tide 2. Level data is written at Tide 0, and the loader doubles pools and starting boards (§5.4).
- Dark Matter shatters and rising rows also follow the tide.

### 3.2 Merge-friendly tray
- The bag randomizer (§5.5) leans toward **pairs**. It often deals an orb that matches one already on the board, so merges happen naturally.

### 3.3 Celebrate new highs
- **Orbs never change physical size.** They stay one grid cell so the board stays readable. Size is shown through:
  - a **tier body** for each doubling from 8 up [LIVE]. The orb's border and glow switch to the tier colour. A positive orb's body is tinted in the tier colour. A negative orb keeps a dark red body with a glowing tier-colour core and a softer glow, so the sign still reads at a glance (the number also carries its + or −).
  - **glow strength** that grows with the tier [LIVE]
  - a heavier number font and a **deeper impact sound** as numbers grow [PLANNED]
- **Tier names**, announced the first time you make each one ("NOVA!" + "First 8 ever!") [LIVE]:

  | Size | Name | Tier colour |
  |---|---|---|
  | 8 | Nova | violet |
  | 16 | Star | gold |
  | 32 | Pulsar | orange |
  | 64 | Quasar | magenta |
  | 128 | Magnetar | white |
  | 256 | Hypernova | rainbow |
  | 512 | Blazar | rainbow |
  | 1024+ | Singularity | rainbow |

- **Records [LIVE]:**
  - **Best orb per run** (the biggest orb you merged), shown on the game-over and victory screens.
  - **Lifetime best orb**, shown on the Discoveries page. A tier's first-ever announcement is the celebration.

### 3.4 Rescue opposites [OPTION, not committed]
If a big orb sits on the board for a while, the tray deals its exact opposite within a few drops. We'll use this only if playtests show big numbers clogging the board.

---

## 4. Game modes

| Mode | Status | Summary |
|---|---|---|
| **Adventure** | LIVE, being redesigned | Node map, one goal per level, limited drops, 3 stars |
| **Classic** | LIVE | Endless. Dark Matter rises every 5 drops. Bounties. Go for a high score |
| **Challenges** | LIVE | Five handmade missions plus a boss, plus Training |
| **How to Play / First Play** | LIVE, changing | A 6-slide How to Play, plus a coached first run on node 1-1. It's being cut to 3 concepts (§6.2) |
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

### 5.2 Goals [LIVE]
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

**New content:** add **one new board element per sector or two**, never a new rule. Each one first appears in a handcrafted intro level (§6).
- Sector 2 brings **static blocks** (0 walls that can't be cleared). [LIVE] They're fixed in place and unbreakable: they don't fall, can't be swapped or hit by specials, Risers can't climb past them, and they rise with rising rows.
- **[OPEN]** later sectors. Ideas: sticky tiles, locked columns, portals.

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

**Tools [LIVE]** (see `tools/README.md`):
- **Rules engine** `tools/sim/engine.js`: a Node port of the board rules in game.js (no swaps; Hold as a free stash).
- **Playtest bot** `tools/sim/bot.js` + `npm run playtest`: plays every level ~200 times with different seeds and reports win rate, star spread and why runs were lost. It looks one move ahead, so its win rate is a difficulty measure, not a human clear rate.
- **Generator** `npm run levelgen`: per slot, ~20 seeded candidates from a template, bot-tested with an open budget; keeps the best fit, sets the drop budget so the bot clears the slot's target, confirms with 200 runs, and writes `www/levelsGenerated.js` (with template, seed and bot result). `--tune-hand --apply` sets handcrafted budgets the same way.
- **Level editor** (Dev tools → Level editor, debug mode): paint orbs, Risers, cores, the Null Core, walls and stars; set goal and rules; play-test in the real game without saving; copy a levels.js entry.
- **Targets** `tools/targets.js`: openers 95%, bonus rifts 80%, bosses 55%, main nodes falling from ~90% to 66% across a sector.

### 5.4 Orbs during a level [LIVE]
- Each level sets its **orb pool**, using the sector's Number Tide plus any level-specific weighting.
- **Fresh orbs on every attempt:** a new seed each attempt drives the tray, rising rows and shatters.

### 5.5 Fairness rules [LIVE]
- **Bag randomizer:** orbs are dealt from a shuffled bag, so there are no long droughts or streaks.
- **Guarantees:**
  - **Collect:** the target number turns up at least every N drops.
  - **Risers:** a matching opposite turns up within a few drops of a Riser appearing.
  - **Big Orb:** pairs are common.
  - **Everywhere:** the pair weighting from §3.2.

---

## 6. Onboarding and discovery [LIVE]

New concepts unlock gradually as the player moves through the early levels. Each one is introduced once, at a fixed level, and players who aren't using a tool get gentle hints.

### 6.1 Rules
1. **Unlocks are tied to levels, not play counts.** A concept appears at a set node, e.g. Dark Matter at 1-3. Failing a level never brings a concept forward early.
2. **A locked concept doesn't exist in the game.** Until it's introduced there are no Dark Matter rows, no special orbs, no Overdrive bar and no static blocks.
   - Level templates are tagged with the concepts they need, and the orb pool is filtered the same way. Generated levels can never use something the player hasn't seen.
3. **One new concept per level.** The level that introduces it is a calm, handcrafted level (§5.3).
4. **Introductions never repeat.** Replaying a level doesn't show its introduction again. Players with existing saves have concepts marked as seen based on the nodes they've cleared.
5. **Every card has Skip.**

### 6.2 First play: 3 concepts
The coached first run on node 1-1 is cut from 6 steps to 3:
1. **Drag & drop:** opposites cancel (Zero Blast).
2. **Merge:** matching numbers fuse.
3. **The red line:** keep the stack below it.

Hold and Swap move to behaviour hints (§6.5). The rise moves to node 1-9.

### 6.3 Sector 1 concept ladder
| Level | Goal | New concept |
|---|---|---|
| 1-1 | Zero Out | First play (§6.2) |
| 1-2 | Zero Out | none (practice) |
| 1-3 | Break the Cores | **Dark Matter** |
| 1-4 | Break the Cores | none |
| Bonus 1 | Big Orb | **Bonus rifts** |
| 1-5 | Zero Out | **Power-ups:** special orbs + Overdrive (one card, two pages) |
| 1-6 | Collect | **Collect goal** |
| 1-7 | Catch the Stars | **Stars goal** |
| 1-8 | Catch the Stars | none (practice) |
| Bonus 2 | Big Orb | none |
| 1-9 | Survive | **Rising rows** |
| 1-10 | Boss | **Null Core boss** |

**Sector 2:** Risers at 2-2 and static blocks at 2-3. Later sectors introduce their new board element at a handcrafted level the same way. Full tables are in [adventure-objectives.md](adventure-objectives.md) §5.

### 6.4 What an introduction looks like
- **New mechanic** (Dark Matter, power-ups, static blocks, rising rows, Risers):
  1. A **"NEW: Dark Matter"** card with a short looping demo, in the style of the How to Play slides.
  2. **One guided move** on the level's handcrafted board, in the style of the first play.
  3. Then normal play.
- **New goal:** the level intro card gets a **NEW GOAL** badge. No guided move.

### 6.5 Behaviour hints (Hold and Swap)
Hold and Swap are available from the start but aren't taught in the first play. Instead:
- **Hold:** from 1-3, if Hold has never been used, wait for a useful moment, e.g. a tray orb with no good place to go. Then show a small bubble on Hold with a ghost-drag animation.
- **Swap:** from 1-4, if Swap has never been used, wait for a moment where one swap would cause a blast and the player has a token. Then show the same kind of bubble.
- **How they behave:** the bubble doesn't block play and can be dismissed.
- **Limits:**
  - At most twice per tool: once, then again 3 levels later.
  - Stop for good once the player uses the tool.
  - Also show the hint if the player fails the same level twice without using that tool.

### 6.6 Discoveries page
- **Where:** a collection screen opened from How to Play.
- **What's on it:**
  - Every concept as a card. Unlocked cards show the demo and a one-line rule; locked cards show as **"???"**.
  - The **orb tier names** (§3.3: Nova, Star, Pulsar…), unlocked the first time the player makes each size. This ties "build bigger" into discovery.
- **New badge:** a dot appears on How to Play when there's an unseen discovery.

### 6.7 Classic and other modes
- **Classic stays open** from the start.
- The first time an unseen concept appears in Classic (e.g. rising Dark Matter, a special orb), its card shows just in time and the concept is marked as seen.

---

## 7. Stars and progression [LIVE for Adventure nodes]

| Level type | ★ | ★★ | ★★★ |
|---|---|---|---|
| Any goal except Survive | Clear the level | ≥ 25% of drops left | ≥ 45% of drops left |
| Survive | Survive | Every column has ≥ 3 empty rows at the end | ≥ 5 empty rows |

- The thresholds are **shown on the intro card and the strip**, e.g. "★★ 4 left". Percentages round **up** to whole drops (14 drops → ★★ 4, ★★★ 7).
- The **score star is removed.**
- Stars count toward sector totals.

**You lose when:**
- a tile reaches the red line
- a Riser reaches the red line
- you run out of drops (except in Survive)

---

## 8. Screens and UI [LIVE]

**Screens**
- Home: a big Play button for Adventure, plus Classic and Challenges tiles.
- Constellation map, with a node sheet for the selected node.
- Game screen.
- Pause screen, with an objective ring.
- Victory screen, showing how you earned each star.
- Breach / out-of-drops screen, showing the reasons and a tip.
- Settings, with Dev tools in debug mode.
- **[PLANNED]** Discoveries page, opened from How to Play (§6.6).

**Game screen layout**
- **Top bar:** best score, score, Overdrive and pause.
- **Strip:** the goal, or Classic info.
- **Board.**
- **Tray:** Hold, two orbs and the swap count.

**[PLANNED] Strip and intro card**
- One icon, a counter that counts down, drops left and the star thresholds.
- A level-start card states the goal in one line.

---

## 9. Audio and feel [LIVE]
- **Sound:** all generated in code with the Web Audio API, with no audio files. Audio warms up on the first tap.
- **Haptics:** on drop, blast and combo (Capacitor).
- **Screen:** locked to portrait, with a dark status bar.
- **Fonts:** Inter and Lato, bundled in the app.

## 10. Technology [LIVE]
- **Stack:** HTML5 Canvas and JavaScript, wrapped with Capacitor 7 for iOS and Android.
- **Start page:** `www/maingameplay.html` (drag & place).
- **Files:** game logic in `www/game.js`, the current map and level generator in `www/nodeGenerator.js`.
- **Saving:** progress is saved locally in `zeropoint_*` keys.
- **Level data [LIVE]:** `www/levels.js` holds every Adventure node as fixed data; `www/nodeGenerator.js` holds the map layouts and turns that data into playable levels. Nodes whose goal isn't built yet are marked `temp` and play a stand-in goal.
- **Save migration [LIVE]:** `adventureSaveVersion` 2 wiped old Adventure progress once (cleared nodes, stars, unlocks). Classic best, Challenges, settings and first play are kept.
- **[PLANNED]** The generator, bot and editor tools.

---

## 11. Open questions
1. Names and themes for Sector 4 onwards, plus the new board element for each sector.
2. ~~Tier names from 256 up, and the colour for each doubling.~~ Decided 2026-10-17 (§3.3).
3. Classic tide speed. Should Classic also have Risers or Catch the Stars moments?
4. What happens to Challenges: move them to the new goals, or fold them into Adventure?
5. Whether Rescue opposites (§3.4) is needed, based on playtests.
6. Monetisation and meta-progression (cosmetics for orb records?). Not discussed yet.
7. **TODO (during playtesting): reduce blast impact at high tides.** Tiers use the absolute number, so from Tide 2 (Sector 3) every blast is a Cross Laser or bigger, and lasers hit the Null Core for 3. Decided: the impact must come down; how (tiers relative to the tide, higher thresholds, weaker lasers…) is chosen once the playtest bot can measure it.
8. **Bot findings to decide (first report, 2026-10-17):**
   - Survive levels are near 100% for the bot with a row every 4 drops. Harder needs faster rows (every 3) or more Risers.
   - Risers-goal levels rarely give ★★: new Risers arrive on a schedule, so drops can't be saved. Consider lower star thresholds for this goal.
   - Collect at Tide 1–2 needs long budgets (29–41 drops), partly because lasers clear target numbers by accident.
   - Big Orb budgets are generous (20–33): the bot plans merges poorly, so people will finish well under budget.
   - Sector 3 core levels need very few drops (5–11) because every blast is a laser (see #7).

## 12. Decision log
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
| 2026-10-17 | Gradual concept unlocks tied to levels; first play cut to 3 concepts; Hold and Swap taught by behaviour hints; Discoveries page added |
| 2026-10-17 | Static blocks introduced in Sector 2 (2-3), not Sector 1 |
| 2026-10-17 | Star change: old Adventure progress is wiped once on update (not reset to 1★); Classic, Challenges and settings kept |
| 2026-10-17 | Sector 1 bonus rifts branch after 1-4 and 1-8 to match the concept ladder (§6.3) |
| 2026-10-17 | Star thresholds round up to whole drops |
| 2026-10-17 | Challenges stay on the old objectives and score star until §4.2 is decided |
| 2026-10-17 | Risers drawn with a gold ▲ chevron cap and a corner rows-left badge (red and pulsing at 1); upward trail only while moving up. Replaces the gold-ring design |
| 2026-10-17 | Static blocks added to build phase 3 |
| 2026-10-17 | Adventure tide: one step per sector (S1 = 0, S2 = 1, S3 = 2); pool at tide t = 1–4 × 2^t |
| 2026-10-17 | Static blocks are fixed and unbreakable |
| 2026-10-17 | Blast impact at high tides must be reduced; method left as a TODO for playtesting (§11 #7) |
| 2026-10-17 | Tier names: 256 Hypernova, 512 Blazar, 1024+ Singularity. Each doubling gets a glow ring in its tier colour; the orb keeps its sign colour |
| 2026-10-17 | Sectors grow now: Sector 2 = 14 levels (boss 2-12), Sector 3 = 15 levels (boss 3-13) |
| 2026-10-17 | Onboarding as built: Hold/Swap hints wait until 3 drops into a level; Hold and Swap appear in Discoveries once used or hinted; Classic shows Power-ups just in time on the first special orb or Overdrive charge, and Dark Matter + rising rows on the first rising row |
| 2026-10-17 | Fairness as built: shuffled bag of ± each pool value; Collect number at least every 4 deals; 20% chance (45% on Big Orb) to deal a match for a column top; a Riser's opposite within 3 deals |
| 2026-10-17 | Null Core: touching blast = 1 HP; laser through it, crater over it, Hyperspace and super-weapons = 3; can't be swapped; rises with rows |
| 2026-10-17 | Survive headroom = empty rows above the tallest column, red line excluded |
| 2026-10-18 | Tier orbs (8+) drop the glow ring: border and glow take the tier colour; positives get a tier-tinted body, negatives a dark red body with a tier-colour core and softer glow |
