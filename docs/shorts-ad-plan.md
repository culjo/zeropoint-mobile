# Null Fall — Shorts Ad Videos (Plan)

Short vertical ads for Reels, TikTok and YouTube Shorts. A **hand icon** moves across the screen and does every move, so people who watch with the sound off still see how the game is played.
Each video starts from a **half-played board** (about half full, mid-game) instead of an empty one, so something happens in the first second.

Status: plan agreed, hooks still being tweaked. **Don't build or record until the hooks are final.**

---

## 1. Format

| | |
|---|---|
| Size | 1080 × 1920 (9:16) first; 4:5 (1080 × 1350) from the same take with `ad.js` |
| Length | 15–20 s each (12 s gameplay + 2 s end card is the target) |
| Frame rate | 30 fps H.264 + AAC (what `ad.js` already outputs) |
| Mode | Drag & place (the main gameplay), Classic rules, staged boards |
| Sound | Game music and SFX, but every video must make sense muted (captions do the work) |
| Safe zones | Captions stay out of the top ~14% and bottom ~20% (app UI and the CTA button sit there) |

## 2. The hand icon

Today the showcase autoplay (`www/showcase.js`) shows a faint white circle, and only while the finger is down. For these ads we replace it with a hand:

- **Look:** a polished white pointing hand icon (index finger out, other fingers curled, a little thumb), drawn as a crisp SVG so it stays sharp at 2.5× capture. Soft grey shading on the curled fingers for depth, a thin dark outline and a soft drop shadow so it reads on the dark board. Rounded, friendly shapes, like a well-made app tutorial hand, not a flat cursor or emoji. Fingertip is the touch point.
- **Size:** about 1.3 orbs wide, so it is clear on a phone but doesn't hide the column it drops into.
- **Always visible:** the hand rests near the tray between moves, glides to the orb, presses (shrinks a little + a small ripple), drags up to the column, lets go (lifts back up) and returns. The current marker is invisible between moves; the hand must not be.
- **Slower than the trailer bot:** a bit of hesitation over the column before dropping, so viewers can follow. Shown at roughly 0.8 s per drag instead of the bot's quick flicks.
- **Tutorial hints (optional per video):** a dotted arrow from the orb to its target column for the first move only.
- Made as an option (`--marker hand`) so the existing circle stays for the publisher videos.

## 3. Shared structure (every video)

| Time | What happens |
|---|---|
| 0–1.5 s | **Hook.** Board is already half full; the hand is already holding an orb. A short how-to-play caption at the top (one rule, under ~7 words) that says what the hand is about to do. |
| 1.5–4 s | **Teach.** One simple move that shows the rule (cancel or merge). |
| 4–12 s | **Build.** 2–4 more moves, each a bit bigger. |
| ~12 s | **Payoff.** The big moment: chain, Supernova, board clear. Caption changes. |
| last 2 s | **End card** (icon, Null Fall, tagline, DOWNLOAD NOW), already made by `ad.js`. |

## 4. The videos

### V1 — "+3 meets -3" (the rule)
- **Hook caption:** `Cancel opposite numbers to ZERO`
- **Alt hooks to test:** `Drop -3 on +3 to blast it` · `Opposites cancel. Clear the board.`
- **Board:** 4 rows filled, a +3 near the top of one column, a few easy pairs visible.
- **Moves:** hand drags -3 onto +3 → ZERO blast. Then -2 onto +2. Then a drop that makes a short 3–4 step chain.
- **Payoff caption:** `ZERO POINT!`
- **Pairs with ad copy:** Google headline 1, Meta primary text 1.

### V2 — "Bigger numbers, bigger booms" (merging)
- **Hook caption:** `Merge same numbers to GROW them`
- **Alt hooks to test:** `Stack matching numbers to merge` · `Grow big, then cancel for a huge blast`
- **Board:** half full, a +2 on top of a column, +4 and +8 placed so they merge in steps.
- **Moves:** +2 onto +2 → +4 → +8 → +16, each merge shown clearly; last move cancels the +16 with -16 → Supernova / Singularity.
- **Payoff caption:** `BIGGER BOOM`
- **Pairs with:** "Bigger Numbers, Bigger Booms", Meta primary text 5.

