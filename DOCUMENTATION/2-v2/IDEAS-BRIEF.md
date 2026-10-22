# Brief: companions and the Journey in ItGetsBetter (for brainstorming ideas)

*Written 2026-10-22 to share with another AI for fresh ideas. It describes what exists, what's already planned, and the rules every idea has to fit. Ideas that break a rule in "Constraints" can't be used.*

## The app in short

ItGetsBetter is a personal health app for one user, phone-first (an Android app, also a web app), fully **offline**, with all data on the phone. It covers habits, tasks, meals, water, sleep, mood, weight, goals, abstinence, social contacts and motivation. The user is neurodivergent (ADHD and autism) and has abandoned every health app before, so the app must feel **safe to come back to, effortless, and impossible to fail at**.

Two playful layers sit on top of the health app, both optional:

1. **Companions**: characters who live on the screen, react to what you do, talk, visit and build a relationship with you.
2. **The Journey**: a game layer where real-life logging earns currency, quests, visits and battles.

The user's companions are 35 characters from four fandoms: **My Little Pony** (the Mane Six, Spike, Celestia, Luna, Cadance, Discord), **Obey Me!** (the seven demon brothers, Diavolo, Luke, Simeon, Solomon), **South Park** (Cartman, Kyle, Stan, Kenny, Wendy, Bebe, Butters, Randy) and **Rick and Morty** (Rick, Morty, Summer, Beth, Jerry). Users can also make their own companions.

## Constraints (every idea must fit these)

- **No AI and no servers.** Everything is pre-written lines, rules, weighted randomness and local data. Generative AI was ruled out (cost and energy). Pixel art may be made by simple non-AI algorithms on the phone.
- **Offline and light:** it runs on a mid-range Android phone; battery and size matter.
- **Never punish absence:** no streaks that break, no "you missed X days", no decay, nothing that gets worse while you're away, no guilt. Show what *was* done.
- **Everything optional:** every feature can be switched off; only a few things are in the spotlight.
- **Hard days make things gentler:** with a mood of 1 or 2 (out of 5), companions get softer, drama and mischief stop, and support comes first.
- **Age rules:** these characters count as **minors**: the South Park kids, Morty, Summer, Luke, Spike. Minors are never romantic with the user (no Lover status, no lover lines); their closest levels are **Besties** and **Family** (they may call the user "dad", "big sib" and so on by accident). Romance *between* companions only between two adults, or two minors (then innocent only). Adults can be the user's Lovers, and the user can have several.
- **Companions are round pictures** (an avatar in a circle, with optional expression pictures), so "animations" are movement, scaling, wobbling, fading and emoji props (☕, 💤, 🎲), not bodies or limbs.
- **Don't interrupt too much:** social things on the normal screens happen often but stay short; long scenes belong in the Journey hub.

## What exists now (built)

### Companions

- **On screen:** one companion floats over the app (draggable, throwable, tappable), wanders a little, and talks in speech bubbles. One companion is "with you" per session, picked at random from the switched-on ones.
- **113 moments it reacts to:** logging (meals, water, sleep, mood, weight, exercise, medicine), habits and tasks, goals, abstinence and cravings, people you saw, wins and letters, calendar moments (Monday mornings, holidays, birthdays), app moments, game moments, reminders, and handling (picked up, thrown, tapped a lot).
- **Lines:** each of the 35 characters has about 480 to 520 pre-written lines in its own voice, 3 to 10 per moment (more for daily moments). Placeholders fill in the user's name, a nickname, the habit, the person, and so on.
- **Personality:** 7 traits (playful, proud, shy, sassy, romantic, nerdy, caring), each 0 to 2. They change how it reacts: a proud one may refuse to be carried, a shy one flinches, playful ones play pranks.
- **Personal options** per companion (Auto, On or Off): pranks, entrances, daily surprises, small requests, questions, visits, gifts.
- **Closeness** with the user: Getting to know you, Friends, Close, Lovers (adults only, made in the Journey), and for minors Besties and Family. It grows through answers, requests, visits and gifts.
- **Nicknames** for the user that change with closeness.
- **Each companion has its own clock:** it asks something, brings a surprise, makes a small request or knocks for a visit every 2 or 3 days, up to 2 of each kind a day across all companions.
- **Questions:** three-choice questions (warm, playful, blunt replies), with 6 of its own per character plus shared ones; replies change closeness depending on its traits. **Memory questions** ("What's your favourite food?"): it remembers your answer and mentions it later.
- **Daily surprises:** a fortune, a fun fact, a "would you rather", a compliment, or a tiny gift for the **gift safe**.
- **Small requests:** "Drink a glass of water with me?" (points and closeness, never a penalty).
- **Gifts** you buy for a companion with points; **accessories** (hats and seasonal items) it can wear.
- **Visits:** another companion knocks and visits for about 2.5 hours, chats, banters with yours (two-line exchanges), and cheers on big moments. On a hard day caring companions come to keep you company, up to 2 at once.
- **Pranks and entrances:** it hides a button and gives itself away with a tremble and a "pffft"; it rolls onto the screen.
- **Hard days:** soft lines, a breathing moment, "quiet today" (silent for the day), body doubling during a focus timer.
- **Feeling alive:** expression pictures per mood (optional), birthdays (the birthday companion is with you all day), rare "shiny" days, "on this day" memories, a weekly note written in its voice.
- **Alone time:** drag the companion onto an ✕ and it says goodbye in character and leaves; no companion appears for 3 minutes, then a different one comes back.
- **Companion files:** characters can be exported and imported (lines, traits, options, favourites, birthday, questions, age group, pictures); re-importing updates existing ones.

