# Local notification plan

Goal: bring players back daily in the first week, then taper off so reminders never feel like spam.

## What ships today (`www/game.js` ~5153)

- Three fixed reminders at +1, +3 and +7 days, counted from the moment the app is backgrounded.
- Same generic copy for everyone.
- Rescheduled every time the app goes to background, cancelled on foreground (good: never fires mid-session).
- Permission asked once, after the first Adventure win (good moment, keep it).

Problems:

1. **Bad timing.** "+24h from leaving" means a 1am session gives a 1am reminder.
2. **Gaps.** Nothing on days 2, 4–6, and silence forever after day 7.
3. **Generic copy.** It never mentions the player's own progress, which is the strongest pull back.
4. **No off switch.** No in-app reminders toggle in Settings.
5. **No measurement.** Taps on a reminder aren't tracked, so we can't tell what works.

## Schedule

Counted in calendar days since the last session. Every reminder cancels and reschedules when the app is backgrounded, so playing resets the ladder.

| # | Day | Purpose |
|---|-----|---------|
| 1 | D1 | Habit: "your next level is waiting" |
| 2 | D2 | Habit: progress or near-miss hook |
| 3 | D3 | Habit: stars or Classic best |
| 4 | D5 | Re-engage |
| 5 | D7 | Re-engage, strongest hook |
| 6 | D10 | Lapsing |
| 7 | D14 | Lapsing |
| 8 | D30 | Last call, then stop for good until they play again |

Daily for the first three days (when the habit forms), then tapering. Daily reminders forever would only make sense once there is new content each day (see Phase 2).

## Time of day

- **Learn the player's hour.** Store the local hour of the last ~10 session starts; use the median.
- **Default:** 18:30 local until we have 3 sessions.
- **Quiet hours:** clamp to 10:00–21:00 local. Never before 10 or after 21.
- **Minimum gap:** the D1 reminder must be at least 16h after leaving. If not, it moves to the next day.
- **Small jitter** (±10 min) so it doesn't feel robotic.

Example: plays at 23:40 most nights → median hour 23 → clamped to 21:00 → D1 reminder lands tomorrow at ~21:00.

## Copy: personal first, generic as fallback

Each reminder picks the most relevant hook from the save data, without repeating the previous one:

| Hook | Condition | Example |
|------|-----------|---------|
| Next level | an unlocked, uncleared node | "Level 2-4 is ready. Can you zero it out?" |
| Near miss | last run on a node was a fail | "You were 1 away on 2-3. Try again?" |
| Missing stars | cleared nodes under 3 stars | "4 levels in Sector 2 still need a star." |
| Classic best | has a Classic high score | "Your best is 4,210. Today's the day?" |
| Big orb | bestOrb below the top tier | "You've made a 64 orb. Ready for 128?" |
| Generic | fallback | "The reactor misses you. Drop in for a quick run." |

D1–D3 favour "next level" and "near miss" (short, easy wins). D7+ favour "missing stars" and "Classic best". Body under ~90 characters so it's not cut off on the lock screen.

## Controls

- **Settings toggle: "Daily reminders"** (on by default once permission is granted).
  - Off: cancel everything, schedule nothing.
  - On but OS permission denied: show a short note telling the player to turn notifications on in the phone's Settings. (A button that opens those settings would need an extra native plugin; not added yet.)
- **Re-ask once.** If they dismissed the first prompt, ask again only after their 3rd win, behind our own soft prompt ("Want a daily nudge?"), so we don't burn the one iOS system prompt.

## Measurement

- Add a `localNotificationActionPerformed` listener and send `reminder_open` to analytics, with the reminder slot (D1…D30) and the hook type.
- Also track `reminders_enabled` / `reminders_disabled`.
- Things to watch: return rate per slot and per hook. Drop slots or hooks that don't bring players back.

## Implementation notes

- All local: no server, no Firebase Cloud Messaging needed.
- Keep IDs 101–108 so `cancelReminders()` still clears the old set.
- Build the copy when the app is backgrounded (save data is fresh then).
- iOS allows 64 pending local notifications; 8 is well under that.
- Android: `allowWhileIdle` is already set; inexact delivery (±15 min) is fine for this.

## Phase 2 (optional, needs a game feature)

Daily reminders work best when there's something new each day. A **Daily Puzzle** (one seeded board per day) plus a **play streak** would justify:

- A daily reminder at the player's hour while the streak is alive.
- An evening "streak at risk" reminder (~20:00) if today's puzzle isn't done.

That's a feature of its own; Phase 1 above stands without it.
