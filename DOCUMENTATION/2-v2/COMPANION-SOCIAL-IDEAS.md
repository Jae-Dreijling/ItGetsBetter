# Companions as people: help pages and social life (ideas, not started)

Discussed with the user on 2026-10-22. Kept here for later; the build order is in [ROADMAP](ROADMAP.md) (phase 2b). Read with [COMPANION-PLAN](COMPANION-PLAN.md) (what's built) and the [Rulebook](../1-principles/RULEBOOK.md).

The goal in the user's words: **"simulating society life"**. Each companion should feel like its own person: its own timing, its own tastes, its own reasons to come by, and you can see how you stand with it.

## How closeness works today (for reference)

Closeness is the same number the Journey uses (affinity, from -100 to 200), kept per companion (`lib/closeness.ts`).

| Level | Closeness | Shown as |
|---|---|---|
| New | below 20 | "Getting to know you" |
| Friend | 20 to 59 | "Friends" |
| Close | 60 and up | "Close" |
| Lover | chosen in the Journey (past 100) | "Lovers" |

How you get closer now:

| Moment | Closeness |
|---|---|
| Answering its three-choice question | depends on your tone and its traits: warm +3 (more for proud or shy ones), playful +2 (more for playful ones), blunt -1 (a sassy one likes it, a shy one less) |
| Telling it something to remember (memory question) | +2 |
| Doing its small request | +2 |
| A "would you rather" from its surprise | +1 |
| Saying yes to its visit | +4 |
| Giving it a gift from the shop | cookie +3, flowers +6, cake +9, plushie +15, something shiny +25 |
| Journey visits (warm / neutral / cool replies) | the Journey's own amounts; the Garden room adds +2 per visit |

App moments raise closeness to 100 at most; going further, and becoming Lovers, happens in the Journey. Closeness can go down a little (a blunt reply to a shy companion), but the app never shows that as a loss. The closer you are, the more often a companion knocks to visit, and its nickname for you changes with the level.

## The ideas

### 1. A "?" on every page

A small question mark in the corner of every page. Tapping it opens a sheet that explains what's on the page and how its logic works, in plain words: how to get closer to companions, what the levels are, how quests, points and Gold work, what the daily floor is, why the Daily Check picks what it picks.

- One shared help sheet component; each page passes its own text.
- Start with the pages that have hidden logic: Companions, Journey, Today, Habits and Tasks, Goals. Then all the others.
- Kept short and kind; no rules lists that feel like homework.

### 2. An info page per companion

Tap a companion (on the Companions page) to open its own page with everything in one place:

- its picture, name, traits and birthday;
- the closeness level, a progress bar to the next level, and the recent moments that brought you closer ("answered its question, +3", "did its request, +2");
- the last time it visited, and the last time it asked, surprised you or made a request;
- its favourites ("About me") and what you told it (its memories of you);
- what pleases it most: the reply tone it likes best, gifts it loves (see 4);
- **its chance to come by:** how likely it is to knock, which grows with closeness.

Only good news and progress are shown (Rulebook 5.2): when closeness went down a little, the page says nothing changed much, never shows a loss.

### 3. "Invite over"

A button on the companion's info page to ask it to come visit:

- The chance it says yes grows with closeness: low when you're still getting to know each other, high when you're close, nearly always for Lovers. The page can show the chance ("likely to say yes").
- A yes starts a visit like a knock does (it appears next to your companion for a while).
- A no is kind and in character ("Not today, I'm helping Twilight with the library. Ask me again soon?"), costs nothing, and you can ask again later (after a short wait, so it's not a slot machine).
- Needs new line moments for every character: `invite_yes`, `invite_no`.

### 4. Gift likes and dislikes per character

Some gifts please some characters far more than others, so gifts feel personal:

- Each character gets a short list of gifts it loves and gifts it dislikes (in the character files).
- The user's example: **a whip** is an insult to most characters, but the Obey Me demons take it as a compliment.
- A loved gift gives extra closeness and a special reaction; a disliked one gets a funny in-character reaction (and at most a tiny dip that's never shown as a loss).
- The info page hints at what it loves ("Lucifer seems to like refined things").
- Needs new gifts in the shop (a whip, books, coffee, gems, video games…) chosen so every character has a few favourites.

### 5. More social life (later)

Grows out of 2 to 4 once they exist:

- companions with a small mood and a plan for the day ("busy at the council today", "napping"), which changes whether they knock or say yes;
- remembering your last visit together ("Last time we talked about your exam. How did it go?");
- companions visiting each other, not only you.

## Rules that stay

- Optional: it all follows the companion options (visits, gifts) and "quiet today".
- Never punish absence: no "it misses you, you haven't visited in 12 days", no closeness lost to time.
- A no or a disliked gift is funny or kind, never cold, and never costs points.
- Hard days (mood 1 or 2) make everyone gentler and more likely to say yes.
