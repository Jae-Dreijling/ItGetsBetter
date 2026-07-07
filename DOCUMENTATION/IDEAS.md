# ItGetsBetter — Future Ideas

A collection of ideas for features that are not planned for any current phase. These are creative concepts to revisit when the core app is mature and stable.

---

## Overview

| # | Idea | Usefulness | Ease of Adding |
|---|---|---|---|
| 1 | ~~Companion Mascot~~ | ✅ **Built** | Speech bubble + event messages |
| 2 | ~~Fun Weight Loss Comparisons~~ | ✅ **Built** | Shows on weight page with emoji |
| 3 | ~~Weight Comparison Achievements~~ | ✅ **Built** | 7 achievements (apple → toddler) |
| 4 | ~~Exercise Calorie Estimation~~ | ✅ **Built** | MET-based math, auto-calculates on log, custom kcal/min for "Other..." types |
| 5 | ~~Meal Burn-Off Suggestions~~ | ✅ **Built** | Optional calories on meal log + 🔥 button shows burn-off times |
| 6 | ~~Points Notification~~ | ✅ **Built** | Toast shows "+X for Y" on earn |
| 7 | ~~Label Management (CRUD in settings)~~ | ✅ **Built** | Settings → Labels |
| 8 | ~~Grocery Lists (boodschappenlijstjes)~~ | ✅ **Built** | Templates + shopping mode |
| 9 | ~~Progressive Habits (auto-increasing difficulty)~~ | ✅ **Built** | Auto-advance on 75% consistency |
| 10 | ~~Habit Formation Threshold (30 days, 75% consistency)~~ | ✅ **Built** | Progress bar + enforcement |
| 11 | ~~Habit Chaining (linked sequences)~~ | ✅ **Built** | Chain creation + "Next up" flow |
| 12 | ~~Medicine Hides When Taken~~ | ✅ **Built** | Shows "All taken ✓" summary |
| 13 | ~~Book Reading Tracker~~ | ✅ **Built** | Page tracking + rating + notes |
| 14 | ~~"Can't Fail" Habit Fallback~~ | ✅ **Built** | Half credit, half points |
| 15 | ~~Companion Chat (Pattern Matching)~~ | ✅ **Built** | Long-press companion → chat |
| 16 | Companion AI (Real Conversations) | ⭐⭐⭐⭐⭐ | ⭐ (very hard — API/self-hosted/native options) |
| 17 | ~~Gamification / RPG Progression~~ | ✅ **Built** | XP levels + 6 character stats + class identity, Character Sheet in Me |
| 18 | ~~Meditation Timer~~ | ✅ **Built** | Duration presets + custom, 3 configurable sounds, interval markers |
| 19 | ~~Pomodoro Timer~~ | ✅ **Built** | Configurable focus/break cycles, timer icon in To-Do tab |
| 20 | ~~Skincare & Hair Tracking~~ | ~~removed~~ | ~~removed~~ |
| 21 | ~~Daily Chronological Timeline~~ | ✅ **Built** | View layer over existing data, no new DB needed |
| 22 | ~~Current Focus (Homescreen Spotlight)~~ | ✅ **Built** | Bottom-sheet picker, prominent card on home |
| 23 | ~~Motivation Vault~~ | ✅ **Built** | Me → Motivation Vault, grouped by category |
| 24 | ~~Weather Check (Optional, Online-Only)~~ | ✅ **Built** | Open-Meteo, opt-in toggle in settings |
| 25 | ~~Barcode Scanning (Optional Meal Aid)~~ | ~~removed~~ | ~~removed~~ |
| 26 | ~~Pomodoro Sound Alerts~~ | ✅ **Built** | Two configurable sounds (focus end + break end) with Preview, saved in localStorage |
| 27 | ~~Companion — Expanded Triggers, Personality Groups, Smarter Behaviors~~ | ✅ **Built** | 9 new trigger categories (22 total), live shared "Personality Group" message pools, data-aware nudges, affinity bleeding |

