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
| 1.4 | **Alone time:** drag the companion to a ✕ at the bottom; it reacts, leaves, another is picked, none pops up for 3 minutes | M | Needs a new line moment (`alone_time`) in the registry and in the character files |

## Phase 2: companions, quick wins

Mostly existing systems taken a step further. Little new data.

| # | Item | Size | Why here |
|---|---|---|---|
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
| 2b.5 | **More social life:** companions with their own small moods and plans for the day, saying when they're busy, remembering your last visit together | L | Grows out of 2b.2 and 2b.3; design it once those exist |

## Phase 3: companions, bigger systems

Each needs a new format and a lot of writing. Best after phase 2, when the smaller per-character pieces exist.

| # | Item | Size | Why here |
|---|---|---|---|
| 3.1 | **Banter per pair and longer conversations** (the brothers bickering, Kyle versus Cartman): a conversation format with turns, written per pair | L | New file format; writing grows with every pair, so start with a few favourite pairs per fandom |
| 3.2 | **Relationship depth:** conversations and backstory that unlock at Friend, Close and Lover | L | Reuses the conversation format from 3.1, so it comes after it |
| 3.3 | **Different pranks and entrances per character** (Discord's chaos, Kenny "dying", Pinkie popping out) | L | New behaviour per character, not only lines; each trick is its own little animation |
| 3.4 | **Weather and season reactions, outfits per character** | L | Weather needs a source that works offline (the season and the date work without one; real weather would need internet, so optional) |
| 3.5 | **Expression pictures** for the characters | content | The feature is built; the pictures have to be found or drawn by you. Can happen any time, alongside other work |

## Phase 4: decide the Journey

Before building anything big for the Journey, the brainstorm questions need answers (JOURNEY-BRAINSTORM, "Questions for the user"): where the game lives (A inside the app, B separate app, C a full-screen game mode), how game-like it looks, one world or one per fandom, how much real life drives it, and whether Gold stakes stay. **Size: one conversation**, then a short design doc like COMPANION-PLAN.

These small Journey items don't depend on that decision and can be done any time after phase 1:

| # | Item | Size |
|---|---|---|
| 4.1 | Adventure and Legend quest tiers (longer quests, bigger rewards) | M |
| 4.2 | Real-life links: water fills a well, sleep restores energy, exercise trains a stat, a friend you saw appears as a guest | M |
| 4.3 | More Guild Hall rooms | M |

## Phase 5: the big Journey

Built in parts, in this order, because each needs the one before.

| # | Item | Size | Depends on |
|---|---|---|---|
| 5.1 | **Region map and unlocking** (the ten planned regions) | L | Phase 4 decision |
| 5.2 | **Companions as a party:** pick who comes along, traits matter (nerdy solves puzzles, playful finds secrets, caring heals) | L | 5.1 |
| 5.3 | **Mini games**, one at a time: memory, dodge waves, tap-timing battles, then calm ones (fishing, gardening) | M each | Phase 4 decision (engine or not) |
| 5.4 | **Story chapters / adventures:** pre-written, progressed by your daily floor, waiting patiently when you're away | XL | 5.1, 5.2; also the conversation format from 3.1 |
| 5.5 | **Fandom worlds:** the Devildom, South Park, the Citadel, next to Equestria | XL | 5.1, 5.4; a lot of writing per world |
| 5.6 | **Collections and base building** (outfits, decorations, creatures, cards; a home that grows with real life) | L | 5.1 |
| 5.7 | **Seasonal chapters and events** (holidays, character birthdays) | L | 5.4 |

## Any time, on request

- **New fandoms or characters** for the CHARACTERS files (M per character: about 480 lines, 6 questions, traits, birthday research).
- **Expression pictures** (3.5), whenever you have them.

## The order in one line

Phase 1 (1.1 → 1.4) → phase 2 (2.1 → 2.7) → phase 2b (2b.1 → 2b.5) → phase 3 (3.1 → 3.4) → the Journey talk (phase 4) → phase 5 (5.1 → 5.7). Expression pictures and new characters slot in whenever they're ready.
