# ItGetsBetter — Technical Architecture Document

**Version:** 2.0
**Date:** 2026-06-22
**Status:** Implemented — All 7 phases complete
**Companion Document:** [PRD.md](PRD.md)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Recommended Tech Stack](#2-recommended-tech-stack)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Architecture](#5-database-architecture)
6. [Authentication Strategy](#6-authentication-strategy)
7. [File Storage Strategy](#7-file-storage-strategy)
8. [Notification Strategy](#8-notification-strategy)
9. [Analytics Strategy](#9-analytics-strategy)
10. [Offline Support](#10-offline-support)
11. [Data Synchronization](#11-data-synchronization)
12. [Folder Structure](#12-folder-structure)
13. [Component Architecture](#13-component-architecture)
14. [State Management](#14-state-management)
15. [Security Considerations](#15-security-considerations)
16. [Deployment Strategy](#16-deployment-strategy)
17. [Phased Implementation Plan](#17-phased-implementation-plan)

---

## 1. Architecture Overview

### Architecture Type: Local-First Progressive Web App

ItGetsBetter is a **local-first PWA** — all data lives on the device, the app works fully offline, and no server is required for core functionality. This architecture was chosen because it satisfies every hard constraint simultaneously:

| Constraint | How This Architecture Satisfies It |
|---|---|
| Privacy — no third-party plain-text access | All data stays on-device in IndexedDB. No server ever sees it. |
| Offline — must work without internet | PWA with service worker caches the app shell. IndexedDB has no network dependency. |
| Phone-first, installable on Android and iPhone | PWA is installable on both via "Add to Home Screen." |
| Single user, personal use | No user accounts, no server infrastructure, no multi-tenancy complexity. |
| Maintainable by a single developer | One codebase (web technologies), no server to maintain, free hosting. |
| Future desktop support | PWA runs natively in any browser — desktop support is automatic with no extra work. |

### High-Level Diagram

```
┌─────────────────────────────────────────────────┐
│                    DEVICE                        │
│                                                  │
│  ┌─────────────┐  ┌──────────────────────────┐  │
│  │  Service     │  │     React SPA            │  │
│  │  Worker      │  │                          │  │
│  │             │  │  ┌────────┐ ┌──────────┐ │  │
│  │  • App cache │  │  │ Zustand│ │ React    │ │  │
│  │  • Offline   │  │  │ (UI    │ │ Router   │ │  │
│  │    fallback  │  │  │ state) │ │          │ │  │
│  │  • BG tasks  │  │  └────────┘ └──────────┘ │  │
│  └──────┬───────┘  │                          │  │
│         │          │  ┌────────────────────┐  │  │
│         │          │  │   Dexie.js          │  │  │
│         │          │  │   (IndexedDB ORM)   │  │  │
│         │          │  └─────────┬──────────┘  │  │
│         │          └────────────┼─────────────┘  │
│         │                       │                 │
│  ┌──────┴───────────────────────┴──────────────┐ │
│  │              IndexedDB                       │ │
│  │  • All structured data                       │ │
│  │  • Photo blobs (meal + progress)             │ │
│  │  • Settings & configuration                  │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │         Notification API                      │ │
│  │  • Scheduled local notifications              │ │
│  │  • In-app notification queue                  │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
         │
         │ (Optional, future)
         ▼
┌────────────────────────┐
│  Encrypted Backup      │
│  • Export to file       │
│  • Google Drive / etc.  │
│  • AES-256-GCM          │
└────────────────────────┘
```

### Why Not Native (React Native / Flutter)?

| Consideration | PWA | React Native / Flutter |
|---|---|---|
| Cross-platform from one codebase | Yes (phone + desktop for free) | Requires separate desktop build |
| Install on Android/iPhone | Yes (Add to Home Screen) | Yes (app store) |
| Offline support | Yes (service worker + IndexedDB) | Yes (native storage) |
| Developer learning curve | Low — standard web dev (HTML, CSS, React) | Medium — new frameworks, build tools, native bridges |
| Claude assistance quality | Excellent — React/TypeScript is Claude's strongest domain | Good, but more niche APIs and platform-specific gotchas |
| Maintenance burden | Low — no app store submissions, no native build chains | High — Xcode/Android Studio, app store reviews, native dependencies |
| Notifications | Limited (see Section 8) | Full native notification support |
| Camera access | Yes (MediaDevices API) | Yes (native) |
| File system access | Limited (via IndexedDB blobs) | Full native access |

**The tradeoff:** PWA notifications are more limited than native, especially on iOS. This is the single biggest downside. Section 8 details the mitigation strategy. Every other constraint favors PWA.

---

## 2. Recommended Tech Stack

### Core Stack

| Layer | Technology | Version | Why |
|---|---|---|---|
| **Language** | TypeScript | 5.x | Type safety prevents bugs in a solo project. Claude is exceptional at TypeScript. |
| **Framework** | React | 19.x | Most widely used UI framework. Massive ecosystem. Claude's strongest framework. |
| **Build Tool** | Vite | 6.x | Fast dev server, fast builds, simple config. Best DX for React SPAs. |
| **Routing** | React Router | 7.x | Standard for React SPAs. Supports the tab/page navigation model. |
| **Styling** | Tailwind CSS | 4.x | Utility-first, fast to prototype, highly maintainable. Claude writes excellent Tailwind. |
| **Components** | shadcn/ui | Latest | Not a library — copy-paste accessible components built on Radix. Customizable, no vendor lock-in. Warm/cozy theming is fully achievable. |
| **Database** | Dexie.js | 4.x | Best IndexedDB wrapper. Reactive queries (liveQuery). Simple API. Offline-native. |
| **State** | Zustand | 5.x | Lightweight, simple, no boilerplate. For ephemeral UI state only — persistent data lives in Dexie. |
| **Charts** | Recharts | 2.x | React-native charting library. Declarative, composable, well-documented. Claude writes it fluently. |
| **PWA** | vite-plugin-pwa | 1.x | Integrates Workbox for service worker generation. Handles caching, offline fallback, install prompt. |
| **Icons** | Lucide React | Latest | Clean, consistent icon set. Lightweight. |
| **Date Handling** | date-fns | 4.x | Lightweight, tree-shakeable, immutable. No Moment.js bloat. Handles the 3AM day boundary logic. |
| **UUID** | crypto.randomUUID() | Built-in | Native browser API. No library needed. |
| **Image Compression** | browser-image-compression | Latest | Client-side image compression for the photo lifecycle (3-month and 1-year compression). |
| **Export (Excel)** | SheetJS (xlsx) | Latest | Client-side Excel file generation for data export. |
| **Export (PDF)** | jsPDF + html2canvas | Latest | Client-side PDF generation for graph exports. |

### Why Each Choice

**TypeScript over JavaScript:** You're building this solo and indefinitely. TypeScript catches errors at write-time that JavaScript only catches at runtime. For a project that will grow to 20+ data entities with complex relationships, type safety isn't optional — it's a survival mechanism. Claude generates better code with TypeScript because it can reason about types.

**React over Vue/Svelte/Angular:** React has the largest ecosystem, the most community resources, and is the framework Claude assists with most effectively. When you're stuck at 2am, React has more Stack Overflow answers, more tutorials, and more compatible libraries than any alternative. Vue and Svelte are excellent, but the ecosystem depth of React matters for a solo developer.

**Vite over Next.js/Remix:** Next.js is designed for server-rendered applications with backends. ItGetsBetter has no server. Vite builds a pure static SPA — exactly what a local-first PWA needs. It's simpler, faster, and has less conceptual overhead. No server-side rendering, no API routes, no deployment complexity.

**Dexie.js over raw IndexedDB / SQLite (WASM):** Raw IndexedDB has a notoriously bad API — callbacks, transactions, and verbose cursor handling. Dexie wraps it with a clean, Promise-based API that reads like normal database code. It also provides `liveQuery` — reactive queries that automatically update the UI when data changes, eliminating a whole category of state management bugs. SQLite via WASM (e.g., sql.js, wa-sqlite) is powerful but heavier and more complex to set up. Dexie is the sweet spot of simplicity and power for a PWA.

**Zustand over Redux/Context/Jotai:** Redux is too much boilerplate for this project. React Context causes unnecessary re-renders when misused. Zustand is minimal — a few lines to create a store, direct access, no providers. It handles ephemeral UI state (which modal is open, which tab is selected, current theme) while Dexie handles all persistent data. Clean separation.

**Tailwind over CSS Modules/Styled Components:** For a solo developer, Tailwind eliminates the "where do I put this CSS" problem entirely. Styles live right next to the markup. It's fast to prototype, easy to refactor, and Claude generates excellent Tailwind classes. The warm, colorful, cozy design is achievable through a custom Tailwind theme configuration.

**Recharts over Chart.js:** Chart.js is canvas-based and imperative. Recharts is SVG-based and declarative — it composes naturally with React's component model. For the extensive charting requirements (10+ graph types across multiple time ranges), Recharts' composability is a significant advantage.

---

## 3. Frontend Architecture

### 3.1 Application Shell

The app follows a **Single Page Application (SPA)** pattern with client-side routing. The shell consists of:

```
┌──────────────────────────────────┐
│         Status Bar (OS)          │
├──────────────────────────────────┤
│    Top Bar (contextual title,    │
│    hamburger menu, mode badge)   │
├──────────────────────────────────┤
│                                  │
│                                  │
│        Page Content Area         │
│        (scrollable)              │
│                                  │
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│   Bottom Tab Bar (4 tabs)        │
│   Home | Log | To-Do | Me       │
└──────────────────────────────────┘
```

### 3.2 Routing Structure

```
/                         → Home (dashboard)
/log                      → Log hub (quick actions grid)
/log/weight               → Weight entry + history
/log/meal                 → Meal entry + today's meals
/log/water                → Water tracking
/log/mood                 → Mood entry
/log/sleep                → Sleep entry
/log/exercise             → Exercise entry
/log/medicine             → Medicine log
/log/fasting              → Fasting screen
/todo                     → Unified habits + tasks
/todo/habits              → Habit management
/todo/tasks               → Task management
/me                       → Personal hub
/me/measurements          → Body measurements
/me/photos                → Progress photos
/me/achievements          → Achievements
/me/rewards               → Reward shop
/me/review                → Weekly review (latest)
/me/review/:weekId        → Historical weekly review
/graphs                   → Charts & graphs dashboard
/insights                 → Health insights
/settings                 → All settings
/settings/profile         → Display name, height, goals
/settings/schedule        → Schedule profiles, day config
/settings/quotes          → Quote pool management
/settings/tags            → Mood tag library
/settings/export          → Data export
/settings/backup          → Backup management
```

### 3.3 Theme System

The warm, cozy, colorful design is implemented through Tailwind's theme configuration:

```
Color palette direction:
├── Primary:    Warm coral/salmon tones
├── Secondary:  Soft teal/sage
├── Accent:     Warm amber/gold (for achievements, points)
├── Background: Warm off-white (light) / warm dark gray (dark)
├── Surface:    Soft cream (light) / warm charcoal (dark)
├── Text:       Warm near-black (light) / warm off-white (dark)
├── Success:    Soft green (not harsh)
├── Warning:    Warm amber
└── Danger:     Muted soft red (used sparingly — remember: no guilt)
```

Auto light/dark mode uses the `prefers-color-scheme` media query combined with a time-based override (configurable in settings). Three modes: Auto (based on time of day), Always Light, Always Dark.

### 3.4 Responsive Design

The app is designed mobile-first but should be usable on desktop (PWA runs in a browser window):

| Breakpoint | Layout |
|---|---|
| < 640px (phone) | Single column, bottom tabs, full mobile experience |
| 640px - 1024px (tablet) | Wider cards, same navigation model |
| > 1024px (desktop) | Sidebar navigation replaces bottom tabs, wider content area, side-by-side graphs |

---

## 4. Backend Architecture

### There Is No Backend (By Design)

ItGetsBetter does not have a traditional backend server. This is a deliberate architectural choice, not a limitation.

**Why no backend:**

1. **Privacy:** No server means no server to breach, no data in transit, no third-party infrastructure trust. The user's data never leaves their device.
2. **Offline:** No server dependency means 100% offline capability with zero complexity.
3. **Cost:** No server = $0/month operating cost. The user is a student.
4. **Maintenance:** No server means no uptime monitoring, no security patches, no database backups, no SSL certificate renewals.
5. **Simplicity:** One codebase, one deployment target, one thing to understand.

**What a backend would add:**

| Feature | Backend Required? | Alternative |
|---|---|---|
| Push notifications (scheduled) | Partially — see Section 8 | Service worker timers + in-app queue |
| Cross-device sync | Yes | Deferred to future phase |
| Automated cloud backup | Yes | Manual encrypted export for now |
| Health insights (AI) | Potentially | Client-side statistical analysis first |

**When to reconsider:** If cross-device sync or automated cloud backup becomes a requirement, a lightweight backend would be introduced. The recommended future backend would be a self-hosted Node.js/Express server or a serverless function (Cloudflare Workers) — both are technologies Claude excels at. This decision is deferred, not foreclosed.

---

## 5. Database Architecture

### 5.1 Technology: Dexie.js over IndexedDB

All persistent data is stored in the browser's IndexedDB, accessed through Dexie.js.

**IndexedDB properties that matter for this app:**

| Property | Value |
|---|---|
| Storage limit | Browser-dependent. Chrome: up to 80% of disk space. Safari: ~1GB before prompting. |
| Persistence | Survives app closes, device restarts. Cleared only on explicit user action or storage pressure. |
| Performance | Indexed lookups are fast. Full table scans are acceptable for the data volumes of a single user (thousands of records, not millions). |
| Binary data | Supports Blob storage directly — meal photos and progress photos can live in IndexedDB. |
| Transactions | Full ACID transactions — important for points balance consistency. |

### 5.2 Database Schema (Dexie Definition)

The database is currently at **version 7** with 25 tables. Schema migrations are handled automatically by Dexie — each version upgrade adds tables without losing data.

```
Current schema (v7):
├── userProfile:        ++id
├── weightEntries:      ++id, date, logged_at
├── mealEntries:        ++id, date, meal_slot, logged_at
├── measurements:       ++id, date
├── appOpenLog:         ++id, date
├── labels:             ++id
├── habits:             ++id, is_active, is_queued
├── habitCompletions:   ++id, habit_id, date
├── tasks:              ++id, project_id, parent_task_id, is_completed, due_date, priority, show_in_today
├── projects:           ++id
├── waterEntries:       ++id, date, logged_at
├── exerciseEntries:    ++id, date, exercise_type
├── moodEntries:        ++id, date, logged_at
├── moodTags:           ++id
├── sleepEntries:       ++id, date
├── medicines:          ++id, is_active
├── medicineLogs:       ++id, medicine_id, date
├── pointsTransactions: ++id, source_type, date
├── rewards:            ++id, is_available
├── rewardClaims:       ++id, reward_id, claimed_at
├── achievements:       ++id, trigger_type, is_unlocked
├── progressPhotos:     ++id, date
├── healthInsights:     ++id, correlation_type, is_confirmed, is_rejected
├── customQuotes:       ++id
├── scheduleProfiles:   ++id, &profile_name
└── dayConfigs:         &date
```

### 5.3 Indexing Strategy

Indexes are chosen based on query patterns. All tables are indexed for their primary access patterns:

**All indexes:**

| Table | Indexed Fields | Why |
|---|---|---|
| weightEntries | date, logged_at | Query by date range for graphs. Sort by logged_at for "most recent." |
| mealEntries | date, meal_slot, logged_at | Filter today's meals by slot. logged_at drives fasting calculation. |
| measurements | date | Query by date range for trend lines. |
| appOpenLog | date | Calculate "X of last Y days" engagement metric. |
| habitCompletions | habit_id, date | Show completions for habit X and for date Y. |
| pointsTransactions | source_type, date | Sum points by date range. Filter by source for weekly review. |
| tasks | project_id, parent_task_id, is_completed, due_date, priority, show_in_today | Filter by project, find sub-tasks, sort by priority/due date. |
| waterEntries | date, logged_at | Daily water total aggregation. |
| exerciseEntries | date, exercise_type | Filter by date and type. |
| moodEntries | date, logged_at | Filter by date for daily mood. |
| sleepEntries | date | One entry per date lookup. |
| medicineLogs | medicine_id, date | Check if medicine taken today. |
| healthInsights | correlation_type, is_confirmed, is_rejected | Filter pending/confirmed/rejected insights. |
| scheduleProfiles | profile_name (unique) | Lookup by "school_day" or "free_day". |
| dayConfigs | date (unique) | Lookup today's schedule profile and mode. |

### 5.4 Day Boundary Implementation

The 3AM day boundary (03:00 to 02:59 next day) is implemented as a utility function used everywhere a "logical date" is needed:

```
getLogicalDate(timestamp):
  if timestamp.hour < 3:
    return previousCalendarDate(timestamp)
  else:
    return calendarDate(timestamp)
```

All entities store both `logged_at` (actual timestamp) and `date` (logical date derived from `getLogicalDate`). Queries filter by `date`, while fasting calculations use `logged_at` for precise time differences.

**Testing requirement:** `getLogicalDate()` must have comprehensive unit tests written BEFORE any feature that uses it. This is the one place where upfront testing saves more time than it costs, because every feature depends on it and a date bug will cascade silently through all data. Test cases must include at minimum:

| Input Time | Expected Logical Date | Why |
|---|---|---|
| 2026-06-18 02:59 | 2026-06-17 | Just before boundary — belongs to previous day |
| 2026-06-18 03:00 | 2026-06-18 | Exactly at boundary — belongs to new day |
| 2026-06-18 03:01 | 2026-06-18 | Just after boundary |
| 2026-06-18 00:00 | 2026-06-17 | Midnight — belongs to previous day |
| 2026-06-18 12:00 | 2026-06-18 | Midday — normal case |
| 2026-06-18 23:59 | 2026-06-18 | Late night — still same day |
| 2026-01-01 02:30 | 2025-12-31 | Year boundary — belongs to previous year |
| Backfill: user selects "June 15" at 1:00 AM June 18 | 2026-06-15 | Backfill uses the selected date, not the current time |

### 5.5 Schema Migration Strategy

Dexie supports schema versioning natively. Each version increment can add tables, add indexes, or transform data:

```
db.version(1).stores({ ... });     // MVP: weight, meals, measurements
db.version(2).stores({ ... });     // Phase 2: adds water, fasting, habits
db.version(3).stores({ ... })      // Phase 3: adds mood, sleep, exercise
  .upgrade(tx => { ... });         // Data migration if needed
```

This aligns with the phased rollout — each feature phase may introduce a new schema version. Dexie handles the upgrade automatically when the user opens the app after an update.

### 5.6 Data Volume Projections

Assuming consistent daily use over multiple years:

| Entity | Records/Day | Records/Year | Records/5 Years | Size Estimate |
|---|---|---|---|---|
| Weight entries | 1-2 | 500 | 2,500 | Negligible |
| Meal entries | 2-3 | 1,000 | 5,000 | ~500KB (text only) |
| Meal photos | 2-3 | 1,000 | 5,000 | ~500MB - 2GB (compressed) |
| Water entries | 4-8 | 2,000 | 10,000 | Negligible |
| Mood entries | 1-2 | 500 | 2,500 | Negligible |
| Habit completions | 3-5 | 1,500 | 7,500 | Negligible |
| Points transactions | 5-10 | 3,000 | 15,000 | Negligible |
| Progress photos | 1/week | 52 | 260 | ~50-200MB |

**Key insight:** Photos dominate storage. All text/numeric data combined is trivial (< 50MB over 5 years). The photo compression and deletion lifecycle (food photos: compress at 3 months, delete at 1 year; progress photos: compress at 1 year) keeps storage manageable.

**IndexedDB storage limits:** Chrome allows up to 80% of available disk space per origin. A typical phone with 64GB storage gives ~50GB of available IndexedDB space. Even with aggressive photo logging, the app won't approach this limit for years.

---

## 6. Authentication Strategy

### No Authentication Required

This is a single-user app with local-only data. There are no user accounts, no login, no server to authenticate against.

### App Lock (Privacy Protection)

Since the app contains sensitive data (progress photos, mood entries, weight), an optional app lock is recommended:

| Method | Implementation | Platform Support |
|---|---|---|
| PIN code | User sets a 4-6 digit PIN. Stored as a hash in IndexedDB. Checked on app open. | All platforms |
| Biometric | Web Authentication API (WebAuthn) with platform authenticator. Uses fingerprint/face ID. | Android (Chrome), iOS (Safari 16.4+) |

**Implementation approach:**
- App lock is optional and disabled by default.
- When enabled, a lock screen appears before any content on app open.
- After 3 failed PIN attempts, a cooldown timer prevents brute force.
- No "forgot PIN" — since data is local, there's no recovery path. The app should warn clearly during setup.

**Phase:** App lock is a Phase 2 feature. For MVP, the app relies on the device's own lock screen for privacy.

---

## 7. File Storage Strategy

### 7.1 Photo Storage in IndexedDB

Photos (both meal and progress) are stored as **Blobs directly in IndexedDB** via Dexie.

**Why IndexedDB Blobs over File System API:**

| Approach | Pros | Cons |
|---|---|---|
| IndexedDB Blobs | Simple. Backed up with the rest of the data. Works offline. Single data store to manage. | Counts against IndexedDB quota. Can't be accessed by other apps. |
| Origin Private File System (OPFS) | Better performance for large files. Doesn't count against IndexedDB quota. | Separate storage to manage. Backup must handle two sources. More complex API. |
| Native file system | Full access. Shareable. | Not available in PWAs without user interaction (File System Access API requires user gesture). |

**Decision:** IndexedDB Blobs for simplicity. The data volumes (Section 5.6) are manageable within IndexedDB limits. If photo storage ever becomes a bottleneck, migration to OPFS is possible without changing the app's data model — only the storage layer changes.

### 7.2 Photo Capture

Photos are captured using the browser's `MediaDevices` API (camera) or the `<input type="file" accept="image/*" capture>` element, which on mobile opens the native camera or photo picker.

**Capture flow:**
1. User taps "Add Photo" on a meal entry or progress photo screen.
2. Mobile: native camera/gallery picker opens (via `<input type="file" capture>`).
3. Photo is received as a `File` object.
4. Photo is compressed client-side using `browser-image-compression` (target: ~200KB for meal photos, ~500KB for progress photos).
5. Compressed photo is stored as a Blob in the relevant IndexedDB table.
6. A `photo_id` reference links the Blob to the meal or progress photo entry.

### 7.3 Photo Lifecycle Management

A background task (runs on app open, not continuously) checks for photos that need lifecycle actions:

```
Photo Lifecycle Manager (runs on app open):
│
├── Meal photos:
│   ├── Age > 3 months AND not compressed → compress to ~50KB
│   ├── Age > 1 year → delete blob, keep meal entry metadata
│   └── Total meal photo storage > threshold → delete oldest first
│
└── Progress photos:
    ├── Age > 6 months AND not notified → show download reminder
    ├── Age > 1 year AND not compressed → compress to ~100KB
    └── Never auto-delete (only manual)
```

### 7.4 Photo Separation (Meal vs. Progress)

Photos are stored in separate IndexedDB tables for independent lifecycle management:

- `mealEntries` table: contains a `photo` field (Blob) directly on the meal entry.
- `progressPhotos` table: dedicated table for progress photos with their own metadata.

This separation allows the photo lifecycle manager to apply different retention policies without complex queries.

---

## 8. Notification Strategy

### 8.1 The PWA Notification Challenge

This is the **single most significant tradeoff** of the PWA architecture. Native apps can schedule local notifications to fire at specific future times. PWAs cannot do this reliably.

**Current state of PWA notification support:**

| Capability | Android (Chrome) | iOS (Safari 16.4+) |
|---|---|---|
| Show notification when app is open | Yes | Yes |
| Show notification from service worker | Yes | Yes (only if added to home screen) |
| Web Push (server-triggered) | Yes | Yes (only if added to home screen) |
| Schedule future local notification | No native API | No native API |
| Periodic Background Sync | Yes (origin trial/limited) | No |
| Background Fetch | Yes | No |

### 8.2 Notification Architecture: Hybrid Approach

Given the constraints, notifications use a **three-tier system**:

#### Tier 1: In-App Notification Queue (MVP)

A client-side notification system that fires when the app is open or in the foreground.

```
Notification Scheduler:
├── On app open:
│   ├── Check: has morning quote been shown today? If not, show it.
│   ├── Check: any missed meal reminders? Show up to 2.
│   ├── Check: medicine due today? Remind.
│   ├── Check: absence > 2 days? Show welcome back.
│   └── Check: low mood + silence pattern? Show supportive message.
│
├── While app is open (periodic check every 15 minutes):
│   ├── Check: approaching expected meal time? Queue reminder.
│   └── Check: water pace behind? Queue nudge (max 1/day).
│
└── Notification Queue:
    ├── Respects max 1 per hour rule
    ├── Respects phone-free windows (before phone_free_until, after phone_away_at)
    ├── Respects quiet mode (suppress all)
    ├── Respects mode adjustments (exam, social)
    └── Shows as in-app toast/banner, not OS notification
```

**Limitation:** Notifications only appear while the app is open. This is acceptable for MVP because the user opens the app throughout the day. The morning and evening quotes will show on first app open near those times rather than at exactly 9am/9pm.

#### Tier 2: Service Worker Background Checks (Phase 2)

The service worker can run brief tasks when the browser triggers periodic background sync:

```
Service Worker (when browser grants background time):
├── Check notification queue
├── Show pending OS-level notifications via Notification API
└── Limited to ~30 seconds of execution
```

**Platform reality:** Periodic Background Sync is available on Android Chrome but not on iOS Safari. On iOS, the service worker only runs when the app is opened. This means Tier 2 primarily benefits Android users.

#### Tier 3: Optional Push Notification Server (Future)

For reliable scheduled notifications across both platforms, a minimal push server would be introduced:

```
Minimal Push Server (future):
├── Lightweight serverless function (Cloudflare Worker)
├── Stores: device push subscription + notification schedule
├── Does NOT store any health/personal data
├── Fires at scheduled times: morning quote, evening quote, medicine reminder
├── Payload contains only: notification type + timestamp
├── App decrypts and populates content locally (quote text, medicine name)
└── Cost: free tier on Cloudflare Workers (100K requests/day)
```

**Privacy preserved:** The push server only knows "send a notification of type X to this device at this time." It never sees quotes, medicine names, health data, or any personal content. All content is populated client-side after the notification wakes the app.

### 8.3 Notification Rule Engine

Regardless of which tier delivers the notification, the rule engine is the same:

```typescript
interface NotificationRule {
  type: string;           // 'morning_quote' | 'meal_reminder' | etc.
  canFire(): boolean;     // Checks: quiet mode, phone-free window, hour cooldown,
                          // mode adjustments, max attempts
  getMessage(): string;   // Returns the notification content
  onFired(): void;        // Records that this notification was sent (prevents repeats)
}
```

The rule engine evaluates all pending notifications, filters by the rules from PRD Section 12, and delivers only the ones that pass.

### 8.4 Notification Persistence

The notification queue and history are stored in IndexedDB:

- `notificationQueue`: pending notifications with scheduled times and attempt counts.
- `notificationHistory`: fired notifications with timestamps (for the "max 2 attempts" rule and "max 1 per hour" enforcement).

---

## 9. Analytics Strategy

### No External Analytics

Per PRD requirement NF-04, the app does not share data with any external analytics platform. No Google Analytics, no Mixpanel, no Amplitude, no telemetry.

### Internal Self-Analytics

The app tracks its own engagement metrics locally for the user's benefit:

| Metric | Storage | Purpose |
|---|---|---|
| App open dates | `appOpenLog` table (date + timestamp) | Calculate "75% of days" goal. Power "X of last Y days" displays. |
| Feature usage counts | `usageStats` table (feature + date + count) | Identify which features the user engages with most for weekly review suggestions. |
| Notification interaction rate | `notificationHistory` table | Tune notification frequency over time. |

These metrics are never transmitted. They exist solely to power the weekly review, achievement triggers, and the app's internal contextual behavior.

### Engagement Tracking for Points/Achievements

The `pointsTransactions` and `achievements` tables effectively serve as an analytics layer — they record every meaningful user action with timestamps and types. The weekly review aggregates this data into human-readable summaries.

---

## 10. Offline Support

### 10.1 Service Worker Strategy

The PWA uses a **cache-first** strategy for app assets and an **IndexedDB-only** strategy for data.

```
Service Worker Caching Strategy:
│
├── App Shell (HTML, CSS, JS, icons, fonts):
│   ├── Strategy: Cache-First (Stale-While-Revalidate)
│   ├── Precached on install via Workbox
│   └── Updated in background when app is opened online
│
├── Data:
│   ├── Strategy: No caching — all reads/writes go to IndexedDB
│   └── IndexedDB is inherently offline
│
└── External Resources:
    └── None — the app has no external dependencies at runtime
```

### 10.2 Persistent Storage Request

On first app launch, the app must call `navigator.storage.persist()` to request durable storage. This prevents the browser/OS from evicting IndexedDB data under storage pressure.

```
Persistent Storage Flow:
1. On first app open, check: await navigator.storage.persisted()
2. If not persisted: await navigator.storage.persist()
3. If granted: storage is durable — browser will not auto-evict
4. If denied: log a warning. On iOS, guide user to "Add to Home Screen"
   (installed PWAs have a higher chance of persistent storage grant)
5. Store the result in IndexedDB for future reference
```

**Platform behavior:**
- **Android Chrome:** Usually grants automatically for installed PWAs with engagement.
- **iOS Safari:** More restrictive. Adding to Home Screen significantly improves chances. If denied, the app should periodically re-request (e.g., after the user has opened the app 5+ times).

This is a safety mechanism, not a feature. It costs one line of code and significantly reduces the risk of data loss.

### 10.3 Workbox Configuration (via vite-plugin-pwa)

```
Workbox Config:
├── Precache: all built assets (JS, CSS, HTML, images, fonts)
├── Runtime caching: none needed (no API calls)
├── Offline fallback: the app shell itself (SPA handles all routes)
├── Navigation fallback: index.html (for client-side routing)
└── Cache cleanup: old versions removed on service worker activation
```

### 10.4 PWA Manifest

```
manifest.json:
├── name: "ItGetsBetter"
├── short_name: "IGB"
├── display: "standalone"        (removes browser chrome, feels native)
├── orientation: "portrait"      (phone-first)
├── theme_color: warm coral      (matches the app's warm palette)
├── background_color: warm cream (matches light mode background)
├── icons: multiple sizes for Android and iOS
├── start_url: "/"
├── scope: "/"
└── categories: ["health", "lifestyle"]
```

### 10.5 Platform Detection & iOS Guidance

On first launch, the app detects the user's platform:

```
Platform Detection Flow:
1. Detect platform: iOS (Safari), Android (Chrome), or Desktop
2. If iOS and NOT installed as PWA (not in standalone mode):
   ├── Show prominent, friendly guidance: "Add ItGetsBetter to your
   │   Home Screen for the best experience"
   ├── Include step-by-step instructions (Share → Add to Home Screen)
   ├── Explain why: "This enables notifications and protects your data"
   └── Dismissible, but re-shown on next visit if not installed
3. If iOS and installed: call navigator.storage.persist()
4. If Android: call navigator.storage.persist(), show install prompt (see below)
```

**Documented iOS caveats (visible in Settings > About):**
- Background notifications are limited — the app must be open for notifications to fire
- Storage may be evicted if the PWA is not added to the Home Screen
- Some features work best on Android

### 10.6 Install Prompt

The app includes a custom install prompt that appears after the user has interacted with the app for a few sessions (not on first visit — that's too aggressive for the "supportive" philosophy):

```
Install prompt logic:
├── Track app open count in IndexedDB
├── After 3rd open within 7 days: show a gentle, dismissible banner
├── "Add ItGetsBetter to your home screen for easy access"
├── If dismissed: don't show again for 30 days
└── Never block content or interrupt logging
```

---

## 11. Data Synchronization

### 11.1 Current Phase: No Sync

For MVP and near-term phases, there is no synchronization. The app runs on one device (phone) with all data local.

### 11.2 Backup as Manual Export (Must Have)

Backup is classified as Must Have — not because the app can't function without it, but because data loss in a local-first app would be devastating and potentially cause permanent abandonment. The backup mechanism is a **one-tap encrypted export**:

```
Backup Flow:
1. User taps "Create Backup" in settings.
2. App serializes all IndexedDB data (including photo blobs) into a single JSON structure.
3. Data is encrypted using AES-256-GCM via the Web Crypto API.
   - User provides a password.
   - Password is derived to a key using PBKDF2 (100,000 iterations).
   - Encrypted payload is saved as a .igb file (custom extension).
4. File is offered for download via the browser's download API.
5. User saves it wherever they want (Google Drive, USB, email to self).

Restore Flow:
1. User taps "Restore Backup" in settings.
2. User selects a .igb file.
3. User enters the password.
4. App decrypts and validates the data.
5. User confirms: "This will replace all current data. Continue?"
6. Data is written to IndexedDB.
```

**Why encrypted file export:**
- No server required.
- The user controls where the file lives.
- The file is useless without the password — safe to store on Google Drive, Dropbox, or email.
- One-tap initiation (meets the "close to automatic" requirement).
- Satisfies NF-17 (backup must be encrypted).

### 11.3 Future: Automated Encrypted Backup (Phase 2+)

If manual backup proves insufficient (PRD risk: "manual backup tends to never happen"), the next step is:

```
Automated Backup (future):
├── Option A: Encrypted file auto-saved to device storage on a weekly schedule
├── Option B: Encrypted file auto-uploaded to Google Drive / Dropbox via their APIs
│   (OAuth flow — the cloud provider sees only an encrypted blob, not the contents)
└── Option C: Self-hosted sync server (most complex, most private)
```

### 11.4 Future: Multi-Device Sync (Phase 3+)

If desktop support becomes a priority, sync would be introduced via a lightweight sync protocol:

```
Sync Architecture (future):
├── CRDTs (Conflict-free Replicated Data Types) for conflict resolution
├── Each device maintains a full local copy
├── Changes are synced as encrypted deltas
├── Sync server is a dumb relay — stores encrypted blobs, never reads content
└── Technology candidate: Dexie Cloud (Dexie's built-in sync service)
    or a self-hosted alternative
```

**Dexie Cloud** is specifically designed for Dexie.js apps and provides end-to-end encrypted sync out of the box. It's the natural upgrade path from a local-only Dexie database to a synced one, with minimal code changes. This is why choosing Dexie now is a future-proof decision even though sync is deferred.

---

## 12. Folder Structure

```
src/
├── main.tsx                          # App entry point
├── App.tsx                           # Root component, routing, providers
├── db.ts                             # Dexie database definition + schema
├── sw.ts                             # Service worker registration
│
├── types/                            # Shared TypeScript types
│   ├── index.ts                      # Re-exports
│   ├── entities.ts                   # All data entity types (from PRD Section 8)
│   ├── enums.ts                      # Meal slots, frequencies, modes, etc.
│   └── notifications.ts             # Notification types and rules
│
├── lib/                              # Shared utilities (no React dependency)
│   ├── date.ts                       # Day boundary logic (getLogicalDate), date helpers
│   ├── points.ts                     # Points calculation rules
│   ├── fasting.ts                    # Fasting derivation from meal timestamps
│   ├── streaks.ts                    # Streak calculation ("X of last Y days")
│   ├── achievements.ts              # Achievement trigger evaluation
│   ├── crypto.ts                     # Backup encryption/decryption (Web Crypto API)
│   ├── export.ts                     # Excel/PDF export logic
│   ├── photo.ts                      # Photo compression, lifecycle checks
│   ├── notifications.ts             # Notification rule engine
│   └── weekly-review.ts             # Weekly review generation logic
│
├── hooks/                            # Custom React hooks
│   ├── useWeightEntries.ts           # Dexie liveQuery wrapper for weight data
│   ├── useMealEntries.ts             # Dexie liveQuery wrapper for meals
│   ├── useMeasurements.ts           # Dexie liveQuery wrapper for measurements
│   ├── useHabits.ts                  # Habits + completions
│   ├── useTasks.ts                   # Tasks + projects
│   ├── usePoints.ts                  # Points balance + transactions
│   ├── useFasting.ts                 # Current fasting state (live timer)
│   ├── useWater.ts                   # Today's water entries
│   ├── useNotifications.ts          # Notification queue + delivery
│   ├── useProfile.ts                 # User profile + settings
│   ├── useSchedule.ts               # Today's schedule profile + active mode
│   └── useTheme.ts                   # Light/dark mode state
│
├── stores/                           # Zustand stores (ephemeral UI state only)
│   ├── uiStore.ts                    # Active tab, modal state, sidebar open
│   └── onboardingStore.ts           # First-launch state
│
├── components/                       # Shared/reusable UI components
│   ├── ui/                           # Base components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── layout/                       # App shell components
│   │   ├── AppShell.tsx              # Main layout (top bar + content + bottom tabs)
│   │   ├── BottomTabs.tsx            # Bottom tab navigation
│   │   ├── SideMenu.tsx              # Hamburger side menu
│   │   ├── TopBar.tsx                # Contextual title + mode badge
│   │   └── PageContainer.tsx         # Scrollable content wrapper
│   ├── charts/                       # Reusable chart components
│   │   ├── TrendLineChart.tsx        # Weight, mood, sleep trends
│   │   ├── BarChart.tsx              # Water, exercise frequency
│   │   ├── ProgressRing.tsx          # Water progress, habit completion
│   │   └── TimeRangeSelector.tsx     # Week/month/3mo/year/all picker
│   ├── QuickAction.tsx               # Home screen quick-action button
│   ├── StreakDisplay.tsx             # "18 of last 21 days" component
│   ├── PointsBadge.tsx              # Points balance display
│   ├── ModeBadge.tsx                # Current mode indicator (exam, social, quiet)
│   ├── HealthScorePicker.tsx        # 1-5 score selector (used in meals)
│   ├── PhotoCapture.tsx             # Camera/gallery photo input
│   ├── BackfillDatePicker.tsx       # Date picker for logging past entries
│   └── SupportiveMessage.tsx        # Warm message component (home screen, welcome back)
│
├── features/                         # Feature modules (one per PRD feature area)
│   ├── home/
│   │   ├── HomePage.tsx              # Dashboard, supportive message, quick actions
│   │   └── DashboardWidgets.tsx      # Mini metric cards
│   ├── weight/
│   │   ├── WeightPage.tsx            # Weight entry + history + graph
│   │   ├── WeightEntryForm.tsx       # Log weight form
│   │   └── WeightGraph.tsx           # Weight trend chart
│   ├── meals/
│   │   ├── MealsPage.tsx             # Today's meals + history
│   │   ├── MealEntryForm.tsx         # Log meal form (photo/name + score)
│   │   └── MealCard.tsx              # Single meal display card
│   ├── measurements/
│   │   ├── MeasurementsPage.tsx      # Entry form + trends
│   │   ├── MeasurementForm.tsx       # 8-field optional form
│   │   └── MeasurementGraph.tsx      # Per-area trend lines
│   ├── fasting/
│   │   ├── FastingPage.tsx           # Timer + history
│   │   └── FastingTimer.tsx          # Live countdown/count-up display
│   ├── water/
│   │   ├── WaterPage.tsx             # Progress + buttons
│   │   └── WaterButtons.tsx          # Quick-add preset buttons + undo
│   ├── mood/
│   │   ├── MoodPage.tsx              # Entry + history
│   │   ├── MoodEntryForm.tsx         # Score + tag selector
│   │   └── MoodTagManager.tsx        # Tag library management
│   ├── sleep/
│   │   ├── SleepPage.tsx             # Entry + history
│   │   └── SleepEntryForm.tsx        # Hours + quality + wake feeling
│   ├── exercise/
│   │   ├── ExercisePage.tsx          # Entry + history
│   │   ├── ExerciseEntryForm.tsx     # Type + optional details
│   │   └── ExerciseTypeManager.tsx   # Add/remove/deactivate types
│   ├── todo/
│   │   ├── TodoPage.tsx              # Unified habits + tasks view
│   │   ├── TaskList.tsx              # Task items
│   │   ├── HabitList.tsx             # Today's habits
│   │   ├── TaskForm.tsx              # Add/edit task
│   │   └── HabitForm.tsx             # Add/edit habit
│   ├── habits/
│   │   ├── HabitsManagementPage.tsx  # Active + queue + categories
│   │   └── HabitQueue.tsx            # Future habits pool
│   ├── medicine/
│   │   ├── MedicinePage.tsx          # Log + history
│   │   └── MedicineForm.tsx          # Add/edit medication
│   ├── rewards/
│   │   ├── RewardShopPage.tsx        # Shop + claim + history
│   │   └── RewardForm.tsx            # Add/edit reward
│   ├── achievements/
│   │   ├── AchievementsPage.tsx      # Locked + unlocked grid
│   │   └── AchievementCard.tsx       # Single achievement display
│   ├── review/
│   │   ├── WeeklyReviewPage.tsx      # Generated review display
│   │   └── ReviewSection.tsx         # Reusable section component
│   ├── insights/
│   │   ├── InsightsPage.tsx          # Confirmed + pending + rejected
│   │   └── InsightCard.tsx           # Single insight with confirm/reject
│   ├── graphs/
│   │   └── GraphsDashboard.tsx       # All charts, time range selection
│   ├── settings/
│   │   ├── SettingsPage.tsx          # Settings hub
│   │   ├── ProfileSettings.tsx       # Name, height, goals
│   │   ├── ScheduleSettings.tsx      # Profiles, day config
│   │   ├── QuoteManager.tsx          # Quote pool CRUD
│   │   ├── ExportPage.tsx            # Data export
│   │   └── BackupPage.tsx            # Backup + restore
│   └── log/
│       └── LogHubPage.tsx            # Quick actions grid for all logging
│
└── assets/                           # Static assets
    ├── icons/                        # PWA icons (multiple sizes)
    └── fonts/                        # If using custom fonts
```

### Why This Structure

**Feature-based, not type-based:** Each feature (weight, meals, habits) is self-contained in its own folder with its page, forms, and subcomponents. This means adding a new feature doesn't touch any existing feature's folder. When you build the fasting feature in Phase 2, you create `features/fasting/` and wire it into the router — nothing else changes.

**Shared code is separate:** `lib/` contains pure logic with no React dependency (testable in isolation). `hooks/` contains React-specific data access. `components/` contains reusable UI. Features compose these together.

**Zustand is minimal:** Only `stores/` holds ephemeral UI state. All persistent data is accessed through `hooks/` that wrap Dexie's `liveQuery`. This prevents the common mistake of duplicating database state in a store.

---

## 13. Component Architecture

### 13.1 Component Hierarchy

```
App
├── ThemeProvider (light/dark/auto)
├── AppShell
│   ├── TopBar
│   │   ├── PageTitle
│   │   ├── ModeBadge (if active)
│   │   └── SideMenuTrigger
│   ├── SideMenu (drawer overlay)
│   │   └── Navigation links
│   ├── PageContent (React Router <Outlet>)
│   │   └── [Feature Pages]
│   └── BottomTabs
│       ├── Tab: Home
│       ├── Tab: Log
│       ├── Tab: To-Do
│       └── Tab: Me
├── ToastContainer (in-app notifications)
└── InstallPrompt (conditional)
```

### 13.2 Data Flow Pattern

Every feature follows the same data flow:

```
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│ Feature Page │────▶│ Custom Hook  │────▶│ Dexie DB │
│ (React)      │◀────│ (liveQuery)  │◀────│(IndexedDB)│
└─────────────┘     └──────────────┘     └──────────┘
       │                                       ▲
       │         ┌──────────────┐              │
       └────────▶│ lib/ utility │──────────────┘
                 │ (points, etc)│
                 └──────────────┘
```

1. **Feature page** renders UI and handles user interactions.
2. **Custom hook** (e.g., `useWeightEntries`) wraps Dexie's `liveQuery` to provide reactive data. When IndexedDB data changes, the hook automatically re-renders the component.
3. **Write operations** (logging a meal, completing a habit) call Dexie directly or through a hook's mutation function.
4. **Side effects** (awarding points, checking achievements, updating fasting records) are triggered by `lib/` utility functions called after the primary write.

### 13.3 Component Design Principles

| Principle | Rationale |
|---|---|
| Pages are thin | Feature pages compose hooks and components. Business logic lives in `lib/`, data access in `hooks/`. |
| Forms are controlled | All form inputs use React state. Submission writes to Dexie in a single transaction. |
| Lists are virtualized (when needed) | Meal history, task lists, and habit completions may grow long. Use `react-window` or similar if scrolling becomes laggy (premature optimization otherwise). |
| Mutations are optimistic | When the user taps "complete" on a habit, the UI updates instantly. The Dexie write happens in the background. If it fails (extremely unlikely with local storage), the UI reverts. |
| Toasts are non-blocking | In-app notifications (achievement unlocked, points earned) appear as toasts that auto-dismiss. They never block the user's current action. |

---

## 14. State Management

### 14.1 Two-Layer State Architecture

State is split into two categories with clear ownership:

| State Type | Technology | Examples | Persistence |
|---|---|---|---|
| **Persistent data** | Dexie.js (IndexedDB) | Weight entries, meals, habits, points, settings, photos | Survives app close, device restart |
| **Ephemeral UI state** | Zustand | Active tab, open modals, sidebar visibility, form draft values, theme override | Lost on app close (intentionally) |

### 14.2 Dexie liveQuery (Persistent State)

Dexie's `liveQuery` is the primary state management mechanism for all data. It works like a reactive database query:

```
How liveQuery works:
1. You write a query function (e.g., "get all meals for today").
2. Dexie wraps it in a reactive observer.
3. Whenever any data that the query touches changes in IndexedDB,
   the query re-runs and the React component re-renders.
4. No manual cache invalidation. No stale state bugs.
```

This eliminates an entire class of bugs where the UI shows stale data because a store wasn't updated after a write. With `liveQuery`, the UI is always consistent with the database.

**Example pattern (used in every feature hook):**

```
useMealEntries(date):
  returns liveQuery(() =>
    db.mealEntries.where('date').equals(date).toArray()
  )
```

### 14.3 Zustand (Ephemeral UI State)

Zustand manages state that doesn't belong in the database:

```typescript
// uiStore.ts — single store for all ephemeral UI state
interface UIState {
  activeTab: 'home' | 'log' | 'todo' | 'me';
  sideMenuOpen: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark' | 'auto';
  resolvedTheme: 'light' | 'dark';   // computed from auto + time
}
```

**Why not Context?** React Context re-renders all consumers on any state change. Zustand uses selector-based subscriptions — a component that only reads `activeTab` won't re-render when `sideMenuOpen` changes. This matters for performance on a phone.

### 14.4 Derived State (Computed, Not Stored)

Several important values are computed from stored data, never stored themselves:

| Derived Value | Computed From | When Computed |
|---|---|---|
| BMI | Current weight + height | On render (trivial calculation) |
| Fasting duration (live) | Last meal timestamp + current time | On render with `setInterval` for the live timer |
| Daily water total | Sum of today's water entries | Via `liveQuery` (auto-updates on new entry) |
| Streak count | Habit completion dates | On render (query last N days of completions) |
| Points balance | Sum of all pointsTransactions - sum of all rewardClaims | Via `liveQuery` |
| Weight trend (smoothed) | Weight entries over time | On render using exponential moving average |
| Average meal health score | Meal entries for the period | Via `liveQuery` |

**Why not precompute and store?** Precomputed values can become stale if a write fails or if the user backfills data. Computing on read guarantees correctness. The data volumes (Section 5.6) are small enough that these computations are instantaneous.

---

## 15. Security Considerations

### 15.1 Threat Model

Since this is a local-only, single-user app with no server, the threat model is simpler than a typical web app:

| Threat | Risk Level | Mitigation |
|---|---|---|
| **Device theft/loss** | High | App lock (Phase 2). Device-level encryption (OS feature). Encrypted backups. |
| **Shoulder surfing** | Medium | Progress photos behind app lock. Sensitive screens could have a "quick hide" gesture (future). |
| **Browser extension access** | Low | Extensions can read IndexedDB. Mitigated by: don't install untrusted extensions. No app-level defense is practical. |
| **XSS (Cross-Site Scripting)** | Low | React escapes all rendered values by default. No `dangerouslySetInnerHTML`. Content Security Policy headers. |
| **Data loss** | Medium | Encrypted backup system. Photo download reminders. |
| **Malicious PWA update** | Low | App is self-hosted (user controls the deployment). Service worker updates are verified by the browser. |

### 15.2 Data Protection Measures

| Measure | Implementation |
|---|---|
| No data exfiltration | No network requests for data. No analytics. No telemetry. The app makes zero outbound data requests. |
| Backup encryption | AES-256-GCM via Web Crypto API. Password-derived key via PBKDF2 (100,000+ iterations, SHA-256). |
| Photo protection | Stored in IndexedDB (not accessible via file manager). Behind app lock when enabled. |
| Content Security Policy | Strict CSP headers: no inline scripts, no external resource loading, no eval. |
| Input sanitization | React's default escaping handles display. User-created tags and quotes are plain text, never interpreted as HTML or code. |
| Sensitive data handling | No data is ever logged to the browser console in production builds. |

### 15.3 Web Crypto API Usage (Backup Encryption)

```
Encryption flow:
1. User provides a password
2. Salt = crypto.getRandomValues(16 bytes)
3. Key = PBKDF2(password, salt, 100000 iterations, SHA-256) → AES-256-GCM key
4. IV = crypto.getRandomValues(12 bytes)
5. Ciphertext = AES-256-GCM.encrypt(JSON.stringify(allData), key, iv)
6. Output file = { salt, iv, ciphertext } (base64 encoded)

Decryption flow:
1. User provides password
2. Key = PBKDF2(password, stored salt, 100000 iterations, SHA-256)
3. Plaintext = AES-256-GCM.decrypt(ciphertext, key, stored iv)
4. Data = JSON.parse(plaintext)
5. Validate data structure before importing
```

### 15.4 OWASP Considerations

| OWASP Risk | Applicability | Status |
|---|---|---|
| Injection | No SQL, no server, no user input executed as code | N/A |
| Broken Authentication | No authentication system (single local user) | N/A |
| Sensitive Data Exposure | Data is local-only. Backup is encrypted. | Mitigated |
| XML External Entities | No XML processing | N/A |
| Broken Access Control | Single user, no access control needed | N/A |
| Security Misconfiguration | CSP headers, no debug in production | Mitigated |
| XSS | React default escaping, no dangerouslySetInnerHTML | Mitigated |
| Insecure Deserialization | Backup restore validates structure before import | Mitigated |
| Insufficient Logging | No server to log. Client-side errors shown in UI. | N/A |
| SSRF | No server-side requests | N/A |

---

## 16. Deployment Strategy

### 16.1 Hosting: Static File Hosting

The built PWA is a collection of static files (HTML, CSS, JS, icons). It can be hosted on any static file host.

**Recommended: Cloudflare Pages (free tier)**

| Feature | Cloudflare Pages |
|---|---|
| Cost | Free (unlimited sites, unlimited bandwidth) |
| HTTPS | Automatic |
| Custom domain | Supported (free) |
| Build integration | Connects to GitHub — auto-deploys on push |
| Global CDN | Yes (fast loading worldwide) |
| Privacy | Cloudflare serves the app files only. No user data passes through Cloudflare. The app's static files (HTML, JS, CSS) contain no personal data. |

**Alternatives (if Cloudflare doesn't fit):**

| Host | Cost | Notes |
|---|---|---|
| GitHub Pages | Free | Already using GitHub. Simple. Slightly less CDN coverage. |
| Vercel | Free tier | Excellent DX. Overkill for a static site. |
| Netlify | Free tier | Similar to Vercel. Good for static sites. |
| Self-hosted (Raspberry Pi) | Hardware cost only | Maximum privacy. Maximum maintenance burden. |

### 16.2 Build Pipeline

```
Build Pipeline (on git push to main):
1. GitHub push triggers Cloudflare Pages build
2. Cloudflare runs: npm run build
3. Vite compiles TypeScript, bundles React, processes Tailwind
4. vite-plugin-pwa generates service worker + manifest
5. Output: /dist folder with static files
6. Cloudflare deploys /dist to global CDN
7. Users' PWAs auto-update via service worker on next app open
```

### 16.3 Update Strategy

PWA updates happen through the service worker lifecycle:

```
Update Flow:
1. User opens app (or app is already open in background)
2. Service worker checks for new version (automatic, browser-managed)
3. If new version found: downloads in background
4. On next app open/refresh: new version activates
5. Optionally: show a toast "New version available — refresh to update"
```

**No app store submissions.** No review process. No waiting for approval. Push to GitHub → deployed globally within minutes.

### 16.4 Environments

| Environment | URL | Purpose |
|---|---|---|
| Production | Custom domain or Cloudflare default | The real app |
| Preview | Auto-generated per PR (Cloudflare feature) | Test changes before merging |
| Local dev | localhost:5173 (Vite default) | Development |

### 16.5 CI/CD (GitHub Actions)

```
On Pull Request:
├── Type check (tsc --noEmit)
├── Lint (ESLint)
├── Unit tests (Vitest)
└── Build check (vite build)

On Push to Main:
├── All PR checks
├── Build
└── Deploy to Cloudflare Pages (automatic via Cloudflare GitHub integration)
```

---

## 17. Implementation Status

All 7 phases have been implemented. See [ROADMAP.md](ROADMAP.md) for the detailed phase-by-phase breakdown.

| Phase | Status | What was built |
|---|---|---|
| Phase 0: Project Setup | ✅ Complete | Vite + React + TS + Tailwind + Dexie + PWA + Vitest, deployed to Cloudflare Pages |
| Phase 1: Core Foundation | ✅ Complete | Weight, meals, measurements, backup, dark mode, supportive messages |
| Phase 2: Tasks & Habits | ✅ Complete | Habits (daily/weekly/monthly/custom days), tasks (priority, due dates, sub-tasks, labels, projects), unified To-Do view |
| Phase 3: Health Tracking | ✅ Complete | Water tracking, fasting timer, exercise logging, welcome back messages |
| Phase 4: Nutrition Tracking | ✅ Complete | Mood, sleep, medicine tracking, points system, reward shop, 28 achievements, homepage mood prompt |
| Phase 5: Reporting & Insights | ✅ Complete | 8-chart graphs dashboard, weekly review, progress photos with comparison, Excel/ZIP export, health insight correlations |
| Phase 6: Notifications | ✅ Complete | Custom quote pool, schedule profiles with weekly defaults, modes (exam/social/quiet), in-app notification queue, side menu |
| Phase 7: Polish & Optimization | ✅ Complete | Auto theme, error boundaries, storage monitoring, lazy-loaded routes (37% bundle reduction), photo lifecycle manager, app lock (PIN), install prompt, habit enforcement, starter kit, accessibility, CI/CD |
| Post-Phase Fixes | ✅ Complete | Label management CRUD, medicine frequency-aware display, medicine hides when taken, habit formation threshold (30 days/75%), fun weight loss comparisons, points earned toast, "Can't Fail" habit fallback (half credit), grocery lists with templates + shopping mode, book reading tracker |

### Future Considerations (Not Yet Built)

- Push notification server (Cloudflare Worker for scheduled notifications)
- Desktop-optimized layout
- Multi-device sync (Dexie Cloud)
- Smartwatch data import
- Companion character
- See [IDEAS.md](../5-ideas/IDEAS.md) for the full list of future feature concepts

---

*This document defines the technical architecture for ItGetsBetter. It should be read alongside the [PRD](PRD.md) which defines the product requirements. Together, they form the complete specification for implementation.*