---

## 1. Companion Mascot — ✅ BUILT

~~A cute character that lives in the app and talks to you.~~

**Implemented:** Companion system with avatar image upload and 11 event-specific message pools (general, morning greeting, welcome back, achievement, habit completed, low mood, fasting goal, streak, phone-free, points, weight loss). Multiple companions with switching. Default companion pre-loaded with built-in messages. Home screen shows speech bubble with avatar icon. Replaces the old plain-text supportive message system. Accessible from Me → Companions.

---

## 2. Fun Weight Loss Comparisons — ✅ BUILT

~~When you lose weight, show relatable comparisons.~~

**Implemented:** Weight page shows a green card with emoji and comparison text when you've lost weight (e.g., "🐱 You've lost 2.3kg — that's a kitten!"). 12 comparisons from apple (0.2kg) to bicycle (20kg).

---

## 3. Weight Comparison Achievements — ✅ BUILT

~~The fun comparisons above double as unlockable achievements.~~

**Implemented:** 7 weight loss achievements already in the achievement library since Phase 4: Apple (0.2kg), Kitten (2kg), Cat (5kg), Bowling Ball (5kg), Melon (7kg), Puppy (10kg), Toddler (15kg).

---

## 4. Exercise Calorie Estimation — ✅ BUILT

~~After logging an exercise, automatically estimate how many calories were burned.~~

**Implemented:** MET-based formula `calories = (kcal_per_min × user_weight_kg / 70) × duration_minutes`. 9 built-in exercise types with researched kcal/min values (Running 9.8, Walking 3.9, Weight Lifting 4.7, Boxing 8.3, Dancing 5.3, Swimming 8.3, Cycling 6.8, Home Workout 5.8, Planking 3.8). "Other..." exercises can set a custom kcal/min value (stored in localStorage, labeled "per 70kg average person"). Only calculates when duration is logged. Uses the user's latest logged weight for personalisation; skips if no weight entry exists. Result shown as `~X kcal` on the exercise card.

---

## 5. Meal Burn-Off Suggestions — ✅ BUILT

~~After logging a meal, show a fire icon button that opens "ways to burn this off".~~

**Implemented:** Optional "Calories?" field when logging a meal. When calories are entered, a 🔥 fire button appears on the meal card. Tapping it opens a bottom sheet showing 7 exercises (Running, Cycling, Swimming, Boxing, Dancing, Home Workout, Walking) with estimated burn times — adjusted for the user's latest logged weight, or 70kg if none is set. Tone is informational, not guilt-driven. Reuses the MET-based math from #4.

---

## 6. Points Notification — ✅ BUILT

~~When you earn points, show a small celebratory notification/toast.~~

**Implemented:** Golden toast appears in the top-right corner showing "+X for Y" (e.g., "+5 logging a meal") whenever points are earned. Auto-dismisses after 2.5 seconds. Multiple toasts stack.

---

## 7. Label Management — ✅ BUILT

~~Add a dedicated settings page where you can configure, add, delete, and edit labels.~~

**Implemented:** Settings → Labels. Full CRUD with 10 color options. Labels shared across habits and tasks.

---

## 8. Grocery Lists (Boodschappenlijstjes) — ✅ BUILT

~~A grocery list feature with saved templates.~~

**Implemented:** Saved template lists with items + quantities, "Start Shopping" button to combine templates into a trip, check off while shopping, add items on the fly, reset lists. Accessible from Me → Grocery Lists and side menu.

---

## 9. Progressive Habits (Auto-Increasing Difficulty) — ✅ BUILT

~~Habits that automatically increase their target over time.~~

**Implemented:** Configurable progression on any habit: start value, increment, interval (days), unit (free-text with smart time conversion — 60s → 1min), optional cap. Auto-advances when 75% consistency is met in the interval. Pause button to freeze progression. "Mastered" 👑 badge when cap is reached. Current target displayed inline on To-Do page and habit management.

