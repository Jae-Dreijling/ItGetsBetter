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

### 3a — Roaming Encounters (Mini-Bosses)
When the player opens the Journey page, there is a **1-in-6 chance** of triggering a roaming encounter — a mini-boss ambush from the current region (e.g. bandits, wild creatures, shadowy figures). The encounter interrupts the normal Journey view and takes the player to a dedicated mini-boss battle page.

- [ ] `MiniBossDefinition` type — same shape as `BossDefinition` but lighter (lower HP, simpler AI, smaller rewards)
- [ ] Mini-bosses registered per region (only encounters from unlocked regions can appear)
- [ ] Roll-on-mount logic in JourneyPage: `Math.random() < 1/6` → navigate to `/journey/encounter/:encounterId`
- [ ] Encounter page (`/journey/encounter/:encounterId`) — reuses most of BossPage layout, but:
  - No intro screen — starts immediately ("You've been ambushed!")
  - Shorter battle log format
  - On win: small Gold/Spark reward, narrative blurb, return to Journey
  - On loss: no penalty, "They scattered" flavour text, return to Journey
- [ ] Cooldown: once an encounter fires (win or lose), no new encounter for that calendar day (stored in localStorage)
- [ ] Ponyville mini-bosses to design: Timberwolves, Diamond Dog scouts, Parasprite swarm, Shadow creatures, Traveling thieves

**Design notes:** Keep encounters short (3–5 turns max via lower HP). They should feel like a surprise that breaks the routine pleasantly, not a blocker. Always escapable — a "Flee" option that ends the battle with no penalty.

---

### 3c — Fortune Events
Random weekly world event appears on the Journey page. Always gives the player a meaningful choice.

- [ ] Fortune Event data structure (title, description, type: positive/negative, choices)
- [ ] Weekly generation (one event per week, stored in DB or localStorage)
- [ ] Positive events: bonus merchant (Gold), festival (Sparks bonus), lost traveler (quest XP)
- [ ] Negative events: bandits (pay Gold or fight mini-game), harsh weather (quest timer extended), rival faction (quest costs more)
- [ ] Event UI card on Journey page with choice buttons
- [ ] Narrative outcome text after choice

### 3d — Undiscovered Companions
Companions can be assigned to a specific region and don't appear in the visit rotation until that region is unlocked.

- [ ] Companion creation flow: option to assign to a region (or randomize, or Traveler)
- [ ] Visit system respects `home_region` — only surfaces companions whose region is unlocked
- [ ] Discovery encounter: first-meeting intro exchange when a region is unlocked and a companion lives there
- [ ] Traveler companions: no fixed home, can appear anywhere

### 3e — Lover System
- [ ] Confession option appears in visit sheet when affinity ≥ 100
- [ ] Max 2 Lovers enforced
- [ ] Custom lover dialogue: user writes lines in companion page (health app side), stored in `gameCompanionAffinity.lover_dialogue`
- [ ] Dual Lover visit: when both Lovers visit the Guild Hall simultaneously, they appear together doing an activity that depends on which rooms are built
- [ ] Joint dialogue: 3-speaker scripted exchanges (pool of ~15) triggered when both Lovers are present
- [ ] "There's something I want to tell you." confession flow — skippable, no pressure

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