### The Journey (game layer, optional)

- **Sparks** (from health logging, never lost) and **Gold** (from quests and play).
- **Quests:** 3 weekly (Monday to Sunday) and 3 monthly, tied to logging ("Log water on 4 days this week"), with a gentler "safe mode"; they refresh by themselves.
- **Companion visits in the Journey** with warm, neutral or cool replies and affinity; confessing at high affinity makes an adult a **Lover**; joint visits from two Lovers.
- **One region** (Ponyville) on an Equestria map, with ten more planned but locked; roaming encounters, fortune events, a weekly world event, companions you haven't discovered yet.
- **A boss battle** (Nightmare Moon) with a tap mini-game.
- **The Guild Hall** with rooms built with Sparks (for example a garden that gives extra affinity per visit).
- **Gold stakes** (begging, performing a quiz, risky choices) under harm-reduction rules: opt-in, stop-loss, a reserve floor, cooldowns.

## What's planned (decided, not built yet)

### Small companion additions

- Cheers from every companion on big moments; "do this together" body doubling on a task's page; daily surprises written per character; idle animations with emoji props (Lucifer's ☕, Levi's 🎮); a real birthday celebration and the user's own birthday; memory and nicknames in the chat.
- A **"?" help sheet** on every page explaining its logic; an **info page per companion** (closeness progress, last visit, favourites, what pleases it, its chance to visit); an **"Invite over" button** (the chance of a yes grows with closeness); **gift likes and dislikes** per character (a whip insults most characters but is a compliment to the Obey Me demons).

### The companion society

- **9 personality categories** (Leader, Brainy, Energetic, Gentle, Glamorous, Chaotic, Laid-back, Caring, Fiery), each getting along with some and clashing with others, plus one personal dislike per character.
- **Relationships between companions** (best friends, friends, rivals, siblings, crushes, partners, enemies): canon relationships within a fandom; across fandoms they start as strangers and grow by meeting.
- **Social life on screen** (often, up to 3 at once) and in the **Journey hub** (up to 7, so friend groups like the Mane Six or the brothers are found together): greetings, chats, games between them (rock-paper-scissors, races), gifts between them, group activities (tea party, movie night, group nap, talent show) with roles (organiser, enthusiast, reluctant one, troublemaker).
- **Drama:** mostly light, sometimes real; it doesn't always resolve, so companions can become enemies. **Drama over the user:** two companions who are both close to you get jealous and bicker over you (romantic only between adults; with minors, sibling-style rivalry); someone close to you bickers with a companion you're on bad terms with.
- **A social feed and memories:** "Twilight visited Fluttershy", "Remember our picnic?", including things that happened while the app was closed (told as their fun, never as something you missed).
- **Plans with you:** companions invite you ("Iced coffee tomorrow around noon?", "Games tonight?"), friend groups invite you to movies or picnics, and they plan things among themselves; a calendar and a feed like a little social network. You do the activity in real life, and the app plays a short cutscene of it.
- Rare and unique interactions with a discovery collection, social milestones, weekly and seasonal events.

### The Journey as a real game

- A **full-screen game mode** inside the app with its own look.
- **A hub** (your home base) with **portals to a world per fandom**: Equestria first, then the Devildom, South Park and the Citadel. The hub's rooms (café, library, garden, game room) are where companions hang out.
- **Exploring** region maps, **story chapters** told visual-novel style with the companions, and **battles**.
- **Real life drives it:** logging gives energy, finishing your daily minimum gives keys to new chapters and regions (they never expire), habits, exercise and sleep give materials and stats, and quests give Gold.
- **A party** of 2 or 3 companions with roles from their strongest trait (caring heals, nerdy solves puzzles, playful finds secrets, proud hits hardest); closeness makes them stronger.
- An optional daily play limit (off by default); no decay; easier and kinder on hard days.
- **Graphics without AI:** companion pictures turned into pixel art on the phone, procedurally generated pixel creatures, free CC0 pixel-art packs, emoji.

## Where new ideas would help most

- **Social life:** more pair and group interactions, games between companions, group activities, and fandom-specific dynamics (what would the Obey Me brothers do together? a South Park group activity? how do Rick and Discord get along?).
- **Plans with you:** invitations, outings and cutscenes that connect to small real-life actions without pressure.
- **The Journey:** hub rooms, world-specific quests and story ideas per fandom, party abilities, battle mechanics that stay calm and short, collections.
- **Rewards that never punish**, ways to make coming back after a long break feel welcoming, and things that make hard days gentler.
- **Ways to feel alive with simple means:** movement, emoji props, timing, text.
