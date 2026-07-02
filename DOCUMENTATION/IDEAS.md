# ItGetsBetter — Future Ideas

A collection of ideas for features that are not planned for any current phase. These are creative concepts to revisit when the core app is mature and stable.

---

## Overview

| # | Idea | Usefulness | Ease of Adding |
|---|---|---|---|
| 1 | ~~Companion Mascot~~ | ✅ **Built** | Speech bubble + event messages |
| 2 | ~~Fun Weight Loss Comparisons~~ | ✅ **Built** | Shows on weight page with emoji |
| 3 | ~~Weight Comparison Achievements~~ | ✅ **Built** | 7 achievements (apple → toddler) |
| 4 | Exercise Calorie Estimation | ⭐⭐⭐ | ⭐⭐ (needs research for accuracy) |
| 5 | Meal Burn-Off Suggestions | ⭐⭐⭐ | ⭐⭐ (depends on #4) |
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
| 17 | Gamification / RPG Progression | ⭐⭐⭐⭐ | ⭐⭐ (extends existing points system) |
| 18 | Meditation Timer | ⭐⭐⭐ | ⭐⭐⭐ (simple, self-contained) |
| 19 | Pomodoro Timer | ⭐⭐⭐ | ⭐⭐⭐ (simple, self-contained) |
| 20 | Skincare & Hair Tracking | ⭐⭐⭐ | ⭐⭐ (mirrors measurements + progress photos pattern) |
| 21 | Daily Chronological Timeline | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ (view layer over existing data) |
| 22 | Current Focus (Homescreen Spotlight) | ⭐⭐⭐⭐ | ⭐⭐⭐ (mostly UI/config) |
| 23 | Motivation Vault | ⭐⭐⭐ | ⭐⭐⭐ (simple new entity) |
| 24 | ~~Weather Check (Optional, Online-Only)~~ | ✅ **Built** | Open-Meteo, opt-in toggle in settings |
| 25 | Barcode Scanning (Optional Meal Aid) | ⭐⭐⭐ | ⭐⭐ (camera + lightweight API lookup) |

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

## 4. Exercise Calorie Estimation

After logging an exercise, automatically estimate how many calories were burned based on:
- Exercise type
- Duration
- Intensity (sets/reps/weight or distance)
- User's body weight

Display as: "You burned approximately 320 calories!" 

Note: estimates are inherently inaccurate. Frame it as approximate ("roughly", "around") and never use it as a precise tracking metric.

---

## 5. Meal Burn-Off Suggestions

After logging a meal, show a fire icon button that opens "ways to burn this off":
- "Walk for 35 minutes"
- "Run 2.5km"
- "15 minutes of jumping jacks"
- "Dance for 20 minutes"

This is NOT about guilt — it's about awareness and fun. The tone should be playful: "If you felt like moving, here are some options" not "You need to burn this off."

Important: this feature requires calorie estimation for meals (either manual input or AI-based), which doesn't exist yet. Consider building this after the calorie estimation feature.

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

## 18. Meditation Timer

A simple countdown timer for meditation sessions, optionally logging session length to a lightweight history.

- Preset durations (5/10/15/20 min) + custom, consistent with "Preset Over Freeform" (Rulebook 3.2).
- Optional ambient sound or just silence — keep it simple, this isn't a meditation app, it's a timer.
- Could log to a generic "mindfulness" or "wellness" label shared with habits/tasks.
- No streak pressure by default — completing a session is the win, length is secondary.

---

## 19. Pomodoro Timer

A focus-timer (work/break cycles, typically 25/5) for the user's school/work tasks.

- Could optionally link to a specific Task — "focus on this" — so completed pomodoros show up against that task.
- Simple start/pause/reset UI. No need for deep configuration in v1 (custom interval lengths can be a later refinement).
- Natural fit alongside Tasks in the To-Do tab, but should live as its own small tool so it doesn't bloat the task UI.

---

## 20. Skincare & Hair Tracking

Track skin and hair progress the same way body measurements and progress photos already work.

- Skin: dated photo log (face, optionally by area), free-text notes (breakouts, products used, reactions), optional 1-5 "skin feeling" score — same pattern as mood.
- Hair: dated photo log + simple notes (growth, shedding, products).
- Should reuse the existing Progress Photos lifecycle (compression at 1 year, 6-month download reminder, never auto-deleted) rather than building a new photo pipeline from scratch.
- Sensitive data — same privacy tier as progress photos (PP-03), should sit behind App Lock if enabled.

Depends on: Progress Photos feature (already built) — this is mostly a new entity using the same lifecycle/storage logic.

---

## 21. Daily Chronological Timeline

A single scrollable timeline view showing everything logged "today" (or any day) in time order, rather than scattered across separate feature pages.

```
Today

07:42  ⚖ Weight        98.4kg
08:05  🥣 Breakfast     ⭐⭐⭐⭐☆
09:30  💧 Water         500ml
12:15  🚶 Walk          32 min
20:15  😊 Mood          4/5
```

- This is a read-only aggregation view — it queries existing tables by `logged_at`/`date` and renders a unified list. No new data model needed, no duplicated state.
- Naturally surfaces gaps in a day without ever framing them as "missed" — an empty stretch on the timeline just reads as empty, not flagged red (stays consistent with "Backfill Without Guilt," Rulebook 3.4).
- Good candidate for a tab on the Home screen or a new view inside "Me," since it's a daily ritual not a logging action.
- Could double as the natural surface for backfilling — tap an empty timeline slot to add a past-time entry.

---

## 22. Current Focus (Homescreen Spotlight)

Let the user designate one feature as their "current focus," which then gets a dedicated, prominent shortcut on the home screen — above the regular quick actions.

- Simple settings toggle: "What are you focusing on right now?" → pick from existing loggable features.
- This is just UI prioritization on top of existing pages — no new tracking logic.
- Directly implements Rulebook 2.3 ("Frequency Determines Prominence") but lets the *user* declare prominence instead of the app inferring it from usage stats — a nice complement to (not a replacement for) frequency-based ordering.
- Should be easy to change or clear at any time — no commitment pressure, no "you abandoned your focus" messaging if it changes weekly.

---

## 23. Motivation Vault

A place to store *why* a goal matters, separate from the goal's tracked numbers.

- User picks a goal (weight milestone, habit, exercise consistency, etc.) and attaches free-text "reasons" — as many as they want, added any time.
- Tapping the goal anywhere in the app (weight page, habit card) could surface these reasons — a quiet reminder of intent, not a nag.
- Useful precisely during low-motivation moments; pairs well with the existing supportive-message system without replacing it.
- New entity is simple: `motivationNotes { id, linked_goal_type, linked_goal_id, text, created_at }`. No dependencies on unbuilt features.

---

## 24. Weather Check — ✅ BUILT

~~A small, strictly optional home-screen weather snippet — today's conditions for a location the user sets, shown only when online.~~

**Implemented:** Open-Meteo API (free, no API key, sends only lat/lon for Velp, Gelderland). Opt-in toggle in Settings with privacy disclaimer. Home screen card shows current temp, feels-like, and WMO weather emoji + label. 30-minute sessionStorage cache to avoid repeat fetches. Card silently hides when offline or disabled — no error state.

---

## 25. Barcode Scanning (Optional Meal Aid)

An optional camera-based barcode scanner to speed up meal logging for packaged food — looks up a product name (and optionally calories) via a lightweight public food-database API, then pre-fills the meal name field.

- Strictly an input *shortcut*, not a new tracking paradigm: the result only pre-fills the existing `name` field (and optional `calories` field, ML-03) on the meal form. The required health score (1-5) is still always manual — this must not become a backdoor to automated nutrition scoring, which the PRD explicitly rejected (see "Meal Photo AI Analysis," Won't Have Yet).
- Single outbound lookup per scan (product barcode → name/calories), nothing cached or sent in the background. Same opt-in/off-by-default treatment as Weather Check — state clearly in settings that scanning sends the barcode to a third-party lookup.
- Falls back gracefully to manual name entry if offline or the barcode isn't found — never blocks logging.
- Camera access reuses the same `<input type="file" capture>` / MediaDevices pattern already used for meal photos (Architecture 7.2).

---

*Add new ideas here as they come up. These are seeds, not commitments.*