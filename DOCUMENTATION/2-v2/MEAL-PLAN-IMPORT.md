# Meal plan import: format choice and spec

**Date:** 2026-10-20
**Status:** Spec agreed, importer not built yet (next meal-prep step, see [V2-PLAN](V2-PLAN.md) step 4b).
**Goal:** plan meals in another (web) app, export them, import them into ItGetsBetter's Meal prep with titles, calories, nutrition, recipes and which meal of the day (breakfast, lunch, dinner, snack) each one is.

---

## 1. Which format?

| Format | Good | Bad for this job |
|---|---|---|
| **CSV** | Opens in Excel, easy to eyeball | Flat: a recipe with 8 ingredients and 6 steps doesn't fit in a row without inventing sub-formats. Breaks on locale: Dutch Excel writes `;` separators and `12,5` decimals, so the same file means different things depending on who saved it. No way to say "unknown" vs "0". Recipes and plan need two files or duplicated recipe data in every row. |
| **Excel (.xlsx)** | Several sheets (recipes, plan), typed cells | Needs a spreadsheet library on both sides; still flat per sheet; a generated web-app export gains nothing from it. |
| **JSON** | Nested (a recipe holds its ingredients and steps; plan entries point to recipes), numbers are numbers, `null` means unknown, no locale problems, trivial for any web app to produce, easy to validate, versionable | Not meant to be edited by hand (it doesn't need to be) |

**Decision: JSON**, one `.json` file per export, with a format name and version so the importer can recognise it and the format can grow later.

## 2. What the file has to carry

Mapped onto what Meal prep already stores (`Recipe`, `MealPlanItem` in `src/types/entities.ts`) plus what the importer will add:

| Need | In the file | In ItGetsBetter |
|---|---|---|
| Title | `recipes[].name` | `Recipe.name` |
| Calories + macros, **per portion** | `recipes[].nutrition_per_portion.{kcal, protein_g, carbs_g, fat_g}` | `Recipe.kcal/protein_g/carbs_g/fat_g` |
| Extra nutrition | `fiber_g, sugar_g, salt_g` (optional) | Ignored for now, kept for later |
| Portions a recipe makes | `recipes[].servings` | `Recipe.servings` |
| Ingredients | structured `{ name, amount, unit, note }` | Turned into lines ("200 g rice") now; structured data feeds the future grocery list |
| Steps | `recipes[].steps[]` | Joined into `Recipe.steps` |
| Re-import without duplicates | `recipes[].id`: a stable id from the other app | Matched on re-import (new field on `Recipe`) |
| Which day | `plan[].date`, `YYYY-MM-DD`, local date | `MealPlanItem.date` |
| Which meal | `plan[].slot`: breakfast / lunch / dinner / snack | `MealPlanItem.meal_slot`. No clock times: it's a plan, the slot is enough (decided 2026-10-20). A `time` field in a file is ignored. |
| How much | `plan[].portions` | `MealPlanItem.portions` |
| One-off items without a recipe ("an apple") | `plan[].item` with name + nutrition instead of `recipe_id` | Becomes a small recipe so it can be ticked off as eaten |
| Daily calorie target | `settings.daily_kcal_target` (optional) | `UserProfile.daily_kcal_target`, only after asking |

### Rules that prevent the classic import bugs

- **Unknown is `null`, never `0`.** "0 g fat" and "fat unknown" are different things; the planner hides unknowns instead of showing zeros.
- **Nutrition is per portion**, never per recipe or per 100 g. The exporter does the maths.
- **Numbers are JSON numbers** with a dot (`12.5`), never strings, never `"12,5"`.
- **Energy in kcal**, not kJ. Weights in grams.
- **Dates are local** `YYYY-MM-DD`, no timezone, no ISO timestamps.
- **Every `recipe_id` in the plan must exist in `recipes`.**
- **`unit` is free text**, kept as written (no conversion): any short unit is fine (`g`, `kg`, `ml`, `l`, `tsp`, `tbsp`, `piece`, `clove`, `can`, `slice`, `pinch`...). Use one spelling per unit, singular, so the future grocery list can add amounts up.
- **`portions` is what the user eats**, not what the recipe makes. A 3-serving recipe for a household of two is `portions: 1` for the user's own share; a leftover eaten another day is its own plan entry.
- `slot` is required: breakfast, lunch, dinner or snack. Several snacks a day are fine.

## 3. The format: `itgetsbetter-meal-plan` v1

```json
{
  "format": "itgetsbetter-meal-plan",
  "version": 1,
  "source": { "app": "Name of the other app", "exported_at": "2026-10-20T18:30:00Z" },
  "range": { "from": "2026-10-26", "to": "2026-11-01" },
  "settings": { "daily_kcal_target": 2000 },
  "recipes": [
    {
      "id": "chili-sin-carne",
      "name": "Chili sin carne",
      "servings": 4,
      "nutrition_per_portion": {
        "kcal": 450, "protein_g": 25.5, "carbs_g": 52, "fat_g": 11,
        "fiber_g": 14, "sugar_g": null, "salt_g": 1.8
      },
      "ingredients": [
        { "name": "kidney beans", "amount": 400, "unit": "g", "note": "drained" },
        { "name": "onion", "amount": 1, "unit": "piece", "note": null }
      ],
      "steps": ["Fry the onion.", "Add the beans and simmer 20 minutes."],
      "prep_minutes": 30,
      "tags": ["meal prep", "freezer"]
    }
  ],
  "plan": [
    { "date": "2026-10-26", "slot": "dinner", "recipe_id": "chili-sin-carne", "portions": 1 },
    {
      "date": "2026-10-26", "slot": "snack", "portions": 1,
      "item": { "name": "Apple", "nutrition_per_portion": { "kcal": 80, "protein_g": 0.4, "carbs_g": 21, "fat_g": 0.2 } }
    }
  ]
}
```

Required: `format`, `version`, `recipes[].id`, `recipes[].name`, `plan[].date`, `plan[].slot`, and either `plan[].recipe_id` or `plan[].item.name`. Everything else may be `null` or left out. File name: `itgetsbetter-meal-plan-YYYY-MM-DD.json`, UTF-8.

## 4. Importer behaviour (to build later)

- Pick the file (the Android picker shows all files), validate it, then show a **preview**: "12 recipes (3 new, 9 updated), 21 planned meals for 26 Oct – 1 Nov". Nothing changes until you confirm.
- Recipes are matched on the other app's `id`, then on name; matches are updated, the rest added.
- Planned meals in the imported range that aren't eaten yet are replaced; eaten ones are never touched (they're in the meal log).
- A daily target in the file is only applied if you tick it in the preview.
- Clear, friendly errors ("line 3 of the plan points to a recipe that isn't in the file") instead of a silent half-import.

