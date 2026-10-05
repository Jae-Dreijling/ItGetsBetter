# ItGetsBetter 2.0 — Plan

**Date:** 2026-10-05
**Status:** Direction agreed (see Decisions). Nothing built yet.
**Reviewed:** [V2-PLAN-REVIEW](V2-PLAN-REVIEW.md) (2026-10-05). Corrections from it are already applied below.
**Read with:** [RULEBOOK](../1-principles/RULEBOOK.md) (still applies), [EIGHT-JOURNEYS-LESSONS](EIGHT-JOURNEYS-LESSONS.md) (ideas this plan draws on)

---

## The goal in one sentence

Make the app **feel smooth and alive**, **ask for less**, and give you **more reasons to come back**: more fun, more companion, more motivation.

## Core principle: lots of features, all optional, few in the spotlight

2.0 is allowed to have **many** features. What matters is how much each one asks of you:

| Tier | What it means | Examples |
|---|---|---|
| **Spotlight** | On the Today screen, may send notifications. **Kept small: max ~3–4 things.** | Daily Check, daily floor, companion, one thing relevant right now |
| **Available** | Reachable through the tabs/menu when *you* want it. Never pushes, never nags, never shows "you haven't done this". | Social, abstinence, mini-goals, fasting, recipes, motivation tools, game |
| **Off** | Hidden completely: not in menus, no notifications, no companion lines about it. Data is kept, not deleted. | Anything you don't use |

Rules:
- **Every feature can be switched off** in Settings → Features, except the core (Today, Daily Check, companion, settings).
- **You choose what's in the spotlight,** with a cap so it never fills up again. Swapping is easy.
- **New features arrive as "Available"** with one gentle introduction, never straight into the spotlight.
- **Notifications only come from spotlight features** (and only if you allow them per feature).
- **Optional means optional everywhere:** points, quests and companion lines never require an optional feature. An unused feature is invisible, not "missed".
- The first-launch setup (and "Start fresh") lets you pick which features to turn on.

This is what keeps a feature-rich app from becoming the overwhelming v1 home screen again.

## Remake or upgrade?

**Recommendation: upgrade v1 in place on the `Development` branch, not a rewrite from scratch.** Each finished step is merged to `main`, so the app improves step by step.

The stack (React, Vite, Tailwind, Dexie/IndexedDB) is fine. The slowness comes from specific fixable patterns, not from the stack:

| What feels slow | Actual cause in v1 | Fix |
|---|---|---|
| Dragging the companion stutters | [FloatingCompanion.tsx](../../src/components/FloatingCompanion.tsx) calls `setPosition` on every touch-move, so React re-renders the whole 288-line component every frame | Move the element directly (ref + `transform`) during the drag and only save to state on release. Or use the animation library's built-in drag (below). |
| Companion position sometimes "jumps back" | Mouse drag saves the position from *before* the drag (stale closure) | Same fix |
| Slow first load | Main JS bundle was **900 KB (266 KB gzipped)**; ✅ now 386 KB (123 KB gzipped) after step 1 | Move big static data (companion lines, encounters) and charts out of the main bundle |
| Pages feel "stiff" | No transitions; content just appears | Animation layer (section 2) |

A rewrite would cost months and throw away 26 working features plus your data. An upgrade lets you use the app the whole time, which is the point.

---

## 1. Themes

