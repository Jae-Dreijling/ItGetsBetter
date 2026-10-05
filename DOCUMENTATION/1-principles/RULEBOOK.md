# ItGetsBetter — UX Design Rulebook

**Purpose:** A timeless set of design principles that guide every interface decision in this application, regardless of which features exist today or are added in the future.

**Audience:** Anyone making design decisions for this app — now or years from now.

**Philosophy:** This app serves a user with ADHD/autism who has abandoned every health app they've tried. The primary failure mode is emotional stress causing disengagement. Every rule in this document exists to make the app feel safe to return to, effortless to use, and impossible to fail at.

---

## 1. Navigation

### 1.1 — The Four-Tab Ceiling

**Rule:** The primary navigation must never exceed four tabs. Secondary destinations live behind a menu or within parent pages.

**Reasoning:** Mobile screens have limited thumb-reach real estate. More than four tabs shrinks hit targets below comfortable tap size (44px minimum) and creates decision paralysis on every page transition. The human brain processes 3-4 options instantly; 5+ requires scanning.

**Good:** Four bottom tabs — each representing a distinct intent (view status, log something, manage routines, view self). A hamburger menu for everything else.

**Bad:** Six bottom tabs where "Graphs," "Review," and "Insights" each get their own tab. These are related and infrequently accessed — they belong behind a parent.

**Exceptions:** If user research shows a secondary feature is used more frequently than a primary tab, promote it and demote the less-used tab. Frequency determines hierarchy, not original design intent.

---

### 1.2 — One Tap to Start, Two Taps to Finish

**Rule:** The most common daily actions must be reachable within one tap from the home screen, and completable within two taps total.

**Reasoning:** Every additional tap is a decision point where the user can abandon the action. For a user with ADHD, the window between "I should log this" and "I forgot what I was doing" is measured in seconds, not minutes.

**Good:** Home screen shows a tappable water card → tap opens water page → tap a preset button → done. Two taps.

**Bad:** Home screen → Log tab → category selection → feature page → form → submit. Five taps. The user has checked Instagram by tap three.

**Exceptions:** Complex data entry (body measurements, exercise details) can exceed two taps, but the minimum viable log should still be two taps. Optional fields add depth, not steps.

**Tradeoff:** Fewer taps means more information density on the home screen, which can feel cluttered. Resolve by showing only data that changes daily — static information belongs on detail pages.

---

### 1.3 — Back Should Always Be Obvious

**Rule:** Every screen must have a clear, consistent way to return to the previous context. The user should never feel trapped.

**Reasoning:** A user who can't figure out how to go back will close the app entirely. This is especially critical on mobile where the browser back button may not exist (PWA standalone mode). Feeling trapped creates anxiety, which triggers the emotional stress → disengagement failure mode.

**Good:** A back arrow or "← Back" in the top bar on every sub-page. Bottom tabs always visible for global navigation escape.

**Bad:** A modal that covers the full screen with no close button. A nested page three levels deep where only the browser back button works.

**Exceptions:** Full-screen flows (like first-launch setup) can hide navigation, but must have a clear "next" direction and never dead-end.

---

### 1.4 — Navigation Must Communicate Location

**Rule:** The user must always know where they are in the app. The active tab, page title, and visual context must consistently indicate the current location.

**Reasoning:** Disorientation causes cognitive load. A user who opens the app from a notification or after a day away should instantly understand where they are without reading content.

**Good:** Active tab is highlighted. Page title in the top bar matches the content. Visual style (color, layout) is consistent within each section.

**Bad:** All tabs look the same. Page title says "Home" but the content shows a settings form because of a routing bug. No visual difference between "Log" and "Me" sections.

**Exceptions:** None. This rule has no valid exceptions.

---

## 2. Information Architecture

### 2.1 — Group by Human Intent, Not Data Type

**Rule:** Organize features by what the user is trying to do, not by what type of data they produce. People think in verbs ("I want to log," "I want to check"), not in nouns ("weight entry," "meal record").

**Reasoning:** A user opening the app after dinner doesn't think "I need to create a MealEntry record." They think "I just ate, I should log it." The navigation should match their mental model, not the database schema.

