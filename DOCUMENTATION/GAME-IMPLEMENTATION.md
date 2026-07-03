# ItGetsBetter — Game Layer Implementation Tracker
**Last updated: July 2026**

Tracks what has been built, what is in progress, and what comes next. Read alongside `GAME-LAYER-DESIGN.md`, which is the authoritative design reference.

---

## World Structure

Equestria is the **first island**. It contains all the sub-regions below. Later islands are separate continents reached by sailing — each is its own months-long content arc with new sub-regions, bosses, and story.

```
World Map (ocean with islands, most fogged out)
└── Island 1: Equestria  ← current focus
    ├── Ponyville          ← starting sub-region (built)
    ├── Canterlot          ← locked
    ├── Cloudsdale         ← locked
    ├── The Everfree Forest ← locked
    ├── Appleloosa         ← locked
    ├── Crystal Empire     ← locked
    ├── Manehattan         ← locked
    ├── Las Pegasus        ← locked
    ├── Griffonstone       ← locked
    ├── Dragon Lands       ← locked
    └── Mount Aris / Seaquestria ← locked
└── Island 2+: ??? (sail there after completing enough of Equestria — Tier 4)
```

Unlocking a sub-region requires:
1. Completing a set number of quests in the current region
2. Defeating the current region's boss

---

## Tier 1 — MVP ✅ Complete

Foundation everything else rests on.

- [x] Sparks currency — earned from health logging, never at risk
- [x] Gold currency — earned from quests and boss victories
- [x] Beg (2–5 Gold once/day when Gold < 50)
- [x] Perform (quiz: trivia / math / custom, 15 Gold for correct answer, 3×/day limit)
- [x] Custom questions (user-defined Q&A for the perform quiz)
- [x] Weekly quest board (max 3 active, 7-day window)
- [x] Monthly quest board (max 6 active, ~30-day window)
- [x] Quest objectives tied to health logging (exercise, meals, water, sleep, mood, weight, medicine, habits)
- [x] Safe Mode toggle per quest (half reward, zero risk)
- [x] Harm-reduction rules: stop-loss cap (20%), reserve floor, session cooldown, no decay, narrative loss text, opt-in off by default
- [x] Game activation screen (plain-language explainer before opt-in)
- [x] Sparks awarded automatically when health entries are logged (via `awardPoints` hook)

---

## Tier 2 — Core Loop ✅ Complete

Makes the loop playable end-to-end.

- [x] Companion visit system
  - Daily random visitor from the companions table
  - Warm (+5) / Neutral (0) / Cool (−5) response options
  - Affinity stored in `gameCompanionAffinity` table
  - Visitor banner on Journey page; CompanionVisitSheet bottom sheet
- [x] Affinity scale labels (Neutral → Acquaintance → Friend → … → Bestie → Lover)
- [x] Guild Hall page — build rooms with Sparks
  - Library (100 Sparks) — +10% Wisdom growth
  - Kitchen (100 Sparks) — +10% Vitality growth
  - Training Ground (150 Sparks) — +10% attack in boss battles
  - Room state stored in localStorage (permanent, never resets)
- [x] Boss battle system
  - Turn-based: Attack / Defend / Focus / Heal
  - Boss AI reads from `BossDefinition` — each boss has its own action weights, heal amount, charge multiplier, optional enrage phase
  - Boss icon support (`public/bosses/<id>.jpg`)
  - Boss quotes pool (shown as speech bubble during fight)
  - Training Ground bonus wired to player attack
  - **Nightmare Moon** (Ponyville) — tutorial boss, easy, no enrage
    - HP: 80 | Attack: 5–10 | chargeMultiplier: 1.5 | goldReward: 60
    - Icon: `public/bosses/nightmare_moon.jpg`
- [x] Journey page hub (currencies, Guild Hall nav, Boss nav, quests, companion affinities)
- [x] Routes: `/journey`, `/journey/start`, `/journey/guild`, `/journey/boss`
- [x] Sidebar + Me tab navigation to Journey

---

## Tier 3 — Depth 🔲 Not started

Adds richness once the core loop is solid. Build in any order — these are largely independent.

### 3a — Roaming Encounters ✅ Complete

When the player opens the Journey page, there is a **1-in-6 chance** of triggering a roaming encounter — a mini-boss ambush from the current region. One encounter maximum per day (localStorage cooldown).

- [x] `EncounterDefinition` type in `src/lib/encounters.ts` — lighter than BossDefinition (no heal, no enrage, 3-action AI: attack/defend/charge)
- [x] Encounters registered per region via `ENCOUNTERS` registry; `rollEncounter(region)` picks a random one
- [x] Roll-on-mount in JourneyPage: `rollEncounter()` → `navigate('/journey/encounter/:id')` if triggered
- [x] Encounter page (`/journey/encounter/:encounterId`) — starts immediately in fighting phase, no intro screen
  - Flee button always visible (no penalty)
  - On win: small Gold reward, victory narrative, return to Journey
  - On loss/flee: flavour text, return to Journey
- [x] Cooldown: `igb_encounter_date` in localStorage — one encounter fires per logical day

