# ItGetsBetter — Reward Shop Design & Expansion

**Purpose:** Document the current reward shop, identify gaps, and plan improvements.  
**Status:** Planning — ideas ranked by impact and complexity.

---

## Current State

### What Exists

| Thing | Detail |
|---|---|
| `rewards` table | `name`, `description`, `point_cost`, `is_available`, `created_at` |
| `rewardClaims` table | `reward_id`, `points_spent`, `claimed_at` |
| Balance | Computed: sum of all earned points − sum of all claims |
| UI | Single page `/me/rewards` — flat list, create form, collapsible history at bottom |

### How it Works Now

1. User creates a reward with a name, optional description, and a point cost.
2. A reward can be claimed if the balance covers the cost. Claiming records a `RewardClaim` but **does not remove the reward** — so all rewards are effectively repeatable by default.
3. History is a collapsible at the bottom of the same page, showing name, date, and cost.
4. Deleting a reward is permanent (hard delete). Orphaned history entries show "Unknown reward."

### Current Gaps

- No visual hierarchy — all rewards look identical, just stacked
- No categories, no icons/emoji — everything is just text
- No distinction between "treat I can repeat forever" and "something I'm saving up for once"
- Claim history buried at the bottom, not its own screen
- No starter/suggested rewards — users start with a completely blank shop
- No way to filter, sort, or search
- Hard delete breaks history (shows "Unknown reward")
- No "I'm saving for this" goal mechanic
- No indication of which rewards you can currently afford vs. can't

---

## Entity Changes Needed

### Updated `Reward` Type

```typescript
interface Reward {
  id?: number
  name: string
  description: string | null
  point_cost: number
  icon: string | null              // emoji, e.g. "🍕"
  category: RewardCategory | null  // see below
  type: RewardType                 // 'recurring' | 'one_time' | 'limited'
  stock: number | null             // only used when type === 'limited'
  cooldown_days: number | null     // optional cooldown between claims
  url: string | null               // link to a product page, recipe, or place
  image: Blob | null               // optional uploaded photo (same compression as companion avatars)
  is_available: boolean
  is_preset: boolean               // true for built-in suggestions, false for user-created
  pinned: boolean                  // whether the reward appears first
  created_at: string
}

type RewardType = 'recurring' | 'one_time' | 'limited'

type RewardCategory =
  | 'food'
  | 'entertainment'
  | 'self_care'
  | 'rest'
  | 'shopping'
  | 'social'
  | 'custom'
```

### Updated `RewardClaim` Type

```typescript
interface RewardClaim {
  id?: number
  reward_id: number
  reward_name: string   // snapshot at claim time — survives deletion
  points_spent: number
  claimed_at: string
  note: string | null   // optional personal note ("used this after exam week")
}
```

Storing `reward_name` at claim time solves the orphan problem permanently.

### DB Migration

Schema v15:
```
rewards: '++id, is_available, category, type, is_preset'
rewardClaims: '++id, reward_id, claimed_at'
```

Migration needs to: set `type = 'recurring'`, `is_preset = false`, `pinned = false`, `icon = null`, `category = null`, `cooldown_days = null`, `stock = null` on all existing rows. Backfill `reward_name` on all existing claims by joining with `rewards` at migration time.

---

## Feature Ideas

### 1. Reward Types

Three distinct types with different behavior:

| Type | Behavior | Use case |
|---|---|---|
| **Recurring** (default) | Can be claimed unlimited times, never disappears | "Order takeout", "Gaming session", "Movie night" |
| **One-time** | Disappears from shop after first claim | "Buy a new game", "Concert ticket", "New shoes" |
| **Limited** | Has a stock count. You set it; it decrements on claim. Refillable manually | "Cheat meal ×5", "Lazy Saturday ×2 this month" |

Visually: recurring shows a `↩` refresh icon, one-time shows a star, limited shows a count badge.

---

### 2. Categories

Seven categories with emoji headers. Each category collapses/expands:

| Key | Label | Suggested emoji |
|---|---|---|
| `food` | Food & Treats | 🍕 |
| `entertainment` | Entertainment | 🎬 |
| `self_care` | Self-Care | 💆 |
| `rest` | Rest & Relaxation | 😴 |
| `shopping` | Shopping | 🛍️ |
| `social` | Social | 🤝 |
| `custom` | Other | ⭐ |

Rewards with no category go into "Other" automatically.

---

### 3. Preset Starter Rewards