**Good:** A "Log" section that contains everything you can record (weight, meals, water, mood). A "Me" section for reviewing your data (graphs, achievements, photos).

**Bad:** Organizing by data domain: "Body" (weight + measurements), "Nutrition" (meals + water + fasting), "Wellness" (sleep + mood). These categories require the user to classify their intent before acting, adding cognitive load.

**Exceptions:** If the app grows to 20+ features, domain grouping may become necessary as a secondary organization layer within tabs. But the primary navigation should remain intent-based.

**Tradeoff:** Intent-based grouping can put unrelated features next to each other (weight logging next to mood logging). This feels odd to designers but natural to users — they care about the action, not the category.

---

### 2.2 — Maximum Four Items Per Decision Point

**Rule:** No screen should present more than four primary choices at any decision point. If there are more options, group them or use progressive disclosure.

**Reasoning:** Hick's Law — decision time increases logarithmically with the number of choices. Four options can be evaluated at a glance. Eight options require scanning. Twelve options cause paralysis.

**Good:** A meal slot selector with three options: Breakfast, Dinner, Snacks. Instantly scannable.

**Bad:** A single page listing every logging option as equal-weight buttons: Weight, Meals, Water, Fasting, Exercise, Mood, Sleep, Medicine, Measurements. The user pauses, scans, decides, then taps — that pause is where ADHD loses them.

**Exceptions:** Lists of user-created content (habits, tasks, grocery items) can exceed four items because the user is scanning for a specific item they created, not choosing between abstract options.

---

### 2.3 — Frequency Determines Prominence

**Rule:** The features used most often must be the most visually prominent, the easiest to reach, and the first things the eye lands on. Features used weekly or monthly should be accessible but not prominent.

**Reasoning:** Prominence should reflect actual usage patterns, not feature importance on paper. A feature that's "important" but rarely used (like weekly review) should not compete for attention with a feature used 5x daily (like water logging).

**Good:** The home screen shows daily metrics (meals, water, fasting) as large, tappable cards. Weekly review is accessible from a menu.

**Bad:** Giving equal visual weight to daily logging, weekly review, monthly measurements, and yearly insights. The user's eye has nowhere to land first.

**Exceptions:** New features may temporarily deserve extra prominence to drive discovery, but should settle into their frequency-appropriate position within a week.

---

### 2.4 — Many Features, Few Asking for Attention

**Rule:** The app may have as many features as are useful, but every feature outside the core must be optional, and only a few may ask for attention at once. Each feature has one of three attention tiers, chosen by the user:

- **Spotlight:** shown on the home screen and allowed to send notifications. Capped at about 3–4 items in total.
- **Available:** reachable through the tabs or menu when the user goes looking. Never prompts, nags or shows what wasn't done.
- **Off:** hidden everywhere (menus, notifications, companion messages). Its data is kept, never deleted.

New features arrive as Available, never straight into the Spotlight. Points, quests, achievements and companion messages must never require an optional feature.

**Reasoning:** The user didn't leave v1 because it had too many features. They left because too many things asked for attention at once, so the app felt like a wall of homework. Separating what *exists* from what *asks* lets the app grow without growing the pressure. An unused feature that stays quiet costs nothing; an unused feature that keeps showing up becomes a small daily reminder of failure.

**Good:** A social tracker that's switched to Available: it's in the menu when wanted, but sends no reminders and never appears on the home screen. A Settings → Features screen where any feature can be moved between tiers in one tap.

**Bad:** A new abstinence feature that adds a home-screen card and a daily notification the moment it ships. A quest that requires logging in the reading tracker, which the user has turned off.

**Exceptions:** The core (home screen, Daily Check, companion, settings) can't be switched off, because the app doesn't work without it. Safety-relevant prompts (e.g. a gentle note when unhealthy patterns show up) may surface regardless of tier, but only rarely and always warmly.

---

## 3. Data Entry

### 3.1 — Progressive Disclosure: Minimum First, Depth Optional

**Rule:** Every input form must have a minimum viable state that requires the fewest possible fields. Additional detail is always available but never required.

**Reasoning:** The act of logging is more valuable than the detail of what's logged. A user who logs "ate pizza" with a health score of 2 has gained awareness. A user who abandons a form because it asks for calories, macros, ingredients, and portion size has gained nothing.

