# The Journey as a game: design (decided 2026-10-22)

The answers from the Journey brainstorm ([JOURNEY-BRAINSTORM](JOURNEY-BRAINSTORM.md)), turned into a design. Nothing here is built yet; the build order is at the bottom and in [ROADMAP](ROADMAP.md) phase 5. The [Rulebook](../1-principles/RULEBOOK.md) still decides: optional and off by default, never punish absence, hard days make it gentler.

## The decisions

| Question | Decided |
|---|---|
| Where does the game live? | **A full-screen game mode inside the app** (option C). Same app and database; the Journey opens as its own full-screen world with its own look, and you can leave it any time. The health part of the app stays calm. |
| How does it look and feel? | **Exploring, story and battles**: a map with regions to explore, chapters told visual-novel style with the companions, and battles. (Not a cosy farming game.) |
| How do the fandoms fit in? | **A hub with portals**: your own home base in the middle, with a portal to each fandom's world (Equestria, the Devildom, South Park, the Rick and Morty multiverse). Crossovers happen at home; each world keeps its own feel. |
| How much does real life drive it? | **A mix**: real life gives the important things (energy, keys to new chapters, materials); with what you've earned you can also just play for fun. |
| Gold stakes and risk | **Kept, with the safety rules** that exist now: opt-in, stop-loss, a reserve floor, cooldowns, no decay. Nothing that works like gambling pressure; on a hard day risky choices aren't offered. |
| Graphics | **A mix, as eco-friendly as possible**: emoji and simple shapes for the interface, the companions' own pictures, free (CC0) pixel-art packs for maps, tiles and effects, and pixel art made by simple algorithms on the phone (no AI, see below). You can add your own pictures for special things. |
| Companions | **A small party**: pick 2 or 3 to come along; their traits give them a role, closeness makes them stronger. |
| Daily play time | **Your choice in Settings**: an optional daily limit, off by default. When it's reached, a companion says kindly that it's enough adventuring for today; nothing is lost by stopping. |

## Graphics without AI

Everything is made on the phone with simple, old techniques: tiny, offline, and almost no energy.

- **Pixel companions:** each companion's avatar is shrunk to a small sprite (e.g. 32 × 32) and reduced to a limited colour palette, then shown with sharp pixels (`image-rendering: pixelated`). Done once per picture and cached. Expressions (when they exist) get the same treatment.
- **Procedural sprites:** a small seeded generator (the classic "mirror half a random grid" technique used for space-shooter enemies) makes creatures, enemies, items and critters. The same seed always gives the same sprite, so nothing has to be stored.
- **Free pixel-art packs:** CC0 tile sets and effects for the hub, maps and battles, bundled with the app (only loaded in game mode). Licences noted in the repo.
- **Emoji and shapes** for the interface, as in the rest of the app.
- **Your own pictures** for bosses or places, optional; the game always works without them.

## How the parts fit together

### Real life → the game (the "mix")

| From real life | Becomes | Used for |
|---|---|---|
| Health logging (as now) | **Sparks = energy** | Playing: a battle or an exploring step costs a little energy. Energy never drains while you're away. |
| Your daily floor done | **A key** | Opens the next story chapter or a new region. Keys wait for you; there's no deadline. |
| Habits, exercise, water, sleep | **Materials and stats** | Exercise trains strength, sleep restores the party, water fills the hub's well, habits give crafting materials. |
| Quests (weekly and monthly, as now) | **Gold** | Spending in the hub, and the opt-in risky choices (with the safety rules). |
| Seeing friends (Social page) | **Guests** | A friend you saw can appear as a guest in the hub. |

### The hub (your home base)

