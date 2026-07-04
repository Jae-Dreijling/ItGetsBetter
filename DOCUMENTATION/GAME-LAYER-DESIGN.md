# ItGetsBetter — Game Layer Design Document
**Complete design reference · July 2026**

This document captures every design decision made for the game layer. It is the authoritative reference for when building begins. Do not build before reading this in full.

---

## What the Game Layer Is

A separate, optional RPG that sits alongside the health tracking app. It is not the health app — it is a game that *connects* to the health app. Health logging earns safe currency and builds a character that performs better in the game. The game has genuine stakes, risk, and loss, but none of that ever reflects on the user's health data, stats, or identity.

The game layer is **opt-in, off by default**, with a plain-language explainer before it can be activated.

---

## The Two-Layer Architecture

| | Layer 1 — Permanent | Layer 2 — Game |
|---|---|---|
| What it holds | XP, stats, class, achievements | Currencies, quests, map, Guild Hall, companions |
| Direction | Only increases | Can go up or down |
| Tied to | Lifetime health logging | Optional game activities |
| Can be lost? | Never | Yes, by choice |
| Reflects health? | Yes, directly | No — pure game fiction |

**Non-negotiable rule:** The game layer may never frame loss as a health comment. *"Your expedition lost Gold"* is fine. *"Your health is declining"* is not.

---

## Currencies

### Sparks
- **Source:** Health logging only (meals, water, sleep, habits, medicine, exercise)
- **Spend on:** Guild Hall upgrades, cosmetics, artifacts, permanent unlocks
- **Risk:** Zero. Cannot be wagered, spent on quests, or lost in any game activity
- Your real health effort is architecturally protected from the game layer

### Gold
- **Source:** Completing quests and defeating bosses
- **Spend on:** Quest costs, boss attempts, optional wagers, trades
- **Risk:** Can be lost in game activities

### Early Game — Earning Before Quests Exist
When first starting with nothing:
- **Begging:** Available when very low on Gold. Earns 2–5 Gold passively. No effort required.
- **Performing:** Complete a mini-quiz to earn more Gold. Question pool: app-provided math and trivia questions, plus custom questions the user adds in Game Settings. Earns meaningfully more than begging.

---

## The World

### Structure
```
World Map (ocean with islands, most fogged out)
└── Island 1: Equestria (first island, unlocked at start)
    ├── Ponyville          ← starting sub-region
    ├── Canterlot
    ├── Cloudsdale
    ├── The Everfree Forest
    ├── Appleloosa
    ├── Crystal Empire
    ├── Manehattan
    ├── Las Pegasus
    ├── Griffonstone
    ├── Dragon Lands
    └── Mount Aris / Seaquestria
└── Island 2+: ??? (sail there later, TBD)
```

The **world map** shows the ocean with island shapes. Most are fogged out. Zooming into Equestria opens the **sub-region map** with all locations visible (some locked, some unlocked).

### Unlocking Sub-Regions
To unlock a new sub-region within Equestria:
1. Complete a set number of quests in the current region
2. Defeat the current region's boss

Both are required.

### Unlocking New Islands
Completing enough of Equestria (quests + bosses) unlocks the ability to sail. Each new island is its own months-long project with its own sub-regions, bosses, and story.

---

## The Guild Hall

Your permanent home base. Grows as you play. Never resets.

- **Funded by:** Sparks only (safe — never at risk)
- **Visual:** A building that visibly grows as rooms are added
- **Minimum viable start:** 2–3 rooms is enough to feel meaningful

### Rooms (and their effects)

| Room | Bonus | Background companion activity |
|---|---|---|
| Library | Wisdom Layer 2 bonuses stronger | Companions sit reading, showing each other pages |
| Kitchen | Vitality Layer 2 bonuses stronger | One cooking, the other stealing food |
| Training Ground | Strength Layer 2 bonuses stronger | Sparring together |
| Observatory | Reveals more of the unexplored map | Both looking up at something in the sky |
| Garden | Cosmetic only | Watering plants together |
| Forge | Unlocks better quest equipment | One working, the other watching impressed |
| Meditation Room | Clarity Layer 2 bonuses stronger | Sitting quietly side by side |

Background activities between two visiting companions depend on which rooms exist. If no rooms are built yet, the default is throwing a ball back and forth.

---

## Quest System

### Structure
- **Weekly quests:** Max 3 active at once. 7-day window.
- **Monthly quests:** Max 6 active at once. ~30-day window.
- **Total max:** 9 active at any time
- **No daily quests.** This is intentional — daily quests create pressure and guilt. Weekly and monthly windows are forgiving.

### Tiers

| Tier | Frequency | Cost | Risk | Reward |
|---|---|---|---|---|
| Routine | Weekly, always available | Expedition Gold | None (Safe Mode always free) | Small Gold |
| Adventure | Weekly/monthly, rotating | More Gold | Partial loss on fail (20% cap) | Good Gold + Artifacts |
| Legend | Monthly, rare | High Gold | Up to 100% loss — explicit opt-in only | Rare Artifacts + region unlock bonus |