**Good:** Meal logging requires only a name OR photo + health score. Calories, notes, and other fields are hidden behind "Add details (optional)."

**Bad:** A meal form that shows 8 fields at once: name, photo, calories, protein, carbs, fat, portion size, health score. The user closes the app and eats in guilt-silence.

**Exceptions:** Setup flows (like first-launch profile) can require multiple fields because they happen once and the user is motivated. But even setup should be completable in under 60 seconds.

**Tradeoff:** Hiding optional fields means some users never discover them. This is acceptable — the 90% who just need the basics should not be burdened to serve the 10% who want detail.

---

### 3.2 — Preset Over Freeform

**Rule:** When the set of likely inputs is known, offer preset buttons instead of freeform input fields. Freeform should be a fallback, not the default.

**Reasoning:** Tapping a button is cognitively cheaper than typing. A "250ml" button requires one tap. Typing "250" requires opening the keyboard, hitting three keys, and dismissing the keyboard — five actions.

**Good:** Water logging with preset buttons (250ml, 300ml, 500ml, 1L) and a "Custom" option for odd amounts.

**Bad:** Water logging with only a number input field. The user must remember their glass size, type it, and submit every time.

**Exceptions:** Free text is appropriate when the input is inherently unpredictable (meal names, mood tags, book titles). Don't force presets where they don't fit.

---

### 3.3 — Undo Must Exist for Quick-Entry Actions

**Rule:** Any action that can be performed with a single tap (especially preset buttons) must have an undo mechanism.

**Reasoning:** Speed creates errors. A user rapidly tapping water buttons will occasionally tap twice. Without undo, they must find and delete the duplicate entry, which is more friction than the original logging. The undo cost should never exceed the do cost.

**Good:** Water page has an "Undo" button that removes the last entry. Habit check-off can be unchecked with another tap.

**Bad:** A single-tap action that permanently records data with no way to reverse it except navigating to a history screen, finding the entry, and deleting it.

**Exceptions:** Destructive actions (deleting a habit, clearing data) should NOT be undoable with a single tap — they should require confirmation. Undo is for accidental additions, not accidental deletions.

---

### 3.4 — Backfill Without Guilt

**Rule:** Users must be able to log data for past dates. The interface for backfilling must be identical to the interface for logging today, except for a date picker. There must be no visual indicator that the user "missed" a day.

**Reasoning:** The user will miss days. Emotional stress, illness, vacations, and life happen. If the app makes backfilling feel like catching up on homework, it becomes a source of shame. If it makes backfilling feel like normal logging, the user fills gaps naturally.

**Good:** A date picker on every logging form, defaulting to today. Backfilled entries look identical to same-day entries in the history.

**Bad:** A "missed days" alert showing "You didn't log on June 15, 16, 17." A special "backfill mode" that feels different from normal logging. A calendar view with red squares for missed days.

**Exceptions:** None. This rule is non-negotiable. The app must never make absence feel like failure.

---

## 4. Visual Hierarchy

### 4.1 — The Eye Reads Top-Down, Then Left-Right

**Rule:** The most important information must be at the top of the screen. Within a row, the most important element must be on the left (for LTR languages). Every screen must have a clear visual starting point.

**Reasoning:** Eye-tracking research consistently shows F-pattern or Z-pattern scanning on mobile. Users glance at the top, scan left to right, then scroll. Content below the fold is seen 50-80% less than content above it.

**Good:** Supportive message at the top of the home screen (emotional grounding first), then daily metrics, then tasks. The first thing you see sets the tone.

**Bad:** A home screen that starts with settings shortcuts, shows metrics in the middle, and has the supportive message at the bottom where most users never scroll.

**Exceptions:** On pages with a clear primary action (like a logging form), the form can take precedence over informational content.

---

### 4.2 — Color Must Communicate, Not Decorate

**Rule:** Every use of color must carry meaning. If a color doesn't tell the user something they need to know, it's visual noise.

**Reasoning:** Color is the fastest visual signal the brain processes — faster than text, shape, or position. Wasting it on decoration trains the user to ignore it. When everything is colorful, nothing stands out.