## 5. Prompt for the other app's AI

Paste this into the AI that builds the other app:

````text
I want an "Export for ItGetsBetter" button in this app. It downloads one JSON file with the meal plan for a chosen date range (default: the current week), so I can import it into another app I use (ItGetsBetter, an offline meal-prep and health tracker).

Please produce exactly this format. The importer validates it strictly.

FILE
- Name: itgetsbetter-meal-plan-YYYY-MM-DD.json (export date), UTF-8, pretty-printed.
- Top level:
  {
    "format": "itgetsbetter-meal-plan",
    "version": 1,
    "source": { "app": "<this app's name>", "exported_at": "<ISO 8601 UTC timestamp>" },
    "range": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" },
    "settings": { "daily_kcal_target": <number or null> },
    "recipes": [ ...every recipe used in the plan, each once... ],
    "plan": [ ...one entry per planned meal or snack... ]
  }

RECIPE
  {
    "id": "<stable id from this app; the same recipe must get the same id in every export>",
    "name": "<title>",
    "servings": <how many portions the recipe makes, number or null>,
    "nutrition_per_portion": {
      "kcal": <number or null>, "protein_g": <number or null>, "carbs_g": <number or null>, "fat_g": <number or null>,
      "fiber_g": <number or null>, "sugar_g": <number or null>, "salt_g": <number or null>
    },
    "ingredients": [ { "name": "<text>", "amount": <number or null>, "unit": "<g, ml, piece, tbsp, ... or null>", "note": "<text or null>" } ],
    "steps": [ "<one string per step>" ],
    "prep_minutes": <number or null>,
    "tags": [ "<text>" ]
  }

PLAN ENTRY
  {
    "date": "YYYY-MM-DD",            local date, no timezone
    "slot": "breakfast" | "lunch" | "dinner" | "snack",
    "portions": <number, e.g. 1 or 0.5 or 2>,
    "recipe_id": "<id of a recipe in recipes>"
  }
  For a one-off item without a recipe, leave out recipe_id and use:
    "item": { "name": "<text>", "nutrition_per_portion": { same fields as above } }

RULES (important)
1. Nutrition is PER PORTION. If this app stores totals per recipe or per 100 g, convert: per portion = recipe total / servings.
2. Unknown values are null, never 0. Only write 0 when the value really is zero.
3. Numbers are JSON numbers with a dot (12.5), never strings, never a comma decimal.
4. Energy in kcal (convert kJ: kcal = kJ / 4.184). Masses in grams.
5. Dates are YYYY-MM-DD in the user's local time. No timestamps, timezones or clock times in plan entries: the plan only says which meal of the day.
6. Every plan entry has a slot: breakfast, lunch, dinner or snack. Map this app's meal types onto these four. Several snacks per day are fine.
7. Every recipe_id in plan must exist in recipes. Include each used recipe once.
8. Recipe ids must be stable across exports (use this app's database id or a fixed slug), so re-importing updates recipes instead of duplicating them.
9. Keep plan entries sorted by date, then breakfast, lunch, dinner, snack.

EXAMPLE
{
  "format": "itgetsbetter-meal-plan",
  "version": 1,
  "source": { "app": "MyPlanner", "exported_at": "2026-10-20T18:30:00Z" },
  "range": { "from": "2026-10-26", "to": "2026-11-01" },
  "settings": { "daily_kcal_target": 2000 },
  "recipes": [
    {
      "id": "chili-sin-carne",
      "name": "Chili sin carne",
      "servings": 4,
      "nutrition_per_portion": { "kcal": 450, "protein_g": 25.5, "carbs_g": 52, "fat_g": 11, "fiber_g": 14, "sugar_g": null, "salt_g": 1.8 },
      "ingredients": [
        { "name": "kidney beans", "amount": 400, "unit": "g", "note": "drained" },
        { "name": "onion", "amount": 1, "unit": "piece", "note": null }
      ],
      "steps": ["Fry the onion.", "Add the beans and simmer 20 minutes."],
      "prep_minutes": 30,
      "tags": ["meal prep"]
    }
  ],
  "plan": [
    { "date": "2026-10-26", "slot": "snack", "portions": 1,
      "item": { "name": "Apple", "nutrition_per_portion": { "kcal": 80, "protein_g": 0.4, "carbs_g": 21, "fat_g": 0.2, "fiber_g": null, "sugar_g": null, "salt_g": null } } },
    { "date": "2026-10-26", "slot": "dinner", "recipe_id": "chili-sin-carne", "portions": 1 }
  ]
}

WHEN YOU'RE DONE, tell me:
- which fields this app can fill and which will always be null,
- how you map this app's meal types to the four slots,
- whether nutrition needed converting (per recipe / per 100 g / kJ),
and give me one real exported file from my current plan so I can test the import.
````