**What:** several complete colour themes (e.g. Warm Coral = today's look, Forest, Ocean, Lavender, Midnight, High Contrast), each with a light and dark version.

**How:**
- Tailwind v4 already turns every colour in [index.css](../../src/index.css) into a CSS variable, so a theme is just a set of ~30 variable overrides (e.g. under `[data-theme="forest"]`). No class names need to change.
- The real work: **78 hard-coded hex colours** in 6 files (graphs, mood, sleep, weight, labels, mood prompt) must be converted to theme colours, or they won't follow the theme.
- A theme picker in Settings with a live preview.
- Optional: custom accent colour.
- **Entertainment tie-in:** some themes can be **unlocked in the reward shop** or by companion affinity. Something nice to work towards that costs nothing health-wise.

**Effort:** small. **Do early**, because every screen redesigned after this automatically supports themes.

---

## 2. Smooth animations

**What:** page transitions, cards and list items that slide in, satisfying check-offs, a companion that feels physical (springy drag, bounce, idle breathing).

**How:**
- Add **Motion** (the library formerly called Framer Motion): springs, drag, enter/exit animations and shared-element transitions, all GPU-friendly. Load it lazily (`LazyMotion`): ~4.6 KB up front, plus ~25 KB for the feature set that includes drag. Simple page changes can use CSS / the browser's View Transitions instead.
- First job: fix the companion drag (see table above). That's the most-felt problem.
- A small set of reusable animation presets (`fadeUp`, `pop`, `slideIn`, `springy`) so the whole app feels consistent instead of every page doing its own thing.
- **Respect "reduce motion"** in the phone's settings: animations become simple fades. (Accessibility rule in the Rulebook.)
- Only animate `transform` and `opacity` (cheap for the phone); never layout properties.

**Effort:** medium, but spread out: the foundation first, then each page gets polished as it's touched.

---

## 3. ADHD-friendly: "ask for one thing a day"

**The problem:** v1 shows you everything you *could* log. That's a wall of homework, and the Eight Journeys plan came to the same conclusion.

**The new model: the Daily Check.**

The home screen asks **one** tracking question per day, picked by weighted chance. Everything else is still loggable on its own page, but it's **voluntary and never nags**.

| Metric | Example chance | Notes |
|---|---|---|
| Weight | 35 % | Trend only needs ~2–3 weigh-ins a week |
| Sleep | 20 % | |
| Mood / energy | 20 % | |
| Water yesterday | 10 % | |
| Body measurement | 5 % | Monthly is plenty; low chance + a boost if it's been a while |
| Progress photo | 5 % | |
| Non-scale win ("anything feel easier lately?") | 5 % | From Eight Journeys |

Rules for picking:
- **Same question all day.** The random pick is seeded by the date, so reopening the app doesn't reroll it.
- **Recently logged = less likely.** Logged weight yesterday? Weight's chance drops today.
- **Long gap = more likely.** No measurement in 5 weeks? Its chance rises.
- **You control the chances** in Settings (sliders), and can turn any metric off completely.
- **Or use a fixed schedule instead** (e.g. weight Monday + Thursday, measurements on the 1st). Randomness keeps it fresh (ADHD), but predictability can feel safer (autism), so you choose which mode feels better.
- **"Not today" button** that just dismisses it, with no penalty and no reroll guilt.
- Answering gives points/XP, so the game layer rewards the one thing that's asked.

**Rest of the home screen ("Today"):** the daily floor (2–3 tiny actions you choose), the Daily Check, your companion, and one or two things relevant right now (e.g. a habit due, a social reminder). Everything else is one tap away, not on the main screen.

**Effort:** medium. This is the **core of 2.0**, the thing that most changes how the app feels day to day.

---

## 4. Entertainment & sticking around

Things that make opening the app fun even on a day you log nothing:
- **Daily surprise:** a small random moment on opening (companion says something new, a fortune, a tiny gift, a rare event). The game layer's Fortune Events already exist and can be surfaced here.
- **Companion life:** expressions, idle animations, reactions to time of day/weather/season, outfits or accessories (unlockable).
- **Collections:** cosmetic unlocks (themes, companion accessories, map decorations). Collecting without pressure.
- **Seasonal events:** a few small themed weeks per year (autumn, winter holidays, birthday).
- **Adventures** (section 6): short stories you progress by doing your daily floor.

Rule from the Rulebook that stays: **nothing is lost by being away.** No decaying pets, no "your companion is sad you left".

---

## 5. More companion content

- **More lines per trigger**, and new triggers (Daily Check answered, abstinence milestones, a friend you saw, theme changed, first time opening 2.0, etc.).
- **Reactions to being handled** (idea, 2026-10-05): the companion reacts when it's picked up, dragged around or thrown (e.g. "Wheee!", "Put me down!", a dizzy face after a hard fling). The drag code already knows when a drag starts and how fast it's thrown.
- **Memory:** the companion references things you did ("you saw Sam last week, how was it?", "day 30 without binging!"). This can be done without AI by filling in data templates.
- **Relationship depth:** affinity already exists. Add unlockable conversations/backstory at affinity levels.
- **Content packs:** the import template already supports bulk lines; keep using it and add packs for the new triggers.

---

## 6. AI integration (optional, opt-in)

**What:** real conversations with companions (in their personality, remembering your history) and AI-generated adventures.

**Tension with the app's principles:** v1 is offline-first and privacy-focused. AI means sending data to an outside service and paying per use. So:
- **Opt-in and off by default.** The app works fully without it.
- **Bring your own API key** stored on the device: no server to build or pay for, and no one else can run up your bill.
- **You choose what the AI sees:** companion persona + chat only, or also a summary of your week. Health numbers are **never** sent unless you switch that on.
- **Adventures are generated in batches and saved**, so they work offline afterwards and don't cost anything per view.
- Falls back to the existing pattern-matching chat when offline or without a key.

**Cost estimate** (per chat message, ~2,000 tokens in, ~200 out): Claude Opus 5.5 ≈ $0.012 (≈ $7/month at 20 messages a day), Claude Haiku 4.5 ≈ $0.003 (≈ $2/month). Caching the fixed persona lowers this, and adventures can be generated through the Batch API at half price. Direct calls from the app are supported for bring-your-own-key use.

**Effort:** large. **Do last**, once the core is used daily. The model gets chosen when we build it.

---

## 7. More weight content

Mostly from [EIGHT-JOURNEYS-LESSONS](EIGHT-JOURNEYS-LESSONS.md):
- **Smoothed weight trend** as the main number; daily value small or hidden (+ explanations for normal jumps). Not a plain 7-day average: with the Daily Check, weigh-ins are irregular (~2–3 a week), so use an **exponentially smoothed trend** (Hacker's Diet style) that scales with the days since the last weigh-in.
- **Staged goals** relative to your start, plus **non-scale wins** shown next to the scale
- **Personal meal menu** + "decide today" picker (no calorie counting)
- **Recipe library** linked to the menu and grocery list
- **Craving flow** (am I hungry → name it → 10-min timer → portioned version still counts), guided by the companion
- **Weigh-in safety valve** (daily / weekly / trend only)
- **Fasting becomes a standalone manual timer** (decided 2026-10-05). See review point 4: restriction is a known binge trigger, so keep it points-free, off the Today screen and away from the abstinence page. Today it's derived from the last logged meal (`useCurrentFast` in [useFasting.ts](../../src/hooks/useFasting.ts)), so every meal silently starts a fast and the card is always on the home screen. In 2.0: you press **Start** and **End** yourself, it has no link to meal logging, and it only appears when you open it or a fast is running.
- **Burn-off suggestions and meal scores stay as they are** (decided 2026-10-05).

---

## 8. More motivation options

- **Your "why":** short reasons you set yourself, shown at the right moments (craving flow, low mood, after a gap).
- **Letter to future self:** written now, unlocked at a milestone or date.
- **Progress replay:** a short animated "look how far you've come" (photos, trend, wins, abstinence days, friends seen).
- **Wins jar:** every "one win" from the weekly review collected in one place to scroll through on bad days.
- **Motivation Vault** (exists) gets surfaced in the Daily Surprise and craving flow instead of hiding on its own page.

---

## 9. Abstinence page (new)

**What:** custom counters for anything you're stepping away from (binging, smoking, a certain app, alcohol, …) with a live timer since the last time.

**The Rulebook conflict:** a timer that resets to zero is exactly the "Streak broken! 0 days" the Rulebook forbids (rule 5.2), and a reset can trigger the "I've ruined it anyway" spiral. So the design shows **more than the current run**:

| Shown | Example |
|---|---|
| Current run (live timer) | 12 days, 4 hours |
| Free days in the last 30 | **27 of 30** ← the main number |
| Longest run | 41 days |
| Total free days since starting | 186 |
| Milestones reached | 1 day, 3 days, 1 week, 2 weeks, 1 month, … (never taken away) |

- A slip is logged as **"it happened"**, never "relapse". Optional one-tap context (stressed, bored, social, tired), which feeds into patterns over time.
- Warm copy after a slip: "27 of 30 is still 27 good days. The timer's running again."
- Optional: money/time saved, if you enter what the habit costs.
- Optional **"why I'm doing this"** per counter.
- **Craving button** on each counter → the craving flow + companion support.
- For eating-related counters, define the act narrowly ("binge", not "snacks"), so normal eating never counts as a slip. This matches the Eight Journeys rule that nothing is banned.
- Private by default; can be hidden behind the app lock.

**Effort:** small–medium, self-contained. A good early win.

---

## 10. Social page (new)

**What:** people you care about, how often you want to see or contact them, and gentle reminders to *plan* it.

- **People:** name, photo/emoji, group (friend, family, partner, …), optional birthday and notes ("likes board games").
- **Rhythm:** how often you want to connect (weekly, every 2 weeks, monthly, every few months), and optionally in person vs. call/text.
- **Quick log:** "Saw them" / "Talked" in one tap from Today or the person's card.
- **"Due soon" list,** sorted by how overdue they are, phrased warmly ("It's been a while since you saw Sam, want to plan something?"), never as a red overdue list.
- **Reminders** to *plan* (e.g. 3 days before due), plus birthdays.
- **Companion tie-in:** asks how it went, and celebrates social time.
- Counts as a domain for the game layer (social = a real health area).
- **Lovers / partner:** a separate group with its own rhythm (date nights). Not to be confused with the game's in-game "Lover System".

**Effort:** medium, self-contained.

---

## 11. Real app (APK) + phone notifications

**What:** install it as a real Android app with notifications that work when the app is closed.

**How: Capacitor.** It wraps the existing React/Vite app in a native Android shell. The code stays the same web code, and you get:
- **Local notifications** scheduled on the phone (Daily Check reminder, social "plan something", abstinence milestones, habit hooks). No server needed, and they work offline.
- An **APK you build and install yourself.** This also solves the "don't let others use it" concern: no public website needed.
- Your data stays in the app's own storage (IndexedDB works inside Capacitor).

Things to know:
- Building the APK needs **Android Studio / the Android SDK** installed.
- **No auto-updates:** unlike the PWA, every new version has to be built and installed again. Optional: a "new version available" check (e.g. against GitHub releases).
- **Uninstalling deletes the data**, so the APK gets **automatic backups** to phone storage (e.g. weekly).
- **Notification text is fixed when it's scheduled.** Every time the app opens, it reschedules the next ~7 days of notifications from current data.
- **Android rules:** ask for notification permission (Android 13+) at a calm moment with an explanation; use normal (inexact) timing, since exact alarms are restricted on Android 12+; in battery-saving mode, notifications fire at most once per 9 minutes.
- **Data migration:** the PWA's data and the APK's data live in separate storage. Moving over = export from the PWA, import in the APK (backup/export already exists in v1).
- iOS would need a Mac + Apple developer account. Android only for now.

**Effort:** small to set up, then each notification type is small.

## 12. Small fixes (quick wins)

| Fix | What's wrong now | Plan |
|---|---|---|
| ✅ **Companion idle message fires while you're using the app** (done 2026-10-05) | In [FloatingCompanion.tsx](../../src/components/FloatingCompanion.tsx) the idle timeout is only **10 s**, and it only resets on tap/click/keypress or a scroll *of the window*. Reading a page for 10 s, or scrolling inside a list, counts as "idle". | Reset on **any** interaction (pointer, touch-move, scroll inside any container, typing, page change). Raise the timeout to a real AFK window (e.g. 2–3 min, setting). Pause it while the app is in the background. |
| ✅ **"Delete all data" is hard to find** (done 2026-10-05) | It exists and wipes everything correctly (database + local settings), but it's buried at the bottom of Settings → Backup. | Its own **"Start fresh"** entry in Settings. Offer **"make a backup first"** in the same screen. Includes the option to **keep companions & personality groups** when wiping (decided 2026-10-05), since they hold lots of custom content you'd otherwise lose. |
| ✅ **Switching names** (done 2026-10-05) | The display name can already be changed in Settings → Profile, but only by retyping it. | **Saved names** with one-tap switching (e.g. your real name / a fake name for showing the app to others or taking screenshots). The companion and everything else use the active one. |
| ✅ **Backups list every table by hand** (done 2026-10-05) | [backup.ts](../../src/lib/backup.ts) names each of the 37 tables in four places. All are covered today, but every 2.0 feature adds tables, and a forgotten one silently isn't backed up. | Make backup/restore loop over all tables automatically, with a test. Do this first: the APK makes backups more important. |
| ✅ **Pick the current companion** (done 2026-10-05) | When several companions are on, a random one speaks each session and you can't choose. | **Tap a companion's card** on the Companions page to make it the one speaking right now. Lasts **this session** (decided 2026-10-05): next app open picks randomly again. Its on/off switch isn't changed, and the card shows which companion is current. |
| ✅ **"My Quotes" is obsolete** (done 2026-10-05) | Still has a Settings entry, page (`QuoteManager`), route, hook and database table, but the companion took over its role. | Remove the page, route, hook and Settings entry. If any quotes are stored, **move them into the companion's General lines** first, then drop the table in a database version bump. Remove it from backup/restore. |

## 13. To-do redesign (habits + tasks)

**The problem:** the to-do page shows everything at once. Every row carries labels, priority, a streak counter and buttons, for all habits and all tasks. That's overstimulating and makes it hard to see what to do *now*.

**Direction** (to be designed together with mockups before building):
- **Show less by default.** A row is just a checkbox + name. Labels, priority, streak and actions appear when you tap a row.
- **"Now" first.** Only what's relevant at this time of day is open; the rest is collapsed ("Later today · 4", "Done · 3").
- **Habits in order of the day,** grouped by morning / afternoon / evening or by **hook** ("after the weigh-in"), so they read as a sequence instead of a list.
- **Tasks: pick a few for today.** An inbox for everything, and a small "Today" list (max ~3) you pull from it. The rest stays out of sight.
- **Completed items disappear** with a satisfying animation (ties into the animation work) instead of staying in the list.
- **Calmer visuals:** fewer colours per row, more spacing, one accent colour.
- Habit queue and minimum/full versions from [EIGHT-JOURNEYS-LESSONS](EIGHT-JOURNEYS-LESSONS.md) fit naturally here.

## 14. Mini-goals (your own milestones)

**What:** goal tracks you create yourself, each with a list of milestones in your own words. For anything: a hobby, a skill, health.

| Goal track | Example milestones |
|---|---|
| 🎸 Guitar | Learn 4 basic chords → play a full song → play with a strum pattern → learn barre chords → play for a friend |
| 😴 Sleep | In bed before 00:00 three nights → a full week before 00:00 → phone out of the bedroom for a week |
| ⚖️ Weight | −2 kg from start → −5 kg → first smaller clothing size → reassess |
| 💃 Dance | Survive a full class without a break → learn a full routine → go to a social |

**How it works:**
- **Free text milestones,** in order. Ticking one off is a manual tap, because most hobby milestones can't be measured by the app.
- **Optional auto-check** for milestones the app *can* measure (weight trend, sleep logs, abstinence days, books finished), so they tick themselves and celebrate.
- **Optional reward per milestone,** linked to the reward shop (e.g. "learn barre chords → new strings").
- **No deadlines by default.** An optional "aim for" date is allowed, but missing it changes nothing (Rulebook rule: never punish).
- **Next milestone visible:** each track shows only the *next* step big, with the rest small. One thing to aim for, not a list of everything left.
- **Celebration** when a milestone is reached: companion reaction, points, an entry on the timeline and in the wins jar.
- **Edit freely:** reorder, rename, add steps in between, or archive a track without it counting as failure.
- **Templates** for common tracks (weight, sleep, strength, reading, an instrument) that you can copy and edit.

**Connections:** this replaces the single "goal weight milestone" in the profile (with a data migration so the current goal isn't lost) (weight stages from section 7 become a mini-goal track), can show up in the Daily Surprise or companion talk ("one step away from barre chords!"), and fits the motivation features (section 8).

---

## Proposed build order

One feature at a time, each tested on your phone before the next one starts. Small fixes (step 0) can also be slotted in between bigger steps.

**Releases:** all features are in scope (see the core principle). They're built in this order, one feature per release, each landing as "Available" (or "Off") so it never adds pressure. The order can be re-checked after each release based on what you actually miss.

| # | Step | Why here |
|---|---|---|
| 0 ✅ | **Small fixes:** backup hardening, companion idle, "Start fresh", pick current companion, saved names, remove My Quotes (one at a time) | Quick wins, each tested on its own |
| 1 ✅ | **Smoothness foundation:** fix companion drag, add the animation library + presets, measure and slim the bundle | Fixes the "clunky" feeling right away; everything after builds on it |
| 2 | **Themes** | Colour refactor before redesigning screens, so new screens support themes from the start |
| 2b | **Feature system + navigation:** spotlight/available/off tiers, Settings → Features, where every page lives (four-tab ceiling; off features disappear from menus) | Every new feature plugs into this, and the Today screen depends on it |
| 3 | **Today screen + Daily Check** | The core ADHD change |
| 4 | **APK + notifications (Capacitor)** | Real phone app early, so the next features can use notifications |
| ⏸ | **2.0 release** (steps 0–4). Later steps ship as 2.1, 2.2, … | |
| 5 | **To-do redesign** (habits + tasks) | Design with mockups first; uses the animations and fits with the Today screen |
| 6 | **Abstinence page** | Self-contained, high personal value |
| 7 | **Social page** | Self-contained, uses notifications |
| 8 | **Mini-goals** | General milestone system; the weight stages in step 9 are built on it |
| 9 | **Weight content:** trend, stages, non-scale wins, craving flow, meal menu | Builds on Today, abstinence (craving flow is shared) and mini-goals |
| 10 | **Motivation:** why, future letter, wins jar, replay | Uses data from 6–9 |
| 11 | **Companion content + entertainment:** new triggers, memory, daily surprise, unlockables | Needs the new features to react to |
| 12 | **AI (opt-in):** chat, then adventures | Biggest and most external; only once the rest is used daily |

---

## Definition of done (every step)

A step is finished, and can be merged to `main`, when:

1. **Tested on your phone** (local Wi-Fi) and you're happy with it.
2. **Tests** exist for any logic that's easy to get wrong (calculations, pickers, migrations, backup).
3. **CI is green:** type check, tests, lint and build. No new lint warnings, and any of the 27 remaining `set-state-in-effect` warnings in a file you rework get fixed (lint cleanup, 2026-10-05: 0 errors, 30 warnings left).
4. **Existing data survives:** any database change has a migration, and backup/restore covers new tables.
5. **The feature respects its tier:** it can be switched off, and it doesn't ask for attention unless it's in the spotlight ([Rulebook 2.4](../1-principles/RULEBOOK.md)).
6. **Works in light and dark mode** (and in every theme, from step 2 on), and with "reduce motion" switched on (from step 1 on).
7. **Docs updated:** this plan's status, and any doc whose content changed (e.g. the companion trigger list or GAME-IMPLEMENTATION).

---

## Decisions

### Made (2026-10-05)

| # | Question | Decision |
|---|---|---|
| 1 | Upgrade or rewrite? | **Upgrade in place** on `Development` (CI already runs there); each finished step merges to `main` |
| 2 | Abstinence model | **"27 of 30 days"** model, not a pure reset timer |
| 3 | Fasting, burn-off, meal scores | **All stay.** Fasting becomes a manual start/end timer, fully separate from meals. Burn-off and meal scores unchanged. |
| 4 | APK timing | **Step 4** in the build order |
| 5 | Scope | **Many features are allowed,** as long as they're optional and only a few get the spotlight (core principle above) |
| 6 | Phone testing | **Local Wi-Fi:** the dev server runs on the PC and you open it on your phone on the same network. Nothing gets published. |
| 7 | Current app data | **Decide at step 4** (the APK move). Until then treat it as "keep": every database change carries existing data over, and you make a backup before step 0. |
| 8 | Start fresh | Wiping data offers the **option to keep companions & personality groups** |

### Still open

1. **Daily Check:** which metrics are in the pool, and roughly what chances? (Decide when building step 3.)
2. **AI:** OK with bringing your own API key and paying per use, or should AI wait/skip? (Decide before step 12.)
3. **Fasting points:** keep the "fasting goal met" points and companion trigger with the manual timer, or make fasting points-free? *Review recommends points-free* (restriction is a known binge trigger).
4. **To-do redesign:** what overwhelms you most right now? (Input for the mockups in step 5.)
5. **Navigation + default tiers:** proposal in step 2b (which features start in the spotlight, available or off).