**Good:** Green for success/completion (habit checked, goal met). Amber for warning/attention (overdue task, below-target). Red for danger (deletion). Coral for primary brand actions. These meanings are consistent everywhere.

**Bad:** Random colors on cards for aesthetic variety. A green card that doesn't mean "success." Using red for a non-destructive action because it "looks nice."

**Exceptions:** Label/tag colors are user-assigned and decorative by nature — they help distinguish categories, not communicate status.

**Tradeoff:** A strict color system can make the interface feel monotone. Resolve with texture (shadows, borders, rounded corners) and layout variety, not color proliferation.

---

### 4.3 — Whitespace Is Not Wasted Space

**Rule:** Elements must have breathing room. Padding inside cards, margins between sections, and line height in text must be generous. Dense layouts feel stressful.

**Reasoning:** This app serves a user who experiences cognitive overload easily. Cramped interfaces create visual anxiety — the feeling of "too much at once." Whitespace gives each element its own focus zone and reduces the perceived complexity of a page.

**Good:** Cards with 16px padding, 12px gaps between cards, 24px section margins. Each element has enough space to be tapped without accidentally hitting a neighbor.

**Bad:** A list of items with 4px gaps where the user must aim precisely to tap the right one. Cards that touch each other with no visual separation.

**Exceptions:** Compact layouts are acceptable in data-dense contexts (graphs, history lists) where the user is scanning, not interacting. But interactive elements (buttons, checkboxes) must always have generous tap targets.

---

### 4.4 — One Visual Focus Per Screen Section

**Rule:** Each section of a screen should have exactly one element that draws the eye first. If everything is bold, nothing is bold.

**Reasoning:** Visual hierarchy guides the user through content in the order that matters. Without it, the user must read everything to find what's relevant — which they won't do. They'll leave.

**Good:** A section with a small muted header ("Today"), one large number (the weight), and supporting text below (the goal). The number is the focus.

**Bad:** A section where the header, the number, and the supporting text are all the same font size and weight. The eye bounces between them with no landing point.

**Exceptions:** Dashboards with multiple equal-weight metrics (like a 2x2 grid of daily stats) are acceptable when each metric is visually self-contained within its own card.

---

## 5. Feedback & Emotional Design

### 5.1 — Celebrate Action, Not Perfection

**Rule:** The app must celebrate the act of logging, not the quality of what was logged. Logging a bad meal earns the same positive feedback as logging a good one.

**Reasoning:** If the app only celebrates "good" behavior, it implicitly punishes "bad" behavior by withholding praise. The user internalizes: "The app is happier when I eat well." This creates avoidance — they stop logging bad meals, which destroys awareness (the actual goal).

**Good:** Flat points for every meal logged, regardless of health score. "+5 for logging a meal" — no mention of the score.

**Bad:** "+10 for a 5/5 meal!" / "+2 for a 1/5 meal" / nothing for an unlogged meal. This creates unconscious score inflation and avoidance of logging bad days.

**Exceptions:** Milestone achievements (weight loss, streaks) can celebrate specific outcomes because they represent sustained effort, not single-moment perfection.

---

### 5.2 — Never Punish Absence

**Rule:** The app must never subtract, reset, display negatively, or draw attention to periods when the user didn't use it. Return must always feel warm.

**Reasoning:** The user's primary failure mode is emotional stress causing complete disengagement. When they return, the app's response determines whether they stay. A "You missed 5 days!" message triggers shame. A "Welcome back, I missed you" message triggers warmth. Shame drives avoidance. Warmth drives engagement.

**Good:** Streaks displayed as "18 of the last 21 days" (focus on what was done). Welcome back message after absence. Points balance unchanged.

**Bad:** "Streak broken! 0 days." "You missed 5 days of logging." Points deducted for inactivity. Red calendar squares for missed days.

**Exceptions:** None. This rule is the most important rule in the entire document. Violating it risks permanent user loss.

---

### 5.3 — Feedback Must Be Immediate and Proportional

**Rule:** Every user action must produce visible feedback within 200ms. The feedback intensity must match the action's significance.

