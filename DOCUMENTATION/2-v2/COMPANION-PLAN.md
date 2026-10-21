# Step 11: Companion content (design)

Agreed with the user on 2026-10-21. Built one part at a time, each tested on the phone. Part of [V2-PLAN](V2-PLAN.md) step 11. All lines are written ahead of time (no live AI, see V2-PLAN §6). Each character's own lines come with the content packs of step 12; until then, built-in default lines fill every trigger.

Rules that hold for every part:
- **Never punish absence** ([Rulebook 5.2](../1-principles/RULEBOOK.md)). Nobody is sad that you were away, nothing decays, a slip gets a kind line.
- **Optional and quiet:** everything can be switched off, and "quiet today" silences the companion for a day.
- **Per character:** behaviour comes from each companion's traits and closeness, so characters really differ.

## 11a: Many more triggers

- A **trigger registry** (`lib/companionTriggers.ts`): every moment the companion can react to, with a label, a group, placeholders and built-in default lines. The message editor, the coverage view (11i) and the import template are built from it.
- **Placeholders** in any line: `{name}` (you), plus per trigger values such as `{habit}`, `{person}`, `{days}`, `{goal}`, `{count}`.
- **No repeats:** the companion avoids the lines it said most recently.
- New triggers across logging, habits and tasks, goals, abstinence and cravings, social, motivation, app moments, tools and the game (full list in the registry).
- Rulebook fixes: the "overdue tasks" nudge loses the word overdue; the unused "streak milestone" category becomes "days you showed up" (a total, never a streak).

## 11b: Personality and handling

- **Traits per companion** (set in the companion editor, carried in export files): for example playful, proud or shy, clingy, calm. Content packs can set them.
- **Being picked up, dragged, thrown, tapped**: reactions per character, depending on traits and closeness. A proud character may **refuse** to be picked up and tell you off before going back to its spot; a playful one may **jump towards your finger** and get in the way for a moment. Dizzy after a hard throw, "okay okay, I'm here" after many quick taps, sleepy at night.
- **Pranks** (playful or mean characters): the companion hides something, like a button, and says nothing until you tap it; then it admits the prank.
- **Jumpscare entrances:** on opening the app or switching pages the companion is nowhere to be seen, then suddenly rolls onto the screen and settles in its spot (playful or mean characters, now and then).
- Only transform/opacity animations, and "reduce motion" calms them down. Pranks never hide anything important for long, and never during the craving flow or a hard day.

## 11c: Closeness, replies and nicknames

- **Closeness** per companion (the existing affinity, also outside the Journey).
- Now and then the companion asks something with **three replies to pick from**; the answer can raise or lower closeness a little.
- **Nicknames:** each companion picks its own nickname for you, fitting its character, and changes it as you get closer (from content packs; you don't choose it).

## 11d: Memory

- **Each companion has its own memory.** Sometimes (on Today or in the Journey) it asks a question, like "What's your favourite food?". You type the answer, it replies with its own (or a reaction), and only *that* companion remembers it, so different companions can know different things. It mentions what it knows in later lines.
- **On this day:** "A month ago today you wrote this win: …".
- **Weekly note:** a short letter about your week, from your data, in the companion's voice.

## 11e: Visits, banter and group celebrations

- **Knock knock:** now and then another companion asks (a small pop-up) if it may visit. Accepting puts it on screen next to your current companion for about 2 to 3 hours and gives closeness; declining costs nothing. It reacts in character either way (happy, or a little annoyed, before leaving). The closer you are, the more often it asks.
- **Banter:** when two companions are on screen, they now and then talk to each other.
- **Group celebrations:** big moments get cheers from everyone on screen.

## 11f: Hard days

- **Soft mode:** after a low mood, gentler lines for the rest of the day and an offer to breathe together.
- **Quiet today:** one tap, the companion stays silent for the day, no guilt.
- **Body doubling:** during a focus timer or a task, the companion keeps you company.

## 11g: Feeling alive

- **Expressions (optional):** extra pictures per companion for happy, proud, sleepy, worried, surprised. Without them, the standard picture stays.
- **Time and calendar:** Monday mornings, Friday evenings, late nights, holidays, "one year together".
- **Character birthdays:** each companion can have a birthday (looked up for the characters in the content packs). On their birthday, that companion is the one with you all day, with special lines (and something to celebrate).
- **Rare moments:** a rare "shiny" day, rare lines.

## 11h: Fun and gifts

- **Daily surprise** on the first open of the day: a fortune, a fun fact, a "would you rather", a tiny gift.
- **Gifts:** give a companion something from the reward shop and get a special reaction. Gifts you receive from companions go into a **gift safe** to look at later.
- **Accessories:** hats, frames and seasonal items for avatars, unlocked with points.
- **Small requests:** "Drink a glass of water with me?" Optional, a reward, never a penalty.
- **Seasons:** a few small themed weeks per year.

## 11j: Personality types and personal options (added 2026-10-21)

- **More traits:** romantic, nerdy and caring, next to playful, proud, shy and sassy. What a companion shares depends on them: fun facts from nerdy (or very playful) ones, "would you rather" from playful or sassy ones, compliments from caring, romantic or shy ones (romantic ones get romantic compliments), fortunes from anyone.
- **Personal options per companion:** pranks, entrances, daily surprises, small requests, questions, visiting and bringing gifts. Each is Auto (its personality decides), On or Off.
- **Prank hints:** while a button is hidden, the companion trembles now and then and lets a "pffft" slip.
- **Hard-day visits:** with a mood of 1 or 2 today, caring and romantic companions knock to keep you company (up to two a day, an hour apart), visit with soft words and leave something kind.

## Not built yet (ideas from 2026-10-21, noted for later)

Everything in 11a to 11j is built. These parts of the user's ideas are only partly there, or not yet:

- **Hard-day support from several companions at once:** today one knocks at a time (up to two a day). The idea was that several might come by.
- **Real conversations between companions:** banter is a two-line exchange from generic lines. Missing: longer exchanges, and relationships between specific characters (the Obey Me brothers bickering, Kyle versus Cartman), with lines written per pair.
- **Group celebrations with all companions:** only the visitor joins the main companion; switched-on companions that aren't on screen don't cheer.
- **Three-choice questions per character:** the 14 questions are the same for everyone. Each character should have its own questions and its own reactions to each answer.
- **Daily surprise per character:** fortunes, fun facts, "would you rather" and compliments are generic lists. Each character should share its own (Lucifer's facts about the Devildom, Twilight's library facts).
- **Memory questions in the Journey and in chat:** asked only on Today. The pattern-matching chat doesn't use memories or nicknames yet.
- **Body doubling during a task:** only during the focus timer. Idea: "do this together" on a task's page.
- **A real birthday celebration:** a companion's birthday gives a line, a 🎂 and the whole day together. Missing: something special (confetti, a cake moment, a gift for you, its friends visiting). Your own birthday isn't known by the app yet.
- **Expressions per character:** the feature exists, but no character has expression pictures yet (content to make).
- **Feeling alive extras:** idle animations, reactions to weather and season, outfits per character (accessories are emoji only), seasonal events beyond seasonal accessories, collections and decorations.
- **Relationship depth:** conversations and backstory that unlock at higher closeness (and as Lovers) were planned in V2-PLAN §5; not built.
- **Per-character prank and entrance variety:** pranks hide one button and entrances roll in; character-specific tricks (Discord's chaos, Kenny "dying") are lines only, not different behaviour.

## 11i: Tools for lines

- **Coverage view** per companion: which triggers have its own lines and which fall back to the defaults.
- **Import template** updated with every category, placeholder and trait, ready for step 12's content packs.