### Safe Mode
Every quest tier has a zero-stake variant available at all times: same objective, approximately half the reward, no Gold at risk. The game is never locked behind required risk.

### Quest Objectives
Quests draw from two pools — in-game and health-logging:

**In-game objectives:**
- Defeat a specific boss
- Reach a new sub-region
- Complete N quests in a region
- Raise a companion's affinity by a set amount
- Upgrade a Guild Hall room

**Health-logging objectives:**
- Log any exercise today
- Drink 1L of water (log water goal)
- Log a meal 3 times this week
- Log sleep 4 times this week
- Complete 5 habits this week

Health objectives never say "every day" or require unbroken streaks. They ask for a count within the window.

### Failure States
Quest failure is narrative, not arithmetic. Outcomes vary:
- Lose Gold
- The treasure disappears this cycle (returns next cycle)
- The boss escapes until next week
- A rival faction gets there first (story branch)
- *"The tide turned late — you retreat lighter, but you know their tells now."*

Never a bare "−50 Gold" notification.

---

## Boss Encounters

### Per-Region Bosses
Each sub-region has one boss. Defeating the boss is required to unlock the next region.

### Respawn
After defeat, a boss has a **5% chance of respawning each week**. Not guaranteed — but they can come back.

### Preparation (Stat-Based Bonuses)
Boss weaknesses are tied to that week's health logging. Logging gives bonuses — not logging gives no bonus (not a penalty).

| Recent logging | Battle bonus |
|---|---|
| 5+ meals logged this week | +15% HP going in |
| 3+ habits completed | One extra move available |
| Sleep logged 4+ days | Boss attack pattern is slightly slower |
| Medicine logged | Status effects reduced |

### Battle Mini-Games
Each boss is assigned one mini-game type. Players don't know which until the fight starts. All are simple implementations — no game engine required, small file size.

| Type | How it works |
|---|---|
| **Tap-timing** | Music plays, boss attacks on a beat pattern, tap to counter in rhythm. Uses existing Web Audio API. |
| **Turn-based animated** | Choose Attack / Defend / Special each turn. Boss responds. 4–6 turns. Animated hits. |
| **Pattern memory** | Boss shows a sequence of 3–5 moves. Repeat it. Gets longer each round. |
| **Dodge wave** | Projectiles move across the screen. Tap or swipe to dodge. |
| **Quick-time** | Boss winds up. A ring closes in. Tap at the right moment. |

### How Stats Affect Battles
Layer 1 stats determine what options are available and how powerful they are:

| Stat | Battle effect |
|---|---|
| 💪 Strength | Stronger attack moves available |
| 🧘 Clarity | Boss attack pattern shown a moment early (dodge hint) |
| 🔥 Discipline | Cheaper move costs |
| 💚 Vitality | More HP / a healing option available |
| 📚 Wisdom | A hidden or secret move is revealed |
| ⚡ Endurance | Battle lasts longer before fatigue penalties |

---

## Fortune Events

Random weekly world events. Both positive and negative.

**Positive examples:**
- A merchant caravan passes through → bonus Gold
- A lost traveler rewards you for directions → quest XP bonus
- Festival in the region → Sparks bonus for the week

**Negative examples:**
- Bandits on the trade route → choice: pay them (spend Gold) or fight them (mini-game, win more but risk losing more)
- Harsh weather delays the expedition → quest timer extended automatically
- A rival faction moves into the region → next quest costs more Gold

**Key rule for negative events:** Always give the player a meaningful choice. Never just "bad thing happened." The player should feel agency over the outcome.

---

## Companion NPC System

Every companion created in the health app automatically appears as an NPC in the game world.

### Affinity Scale
Each companion has a score from **-100 to 150** that shifts based on your interactions.

| Range | Status | What they do in the game |
|---|---|---|
| -100 to -75 | Arch Nemesis | Hardest optional boss encounter. Antagonistic dialogue. |
| -74 to -20 | Enemy | Optional boss encounter. Hostile but playable. |
| -19 to -1 | Stranger | Occasional passing trades. No special role. |
| 0 | Neutral | Starting point for all companions. |
| 1–10 | Acquaintance | Random visits, small talk. |
| 11–20 | Contact | Visits more often. Occasional quests. |
| 21–40 | Friend | Regular visits. Brings Gold. Helps in fights. |
| 41–60 | Close Friend | Frequent visits. Better quest rewards. |
| 61–80 | Best Friend | Very frequent. Bonus gifts. Special dialogue. |
| 81–100 | Bestie | Near-daily visits. Meaningful exchanges. |
| 100–150 | Lover | Option unlocks at 100. Cap at 150. |

### Actions That Shift Affinity

