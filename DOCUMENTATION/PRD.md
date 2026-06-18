# ItGetsBetter — Product Requirements Document

**Version:** 1.0
**Date:** 2026-06-18
**Author:** Product Definition (Interview-Driven)
**Status:** Draft — Pending Technical Architecture

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Product Goals](#2-product-goals)
3. [Success Metrics](#3-success-metrics)
4. [User Profile](#4-user-profile)
5. [User Journeys](#5-user-journeys)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Data Entities](#8-data-entities)
9. [Entity Relationships](#9-entity-relationships)
10. [Screen Inventory](#10-screen-inventory)
11. [Navigation Structure](#11-navigation-structure)
12. [Notifications](#12-notifications)
13. [Reporting Requirements](#13-reporting-requirements)
14. [Weekly Review Requirements](#14-weekly-review-requirements)
15. [Health Insight Requirements](#15-health-insight-requirements)
16. [Future Feature Ideas](#16-future-feature-ideas)
17. [Risks and Assumptions](#17-risks-and-assumptions)
18. [Unresolved Decisions](#18-unresolved-decisions)

---

## 1. Product Vision

ItGetsBetter is a personal Health Operating System designed to create structure and consistency in the user's life through health-focused routines. It is not a weight loss app. It is not a calorie counter. It is a warm, supportive, forgiving companion that helps the user build awareness of their health behaviors, track progress across multiple dimensions, and develop sustainable habits over time.

The app consolidates what would otherwise be 5-8 separate apps (calorie tracker, habit tracker, to-do list, weight tracker, mood journal, fasting timer, water tracker) into a single private, offline-capable, phone-first experience.

### Core Design Philosophy

Every feature decision must pass through these filters, in priority order:

1. **Supportive and forgiving.** The app never guilts, shames, or punishes. It behaves like a mother welcoming back a beloved child — unconditionally warm, patient, and safe. A user who disappears for a week should feel welcomed, not judged.
2. **Low friction with optional depth.** The default interaction is the minimum viable input (a tap, a photo, a name). More detail is always available but never required. Designed for someone with ADHD/autism where executive function is a limited resource.
3. **Awareness over perfection.** The act of logging — even logging a bad day — is the achievement. Healthy choices are a bonus. The system rewards honesty and consistency of engagement, not flawless behavior.
4. **Privacy first.** No third party sees the user's data in plain text. Encrypted cloud storage is acceptable. The user's body, habits, mood, and photos are theirs alone.
5. **Modular and extensible.** Features can be added, removed, and adjusted over time. The architecture supports change without rebuilding.

### Tone and Personality

- Warm, cozy, friendly
- Encouraging without being saccharine
- Gentle and never pushy
- Fun where appropriate (achievements, points, playful comparisons)
- Uses the user's chosen display name
- In the future, may evolve into a companion character (backburner)

---

## 2. Product Goals

### 3-Month Goals

| Goal | Measurable Target |
|---|---|
| Weight loss | Visible downward trend in weight |
| Healthier eating habits | Health score trend increasing over time (no fixed numeric target) |
| Eating awareness | Logging meals consistently (photo or name at minimum) |
| Weight logging consistency | At least 2 weigh-ins per week |
| To-do list functional | Tasks and habits usable with reminders |
| Water intake | Drinking at least 2L water per day |

### 12-Month Goals

| Goal | Measurable Target |
|---|---|
| Body transformation | Visible change in body measurements over time |
| Exercise consistency | Exercising at least 3 times per week |
| Health score improvement | Average meal health score of 4/5 consistently |
| Routine consistency | Opening the app on at least 75% of days |
| Weight loss rate | Average of 0.5kg loss per week (measured monthly) |

---

## 3. Success Metrics

### Engagement Metrics

| Metric | Target | Measurement |
|---|---|---|
| App open rate | 75% of days | Days with at least one interaction / total days |
| Meal logging rate | At least 1 meal logged per day on active days | Meals logged / expected meals |
| Weight logging rate | At least 2 entries per week | Weekly weigh-in count |
| Habit completion rate | Trending upward over time | Completed habits / active habits per day |

### Health Metrics

| Metric | Target | Measurement |
|---|---|---|
| Average meal health score | 3/5 at 3 months, 4/5 at 12 months | Rolling weekly average of all scored meals |
| Weight trend | -0.5kg/week average | Monthly weight delta / 4 |
| Water intake | 2L daily | Daily water total vs. configured goal |
| Fasting consistency | Meeting configured fasting goal | Days fasting target was met / active days |

### Retention Metrics

| Metric | Target | Measurement |
|---|---|---|
| Longest absence before return | Decreasing over time | Max consecutive days without app open |
| Return rate after absence | 100% (the user always comes back) | Qualitative — the app should never be the reason they don't return |
| Points economy health | Small reward earnable in ~1 week, large in ~1 month | Points earned vs. reward costs |

---

## 4. User Profile

### Demographics

- Single user, personal use only
- Student (HBO ICT level)
- ADHD and autism
- Near-zero existing health routine
- Schedule varies between school days and free days
- No dietary allergies or intolerances
- Takes medication daily or every other day
- Currently owns an analog scale
- Wears a smartwatch (privacy of data connection not yet verified)
- Speaks Dutch and English; app interface in English with user-created tags in any language

### Behavioral Patterns

- **Primary failure mode:** Emotional stress causes complete disengagement. The user stops logging, stops opening the app, and withdraws. This is the most critical design consideration.
- **Motivation drivers:** Streaks (shown as "18 of 21 days", never "streak broken"), visual progress (graphs/charts), completing lists, gamification (EXP/points), fun achievements with playful comparisons.
- **Demotivation triggers:** Guilt, shame, feeling behind, too many separate apps, tedious manual entry (especially calorie counting), excessive time on phone.
- **Phone usage philosophy:** Wants 1 hour phone-free after waking and before sleeping. Dislikes being on phone constantly, but uses the app throughout the day. Interactions should be minimal and purposeful.

### Schedule Profiles

The user operates on two distinct schedule profiles:

| Attribute | School Day | Free Day |
|---|---|---|
| Wake time | ~7:00 AM | ~8:00 AM |
| Phone-free until | ~8:00 AM | ~9:00 AM |
| First meal (breakfast) | Around typical lunch time | Flexible |
| Phone away at | ~21:00 | ~21:00 |
| Target sleep time | ~22:00 | ~22:00 |

The user should be able to manually set which profile applies to each day, as the schedule is not predictable week to week.

### Temporary Modes (Overlays on Schedule Profiles)

- **Exam mode:** Lower expectations across all metrics. Reduced notifications.
- **Social day:** Preemptively adjusted expectations when marked. Logging is expected to drop.
- **Quiet mode:** Silences all notifications. The app does not interpret silence as failure.
- **Custom modes:** The system should be extensible to support user-defined modes in the future.

---

## 5. User Journeys

### 5.1 First Launch

1. User opens the app for the first time.
2. App asks for: display name, height, starting weight, goal weight (small milestone, not final target), and body measurements (all optional).
3. User fills in the fields they want. No field is blocking.
4. App shows the home screen with a supportive welcome message.
5. A "starter kit" of 2-3 suggested habits is offered (user can accept, modify, or skip).
6. User can immediately begin logging weight, meals, or measurements.

> **Note:** A guided onboarding wizard is a future enhancement. For v1, manual setup via direct data entry is acceptable.

### 5.2 Typical Morning (School Day)

1. User wakes at 7:00 AM. No notifications until 8:00 AM (phone-free hour).
2. At ~9:00 AM, the morning motivational quote notification arrives (from the user's custom quote pool). It does not contain a data summary — it may suggest opening the app.
3. User opens app. Home screen shows a supportive message, today's fasting timer (auto-calculated from last night's dinner), quick-action buttons, and a small dashboard with key metrics.
4. User weighs themselves, taps "Log Weight," enters the number.
5. User breaks fast with a meal around lunchtime. They take a photo or type the meal name, assign a health score (1-5), and optionally add calories or other detail.
6. Fasting timer automatically stops and records the fast duration.
7. Throughout the day, user taps water buttons (250ml, 500ml, etc.) as they drink.
8. User checks off to-do items and habits as they complete them.

### 5.3 Typical Evening

1. User eats dinner, logs it (photo/name + health score).
2. At 21:00, the evening motivational quote notification arrives. May suggest opening the app to review the day.
3. User optionally checks their daily dashboard — graphs, progress, points earned.
4. User puts phone away at 21:00. No further notifications.

### 5.4 Weekly Measurement Session

1. User decides to log measurements (e.g., Sunday morning).
2. Opens measurement screen. Eight fields are shown: neck, chest, hips, waist, arms, thighs, ankles, wrists.
3. All fields are optional — user can log only the ones they choose.
4. Previous values are shown for reference.
5. Data is saved and trends are updated.

### 5.5 Weekly Review (Sunday Morning)

1. App generates a weekly summary (not a notification — the user opens it).
2. Summary includes: weight trend, average meal health score, fasting totals (total hours, autophagy time in future), habit completion rates, mood patterns, graphs and charts.
3. App may surface a discovered correlation for confirmation: "You seem to rate meals lower on days you sleep under 6 hours. Is this accurate?" User confirms or denies.
4. App suggests 1-2 gentle goals for the coming week based on the data: "Consider adding a 10-minute walk" or "You're ready to add a new exercise habit."
5. Review is read-only — it looks backward and suggests forward.

### 5.6 Return After Absence (3-7 Days Away)

1. User opens app after several days of no interaction.
2. Home screen shows a warm "welcome back" message. No guilt. No summary of what was missed. No "you broke your streak."
3. Streaks display as "18 of the last 21 days" style, not "streak: 0."
4. All data for missed days is simply absent — no zeros, no failures.
5. User can backfill past entries if they choose to ("I had pasta on Tuesday").
6. Points balance is unchanged — no points were lost during absence.
7. The app behaves as if the user never left, just with a gap in the data.

### 5.7 Emotional Stress / Bad Day

1. User logs a low mood score with tags ("binged food", "stressed").
2. User logs a 1/5 health score meal, or considers not logging.
3. If the user logs the bad meal: they earn small points for honesty. The app does not comment on the score.
4. If the user goes silent after a low mood entry: after appropriate delay, app sends a gentle, supportive message. "It's okay. Log when you're ready. Even imperfect is progress."
5. Nudging stops after 2 attempts. The app waits patiently.

### 5.8 Reward Redemption

1. User has accumulated enough points through healthy habits, meal logging, streaks, and milestones.
2. User opens the reward shop (self-created rewards with self-assigned point costs).
3. User selects a reward. The app checks: does the user have enough points?
4. If yes: reward is marked as claimed, points are deducted. 
5. If no: the app shows how many more points are needed. No shame — just "12 more points to go!"

---

## 6. Functional Requirements

### 6.1 Weight Tracking

| ID | Requirement |
|---|---|
| WT-01 | User can log their weight with a numeric value (kg). |
| WT-02 | User can log weight multiple times per day. |
| WT-03 | Multiple weigh-ins on the same day are averaged for that day's official value. |
| WT-04 | User can backfill weight entries for past dates. |
| WT-05 | Weight history is displayed as a trend line graph. |
| WT-06 | The system calculates and displays a smoothed trend line alongside raw data points. |
| WT-07 | Goal weight is set as a small milestone (e.g., "lose 3kg"), not a distant final target. |
| WT-08 | When a milestone is reached, the user is prompted to set the next one. |
| WT-09 | BMI is calculated and displayed as a derived metric (height + weight). BMI is not a goal and is not tracked as a habit. |
| WT-10 | Weight loss rate is calculated as a monthly average (monthly delta / 4) and compared against the 0.5kg/week target. |

### 6.2 Meal Tracking

| ID | Requirement |
|---|---|
| ML-01 | User can log a meal with a minimum of: a photo OR a name/description. |
| ML-02 | Every meal requires a health score (1-5, manually assigned by the user). |
| ML-03 | Calories and other nutritional details are optional fields. |
| ML-04 | Meal slots are: Breakfast, Lunch (optional, hidden by default), Dinner, and Snacks. |
| ML-05 | The user can configure which meal slots are visible. |
| ML-06 | Meals can be logged for past dates (backfill). |
| ML-07 | Meal photos are stored locally on the device. |
| ML-08 | Food photos are compressed after 3 months. |
| ML-09 | Food photos are deleted after 1 year, or earlier if storage exceeds a configurable threshold. |
| ML-10 | A loose reference guide for health scores is available but not enforced (e.g., 1 = fast food, 5 = balanced home-cooked). The user defines their own meaning. |
| ML-11 | Average meal health score is calculated on a rolling weekly basis. |

### 6.3 Body Measurements

| ID | Requirement |
|---|---|
| BM-01 | User can log body measurements for: neck, chest, hips, waist, arms, thighs, ankles, wrists. |
| BM-02 | All measurement fields are optional per session — user can log any subset. |
| BM-03 | Previous values are shown during entry for reference. |
| BM-04 | Measurement history is displayed as trend lines per body area. |
| BM-05 | Measurements can be logged for past dates (backfill). |

### 6.4 Progress Photos

| ID | Requirement |
|---|---|
| PP-01 | User can take and store progress photos. |
| PP-02 | Photos should follow a consistent pose/angle pattern, but deviations are allowed. |
| PP-03 | Progress photos are the most sensitive data in the app and must be stored with maximum privacy. |
| PP-04 | Photos are never deleted while the app is active/installed. |
| PP-05 | After 6 months, the app notifies the user that photos are aging, giving them the option to download/export them. |
| PP-06 | After 1 year, progress photos are compressed to reduce storage. |
| PP-07 | Progress photos are exportable — the user can take them with them if they leave the app. |
| PP-08 | Before/after comparisons should be viewable (e.g., side-by-side of month 1 vs. month 6). |

### 6.5 Fasting Tracker

| ID | Requirement |
|---|---|
| FT-01 | Fasting duration is automatically calculated from the time between the last meal of one day and the first meal of the next. |
| FT-02 | No manual start/stop timer is needed — fasting is derived from meal log timestamps. |
| FT-03 | User sets a fasting goal (e.g., 16 hours). This can be changed at any time. |
| FT-04 | The system supports both intermittent fasting (fixed eating window) and flexible fasting (just a duration goal). |
| FT-05 | Anything with calories breaks a fast. If a snack is logged during the fasting window, the fast is marked as broken at that time. |
| FT-06 | If a caloric item is logged during the expected fasting window, the app shows a visual indicator that the fast was broken. No punitive notification. |
| FT-07 | Today's fasting duration is displayed on the home screen as a live timer. |
| FT-08 | Fasting streaks (consecutive days meeting the fasting goal) are tracked. |
| FT-09 | Weekly fasting totals are calculated for the weekly review (total hours fasted, time in autophagy zones in a future phase). |
| FT-10 | Old fasting goals apply to old data — changing the goal does not retroactively re-evaluate past entries. |

### 6.6 Water Tracking

| ID | Requirement |
|---|---|
| WA-01 | User sets a daily water intake goal (default: 2L, configurable). |
| WA-02 | Water is logged via preset quick-add buttons: 250ml, 300ml, 500ml, 1L. |
| WA-03 | A custom amount option is available for non-standard sizes. |
| WA-04 | Each tap has an undo action for accidental entries. |
| WA-05 | Daily progress is shown as a visual indicator (e.g., progress bar, filling glass). |
| WA-06 | Days with no water logged are recorded as "unknown" — not 0ml. They are excluded from averages. |

### 6.7 Mood Tracking

| ID | Requirement |
|---|---|
| MO-01 | Mood is logged on a numeric scale (range to be determined — e.g., 1-5 or 1-10). |
| MO-02 | Mood entries include user-created tags (e.g., "went out drinking", "saw friends", "binged food", "terrasje gepakt"). |
| MO-03 | Tags are created by the user in any language, from a personal tag library. |
| MO-04 | New tags can be added at any time. |
| MO-05 | Mood can be logged multiple times per day. |
| MO-06 | Mood data is correlated with other metrics (weight, meals, sleep, exercise) for insight generation. |
| MO-07 | On days marked as "social day" mode, expectations across all metrics are preemptively adjusted. |
| MO-08 | Mood patterns are surfaced in the weekly review. |

### 6.8 Sleep Tracking

| ID | Requirement |
|---|---|
| SL-01 | User manually logs: hours slept, sleep quality rating, how they feel upon waking. |
| SL-02 | Smartwatch integration for automated sleep data is a future consideration (pending privacy verification). |
| SL-03 | Sleep data is correlated with other metrics for insight generation. |

### 6.9 Exercise Tracking

| ID | Requirement |
|---|---|
| EX-01 | User logs that they exercised, with a required exercise type (boxing, running, dancing, weight lifting, etc.). |
| EX-02 | Optional detail fields: sets/reps/weight (for gym), duration, distance. |
| EX-03 | Exercise counts as "intentional high-intensity activity" — not casual walking. |
| EX-04 | Exercise data is correlated with weight, mood, sleep, and other metrics. |
| EX-05 | The exercise type list is user-extensible. |
| EX-06 | Seasonal activities are supported — activities can be marked as active or inactive without deletion. |

### 6.10 Tasks

| ID | Requirement |
|---|---|
| TK-01 | Tasks are one-time actions that do not repeat. |
| TK-02 | Tasks can belong to a project (a grouping of related tasks). |
| TK-03 | Tasks appear in a unified "to-do" view alongside habits, but are stored separately. |
| TK-04 | Tasks have reminders with push notifications at user-set times. |
| TK-05 | Completing a task earns a small number of points (e.g., 5 points). |
| TK-06 | This is a general-purpose task manager (not limited to health tasks). It must be good enough to replace Todoist. |

### 6.11 Habits

| ID | Requirement |
|---|---|
| HB-01 | Habits are recurring actions with a configurable frequency: daily, weekly, or monthly. |
| HB-02 | Habits appear in a unified "to-do" view alongside tasks, but are stored separately. |
| HB-03 | Habits have categories (e.g., diet, exercise, skincare, etc.). Categories are user-defined. |
| HB-04 | The user can add a maximum of 1 new habit per category per week. |
| HB-05 | A "habit queue" exists: a pool of future habits the user wants to eventually adopt. Habits move from the queue to active status. |
| HB-06 | A "starter kit" of 2-3 suggested habits is offered during initial setup. |
| HB-07 | Habit streaks are displayed as "X of last Y days" format, never "streak: 0" or "streak broken." |
| HB-08 | Habit completion rate is tracked and surfaced in the weekly review. |
| HB-09 | Completing habits earns points. |

### 6.12 Medicine Tracking

| ID | Requirement |
|---|---|
| MD-01 | User can configure medications with a name and frequency (daily, every other day, etc.). |
| MD-02 | The app sends reminders for medication. Medication does not need to be taken at a specific time of day — just on the correct days. |
| MD-03 | The user logs "taken" or "not taken" per medication per day. |
| MD-04 | Medicine adherence history is stored and viewable. |

### 6.13 Points & Reward System

| ID | Requirement |
|---|---|
| PT-01 | Points are earned through healthy behaviors. Points are never deducted. |
| PT-02 | Logging a meal earns points, regardless of health score. Higher health scores earn more points. A 3/5 health score is the neutral baseline and earns a minimal amount. |
| PT-03 | Hitting daily goals earns a small number of points. |
| PT-04 | Streaks earn escalating points (longer streaks = more points per day). |
| PT-05 | Completing habits earns a small number of points. |
| PT-06 | Completing tasks earns a small number of points (e.g., 5 points). |
| PT-07 | Milestones (e.g., losing 3kg) earn large point rewards (e.g., 1000 points). |
| PT-08 | Not logging earns 0 points — no penalty, no reward. |
| PT-09 | The user creates and manages their own reward shop with custom rewards and custom point costs. |
| PT-10 | Rewards cannot be claimed until the user has enough points. The app enforces this gate. |
| PT-11 | The points economy is calibrated so that a small reward is earnable in approximately 1 week of good behavior, and a large reward in approximately 1 month. |
| PT-12 | Points balance is always visible and never decreases. |

### 6.14 Achievements

| ID | Requirement |
|---|---|
| AC-01 | The app includes a pre-built library of achievements. |
| AC-02 | Achievements are triggered by milestones: first weigh-in, first 7-day streak, 100 meals logged, 5kg lost, etc. |
| AC-03 | Achievements include fun, relatable comparisons (e.g., "You lost 5kg — that's the weight of a cat!"). |
| AC-04 | Achievements are displayed in a dedicated achievements screen. |
| AC-05 | New achievements trigger a celebratory notification/animation. |

### 6.15 Custom Quotes

| ID | Requirement |
|---|---|
| CQ-01 | The user maintains a pool of custom motivational quotes/messages. |
| CQ-02 | Quotes are used in the morning (9:00 AM) and evening (21:00) notifications. |
| CQ-03 | Quotes are rotated — the app selects from the pool (rotation strategy TBD: random, sequential, weighted). |
| CQ-04 | The purpose of quotes is both motivation ("you've got this") and grounding ("remember why you started"). |
| CQ-05 | Tone shifting based on mood data is a future consideration — not in initial implementation. |

### 6.16 Data Export

| ID | Requirement |
|---|---|
| DE-01 | All data is exportable to Excel (spreadsheet format). |
| DE-02 | Graphs and charts are exportable to PDF. |
| DE-03 | Progress photos are exportable as image files. |
| DE-04 | Export includes all historical data — nothing is excluded. |

### 6.17 Day Boundary & Backfill

| ID | Requirement |
|---|---|
| DB-01 | A "day" runs from 03:00 AM to 02:59 AM the next day. |
| DB-02 | All daily metrics (water, meals, habits, mood, fasting) reset at 03:00 AM. |
| DB-03 | Meals logged between 00:00 and 02:59 belong to the previous day. |
| DB-04 | If a meal is logged during the fasting window (regardless of clock day), the fast is broken on the calendar day the meal belongs to. |
| DB-05 | Users can backfill entries for any past date across all trackable metrics. |

---

## 7. Non-Functional Requirements

### 7.1 Privacy & Security

| ID | Requirement |
|---|---|
| NF-01 | No third party can access the user's data in plain text. |
| NF-02 | End-to-end encrypted cloud storage is acceptable for backup/sync purposes. |
| NF-03 | Progress photos are the most sensitive data and must have the highest level of protection. |
| NF-04 | The app does not share data with any external service, analytics platform, or ad network. |
| NF-05 | Single-user system — no accounts, no social features, no data sharing. |

### 7.2 Offline Capability

| ID | Requirement |
|---|---|
| NF-06 | The app must be fully functional without an internet connection. |
| NF-07 | All data is stored locally on the device. |
| NF-08 | Sync (if implemented) occurs only when online and is not required for any functionality. |

### 7.3 Platform

| ID | Requirement |
|---|---|
| NF-09 | Phone is the primary and required platform. |
| NF-10 | Desktop is a desired but not required platform. |
| NF-11 | If only one platform is built, it is the phone version. |

### 7.4 Performance & Storage

| ID | Requirement |
|---|---|
| NF-12 | The app should feel responsive — logging actions should complete in under 1 second. |
| NF-13 | Photo storage must be managed: food photos compressed at 3 months, deleted at 1 year or when storage is excessive. Progress photos compressed at 1 year. |
| NF-14 | The app is designed for indefinite use — data storage must scale gracefully over years. |

### 7.5 Backup

| ID | Requirement |
|---|---|
| NF-15 | Data backup is a requirement, not a nice-to-have. |
| NF-16 | Backup should be as close to automatic as possible. Manual backup is acceptable but should be low-friction (ideally one tap). |
| NF-17 | Backup must be encrypted. |
| NF-18 | Loss of the device should not mean total loss of data. |

### 7.6 Modularity

| ID | Requirement |
|---|---|
| NF-19 | Features can be added, modified, or removed without rebuilding the entire app. |
| NF-20 | Configuration values (point costs, fasting goals, notification times, etc.) should be adjustable without code changes where possible. |
| NF-21 | The app architecture should support phased feature rollout. |

### 7.7 Accessibility

| ID | Requirement |
|---|---|
| NF-22 | The app supports automatic light/dark mode switching based on time of day. |
| NF-23 | Manual light/dark mode toggle is also available. |
| NF-24 | The visual design is colorful, warm, and cozy — not clinical or minimal. |

---

## 8. Data Entities

### 8.1 User Profile

| Field | Type | Required | Notes |
|---|---|---|---|
| display_name | String | Yes | The name the app uses to address the user |
| height | Number (cm) | Yes | Used for BMI calculation |
| starting_weight | Number (kg) | Yes | Baseline reference |
| goal_weight_milestone | Number (kg) | Yes | Small milestone target, not final goal |
| schedule_profile | Enum | Yes | Active profile: school_day or free_day |
| active_mode | Enum | No | Temporary overlay: exam, social, quiet, or none |
| points_balance | Number | Yes | Current accumulated points |
| created_at | DateTime | Yes | Account creation date |

### 8.2 Weight Entry

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| date | Date | Yes | Calendar date (respecting 3AM boundary) |
| value | Number (kg) | Yes | |
| logged_at | DateTime | Yes | Actual timestamp of entry |
| is_backfill | Boolean | Yes | Whether this was entered retroactively |

### 8.3 Meal Entry

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| date | Date | Yes | Calendar date (respecting 3AM boundary) |
| meal_slot | Enum | Yes | breakfast, lunch, dinner, snack |
| name | String | Conditional | Required if no photo |
| photo_path | String | Conditional | Required if no name |
| health_score | Integer (1-5) | Yes | User-assigned |
| calories | Number | No | Optional |
| notes | String | No | Optional free text for additional detail |
| logged_at | DateTime | Yes | Actual timestamp — used for fasting calculation |
| is_backfill | Boolean | Yes | |

### 8.4 Body Measurement Entry

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| date | Date | Yes | |
| neck | Number (cm) | No | All measurement fields are optional |
| chest | Number (cm) | No | |
| hips | Number (cm) | No | |
| waist | Number (cm) | No | |
| arms | Number (cm) | No | |
| thighs | Number (cm) | No | |
| ankles | Number (cm) | No | |
| wrists | Number (cm) | No | |
| logged_at | DateTime | Yes | |

### 8.5 Progress Photo

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| date | Date | Yes | |
| photo_path | String | Yes | Local file path |
| pose_type | String | No | e.g., front, side, back |
| is_compressed | Boolean | Yes | Compression status |
| notified_for_download | Boolean | Yes | Whether 6-month download notice was sent |
| logged_at | DateTime | Yes | |

### 8.6 Fasting Record

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| date | Date | Yes | The date the fast ends (when the first meal is logged) |
| start_time | DateTime | Yes | Derived: timestamp of last meal on previous day |
| end_time | DateTime | Yes | Derived: timestamp of first meal on this day |
| duration_hours | Number | Yes | Calculated |
| goal_hours | Number | Yes | Snapshot of the fasting goal at time of record |
| goal_met | Boolean | Yes | duration >= goal |
| was_broken_early | Boolean | Yes | Whether a caloric item was logged before goal was met |

### 8.7 Water Entry

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| date | Date | Yes | |
| amount_ml | Number | Yes | |
| logged_at | DateTime | Yes | |

Note: Daily water total is aggregated from individual entries. Days with no entries are "unknown."

### 8.8 Mood Entry

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| date | Date | Yes | |
| score | Integer | Yes | Scale TBD (1-5 or 1-10) |
| tags | Array of Strings | No | User-created tags from personal library |
| logged_at | DateTime | Yes | |

### 8.9 Sleep Entry

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| date | Date | Yes | The date the user woke up |
| hours_slept | Number | Yes | |
| quality_rating | Integer | Yes | Scale TBD |
| wake_feeling | String | No | How the user feels upon waking |
| logged_at | DateTime | Yes | |

### 8.10 Exercise Entry

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| date | Date | Yes | |
| exercise_type | String | Yes | From user-extensible list |
| sets | Integer | No | Optional (gym) |
| reps | Integer | No | Optional (gym) |
| weight_used | Number (kg) | No | Optional (gym) |
| duration_minutes | Number | No | Optional |
| distance_km | Number | No | Optional |
| notes | String | No | Optional |
| logged_at | DateTime | Yes | |

### 8.11 Task

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| title | String | Yes | |
| description | String | No | |
| project_id | UUID | No | Optional grouping |
| is_completed | Boolean | Yes | |
| due_date | Date | No | |
| reminder_time | DateTime | No | |
| points_earned | Number | No | Points awarded on completion |
| completed_at | DateTime | No | |
| created_at | DateTime | Yes | |

### 8.12 Project

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| name | String | Yes | |
| description | String | No | |
| created_at | DateTime | Yes | |

### 8.13 Habit

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| title | String | Yes | |
| category | String | Yes | User-defined category (diet, exercise, skincare, etc.) |
| frequency | Enum | Yes | daily, weekly, monthly |
| is_active | Boolean | Yes | Whether currently in active rotation |
| is_queued | Boolean | Yes | Whether in the "future habits" queue |
| activated_at | Date | No | When moved from queue to active |
| created_at | DateTime | Yes | |

### 8.14 Habit Completion

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| habit_id | UUID | Yes | |
| date | Date | Yes | |
| completed | Boolean | Yes | |
| logged_at | DateTime | Yes | |

### 8.15 Medicine

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| name | String | Yes | |
| frequency | String | Yes | e.g., "daily", "every other day" |
| is_active | Boolean | Yes | |
| created_at | DateTime | Yes | |

### 8.16 Medicine Log

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| medicine_id | UUID | Yes | |
| date | Date | Yes | |
| taken | Boolean | Yes | |
| logged_at | DateTime | Yes | |

### 8.17 Reward

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| name | String | Yes | User-defined reward |
| description | String | No | |
| point_cost | Number | Yes | User-defined cost |
| is_available | Boolean | Yes | Whether still in the shop |
| created_at | DateTime | Yes | |

### 8.18 Reward Claim

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| reward_id | UUID | Yes | |
| points_spent | Number | Yes | Snapshot of cost at time of claim |
| claimed_at | DateTime | Yes | |

### 8.19 Achievement

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| name | String | Yes | e.g., "The Cat is Gone" |
| description | String | Yes | e.g., "You lost 5kg — that's the weight of a cat!" |
| trigger_type | String | Yes | What triggers it (weight_lost, meals_logged, streak_days, etc.) |
| trigger_value | Number | Yes | Threshold value |
| is_unlocked | Boolean | Yes | |
| unlocked_at | DateTime | No | |

### 8.20 Custom Quote

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| text | String | Yes | The quote content |
| quote_type | Enum | No | motivation, grounding, or both |
| created_at | DateTime | Yes | |

### 8.21 Mood Tag

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| label | String | Yes | User-created, any language |
| created_at | DateTime | Yes | |

### 8.22 Points Transaction

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| amount | Number | Yes | Always >= 0 (except reward claims, which are recorded separately) |
| source_type | String | Yes | meal_logged, habit_completed, task_completed, streak_bonus, milestone, etc. |
| source_id | UUID | No | Reference to the entity that earned the points |
| date | Date | Yes | |
| created_at | DateTime | Yes | |

### 8.23 Health Insight

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| insight_text | String | Yes | e.g., "You seem to rate meals lower on days you sleep under 6 hours." |
| correlation_type | String | Yes | What metrics are correlated |
| is_confirmed | Boolean | No | User confirmed accuracy |
| is_rejected | Boolean | No | User rejected accuracy |
| surfaced_at | DateTime | Yes | When shown to user |
| responded_at | DateTime | No | When user confirmed/rejected |

### 8.24 Weekly Review

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| week_start | Date | Yes | Monday of the review week |
| week_end | Date | Yes | Sunday of the review week |
| weight_start | Number | No | Weight at start of week |
| weight_end | Number | No | Weight at end of week |
| weight_delta | Number | No | Change |
| avg_meal_score | Number | No | Average health score for the week |
| meals_logged | Integer | No | Count |
| fasting_total_hours | Number | No | Total hours fasted |
| habit_completion_rate | Number | No | Percentage |
| water_avg_ml | Number | No | Daily average |
| mood_avg | Number | No | Average mood score |
| insights | Array of UUID | No | Health insights surfaced this week |
| suggestions | Array of String | No | Generated goal suggestions for next week |
| generated_at | DateTime | Yes | |

### 8.25 Schedule Profile Config

| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | Yes | |
| profile_name | String | Yes | "school_day" or "free_day" |
| wake_time | Time | Yes | |
| phone_free_until | Time | Yes | |
| expected_first_meal | Time | No | |
| expected_dinner | Time | No | |
| phone_away_at | Time | Yes | |
| target_sleep_time | Time | Yes | |

### 8.26 Day Config

| Field | Type | Required | Notes |
|---|---|---|---|
| date | Date | Yes | Primary key |
| schedule_profile | String | Yes | Which profile applies |
| active_mode | String | No | Temporary mode overlay (exam, social, quiet) |

---

## 9. Entity Relationships

```
User Profile
├── has many → Weight Entries
├── has many → Meal Entries
│   └── each has optional → Photo (file path)
├── has many → Body Measurement Entries
├── has many → Progress Photos
├── has many → Fasting Records (derived from Meal Entries)
├── has many → Water Entries
├── has many → Mood Entries
│   └── each has many → Mood Tags (from Mood Tag library)
├── has many → Sleep Entries
├── has many → Exercise Entries
├── has many → Tasks
│   └── each optionally belongs to → Project
├── has many → Habits
│   └── each has many → Habit Completions
├── has many → Medicines
│   └── each has many → Medicine Logs
├── has many → Rewards
│   └── each has many → Reward Claims
├── has many → Achievements
├── has many → Custom Quotes
├── has many → Points Transactions
├── has many → Health Insights
├── has many → Weekly Reviews
│   └── each references → Health Insights
├── has many → Schedule Profile Configs
└── has many → Day Configs
```

### Key Derived Relationships

- **Fasting Records** are derived from consecutive **Meal Entries** across two calendar days. There is no direct user input — the relationship is computed.
- **Points Transactions** reference their source entity (a meal, a habit completion, a task, a milestone) via `source_type` and `source_id`.
- **Weekly Reviews** aggregate data from all entities for the given week.
- **Health Insights** correlate across entity types (e.g., Mood + Meals, Sleep + Exercise).
- **Day Configs** link a calendar date to a **Schedule Profile** and an optional **Mode**, which influences notification timing and expectation levels.

---

## 10. Screen Inventory

### 10.1 Home Screen

- Personalized supportive message (using display name)
- Quick-action buttons: Log Weight, Log Meal, Log Exercise, Log Water (and other high-frequency actions)
- Mini dashboard: current fasting timer, today's water progress, today's meal count, current streak summary
- Points balance visible
- Current mode indicator (if active: exam, social, quiet)

### 10.2 Weight Screen

- Log new weight entry
- Weight history trend line graph (raw data + smoothed trend)
- Current weight vs. milestone goal
- BMI display (derived, not interactive)
- Weight loss rate (weekly average calculated monthly)

### 10.3 Meals Screen

- Today's meal slots: Breakfast, Dinner, Snacks (Lunch optional/hidden by default)
- For each slot: add photo, add name, set health score (1-5), optional calorie/detail fields
- Average health score for today/this week
- Meal history (scrollable, with photos)

### 10.4 Measurements Screen

- Entry form with 8 optional fields (neck, chest, hips, waist, arms, thighs, ankles, wrists)
- Previous values shown for reference
- Trend lines per measurement area
- History of past measurement sessions

### 10.5 Progress Photos Screen

- Photo capture or upload
- Photo gallery organized by date
- Side-by-side comparison tool (select two dates)
- Storage/compression status indicators

### 10.6 Fasting Screen

- Live fasting timer
- Current fasting goal
- Today's fasting status (in progress, completed, broken)
- Fasting history and streak

### 10.7 Water Screen

- Today's progress toward goal (visual indicator)
- Quick-add buttons (250ml, 300ml, 500ml, 1L, custom)
- Undo last entry button
- Daily history for the current week

### 10.8 Mood Screen

- Mood score input (numeric scale)
- Tag selector (from personal tag library, with option to add new)
- Mood history (calendar or list view)
- Mood trend graph

### 10.9 Sleep Screen

- Log hours slept, quality rating, wake feeling
- Sleep history and trend graph

### 10.10 Exercise Screen

- Log exercise: select type, optional detail fields
- Exercise history
- Exercise type management (add/remove/deactivate types)

### 10.11 To-Do Screen (Unified View)

- Combined view of today's active habits and pending tasks
- Clear visual distinction between habits (recurring) and tasks (one-time)
- Tap to complete
- Filter/toggle between: all, habits only, tasks only

### 10.12 Habits Management Screen

- Active habits list with categories
- Habit queue ("future habits I want")
- Add new habit (with category, frequency)
- Category management
- Enforcement: max 1 new habit per category per week

### 10.13 Tasks Management Screen

- All tasks list, filterable by project
- Add task (title, description, due date, reminder, project)
- Project management (create, view tasks within)

### 10.14 Medicine Screen

- Active medications list
- Log taken/not taken per medication per day
- Medication history
- Add/edit/deactivate medications

### 10.15 Reward Shop Screen

- Available rewards with point costs
- Current points balance
- Claim button (gated: disabled if insufficient points, showing "X more points needed")
- Add/edit rewards
- Claim history

### 10.16 Achievements Screen

- All achievements: locked and unlocked
- Unlocked achievements show date and fun description
- Progress toward next achievement (where calculable)

### 10.17 Weekly Review Screen

- Generated summary for the selected week
- Weight trend, average meal score, fasting totals, habit completion rate, mood patterns
- Graphs and charts
- Surfaced health insights with confirm/reject buttons
- Suggested goals for next week
- Historical reviews browsable

### 10.18 Insights Screen

- All confirmed correlations/insights
- Pending insights awaiting user confirmation
- Rejected insights (hidden by default, viewable)

### 10.19 Graphs & Charts Screen (Day-to-Day)

- Accessible outside of weekly review
- Weight trend, meal scores, water intake, mood, sleep, exercise frequency
- Configurable time range (week, month, 3 months, 6 months, year, all time)

### 10.20 Settings Screen

- Display name
- Height
- Goal weight milestone
- Fasting goal (hours)
- Water goal (ml)
- Schedule profile management (school day / free day settings)
- Mode management (activate/deactivate exam, social, quiet)
- Day schedule configuration (assign profiles to dates)
- Notification preferences
- Quote pool management (add, edit, remove quotes)
- Mood tag library management
- Exercise type management
- Habit category management
- Data export (Excel, PDF, photos)
- Backup management
- Photo storage management (view storage used, trigger compression)
- Light/dark mode preference (auto, light, dark)

### 10.21 Data Export Screen

- Export all data to Excel
- Export graphs to PDF
- Export progress photos
- Export status and history

---

## 11. Navigation Structure

### Bottom Tab Bar (3-4 primary tabs)

| Tab | Purpose |
|---|---|
| Home | Dashboard, supportive message, quick actions, mini metrics |
| Log | Central logging hub — weight, meals, water, mood, sleep, exercise, medicine |
| To-Do | Unified habits + tasks view |
| Me | Progress photos, measurements, achievements, reward shop, weekly review, settings |

> **Note:** The exact tab selection is a design decision to be finalized. The above is a starting framework. The guiding principle is: the most frequent daily actions (logging meals, checking the dashboard) should be 1 tap away.

### Side Menu (Secondary Navigation)

- Graphs & Charts
- Insights
- Weekly Reviews
- Achievements
- Reward Shop
- Settings
- Data Export
- About / App Info

---

## 12. Notifications

### Notification Rules

| Rule | Detail |
|---|---|
| Maximum frequency | 1 notification per hour |
| Phone-free morning window | No notifications for 1 hour after configured wake time |
| Phone-away evening window | No notifications after configured phone-away time (21:00) |
| Quiet mode | All notifications suppressed; no behavioral penalties |
| Nudge persistence | Maximum 2 nudge attempts per missed event, then stop |

### Notification Types

| Type | Trigger | Content | Timing |
|---|---|---|---|
| Morning quote | Daily | Random quote from user's pool. May suggest opening the app. | Configured morning time (default 9:00 AM) |
| Evening quote | Daily | Random quote from user's pool. May suggest opening the app to review the day. | Configured evening time (default 21:00) |
| Meal reminder | Contextual | "It's been a while since your last meal — want to log something?" | ~1 hour after expected meal time, based on schedule profile |
| Medicine reminder | Schedule-based | "Time to take [medicine name]" | Based on configured frequency |
| Water nudge | Contextual | Gentle reminder if water logging is significantly behind pace for time of day | No more than once per day |
| Welcome back | After absence | Warm, unconditional message. No data about what was missed. | On first app open after 2+ days of inactivity |
| Emotional support | After low mood + silence | Gentle, supportive message. "It's okay. Log when you're ready." | After detecting low mood entry followed by logging silence. Max 2 attempts. |
| Achievement unlocked | Event-based | Celebratory message with fun achievement description | Immediately upon trigger |
| Progress photo aging | Time-based | "Some progress photos are 6 months old — want to download them?" | At the 6-month mark per photo batch |
| Weekly review available | Weekly | "Your weekly review is ready" | Sunday morning, after morning quote |

### Social Day / Mode Adjustments

- When "social day" mode is active, meal reminders and water nudges are suppressed.
- When "exam mode" is active, all non-essential notifications are reduced (only medicine and morning/evening quotes remain).
- When "quiet mode" is active, all notifications are suppressed.

---

## 13. Reporting Requirements

### Daily Dashboard (Home Screen)

- Current fasting status and timer
- Today's water intake vs. goal
- Meals logged today (count and average health score)
- Habits completed today (X of Y)
- Points earned today
- Current weight (last entry)

### Graphs Available Day-to-Day

| Graph | Data | Time Ranges |
|---|---|---|
| Weight trend | Raw values + smoothed line + milestone goal line | Week, month, 3mo, 6mo, year, all |
| Meal health scores | Daily average score | Week, month, 3mo |
| Water intake | Daily total vs. goal | Week, month |
| Fasting durations | Daily hours fasted vs. goal | Week, month, 3mo |
| Body measurements | Per-area trend lines | Month, 3mo, 6mo, year, all |
| Mood trend | Daily average score | Week, month, 3mo |
| Sleep trend | Hours slept and quality rating | Week, month, 3mo |
| Exercise frequency | Sessions per week | Month, 3mo, 6mo |
| Habit completion rate | Percentage per day/week | Week, month, 3mo |
| Points earned | Daily/weekly totals | Week, month, 3mo |

---

## 14. Weekly Review Requirements

### Generated Every Sunday

The weekly review is auto-generated and available on Sunday mornings. It is not a notification — the user opens it from the app.

### Contents

| Section | Detail |
|---|---|
| Greeting | Warm, personalized opening using display name |
| Weight summary | Start/end weight, delta, trend direction, progress toward milestone |
| Meal summary | Meals logged count, average health score, best/worst day |
| Fasting summary | Total hours fasted, days fasting goal was met, streak status |
| Water summary | Average daily intake, days goal was met |
| Habit summary | Completion rate per habit, overall percentage, streak info (X of last Y days format) |
| Mood summary | Average mood, most common tags, pattern observations |
| Sleep summary | Average hours, average quality |
| Exercise summary | Sessions count, types performed |
| Points earned | Total for the week, breakdown by source |
| Achievements unlocked | Any new achievements this week |
| Health insights | Newly discovered correlations with confirm/reject prompts |
| Suggestions | 1-2 gentle goal suggestions for next week based on data patterns |
| Closing | Supportive, forward-looking message |

### Behavior

- If insufficient data exists for a section (e.g., no sleep logged this week), that section is omitted entirely — not shown with zeros.
- The review never uses language that implies failure.
- Suggestions are phrased as invitations: "Consider..." or "You might be ready to..."

---

## 15. Health Insight Requirements

### Correlation Discovery

The system analyzes relationships between tracked metrics to surface potential patterns.

### Example Insights

| Insight | Correlation |
|---|---|
| "You tend to eat worse on days you sleep under 6 hours" | Sleep hours → Meal health score |
| "Your mood is often lower on days you skip exercise" | Exercise presence → Mood score |
| "You seem to binge more on days tagged 'stressed'" | Mood tags → Meal health score |
| "When you fast for 16+ hours, your next meal tends to score higher" | Fasting duration → First meal score |
| "Your weight tends to spike 1-2 days after days tagged 'went out drinking'" | Mood tags → Weight fluctuation |
| "You seem to have digestive issues after meals with [food item]" | Meal name/tags → User-reported symptoms |

### User Confirmation Flow

1. System discovers a potential correlation with sufficient data.
2. Insight is surfaced in the weekly review (or the insights screen).
3. User is asked: "Is this an accurate association?"
4. User confirms → insight is saved as a confirmed correlation and tracked going forward.
5. User rejects → insight is hidden and the system adjusts its model.

### Requirements

| ID | Requirement |
|---|---|
| HI-01 | Insights require a minimum data threshold before being surfaced (exact threshold TBD, but at minimum several weeks of data). |
| HI-02 | Insights are phrased as questions, not statements. "You seem to..." not "You do..." |
| HI-03 | Maximum of 2-3 insights surfaced per weekly review to avoid overwhelm. |
| HI-04 | Confirmed insights appear in the insights screen as established patterns. |
| HI-05 | The insight engine is a future-phase feature requiring local AI or statistical analysis. |
| HI-06 | Until the insight engine is built, the weekly review shows data summaries without automated correlation discovery. |

---

## 16. Future Feature Ideas

These features were identified during requirements gathering but are explicitly out of scope for the MVP and near-term roadmap. They are documented here for future consideration.

| Feature | Notes | Phase |
|---|---|---|
| Companion character | ItGetsBetter as an interactive character with personality. Significant design and development effort. | Long-term |
| Smartwatch integration | Pull step count, heart rate, and sleep data from the user's smartwatch. Requires privacy verification of the data pipeline. | Phase 2+ |
| Desktop version | Full-functionality desktop app with sync to phone. Not required — phone is primary. | Phase 2+ |
| Local AI engine | On-device or home-server AI for correlation discovery, smart nudges, and contextual insights. Required for the health insights feature to reach full potential. | Phase 2+ |
| Autophagy tracking | "You've been in autophagy for 30 hours this week" — requires medical/scientific input on accurate autophagy thresholds. | Phase 2+ |
| Sugar detox mode | Temporary mode that adjusts meal scoring criteria and tracks sugar-specific metrics. | Future |
| Guided onboarding wizard | Friendly walkthrough for first-time setup instead of manual field entry. | Future |
| Quote tone shifting | Morning/evening quotes adapt based on recent mood data (gentler quotes on bad days). | Future |
| Workout plans | Structured exercise programs the user can follow. User was undecided. | Future (if desired) |
| Calendar integration | Link schedule profiles to an external calendar for auto-detection of school vs. free days. | Future |
| Meal photo AI analysis | Local AI that estimates meal contents from photos. | Long-term |
| Data sharing with doctor/coach | Optional, user-controlled export or read-only access for a healthcare provider. Currently not wanted. | Only if requested |

---

## 17. Risks and Assumptions

### Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Emotional stress causes abandonment** | High — identified as the primary historical failure mode | Supportive messaging, no punishment mechanics, warm welcome-back flow, quiet mode, max 2 nudge attempts |
| **Feature overload at launch** | High — too many tracking dimensions at once overwhelms a near-zero-routine user | Phased rollout: MVP is weight + meals + measurements only. Additional features added one at a time. |
| **Subjective health score drift** | Medium — a "3" means different things on different days, making the "average 3/5" goal unreliable | Accept this as inherent to a subjective system. A loose reference guide helps but is not enforced. The goal is awareness, not precision. |
| **Points economy imbalance** | Medium — if rewards are too cheap or too expensive, the system loses motivational value | Calibrate so a small reward takes ~1 week, a large reward ~1 month. The user controls both sides (earnings and costs), so self-correction is possible. |
| **Photo storage growth** | Medium — 2-3 meal photos per day = 1000+/year, plus progress photos | Compression at 3 months for food photos, 1 year for progress photos. Deletion of food photos at 1 year or configurable storage threshold. |
| **Offline-first complexity** | Medium — offline-first architecture with potential future sync adds technical complexity | Accept phone as primary with local storage. Defer sync to a future phase. |
| **Manual backup neglect** | Medium — "manual backup" tends to never happen | Design backup to be as close to one-tap as possible. Consider automated encrypted backup to a user-controlled cloud location. |
| **Fasting calculation edge cases** | Low — meals logged at odd hours, forgotten logs, backfilled entries could produce inaccurate fasting data | Fasting is derived from timestamps — backfilled entries need accurate time entry. System should handle gracefully when data is missing (skip the day, don't fabricate). |
| **Scope creep from task manager** | Medium — the general-purpose task system must compete with Todoist, a mature product | Focus on core task/habit functionality that serves the user's needs, not feature parity with Todoist. The advantage is integration with the health system, not standalone task management superiority. |

### Assumptions

| Assumption | Risk if Wrong |
|---|---|
| The user will be the sole developer and maintainer of this app | Tech stack must be learnable and maintainable by a single HBO ICT student |
| Phone-first is sufficient; desktop can wait indefinitely | If the user's workflow shifts to desktop-heavy, the phone-only approach may frustrate |
| Subjective health scores (1-5) provide meaningful data over time | If scores are too inconsistent, the "average 3/5" goal becomes meaningless — but awareness value remains |
| 2-3 habits/features added at a time is the right pace | The user may want to accelerate or may need to slow down even further |
| Encrypted cloud backup is acceptable for privacy | If the user's privacy requirements tighten, only fully local backup with manual export would work |
| The app's warm tone will remain motivating over months/years | Novelty wears off — the reward/achievement system and genuine data insights need to carry long-term engagement |
| A single-user system with no accountability partner is sufficient | Some users eventually want social accountability — but this user has explicitly declined it |

---

## 18. Unresolved Decisions

The following decisions were identified during requirements gathering but not yet resolved. They should be addressed before or during implementation of their respective features.

| Decision | Options | Impact | When to Decide |
|---|---|---|---|
| **Mood scale range** | 1-5 (consistent with health score) vs. 1-10 (more granularity) | Affects mood data resolution and insight quality | Before mood tracking implementation |
| **Sleep quality scale range** | 1-5 vs. 1-10 | Same as above | Before sleep tracking implementation |
| **Quote rotation strategy** | Random, sequential, or weighted (less-shown quotes prioritized) | Minor UX impact | Before notification implementation |
| **Points values per action** | Exact point values for each earnable action (meal logged, habit completed, etc.) | Core to the reward economy — must feel balanced | Before points system implementation |
| **Achievement library contents** | Specific achievements, trigger conditions, and fun descriptions | Requires creative writing and milestone planning | Before achievements implementation |
| **Fasting "broken early" indicator** | Gentle notification vs. silent visual indicator only | Affects UX tone | Before fasting implementation |
| **Bottom tab bar composition** | Which 3-4 screens get tabs vs. side menu | Core navigation UX | Before UI design |
| **Tech stack** | React Native, Flutter, PWA, or other | Foundational architectural decision | Before any implementation |
| **Backup mechanism** | Encrypted local file export, encrypted cloud (which provider), or self-hosted | Affects privacy and convenience tradeoff | Before backup implementation |
| **Health insight engine approach** | Statistical rules, local LLM, or hybrid | Affects infrastructure requirements and accuracy | Before insights implementation |
| **Photo storage thresholds** | Exact storage limit (in MB/GB) that triggers early food photo deletion | Device-dependent | Before photo management implementation |
| **Minimum data threshold for insights** | How many weeks/entries before correlations are surfaced | Affects when insights become available | Before insights implementation |
| **Habit completion points escalation** | How streak bonus points scale (linear, logarithmic, capped) | Affects points economy balance | Before points system implementation |
| **Wake feeling input method** | Free text, predefined options, emoji, or scale | UX decision | Before sleep tracking implementation |

---

*This document represents the complete product definition for ItGetsBetter as of 2026-06-18. It is based on a structured requirements interview and should be treated as the source of truth for product decisions. Technical architecture and implementation planning should proceed from this document.*
