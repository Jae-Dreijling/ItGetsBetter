# ItGetsBetter

A personal Health Operating System — a local-first Progressive Web App that consolidates habit tracking, meal logging, mood/sleep/weight tracking, a to-do system, and a lightweight RPG-style gamification layer into a single offline-capable app.

Built as a single-user, phone-first tool. There are no user accounts and no backend — every install is its own isolated instance of the app, and all data lives on that device.

## Access

The production build is deployed to Cloudflare Pages and sits behind **Cloudflare Access (Zero Trust)** — the deployment isn't publicly reachable, so there's no public URL to click through. This is a personal health-tracking app storing another person's private data, so the live instance is intentionally gated rather than published.

If you'd like access to the official deployment, contact **j.dreijling@outlook.com**.

The rest of this README covers what the app does and how to run your own instance from this repo.

## What it does

The app replaces 5–8 separate single-purpose apps (calorie tracker, habit tracker, to-do list, weight tracker, mood journal, fasting timer, water tracker, etc.) with one consistent, offline-first experience. Design priorities, in order: never guilt or punish the user for missed days, keep the default interaction as low-friction as possible (a tap, a photo, a name), reward the act of logging over "perfect" outcomes, and keep all data private to the device.

### Core tracking features
- **Meals** — photo or text logging, with a lightweight health score
- **Weight & measurements** — trend graphs, comparison framing instead of raw numbers
- **Mood, sleep, water, medicine, fasting** — quick-log entry points from the home screen
- **Habits, tasks, and a Pomodoro timer** — to-do system with streaks
- **Progress photos** — stored as blobs in IndexedDB, with a lifecycle/cleanup policy
- **Weekly review & insights** — aggregated trends across all tracked dimensions
- **Grocery list, books, motivation vault, timeline** — supporting features around the core loop

### Gamification layer
A companion-driven RPG layer sits on top of the tracking data: a map of "regions" unlocked through consistency, encounters/bosses tied to habit streaks, a points/rewards shop, achievements, and a customizable AI-companion personality/messaging system. This is what turns daily logging into something with forward motion instead of a static spreadsheet.

## How to use it

1. **First launch** walks through initial setup (display name, starter habits).
2. **Home screen** is the daily hub — quick-log buttons for meals, water, mood, etc., plus a weather card (opt-in, uses on-device geolocation, never a hardcoded location) and a companion message.
3. **Bottom tabs / side menu** navigate between Home, Log, Graphs, Game (map/journey), and Me (character, timeline, settings).
4. **Settings → Backup/Export** produces a portable export of all data (JSON/Excel/`.igb` backup file) since there's no server-side copy — this is also the only way to move data between devices.
5. **Settings → App Lock** enables an on-device PIN gate (SHA-256 hashed, lockout after 3 failed attempts) so the app itself can be locked independently of any deployment-level auth.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript, built with Vite |
| Routing | react-router |
| UI state | Zustand |
| Persistence | Dexie.js over IndexedDB (no backend, no network dependency for core functionality) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Offline / installable | `vite-plugin-pwa` — service worker caches the app shell, installable via "Add to Home Screen" on Android/iOS |
| Testing | Vitest + `fake-indexeddb` |
| CI | GitHub Actions — typecheck (`tsc --noEmit`), unit tests (`vitest run`), and production build on every push/PR |
| Hosting | Cloudflare Pages, gated by Cloudflare Access |

### Architecture notes
- **Local-first**: all structured data and photo blobs live in IndexedDB on the device. Nothing is synced to a server by default — see `DOCUMENTATION/ARCHITECTURE.md` for the full design rationale.
- **No accounts, no multi-tenancy**: this is intentionally single-user per install. There is no auth system beyond the optional on-device PIN lock.
- **Export is the backup strategy**: since there's no server, `src/lib/export.ts` / `src/lib/backup.ts` handle producing a full data export a user can store themselves.

## Running it locally

```bash
npm install
npm run dev       # start the Vite dev server
npm run test      # run the Vitest suite
npm run build     # typecheck + production build
```

Since the app is fully local-first, a local dev instance behaves identically to production except for hosting — no environment variables or API keys are required to run it.

## Project docs

The `DOCUMENTATION/` folder contains the original product requirements, technical architecture, gamification design, and roadmap documents this app was built against.
