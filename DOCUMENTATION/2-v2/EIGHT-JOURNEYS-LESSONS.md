# Eight Journeys → ItGetsBetter 2.0

**What this is:** an analysis of the [Eight Journeys export](../7-eight-journeys/README.md) and what its *ideas* (not its numbers) could mean for the 2.0 remake.
**Date:** 2026-10-05
**Status:** Input for 2.0 planning. Nothing here is decided.

---

## The short version

Eight Journeys was written for a different purpose than v1, but the two point at the same problem. v1 is **wide**: 26 feature folders, a game layer and many places to log things. Eight Journeys is **narrow**: a small daily minimum, one number a day, one short review a week, and rules for what to do when things drift. Its own conclusion was that too many files made it hard to use, and v1 has the same problem with pages.

Eight Journeys asks what the smallest thing is that still counts as a good day. Use that question as the starting point for 2.0, and build outward from it.

---

## 1. Structural ideas (how the app is shaped)

### 1.1 One "Today" screen + a library
Day to day you only need one short screen. Everything else (recipes, workouts, research, history) is a library you visit when you want to.
- **v1:** Home shows a lot of widgets, and logging is spread over many pages.
- **2.0:** Home = Today. Only what's relevant *now*. Everything else is one level deeper and never asks for attention.

### 1.2 The daily floor
Define a **minimum day**: 2–3 tiny actions. A day where only the floor is done is a *full* success, not a partial one. Everything else is a bonus.
- **v1:** The Rulebook says "celebrate action", but there's no explicit floor. The app shows everything you *could* do.
- **2.0:** The floor becomes a first-class concept: you choose it yourself, it's shown at the top of Today, and completing it is "done for today". Extras are visibly optional.

### 1.3 Journeys as modules with the same shape
Eight Journeys proposed a shared core (storage, check-ins, reminders, charts) with each life area as a module. Every module has the same parts:

| Part | Weight-loss example | Generic |
|---|---|---|
| Floor | Weigh in, protein breakfast, decide today | 1–3 daily minimum actions |
| Log | One number a day | The one metric that matters |
| Review | 5-min Sunday questions | Weekly check-in |
| Adjustment rules | "If trend X for 2 weeks → do Y" | Suggested changes, never automatic |
| Warning signs | Weighing several times a day, skipping meals | Patterns that mean "slow down" |
| Library | Recipes, meal options, workouts | Reference content |
| Milestones | Staged, relative goals + rewards | Same |

This could be the **architecture for 2.0**: build the core once, then weight/health is journey #1. Other areas (the other 7 journeys are still undefined) slot in later without new page types each time.

### 1.4 Warning from the source: the tool can't replace the journey
The export says: *"building the tool can become more fun than the journey itself. Start with the smallest version."* Given you've lost track and missed using the app, this applies to 2.0 directly. **Build the smallest 2.0 you'd actually use daily, use it, then grow.** This fits your one-feature-at-a-time build process.

---

## 2. Tracking ideas (what gets measured, and how)

### 2.1 Trend over daily numbers
Daily weight is noise. Only the weekly average means something. The plan *expects* jumps (after a party, salty food, a break) and says so up front.
- **v1:** The weekly review shows start/end weight for the week, and both of those are noisy single days. The weight page has no rolling average.
- **2.0:** Show the **7-day average** as the main number and the daily value small or hidden. When a jump happens, explain it in advance ("1–2 kg up after a party is water").

### 2.2 Minimal tracking by design
"One number a day, one short review a week, one measurement a month." No calorie counting; the meal options are pre-calculated instead.
- **v1:** Tracks weight, meals with a health score, water, fasting, exercise, mood, sleep, medicine, habits and more.
- **2.0:** Ask of every tracker: *does this change what I do?* If not, make it optional or drop it. Fewer inputs = less to feel behind on.

### 2.3 Pick from a menu instead of logging from scratch
Meals are chosen from a personal menu where each option already has its values. "Decide today" is a 1-minute ritual: choose lunch, dinner, snack.
- **2.0:** Meal logging = tap an option from *your* menu. A "Decide today" picker shows a running total so you never have to count. Recipes are data that feed the menu and the grocery list.

### 2.4 A safety valve you can switch on
If the daily number hurts your mood, switch to **weekly weighing** or hide the daily number entirely.
- **v1:** Nothing like this exists.
- **2.0:** A setting per metric: daily / weekly only / hidden (show only the trend). Fits the Rulebook's emotional-safety goal.

---

## 3. Behaviour ideas (what the app does when things drift)

### 3.1 Adjustment rules as a decision table
Compare the trend to 2 weeks ago. The most common outcome is **"do nothing, it works."** Skip weeks with a party, illness, travel or a break. Ignore the first few weeks.
- **v1:** Progressive habits auto-advance at 75 % consistency, which is similar in spirit.
- **2.0:** A small rules engine: *condition over N weeks → suggestion*. Always phrased as an invitation, never applied automatically. Weeks flagged with v1's **Exam / Social / Quiet modes** count as skip weeks automatically. Both directions: "too fast" gets a suggestion too, not only "too slow".

### 3.2 Warning signs → gently suggest pausing
The plan lists patterns that mean the effort is turning unhealthy (weighing many times a day, skipping meals, guilt about normal meals, losing control often), and what to do: pause, go back to normal, contact the GP.
- **v1:** Nothing watches for this.
- **2.0:** The app can detect a few of these from its own data (multiple weigh-ins in a day, long gaps without meals, frequent "overate" logs) and **gently** offer the safety valve or a pause. Never alarming, never blocking.