| Action | Score change |
|---|---|
| Warm dialogue choice | +5 |
| Cold / dismissive dialogue | -5 |
| Neutral dialogue | 0 |
| Accept their trade | +3 |
| Decline their trade | -2 |
| Give them a gift (spend Gold) | +8 |
| Complete a quest they gave you | +10 |
| Defeat them in battle (Enemy/Arch Nemesis) | +3 (respect) |
| Lose to them in battle | -2 (they're smug) |
| Ignore a visit without interacting | -1 |

### The Visit System

- **Trigger:** Random daily chance for each companion
- **Arrival:** A pop-up card appears. This is where interaction happens.
- **Interaction options during a visit:**
  - Dialogue choice (2–3 options)
  - Accept or decline a trade
  - Give a gift
  - Battle (if Enemy or Arch Nemesis)
  - Confession option (if affinity 100+)
- **After the visit:** The companion floats as a small icon on the map, drifting around, for 15 minutes to 5 hours.

---

## Undiscovered Companions

When you create a new companion in the health app, you can:
- **Assign them to a specific region** — they won't appear in visits until you reach that region
- **Randomize** — the app picks any undiscovered region for them

Until you reach their region, they don't exist in the visit rotation. When you explore their region, a special discovery encounter occurs: a first meeting, a short intro exchange, and they enter your world permanently.

**If all regions are already discovered** when a companion is created: they become a **Traveler** — no fixed home, can appear anywhere on the map, slightly unpredictable visit timing.

---

## The Lover System

### Rules
- Maximum **2 Lovers** at any time
- Lover status requires affinity **100+** AND an explicit confession choice — it never happens automatically
- Both a Rivals-to-Lovers arc and a Friends-to-Lovers arc are valid paths

### The Confession Moment
When a companion reaches Bestie level (affinity 100+), a special dialogue option appears during their next visit:
> *"There's something I want to tell you."*

Choosing it triggers the confession. Skipping it leaves them as a Bestie. No pressure.

### Custom Lover Dialogue
When a companion becomes a Lover, a **"Guild Hall Dialogue"** section appears in their companion page in the health app. Here the user writes custom dialogue lines — these are the lines the companion says during Guild Hall visits. The user can add, edit, and remove lines at any time.

### Dual Lover Visits
Both Lovers can visit the Guild Hall simultaneously. When they do:
- They appear together in the background doing an activity
- The activity depends on which Guild Hall rooms are built (see Guild Hall section)
- Default if no rooms: throwing a ball back and forth

### Joint Dialogue
When both Lovers are present simultaneously, a special interaction option appears (in addition to the normal individual interactions). This triggers a short scripted 3-speaker exchange — one of a pool of ~15 pre-written conversations that uses both companions' names. Randomly picked each dual visit.

---

## Starting State

### The Isekai Start
When the player first activates the game layer, they arrive in Equestria as a child with nothing. This is the "figuring things out" stage. No Gold, no Guild Hall, no quests unlocked yet. Just Ponyville and the world ahead.

- **First sub-region:** Ponyville
- **Starting Gold:** 0
- **Starting companions in the game:** The default app companion only. Every custom companion the user creates afterward enters the rotation automatically.

### Early Gold Earning
Before quests are available:
- **Begging:** Available when Gold is very low. Earns 2–5 Gold. Passive, no task required.
- **Performing:** Complete a mini-quiz. Question pool = app-provided math and trivia + any custom questions the user has added in Game Settings. Earns meaningfully more than begging.

---

## Harm-Reduction Rules

These are requirements, not suggestions. Nothing in the volatile layer ships without all of these.

1. **Stop-loss cap:** No single event can cost more than 20% of current Gold. The UI blocks bets that exceed this — not a warning, a hard limit.
2. **Reserve floor:** A minimum amount of Gold cannot be wagered or auto-spent.
3. **Session cooldown:** After 3 consecutive risk-based actions, risk activities lock for 4 hours. Non-risk activities (Safe Mode quests, Guild Hall upgrades, collecting) stay available.
4. **Insurance:** Before any wager, pay ~15% of the stake upfront. On a loss, 50% is refunded.
5. **Safe Mode:** Zero-stake variant available on every quest at all times.
6. **No decay:** Gold never expires or drains over time.
7. **Post-loss narrative:** Every loss generates a flavor text line. Never a bare "−50 Gold."
8. **Opt-in, off by default:** Layer 2 requires explicit activation with a plain-language explainer.

---

## Navigation

- Accessible from: **the sidebar** and the **Me tab**
- The floating companion occasionally nudges the player toward the game if there are active quests or upcoming events
- Health logging pages remain completely separate — calm, no game framing bleeds into them

---

## Implementation Priority

| Tier | What to build | Why |
|---|---|---|
| 1 — MVP | Currency system (Sparks + Gold), basic quest structure, Safe Mode, harm-reduction rules | Foundation everything else rests on |
| 2 — Core loop | Boss encounters + mini-games, companion visit system, affinity tracking, Guild Hall (2–3 rooms), Ponyville map | Makes the loop playable end-to-end |
| 3 — Depth | Undiscovered companions, Lover system, Fortune Events, full Equestria map, more Guild Hall rooms | Adds richness once core loop is solid |
| 4 — Long term | New islands, seasonal chapters, mastery challenges, visual world map | Only after the player has been using Tier 2 for a while |

---

*Design finalized July 2026. Build when ready.*
