# V2 Plan — Review

**Date:** 2026-10-05
**Reviewed:** [V2-PLAN.md](V2-PLAN.md) (all 14 sections + build order) against the v1 code, the [Rulebook](../1-principles/RULEBOOK.md), [EIGHT-JOURNEYS-LESSONS](EIGHT-JOURNEYS-LESSONS.md) and outside sources.

---

> **Update (2026-10-05):** after this review, you decided that 2.0 may have *many* features, as long as they're optional and only a few get special attention. The plan now has a **spotlight / available / off** system (see "Core principle" in V2-PLAN). That replaces the "cut the scope" recommendation below: the risk is now handled by design instead of by building less. The rest of the review still applies.

## Verdict

**The direction is good. The scope is not realistic as one release.**

Each individual feature is technically doable with the current stack, and most are well grounded. The risk is the *total*: the plan grew from 11 to 14 sections and 13 build steps in a single session, and it adds at least five new areas (abstinence, social, mini-goals, craving flow, motivation tools). That pulls against the plan's own goal of "ask for less", and against the warning from Eight Journeys that building the tool can become more fun than the journey itself.

v1 was built in 4 days, so building speed isn't the bottleneck. **Using the app is.** 2.0 succeeds if you're using it daily again, not if every section is done.

**Main recommendation: split it.** *(Superseded, see the update above.)*
- **2.0 = steps 0–4:** small fixes, smoothness, themes, Today + Daily Check, APK + notifications. Then **use it for 2 weeks** before building more.
- **2.1, 2.2, …** = everything after that, one feature per release, in the planned order. Re-check the order after each one based on what you actually miss.

---

## What holds up well

| Part | Why it's solid |
|---|---|
| **Upgrade, not rewrite** | Confirmed by the code: the slowness comes from specific patterns (e.g. the companion re-rendering on every drag frame), not from the stack. |
| **Abstinence "27 of 30" model** | Matches established relapse-prevention research. The *abstinence violation effect* (Marlatt) describes how seeing a lapse as total failure ("I've ruined it anyway") turns one slip into a full relapse. A counter that drops to zero invites exactly that thinking; keeping the good days visible counters it. |
| **Daily Check (one question a day)** | Directly targets the reason you stopped: too much to keep up with. |
| **AI as opt-in, bring-your-own-key** | Technically confirmed: the Claude API allows direct calls from a browser/app with the `anthropic-dangerous-direct-browser-access` header, meant for exactly this "bring your own key" case. No server needed. |
| **Capacitor for the APK** | The right tool: it wraps the existing app and supports local notifications without a server. |
| **One feature at a time** | Matches how you want to work, and the plan is ordered so dependencies come first. |

---

## Issues and corrections

Ranked by importance.

