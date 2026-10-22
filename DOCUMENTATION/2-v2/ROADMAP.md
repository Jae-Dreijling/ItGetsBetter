# Roadmap: every open idea, easiest first

Made on 2026-10-22 from everything still open: the requests from 2026-10-22, the companion ideas not built yet ([COMPANION-PLAN](COMPANION-PLAN.md#not-built-yet-ideas-from-2026-10-21-noted-for-later)), the rest of step 12 ([V2-PLAN](V2-PLAN.md)) and the Journey brainstorm ([JOURNEY-BRAINSTORM](JOURNEY-BRAINSTORM.md)). The working rule stays: **one item at a time**, tested on the phone before the next. Nothing here changes the Rulebook: everything optional, never punish absence, hard days make things gentler.

## How hard is it?

| Size | Means | Roughly |
|---|---|---|
| **S** | Small change in existing code, no new data | One session |
| **M** | New piece of code or a new field in companion files, some writing | One or two sessions |
| **L** | New system (new table, new screen, new file format) plus a lot of writing | A few sessions, built in parts |
| **XL** | A new part of the app, needs decisions first, built in many parts | Weeks, step by step |

What makes something hard here: a **new data model** (Dexie version, backups, import/export), **writing volume** (35 characters × lines), **pictures** (they have to be made; no AI), and for the Journey, a **game engine or new screen style**.

## Phase 1: fixes and small wishes (now)

Things already asked for. Small, and each makes the app better right away.

| # | Item | Size | Notes |
|---|---|---|---|
| 1.1 ✅ | **Journey quests refresh by themselves** on calendar weeks and months, fix the monthly end date, show how many quests you've finished | S | Built 2026-10-22, waiting for the phone test: the board fills itself on app open and Journey open (3 weekly, Monday to Sunday; 3 monthly, the whole month); finishing early doesn't bring extra quests; "🏆 N quests finished" and "✓ N done" per week and month; the Refresh button is gone |
| 1.2 ✅ | **Projects editable and removable** | S | Built 2026-10-22, waiting for the phone test: a "Projects" sheet (✏️ on a project's header, or "Projects (N)" under the tasks) lists every project, also empty ones; rename in place, remove with a second tap (tasks stay, without a project), add new ones |
| 1.3 ✅ | **Labels editable everywhere** labels appear | S–M | Built 2026-10-22, waiting for the phone test: every label picker (new task or habit, a task's or habit's page) has "✏️ Edit labels" (or "+ New label"), and the label filter row on Plan has "✏️ Edit"; both open the label editor in a sheet (add, rename, recolour, remove with a second tap). Removing a label now also takes it off habits and tasks. Sheets can open from inside other sheets |
| 1.4 ✅ | **Alone time:** drag the companion to a ✕ at the bottom; it reacts, leaves, another is picked, none pops up for 3 minutes | M | Built 2026-10-22, waiting for the phone test: the ✕ appears while dragging, the companion says goodbye in character (new `alone_time` moment, 5 lines per character in the files), fades out, and for 3 minutes nothing shows, talks or knocks (a visitor leaves too); then a different switched-on companion is back |

## Phase 2: companions, quick wins

Mostly existing systems taken a step further. Little new data.

| # | Item | Size | Why here |
|---|---|---|---|
| 2.0 ✅ | **Age groups and minors' safety** (COMPANION-SOCIETY S0): minors never become Lovers or get lover lines; their top levels are Family and Bestie; your family word in the profile | M | Built 2026-10-22, waiting for the phone test: Age (adult/minor) in the editor and companion files; minors are never Lovers (Journey, levels, lover lines, lover nicknames, romantic trait); Besties at close, Family at 90+; family word in Profile with `family_slip` lines; re-importing clears old lover data for minors; the Lover cap of 2 is gone; the ring gift is a 💎 |
| 2.1 | **Several companions on a hard day** (more than one may knock) | S | Only limits in `companionVisits` change |
| 2.2 | **Group cheers from every switched-on companion** (a small row of avatars cheering on big moments) | S–M | Builds on the existing cheer moment |
| 2.3 | **Body doubling on a task** ("do this together" on a task's page) | S–M | Reuses the focus-timer companion |
| 2.4 | **Daily surprise per character:** own fun facts, fortunes, "would you rather", compliments | M | Same pattern as the per-character questions (a field in the file + writing for 35 characters) |
| 2.5 | **Idle animations with emoji** (☕, 📖, 💤, 🎮 per character) | M | Only transform/opacity; a short prop list per character in the file |
| 2.6 | **Your own birthday + a real birthday celebration** (confetti, cake, a gift, friends visiting; also on a companion's birthday) | M | Needs your birthday in the profile |
| 2.7 | **Memory and nicknames in the chat,** memory questions in the Journey | M | Chat is pattern matching; it can look up what a companion remembers |

## Phase 2b: help pages and social life (asked 2026-10-22)

Making the logic visible, and companions feeling like people with their own lives. The full discussion, including how closeness works today, is in [COMPANION-SOCIAL-IDEAS](COMPANION-SOCIAL-IDEAS.md).

| # | Item | Size | Notes |
|---|---|---|---|
| 2b.1 | **A "?" in the corner of every page** that explains what's on it and how it works (how to get closer to companions, the closeness levels, how quests and points work…) | M | One shared help sheet; the writing per page is most of the work. Start with the pages that have hidden logic (Companions, Journey, Today, Habits), then the rest |
| 2b.2 | **An info page per companion** (tap a companion): closeness level and progress to the next one, how you got closer lately, last visit, birthday, favourites, what pleases it most, its chance to come by | M | Shows progress and good news only; closeness that went down shows as "not much changed", never as a loss (Rulebook) |
| 2b.3 | **"Invite over" button:** ask a companion to come visit; the chance it says yes grows with closeness (low as strangers, high when close). A no is kind and in character, and costs nothing; trying again is possible later | M | Needs a few new line moments (`invite_yes`, `invite_no`) for every character |
| 2b.4 | **Gift likes and dislikes per character:** some gifts please some characters much more (a whip is an insult to most, a compliment to the Obey Me demons), shown as hints on the info page | M | A field per character in the files, plus new gifts; a disliked gift gets a funny in-character reaction rather than a visible loss |
| 2b.5 | **More social life:** companions with their own small moods and plans for the day, saying when they're busy, remembering your last visit together | L | Now part of the companion society (phase 2c) |

## Phase 2c: the companion society (decided 2026-10-22)

Companions with relationships with each other, friendships that grow, group activities, drama and a social feed; mostly in the Journey hub and often on screen. Analysis and decisions: [COMPANION-SOCIETY](COMPANION-SOCIETY.md).

| # | Part | Size |
|---|---|---|
| S1 | Personality categories (9) and dislikes | S |
| S2 | Relationships between companions (canon ones from the files, strangers otherwise, growing by meeting) | M |
| S3 | Social life on screen: socially aware visitors, up to 3 on screen, arrival and departure rituals | M |
| S4 | Pair interactions: games, gifts between them, teasing, lines in three layers (replaces 3.1) | L |
| S5 | Social feed and memories | M |
| S6 | Group activities in the hub's rooms, up to 7 at once, friend groups found together (with Journey J2) | L |
| S7 | Real drama arcs (they can become enemies), romance between companions within the age rules, couples that include you, jealousy and protectiveness over you | L |
| S8 | Rare interactions, discovery collection, social milestones, weekly and seasonal events | L, ongoing |

## Phase 3: companions, bigger systems

Each needs a new format and a lot of writing. Best after phase 2, when the smaller per-character pieces exist.

| # | Item | Size | Why here |
|---|---|---|---|
| 3.1 → S4 | **Banter per pair and longer conversations** (the brothers bickering, Kyle versus Cartman): a conversation format with turns, written per pair | L | New file format; writing grows with every pair, so start with a few favourite pairs per fandom |
| 3.2 | **Relationship depth:** conversations and backstory that unlock at Friend, Close and Lover | L | Reuses the conversation format from 3.1, so it comes after it |
| 3.3 | **Different pranks and entrances per character** (Discord's chaos, Kenny "dying", Pinkie popping out) | L | New behaviour per character, not only lines; each trick is its own little animation |
| 3.4 | **Weather and season reactions, outfits per character** | L | Weather needs a source that works offline (the season and the date work without one; real weather would need internet, so optional) |
| 3.5 | **Expression pictures** for the characters | content | The feature is built; the pictures have to be found or drawn by you. Can happen any time, alongside other work |

## Phase 4: decide the Journey ✅

Decided with the user on 2026-10-22: a full-screen game mode inside the app, a hub with a portal to each fandom's world, exploring, story and battles, real life driving the important things, a small party of companions, Gold risk kept within the safety rules, an optional daily play limit, and graphics made without AI (companion pictures turned into pixel art, procedural sprites, free CC0 pixel-art packs, emoji). The full design: [JOURNEY-DESIGN](JOURNEY-DESIGN.md).

The small Journey items from before are now part of that design: real-life links (well, energy, stats, guests) are J4, more Guild Hall rooms come with the hub (J2). **Adventure and Legend quest tiers** (longer quests, bigger rewards, M) can still be done any time.

## Phase 5: the big Journey

Built in the order of [JOURNEY-DESIGN](JOURNEY-DESIGN.md#build-order-replaces-roadmap-phase-5), each part needing the one before:

| # | Part | Size |
|---|---|---|
| J1 | Game mode shell (full-screen, own look, a way out, optional daily limit) | M |
| J2 | The hub with the Guild Hall, quest board, companions and the Equestria portal | L |
| J3 | Pixel art tools: pixel companions, procedural sprites, the first CC0 tile set | M |
| J4 | Real-life links: energy, keys from the daily floor, materials and stats, the well, guests | M |
| J5 | The party: 2 or 3 companions, roles from traits | L |
| J6 | Battles v2 with the party | L |
| J7 | Equestria's region map and exploring | L |
| J8 | Story chapters (visual novel), Equestria first; needs the conversation format (3.1) | XL |
| J9 | More worlds, one at a time: the Devildom, South Park, the Citadel | XL each |
| J10 | Collections, seasonal events, calm mini-games | L |

## Any time, on request

- **New fandoms or characters** for the CHARACTERS files (M per character: about 480 lines, 6 questions, traits, birthday research).
- **Expression pictures** (3.5), whenever you have them.

## The order in one line

Phase 1 (1.1 → 1.4) ✅ → phase 2 (2.0 first, then 2.1 → 2.7) → phase 2b (2b.1 → 2b.4) → phase 2c (S1 → S5; S6 comes with the hub, S7 and S8 after) → phase 3 (3.1 → 3.4) → phase 5 (J1 → J10; the Journey talk, phase 4, is done). J1 to J7 don't need phase 3, so they can start earlier if you'd rather play sooner; only the story chapters (J8) wait for the conversation format (3.1). Expression pictures and new characters slot in whenever they're ready.
