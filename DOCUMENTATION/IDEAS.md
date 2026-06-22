# ItGetsBetter — Future Ideas

A collection of ideas for features that are not planned for any current phase. These are creative concepts to revisit when the core app is mature and stable.

---

## Overview

| # | Idea | Usefulness | Ease of Adding |
|---|---|---|---|
| 1 | Companion Mascot | ⭐⭐⭐⭐ | ⭐ (very hard) |
| 2 | Fun Weight Loss Comparisons | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (already partially built in achievements) |
| 3 | Weight Comparison Achievements | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (already built) |
| 4 | Exercise Calorie Estimation | ⭐⭐⭐ | ⭐⭐ (needs research for accuracy) |
| 5 | Meal Burn-Off Suggestions | ⭐⭐⭐ | ⭐⭐ (depends on #4) |
| 6 | Points Notification | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ (toast component exists) |
| 7 | Label Management (CRUD in settings) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (simple CRUD page) |
| 8 | Grocery Lists (boodschappenlijstjes) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ (new feature area) |
| 9 | Progressive Habits (auto-increasing difficulty) | ⭐⭐⭐⭐⭐ | ⭐⭐ (data model changes + scheduling logic) |
| 10 | Habit Formation Threshold (30 days, 75% consistency) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ (calculation logic + UI) |
| 11 | Habit Chaining (linked sequences) | ⭐⭐⭐⭐ | ⭐⭐ (data model changes + UX design) |
| 12 | Medicine Hides When Taken | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (simple filter change) |
| 13 | Book Reading Tracker | ⭐⭐⭐ | ⭐⭐⭐ (new feature area, simple model) |
| 14 | "Can't Fail" Habit Fallback | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ (data model addition + UI) |

---

## 1. Companion Mascot

A cute character that lives in the app and talks to you. You can customize its personality to match your preferred tone — encouraging, sassy, gentle, tough love, etc. The mascot reacts to your progress and celebrates wins with you.

Personality examples:
- **Supportive mom:** Warm and gentle, always proud of you
- **Hype friend:** Excited about everything, over-the-top celebrations
- **Drill sergeant:** Tough love, pushes you but respects your rest days
- **Zen monk:** Calm, philosophical, focuses on the journey not the destination

---

## 2. Fun Weight Loss Comparisons

When you lose weight, show relatable comparisons:
- "You've lost about an apple's worth of weight!"
- "You've lost a kitten's weight!"
- "You've lost weight equal to a full grown cat!"
- "That's a bowling ball gone!"
- "You've shed a watermelon!"

These make the abstract number feel real and celebrate milestones in a fun way.

---

## 3. Weight Comparison Achievements

The fun comparisons above double as unlockable achievements:
- 🍎 **An Apple a Day** — Lost 0.2kg
- 🐱 **Kitten Gone** — Lost 2kg
- 🎳 **Strike!** — Lost 5kg (bowling ball)
- 🐈 **Cat's Away** — Lost 5kg
- 🍉 **Melon Drop** — Lost 7kg
- 🐕 **Puppy Freed** — Lost 10kg

Each achievement comes with a celebratory animation and fun description.

---

## 4. Exercise Calorie Estimation

After logging an exercise, automatically estimate how many calories were burned based on:
- Exercise type
- Duration
- Intensity (sets/reps/weight or distance)
- User's body weight

Display as: "You burned approximately 320 calories!" 

Note: estimates are inherently inaccurate. Frame it as approximate ("roughly", "around") and never use it as a precise tracking metric.

---

## 5. Meal Burn-Off Suggestions

After logging a meal, show a fire icon button that opens "ways to burn this off":
- "Walk for 35 minutes"
- "Run 2.5km"
- "15 minutes of jumping jacks"
- "Dance for 20 minutes"

This is NOT about guilt — it's about awareness and fun. The tone should be playful: "If you felt like moving, here are some options" not "You need to burn this off."

Important: this feature requires calorie estimation for meals (either manual input or AI-based), which doesn't exist yet. Consider building this after the calorie estimation feature.

---

## 6. Points Notification

When you earn points, show a small celebratory notification/toast: "+5 points for logging a meal!" or "+10 points for hitting your fasting goal!" Makes the reward system feel alive and gives instant positive feedback for good behavior.

Could animate the points counter briefly or show a small floating number that fades out.

---

## 7. Label Management

Add a dedicated settings page where you can configure, add, delete, and edit labels. Currently labels are pre-seeded (Health, Exercise, School, Work) and can only be created during habit/task creation. A proper management page would let you:
- Rename labels
- Change label colors
- Delete unused labels
- Create new labels independently

---

## 8. Grocery Lists (Boodschappenlijstjes)

A grocery list feature with saved templates:
- Create a grocery list and check off items as you shop
- Save "standard" lists — ingredients you always want to have at home
- Save recipe-specific lists — ingredients for specific meals you cook regularly
- When shopping, combine a standard list + recipe list into one shopping session
- Simple checklist UI, not a full recipe manager

Use case: "I have 3-4 saved lists for common meals I repeat. When I go shopping, I pick which ones I need this week and check things off."

---

## 9. Progressive Habits (Auto-Increasing Difficulty)

Habits that automatically increase their target over time on a configurable schedule:
- Example: "Plank" starts at 30 seconds
- After 2 weeks → 40 seconds
- After another 2 weeks → 50 seconds
- After another 2 weeks → 60 seconds
- Continues indefinitely (or until a cap)

Works for: planks, pushups, squats, running distance, meditation minutes, etc.

Requires: adding `progression_config` to the Habit entity (start value, increment, interval, unit, optional cap) and displaying the current target on the habit check-off screen.

---

## 10. Habit Formation Threshold

Change the habit enforcement to require **30 days at 75% consistency** before a habit is considered "formed" and a new one can be added in the same category.

- 30 days × 75% = must be completed on at least 23 of the last 30 days
- Shows progress: "Day 18/30 — 78% consistency — on track!"
- When the threshold is met: celebration + unlock to add a new habit in that category
- If consistency drops below 75%, the counter doesn't reset — it just pauses until you're back above

This replaces the simple "1-per-category-per-week" enforcement with a scientifically grounded approach.

---

## 11. Habit Chaining

Link habits into sequences so completing one immediately prompts the next:
- Example chain: "10 min walk" → "Drink a glass of water" → "5 min stretch"
- After checking off the first, the next one in the chain appears as "Next up"
- Builds routines naturally — morning routine, evening routine, post-workout routine
- A chain is just an ordered list of existing habits that trigger in sequence

Requires: a `chain_id` and `chain_order` on habits, plus UI to create/edit chains and a "Next up" prompt after completion.

---

## 12. Medicine Hides When Taken

On the homepage, hide medications from the checklist once they've been taken for the day. Currently they stay visible (greyed out). Hiding them reduces visual clutter and gives a cleaner "all done" feeling.

Could show a summary instead: "All 3 medications taken ✓" when everything is checked off.

---

## 13. Book Reading Tracker

Track books you're reading:
- Add a book (title, optional author, total pages)
- Log reading sessions (pages read, date)
- See progress: "Page 142 / 350 (41%)"
- Reading streak: days with at least one reading session
- Finished books list with completion date

Simple and fits the "awareness through logging" philosophy. Reading is a health-adjacent habit (mental health, routine building).

---

## 14. "Can't Fail" Habit Fallback

Every habit can have a configured "easy version" fallback:
- Main habit: "30 minute walk"
- Can't fail version: "10 minute walk"
- If you can't do the full version, tap "Can't Fail" instead of skipping entirely

The point: doing something is always better than doing nothing. On bad days, the easy version keeps the streak alive and prevents the "I failed so why bother" spiral.

Configuration: when creating/editing a habit, optionally set a "Can't fail" description. The check-off screen shows two buttons: "Done" and "Can't Fail ✓" — both count as completed for streaks and points.

---

*Add new ideas here as they come up. These are seeds, not commitments.*
