# ItGetsBetter — Development Roadmap

**Version:** 1.0
**Date:** 2026-06-18
**Companion Documents:** [PRD.md](PRD.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [MOSCOW.md](MOSCOW.md)

---

## Roadmap Principles

1. **Working software at every phase.** Each phase ends with a deployable, usable app. No phase produces an unfinished state that requires the next phase to be usable.
2. **Use what you build.** Start using the app for real daily logging as soon as Phase 1 is complete. Real usage reveals real problems.
3. **One thing at a time.** Each phase has a single focused goal. If a phase feels overwhelming, it's too big — split it.
4. **Tests protect foundations.** Core utilities (date boundary, points calculation) get tested upfront. Feature screens get tested by using them.

---

## Phase 0: Project Setup

### Goal

A running development environment with all tooling configured, the app skeleton deployed and installable on a phone. Zero features, but the entire build-deploy pipeline works end to end.

### Why This Phase Exists

Every minute spent fighting tooling later is a minute stolen from feature work. Setting up Vite, Tailwind, Dexie, PWA, and deployment once — correctly — means never thinking about it again.

### Deliverables

| # | Deliverable | Details |
|---|---|---|
| 0.1 | Initialize project | `npm create vite@latest` with React + TypeScript template |
| 0.2 | Install dependencies | Dexie, Zustand, React Router, Tailwind CSS, shadcn/ui, Recharts, date-fns, browser-image-compression, Lucide React, vite-plugin-pwa |
| 0.3 | Tailwind theme configuration | Custom warm color palette (coral primary, sage secondary, amber accent, warm backgrounds). Light and dark mode classes. |
| 0.4 | PWA manifest | `manifest.json` with app name, icons (multiple sizes), standalone display, portrait orientation, warm theme colors |
| 0.5 | Service worker | vite-plugin-pwa configured with Workbox. Precache app shell. Offline fallback to `index.html`. |
| 0.6 | Dexie database | `db.ts` with version 1 schema: `userProfile`, `weightEntries`, `mealEntries`, `measurements`, `appOpenLog` |
| 0.7 | Core utility: `getLogicalDate()` | Implements 3AM day boundary logic in `lib/date.ts` |
| 0.8 | TypeScript types | `types/entities.ts` with interfaces for all MVP entities (UserProfile, WeightEntry, MealEntry, Measurement). `types/enums.ts` with MealSlot enum. |
| 0.9 | Zustand UI store | `stores/uiStore.ts` — activeTab, theme, sideMenuOpen |
| 0.10 | Vitest setup | Testing framework configured. `getLogicalDate()` tests written and passing. |
| 0.11 | GitHub repository | Code pushed, `.gitignore` configured (node_modules, dist, .env) |
| 0.12 | Cloudflare Pages deployment | Connected to GitHub. Auto-deploy on push to main. App accessible via URL. |
| 0.13 | Verify installation | Install PWA on phone via "Add to Home Screen." Confirm it opens in standalone mode, offline works, and icons display correctly. |

### Database Changes

```
Version 1 (initial):
├── userProfile:    ++id
├── weightEntries:  ++id, date, logged_at
├── mealEntries:    ++id, date, meal_slot, logged_at
├── measurements:   ++id, date
└── appOpenLog:     ++id, date
```

### Screens Created

None — the app shows a placeholder "Welcome to ItGetsBetter" page at `/`. No navigation yet.

### Components Created

None — this phase is infrastructure only.

### Risks

| Risk | Mitigation |
|---|---|
| Tailwind theme doesn't feel warm/cozy enough | Iterate on colors before building screens. Test with actual UI elements (cards, buttons) not just swatches. |
| PWA install flow is confusing on iOS | Test on both Android and iOS during 0.13. Document any platform-specific quirks. |
| Cloudflare Pages build fails | Test `npm run build` locally first. Ensure Vite outputs to `/dist`. |

### Testing Requirements

| Test | Type | Details |
|---|---|---|
| `getLogicalDate()` | Unit (Vitest) | 8+ test cases covering: 2:59 AM, 3:00 AM, 3:01 AM, midnight, midday, late night, year boundary, backfill date. This test suite is mandatory before proceeding to Phase 1. |
| Build succeeds | Manual | `npm run build` produces a working `/dist` folder |
| PWA installs | Manual | Test on Android Chrome and iOS Safari. Verify standalone mode. |
| Offline works | Manual | Enable airplane mode after install. App shell loads. |

### Definition of Done

- [ ] `npm run dev` serves the app locally
- [ ] `npm run build` succeeds with zero errors
- [ ] App is deployed on Cloudflare Pages and accessible via URL
- [ ] PWA installs on phone and opens in standalone mode
- [ ] App works offline (shows placeholder page)
- [ ] `getLogicalDate()` tests pass (8+ cases)
- [ ] Dexie database initializes without errors

---

## Phase 1: Core Foundation

### Goal

A usable app that logs weight, meals, and body measurements. The home screen feels warm and supportive. Data persists across sessions. Encrypted backup protects against data loss. This is the version you start using every day.

### Why This Phase Exists

This is the MVP. If nothing else gets built, this app should still be worth using. Weight tracking and meal awareness are the two highest-priority goals from the PRD.

### Deliverables

| # | Deliverable | Details |
|---|---|---|
| 1.1 | App shell | Bottom tab bar (Home, Log, To-Do, Me), top bar with page title, `PageContainer` scroll wrapper. To-Do and Me tabs show "Coming Soon" placeholder. |
| 1.2 | Routing | React Router configured for all Phase 1 routes: `/`, `/log`, `/log/weight`, `/log/meal`, `/me/measurements`, `/settings`, `/settings/profile`, `/settings/backup` |
| 1.3 | First-launch setup | On first open (no userProfile in DB): show a form for display name, height (cm), starting weight (kg), goal weight milestone (kg). Save to Dexie. Redirect to home screen. |
| 1.4 | Home screen | Personalized supportive message ("Good morning, {name}"). Quick-action buttons (Log Weight, Log Meal, Log Measurements). Mini dashboard: last weight, today's meal count, today's average health score. |
| 1.5 | `navigator.storage.persist()` | Call on first launch. If iOS and not installed, show guidance banner for "Add to Home Screen." |
| 1.6 | Platform detection | Detect Android/iOS/Desktop. On iOS without PWA install, show dismissible guidance with step-by-step instructions. |
| 1.7 | Weight tracking | Log weight (kg input + date picker for backfill). History list sorted by date. Line chart (Recharts) with data points. BMI displayed as derived number. Goal milestone progress indicator. Multiple same-day entries averaged. |
| 1.8 | Meal tracking | Log meal: photo capture (camera/gallery via `<input type="file" capture>`) OR text name, health score 1-5 (required). Three visible slots: Breakfast, Dinner, Snacks. Today's meals displayed as cards with photo thumbnail and score. Meal history list. Health score trend direction display ("your scores are trending up this week"). |
| 1.9 | Photo pipeline | Photo captured → compressed via browser-image-compression (target ~200KB) → stored as Blob in `mealEntries` table in IndexedDB. |
| 1.10 | Body measurements | Form with 8 optional fields (neck, chest, hips, waist, arms, thighs, ankles, wrists). Previous values shown next to each field. Date picker for backfill. History list of past entries. |
| 1.11 | Settings: Profile | Edit display name, height, goal weight milestone. |
| 1.12 | Settings: Backup | "Create Backup" button → password prompt → encrypt all IndexedDB data (AES-256-GCM via Web Crypto API) → download `.igb` file. "Restore Backup" button → file picker → password prompt → decrypt → confirm replacement → write to IndexedDB. |
| 1.13 | Theme: Light/Dark toggle | Manual toggle in settings. Persist preference in Dexie `userProfile`. Apply via Tailwind `dark:` classes. |
| 1.14 | App open logging | Record each app open in `appOpenLog` table for future engagement metrics. |
| 1.15 | Supportive messages | Hardcoded pool of 15-20 warm messages, randomly selected on each home screen visit. Not the custom quote system — just built-in messages. |

### Database Changes

No schema changes — uses Version 1 from Phase 0.

Data seeded: `userProfile` created during first-launch setup.

### Screens Created

| Screen | Route | Purpose |
|---|---|---|
| FirstLaunchSetup | `/setup` (one-time) | Initial profile creation |
| HomePage | `/` | Dashboard, message, quick actions |
| LogHubPage | `/log` | Quick-action grid to all logging screens |
| WeightPage | `/log/weight` | Log + history + graph |
| MealsPage | `/log/meal` | Log + today's meals + history |
| MeasurementsPage | `/me/measurements` | Log + history |
| SettingsPage | `/settings` | Settings hub |
| ProfileSettings | `/settings/profile` | Edit profile |
| BackupPage | `/settings/backup` | Backup + restore |
| PlaceholderPage | (multiple) | "Coming Soon" for unbuilt tabs |

### Components Created

| Component | Location | Purpose |
|---|---|---|
| AppShell | `components/layout/` | Main layout with top bar + content + bottom tabs |
| BottomTabs | `components/layout/` | 4-tab navigation bar |
| TopBar | `components/layout/` | Page title display |
| PageContainer | `components/layout/` | Scrollable content wrapper |
| QuickAction | `components/` | Home screen quick-action button (icon + label) |
| SupportiveMessage | `components/` | Randomly selected warm message display |
| HealthScorePicker | `components/` | 1-5 score selector (tappable circles/stars) |
| PhotoCapture | `components/` | Camera/gallery input with preview |
| BackfillDatePicker | `components/` | Date picker for logging past entries |
| TrendLineChart | `components/charts/` | Recharts line chart (used for weight) |
| WeightEntryForm | `features/weight/` | Weight input form |
| WeightGraph | `features/weight/` | Weight trend chart with goal line |
| MealEntryForm | `features/meals/` | Meal logging form (photo/name + score) |
| MealCard | `features/meals/` | Single meal display (thumbnail + name + score) |
| MeasurementForm | `features/measurements/` | 8-field optional form with previous values |
| IOSInstallGuide | `components/` | iOS "Add to Home Screen" guidance banner |

### Hooks Created

| Hook | Purpose |
|---|---|
| `useProfile` | Read/write user profile from Dexie liveQuery |
| `useWeightEntries` | Query weight entries by date range, compute daily average |
| `useMealEntries` | Query meals by date, compute health score trend |
| `useMeasurements` | Query measurements by date |
| `useTheme` | Read/write theme preference, resolve auto mode |

### Risks

| Risk | Mitigation |
|---|---|
| Photo capture doesn't work on all devices | Test on Android Chrome and iOS Safari specifically. `<input type="file" accept="image/*" capture>` has broad support but behavior varies. |
| Photo blobs make IndexedDB large quickly | 200KB target compression. Monitor storage via `navigator.storage.estimate()`. Not a real problem until months of use. |
| Backup file is too large to email | For MVP, file size isn't gated. Large backups can be saved to cloud storage instead of emailed. Warn user of file size before creating. |
| Supportive messages feel repetitive after 2 weeks | 15-20 messages provides enough variety for the first month. Custom quote pool (Phase 7) is the long-term solution. |
| First-launch setup feels cold/clinical | Keep the form short (4 fields). Add a warm greeting at the top: "Let's get to know each other." No field is blocking. |

### Testing Requirements

| Test | Type | Details |
|---|---|---|
| Backup encrypt/decrypt round-trip | Unit (Vitest) | Encrypt data → decrypt with same password → verify data matches. Test with wrong password (should fail gracefully). |
| Weight daily average calculation | Unit (Vitest) | Multiple entries on same date → averaged correctly. |
| Health score trend direction | Unit (Vitest) | Given scores over 2 weeks, correctly identifies "increasing", "stable", or "declining." |
| Photo capture and storage | Manual | Take photo on Android and iOS. Verify it saves, displays as thumbnail, and persists across app restarts. |
| First-launch flow | Manual | Clear site data. Open app. Complete setup. Verify home screen shows name and message. |
| Backup and restore | Manual | Create backup with password. Clear site data. Restore from backup. Verify all data recovered. |
| Offline usage | Manual | Log weight and meal while offline. Verify data persists. |

### Definition of Done

- [ ] First-launch setup works and saves profile
- [ ] Home screen shows personalized supportive message and quick actions
- [ ] Can log weight, view history, see trend graph
- [ ] Can log meals with photo or name + health score
- [ ] Can log body measurements (all fields optional)
- [ ] Can backfill entries for past dates
- [ ] Encrypted backup creates and restores successfully
- [ ] Light/dark mode toggle works
- [ ] App works offline
- [ ] iOS install guidance shows on first iOS visit
- [ ] `navigator.storage.persist()` called on first launch
- [ ] **You are using this app daily for at least 3 days before starting Phase 2**

---

## Phase 2: Tasks and Habits

### Goal

A unified To-Do system where daily habits and one-time tasks coexist. The user can track repeating health habits ("drink water", "weigh myself") alongside life tasks ("buy groceries", "submit assignment") with due dates, priorities, sub-tasks, and labels. The To-Do tab becomes functional.

### Why This Phase Exists

Structure and consistency are the product's core purpose. Without habits and tasks, the app is a passive logger. With them, it becomes an active daily companion that answers: "what should I do today?"

### Deliverables

| # | Deliverable | Details |
|---|---|---|
| 2.1 | Labels system | Shared label entity used by both tasks and habits. CRUD: create, edit, delete labels. Each label has a name and optional color. Pre-seeded examples: "Health", "Exercise", "School", "Work." |
| 2.2 | Habits | Create habit with title, label(s), frequency (daily/weekly/monthly). Mark active or queued. Daily check-off. "X of last Y days" streak display. Habit history. |
| 2.3 | Tasks | Create task with title, optional due date, priority (low/medium/high/urgent with default medium), label(s), optional project grouping. Mark complete. |
| 2.4 | Sub-tasks | A task can have sub-tasks (one level deep). Sub-tasks are lightweight: title + completed status only. Displayed nested under parent. |
| 2.5 | Projects | Create project with name. Assign tasks to projects. View tasks filtered by project. |
| 2.6 | To-Do unified view | Today's active habits + pending tasks in one view. Habits visually distinct from tasks. Priority indicators on tasks (color/icon). Overdue tasks gently flagged. Filter by: all, habits only, tasks only. Filter by label. |
| 2.7 | Habits management screen | Active habits list. Habit queue ("future habits I want"). Add/edit habit. Label management. |
| 2.8 | Tasks management screen | All tasks list filterable by project and label. Sortable by priority, due date, or creation date. Add/edit task. Sub-tasks nested under parent. Project management. |
| 2.9 | Home screen update | Add "today's habits completed: X of Y" to the mini dashboard. |

### Database Changes

```
Version 2 (add to existing):
├── labels:           ++id
├── habits:           ++id, is_active, is_queued
├── habitCompletions: ++id, habit_id, date
├── tasks:            ++id, project_id, parent_task_id, is_completed, due_date, priority
└── projects:         ++id
```

### Screens Created

| Screen | Route | Purpose |
|---|---|---|
| TodoPage | `/todo` | Unified habits + tasks view |
| HabitsManagementPage | `/todo/habits` | Manage active/queued habits |
| TasksManagementPage | `/todo/tasks` | Manage tasks, projects, sub-tasks |

### Components Created

| Component | Location | Purpose |
|---|---|---|
| HabitList | `features/todo/` | Today's habits with check-off |
| HabitItem | `features/todo/` | Single habit row with streak display |
| TaskList | `features/todo/` | Pending tasks with priority indicators |
| TaskItem | `features/todo/` | Single task row with due date, priority badge, sub-task count |
| SubTaskList | `features/todo/` | Nested sub-tasks under parent |
| TaskForm | `features/todo/` | Add/edit task (title, due date, priority, labels, project) |
| HabitForm | `features/todo/` | Add/edit habit (title, labels, frequency) |
| LabelPicker | `components/` | Multi-select label chooser (reusable across tasks and habits) |
| LabelBadge | `components/` | Colored label pill display |
| PriorityBadge | `components/` | Priority level indicator (icon or color) |
| StreakDisplay | `components/` | "X of last Y days" display |
| FilterBar | `components/` | Filter by label, type (habit/task), sort order |
| ProjectPicker | `features/todo/` | Select or create project |

### Hooks Created

| Hook | Purpose |
|---|---|
| `useHabits` | Active/queued habits, today's completion status |
| `useTasks` | Tasks filtered by project, label, completion status |
| `useLabels` | All labels, CRUD operations |
| `useProjects` | All projects, tasks within each |

### Risks

| Risk | Mitigation |
|---|---|
| Sub-task nesting adds UI complexity | One level only. Sub-tasks are title + checkbox. No further nesting allowed (enforced in data model: sub-tasks cannot have `parent_task_id`). |
| Label proliferation makes filtering useless | Start with 4-5 pre-seeded labels. The user can add more but is encouraged to keep it simple. |
| Task system scope creeps toward Todoist | Hold the line: no descriptions, no drag-and-drop, no recurring tasks (that's what habits are for), no time tracking. |
| Habit + task unified view is cluttered | Clear visual separation: habits in a top section with checkboxes, tasks below with priority colors. Filter bar lets user focus on one type. |

### Testing Requirements

| Test | Type | Details |
|---|---|---|
| Habit streak calculation | Unit (Vitest) | Given completions over 21 days with gaps, correctly produces "X of last Y days" |
| Sub-task parent constraint | Unit (Vitest) | Creating a sub-task of a sub-task is rejected |
| Task sorting | Unit (Vitest) | Tasks sort correctly by priority (urgent first) and due date (earliest first) |
| Label shared between habit and task | Manual | Create a label "Health." Assign to a habit and a task. Filter by "Health" in To-Do view — both appear. |
| Overdue task display | Manual | Create a task with yesterday's due date. Verify it's visually flagged (not alarmingly). |

### Definition of Done

- [ ] Can create, edit, and complete habits with labels and frequency
- [ ] Can create, edit, and complete tasks with due dates, priority, labels, projects, and sub-tasks
- [ ] To-Do tab shows unified view with filtering by label and type
- [ ] Streak display shows "X of last Y days" for habits
- [ ] Home screen shows today's habit completion count
- [ ] Labels are shared between habits and tasks
- [ ] Priority levels visually distinct (low/medium/high/urgent)
- [ ] Overdue tasks gently flagged

---

## Phase 3: Health Tracking

### Goal

Expand health tracking beyond weight and meals to include water intake, fasting (auto-calculated), and exercise. The home screen becomes a real daily health dashboard.

### Why This Phase Exists

Water and fasting are 3-month goals from the PRD. Fasting requires zero additional user input — it's derived from meal timestamps already being collected. Exercise tracking prepares for the 12-month goal of 3x/week consistency.

### Deliverables

| # | Deliverable | Details |
|---|---|---|
| 3.1 | Water tracking | Configurable daily goal (default 2L). Quick-add preset buttons: 250ml, 300ml, 500ml, 1L. Custom amount input. Undo last entry. Visual progress indicator (progress bar or filling glass). Days with no entries recorded as "unknown" (excluded from averages). |
| 3.2 | Fasting tracker | Auto-calculated from meal timestamps (last meal → first meal next day). Live fasting timer on home screen (counts up from last meal). User-configurable fasting goal (e.g., 16 hours). Goal met/not met indicator. "Fast broken" visual flag if meal logged during fasting window (no punitive notification). Fasting streak tracking. Old goals apply to old data. |
| 3.3 | Exercise tracking | Log exercise: select type from user-extensible list + optional detail fields (sets/reps/weight for gym, duration, distance). Exercise type management (add/deactivate types). Exercise history. |
| 3.4 | Home screen expansion | Add to dashboard: live fasting timer, today's water progress vs goal, exercise logged today (yes/no). |
| 3.5 | Welcome back message | Detect 2+ days of inactivity (via `appOpenLog`). On return, replace the normal supportive message with a warm "welcome back" message. No guilt, no summary of missed days. |
| 3.6 | Log Hub update | Add water, fasting, and exercise to the Log tab's quick-action grid. |

### Database Changes

```
Version 3 (add to existing):
├── waterEntries:     ++id, date, logged_at
├── fastingRecords:   ++id, date
└── exerciseEntries:  ++id, date, exercise_type
```

Settings additions to `userProfile`: `water_goal_ml`, `fasting_goal_hours`, `exercise_types` (array).

### Screens Created

| Screen | Route | Purpose |
|---|---|---|
| WaterPage | `/log/water` | Quick-add buttons + progress + undo |
| FastingPage | `/log/fasting` | Live timer + goal + history + streak |
| ExercisePage | `/log/exercise` | Log entry + history + type management |

### Components Created

| Component | Location | Purpose |
|---|---|---|
| WaterButtons | `features/water/` | Preset amount buttons (250ml, 300ml, 500ml, 1L, custom) |
| WaterProgress | `features/water/` | Visual progress bar/glass toward daily goal |
| UndoButton | `components/` | Generic undo action (used by water, reusable) |
| FastingTimer | `features/fasting/` | Live count-up timer from last meal |
| FastingGoalIndicator | `features/fasting/` | Goal progress (X of Y hours) |
| ExerciseEntryForm | `features/exercise/` | Type selector + optional detail fields |
| ExerciseTypeManager | `features/exercise/` | Add/deactivate exercise types |

### Hooks Created

| Hook | Purpose |
|---|---|
| `useWater` | Today's water entries, total, undo last |
| `useFasting` | Current fast state (start time, duration, goal met), derived from meal timestamps |
| `useExercise` | Exercise entries by date |

### Risks

| Risk | Mitigation |
|---|---|
| Fasting calculation edge cases (backfilled meals, midnight snacks, missing data) | Fasting records are only generated when both "last meal yesterday" and "first meal today" exist. Missing data = no fasting record for that day (don't fabricate). |
| Water undo removes wrong entry | Undo removes the most recent water entry by `logged_at` timestamp. Clear and predictable. |
| Live fasting timer drains battery | `setInterval` at 1-minute resolution, not 1-second. Timer is cosmetic — minute precision is sufficient. Only runs when the fasting screen or home screen is visible. |

### Testing Requirements

| Test | Type | Details |
|---|---|---|
| Fasting derivation from meals | Unit (Vitest) | Dinner at 7pm + breakfast at 11am → 16 hour fast. Snack at 2am breaks the fast (belongs to previous day per 3AM boundary). No meals logged → no fasting record. |
| Water daily total | Unit (Vitest) | Multiple entries summed correctly. Days with no entries are "unknown" not 0. |
| Water undo | Manual | Add 500ml, add 250ml, undo → total shows 500ml. Undo again → total shows 0. |
| Welcome back detection | Manual | Don't open app for 2+ days. Reopen. Verify warm welcome back message appears instead of normal message. |

### Definition of Done

- [ ] Can log water with quick-add buttons and see progress toward daily goal
- [ ] Undo removes the last water entry
- [ ] Fasting timer auto-calculates from meal timestamps
- [ ] Fasting goal met/not met displays correctly
- [ ] Can log exercise with type and optional details
- [ ] Home screen shows fasting timer, water progress, and exercise status
- [ ] Welcome back message appears after 2+ days of absence
- [ ] No data is fabricated for days without entries

---

## Phase 4: Nutrition Tracking

### Goal

Deepen the meal tracking system with the points/rewards economy, mood tracking for future correlations, sleep tracking, and medicine logging. These features add engagement depth and lay the data foundation for insights.

### Why This Phase Exists

By this phase, the user has been logging meals and weight for weeks. Novelty is fading. The points system provides extrinsic motivation to sustain engagement. Mood and sleep data start accumulating for the insight engine in Phase 5.

### Deliverables

| # | Deliverable | Details |
|---|---|---|
| 4.1 | Points system | Flat points for logging meals (same amount regardless of health score). Points for completing habits, completing tasks, hitting daily goals, fasting goal met. Streak bonus (escalating). Milestone rewards (e.g., 1000 points for losing 3kg). Points balance always visible on home screen. Never decreases except through reward claims. |
| 4.2 | Reward shop | User creates custom rewards with custom point costs. Claim button gated: disabled with "X more points needed" if insufficient. Claim history. |
| 4.3 | Achievements | Pre-built library of achievements with fun comparisons ("You lost 5kg — that's the weight of a cat!"). Triggered by milestones: first weigh-in, first 7-day streak, 100 meals logged, weight milestones. Achievement screen shows locked/unlocked. Celebratory toast on unlock. |
| 4.4 | Mood tracking | Log mood on numeric scale (1-5, consistent with health score). Add tags from personal tag library (user-created, any language). New tags addable at any time. Mood history (list view). Mood trend graph. |
| 4.5 | Sleep tracking | Log hours slept, sleep quality rating (1-5), how you feel upon waking (free text). Sleep history. Sleep trend graph. |
| 4.6 | Medicine tracking | Configure medications with name and frequency (daily, every other day). Log taken/not taken per day. Medication adherence history. |
| 4.7 | Home screen expansion | Add points balance display. Show mood if logged today. |

### Database Changes

```
Version 4 (add to existing):
├── pointsTransactions:  ++id, source_type, date
├── rewards:             ++id, is_available
├── rewardClaims:        ++id, reward_id, claimed_at
├── achievements:        ++id, trigger_type, is_unlocked
├── moodEntries:         ++id, date, logged_at
├── moodTags:            ++id
├── sleepEntries:        ++id, date
├── medicines:           ++id, is_active
└── medicineLogs:        ++id, medicine_id, date
```

Settings additions to `userProfile`: `points_balance` (derived but cached for display performance).

### Screens Created

| Screen | Route | Purpose |
|---|---|---|
| MoodPage | `/log/mood` | Log mood + tags + history |
| SleepPage | `/log/sleep` | Log sleep + history |
| MedicinePage | `/log/medicine` | Log taken/not taken + history |
| RewardShopPage | `/me/rewards` | Reward shop + claim + history |
| AchievementsPage | `/me/achievements` | Locked/unlocked achievements grid |

### Components Created

| Component | Location | Purpose |
|---|---|---|
| PointsBadge | `components/` | Points balance display (home screen + reward shop) |
| MoodEntryForm | `features/mood/` | Score picker + tag selector |
| MoodTagManager | `features/mood/` | Tag library CRUD |
| SleepEntryForm | `features/sleep/` | Hours + quality + wake feeling |
| MedicineForm | `features/medicine/` | Add/edit medication |
| MedicineLogToggle | `features/medicine/` | Simple taken/not taken per day |
| RewardCard | `features/rewards/` | Reward with cost, claim button, progress |
| RewardForm | `features/rewards/` | Add/edit reward |
| AchievementCard | `features/achievements/` | Single achievement: locked/unlocked, description |
| AchievementToast | `components/` | Celebratory notification on unlock |

### Hooks Created

| Hook | Purpose |
|---|---|
| `usePoints` | Points balance (computed from transactions - claims), earn points, check achievements |
| `useMood` | Mood entries by date, tag library |
| `useSleep` | Sleep entries by date |
| `useMedicine` | Active medicines, today's log status |
| `useAchievements` | All achievements, check trigger conditions |

### Risks

| Risk | Mitigation |
|---|---|
| Points economy feels wrong (too easy or too hard to earn rewards) | Calibrate: small reward earnable in ~1 week, large in ~1 month. User controls both sides (point earnings and reward costs). Allow tuning point values in settings if needed. |
| Achievement library feels thin | Start with 15-20 achievements. Add more over time as new features provide new triggers. Quality over quantity. |
| Mood tagging is rarely used | Tags are optional. The numeric score alone is still valuable for trend tracking. Tags become powerful in Phase 5 with correlations. |
| Too many logging actions per day | All new logging is optional. The home screen doesn't nag about unlogged mood or sleep. These features exist for the user who wants depth, not as new obligations. |

### Testing Requirements

| Test | Type | Details |
|---|---|---|
| Points calculation | Unit (Vitest) | Flat meal points regardless of score. Streak bonus escalation. Milestone triggers at correct thresholds. Balance never goes negative. |
| Achievement trigger evaluation | Unit (Vitest) | "First weigh-in" triggers on first weight entry. "5kg lost" triggers at correct delta from starting weight. Achievements unlock only once. |
| Reward claim gating | Unit (Vitest) | Cannot claim reward with insufficient points. Points deducted on claim. Claim recorded in history. |
| Points never decrease from logging | Manual | Log a 1/5 meal. Verify points increase, not decrease. |

### Definition of Done

- [ ] Points earned for logging meals (flat), completing habits/tasks, streaks, milestones
- [ ] Points balance visible on home screen
- [ ] Reward shop: create rewards, claim when enough points, gated otherwise
- [ ] Achievements unlock at milestones with celebratory display
- [ ] Can log mood with score and tags
- [ ] Can log sleep with hours, quality, and wake feeling
- [ ] Can log medicine taken/not taken
- [ ] All new tracking features are optional — no pressure to use them

---

## Phase 5: Reporting and Insights

### Goal

Make all the accumulated data meaningful through graphs, weekly reviews, and the beginning of correlation-based health insights. The app stops being a log and starts being a mirror.

### Why This Phase Exists

By now, the user has weeks or months of data across weight, meals, water, fasting, habits, mood, sleep, and exercise. Raw data without synthesis is just noise. The weekly review and graphs turn noise into signal.

### Deliverables

| # | Deliverable | Details |
|---|---|---|
| 5.1 | Graphs dashboard | Dedicated graphs screen accessible from any tab. All chart types: weight trend (raw + smoothed EMA), meal health score trend, water intake vs goal, fasting durations vs goal, body measurement trends (per area), mood trend, sleep trend (hours + quality), exercise frequency, habit completion rate, points earned. Time range selector: week, month, 3 months, 6 months, year, all time. |
| 5.2 | Smoothed weight trend line | Exponential moving average overlay on weight graph alongside raw data points. |
| 5.3 | Measurement trend graphs | Per-body-area trend line charts on the measurements screen. |
| 5.4 | Weekly review | Auto-generated every Sunday. Warm personalized greeting. Sections: weight summary, meal summary (trend direction), fasting totals, water average, habit completion rates ("X of last Y days"), mood patterns (average + common tags), sleep average, exercise count, points earned (breakdown by source), achievements unlocked. Sections omitted when data is missing (not shown with zeros). Suggestions: 1-2 gentle invitations ("Consider adding..."). Browsable history of past reviews. |
| 5.5 | Statistical correlation engine (basic) | Client-side analysis: Pearson correlation between metric pairs. Example patterns: sleep hours vs meal health score, mood tags vs weight fluctuation, exercise presence vs mood, fasting duration vs first meal score. Minimum data threshold before surfacing (e.g., 4+ weeks of data). |
| 5.6 | Health insights | Surfaced as questions: "You seem to eat worse on days you sleep under 6 hours — is this accurate?" Confirm/reject flow. Max 2-3 insights per weekly review. Confirmed insights saved and tracked. Rejected insights hidden. |
| 5.7 | Data export | Export all data to Excel via SheetJS. Export graphs to PDF via jsPDF + html2canvas. Export progress photos as zip. |
| 5.8 | Progress photos | Photo capture with pose type tag (front/side/back). Gallery organized by date. Side-by-side comparison tool (select two dates). Storage status indicators. 6-month download reminder. 1-year compression. |

### Database Changes

```
Version 5 (add to existing):
├── healthInsights:   ++id, is_confirmed, is_rejected
├── weeklyReviews:    ++id, &week_start
└── progressPhotos:   ++id, date, is_compressed
```

### Screens Created

| Screen | Route | Purpose |
|---|---|---|
| GraphsDashboard | `/graphs` | All charts with time range selection |
| WeeklyReviewPage | `/me/review` | Latest weekly review |
| HistoricalReviewPage | `/me/review/:weekId` | Past weekly review |
| InsightsPage | `/insights` | Confirmed, pending, rejected insights |
| ProgressPhotosPage | `/me/photos` | Photo gallery + comparison tool |
| ExportPage | `/settings/export` | Data export options |

### Components Created

| Component | Location | Purpose |
|---|---|---|
| TimeRangeSelector | `components/charts/` | Week/month/3mo/6mo/year/all picker |
| BarChart | `components/charts/` | Bar chart (water, exercise frequency) |
| ProgressRing | `components/charts/` | Circular progress (habit completion %) |
| ReviewSection | `features/review/` | Reusable weekly review section (title + content) |
| InsightCard | `features/insights/` | Single insight with confirm/reject buttons |
| PhotoComparison | `features/photos/` | Side-by-side photo comparison tool |
| PhotoGallery | `features/photos/` | Date-organized photo grid |

### Hooks Created

| Hook | Purpose |
|---|---|
| `useGraphData` | Aggregate data across all entities for a given time range |
| `useWeeklyReview` | Generate or retrieve review for a given week |
| `useInsights` | Run correlations, surface pending insights, handle confirm/reject |
| `useProgressPhotos` | Photo CRUD, lifecycle checks, comparison selection |

### Risks

| Risk | Mitigation |
|---|---|
| Correlation engine finds spurious patterns | Minimum data threshold (4+ weeks). Require statistical significance. Present as questions not facts. User confirms or rejects. |
| Too many insights overwhelm the user | Max 2-3 per weekly review. Prioritize strong correlations. |
| Weekly review is too long | Sections are omitted when data is missing. User who only logs weight and meals gets a short review. |
| Graph rendering is slow with large datasets | Recharts handles SVG rendering. For >1 year of data, subsample data points (e.g., weekly averages instead of daily). |
| Photo comparison tool is complex to build | Start simple: select two photos, display side by side. No overlay, no slider, no animation. |

### Testing Requirements

| Test | Type | Details |
|---|---|---|
| Weekly review generation | Unit (Vitest) | Given a week of known data, review contains correct summaries. Missing sections omitted. Suggestions are gentle language. |
| Correlation calculation | Unit (Vitest) | Known correlated data produces significant result. Uncorrelated data does not. Below-threshold data produces no insight. |
| Excel export | Manual | Export data. Open in Excel/Google Sheets. Verify all entries present and columns labeled. |
| Photo compression | Manual | Add a progress photo. Wait for (or simulate) 1-year threshold. Verify compression triggers and original is replaced. |
| Graph time ranges | Manual | Switch between week/month/year on each graph type. Verify correct data range displayed. |

### Definition of Done

- [ ] All graph types render correctly with real data
- [ ] Time range selector works across all graphs
- [ ] Weight graph shows smoothed trend line alongside raw data
- [ ] Weekly review generates with correct data, omitting empty sections
- [ ] Health insights surface after sufficient data, presented as questions
- [ ] User can confirm or reject insights
- [ ] Data export works for Excel, PDF, and photos
- [ ] Progress photos: capture, gallery, side-by-side comparison
- [ ] Photo lifecycle: 6-month reminder, 1-year compression

---

## Phase 6: Notifications

### Goal

The app proactively reaches out to the user through contextual, respectful notifications. The notification system respects all rules: max 1/hour, phone-free windows, quiet mode, 2-attempt limit, mode adjustments.

### Why This Phase Exists

Until now, the app is passive — it waits for the user to open it. Notifications make it gently active: morning quotes, meal reminders, medicine nudges, and the supportive "welcome back" after silence. This is the phase where the "supportive mother" personality comes alive outside the app.

### Deliverables

| # | Deliverable | Details |
|---|---|---|
| 6.1 | Custom quote pool | User manages motivational/grounding quotes in settings. Quotes shown on home screen (replacing hardcoded messages) and in notifications. Rotation strategy (random or weighted-toward-less-shown). |
| 6.2 | Schedule profiles | School day vs free day profiles with configurable wake times, phone-free windows, expected meal times, phone-away times. Manual day-by-day assignment (no auto-detection). |
| 6.3 | Modes | Exam mode (reduced notifications), social day (meal/water nudges suppressed), quiet mode (all notifications suppressed). Activate/deactivate from settings or home screen. |
| 6.4 | In-app notification queue (Tier 1) | Notification rule engine that evaluates on app open and periodically while open (every 15 minutes). Notification types: morning quote, evening quote, meal reminder (contextual, ~1 hour after expected meal time), medicine reminder, water nudge (max 1/day), emotional support (after low mood + silence). All rules enforced: max 1/hour, phone-free windows, mode adjustments, max 2 attempts per event. |
| 6.5 | Notification settings | Configure which notification types are enabled. Configure morning/evening quote times (defaults: 9am / 9pm). |
| 6.6 | Side menu navigation | Hamburger menu with links to: Graphs, Insights, Weekly Reviews, Achievements, Reward Shop, Settings, Data Export, About. |

### Database Changes

```
Version 6 (add to existing):
├── customQuotes:       ++id
├── scheduleProfiles:   ++id, &profile_name
├── dayConfigs:         &date
├── notificationQueue:  ++id, type, scheduled_at
└── notificationHistory: ++id, type, fired_at
```

### Screens Created

| Screen | Route | Purpose |
|---|---|---|
| QuoteManager | `/settings/quotes` | Quote pool CRUD |
| ScheduleSettings | `/settings/schedule` | Profile config, day assignment |
| NotificationSettings | `/settings/notifications` | Toggle notification types, configure times |

### Components Created

| Component | Location | Purpose |
|---|---|---|
| SideMenu | `components/layout/` | Drawer overlay with secondary navigation |
| NotificationToast | `components/` | In-app notification display (auto-dismiss) |
| ModeBadge | `components/` | Current mode indicator on top bar |
| ModeToggle | `components/` | Activate/deactivate modes (home screen or settings) |
| QuoteForm | `features/settings/` | Add/edit quote |
| DayProfilePicker | `features/settings/` | Assign schedule profile to a date |

### Hooks Created

| Hook | Purpose |
|---|---|
| `useNotifications` | Evaluate notification rules, manage queue, fire notifications |
| `useSchedule` | Today's schedule profile, active mode, phone-free windows |
| `useQuotes` | Random quote selection from pool |

### Risks

| Risk | Mitigation |
|---|---|
| In-app notifications only fire when app is open | This is a known PWA limitation. Document it clearly. Notifications enhance the experience but are not required for any feature to function. |
| Notification rules are complex to implement correctly | Build the rule engine as a testable pure function. Each rule is a simple predicate (canFire: boolean). Compose them. |
| Quote pool is empty on first use | If user hasn't added quotes, fall back to hardcoded supportive messages (already built in Phase 1). |
| Emotional support detection is invasive if wrong | Require: low mood entry (score 1-2) + 24+ hours of no logging. Message is gentle and generic: "It's okay. Log when you're ready." Max 2 attempts. No analysis or advice. |

### Testing Requirements

| Test | Type | Details |
|---|---|---|
| Notification rule engine | Unit (Vitest) | Max 1/hour enforced. Phone-free window respected. Quiet mode suppresses all. Exam mode reduces to quotes + medicine only. Social mode suppresses meals + water. 2-attempt max per event. |
| Schedule profile application | Unit (Vitest) | Given a school day profile, phone-free window matches configured times. Given no day config, falls back to default profile. |
| Quote rotation | Unit (Vitest) | With N quotes in pool, each is eventually shown. No quote repeats until all have been shown (if using weighted strategy). |
| Emotional support trigger | Manual | Log low mood (score 1). Don't log anything for 24+ hours. Open app. Verify supportive message appears. Verify it stops after 2 attempts. |

### Definition of Done

- [ ] User can manage their own quote pool
- [ ] Quotes display on home screen (replacing hardcoded messages)
- [ ] Schedule profiles configurable and assignable to days
- [ ] Exam, social, and quiet modes work correctly
- [ ] In-app notifications fire according to all rules
- [ ] Emotional support detection works after low mood + silence
- [ ] Side menu provides secondary navigation
- [ ] All notification rules enforced (max 1/hour, phone-free, modes, 2-attempt)

---

## Phase 7: Polish and Optimization

### Goal

Refine every rough edge, improve performance, handle edge cases, and add quality-of-life features that make the app feel complete. This is not a feature phase — it's a craftsmanship phase.

### Why This Phase Exists

After 6 phases, the app has all its features but likely has UX rough spots, performance issues with growing data, and polish opportunities. This phase makes the app feel finished rather than "built by one person."

### Deliverables

| # | Deliverable | Details |
|---|---|---|
| 7.1 | Auto light/dark mode | Auto-switch based on `prefers-color-scheme` media query and/or time-of-day. Three settings: Auto, Always Light, Always Dark. |
| 7.2 | Photo lifecycle manager | Background task on app open: compress food photos at 3 months, delete at 1 year (or storage threshold). Compress progress photos at 1 year. 6-month download reminder for progress photos. |
| 7.3 | App lock | Optional PIN (4-6 digit, hashed, stored in Dexie). Checked on app open. 3-attempt cooldown. Clear warning during setup: "No forgot-PIN recovery exists." Biometric via WebAuthn where supported. |
| 7.4 | Custom install prompt | After 3rd app open within 7 days: show gentle, dismissible install banner. Don't show again for 30 days if dismissed. Never block content. |
| 7.5 | Habit queue & enforcement | Habit queue ("future habits I want"). 1-per-category-per-week enforcement (prevent activating more than 1 new habit per label per week). |
| 7.6 | Starter habit kit | After habits feature is active and user has 0 habits: suggest 2-3 starter habits. Dismissible. |
| 7.7 | Performance optimization | Virtualize long lists (meal history, task lists) with `react-window` if scrolling lags. Optimize Recharts rendering for large datasets (subsample to weekly averages for >6 month ranges). Lazy-load feature routes with `React.lazy()`. |
| 7.8 | Error boundaries | React error boundaries around each feature. If one feature crashes, others remain functional. Friendly error message: "Something went wrong with [feature]. Your data is safe." |
| 7.9 | Storage monitoring | Display storage used in settings (via `navigator.storage.estimate()`). Warn if approaching limits. Manual photo compression trigger. |
| 7.10 | Accessibility audit | Verify all interactive elements are keyboard-accessible. Verify color contrast meets WCAG AA. Verify screen reader labels on icons and charts. |
| 7.11 | CI/CD quality checks | GitHub Actions: TypeScript type check (`tsc --noEmit`), ESLint, Vitest unit tests, build check on every PR. |
| 7.12 | Edge case hardening | Handle: device clock changes (timezone travel), Dexie upgrade failures (graceful recovery), corrupted backup files (meaningful error message), extremely old backups (schema version mismatch handling). |

### Database Changes

No schema changes. This phase works with the existing Version 6 schema.

Possible additions to `userProfile`: `pin_hash`, `app_lock_enabled`, `install_prompt_dismissed_at`.

### Screens Created

No new screens. Existing screens are enhanced.

### Components Created

| Component | Location | Purpose |
|---|---|---|
| AppLockScreen | `components/` | PIN entry / biometric prompt on app open |
| InstallBanner | `components/` | Gentle PWA install prompt |
| StorageIndicator | `features/settings/` | Storage used / available display |
| ErrorBoundary | `components/` | Per-feature error boundary with friendly message |
| StarterHabitSuggestion | `features/habits/` | Suggested habits for new users |

### Hooks Created

| Hook | Purpose |
|---|---|
| `useAppLock` | PIN verification, biometric check, lockout timer |
| `useStorageEstimate` | Current storage usage via Storage API |
| `usePhotoLifecycle` | Check and execute photo compression/deletion on app open |

### Risks

| Risk | Mitigation |
|---|---|
| App lock has no recovery path | Warn clearly during setup. Suggest creating a backup before enabling. The backup file is independent of the PIN. |
| Photo lifecycle deletes something the user wanted | Always notify before deleting. Progress photos are never auto-deleted. Food photos show a warning before deletion with option to download first. |
| Performance optimization is premature | Only apply virtualization and lazy loading where actual lag is measured. Don't optimize until a problem exists. |
| CI/CD blocks rapid iteration | Keep checks fast (< 2 minutes total). No integration tests in CI — only unit tests and type checks. |

### Testing Requirements

| Test | Type | Details |
|---|---|---|
| App lock | Manual | Enable PIN. Close app. Reopen. Verify PIN screen appears. Correct PIN proceeds. Wrong PIN 3x triggers cooldown. |
| Photo lifecycle | Unit (Vitest) | Given photos with various ages, correctly identifies which need compression, deletion, or download reminder. |
| Error boundary | Manual | Intentionally break a feature component. Verify error boundary catches it and other features remain functional. |
| Large dataset rendering | Manual | Seed database with 1 year of daily data. Verify graphs render without noticeable lag. Verify lists scroll smoothly. |
| Backup schema compatibility | Unit (Vitest) | Backup created with Version 3 schema can be restored into a Version 6 database (with migration). |

### Definition of Done

- [ ] Auto light/dark mode works based on OS preference and time
- [ ] Photo lifecycle manager runs on app open and handles compression/deletion
- [ ] App lock works with PIN (and biometric where supported)
- [ ] Install prompt appears at the right time and doesn't nag
- [ ] Habit queue and 1-per-category enforcement work
- [ ] Long lists are smooth (virtualized if needed)
- [ ] Error boundaries prevent feature crashes from breaking the whole app
- [ ] CI/CD runs type checks, lint, and tests on every PR
- [ ] Storage usage visible in settings
- [ ] No known edge case crashes

---

## Phase Summary

| Phase | Goal | Builds On | Result |
|---|---|---|---|
| **Phase 0** | Project setup | Nothing | Dev environment, tooling, deployed empty PWA |
| **Phase 1** | Core foundation | Phase 0 | Usable daily app: weight, meals, measurements, backup |
| **Phase 2** | Tasks & habits | Phase 1 | Daily structure: habits to check, tasks to complete |
| **Phase 3** | Health tracking | Phase 2 | Full health dashboard: water, fasting, exercise |
| **Phase 4** | Nutrition tracking | Phase 3 | Engagement depth: points, rewards, mood, sleep, medicine |
| **Phase 5** | Reporting & insights | Phase 4 | Data synthesis: graphs, weekly reviews, correlations |
| **Phase 6** | Notifications | Phase 5 | Proactive outreach: quotes, reminders, modes |
| **Phase 7** | Polish & optimization | Phase 6 | Production quality: performance, security, edge cases |

### At Each Phase End, the App Is:

- **After Phase 0:** Installable on phone, works offline, no features
- **After Phase 1:** A warm daily health logger with backup — worth using
- **After Phase 2:** A daily companion with structure — habits and tasks
- **After Phase 3:** A full health dashboard — water, fasting, exercise
- **After Phase 4:** An engaging system — points, rewards, achievements, mood, sleep
- **After Phase 5:** An intelligent mirror — graphs, reviews, insights, photos
- **After Phase 6:** A proactive friend — notifications, quotes, emotional support
- **After Phase 7:** A polished, production-quality personal Health OS

---

*Start with Phase 0. When it's done, start Phase 1. When you're using the app daily after Phase 1, start Phase 2. Don't skip ahead. Don't plan ahead. Build, use, learn, iterate.*
