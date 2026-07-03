# ItGetsBetter — Gamification & RPG Progression Analysis

**Purpose:** Explore how to layer game-like mechanics onto the existing app without violating the Rulebook or punishing the user.  
**Status:** Planning — nothing here is committed yet.

---

## Hard Constraints (Rulebook)

Any gamification system must satisfy all of these or it doesn't ship:

| Rule | What it means for gamification |
|---|---|
| **Never punish absence** | No streaks that break, no levels that drop, no penalties for not playing |
| **Numbers always go up** | XP, stats, levels — once gained, never lost |
| **Celebrate action, not perfection** | Showing up at all earns something; perfection is a bonus, not a requirement |
| **Backfill without guilt** | Backfilled entries should earn the same rewards as real-time ones |
| **Never gate features** | Level 1 users and level 50 users have access to the same tools |
| **Warm and forgiving** | Game elements should feel like a cosy RPG, not a competitive leaderboard |

---

## What Already Exists

The foundation is already there. Any new gamification layer builds *on top of* these, not alongside them:

- **Points** — `pointsTransactions` table with `amount`, `source_type`, `date`. Earned for logging meals, completing habits, water, etc. Currently displayed as a running balance.
- **Achievements** — Unlockable one-time milestones (already 30+). Unlocked via `trigger_type` + `trigger_value`. Toast on unlock.
- **Reward Shop** — User-defined rewards bought with points. Already exists and works.
- **Streaks** — Per-habit streak counters. Display-only, not tied to the points or level system yet.

The existing `pointsTransactions.amount` values become the raw XP pool for any leveling system — no new earning logic is needed.

---

## Option A — XP + Levels (Classic)

**What it is:** Points become XP. Accumulate XP → reach level thresholds → level up. A single global "player level" with a progress bar.

**How it maps:**
- Total lifetime points = total XP earned
- Level curve: `level = floor(sqrt(xp / 50))` gives ~level 1 at 50pts, level 10 at 5000pts, level 20 at 20000pts — scales naturally with use
- Level-up triggers the existing achievement toast pattern ("Level 7 reached!")
- A simple XP bar on the home screen or Me page

**Pros:**
- Almost zero new code — just a pure derived calculation from `pointsTransactions.sum()`
- Deeply familiar to anyone who has ever played a game
- Satisfying and tangible — the number always goes up
- Fully respects all Rulebook constraints (numbers never drop)

**Cons:**
- A single number tells you nothing about *what kind* of person you're becoming
- Can feel arbitrary — "I'm level 12, so what?"
- Doesn't differentiate between someone who logs weight every day vs someone who exercises every day — both reach the same level

**Implementation complexity:** ⭐ (very easy — derived from existing data)  
**Rulebook compliance:** ✅ Full

---

## Option B — Character Stats (Domain-Mapped RPG Stats)

**What it is:** Instead of one global level, the user has 5–6 character stats, each tied to a specific health domain. Each stat grows as you do more things in that domain.

**Proposed stats:**

| Stat | Emoji | Domain | What earns it |
|---|---|---|---|
| **Strength** | 💪 | Exercise | Exercise logs, active habits |
| **Vitality** | 💚 | Nutrition & Health | Meal logs, water, medicine taken |
| **Clarity** | 🧘 | Mind & Rest | Mood logs, meditation sessions, sleep logs |
| **Discipline** | 🔥 | Habits & Tasks | Habit completions, task completions |
| **Endurance** | ⚡ | Consistency | Streaks, points earned on consecutive days |
| **Wisdom** | 📚 | Growth | Books finished, weekly reviews, achievements unlocked |

Each stat has its own level (1–100 or open-ended). You could display them as a hexagon radar chart (the classic RPG "stats" visual) or as individual progress bars on a "Character Sheet" page.

**How it maps to existing data:**
- Strength: count of `exerciseEntries` + habits with label "Exercise"
- Vitality: count of `mealEntries` + `waterEntries` + `medicineLogs` (taken = true)
- Clarity: count of `moodEntries` + `sleepEntries` + meditation sessions (once logged)
- Discipline: count of `habitCompletions` + completed `tasks`
- Endurance: derived from streak data + active-day count in `pointsTransactions`
- Wisdom: count of finished `books` + unlocked `achievements`

**Pros:**
- Way more meaningful than a single number — tells a story about who you are
- The radar chart is a beautiful visual that rewards balanced vs specialized play
- Creates natural motivation: "my Clarity is low, maybe I should log mood more"
- Still completely non-punishing — stats only go up

**Cons:**
- More complex to implement (6 separate stat calculations vs 1)
- Risk of making the user feel guilty if one stat is much lower than others — need to frame it as "potential" not "failure"
- The stat → activity mapping involves judgment calls (what counts toward what?)
- Radar chart needs careful design so a lopsided shape doesn't feel bad