### 3.3 No compensation, ever
The core rule: after overeating, **don't compensate**. No skipped meals, no fasting the next day, no punishment workout. Restriction → overeating is the cycle to avoid.

**This conflicts with parts of v1:**

| v1 feature | Why it clashes with the plan |
|---|---|
| Fasting tracker with goals, streaks and points (`fasting_goal_met`) | The plan deliberately has no fasting; its research notes link restriction to overeating |
| Meal burn-off suggestions | Frames food as something to "pay off" with exercise, which is the compensation mindset |
| Meal health score with best/worst day | Turns meals into grades. The plan says nothing is banned and a day over is fine |
| Insight example "fasting 16+ h → better next meal" (PRD) | Rewards restriction |

**Suggestion for 2.0:** drop or rethink these. This is your call, but if 2.0 follows the Eight Journeys approach, these features work against it.

### 3.4 The craving flow
A 4-step guided flow: *Am I hungry?* → if yes, eat a planned snack, no guilt. If not → *name it* (bored, stressed, lonely, tired) → *10-minute timer + pick something from the "instead" list* → *still want it? have a portioned version, and that counts as a win.*
- **2.0:** A "Craving" button (or long-press on the companion) that walks through this. The companion is a natural guide here. Log the trigger in one tap; over weeks that shows patterns, which is what the v1 insight engine wanted ("you seem to binge more when stressed").

### 3.5 Planned breaks are part of the plan
Diet breaks happen on a schedule (and holidays count). The app expects them; they're not failures and they pause the adjustment rules.
- **2.0:** A "break" or "maintenance period" mode per journey, similar to v1's Exam/Social modes but planned in advance and visible on the timeline.

---

## 4. Habit ideas

### 4.1 One habit at a time, in a queue
A set order: start with the floor, add the next habit only after 2–4 weeks.
- **v1:** Has habit chaining, progressive difficulty and a formation threshold, which is a good base.
- **2.0:** Add a **habit queue**: future habits wait in line and the app suggests unlocking the next one when the current one is stable. This keeps you from starting ten things on a good day.

### 4.2 Hooks
Every mini-habit is attached to something you already do ("plank right after the weigh-in", "wall sit while the kettle boils").
- **2.0:** A "hook" field on habits ("after ___"), shown on Today in that order. That turns a list into a sequence.

### 4.3 Downsized, never skipped
The home minimum *counts as* the gym session. A plank on the knees still counts. On a bad day, repeat the old time.
- **v1:** The "Can't fail" fallback gives half credit and half points.
- **2.0 question:** should the downsized version count **fully**, like in the plan? Half credit still says "you did less".

### 4.4 Minimum and full versions of routines
Sunday prep has a ~20-minute minimum and a ~2-hour full version. *"The minimum version is the one that matters."*
- **2.0:** Any routine or task can have a minimum and a full version, and you pick based on energy that day.

### 4.5 Anchors for unstructured days
Three anchors (morning, midday, evening) instead of a schedule, plus "one thing to leave the house for" on home days.
- **2.0:** Fits v1's School day / Free day profiles: Free days get the anchors and a "reason to go out" prompt.

### 4.6 One-time environment setup
Some things work every day if you do them once (no big chip bags at home, good snacks in sight, freezer backups).
- **2.0:** A "set up once" checklist per journey, separate from daily tracking.

---

## 5. Goals, reviews and rewards

### 5.1 Staged, relative goals, no fixed end number
Milestones relative to the start, and the final goal is decided later by look, feel and non-scale measures.
- **2.0:** Goals as stages ("−X from start") instead of a target weight. The end is "reassess", not a number.

### 5.2 Non-scale goals count as much as the scale
More energy, dancing longer, clothes fitting, fewer comfort-eating moments. Checked monthly.
- **2.0:** A monthly non-scale check-in, shown alongside the weight trend instead of below it.

### 5.3 The 5-minute review
Six questions: average + change, sessions, how it went (one line), **one win**, **one thing to try**, plan dinners → shopping list.
- **v1:** The weekly review is auto-generated with ~14 data sections.
- **2.0:** Make the review a **short guided ritual** with few questions and one win. Show the data only as context. "Plan dinners" can feed the v1 grocery list directly.

### 5.4 Rewards that support the new life
Non-food rewards tied to milestones (dance gear, clothes, a workshop).
- **2.0:** The reward shop can suggest this category and link rewards to milestones, not only to points.

---

## 6. Content worth importing (later)

The library material can become data instead of documents:
- **Recipes** with per-portion values → recipe library, linked to meal options and grocery lists
- **Meal options** → the personal menu in 2.3
- **Workouts + mini-move progressions** → exercise templates with a progression table
- **"Instead" list** → content for the craving flow
- **Research notes** → short "why" explanations behind rules (one tap to read, never in the way)

The personal numbers (calories, protein, pace, start-relative stages) stay in `7-eight-journeys/` and become *your settings* in the app, not hard-coded defaults.

---

## 7. Open questions for 2.0

1. Is 2.0 **one app with journey modules**, or a slimmer health app with weight as the main journey? (Eight Journeys leaned towards one app, one daily entry point.)
2. Keep, change or drop **fasting, burn-off and meal scoring** (see 3.3)?
3. Should downsized habits count **fully** (see 4.3)?
4. What's the **smallest 2.0** you'd use every day? Suggested: Today with floor + weight (trend view) + craving button + short review.
5. Does the **game layer** come back in 2.0 from day one, or once the core is used daily?
6. The other 7 journeys: define them now, or only design the module system so they can come later?
