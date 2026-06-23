I agree with several of your changes.

For Rule 1, the original version is too strict for a personal health dashboard.

The real issue isn't "capture and review together."

The issue is "don't let review overwhelm capture."

For example:

### Good

Weight Card

Current Weight: 98.2 kg

[Log Weight]

Last Entry: Yesterday

7-Day Trend: -0.4 kg

This combines capture and review and is actually helpful.

### Bad

Weight Card

Current Weight

7-day graph

30-day graph

90-day graph

BMI graph

Body Fat graph

Prediction graph

Weekly report

Monthly report

[Log Weight]

Now the logging action is buried.

So I would rewrite Rule 1 as:

> The primary action of a page must always be obvious. Supporting information may exist around it, but must never distract from it.

---

For Rule 7, I agree.

The rule shouldn't be:

> Rare data gets hidden.

It should be:

> Frequently used actions get priority.

If medication is daily for you, then it belongs alongside meals, water, and exercise.

Frequency determines visibility.

Not category.

---

I also agree with removing Rule 9.

In your specific app, lightweight review directly next to logging is useful.

Example:

Weight:

* Log Weight
* Last Weight
* Weekly Change

That's perfectly reasonable.

---

I also agree with removing Rule 11.

Your app is a personal system, not a mass-market app.

You can afford a little more complexity if it matches how you think.

---

I would also remove Rule 12.

The concept is useful architecturally, but it doesn't need to become a design law.

---

# Revised Rulebook

## Rule 1: Primary Action First

Every page must have a clear primary action.

Supporting information is allowed but must never overshadow the main action.

---

## Rule 2: Group By Human Categories

Use:

### Body

* Weight
* Measurements

### Nutrition

* Meals
* Water
* Fasting

### Activity

* Exercise

### Wellness

* Sleep
* Mood
* Medicine

---

## Rule 3: Maximum Four Top-Level Categories

Avoid long uncategorized lists.

---

## Rule 4: Two-Tap Logging

The log page should primarily contain destinations.

Example:

Nutrition → Meal

Nutrition → Water

Nutrition → Fasting

Tap once.

Log on the next screen.

---

## Rule 5: Progressive Disclosure

Quick logging first.

Details optional.

Example:

Weight

Required:

* Weight

Optional:

* Notes
* Body Fat
* Context

---

## Rule 6: Frequency Determines Priority

Most-used actions should receive:

* Larger cards
* Better placement
* Faster access

Examples:

* Meal
* Water
* Medicine
* Exercise

---

## Rule 7: Use Cards, Not Lists

Cards create visual separation.

Cards make categories obvious.

Cards improve scanning.

---

## Rule 8: Review Supports Capture

A small amount of recent history is allowed directly on logging screens.

Examples:

Weight:

* Current weight
* Last weight
* Weekly trend

Water:

* Today's total

Medication:

* Last dose taken

The purpose is to support logging, not replace the dedicated analytics pages.