**Implementation complexity:** ⭐⭐⭐ (medium — 6 derived queries, a character sheet page, radar chart)  
**Rulebook compliance:** ✅ Full (numbers never drop, no gating)

---

## Option C — Daily/Weekly Quests

**What it is:** On top of existing habits and tasks, the app generates short "quests" — small bonus goals that refresh daily or weekly. Completing them awards extra points/XP.

**Examples:**
- Daily: "Log all 3 meals today" → +15 bonus pts
- Daily: "Drink at least 1500ml water" → +10 bonus pts
- Weekly: "Complete all habits 5 days this week" → +50 pts
- Weekly: "Log your mood every day this week" → +40 pts
- Special: "Log something every day for a month" → unique achievement

**How it maps:** Purely derived from the same existing tables — no new DB schema. A quest is just a query with a reward attached.

**Pros:**
- Fresh daily goals prevent the "I've set up my habits, now what?" flatness
- Variable reward schedule is extremely motivating for ADHD brains — the surprise element of "what quests do I have today?"
- Easy to scope difficulty (short quests can be nearly guaranteed wins to keep momentum)
- Bonus points integrate cleanly into the existing economy

**Cons:**
- Risk of overlap with habits — "log meals" is already a habit for some users, so a quest saying the same thing feels hollow
- Need to be careful not to make quests feel like *obligations* — they must clearly be *optional* bonuses
- Quests that are impossible to complete in a day (e.g., "meditate for 60 minutes") could feel punishing even if no penalty exists
- Adds visible undone items to the UI — careful placement needed so they don't feel like failure states

**Implementation complexity:** ⭐⭐ (easy — quest definitions + checking logic, no new DB tables)  
**Rulebook compliance:** ⚠️ Partial — needs careful framing. Incomplete quests must never look like failures. "Tomorrow's quests are ready" not "You failed 2 quests."

---

## Option D — Class / Role Identity (Emergent)

**What it is:** Based on what the user *actually does most*, the app assigns them a "class" or "role" that updates over time. No manual selection — it's earned by behavior.

**Example classes:**

| Class | Emoji | How you earn it |
|---|---|---|
| **Athlete** | 🏃 | Exercise is your highest stat |
| **Sage** | 🧘 | Clarity (mood/meditation/sleep) is highest |
| **Guardian** | 🛡️ | Discipline (habits/tasks) is highest |
| **Nurturer** | 🌿 | Vitality (meals/water/medicine) is highest |
| **Scholar** | 📖 | Wisdom (books/reviews) is highest |
| **Adventurer** | ⚔️ | Balanced across all stats (none dominates) |

The class shows on the home screen or Me page: "You are a Level 12 Guardian."

**Pros:**
- Creates a personal identity that feels earned and true to the user's actual life
- Zero configuration needed — purely derived from behavior
- The class name rewards consistency: staying a Guardian for months feels meaningful
- Motivates diversity: "I've been a Guardian for weeks, I want to become an Adventurer"

**Cons:**
- Deeply depends on Option B (stats) being built first — this is a layer on top of that
- The class could feel wrong if the algorithm is slightly off ("I'm definitely not an Athlete just because I logged two walks")
- Class transitions could feel jarring — needs a smooth "your class has shifted" notification, not a sudden change
- With only one user, there's no social context for the class (it matters more in multiplayer settings)