**Reasoning:** Delayed feedback creates uncertainty ("Did it save?"). No feedback creates anxiety ("Did my tap register?"). Disproportionate feedback creates annoyance (a full-screen celebration for drinking a glass of water).

**Good:** Tapping a habit checkbox: instant green fill + subtle scale animation. Logging a meal: button changes to "Saved" + points toast slides in. Unlocking an achievement: prominent celebration with emoji and description.

**Bad:** Tapping a button with no visual change for 500ms, then a page redirect. A loading spinner for a local database write that takes 5ms.

**Exceptions:** Intentionally delayed feedback can build anticipation for rare, significant events (like achievement unlocks). But daily actions must be instant.

---

### 5.4 — Error Messages Must Be Human, Not Technical

**Rule:** When something goes wrong, the message must explain what happened in plain language, what the user can do about it, and reassure them that their data is safe.

**Reasoning:** Technical error messages ("IndexedDB transaction aborted") create panic. The user doesn't know if they lost data. Panic triggers the emotional stress → disengagement cycle.

**Good:** "Something went wrong with [feature]. Your data is safe. Try again."

**Bad:** "Error: DexieError — TransactionInactiveError. Please clear your browser data and try again."

**Exceptions:** Debug information can be available behind a "Show details" toggle for technical users, but the default message must be human-readable.

---

## 6. Habit Formation Support

### 6.1 — The App Must Be Easier Than Not Using It

**Rule:** Every interaction must require less effort than the alternative. If logging a meal is harder than not logging it, the user will stop logging.

**Reasoning:** Behavior change research (BJ Fogg) shows that making the target behavior easier is more effective than increasing motivation. The app competes with the zero-effort option of doing nothing. It must win on effort, not willpower.

**Good:** Logging water: one tap on a preset button. Logging a meal: take a photo + tap a score. Checking a habit: one tap.

**Bad:** Logging water: open app → navigate to water → type amount → submit. Four steps to record a glass of water. The user will use a mental note instead (and forget).

**Exceptions:** Some features (progress photos, weekly review) are inherently higher-effort. These should be weekly rituals, not daily obligations.

---

### 6.2 — Reduce, Don't Add

**Rule:** When the user is struggling with consistency, the app's response must be to reduce expectations, never to add more tracking. Offer a "can't fail" version rather than a motivational push.

**Reasoning:** A user who can't manage a 30-minute walk doesn't need a pep talk — they need the option to do a 10-minute walk instead. Something is always better than nothing. The "can't fail" fallback prevents the "I failed so why bother" spiral that kills habit formation.

**Good:** A "Can't fail" button that offers a reduced version of the habit. Still counts for streaks. Still earns points (half credit).

**Bad:** A motivational notification: "You haven't walked today! Remember your goals!" This adds pressure to an already stressed user.

**Exceptions:** If the user has been consistently exceeding their targets, suggesting an increase is appropriate. But only from a position of success, never from a position of failure.

---

### 6.3 — One New Habit at a Time

**Rule:** The app must prevent the user from overcommitting by limiting how many new habits can be activated simultaneously within the same category.

**Reasoning:** Enthusiasm leads to overcommitment. A user who activates 8 habits on day one will fail at most of them by day three, triggering shame and abandonment. Gating new habits behind a formation threshold (30 days, 75% consistency) forces sustainable pacing.

**Good:** "You can't add a new exercise habit yet — 'Daily walk' needs 12 more days (78% consistency). You're on track!"

**Bad:** Unlimited habit creation. The user creates 12 habits, completes 3, sees "3 of 12 done" and feels like a failure.

**Exceptions:** Different categories (health vs. school vs. exercise) don't block each other. The gate is per-category, not global.

---

## 7. Accessibility

### 7.1 — Tap Targets Must Be Thumb-Friendly

**Rule:** Every interactive element must have a minimum tap target of 44x44 CSS pixels, with at least 8px spacing between adjacent targets.

**Reasoning:** Mobile users interact with thumbs, which are imprecise. Small targets cause mis-taps, which cause frustration, which causes app abandonment. This is especially important for a user with motor control variations.

**Good:** Buttons with padding that creates a 48px touch area. Checkboxes with a 24px visual size but a 44px tap area.

