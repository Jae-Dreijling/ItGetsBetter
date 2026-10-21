# Journey, game-ified big-time (brainstorm, not started)

Asked for on 2026-10-21: the user wants to expand the Journey (the optional game layer) a lot, and to consider everything from a mini game inside the app to a separate game app that connects to this one. Nothing here is decided or built; this is the starting point for the brainstorm. Read with [GAME-LAYER-DESIGN](../3-game/GAME-LAYER-DESIGN.md) (the design) and [GAME-IMPLEMENTATION](../3-game/GAME-IMPLEMENTATION.md) (what exists).

## What exists today

- Sparks (from health logging, never at risk) and Gold (quests, bosses, begging, a quiz "perform").
- Weekly and monthly quest boards tied to logging; Safe Mode per quest.
- Companion visits with Warm / Neutral / Cool replies and affinity; Lovers, joint visits; home regions.
- Roaming encounters, fortune events, undiscovered companions, bosses with a battle mini-game.
- One region (Ponyville) on an Equestria island; ten more regions planned and locked; a Guild Hall with rooms.
- Harm-reduction rules for Gold stakes (stop-loss, reserve floor, cooldowns, no decay, opt-in).
- Not built: the region map and unlocking, Adventure and Legend quest tiers, more Guild Hall rooms, new islands, seasonal chapters, more battle types.

## The big question: where does the game live?

| Option | What it means | Good | Hard |
|---|---|---|---|
| **A. Bigger game inside the app** | Grow the Journey tab: a real map, story chapters, mini games, base building | One app, one database, works offline, every log feeds the game directly, no syncing | The app gets heavier (needs lazy loading, which it already has); a game UI inside a health app must stay calm |
| **B. Separate game app** | A second Android app (its own Capacitor/web project, or a real game engine) | Free to look and feel like a game; can use a game engine (Godot, Phaser) for real graphics and animation | The two apps must share data: export/import files, a shared file in Documents, an Android content provider or deep links. More to build and keep in sync; two apps to update |
| **C. Hybrid** | The game is a separate *mode* of the same app (full-screen, its own look and engine, e.g. Phaser in a lazy-loaded page) | One install and one database, but a real game feel; the health app stays calm when you leave the game | A game engine inside the web app adds size (loaded only in the game) |

First impression: **C** gives most of B's "real game" feel without the syncing problem. B only wins if it must become something the app can't run (3D, heavy graphics).

## Seed ideas to brainstorm

- **Fandom worlds:** each character fandom gets its own island or world: Equestria (exists), the Devildom (Obey Me), South Park (the town), the multiverse / Citadel (Rick and Morty). Companions live in their home world and travel with you.
- **Companions as a party:** pick who comes along; their traits matter (a nerdy one solves puzzles, a playful one finds secrets, a caring one heals).
- **Story chapters:** pre-written adventures (step 12) you progress by doing your daily floor, never by grinding; a chapter waits patiently when you're away.
- **Mini games:** tap-timing battles, memory, dodge waves, quick-time events (some already planned), a fishing or gardening game for calm days.
- **Base building:** the Guild Hall (or a home per world) grows with what you do in real life; rooms unlock companion scenes.
- **Collections:** outfits, decorations, creatures, cards per fandom; nothing ever lost.
- **Real-life links:** water fills a well, sleep restores energy, exercise trains a stat, a friend you saw appears as a guest.
- **Seasonal chapters and events** tied to the calendar (holidays, character birthdays).

## Rules that stay (Rulebook)

- Opt-in and off by default; the health app must never need the game.
- Never punish absence: no decay, no "your village burned while you were away", no streak losses.
- Gold stakes stay inside the harm-reduction rules, or are dropped; nothing that works like gambling pressure.
- A hard day (mood 1 or 2) makes the game gentler, not harder.

## Questions for the user

1. Which option (A, B, C) feels right, or should we prototype C first?
2. How "game-like" should it look: cosy (Stardew-like), story (visual novel), action (battles), or a mix?
3. Should each fandom be its own world, or one shared world everyone visits?
4. How much should real-life logging drive the game versus playing it for fun?
5. Keep Gold stakes and risk at all?