Seeded into the database on first install (or via a "Load suggestions" button so they don't feel forced). Presets are identical to user rewards but have `is_preset: true` so they can be filtered separately. The user can edit, delete, or duplicate them.

Suggested presets:

Costs are tuned so nothing is claimable from a single great day — the minimum is 50 points, which takes consistent logging across multiple days to reach.

| Name | Icon | Category | Type | Cost |
|---|---|---|---|---|
| Order takeout | 🍕 | Food | Recurring | 150 |
| Bakery treat | 🧁 | Food | Recurring | 75 |
| Chocolate bar | 🍫 | Food | Recurring | 50 |
| Watch a movie | 🎬 | Entertainment | Recurring | 75 |
| Gaming session | 🎮 | Entertainment | Recurring | 60 |
| Buy a book | 📚 | Shopping | One-time | 200 |
| Long bath | 🛁 | Self-care | Recurring | 50 |
| Nap without guilt | 😴 | Rest | Recurring | 50 |
| Afternoon off | ☀️ | Rest | Recurring | 120 |
| Call a friend | 📞 | Social | Recurring | 50 |

A "Load suggestions" button in the empty-state of the shop (and in Settings → Rewards) adds any presets the user doesn't already have.

---

### 4. Claim History Page

Separate route `/me/rewards/history`. Entry point: a "History" button in the shop header.

**Layout:**
- Header: total points spent ever + number of claims
- Grouped by month (e.g., "July 2026")
- Each entry: reward icon + name, date, cost in negative red, optional note chip
- Filter bar: by reward name (dropdown), by category
- Empty state: "Nothing claimed yet — go treat yourself!"

This replaces the current collapsible at the bottom of the main shop page.

---

### 5. Shop UI Overhaul

**Current:** flat vertical list of text cards.

**New:** 2-column grid of cards with:
- Large emoji in the top-left
- Reward name (wrapping, not truncated)
- Description (optional, small text, 2 lines max)
- Cost badge (gold background, `★ 150`)
- Type badge (↩ Recurring / ⭐ One-time / ×3 Limited)
- "Claim" button — green if affordable, dimmed with "Need X more" if not
- Long-press or edit button → edit mode

**Affordability states:**
- Can afford → card is full brightness, Claim button is primary color
- Can't afford yet → card dims slightly, button says "Need 40 more ★" in muted
- Cooldown active → button says "Available in 3 days" in amber
- Out of stock → button says "Out of stock" with a restock option

---

### 6. Filter & Sort Bar

A horizontal chip bar beneath the shop header:

**Filter chips:**
- `All` / `Can afford` / `Saved for`
- Category chips: Food · Entertainment · Self-care · Rest · Shopping · Social

**Sort dropdown:**
- Cost: low → high
- Cost: high → low
- Recently claimed
- Recently added
- Pinned first (default)

---

### 7. Goal / Saving Mode

One reward at a time can be marked as your **current savings goal**. It gets pinned to the top of the shop with a special card showing:

- The reward name and icon
- Your current balance vs. cost as a progress bar
- "X more points to go!" in encouraging text
- Estimated days to reach it (based on average daily points over last 7 days)

This turns the abstract balance into a meaningful target.

---

### 8. Pin Rewards

Any reward can be pinned to always appear first in the grid, regardless of sort order. Useful for 3–4 go-to treats you claim regularly.

---

### 9. Links & Images on Rewards

Each reward can have an optional **URL** and/or an **image** to make it more concrete and personal:

**URL field:**
- A link to a product page, restaurant, webshop item, recipe, or event
- Shown as a tappable "Open link" chip on the reward card
- Useful for: "This specific pizza place", "This book on Bol.com", "This Spotify playlist as a reward"

**Image field:**
- Upload a photo from your camera roll (compressed to ~100KB, same as companion avatars)
- Shown as a thumbnail on the reward card — replaces or sits alongside the emoji icon
- Useful for: a screenshot of a product, a photo of a place, a picture of something you're saving toward
- Stored locally as a Blob in IndexedDB, never leaves the device

Both fields are entirely optional. If neither is set, the emoji icon fills the card as usual.

---

### 10. Cooldown (Self-Set)

Optional field on a reward: **cooldown in days**. After claiming, the reward shows a greyed-out state with a countdown until it's claimable again.

This is completely voluntary — it's not a punishment, just a personal rule you set for yourself (e.g., "takeout max once per week"). No automatic enforcement — just a soft reminder.

---

### 10. Claim Note

When claiming a reward, an optional text field: "What's the occasion?" Saved to the claim record. Visible in history. Adds emotional context over time ("Claimed after finishing my thesis").

---

## Implementation Priority

| Priority | Feature | Complexity | Impact |
|---|---|---|---|
| 1 | Claim history as its own page | Low | High — history is currently buried |
| 2 | Icon (emoji) + URL + image fields | Low | High — makes rewards feel concrete and personal |
| 3 | Recurring / One-time / Limited types | Medium | High — clarifies behavior users already wonder about |
| 4 | Affordability indicators (dim if can't afford) | Low | High — immediately useful |
| 5 | Preset starter rewards (min 50 pt cost) | Low | High — blank shop is intimidating |
| 6 | 2-column grid layout | Medium | Medium — visual upgrade |
| 7 | Categories + filter chips | Medium | Medium — needed once shop has 10+ rewards |
| 8 | Savings goal | Medium | High — motivating |
| 9 | Pin rewards | Low | Medium |
| 10 | Cooldown days | Low | Medium |
| 11 | Claim note | Low | Low-Medium |
| 12 | Sort bar | Low | Low (only matters with many rewards) |

---

## What NOT to Add

Per the Rulebook:

- **No expiring rewards** — rewards shouldn't disappear because you didn't claim them in time. That's punishment.
- **No seasonal / time-gated rewards** — same reason.
- **No "you must reach level X to unlock"** — rewards are not a feature gate.
- **No automatic cooldown enforcement** — the cooldown reminder is cosmetic only. You can still claim if you want to.
- **No leaderboard or comparison** — this shop is entirely personal.
