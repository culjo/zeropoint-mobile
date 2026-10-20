# Nullfall level tools

All run in Node from the repo root; nothing here ships in the app.

| Command | What it does |
|---|---|
| `npm run playtest` | The bot plays every Adventure level 200 times and prints win rate, stars and losses. Add `-- --level 2-7`, `-- --sector 2`, `-- --games 500` or `-- --json`. |
| `npm run levelgen` | Regenerates every generated slot into `www/levelsGenerated.js`. `-- --slot 2-7` for one slot, `-- --sectors 4-10` for a range of sectors (also limits `--tune-hand`). |
| `npm run levelgen -- --slot none --tune-hand` | Prints bot-tuned drop budgets for handcrafted levels; add `--apply` to write them into `www/levels.js`. |

## Files
- `sim/engine.js`: headless rules engine (keep in step with `www/game.js`).
- `sim/bot.js`: one-move look-ahead bot and `runLevel()`.
- `templates.js`: board templates and the generated slots (goal, obstacle, title per node). Sectors 4–10 are listed in `LATE_SECTORS` as a goal order plus titles; `lateSlot()` sizes each goal and picks its obstacle.
- `targets.js`: target bot clear rate per slot.

## Workflow
1. Change a slot in `templates.js` (or a handcrafted level in `www/levels.js`).
2. `npm run levelgen -- --slot <id>` to rebuild it, or `--tune-hand --apply` for handcrafted budgets.
3. `npm run playtest -- --level <id>` to check.
4. To handcraft a generated level, open it in the in-game Level editor (debug mode → Dev tools), edit, play-test, copy the entry into `www/levels.js`. Handcrafted entries override generated ones.