### V3 — "One move. 16 blasts." (cascade)
- **Hook caption:** `Line up number CASCADES and unlock new sectors`
- **Alt hooks to test:** `Line up blasts for a chain reaction` · `One drop can set off a chain`
- **Map shot (after the chain, before the end card, ~2 s):** cut to the Adventure star map with Sector 1 cleared. The hand taps the Sector 2 pill and the new world opens with its nodes lit. A gradient caption `NEW SECTOR UNLOCKED` sits over the map. This shows the "unlock new sectors" half of the hook.
  - The game has no unlock animation; a cleared boss just opens the next sector. So the shot is the real map with save data staged (Sector 1 boss beaten, Sector 2 open), and the "unlocked" message is our ad caption, not game UI.
  - Needs a new capture: `capture.js` can already tap through the home screen into the map (the Boss Run route); it needs a variant that stops on the map and taps the next sector pill.
- **Board:** the existing `cascade` set-piece, but with 1–2 small setup moves added before the big drop so it doesn't feel like a cold cut.
- **Moves:** setup cancel, short pause (hand hovers over two columns, picks one), the drop → 16-step chain.
- **Payoff caption:** `16x COMBO` (kept by choice; the recorded chain is 16 steps and the in-game counter tops out at ×18), then `NEW SECTOR UNLOCKED` on the map shot
- **Length:** runs to ~20 s with the map shot, so keep the setup to one move.
- **Pairs with:** "Set Off Chain Reactions", "Drag, Drop, Blast, Cascade".

### V4 — "Can you save it?" (on the brink)
- **Hook caption:** `Clear the board before it FILLS up`
- **Alt hooks to test:** `Keep the stack below the red line` · `Blast your way back down`
- **Board:** the `brinkclear` set-piece (seven high, red line flashing).
- **Moves:** hand hesitates between columns (tension), then the drop → 18-step chain → BOARD CLEAR.
- **Payoff caption:** `SAVED!`
- **Pairs with:** "Brain Puzzle With a Bang", "No timers. No rush."

**Recording order:** V1 → V3 → V4 (reuse existing boards) → V2 (new board).

## Captions

All hook and payoff captions use the **cyan-to-gold gradient** from the end card (`#00f2fe → #7ff8ff → #f9d423`), in heavy Inter (900), with a soft dark shadow so they read over busy blasts. A word in CAPS can get a small pop-in scale. Hooks appear at 0 s, payoffs land on the big blast frame.

## 5. How it gets made (existing tools)

1. **Hand marker** in `www/showcase.js` (CSS/SVG hand, always visible, rest position, press ripple, slower drag). Option `--marker hand` in `capture.js`.
2. **Half-played boards with short move scripts.** Set-pieces already take a `moves` list; V1 and V2 need new boards; every board starts mid-game, about half full (4–5 of 8 rows). `setpieces.js` can search for them, or they are hand-built.
3. **Capture** each with `node tools/showcase/capture.js --name short-v1 --setpiece <name> --marker hand`. V3 also needs a map capture with staged save data (Sector 1 cleared) where the hand taps into Sector 2.
4. **Cut + captions** with `cut.js edl` using a small plan file per video. Its captions today are plain white ffmpeg text, which can't do a gradient, so the captions get rendered as transparent PNGs in headless Chrome (as `ad.js` already does for the end card) and laid over the video.
5. **Frame + end card** with `ad.js` at 1080×1920 and 1080×1350. For Shorts the gameplay should fill more of the frame than the current 86% window; add a `--fill` option.

## 6. Honesty note

The starting boards are staged; every move after that follows the real game rules. That is normal for gameplay ads, but the videos should only show things the game really does (no fake UI, no features that aren't shipped).

## 7. Decisions

Agreed (2026-11-10):
- **Half played** = start mid-game on a half-full board.
- **Hand** = a nice white pointing hand icon (see section 2).
- **Videos** = V1–V4. The puzzle-bait V5 was dropped.
- **Captions** = cyan-to-gold gradient.
- **V3** ends on an Adventure map shot of Sector 2 opening, to match its "unlock new sectors" hook.

Still open:
- **Final hooks.** Being tweaked; nothing gets built until they're locked.
