# ItGetsBetter — MoSCoW Feature Prioritization

**Version:** 2.0
**Date:** 2026-06-22
**Context:** One developer with AI assistance. All 7 phases implemented.
**Companion Documents:** [PRD.md](PRD.md) · [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Current Status (2026-06-22)

**All Must Have, Should Have, and Could Have features have been implemented.** The Won't Have Yet items remain deferred. This document is now a historical record of the prioritization decisions that guided development.

| Priority | Original Count | Status |
|---|---|---|
| **Must Have** | 15 | ✅ All built (Phases 0-1) |
| **Should Have** | 8 | ✅ All built (Phases 2-3) |
| **Could Have** | 18 | ✅ All built (Phases 4-7) |
| **Won't Have Yet** | 14 | ⏳ Deferred — see [IDEAS.md](../5-ideas/IDEAS.md) for future concepts |

---

## Guiding Principle

The user's primary failure mode is emotional stress causing disengagement. The secondary failure mode is feeling overwhelmed. A Version 1 that tries to do too much will never ship — and an unshipped app helps no one.

**The test for every feature:** If you remove this, can the user still open the app daily, log their core health data, and feel supported? If yes, it's not Must Have.

---

## Must Have

These are non-negotiable. Without any one of these, the app either doesn't work, doesn't serve its core purpose, or violates a hard constraint.

---

### App Shell & Navigation

**Bottom tab bar, top bar, page routing, basic layout.**

Why Must: Without a shell, there is no app. This is the skeleton everything hangs on. However — only the structure is Must Have. The side menu can wait.

Scope guard: 4 bottom tabs (Home, Log, To-Do, Me). No side menu yet. No hamburger button. Pages not yet built get a placeholder "Coming Soon" screen.

---

### Warm Visual Theme

**Tailwind custom color palette. Warm, cozy, colorful. Light and dark mode.**

Why Must: The app's emotional identity is "warm, supportive mother." If v1 looks like a default gray Bootstrap app, it violates the core design philosophy. The user said visual design matters — colorful, cozy, friendly. First impressions determine whether they come back tomorrow.

Scope guard: One warm color palette. Light mode AND dark mode (these are fast to implement with Tailwind's `dark:` classes). But auto-switching based on time of day is a Should Have — a manual toggle is enough for v1.

---

### Home Screen

**Supportive message using display name. Quick-action buttons. Mini dashboard with today's key numbers.**

Why Must: This is the first thing the user sees every time they open the app. It sets the emotional tone. The supportive message is the app's personality. The quick actions reduce friction to log anything. Without this, the app feels like a filing cabinet, not a companion.

Scope guard: Supportive message (can be hardcoded initially, doesn't need the quote pool system), 2-3 quick-action buttons (Log Weight, Log Meal, Log Measurements). Mini dashboard shows only: last weight, today's meal count and average score. No fasting timer. No water progress. No points display. Those come when those features exist.

---

### Weight Tracking

**Log weight (kg), view history as a list, basic trend line graph, goal milestone display, BMI as derived number.**

Why Must: Explicit MVP feature. One of the user's top goals is logging weight twice per week. Weight trend is the most motivating feedback loop — the graph shows progress even when the day-to-day number fluctuates.

Scope guard: Single graph (simple line chart with data points). No smoothed trend line overlay yet (Should Have — it's a nice-to-have visualization enhancement). No weight loss rate calculation (derived metric, not needed for logging). Averaging multiple same-day entries IS included because the PRD specifies it and it's trivial logic.

---

### Meal Tracking

**Log meal with photo OR name. Health score 1-5 (required). Meal slots: Breakfast, Dinner, Snacks. View today's meals. Meal history.**

Why Must: Explicit MVP feature. The core of "improve awareness of what I eat." The health score is the minimum viable nutritional awareness — no calorie counting, just a gut-feel rating. Photo logging is the low-friction path that makes this usable for someone with ADHD.

Scope guard: Three meal slots visible (Breakfast, Dinner, Snacks). No configurable slot visibility. No lunch slot yet (it's optional/hidden per PRD — just don't build it yet). No calorie field. No notes field. No meal history graph (the list is enough for v1). Photo storage as IndexedDB blobs. No photo compression lifecycle yet.

---

### Body Measurements

**Log measurements (8 optional fields), view history, previous values shown for reference.**

Why Must: Explicit MVP feature. Body measurements are the user's evidence of physical transformation at 12 months. The data needs to start being collected from day one so there's a baseline.

Scope guard: Simple form with 8 optional fields. A list view of past entries. No trend line graphs per body area yet (Should Have). Previous values shown next to each field during entry (this is trivial and important for consistent measurement).

---

### Basic Profile & Settings

**Display name, height, starting weight, goal weight milestone. Manual light/dark mode toggle.**

Why Must: The app needs to know the user's name (for supportive messages) and height (for BMI). Goal weight milestone drives the weight screen. Without settings, nothing is configurable.

Scope guard: One settings page with these fields only. No schedule profile configuration. No notification preferences. No tag/quote/category management screens. Those come with their respective features.

---

### First-Launch Setup

**On first open: prompt for display name, height, weight, goal weight. Then show home screen.**

Why Must: Without initial data, the app has nothing to display and no way to address the user by name. The first experience must be immediate, warm, and unblocking.

Scope guard: Simple form, not a wizard. No "starter kit" habit suggestions (habits aren't in v1). No measurements during setup (they can go to the measurements screen). Get the user to the home screen in under 60 seconds.

---

### PWA Fundamentals

**Service worker, manifest.json, offline capability, installable on Android/iOS.**

Why Must: Hard constraint from the architecture. The app must work offline (NF-06) and be installable (NF-09). Without the service worker, the app breaks on airplane mode. Without the manifest, it can't be added to the home screen.

Scope guard: Precache the app shell. Offline fallback works. Install prompt can be the browser's native prompt — no custom install banner yet. No background sync. No push notifications.

---

### 3AM Day Boundary

**`getLogicalDate()` utility. Meals logged between 00:00-02:59 belong to the previous day.**

Why Must: This affects how every date-based query works. If built wrong initially, every feature built on top will have the wrong date logic and will need to be refactored. This is a foundational utility that costs an hour to build and prevents weeks of bugs later.

Scope guard: One utility function. Used by weight, meals, and measurements from day one.

---

### Backfill Support

**Ability to select a past date when logging weight, meals, or measurements.**

Why Must: The user will miss days — that's a certainty given ADHD and emotional stress patterns. If they can't backfill, missed days become permanent gaps. The ability to say "I had soup on Tuesday" is critical for the "forgiving" design philosophy. Without it, the app punishes absence by making the data permanently incomplete.

Scope guard: A date picker on entry forms. Nothing more. No special "backfill mode" UI.

---

### Deployment Pipeline

**Cloudflare Pages connected to GitHub. Auto-deploy on push to main.**

Why Must: If the app can't be deployed, it can't be used on a phone. The deployment pipeline is what turns code into a usable product. Cloudflare Pages is free and takes ~15 minutes to set up.

Scope guard: Main branch auto-deploys. No preview environments. No CI/CD checks (linting, tests) — those are Should Have. Just deploy.

---

### Persistent Storage Request

**Call `navigator.storage.persist()` on first launch to prevent browser/OS from evicting IndexedDB data.**

Why Must: This is a one-line safety mechanism, not a feature. Without it, the browser (especially on iOS) may silently delete all user data under storage pressure. The cost of adding it is near-zero. The cost of not having it is potentially catastrophic data loss.

Scope guard: One API call on first launch. Log the result. If on iOS and denied, guide user to "Add to Home Screen."

---

### Platform Detection & iOS Guidance

**Detect Android/iOS on first launch. On iOS, guide user to "Add to Home Screen" with clear instructions and reasoning.**

Why Must: On iOS, a PWA that isn't installed to the Home Screen has severely limited functionality (no notifications, weaker storage persistence). If the user is on iOS and doesn't install to Home Screen, the app is significantly degraded. A one-time guidance screen prevents this.

Scope guard: Detect platform. Show a dismissible guidance banner on iOS if not installed. No platform-specific features — just the guidance.

---

### Encrypted Backup (Export/Import)

**One-tap encrypted export to .igb file. Password-protected. Restore from file.**

Why Must: Data loss in a local-first app is devastating and likely causes permanent abandonment — which is the exact failure mode this app is designed to prevent. IndexedDB can be cleared by "Clear site data," iOS can evict it under storage pressure, and phones get lost. The user said losing data would be "very sad." The backup system is the safety net that makes local-first viable.

Scope guard: Export all data (including photo blobs) to an encrypted file. Import from file with password. Settings screen with "Create Backup" and "Restore Backup" buttons. No automated scheduling — manual one-tap is sufficient for MVP.

---

### getLogicalDate() Unit Tests

**Comprehensive test suite for the 3AM day boundary utility function, written before any feature that uses it.**

Why Must: Every feature in the app depends on `getLogicalDate()` for correct date assignment. A bug here cascades silently through all data — weight entries assigned to wrong days, meal timestamps misaligned, fasting calculations broken. This is the one function where upfront testing is cheaper than debugging later. The test suite covers: 2:59 AM, 3:00 AM, 3:01 AM, midnight, year boundaries, and backfill scenarios.

Scope guard: Unit tests only. No integration tests. No test infrastructure beyond Vitest (already in the stack).

---

## Should Have

Important features that make v1 significantly better, but the app is technically usable without them. These should be built immediately after the Must Haves, ideally in v1.1 or v1.2.

---

### Water Tracking

**Quick-add buttons (250ml, 300ml, 500ml, 1L, custom), daily progress, undo, configurable goal.**

Why Should (not Must): The user listed "2L water per day" as a 3-month goal. It's clearly important. But the app's core identity is weight + meals + measurements. Water tracking is additive — it doesn't block any other feature, and the user can track water on paper for 2 weeks while this gets built.

Why not Could: It's a 3-month goal, not a "someday" feature. And it's a quick build — the UI is just buttons and a progress bar.

---

### Fasting Tracker (Auto-Calculated)

**Derive fasting duration from meal timestamps. Live timer on home screen. Fasting goal. Streak.**

Why Should (not Must): The user specifically asked for this during the interview. Fasting is closely tied to meal logging — the data is already being collected, so fasting is essentially a view layer on top of meals. But it's a separate feature screen with its own logic, timer component, and streak calculation.

Why not Must: You can log meals without fasting awareness. Fasting is an interpretation of meal data, not a core logging action.

---

### Habits (Basic)

**Create habits with category and frequency. Daily check-off. "X of last Y days" display. Active/queued separation.**

Why Should (not Must): The user's 3-month goal includes "to-do list in order with reminders." Habits are half of the to-do system. Routine consistency is a core product goal.

Why not Must: The MVP is weight + meals + measurements. You can build healthy eating awareness without a habit tracker. The habit tracker is about routine structure, which is a parallel goal.

Scope guard: No 1-per-category-per-week enforcement yet (Could Have). No starter kit suggestions. No points earned from habits yet.

---

### Tasks

**Scrumboard: create tasks with title, due date, priority (low/medium/high/urgent), labels, sub-tasks (one level deep), project grouping. Check things off.**

Why Should (not Must): The user wants a unified place to track things to do alongside health habits. Combined with habits in the To-Do tab, this gives the full picture of "what do I need to do today." Due dates, priority, and sub-tasks make it usable for real life (school assignments, work tasks) without needing a separate app.

Why not Must: The MVP is health logging, not task management.

Scope guard: No reminders/push notifications (notifications are a separate concern). No task descriptions or notes. No drag-and-drop reordering. No Gantt charts or time tracking. Sub-tasks are one level deep only (title + completed). Labels are shared with habits as a unified category system.

---

### Basic Graphs Dashboard

**Weight trend, meal health scores over time, measurement trends. Configurable time range.**

Why Should (not Must): The user said "I LOVE graphs and charts" and wants them accessible day-to-day. Graphs are a primary motivation driver. The weight graph is in Must Have (it's on the weight screen), but a dedicated graphs page with multiple chart types is the difference between "functional" and "engaging."

Why not Must: The weight screen already has a graph. Meal scores can be seen as a list. The graphs dashboard is about richness of visualization, not core functionality.

---

### Welcome Back Message

**Detect 2+ days of inactivity. Show warm, unconditional "welcome back" message on next open. No guilt. No missed-day summary.**

Why Should (not Must): This is the single most important UX moment for retention. The user WILL disappear for days. What the app says when they return determines whether they stay. But technically, the app works without it — the home screen already shows a supportive message.

Why not Must: The home screen's default supportive message partially covers this. The welcome back message is an enhancement on top of that — a context-aware version.

---

### Auto Light/Dark Mode

**Switch theme automatically based on time of day (or OS preference).**

Why Should (not Must): Manual toggle is in Must Have. Auto-switching is a polish feature. It's trivial to implement (`prefers-color-scheme` media query or a time check), but it's not blocking usability.

---

### Smoothed Weight Trend Line

**Exponential moving average overlay on the weight graph, alongside raw data points.**

Why Should (not Must): Raw weight data fluctuates 1-2kg daily from water weight. A smoothed trend line shows the real trajectory and prevents discouragement from a single bad weigh-in. This is psychologically important — but the raw graph still shows progress directionally.

---

### Measurement Trend Graphs

**Per-body-area trend line charts on the measurements screen.**

Why Should (not Must): Without graphs, measurements are a list of numbers. With graphs, they tell a story. The data is being collected in Must Have — this is the visualization layer.

---

### CI/CD Quality Checks

**TypeScript type checking, ESLint, and basic tests running on pull requests.**

Why Should (not Must): For a solo developer, pushing broken code directly to production is a real risk. Type checking and linting on PR catch errors before they reach users. But for the first few weeks of rapid prototyping, you can run these locally.

---

## Could Have

Features that add real value but can absolutely wait. Building these before Should Have is scope creep. Target these for v1.3+ or Phase 2.

---

### Points System

**Earn points for logging, completing habits, hitting goals. Points balance display. Never decrease. All logged meals earn flat equal points regardless of health score — the act of logging is the achievement, not the quality of the meal.**

Why Could (not Should): Points are a long-term engagement mechanic. In the first few weeks, the novelty of a new app provides motivation. Points become important when novelty fades — around month 2-3. Building them now is premature optimization of engagement.

Risk of building too early: Getting the points economy wrong (values too high/low) is worse than not having points. It needs tuning, which requires real usage data.

Design note: Meal points are flat (not scaled by health score) to prevent unconscious score inflation and align with the "awareness over perfection" philosophy.

---

### Reward Shop

**User-created rewards with point costs. Gated claiming.**

Why Could: Depends on the points system. Can't exist without it. Even if points are built, the shop is a separate UI with its own management screens. It's fun but it's scope.

---

### Achievements

**Pre-built achievement library with fun comparisons. Trigger evaluation. Celebratory display.**

Why Could: Achievements require: a library of achievements (creative writing), trigger evaluation logic (engineering), a display screen (UI), and celebratory animations (polish). That's a lot of work for a feature that's primarily motivational, not functional.

Challenge: The user said "I'd love an achievement system!" — but loving a feature doesn't make it Must Have for v1. The question is: will you stop using the app if achievements aren't there in week 1? No. Will you enjoy the app more if they arrive in month 2? Yes. That's textbook Could Have.

---

### Custom Quote Pool

**User manages a pool of motivational quotes. Displayed on home screen and in notifications.**

Why Could: The home screen supportive message is in Must Have, but it can be a hardcoded set of messages initially. The full quote management system (CRUD screen, rotation strategy, separate storage table) is engineering effort that doesn't change the core experience. A hardcoded list of 10-15 warm messages, picked randomly, achieves 90% of the value at 10% of the cost.

---

### Mood Tracking

**Numeric score, user-created tags, mood history.**

Why Could (not Should): Mood data is primarily valuable for correlations ("you eat worse when you're sad"). Correlations require the health insight engine, which is Phase 4. Until then, mood data is collected but barely used. The weekly review can mention average mood, but without the insight engine, it's just a number with no actionable meaning.

Challenge: Mood tracking feels important because the user identified emotional stress as their failure mode. But tracking mood doesn't fix emotional stress — it just records it. The supportive messaging and forgiving design are what actually address the failure mode, and those are in Must Have.

---

### Sleep Tracking

**Hours slept, quality rating, wake feeling.**

Why Could: Same argument as mood. Sleep data is most valuable when correlated with other metrics. Without the insight engine, it's just a log. The user's smartwatch already tracks sleep. Manual logging adds friction for limited standalone value.

---

### Exercise Tracking

**Log exercise type, optional details (sets/reps/duration).**

Why Could: The user exercises "VERY occasionally." The 12-month goal is 3x/week, but the 3-month goal doesn't mention exercise at all. Building exercise tracking for someone who rarely exercises is building for a future self. When exercise becomes regular (3-6 months in), build the tracker then.

---

### Medicine Tracking

**Medication list, daily taken/not taken log, reminders.**

Why Could: The user takes daily medication and wants reminders. But reminders require the notification system, which is complex for a PWA. The medication log itself (taken/not taken) is simple to build, but without reminders it's just a manual checkbox — the user's phone alarm app already does this better. Build it when the notification system exists.

---

### Schedule Profiles

**School day vs. free day profiles with different wake times, meal windows, etc.**

Why Could: Schedule profiles influence notification timing and contextual reminders. Since notifications are a Could/Won't Have Yet feature in v1, there's nothing for profiles to drive. The settings exist conceptually but have no consumer.

---

### Modes (Exam, Social, Quiet)

**Temporary overlays that adjust expectations and notifications.**

Why Could: Same reasoning as schedule profiles. Modes modify notification behavior and expectation levels. Without the notification system and the weekly review's expectation logic, modes are toggles that don't toggle anything.

Exception: Quiet mode could be useful for suppressing in-app toasts — but there are no in-app toasts in v1 either.

---

### Weekly Reviews

**Auto-generated weekly summary with graphs, insights, and suggestions.**

Why Could (not Should): This is surprising — the weekly review sounds core. But consider: a weekly review requires data from multiple features (meals, weight, fasting, habits, water, mood, sleep, exercise). In v1, only weight, meals, and measurements exist. A weekly review of "you logged 3 weights and 12 meals this week" is not compelling. The review becomes valuable when there are 5+ data streams to summarize.

Build this when Phase 2 features (water, fasting, habits) exist and the user has enough data diversity to make the review meaningful.

---

### Progress Photos

**Capture, gallery, side-by-side comparison, storage lifecycle.**

Why Could: Progress photos are the most sensitive data with the most complex lifecycle (6-month notification, 1-year compression, export). The comparison tool requires non-trivial UI work. And the payoff is long-term — you need months of photos before side-by-side comparisons are interesting.

The user can take progress photos with their phone's camera app and compare them manually. Building this into the app adds convenience but not unique capability.

---

### In-App Notification Queue

**Contextual nudges, meal reminders, water nudges. Respects all notification rules.**

Why Could: The full notification rule engine (max 1/hour, phone-free windows, mode adjustments, 2-attempt limit) is significant engineering. For v1, the app's value comes from what the user actively does with it, not from what it proactively tells them.

---

### Data Export (Excel/PDF)

**Export all data to spreadsheet. Export graphs to PDF.**

Why Could: Export is valuable when there's meaningful data to export. In the first few months, the data set is small. Building SheetJS and jsPDF integration is real work. The encrypted backup (Should Have) already captures all data — export is about format convenience, not data preservation.

---

### Photo Compression Lifecycle

**Auto-compress meal photos at 3 months, progress photos at 1 year. Delete meal photos at 1 year.**

Why Could: Storage management isn't a problem until photos accumulate. At 2-3 photos/day, you won't hit any meaningful storage limit for 6+ months. Build this in month 4-5, not week 1.

---

### App Lock (PIN/Biometric)

**Optional PIN or biometric lock on app open.**

Why Could: The user's phone already has a lock screen. App-level locking is defense-in-depth. It matters most when progress photos are stored in the app (Could Have) — so it's dependent on a feature that's itself deferred.

---

### Habit Queue

**"Future habits I want" pool. Habits move from queue to active.**

Why Could: The basic habit system is Should Have. The queue adds management complexity. For v1's habit system, just let the user create habits and mark them active or not. The queue concept can be added when the 1-per-category-per-week enforcement arrives.

---

### 1-Per-Category-Per-Week Enforcement

**Prevent adding more than 1 new habit per category per week.**

Why Could: This is a self-regulation mechanism. The user designed it to prevent overcommitting. But it's a business rule that requires tracking "when was the last habit activated in this category" — extra logic on top of basic habits. For v1, the user can self-regulate manually. Build the enforcement when it's needed.

---

### Starter Habit Kit

**Suggested 2-3 habits during first launch.**

Why Could: First-launch setup (Must Have) gets the user started with weight/meals. Habits aren't in Must Have, and suggesting habits before the user has established a routine is premature. Suggest habits when the habit feature is built and the user has been using the app for a week.

---

### Install Prompt (Custom)

**Custom "Add to Home Screen" banner after 3 visits.**

Why Could: The browser's native install prompt already exists. A custom one is polish. Build it when the core experience is solid enough to confidently encourage installation.

---

### Side Menu Navigation

**Hamburger menu with secondary navigation links.**

Why Could: The bottom tabs (Must Have) cover primary navigation. Secondary screens can be reached from within their parent tabs (e.g., Graphs accessible from the Me tab). A side menu is a navigation convenience, not a necessity.

---

## Won't Have Yet

Features that are explicitly deferred. Building any of these before v1 is shipped would be a mistake. They are either too complex, dependent on unbuilt features, or speculative.

---

### Health Insight Engine

**Automated correlation discovery between metrics. Confirm/reject flow.**

Why not: Requires multiple data streams (mood + sleep + meals + exercise) running for weeks. Requires either statistical analysis code or a local AI. The data doesn't exist yet. The algorithms don't exist yet. This is Phase 4 in the architecture document. Building it now would consume months and produce nothing usable.

---

### Push Notification Server

**Scheduled push notifications via Cloudflare Worker.**

Why not: Introduces server infrastructure for a local-first app. Requires Web Push API setup, subscription management, and server-side scheduling. The ROI is low until the notification rule engine exists (Could Have), and the in-app notification queue covers most use cases. This is Phase 5.

---

### Multi-Device Sync

**Sync data between phone and desktop via encrypted protocol.**

Why not: The user explicitly said desktop is a "would, not a must." The architecture is designed for phone-only. Sync requires either Dexie Cloud (paid service) or a self-hosted server (infrastructure the user doesn't have). The user said they don't know about self-hosting. This is Phase 5 at earliest.

---

### Local AI Engine

**On-device LLM for natural language insights, smart nudges, contextual support.**

Why not: Running a local LLM requires either a powerful desktop machine or a cloud endpoint (privacy concern). The user wants this eventually but acknowledged it's complex. Without an AI engine, the app still works — insights are just manual observations. This is long-term.

---

### Companion Character

**ItGetsBetter as an interactive character with personality.**

Why not: The user explicitly said "that is a lot of difficult work, so that's on the backburner." Respect that.

---

### Smartwatch Integration

**Import step count, heart rate, sleep data from smartwatch.**

Why not: Requires a data pipeline from the smartwatch (likely through a companion app or API), which introduces third-party data flow — hitting the privacy boundary. The user said "pending privacy verification." Don't build on unverified ground.

---

### Autophagy Tracking

**Track time spent in autophagy zones during fasting.**

Why not: Requires medical/scientific input on accurate autophagy thresholds. Getting this wrong could provide misleading health information. Defer until research is done.

---

### Sugar Detox Mode

**Temporary mode with sugar-specific scoring and tracking.**

Why not: A specialized mode for a behavior the user said they'd "consider in the future." Don't build for "consider."

---

### Guided Onboarding Wizard

**Friendly step-by-step walkthrough for first-time setup.**

Why not: The user said "something for the future, not now." The manual setup form (Must Have) is sufficient. A wizard is a UX enhancement, not a functional requirement.

---

### Quote Tone Shifting Based on Mood

**Adjust quote selection based on recent mood data.**

Why not: Requires mood tracking (Could Have) + custom quote pool (Could Have) + mood-to-quote matching logic. Three dependencies, none of which exist in v1.

---

### Workout Plans

**Structured exercise programs to follow.**

Why not: The user was undecided ("I don't know if I wanna add that"). Don't build features the user hasn't committed to wanting.

---

### Calendar Integration

**Auto-detect school vs. free days from external calendar.**

Why not: Requires OAuth to Google Calendar or similar, which is third-party integration. Schedule profiles (Could Have) don't even exist yet.

---

### Meal Photo AI Analysis

**Local AI estimates meal contents from photos.**

Why not: This is essentially building a food recognition model. Massively complex. The user explicitly chose subjective health scores over automated analysis. This would undermine that design decision.

---

### Desktop-Optimized Layout

**Responsive breakpoints for wider screens, sidebar navigation replacing bottom tabs.**

Why not: The PWA already works on desktop (it's a website). It just won't be optimized for large screens. For a personal app used by one person on their phone, desktop optimization is effort spent for a platform the user said isn't required.

---

### Automated Cloud Backup

**Scheduled encrypted backup to Google Drive / Dropbox.**

Why not: Requires OAuth integration with a cloud storage provider. The manual encrypted export (Should Have) covers the backup requirement without third-party integration.

---

### Emotional Support Detection

**Detect low mood + logging silence pattern. Auto-send supportive messages.**

Why not: Requires mood tracking (Could Have) + notification system (Could Have) + pattern detection logic. Well-intentioned but complex and potentially intrusive if implemented poorly. Get the basic experience right first.

---

## Summary Table

| Priority | Count | Features |
|---|---|---|
| **Must Have** | 15 | App shell, warm theme, home screen, weight tracking, meal tracking, body measurements, basic profile/settings, first-launch setup, PWA fundamentals, 3AM day boundary, getLogicalDate() tests, backfill support, deployment pipeline, persistent storage request, platform detection & iOS guidance, encrypted backup |
| **Should Have** | 8 | Water tracking, fasting tracker, basic habits, basic tasks (scrumboard), graphs dashboard, welcome back message, auto light/dark mode, smoothed weight trend, measurement graphs, CI/CD checks |
| **Could Have** | 18 | Points system (flat meal points), reward shop, achievements, custom quotes, mood tracking, sleep tracking, exercise tracking, medicine tracking, schedule profiles, modes, weekly reviews, progress photos, notification queue, data export, photo lifecycle, app lock, habit queue, habit enforcement, starter kit, custom install prompt, side menu |
| **Won't Have Yet** | 14 | Health insights, push server, multi-device sync, local AI, companion character, smartwatch integration, autophagy, sugar detox, onboarding wizard, quote tone shifting, workout plans, calendar integration, meal photo AI, desktop layout, automated cloud backup, emotional support detection |

---

## Build Order Recommendation

```
Week 1-2:  Must Have (all 15 items)
           → Result: A usable app that logs weight, meals, and measurements
           → Data is safely backed up from day one
           → Deployed and installable on phone
           → getLogicalDate() fully tested

Week 3-4:  Should Have (water, fasting, habits, tasks, graphs)
           → Result: An engaging daily-use app with routine tracking

Week 5-6:  Should Have (remaining: welcome back, auto theme, smoothed trend,
           measurement graphs, CI/CD)
           → Result: A polished, emotionally intelligent v1

Month 2-3: Could Have (prioritized by user desire and engagement impact)
           → Suggested order: points (flat meal points) → achievements → mood → weekly reviews
           → Result: Long-term engagement mechanics in place

Month 4+:  Remaining Could Haves and early Won't Have Yets as the user's
           routine matures and real usage patterns emerge
```

---

## Scope Creep Red Flags

Watch for these during implementation:

1. **"While I'm building meals, I might as well add the calorie field."** No. Optional fields that nobody asked for in MVP are scope creep disguised as thoroughness.

2. **"The achievement system would only take a day."** It won't. Achievement library + trigger engine + UI + animations + testing = a week. And it depends on the points system, which depends on habits being built.

3. **"I need notifications for the medicine reminders."** You need medicine tracking first (Could Have), which needs the notification system (Could Have), which needs the notification rule engine (Could Have). That's three features masquerading as one.

4. **"I need reminders, descriptions, and drag-and-drop on tasks."** The task system has due dates, priorities, sub-tasks, and labels — that's the agreed scope. Reminders require the notification system (separate feature). Descriptions, drag-and-drop reordering, and recurring tasks are scope creep beyond the scrumboard model. If a task needs a paragraph of notes, it belongs in a different tool.

5. **"The weekly review would motivate me to keep going."** It will — in month 3 when you have rich data. In week 1 with only weight and meals, it's a summary of two numbers. Build it when it has something to summarize.

6. **"I should add the reward shop now so I can reward myself for building the app."** Charming, but no. Use real-world rewards until the point system exists.

---

*This prioritization will shift as the app is used. Re-evaluate after the first month of real daily use — actual behavior reveals actual priorities better than any planning document.*