### 1. Navigation isn't planned (Rulebook conflict) → now step 2b, together with the feature system
The Rulebook caps the bottom bar at **four tabs** (Home, Log, To-Do, Me today). The plan adds abstinence, social, mini-goals, a standalone fasting timer, a craving flow and motivation tools, with no decision on where they live. Without that, 2.0 drifts into the "everything everywhere" feeling the plan is trying to fix.
**Fix:** decide the navigation (what's on Today, what's in each tab, what's in the side menu) **before step 3**, since the Today screen depends on it.

### 2. Random daily questions vs. predictability
Randomness keeps things fresh, which helps with ADHD. But **unpredictability can be stressful with autism**, and your profile includes both.
**Fix (added to the plan):** the question stays fixed for the whole day (already planned), and a **"fixed schedule" mode** is available as an alternative (e.g. weight on Monday and Thursday, measurements on the 1st of the month). You choose which feels better.

### 3. The weight trend method needs to change
The plan says "7-day average". With the Daily Check, weight is only asked ~2–3 times a week at irregular intervals. A 7-day average over 2 points is noisy, and over 0 points it's empty.
**Fix (added to the plan):** use an **exponentially smoothed trend** (the method popularised by *The Hacker's Diet*). Each new weigh-in moves the trend a fraction of the way towards the new value, and days without data simply carry the trend forward. For irregular data the fraction should scale with the days since the last weigh-in. Otherwise sparse weigh-ins make the trend react very slowly.

### 4. Fasting and the binge counter work against each other
This doesn't reopen your decision to keep fasting; it's a risk to be aware of when designing it. The first-line treatment for binge eating (**CBT-E**) is built on **regular eating**: 3 meals + 2–3 snacks, no gaps longer than 3–4 hours. It treats dietary restriction as one of the main things that *keeps* binge eating going. Your own Eight Journeys research notes say the same. An app that rewards long fasts *and* counts days without binging is pulling in two directions.
**Suggested guardrails** (your call):
- No points or goals for fasting length (open question 3 in the plan → recommend "points-free").
- Keep fasting off the Today screen and away from the abstinence page.
- The warning-signs idea from EIGHT-JOURNEYS-LESSONS (3.2) can gently notice long fasts followed by a slip.

If binge eating is a real ongoing struggle rather than an occasional thing, CBT-E with a professional (via your GP) is the evidence-based route. The app can support that but shouldn't replace it.

### 5. The APK has practical costs the plan didn't mention
| Topic | Reality | What to do |
|---|---|---|
| **Updates** | The PWA updates itself today. A sideloaded APK doesn't: every new version has to be built and installed again. | Accept manual installs, or add a simple "new version available" check (e.g. against GitHub releases). |
| **Data safety** | Uninstalling the APK deletes its data. | **Automatic backups** to phone storage (e.g. weekly), not just manual export. |
| **Notification content** | Scheduled notifications are fixed when they're scheduled; the app can't change their text while closed. | Every time the app opens, reschedule the next ~7 days of notifications from current data. |
| **Exact timing** | Android 12+ restricts exact alarms; Android 13+ needs notification permission; in battery-saving (Doze) mode, notifications fire at most once per 9 minutes per app. | Use normal (inexact) scheduling: fine for reminders. Ask for notification permission at a calm moment, with an explanation. |
| **Tooling** | Needs Android Studio / the Android SDK installed. | One-time setup. |
| **Moving data** | PWA and APK have separate storage. | One-time export → import (already supported). |

### 6. Themes are smaller than planned
Tailwind v4 (already in use) generates its colour classes as CSS variables, so a theme is just a set of variable overrides; no refactor of the class names is needed. The real work is the **78 hard-coded hex colours** in 6 files (charts, mood, sleep, weight, labels, mood prompt) that won't follow a theme until they're converted.
**Effort:** small.

### 7. ~~The bundle size number is stale~~ Confirmed
The "~900 KB main bundle" came from an old `dist/` build, so I flagged it as possibly stale. A fresh build on 2026-10-05 confirms it: **900 KB (266 KB gzipped)**. Slimming it stays in step 1.

### 8. The animation library choice needs one detail
Motion's full component is ~34 KB and can't be shrunk further. Its lightweight mode (`LazyMotion` + `m`) starts at ~4.6 KB, but **drag needs the larger feature set (+25 KB)**, which the companion needs.
**Fix:** use lazy loading with the larger feature set, or CSS + the browser's View Transitions for page changes and Motion only where drag/springs are needed.

### 9. Backups need hardening before new tables arrive
[backup.ts](../../src/lib/backup.ts) lists each table by hand in four places (export, wipe-before-restore, clear, restore). It currently covers all 37 tables, but every 2.0 feature adds tables, and forgetting one means that data silently isn't backed up.
**Fix:** make backup loop over all tables automatically (with a test). Do this early (part of step 0), since the APK makes backups more important.

### 10. AI: cost estimate
Rough cost per companion chat message (~2,000 tokens in: persona + recent chat, ~200 tokens out), at current prices:

| Model | Per message | 20 messages/day ≈ per month |
|---|---|---|
| Claude Opus 5.5 ($4 / $20 per million tokens) | ~$0.012 | ~$7 |
| Claude Haiku 4.5 ($1 / $5 per million tokens) | ~$0.003 | ~$2 |

Prompt caching of the fixed persona reduces the input cost further. Adventures can be generated in batches via the Batch API (50 % cheaper) and stored for offline use. The model is your choice when we build it; this just shows it's affordable either way.
Note: companions based on existing franchise characters are fine for a personal app, but would be an issue if the app were ever published.

### 11. Smaller points
- **Mini-goals replace the profile's goal weight:** needs a data migration so the existing goal isn't lost.
- **Tests:** there are only 8 test files. Add tests for the logic that's easy to get wrong: the Daily Check picker, abstinence counts, the weight trend and backup coverage.
- **My Quotes removal** needs a database version bump, plus removal from backup/restore (covered by #9).

---

## Changes made to V2-PLAN.md after this review

- Added a 2.0 / 2.x split. *(Later replaced by the core principle: many optional features, few in the spotlight, built one at a time.)*
- Added a **navigation decision** before step 3.
- Daily Check: added **fixed-schedule mode**.
- Weight: **7-day average → time-aware smoothed trend.**
- Themes: corrected effort, noted the 78 hard-coded colours.
- Step 0: added **backup hardening**. Step 1: **measure the bundle first**, animation library detail.
- APK: added **updates, automatic backups, notification rescheduling and Android permissions.**
- AI: added the cost estimate.
- Open questions: recommendation on fasting points, plus the navigation decision.

## Sources

- Marlatt's relapse prevention model / abstinence violation effect: [PMC overview](https://pmc.ncbi.nlm.nih.gov/articles/PMC6760427/), [ScienceDirect topic](https://www.sciencedirect.com/topics/psychology/abstinence-violation)
- Dietary restriction as a maintaining factor in binge eating; regular eating in CBT-E: [PMC (2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11093702/), [Cambridge: CBT-E key points](https://www.cambridge.org/core/journals/the-cognitive-behaviour-therapist/article/evolving-perspectives-on-cbte-for-eating-disorders-clarifying-ten-key-points-misconceptions-and-communication-gaps-explored/47CC468578C77CD65064DAFFE151A0B9)
- Weight trend smoothing: [The Hacker's Diet — Signal and Noise](https://www.fourmilab.ch/hackdiet/e4/signalnoise.html)
- Capacitor local notifications (permissions, exact alarms, Doze limit): [Capacitor docs](https://capacitorjs.com/docs/apis/local-notifications)
- Motion bundle sizes: [motion.dev — reduce bundle size](https://motion.dev/docs/react-reduce-bundle-size)
- Claude API browser access (BYOK): [Simon Willison on CORS support](https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/)