**Implementation complexity:** ⭐ on top of Option B (just a derived label from which stat is highest)  
**Rulebook compliance:** ✅ Full (class just describes who you are, doesn't gate or punish)

---

## Option E — Companion Evolution

**What it is:** Tie the progression system to the existing Companion. As overall level grows, the companion "evolves" — gains a new title, shows different speech bubble styles, or unlocks new message categories.

**Examples:**
- Level 1–5: Companion is a "Baby" — basic messages, small avatar
- Level 6–15: Companion is "Awakened" — unlocks deeper message categories
- Level 16–30: Companion is "Trusted" — special milestone messages appear
- Level 31+: Companion is "Legendary" — rare surprise messages

**Pros:**
- Doesn't add a new page or concept — deepens an existing beloved feature
- The user already has emotional attachment to the companion, so its "growth" feels meaningful
- Unlocking new message types is a form of content reward, not just a number

**Cons:**
- Requires building more companion messages (content work, not just code)
- The "evolution" needs to be visible somehow — without a visual change to the avatar, it's just a title
- If the user has a custom companion (their own image), "evolution" can't change the appearance
- Could feel arbitrary ("my cat companion is now a Legendary Cat, okay?")

**Implementation complexity:** ⭐⭐ (medium — needs more messages + companion level calculation + display)  
**Rulebook compliance:** ✅ Full

---

## Option F — World / Garden Building

**What it is:** The user builds a virtual world — a garden, village, or island — where each health domain is represented by a structure or plant. Maintaining your habits keeps the world thriving.

**Example mapping:**
- Habits → Village Hall (grows with discipline stat)
- Exercise → Gym / Training grounds
- Meals → Kitchen / Market garden
- Mood/Sleep → Sanctuary / Meditation garden
- Books → Library

**Pros:**
- Deeply visual and emotionally satisfying — the world becomes a mirror of your real-world health
- Popular mechanic (Habitica, many mobile games) with proven engagement
- A beautiful home-screen "garden" widget could be genuinely delightful

**Cons:**
- **Significant implementation work** — either real art assets (not feasible) or emoji/CSS-based (limited visual appeal)
- The "world decaying when you don't log" anti-pattern is extremely tempting here and must be explicitly avoided — this directly violates "never punish absence"
- If the world only grows (never decays), the visual differentiation between active and inactive periods is lost
- For a solo user with no social world to show off, the motivation is purely aesthetic — nice but not essential
- Could distract from the health tracking purpose of the app

**Implementation complexity:** ⭐⭐⭐⭐ (heavy — needs a visual system, not just data)  
**Rulebook compliance:** ⚠️ Risky — the natural impulse is "world decays without care," which punishes absence

---

## Option G — Collectibles / Cosmetic Unlocks

**What it is:** As levels increase or stats grow, unlock visual cosmetics — new home screen themes, companion speech bubble styles, special achievement badge borders, or new color accents for the UI.

**Pros:**
- Pure reward, zero penalty — cosmetics never expire
- Gives a concrete answer to "what do I get for leveling up?"
- Low implementation complexity for meaningful feel (change a CSS variable, unlock a theme)

**Cons:**
- Tailwind-based theming makes full theme unlocks moderately complex
- Could feel cheap if the cosmetics aren't genuinely appealing
- A solo-user app doesn't have the social display incentive that makes cosmetics valuable in multiplayer games

**Implementation complexity:** ⭐⭐ (medium — unlock system + theme/style variants)  
**Rulebook compliance:** ✅ Full

---

## Comparison Summary

| Option | Meaning | Complexity | Rulebook | Excitement |
|---|---|---|---|---|
| A — XP + Levels | Low (one number) | ⭐ | ✅ | ⭐⭐⭐ |
| B — Character Stats | High (tells a story) | ⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ |
| C — Daily Quests | Medium (fresh goals) | ⭐⭐ | ⚠️ | ⭐⭐⭐⭐ |
| D — Class Identity | High (who you are) | ⭐ on top of B | ✅ | ⭐⭐⭐⭐ |
| E — Companion Evolution | Medium (emotional) | ⭐⭐ | ✅ | ⭐⭐⭐ |
| F — World Building | High (visual) | ⭐⭐⭐⭐ | ⚠️ | ⭐⭐⭐⭐ |
| G — Cosmetic Unlocks | Low (decoration) | ⭐⭐ | ✅ | ⭐⭐ |

---

## Recommendation

### Tier 1 — Build these (high payoff, clean fit)

**A + B + D together: XP Levels → Character Stats → Class Identity**

These three form one coherent system and build on each other naturally:
1. **XP + Levels** gives the base number (nearly free — derived from existing points)
2. **Character Stats** gives that number meaning (6 domain-specific stats, radar chart)
3. **Class Identity** gives the user a *name* for who they are (derived from whichever stat leads)

The result is a "Character Sheet" page — level, class, radar chart of 6 stats — that updates purely from existing logged data. No new earning logic. No new DB tables. No possibility of going backwards.

### Tier 2 — Consider adding after Tier 1

**C — Daily Quests**, but with strict framing rules:
- Call them "Opportunities" not "Quests" to reduce obligation feeling
- Mark incomplete ones as "available tomorrow" not "missed"
- Generate only 2–3 per day so they never feel overwhelming

### Tier 3 — Nice to have someday

**E — Companion Evolution** if we ever write more companion message content.  
**G — Cosmetic Unlocks** as a reward for reaching character stat milestones.

### Skip for now

**F — World Building** — too much implementation work relative to the payoff for a solo-user app, and the "never punish absence" constraint is very hard to satisfy with an environmental metaphor.

---

## What the Character Sheet Could Look Like

```
╔══════════════════════════════╗
║  🗡️  Guardian                ║  ← class (derived from highest stat)
║  Level 14  ████████░░  1840 XP ║  ← global level
╠══════════════════════════════╣
║  💪 Strength      Lv 8  ████░  ║
║  💚 Vitality      Lv 11 █████  ║
║  🧘 Clarity       Lv 5  ██░░░  ║
║  🔥 Discipline    Lv 14 █████  ║  ← highest → Guardian class
║  ⚡ Endurance     Lv 9  ████░  ║
║  📚 Wisdom        Lv 6  ███░░  ║
╚══════════════════════════════╝
```

Or as a hexagonal radar chart where each axis is one stat.

---

*This document is a seed for the build discussion, not a final spec. Pick what excites you and we'll plan the implementation from there.*