The game mode opens here. It holds the portals, the Guild Hall rooms (moved in from today's Journey), your party picker, the quest board, the companions who are around (their closeness, visits, Lovers), collections, and the well and other things real life fills. A new world's portal opens with a key.

### Homes (added 2026-10-22)

The hub is **your home**: you upgrade it slowly (rooms, furniture, decorations) and invite companions over for activities and sleepovers (adults only). Every companion has a home in its own world (some shared, like the Obey Me brothers' House of Lamentation), and you can only visit it once you've **freed** it: discovered its region and defeated that region's boss. Travelers (companions whose world isn't in the game yet) have no home to visit and turn up in public places like an inn or café. Details: [COMPANION-SOCIETY](COMPANION-SOCIETY.md#homes-added-2026-10-22).

### Worlds behind the portals

Each world has a region map to explore, its own story chapters, encounters and a boss or two. **Equestria comes first** (today's Ponyville and Nightmare Moon move into it); the Devildom, South Park and the Citadel follow one at a time. A world's companions feel most at home there and have extra lines in their own world.

### The party

Pick 2 or 3 companions to come along. Roles come from their strongest trait: **nerdy** solves puzzles and finds weak spots, **playful** finds secrets, **caring** heals, **proud** hits hardest, **sassy** taunts enemies, **shy** sneaks, **romantic** boosts the others. Closeness makes each one stronger; Lovers get a team-up move.

### Battles

Built on the existing battle mini-game, now with the party: short, tap-timing turns, each companion's role as a special move, your real-life stats as a bonus. Losing costs nothing but the energy spent; you can always try again, and a hard day makes enemies gentler.

### Story chapters

Visual-novel scenes: the companions' (pixel) pictures, dialogue, sometimes a choice that changes closeness or the path. Each chapter opens with a key (your daily floor) and waits patiently. They use the conversation format from roadmap item 3.1, so they come after it. Written per world, with the characters' voices from the CHARACTERS files.

### The arcade: real mini games (added 2026-10-22)

The game room in your home (the hub) gets an **arcade**: small games you actually play, often together with a companion, who reacts in its own voice (cheering, teasing, sulking for a moment when it loses). Opponents play by simple rules, no AI; how well they play comes from their traits (a nerdy one is better at puzzles, a playful one takes wild risks, a proud one hates losing).

Candidates, to pick from one at a time:

| Game | With companions | Size |
|---|---|---|
| **Memory** (match pairs of companion portraits) | They cheer, or race you for pairs | S |
| **Tic-tac-toe, Connect Four** against a companion | Its difficulty from its traits; Rick is hard to beat | S |
| **Rock-paper-scissors** best of five | Each has its favourite move (and a tell) | S |
| **Fandom trivia** (questions written per fandom) | The fandom's companions host it | M (writing) |
| **Catch** (catch falling snacks, dodge the rest) | A companion throws them | S |
| **Whack-a-mole** with portraits popping up (Cartman, Discord) | They complain when hit | S |
| **Sliding puzzle** of a companion's picture | It comments as its face comes together | S |
| **Rhythm tapping** (tap on the beat) | They dance (wobble) along | M |
| **Snake, Breakout, Flappy-style** classics with companion skins | Their portrait is the ball or the snake's head | S each |
| **Card games** (Go Fish, Old Maid, snap) with 2 or 3 companions | Character reactions to every turn | M |
| **Calm games** for hard days: a fishing pond, watering a garden, colouring, bubble popping | A caring companion keeps you company | S each |

Rules:
- **Optional and short:** a round takes a minute or two. The daily play limit (if you set one) counts arcade time too.
- **No gambling mechanics:** no slot machines, loot boxes, gacha or betting in the arcade, whatever Gold rules apply elsewhere.
- **Rewards stay small:** a bit of Gold or a cosmetic, closeness with whoever played with you, a memory in the society ("Remember when you beat me at Connect Four?"). Never a streak, never a daily requirement.
- **Personal bests only:** you can see your own best score; nobody ranks you. Companions can have their own playful rivalries in the game room.
- **Hard days:** only the calm games are suggested, and companions always let it be fun.
- **Light and offline:** each game is its own small piece of code, loaded only when you open it; plain canvas or DOM, transform and opacity animations, "reduce motion" respected.

## Technical shape

- **One lazy-loaded game route** (`/journey/play` or similar): the game's code, tile sets and fonts load only when you open it, so the health app stays small and fast.
- **No heavy game engine to start:** React with Motion for the hub, maps and story, and one `<canvas>` for battles. An engine (e.g. Phaser) only if battles truly need it, and then loaded only inside battles.
- **Data:** new Dexie tables per part (worlds, keys, party, chapters progress), each with a version and an upgrade, backed up automatically. Today's Journey tables are reused where they fit (game state, affinity, quests, Guild Hall).
- **Offline, always:** everything is bundled; no downloads during play.
- Animations only on transform and opacity; "reduce motion" calms the game too.

## Rules that stay

- Opt-in, off by default; the health app never needs the game.
- Never punish absence: no decay, no "your hub fell apart", nothing expires while you're away.
- Gold risk only within the safety rules, never offered on a hard day.
- A hard day (mood 1 or 2) makes everything gentler: easier battles, kinder story choices, more healing.
- The optional daily limit ends kindly and without loss.

## Build order (replaces roadmap phase 5)

| # | Part | Size | Needs |
|---|---|---|---|
| J1 | **Game mode shell**: full-screen game route with its own look, a way out, the optional daily limit in Settings | M | Nothing |
| J2 | **The hub**: home base with the Guild Hall, quest board, companions and the Equestria portal (today's Journey moves in here) | L | J1 |
| J3 | **Pixel art tools**: pixel companions from their avatars, the procedural sprite generator, the first CC0 tile set | M | J1 |
| J4 | **Real-life links**: Sparks as energy, keys from the daily floor, materials and stats, the well, guests | M | J2 |
| J5 | **The party**: pick 2 or 3, roles from traits, strength from closeness | L | J2, J3 |
| J6 | **Battles v2** with the party | L | J5 |
| J7 | **Equestria's region map** and exploring (Ponyville, then the planned regions) | L | J2, J3, J4 |
| J8 | **Story chapters** (visual novel), Equestria first | XL | J7; the conversation format (roadmap 3.1) |
| J9 | **More worlds**, one at a time: the Devildom, South Park, the Citadel | XL each | J7, J8 |
| J10 | Collections, seasonal events | L | J2 |
| J11 | **The arcade**: real mini games in the game room, played with companions (memory, Connect Four, trivia, catch, card games, calm games for hard days), one game at a time | M each | J2 (the first simple ones could come earlier as a page of their own) |