**Ponyville encounters** (all in `src/lib/encounters.ts`):
| ID | Name | HP | Attack | Gold | Notes |
|---|---|---|---|---|---|
| `timberwolves` | Timberwolves 🐺 | 30 | 6–12 | 12 | Fast and aggressive |
| `diamond_dog_scouts` | Diamond Dog Scouts 🐕 | 25 | 5–9 | 15 | Very defensive (45% defend) |
| `parasprite_swarm` | Parasprite Swarm 🦋 | 20 | 4–7 | 8 | Pure aggression, easiest |
| `shadow_creature` | Shadow Creature 👤 | 35 | 8–15 | 18 | High charge rate (45%), hardest |
| `traveling_bandits` | Traveling Bandits 🥷 | 28 | 7–11 | 14 | Balanced |

---

### 3b — Fortune Events ✅ Complete

A random event appears on the Journey page each week. Always gives the player exactly two choices with clear cost/reward hints. Once resolved, the card stays visible showing the outcome narrative for the rest of the week.

- [x] `FortuneEventDef` + `FortuneChoice` types in `src/lib/fortune.ts`
- [x] 6-event pool (mix of positive / negative-ish / neutral): Peculiar Cart, Harvest Festival, Lost Foal, Storm Rolling In, Toll Road, Traveling Scholar
- [x] Weekly generation via `getOrPickWeeklyEvent()` — avoids repeating last week's event; stored in `igb_fortune_week` localStorage
- [x] `resolveFortuneChoice()` — applies goldCost/goldReward/sparkReward, guards against insufficient gold
- [x] Fortune card on Journey page — amber-tinted when pending, fades to neutral when resolved; shows outcome narrative after choice
- [x] Disabled buttons with "Need X🪙" message when player can't afford a choice

### 3c — Undiscovered Companions ✅ Complete

Companions can be assigned to a home region. They only appear in the daily visit rotation when that region is unlocked. Traveler companions bypass this and visit anywhere.

- [x] Region picker in `CompanionForm` — horizontal scrollable chip row showing all 12 regions + Traveler. Locked regions show 🔒 but are still selectable (plan ahead)
- [x] `setCompanionHomeRegion(companionId, region)` in `game.ts` — creates/updates the `gameCompanionAffinity` record with the chosen region
- [x] `getCompanionHomeRegion(companionId)` — reads stored region, defaults to `'ponyville'`
- [x] `getOrPickDailyVisitor` updated — filters companions by `home_region === currentRegion || home_region === 'traveler'`; companions with no affinity record default to `'ponyville'`
- [ ] Discovery encounter (first-meeting intro) — deferred until region unlocking is implemented (Tier 3f)

### 3d — Lover System ✅ Complete
- [x] Confession button in visit sheet — appears when `affinity ≥ 100`, companion is not already a Lover, and fewer than 2 Lovers exist
- [x] Max 2 Lovers enforced — confession button hidden once cap is reached
- [x] "There's something I want to tell you…" confession flow: two choices (confess / smile and move on), fully skippable, no pressure
- [x] Acceptance: `setLoverStatus(true)` + affinity +20; decline: +0, no penalty
- [x] Lover Messages in CompanionPage — shown only when `is_lover: true`; lines stored in `gameCompanionAffinity.lover_dialogue`; used as greeting during lover visits instead of generic pool
- [x] Lover visit styling — rose-tinted sheet, "💕 Your Lover stopped by" subtitle, 💕 emoji on affinity delta
- [x] Dual Lover visit — 30% chance when 2 Lovers exist; `getOrPickDailyVisitor` returns both; visit sheet shows joint scene with room-dependent flavour text (Library / Kitchen / Training Ground / courtyard fallback)
- [x] `recordJointVisit` — marks day's visit done without changing affinity (joint visit is a bonus, not a response interaction)

### 3f — Equestria Sub-Region Map
Visual map of the island showing all sub-regions, fog of war on locked ones.

- [ ] Map page (`/journey/map`)
- [ ] Ponyville shown as current location
- [ ] Other sub-regions shown as fogged/locked nodes
- [ ] Unlock condition UI: "Complete N quests + defeat boss to unlock [region]"
- [ ] Region unlock flow: celebration moment, companion commentary
- [ ] Navigation: tapping a region navigates to its quest/boss content

### 3g — More Guild Hall Rooms
- [ ] Observatory (cost TBD) — reveals more of the unexplored map
- [ ] Garden (cost TBD) — cosmetic only
- [ ] Forge (cost TBD) — unlocks better quest equipment
- [ ] Meditation Room (cost TBD) — Clarity Layer 2 bonuses stronger
- [ ] Background companion activity per room (visual detail when Lovers visit)

---

## Tier 4 — Long Term 🔲 Future

Only after the player has been using Tier 3 for a while.

- [ ] New islands (sail from Equestria after completing enough of it)
- [ ] Seasonal chapters
- [ ] Mastery challenges
- [ ] Visual world map (ocean with island shapes, fog of war)
- [ ] Boss respawn system (5% weekly chance after defeat)
- [ ] Additional battle mini-game types (tap-timing, pattern memory, dodge wave, quick-time)

---

## Known Gaps / Future Fixes

- Quest tiers: only "Routine" implemented. Adventure and Legend tiers (with Gold stakes and partial-loss mechanics) are not yet built.
- Quest failure narrative text exists but quest failure itself isn't triggered (quests only expire or get claimed — no "failed" state for Adventure/Legend).
- Fortune Events: not built yet (Tier 3a).
- Boss respawn: not built yet (Tier 4).
- The `current_region` field on GameState is set to `'ponyville'` but never changes — region progression not yet implemented.
- Insurance mechanic (15% stake upfront, 50% refund on loss) not yet built.