---

## 10. Habit Formation Threshold — ✅ BUILT

~~Change the habit enforcement to require 30 days at 75% consistency.~~

**Implemented:** Each habit shows a progress bar (Day X/30 · Y% consistency). Bar turns green at 75%+. "Habit formed!" badge when complete. `canActivateInCategory()` blocks new habits in the same label until existing ones are formed, showing which habit is blocking and how many days remain.

---

## 11. Habit Chaining — ✅ BUILT

~~Link habits into sequences so completing one immediately prompts the next.~~

**Implemented:** Habits Management → Chains section. Select 2+ unchained habits in order to create a chain. In the To-Do view, chained habits are grouped in a bordered card with 🔗 indicator. The first uncompleted habit shows "Next up →" label. Completed chain habits dim. You can skip any step. Each habit keeps its own points, streaks, and formation tracking. Remove individual habits from a chain or delete the entire chain.

---

## 12. Medicine Hides When Taken — ✅ BUILT

~~On the homepage, hide medications from the checklist once they've been taken for the day.~~

**Implemented:** Taken medicines are hidden from homepage. When all are done, shows green "All X medications taken ✓" summary. Also added frequency-aware display — "every other day" medicines only show on their scheduled days.

---

## 13. Book Reading Tracker — ✅ BUILT

~~Track books you're reading.~~

**Implemented:** Add books with title, author, total pages. Update current page with progress bar. Mark as finished with 1-5 star rating and notes. Currently reading and finished sections. Accessible from Me → Books and side menu.

---

## 14. "Can't Fail" Habit Fallback — ✅ BUILT

~~Every habit can have a configured "easy version" fallback.~~

**Implemented:** Optional "Can't fail version" field on habits. To-Do view shows amber "Can't fail: [description]" button. Completing via can't-fail earns half points (2 instead of 5) and is tracked as `is_cant_fail: true`. Counts for streaks and formation threshold. Toast shows "+2 can't fail — still counts!"

---

## 15. Companion Chat (Pattern Matching) — ✅ BUILT

~~A chat interface where you can "talk" to your companion character.~~

