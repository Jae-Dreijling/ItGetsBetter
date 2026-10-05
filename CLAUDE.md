# ItGetsBetter

A personal, phone-first, offline health app (React + Vite + Tailwind v4 + Dexie/IndexedDB, PWA). The single user has ADHD/autism and has abandoned every health app they've tried: the app must feel safe to return to, effortless, and impossible to fail at.

## Read first

- `DOCUMENTATION/README.md`: docs index.
- `DOCUMENTATION/1-principles/RULEBOOK.md`: UX rules. Every design decision follows these.
- `DOCUMENTATION/2-v2/V2-PLAN.md`: the 2.0 plan, build order, decisions and the definition of done.

## Working rules

- **One feature at a time.** Build one step, let the user test it on their phone, and only then start the next.
- **Branch:** work on `Development`. CI (`.github/workflows/ci.yml`) runs tsc, tests, lint and build there. Finished steps merge to `main`.
- **Phone testing:** `npm run dev:phone` serves over https on the local network (self-signed certificate: accept the warning once on the phone; https is needed for the encryption API used by backups and the app lock). Never publish test builds.
- **Many features are fine, but all optional** (Rulebook 2.4): each feature can be switched off and lands as "Available". Only ~3–4 things may be in the Spotlight. Points, quests and companion messages must never require an optional feature.
- **Never punish absence** (Rulebook 5.2): no "streak broken", no counting missed days, no red overdue lists. Show what *was* done ("18 of the last 21 days").
- **Keep existing data:** every Dexie schema change needs a new `version()` with an upgrade that carries data over. Backup/restore (`src/lib/backup.ts`) covers all tables automatically; if old rows need new defaults, add a `ROW_FIXUPS` entry there too, since restored rows skip Dexie upgrades.
- **3 AM day boundary:** use `getLogicalDate()` from `src/lib/date.ts`, not the calendar date.
- **Animations:** use the presets in `src/lib/animations.ts` with Motion's `m` components (LazyMotion is strict: never `motion.div`). Only `transform`/`opacity`; "reduce motion" is handled by `MotionConfig` in `main.tsx`.

## Don'ts

- Never commit `DOCUMENTATION/7-eight-journeys/` (the user's personal health data, gitignored).
- Don't hard-code hex colours in components; use theme colours from `src/index.css` (they change per theme, see `src/lib/themes.ts`). Charts can't use CSS variables, so they get colours from `useChartColors()`. Mood and label colours are deliberately fixed.
- If you move a doc, update the code comments that point to it (`grep -rn DOCUMENTATION src`).

## Commands

```
npm run dev        # dev server
npm run dev:phone  # https dev server reachable from a phone on the same Wi-Fi
npm test           # vitest
npm run lint       # eslint
npm run build      # tsc + vite build
```

**Windows quirk:** if every test file fails with `Cannot read properties of undefined (reading 'config')` and the run header shows a lowercase `c:/` path, Vitest was started from a lowercase drive-letter working directory and loaded itself twice. Run it from `C:\Github\ItGetsBetter` (upper-case `C:`). CI is unaffected.
