# Nullfall: Adventure Objectives

Status: **draft for review** (2026-10-17). Design only; no game code has changed.
Replaces an earlier redesign (deleted 2026-10-17), which was rejected as too complex.
Scope: Adventure node map and bonus rifts. Classic mode doesn't change.
Board: 6 columns × 8 rows. The top row is the red line.
Part of the [Game Design Document](gdd.md). Level building, Number Tide and sector sizes are covered there.

---

## 1. Principles

1. **One goal per level.** The strip shows one icon, one number counting down, and drops left.
2. **The goal uses moves you already make**: placing, blasting, merging.
3. **Counters only go down**, never back up.
4. **Lasers, Overdrive and specials are tools**, never goals.
5. **Stars come from drops left.** Score is kept only for "best score".
6. **Introduce one new thing at a time.** A new goal or obstacle first appears in a calm level with nothing else going on.
7. **At most one obstacle per level** on top of the goal. Obstacles are Risers or rising rows.

---

## 2. Objectives

| # | Objective | Strip | Role |
|---|---|---|---|
| 1 | Zero Out | ○ Clear 20 | Core |
| 2 | Collect | `3` Pop 10 | Core |
| 3 | Break the Cores | ◈ Break 5 | Core |
| 4 | Catch the Stars | ⭐ Catch 5 | Core |
| 5 | Risers | ⬆ Clear 4 | Goal + obstacle |
| 6 | Survive | ⏳ 15 drops | Tension levels |
| 7 | Drain the Null Core | 🔴 20 | Boss |
| 8 | Big Orb | `16` Make 1 | Bonus rifts |

### 2.1 Zero Out ○
**Clear N orbs.**
- Every orb that leaves the board counts −1: blasts, lasers, special orbs, Frenzy.
- **Merging doesn't count**, because nothing leaves the board.
- One Zero Blast removes 2 orbs, so it counts −2.
- This is the teaching goal, used in the first levels.

### 2.2 Collect `3`
**Pop N orbs showing a number.** The strip shows a neutral orb chip with the number and no sign.
- **Either sign counts:** `+3` and `−3` both count.
- Removal counts the same way as Zero Out (any cause except merging). A ±3 Zero Blast counts −2.
- Design rule: the target number must appear in the level's orb pool often enough to be fair.

### 2.3 Break the Cores ◈
**Break N Dark Matter cores.**
- A core has 2 HP. Each blast touching it removes 1 HP.
- At 0 HP it shatters into a random number orb.
- Each shatter counts −1. That includes cores that arrive later in rising rows.
- Design rule: the level must have at least N cores, counting both the starting board and any that arrive later.

### 2.4 Catch the Stars ⭐
**Catch N stars.**
- Stars sit in empty cells, never on the red line.
- Any orb that **comes to rest on a star's cell** collects it. That includes an orb you drop there, one that falls after a blast, and one pushed up by a rising row.
- Stars stay in place; they don't fall.
- **What makes it interesting:** high stars mean building a stack toward the red line, which is risky.

### 2.5 Risers ⬆
A Riser is a number orb (e.g. `+3`) with a glowing up-arrow.
- **Climbing:** after each drop, once the board settles, every Riser climbs one row.
  - If a tile is above it, the two swap places.
  - If the space above is empty, the Riser floats up into it. Risers ignore gravity, so orbs dropped into that column land on top of them.
  - Swaps and Hold don't count as drops, so Risers don't climb.
- **Clearing:** cancel it with its opposite (a `−3` touching a `+3` Riser). Lasers and special orbs also clear it.
- **Merging:** a merged Riser keeps climbing (`+3` and `+3` makes a `+6` Riser). Merging buys no time.
- **Warning:** the orb shows rows left before the red line (`3`, `2`, `1`) and pulses red at `1`.
- **Failure:** a Riser reaching the red line means you **lose**, the same as a breach. A rising row can push a Riser up too.
- **Where they come from:** placed on the board at the start. Later levels can also say "a new Riser appears every K drops".
- **As a goal:** "Clear N Risers".
- **As an obstacle:** from Sector 2 they appear in other goals' levels.
- **More of them later:** one Riser in Sector 2, two or three at once in Sector 3.

### 2.6 Survive ⏳
**Survive N drops** while a new row rises every K drops.
- The counter is the number of drops left to survive. You win when it reaches 0.
- Stars use **headroom**, not drops left (see §3).

### 2.7 Drain the Null Core 🔴 (boss)
A big **2×2 core** fixed low on the board, showing an HP number.
- Each blast touching it removes 1 HP. A Cross Laser that hits it removes 3.
- You win at 0. The strip shows the number counting down.
- **Attack:** every K drops the core pushes up a row. From Sector 2 it also spawns a Riser.
- Overdrive and Frenzy are the player's big weapon here.