**Implemented:** Long-press the floating companion icon to open a chat panel (half-screen, expandable to full-screen with maximize button). Type messages and the companion responds using keyword matching against their message pools. Detects mood keywords (sad, stressed → mood_low pool), health keywords (ate, exercise → habit_completed pool), and stat queries ("how am I doing?" → live daily stats, "how many points?" → points balance, "what should I do?" → personalized suggestions based on today's data). Typing indicator with bounce animation. Chat clears on close. Companion greets you on open.

---

## 16. Companion AI (Real Conversations)

Upgrade the companion from pattern matching (#15) to actual AI-powered conversations. The companion understands context, gives real advice, and responds naturally in their configured personality.

Three possible approaches, each with different tradeoffs:

### Option A: External API (Easiest, breaks privacy)
- Connect to OpenAI, Anthropic, or similar API
- Fast, high quality, works on any phone
- **Downside:** Conversations go through third-party servers — breaks the "no third party sees my data" rule
- Could mitigate by sending only the message text, not health data — but then the AI can't reference your stats
- Cost: pay-per-use API fees

### Option B: Self-Hosted AI (Privacy-safe, medium effort)
- Run Ollama, LocalAI, or similar on your own computer/server at home
- Phone connects to YOUR server over home network or VPN
- Data stays entirely yours — no third party involved
- **Downside:** Only works when you're home (unless you set up remote access). Needs a decent computer with a GPU (or patience with CPU inference)
- Cost: electricity + hardware you already own

### Option C: On-Device Native (Best, hardest)
- Convert the PWA to a native app (React Native or similar)
- Run a small model (1-3B parameters) directly on the phone using llama.cpp or MLX
- Fully offline, fully private, no server needed
- **Downside:** Leaves the PWA architecture entirely. Requires native app development skills. Only works on newer phones with enough RAM (4GB+). Slow on older devices.
- Cost: significant development effort

### Recommendation
Start with Option B (self-hosted) as an optional feature for desktop use. Keep the pattern matching (#15) as the default for phone. Only consider Option C if the app ever moves to native.

| Usefulness | Ease of Adding |
|---|---|
| ⭐⭐⭐⭐⭐ | ⭐ (very hard — infrastructure, privacy constraints, hardware requirements) |

---

## 17. Gamification / RPG Progression

Layer an RPG-style progression system on top of the existing points economy: levels, XP bars, maybe simple stats (Discipline, Vitality, Consistency) that go up as related habits/logs are completed.

- Reuses `pointsTransactions` as the XP source — no new earning logic needed, just a leveling curve on top.
- "Leveling up" can trigger the existing achievement toast pattern.
- Stats could map loosely to feature categories (e.g., meals/water → Vitality, habits → Discipline) for a bit of personality, but should stay decorative — never gate functionality behind a "level requirement," since that would violate the "never punish absence" and "celebrate action not perfection" rules if a level drops or stalls.
- Keep numbers always non-decreasing, same as points today.

Depends on: Points System (already built).

---

## 18. Meditation Timer — ✅ BUILT

~~A simple countdown timer for meditation sessions, optionally logging session length to a lightweight history.~~

**Implemented:** Me → Meditation. Preset durations (5, 10, 15, 20, 30 min) + custom input (1–180 min). Three fully configurable sounds (Start, End, Interval marker) chosen from 6 synthesized Web Audio API tones: Soft Bell, Bowl Gong, Chime, Deep Tone, Gentle Ping, Ding — or None. Interval marker fires every 1, 2, 5, or 10 minutes during the session. Settings gear → bottom sheet with per-slot pickers + Preview buttons. Clean 3-phase UI: setup (duration + ring preview) → active (depleting ring, Pause/Stop) → done (completion screen). No streaks, no logging pressure.

---

## 19. Pomodoro Timer — ✅ BUILT

~~A focus-timer (work/break cycles, typically 25/5) for the user's school/work tasks.~~

**Implemented:** To-Do tab has a Timer icon (top right) → launches Pomodoro page. Fully configurable: focus duration (1–90 min, default 25), short break (1–30 min, default 5), long break (5–60 min, default 15), sessions before long break (1–8, default 4). Settings stored in localStorage, persist across sessions. SVG ring countdown, session progress dots, Start/Pause/Reset controls. Auto-advances through work → short break → long break cycle with vibration on completion. "Start over" to reset the full cycle.

---

## 20. ~~Skincare & Hair Tracking~~ — Removed

---

## 21. Daily Chronological Timeline — ✅ BUILT

~~A single scrollable timeline view showing everything logged "today" (or any day) in time order, rather than scattered across separate feature pages.~~

**Implemented:** Me → My Day. Aggregates Weight, Meals, Water, Exercise, Mood, Sleep, Medicine (taken only), Habit completions, Measurements, and completed Tasks for any selected day. Entries sorted chronologically with time labels (HH:MM), a vertical line with dots, and cards showing emoji + label + detail. Prev/Next day navigation. Empty state for days with no logs. No new DB schema needed — pure read-only view over existing tables.

---

## 22. Current Focus (Homescreen Spotlight) — ✅ BUILT

~~Let the user designate one feature as their "current focus," which then gets a dedicated, prominent shortcut on the home screen — above the regular quick actions.~~

**Implemented:** Home screen shows a dashed "Set a current focus…" prompt when unset. Tapping opens a bottom-sheet picker with 10 options (Weight, Meals, Water, Fasting, Exercise, Habits, Mood, Sleep, Medicine, Reading). When set, a prominent gradient card appears at the top with emoji, label, description, and a "Go →" button. "Change" and "Clear" links directly on the card. Stored in localStorage — no DB needed.

---

## 23. Motivation Vault — ✅ BUILT

~~A place to store *why* a goal matters, separate from the goal's tracked numbers.~~

**Implemented:** Me → Motivation Vault. Write free-text reasons grouped by category (General, Weight, Habits, Exercise, Health). Notes displayed grouped by category, newest first. Delete individual notes with trash icon. Fully backed up in .igb backup files. DB version 11.

---

## 24. Weather Check — ✅ BUILT

~~A small, strictly optional home-screen weather snippet — today's conditions for a location the user sets, shown only when online.~~

**Implemented:** Open-Meteo API (free, no API key, sends only lat/lon for Velp, Gelderland). Opt-in toggle in Settings with privacy disclaimer. Home screen card shows current temp, feels-like, and WMO weather emoji + label. 30-minute sessionStorage cache to avoid repeat fetches. Card silently hides when offline or disabled — no error state.

---

## 25. ~~Barcode Scanning (Optional Meal Aid)~~ — Removed

---

## 26. Pomodoro Sound Alerts — ✅ BUILT

~~An expansion of the Pomodoro timer (#19) that plays a chosen sound at key moments.~~

**Implemented:** Two configurable sound events — "Focus session ends" and "Break ends" — using the same 6-option Web Audio API sound library as Meditation Timer (#18). Picker lives inside the Configure Timer bottom sheet under a "Sounds" divider. Each event has an independent sound picker with a Preview button. Settings stored in localStorage (`igb_pomo_sound_work_end`, `igb_pomo_sound_break_end`). Sounds play alongside the existing vibration on auto-advance. Falls back silently if the browser blocks autoplay. Active sounds summarised as a small line below the session info card (e.g. "🔔 focus end · 💫 break end").

---

## 27. Companion — Expanded Triggers, Personality Groups, Smarter Behaviors — ✅ BUILT

~~Brainstormed ideas for making the companion system (#1, #15) feel more interactive: more trigger categories, personality templates, and smarter idle behavior.~~

**Implemented:**

**9 new trigger categories** (22 total — see [DOCUMENTATION/characters/template.txt](characters/template.txt) for the full list and exactly what fires each one): Weight Gain/Plateau, Exercise Logged, Water Goal Met, Sleep Logged, Personal Best (longest fast ever, most weight lost ever), Level Up (checked on app open against last-seen level/class), Boss Defeated, Goodnight (fires in the 30 minutes right before the Phone-Free window, 90–60 min before sleep time), and First-Time Milestone (first-ever meal/exercise/weight/habit/task/book). Region Unlocked was dropped — the Map page's region-unlock mechanic doesn't actually exist in code yet, so there was nothing real to hook into.

**Personality Groups (Option B — live shared pools).** New `personalityGroups` table; a companion optionally belongs to one group via `personality_group_id`. At message time, a companion's pool for any category is its own lines *plus* its group's lines, merged reactively (`useEffectiveMessages` in `useCompanion.ts`) — editing a group's messages updates every companion using it immediately, no re-save needed per companion. Managed from Me → Companions → Personality Groups, reusing the same category editor UI (`MessagePoolEditor.tsx`, extracted from the Companion form) and the same paste/`.txt`/"Import All Categories" flow.

**Data-aware nudges** (`lib/companionNudges.ts`) — during idle moments, occasionally checks real state (overdue tasks, low water after 2pm, no meals logged by 3pm) and shows a contextual line instead of canned idle text.

**Affinity bleeding into the home screen** — if the active companion is a Lover with Journey affinity ≥60, idle moments have a chance to show one of their Lover Messages instead of a plain idle line, connecting the Journey affinity system to the everyday home-screen companion.

**Also fixed along the way:** `fastingRecords` was written to via `db.table('fastingRecords')` without ever being declared in the Dexie schema — every "Break Fast" tap was silently throwing before the points/companion-message logic ran. Now a proper typed table, included in backups.

---

*Add new ideas here as they come up. These are seeds, not commitments.*