**Bad:** A 16px icon with no padding that must be tapped precisely. Two action buttons 4px apart where tapping one accidentally triggers the other.

**Exceptions:** Dense data displays (graph tooltips, history timestamps) can have smaller elements if they're informational, not interactive.

---

### 7.2 — Color Must Not Be the Only Signal

**Rule:** Every piece of information communicated by color must also be communicated by shape, text, or position. A colorblind user must be able to use every feature.

**Reasoning:** 8% of males have some form of color vision deficiency. Using red/green alone to indicate status (danger/success) excludes these users. Adding text labels, icons, or patterns makes the signal redundant.

**Good:** A completed habit shows a green circle WITH a checkmark inside. Overdue tasks show red text WITH the word "Overdue."

**Bad:** A priority system that uses only color dots (green = low, yellow = medium, red = high) with no text labels.

**Exceptions:** Decorative color (label badges, chart lines) doesn't need a non-color alternative if the specific color isn't semantically meaningful.

---

### 7.3 — Text Must Be Readable Without Zooming

**Rule:** Body text must be at least 14px. Labels and secondary text can be 12px. Nothing should ever be below 10px. Line height must be at least 1.4x the font size.

**Reasoning:** Mobile screens are read at arm's length. Small text causes squinting, which causes fatigue, which reduces app usage over time. Generous text sizing is an investment in long-term engagement.

**Good:** Body text at 14-16px, headers at 18-24px, secondary text at 12px with muted color. Comfortable to read on a 6" phone screen.

**Bad:** 10px text everywhere "because it fits more on screen." The user can read it if they try, but they won't try for long.

**Exceptions:** Micro-labels on charts or dense data tables can use 10px if the information is supplementary, not primary.

---

## 8. Mobile-First Design

### 8.1 — Design for Portrait, Adapt to Landscape

**Rule:** Every layout must be designed for portrait orientation first. Landscape and desktop layouts are adaptations, not primary designs.

**Reasoning:** 94% of mobile usage is in portrait. Designing for landscape first and then cramming it into portrait creates awkward layouts. The reverse (portrait-first, landscape-adapted) works naturally because portrait is more constrained.

**Good:** Single-column card layouts that stack vertically. Charts that resize responsively. Forms that fill the width.

**Bad:** A two-column dashboard designed for desktop that becomes an unusable side-by-side layout on a narrow phone screen.

**Exceptions:** Specific features (photo comparison, graphs) can benefit from landscape orientation, but the app must remain fully usable in portrait.

---

### 8.2 — The Bottom of the Screen Is Prime Real Estate

**Rule:** The most-used navigation and actions must be at the bottom of the screen, within natural thumb reach. The top of the screen is for display, not interaction.

