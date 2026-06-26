# ItGetsBetter — Future Ideas

A collection of ideas for features that are not planned for any current phase. These are creative concepts to revisit when the core app is mature and stable.

---

## Overview

| # | Idea | Usefulness | Ease of Adding |
|---|---|---|---|
| 1 | ~~Companion Mascot~~ | ✅ **Built** | Speech bubble + event messages |
| 2 | ~~Fun Weight Loss Comparisons~~ | ✅ **Built** | Shows on weight page with emoji |
| 3 | ~~Weight Comparison Achievements~~ | ✅ **Built** | 7 achievements (apple → toddler) |
| 4 | Exercise Calorie Estimation | ⭐⭐⭐ | ⭐⭐ (needs research for accuracy) |
| 5 | Meal Burn-Off Suggestions | ⭐⭐⭐ | ⭐⭐ (depends on #4) |
| 6 | ~~Points Notification~~ | ✅ **Built** | Toast shows "+X for Y" on earn |
| 7 | ~~Label Management (CRUD in settings)~~ | ✅ **Built** | Settings → Labels |
| 8 | ~~Grocery Lists (boodschappenlijstjes)~~ | ✅ **Built** | Templates + shopping mode |
| 9 | ~~Progressive Habits (auto-increasing difficulty)~~ | ✅ **Built** | Auto-advance on 75% consistency |
| 10 | ~~Habit Formation Threshold (30 days, 75% consistency)~~ | ✅ **Built** | Progress bar + enforcement |
| 11 | ~~Habit Chaining (linked sequences)~~ | ✅ **Built** | Chain creation + "Next up" flow |
| 12 | ~~Medicine Hides When Taken~~ | ✅ **Built** | Shows "All taken ✓" summary |
| 13 | ~~Book Reading Tracker~~ | ✅ **Built** | Page tracking + rating + notes |
| 14 | ~~"Can't Fail" Habit Fallback~~ | ✅ **Built** | Half credit, half points |
| 15 | ~~Companion Chat (Pattern Matching)~~ | ✅ **Built** | Long-press companion → chat |
| 16 | Companion AI (Real Conversations) | ⭐⭐⭐⭐⭐ | ⭐ (very hard — API/self-hosted/native options) |

---

## 1. Companion Mascot — ✅ BUILT

~~A cute character that lives in the app and talks to you.~~

**Implemented:** Companion system with avatar image upload and 11 event-specific message pools (general, morning greeting, welcome back, achievement, habit completed, low mood, fasting goal, streak, phone-free, points, weight loss). Multiple companions with switching. Default companion pre-loaded with built-in messages. Home screen shows speech bubble with avatar icon. Replaces the old plain-text supportive message system. Accessible from Me → Companions.

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

## 9. Progressive Habits (Auto-Increasing Difficulty) — ✅ BUILT

~~Habits that automatically increase their target over time.~~

**Implemented:** Configurable progression on any habit: start value, increment, interval (days), unit (free-text with smart time conversion — 60s → 1min), optional cap. Auto-advances when 75% consistency is met in the interval. Pause button to freeze progression. "Mastered" 👑 badge when cap is reached. Current target displayed inline on To-Do page and habit management.

---

## 10. Habit Formation Threshold — ✅ BUILT

~~Change the habit enforcement to require 30 days at 75% consistency.~~

**Implemented:** Each habit shows a progress bar (Day X/30 · Y% consistency). Bar turns green at 75%+. "Habit formed!" badge when complete. `canActivateInCategory()` blocks new habits in the same label until existing ones are formed, showing which habit is blocking and how many days remain.

---

## 11. Habit Chaining — ✅ BUILT

~~Link habits into sequences so completing one immediately prompts the next.~~

**Implemented:** Habits Management → Chains section. Select 2+ unchained habits in order to create a chain. In the To-Do view, chained habits are grouped in a bordered card with 🔗 indicator. The first uncompleted habit shows "Next up →" label. Completed chain habits dim. You can skip any step. Each habit keeps its own points, streaks, and formation tracking. Remove individual habits from a chain or delete the entire chain.

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

## 15. Companion Chat (Pattern Matching) — ✅ BUILT

~~A chat interface where you can "talk" to your companion character.~~

**Implemented:** Long-press the floating companion icon to open a chat panel (half-screen, expandable to full-screen with maximize button). Type messages and the companion responds using keyword matching against their message pools. Detects mood keywords (sad, stressed → mood_low pool), health keywords (ate, exercise → habit_completed pool), and stat queries ("how am I doing?" → live daily stats, "how many points?" → points balance, "what should I do?" → personalized suggestions based on today's data). Typing indicator with bounce animation. Chat clears on close. Companion greets you on open.

---

## 16. Companion AI (Real Conversations)

Upgrade the companion from pattern matching (#15) to actual AI-powered conversations. The companion understands context, gives real advice, and responds naturally in their configured personality.

Three possible approaches, each with different tradeoffs:

### Option A: External API (Easiest, breaks privacy)
- Connect to OpenAI, Anthropic, or similar API
- Fast, high quality, works on any phone
- **Downside:** Conversations go through third-party servers — breaks the "no third party sees my data" rule
- Could mitigate by sending only the message text, not health data — but then the AI can't reference your stats
- Cost: pay-per-use API fees

### Option B: Self-Hosted AI (Privacy-safe, medium effort)
- Run Ollama, LocalAI, or similar on your own computer/server at home
- Phone connects to YOUR server over home network or VPN
- Data stays entirely yours — no third party involved
- **Downside:** Only works when you're home (unless you set up remote access). Needs a decent computer with a GPU (or patience with CPU inference)
- Cost: electricity + hardware you already own

### Option C: On-Device Native (Best, hardest)
- Convert the PWA to a native app (React Native or similar)
- Run a small model (1-3B parameters) directly on the phone using llama.cpp or MLX
- Fully offline, fully private, no server needed
- **Downside:** Leaves the PWA architecture entirely. Requires native app development skills. Only works on newer phones with enough RAM (4GB+). Slow on older devices.
- Cost: significant development effort

### Recommendation
Start with Option B (self-hosted) as an optional feature for desktop use. Keep the pattern matching (#15) as the default for phone. Only consider Option C if the app ever moves to native.

| Usefulness | Ease of Adding |
|---|---|
| ⭐⭐⭐⭐⭐ | ⭐ (very hard — infrastructure, privacy constraints, hardware requirements) |

---

*Add new ideas here as they come up. These are seeds, not commitments.*