| Sector | HP | Attack |
|---|---|---|
| 1 | 12 | row every 5 drops |
| 2 | 20 | row every 4 drops, plus a Riser every 8 |
| 3 | 30 | row every 4 drops, plus a Riser every 6 |

### 2.8 Big Orb `16` (bonus rifts only)
**Merge your way to one orb of size X.**
- Either sign counts (−16 counts).
- You win the moment it's made.
- Bonus rifts use a pairs-friendly orb pool.

| Sector | Target |
|---|---|
| 1 | 8 |
| 2 | 16 |
| 3 | 32 |

---

## 3. Stars

| Level type | ★ | ★★ | ★★★ |
|---|---|---|---|
| All goals except Survive | Clear the level | ≥ 25% of drops left | ≥ 45% of drops left |
| Survive | Survive | Finish with ≥ 3 empty rows on every column | ≥ 5 empty rows |

- Percentages are rounded to whole drops and **shown on the intro card and the strip**, e.g. "★★ 4 left · ★★★ 7 left".
- Each leftover drop still adds +20 score. Score is used for best score only.
- The score star is removed.

## 4. Failure

You lose when:
1. A tile reaches the red line (breach).
2. A Riser reaches the red line.
3. You run out of drops before the goal is done. This doesn't apply to Survive.

The fail screen shows goal progress, the reason, and one tip for that goal.

---

## 5. Sector rollout

Each sector has 10 main nodes plus 2 bonus rifts. **New** marks where something is introduced.

**Sector 1: Subatomic Genesis** (learn the goals, no obstacles until node 9)

| Node | Goal | Obstacle |
|---|---|---|
| 1-1 | Zero Out 10 (**new**) | none |
| 1-2 | Zero Out 16 | none |
| 1-3 | Collect 6 (**new**) | none |
| 1-4 | Collect 10 | none |
| 1-5 | Break the Cores 4 (**new**) | none |
| 1-6 | Break the Cores 6 | none |
| 1-7 | Catch the Stars 3 (**new**) | none |
| 1-8 | Catch the Stars 5 | none |
| 1-9 | Survive 12 (**new**, row every 5) | rising rows |
| 1-10 | **Boss:** Null Core 12 (**new**) | core attacks |
| Bonus ×2 | Big Orb 8 | none |

**Sector 2: Ion Nebula** (introduce Risers, mix in obstacles)

| Node | Goal | Obstacle |
|---|---|---|
| 2-1 | Zero Out 20 | none |
| 2-2 | Risers: clear 2 (**new**) | none |
| 2-3 | Collect 12 | none |
| 2-4 | Catch the Stars 5 | 1 Riser |
| 2-5 | Break the Cores 6 | rising rows |
| 2-6 | Risers: clear 4 (new one every 6 drops) | none |
| 2-7 | Survive 15 (row every 4) | rising rows |
| 2-8 | Catch the Stars 6 | rising rows |
| 2-9 | Break the Cores 8 | 1 Riser |
| 2-10 | **Boss:** Null Core 20 | attacks + Risers |
| Bonus ×2 | Big Orb 16 | none |

**Sector 3: Event Horizon** (everything mixed, several Risers)

| Node | Goal | Obstacle |
|---|---|---|
| 3-1 | Collect 14 | 1 Riser |
| 3-2 | Risers: clear 5 (2 at once) | none |
| 3-3 | Catch the Stars 6 | 2 Risers |
| 3-4 | Zero Out 30 | rising rows |
| 3-5 | Break the Cores 10 | 2 Risers |
| 3-6 | Survive 18 (row every 4) | 1 Riser |
| 3-7 | Risers: clear 6 (3 at once) | none |
| 3-8 | Catch the Stars 7 | rising rows |
| 3-9 | Break the Cores 10 | rising rows |
| 3-10 | **Boss:** Null Core 30 | attacks + Risers |
| Bonus ×2 | Big Orb 32 | none |

All numbers are starting points for playtesting. These tables show the first three sectors at 12 levels each. Later sectors grow to 20 levels (GDD §5.1). Drop budgets are tuned per level by the playtest bot (GDD §5.3).

---

## 6. Removed from the current game

- Objectives `annihilations`, `synthesis_tier`, `trigger_laser` and `activate_frenzy`. Blasts, lasers and Frenzy stay as tools.
- The score star (`targetScoreForStar`) and the fixed `targetDropsForStar`. They become drops-left percentages.
- The "Pure Singles" orb pool, which made node 7's laser goal close to impossible.
- Rising rows on every node from 5 up. Rising rows now appear only where the table lists them.

## 7. Notes for the build

- Sector 3 needs its own map layout. It currently reuses Sector 1's node IDs, which clash in save data.
- Save keys stay `zeropoint_*`. Existing saved stars may need resetting, because star rules change.
- Levels are hybrid: handcrafted anchors plus generated levels, shipped as fixed data, with fresh orbs on each attempt (GDD §5.3–5.5).
- Still open: how Risers are drawn.