**Reasoning:** On modern phones (5.5"+), the top 30% of the screen is difficult to reach with one hand. The bottom 40% is the "thumb zone" — the most comfortable area for interaction. Putting navigation tabs at the bottom follows the physics of how hands hold phones.

**Good:** Bottom tab bar for primary navigation. Action buttons (like "Log") at the bottom of forms. FABs (floating action buttons) in the bottom-right.

**Bad:** A top navigation bar with small tabs that requires the user to shift their grip or use two hands.

**Exceptions:** The top bar is appropriate for page titles and back buttons — elements that are read, not frequently tapped.

---

### 8.3 — Respect System Conventions

**Rule:** Follow platform conventions (iOS and Android) for gesture behavior, status bar treatment, safe areas, and keyboard interaction. Don't fight the OS.

**Reasoning:** Users develop muscle memory from using their phone 4+ hours daily. An app that swipe-navigates in the opposite direction, ignores the notch, or doesn't handle the keyboard properly feels broken — even if it technically works.

**Good:** Respecting safe areas (notch, home indicator). Scrolling content behind a sticky header. Keyboard pushing content up, not covering it.

**Bad:** Content hidden behind the notch. Keyboard covering the submit button. Custom gestures that conflict with system gestures (like edge swipe for back).

**Exceptions:** Custom interactions (like swipe-to-complete on habits) can diverge from system conventions if they're well-signposted and don't conflict with system gestures.

---

## 9. Performance Perception

### 9.1 — Perceived Speed Matters More Than Actual Speed

**Rule:** The app must feel instant, even if operations take time. Optimistic UI updates, skeleton screens, and progressive loading all make the app feel faster than it technically is.

**Reasoning:** A 200ms operation that shows a loading spinner feels slower than a 500ms operation that shows the result immediately and confirms in the background. Users perceive speed through visual feedback, not actual execution time.

**Good:** Tapping a habit checkbox instantly shows the green check (optimistic update). The database write happens in the background. If it fails (extremely unlikely with local storage), the UI reverts.

**Bad:** Tapping a habit checkbox → 200ms spinner → green check. The spinner is unnecessary for a local write that takes 5ms.

**Exceptions:** Operations that involve network requests (backup upload, future sync) should show honest loading states because they can genuinely fail.

---

### 9.2 — Load What's Needed, Defer What's Not

**Rule:** The initial app load must include only the code needed for the home screen. All other pages must be lazy-loaded on first navigation.

**Reasoning:** A user opening the app to log a quick meal should not wait for the graph rendering library, export engine, and achievement system to load. Those features are used infrequently and can load in the background or on demand.

**Good:** Home screen loads in under 1 second. Graphs page loads its chart library when first visited. Export page loads SheetJS only when the user taps "Export."

**Bad:** A single 1.5MB JavaScript bundle that loads everything upfront, causing a 3-second blank screen on a slow phone connection.

**Exceptions:** Features used on the home screen (fasting timer, water progress) must be in the initial bundle because they render immediately.

---

## 10. Long-Term Maintainability

### 10.1 — Features Must Be Independently Removable

**Rule:** Every feature must be architecturally isolated so it can be removed, replaced, or rebuilt without affecting other features. No feature should create hard dependencies on another feature's internals.

**Reasoning:** Over years of use, some features will become irrelevant, others will need complete redesigns. If removing the mood tracker requires modifying the weight page, the architecture has failed. Isolation enables evolution.

**Good:** Feature-based folder structure where each feature has its own page, hook, and components. Shared components are generic (charts, badges) not feature-specific.

**Bad:** A "super hook" that queries weight, meals, mood, and exercise together because the home screen needs all of them. Adding a new feature requires modifying this hook.

**Exceptions:** Cross-feature insights (correlations between sleep and meal scores) inherently depend on multiple features. These should be isolated in their own module that reads from multiple sources but doesn't modify them.

---

### 10.2 — Design for the Data Model, Not the UI

**Rule:** The data model must be designed for correctness and future flexibility, not to match the current UI layout. UI can change in a day; data migrations are painful.

**Reasoning:** A UI redesign is a weekend project. A data migration across thousands of user records with photos and blobs is a week of careful work with rollback planning. Getting the data model right means the UI can evolve freely.

**Good:** Storing health scores as integers (1-5) rather than strings ("Good", "Average"). Storing dates in ISO format. Using foreign keys for relationships.

**Bad:** Storing a "display string" like "3/5 - Average" that combines the score and label. When the labels change, every record needs migration.

**Exceptions:** Denormalization (storing computed values alongside raw data) is acceptable for performance when the computation is expensive and the source data is immutable.

---

### 10.3 — Every Screen Must Answer: "What If There's No Data?"

**Rule:** Every screen must have a meaningful empty state that explains what the feature does and how to start using it. Empty states must never show a blank page, an error, or confusing placeholder UI.

**Reasoning:** A user exploring a new feature who sees a blank page doesn't know if it's broken, empty, or loading. An empty state with a message ("No books yet. Add one to start tracking!") tells them exactly what to do. Empty states are the feature's first impression — they must be welcoming.

**Good:** "No habits yet. Tap 'New Habit' to start building your routine." A clear call-to-action paired with a brief explanation.

**Bad:** A blank white page with just a header. A table with column headers but no rows. An empty graph with axes but no data.

**Exceptions:** None. Every screen must handle the empty state. This is a mandatory design consideration, not an edge case.

---

*This rulebook is a living document. Rules may be added, refined, or challenged as the app evolves and real usage data reveals what works. But the core philosophy is permanent: the app must be safe to return to, effortless to use, and impossible to fail at.*
