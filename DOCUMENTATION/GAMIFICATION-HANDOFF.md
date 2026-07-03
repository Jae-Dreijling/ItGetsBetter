# ItGetsBetter — Gamification Handoff Document
**Edition 1 · Living Document**

This document travels between AI models. Each AI that receives it should analyze, expand, and criticize the content, then append their findings and generate a new chain prompt for the next AI.

---

## The App — Essential Context

**ItGetsBetter** is a personal health OS — a phone-first, fully offline PWA built for one user. It tracks weight, meals, water, fasting, exercise, mood, sleep, medicine, habits, tasks, books, grocery lists, and more. All data stays on-device (IndexedDB). No accounts, no sync, no third-party data.

**The user:** A person in their twenties with ADHD and autism who has abandoned every health app they have ever tried. The primary failure mode is emotional stress causing disengagement. The app was designed from the ground up to be impossible to fail at.

**Core philosophy (from the Rulebook):**
- Never punish absence — no streaks that break, no red numbers, no guilt
- Numbers always go up in the health tracking layer
- Celebrate action, not perfection
- Warm and forgiving at every interaction

**Stack:** React 19, TypeScript, Tailwind CSS 4, Dexie.js (IndexedDB), PWA.

---

## What Is Already Built — Gamification

### Points Economy
A `pointsTransactions` table records every point earned: meal logged (+3), habit completed (+5), water goal met (+4), etc. Points are spent in a reward shop for user-defined real-world treats.

### Achievements
30+ one-time unlockable achievements with a toast notification on unlock. Triggered by threshold values (log 10 meals, lose 5kg, etc.).

### Character Sheet (Layer 1 — Permanent)

A "Character" page showing:

**Global XP Level:** `level = floor(sqrt(totalXP / 50))`
- Total lifetime points = total XP
- Level only ever increases

**6 Character Stats**, each with their own level formula `level = floor(sqrt(score))`:

| Stat | Emoji | Earns from | Score formula |
|---|---|---|---|
| Strength | 💪 | Exercise entries | `exerciseCount` |
| Vitality | 💚 | Meals + water + medicine | `floor((meals+water+meds) / 13)` |
| Clarity | 🧘 | Mood + sleep entries | `floor((mood+sleep) / 4)` |
| Discipline | 🔥 | Habit completions + tasks | `floor((habits+tasks) / 6)` |
| Endurance | ⚡ | Days with any activity | `floor(activeDays * 0.4)` |
| Wisdom | 📚 | Books finished + achievements | `books*8 + achievements*2` |

**7 Classes** derived from leading stat: Adventurer (balanced), Athlete (Strength), Nurturer (Vitality), Sage (Clarity), Guardian (Discipline), Wanderer (Endurance), Scholar (Wisdom).

All of Layer 1 is permanent. Nothing in it can decrease. It reflects lifetime engagement.

---

## The Design Problem

A "numbers only go up" system loses tension quickly. Meaningful games create meaning through: risk, scarcity, discovery, story, and mastery. Scarcity and risk were ruled out for the health tracking layer — but the user has explicitly requested that the **game layer** can have punishment. They are fine with loss, stakes, and risk — but only there, not in health tracking.

This is valid because:
1. The user is opting in knowingly
2. It's clearly game fiction, not a comment on their health
3. Loss in the game layer won't trigger the same emotional response as "you missed your habit for 3 days"

---

## The Two-Layer Architecture

### Layer 1 — Permanent (SAFE)
XP, stat levels, class identity. Only accumulates. Cannot be risked or lost. Reflects who you are as a person based on lifetime behavior.

### Layer 2 — Volatile (HAS RISK)
A separate game resource — current working name: **Gold**. It earns from health logging (maintaining the connection to real behavior), but it can be spent, wagered, and lost in optional game activities. Losing it never reflects on health stats or character levels.

**Key constraint:** The volatile resource must never be framed as a health metric. "You lost 50 Gold" is fine. "Your health is declining" is not.

---

## The Volatile Layer — Current Thinking

**Earning Gold:**
- Daily health logging awards Gold (e.g., log all meals = +10 Gold)
- Habit streaks award bonus Gold
- Completing the day's medicine = +5 Gold
- Big milestones (stat level up, achievement unlock) = Gold bonus

**Risking Gold (optional activities):**
- **Quests:** Accept a quest, stake Gold. Complete it in the window → big reward. Fail → lose the stake.
- **Boss Encounters:** A weekly optional "boss" that costs Gold to attempt. Win → large payout. Lose → Gold gone.
- **Dice Roll:** Spend Gold for a chance at more. Variable ratio reinforcement.
- **Weekly Challenge:** Bet Gold on hitting a personal target (e.g., "log mood every day this week for 3× the stake").

**At 0 Gold:** Currently undefined. Options: floor at 0 (can't bet without Gold), small daily stipend so you can always play, or a "broke" state with reduced game access.

---

## Open Questions

1. What should the volatile resource be called? Gold feels universal but possibly too trivial.
2. How punishing? Lose 10%? Lose it all?
3. What happens at 0 Gold? Floor, stipend, or consequence?
4. **ADHD risk:** Variable ratio reinforcement (gambling) is extremely motivating for ADHD brains but can also become compulsive. How do we design risk without feeding a gambling loop?
5. Should Layer 2 be opt-in? Or always present once unlocked?
6. Should the two layers live on the same page or separate screens?
7. Is Gold too disconnected from identity? Does the punishment need to feel more personal to mean something?
8. What's the right difficulty curve for quests?

---

## Expansion Ideas (Current Brainstorm)

1. **Quest system** — daily/weekly quests with Gold stakes
2. **Boss encounters** — optional weekly challenge with Gold at risk
3. **Gambling mechanic** — dice roll, card flip, variable ratio reward
4. **Stat tier names** — give level ranges character names (Novice → Developing → Established → Strong → Legendary)
5. **Conditions** — last-7-day badges that fluctuate (not permanent stats)
6. **"This is you" narrative** — auto-generated 2–3 sentences describing your class + stats
7. **Combo achievements** — cross-stat goals (e.g., Renaissance: all stats at level 5+)
8. **Class history** — track how your class evolved over months
9. **Equipment** — spend Gold on cosmetic items that change card visuals
10. **Seasonal events** — time-limited challenges

---

## AI Instructions

**You are receiving this as part of a chain analysis. Do all of the following:**

1. **CRITIQUE** — Find weaknesses, risks, and blind spots. Be specific and direct. Don't soften.
2. **RESEARCH** — What do existing health apps with gamification get right/wrong? What does RPG game design say about punishment mechanics? What does psychology say about risk/reward + ADHD?
3. **EXPAND** — Add at least 5 new concrete ideas to the expansion list. Each needs: name, how it works mechanically, why it works psychologically.
4. **ANSWER OPEN QUESTIONS** — Take a position on each. Don't hedge.
5. **APPEND YOUR ANALYSIS** — Add a clearly labeled section at the bottom (e.g., "## Analysis — AI Round 2").
6. **WRITE THE NEXT CHAIN PROMPT** — At the very end, write the exact prompt to give the next AI.

---

*Edition 1 — awaiting first AI analysis*
