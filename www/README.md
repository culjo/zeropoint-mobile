# ZERO POINT — Quantum Math Cascade

A tactile, fast-paced arithmetic arcade puzzle game where positive matter and negative anti-matter collide to reach equilibrium.

Built with **HTML5 Canvas**, **Web Audio API** (procedural synthesis, no external assets required), and modern responsive design.

---

## 🕹️ The Core Mechanics

### 1. Tiered Supernova Detonations (Bigger Numbers = Bigger Blasts!)
When two adjacent blocks sum to **`0`**, they trigger a **Zero Point Detonation**. The blast power, visual effects, and radius scale directly with the magnitude of the colliding numbers:

* **Tier 1 (±1):** Micro pop (clears the 2 tiles + 14 sparks).
* **Tier 2 (±2, ±3):** ⚡ **Pulse Shockwave** (clears tiles + deals 1 damage to orthogonal Dark Matter).
* **Tier 3 (±4 to ±7):** ⚡ **Cross Laser Blast** (fires radiant horizontal and vertical ion beams that blast across the **entire row and column**, damaging all Dark Matter in its cross path!).
* **Tier 4 (±8 to ±15):** 🌟 **SUPERNOVA CRATER** (detonates a full **3×3 area** with dual shockwaves, screen flash, and heavy screen shake, obliterating obstacles in the blast zone!).
* **Tier 5 (±16+):** 💥 **HYPERSPACE SINGULARITY** (obliterates the entire bottom rows, clears all Dark Matter, and releases a screen-wide blinding shockwave!).

### 2. Same-Sign Synthesis (Crafting Supernovas!)
When two touching tiles have the **same value and sign** (e.g. `+2 & +2 = +4`, or `+4 & +4 = +8`), they fuse together!
* Synthesizing higher numbers is how you actively **craft Supernovas** to clear massive board space!

### 3. Singularity Overdrive (Super-Weapon Arsenal!)
Skillful play—same-sign synthesis (+2%), Zero Point detonations (+2% to +18%), and Bounties—charges the **Singularity Overdrive Gauge** (0% to 100%).
* **Auto-Activation**: When the gauge reaches 100%, Overdrive **auto-activates immediately**!
* **1 Power-Up Per Fill**: Each full bar loads **one** tactical super-weapon into your launcher (cycling through the arsenal on each fill):
  1. **`[⚫ VORTEX]` Black Hole Orb**: Sucks in and clears **every single tile in the target column** (vaporizing numbers and Dark Matter cores alike) and deals damage to neighboring Dark Matter columns!
  2. **`[🌟 NOVA]` Supernova Core**: Detonates an immediate Tier 4 Supernova Crater across a **3×3 blast area**!
  3. **`[💥 NUKE]` Antimatter Nuke**: Unleashes a high-yield **3×3 area blast**!
* After deploying the super-weapon, Overdrive discharges and begins recharging from 0%.

### 4. Quantum Swap Tokens (Emergency Rescue & Setup)
Spend a Quantum Swap Token to swap **any two adjacent tiles** on the board.
* **How to Earn**: +1 Token automatically every 8 drops, +1 Token on Tier 4+ Supernovas/Singularities, and rewards from In-Run Micro-Bounties!
* **How to Use**: Press **`[S]`** or tap the **Swap Slot / Swap [S]** button, click the first tile (golden selection box), then click an adjacent tile to perform the swap.
* **Tactical Advantage**: Swapping triggers board gravity and cascade checks **without** advancing the reactor rise counter!

### 5. In-Run Tactical Micro-Bounties
Dynamic short-term objectives appear on the HUD strip:
* **Mission Types**: Cross Laser Blasts (Tier 3+), Supernova Detonations (Tier 4+), Double Fusions (synthesizing identical tiles), Cascade Surges (2x+ combos), Dark Matter Breaches, and Singularity Overdrive triggers.
* **Rewards**: Complete bounties for hefty bonus score (+400 to +800 PTS), instant Overdrive recharge (+6% to +12%), and extra **Quantum Swap Tokens**!

### 6. Cascading Chain Reactions
When blocks clear and gravity pulls the board downward, newly touching neighbors automatically evaluate.
* `2x CASCADE!` `3x CASCADE!` `SINGULARITY STRIKE!`
* Score multiplier scales exponentially with combo depth.

### 7. Quantum Modifiers
Rare special orbs appear in your launcher queue:
* **`[±] Invert`**: Flips positive to negative or negative to positive.
* **`[÷2] Divide`**: Halves the targeted tile.
* **`[×2] Amplify`**: Doubles the targeted tile.
* **`[0] Singularity Core`**: Detonates a 3x3 radius immediately.

### 8. Containment Threshold & Pressure
Every **5 drops**, dormant **Dark Matter** rises from the reactor bottom. Detonate Zero Points next to Dark Matter to crack and shatter them! If blocks cross the top red danger line, a Containment Breach (Game Over) occurs.

---

## 🎮 Controls

| Action | Desktop Keyboard / Mouse | Mobile / Touch |
| :--- | :--- | :--- |
| **Aim Column** | Move Mouse or `[←]` `[→]` / `[A]` `[D]` | Drag / Tap Column |
| **Drop Orb** | Click or `[Space]` / `[Enter]` / `[↓]` | Tap **Drop Orb** button |
| **Swap Hold** | Press `[C]` or Click Hold Box | Tap **Hold [C]** button |
| **Quantum Swap** | Press `[S]` or Click Swap Slot | Tap **Swap [S]** button |
| **Overdrive** | Auto-activates when bar reaches 100% | Auto-activates when bar reaches 100% |
| **Fullscreen Mode** | Click Expand Icon (top right) | Tap Expand Icon (top right) |
| **Restart** | Press `[R]` or Click Refresh Icon | Refresh Icon |

---

## 🚀 Running the Game

You can run it with any static web server:

```bash
# From this directory:
python3 -m http.server 8080
```

Then open `http://localhost:8080` or `http://localhost:8080/zero-point/` in your browser!
