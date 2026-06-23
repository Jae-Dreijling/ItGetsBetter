# ItGetsBetter — Future Ideas

A collection of ideas for features that are not planned for any current phase. These are creative concepts to revisit when the core app is mature and stable.

---

## Overview

| # | Idea | Usefulness | Ease of Adding |
|---|---|---|---|
| 1 | Companion Mascot | ⭐⭐⭐⭐ | ⭐ (very hard) |
| 2 | ~~Fun Weight Loss Comparisons~~ | ✅ **Built** | Shows on weight page with emoji |
| 3 | ~~Weight Comparison Achievements~~ | ✅ **Built** | 7 achievements (apple → toddler) |
| 4 | Exercise Calorie Estimation | ⭐⭐⭐ | ⭐⭐ (needs research for accuracy) |
| 5 | Meal Burn-Off Suggestions | ⭐⭐⭐ | ⭐⭐ (depends on #4) |
| 6 | ~~Points Notification~~ | ✅ **Built** | Toast shows "+X for Y" on earn |
| 7 | ~~Label Management (CRUD in settings)~~ | ✅ **Built** | Settings → Labels |
| 8 | ~~Grocery Lists (boodschappenlijstjes)~~ | ✅ **Built** | Templates + shopping mode |
| 9 | Progressive Habits (auto-increasing difficulty) | ⭐⭐⭐⭐⭐ | ⭐⭐ (data model changes + scheduling logic) |
| 10 | ~~Habit Formation Threshold (30 days, 75% consistency)~~ | ✅ **Built** | Progress bar + enforcement |
| 11 | Habit Chaining (linked sequences) | ⭐⭐⭐⭐ | ⭐⭐ (data model changes + UX design) |
| 12 | ~~Medicine Hides When Taken~~ | ✅ **Built** | Shows "All taken ✓" summary |
| 13 | ~~Book Reading Tracker~~ | ✅ **Built** | Page tracking + rating + notes |
| 14 | ~~"Can't Fail" Habit Fallback~~ | ✅ **Built** | Half credit, half points |

---

## 1. Companion Mascot

A cute character that lives in the app and talks to you. You can customize its personality to match your preferred tone — encouraging, sassy, gentle, tough love, etc. The mascot reacts to your progress and celebrates wins with you.

Personality examples:
- **Supportive mom:** Warm and gentle, always proud of you
- **Hype friend:** Excited about everything, over-the-top celebrations
- **Drill sergeant:** Tough love, pushes you but respects your rest days
- **Zen monk:** Calm, philosophical, focuses on the journey not the destination

---

## 2. Fun Weight Loss Comparisons — ✅ BUILT

~~When you lose weight, show relatable comparisons.~~

**Implemented:** Weight page shows a green card with emoji and comparison text when you've lost weight (e.g., "🐱 You've lost 2.3kg — that's a kitten!"). 12 comparisons from apple (0.2kg) to bicycle (20kg).

---

## 3. Weight Comparison Achievements — ✅ BUILT

~~The fun comparisons above double as unlockable achievements.~~

**Implemented:** 7 weight loss achievements already in the achievement library since Phase 4: Apple (0.2kg), Kitten (2kg), Cat (5kg), Bowling Ball (5kg), Melon (7kg), Puppy (10kg), Toddler (15kg).

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

## 6. Points Notification — ✅ BUILT

~~When you earn points, show a small celebratory notification/toast.~~

**Implemented:** Golden toast appears in the top-right corner showing "+X for Y" (e.g., "+5 logging a meal") whenever points are earned. Auto-dismisses after 2.5 seconds. Multiple toasts stack.

---

## 7. Label Management — ✅ BUILT

~~Add a dedicated settings page where you can configure, add, delete, and edit labels.~~

**Implemented:** Settings → Labels. Full CRUD with 10 color options. Labels shared across habits and tasks.

---

## 8. Grocery Lists (Boodschappenlijstjes) — ✅ BUILT

~~A grocery list feature with saved templates.~~

**Implemented:** Saved template lists with items + quantities, "Start Shopping" button to combine templates into a trip, check off while shopping, add items on the fly, reset lists. Accessible from Me → Grocery Lists and side menu.

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

## 10. Habit Formation Threshold — ✅ BUILT

~~Change the habit enforcement to require 30 days at 75% consistency.~~

**Implemented:** Each habit shows a progress bar (Day X/30 · Y% consistency). Bar turns green at 75%+. "Habit formed!" badge when complete. `canActivateInCategory()` blocks new habits in the same label until existing ones are formed, showing which habit is blocking and how many days remain.

---

## 11. Habit Chaining

Link habits into sequences so completing one immediately prompts the next:
- Example chain: "10 min walk" → "Drink a glass of water" → "5 min stretch"
- After checking off the first, the next one in the chain appears as "Next up"
- Builds routines naturally — morning routine, evening routine, post-workout routine
- A chain is just an ordered list of existing habits that trigger in sequence

Requires: a `chain_id` and `chain_order` on habits, plus UI to create/edit chains and a "Next up" prompt after completion.

---

## 12. Medicine Hides When Taken — ✅ BUILT

~~On the homepage, hide medications from the checklist once they've been taken for the day.~~

**Implemented:** Taken medicines are hidden from homepage. When all are done, shows green "All X medications taken ✓" summary. Also added frequency-aware display — "every other day" medicines only show on their scheduled days.

---

## 13. Book Reading Tracker — ✅ BUILT

~~Track books you're reading.~~

**Implemented:** Add books with title, author, total pages. Update current page with progress bar. Mark as finished with 1-5 star rating and notes. Currently reading and finished sections. Accessible from Me → Books and side menu.

---

## 14. "Can't Fail" Habit Fallback — ✅ BUILT

~~Every habit can have a configured "easy version" fallback.~~

**Implemented:** Optional "Can't fail version" field on habits. To-Do view shows amber "Can't fail: [description]" button. Completing via can't-fail earns half points (2 instead of 5) and is tracked as `is_cant_fail: true`. Counts for streaks and formation threshold. Toast shows "+2 can't fail — still counts!"

---

*Add new ideas here as they come up. These are seeds, not commitments.*
