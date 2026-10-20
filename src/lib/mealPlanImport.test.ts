import { describe, it, expect } from 'vitest'
import { parseMealPlanFile, planImport, ingredientLine, type MealPlanFile } from './mealPlanImport'
import type { MealPlanItem, Recipe } from '../types'

function file(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    format: 'itgetsbetter-meal-plan',
    version: 1,
    source: { app: 'Planner', exported_at: '2026-10-20T17:00:00Z' },
    range: { from: '2026-10-19', to: '2026-10-25' },
    settings: { daily_kcal_target: 2000 },
    recipes: [{
      id: 'chili', name: 'Chili', servings: 3,
      nutrition_per_portion: { kcal: 450, protein_g: 25.5, carbs_g: null, fat_g: null },
      ingredients: [
        { name: 'kidney beans', amount: 400, unit: 'g', note: 'drained' },
        { name: 'onions', amount: 2, unit: 'piece', note: null },
      ],
      steps: ['Fry.', 'Simmer.'],
    }],
    plan: [
      // A time from the other app is ignored: the plan only uses the slot.
      { date: '2026-10-20', slot: 'dinner', time: '18:30', portions: 1, recipe_id: 'chili' },
      { date: '2026-10-20', slot: 'snack', portions: 1, item: { name: 'Apple', nutrition_per_portion: { kcal: 80 } } },
    ],
    ...overrides,
  })
}

function parsed(raw = file()): MealPlanFile {
  const result = parseMealPlanFile(raw)
  if (!result.ok) throw new Error(result.errors.join('; '))
  return result.file
}

describe('parsing a meal plan file', () => {
  it('reads recipes, one-off items and plan entries', () => {
    const f = parsed()
    expect(f.sourceApp).toBe('Planner')
    expect([f.from, f.to]).toEqual(['2026-10-19', '2026-10-25'])
    expect(f.dailyKcalTarget).toBe(2000)
    expect(f.recipes[0]).toMatchObject({
      sourceId: 'chili', name: 'Chili', servings: 3, kcal: 450, protein_g: 25.5, carbs_g: null,
      ingredients: '400 g kidney beans (drained)\n2 onions',
      steps: '1. Fry.\n2. Simmer.',
    })
    expect(f.recipes[1]).toMatchObject({ sourceId: 'item:apple', name: 'Apple', kcal: 80, protein_g: null })
    expect(f.entries).toEqual([
      { date: '2026-10-20', slot: 'dinner', portions: 1, sourceId: 'chili' },
      { date: '2026-10-20', slot: 'snack', portions: 1, sourceId: 'item:apple' },
    ])
  })

  it('explains what is wrong instead of importing half', () => {
    expect(parseMealPlanFile('not json')).toMatchObject({ ok: false })
    expect(parseMealPlanFile(JSON.stringify({ format: 'other' }))).toMatchObject({ ok: false })
    const bad = parseMealPlanFile(file({
      plan: [
        { date: '20-10-2026', slot: 'dinner', recipe_id: 'chili' },
        { date: '2026-10-20', slot: 'brunch', recipe_id: 'chili' },
        { date: '2026-10-20', slot: 'dinner', recipe_id: 'missing' },
      ],
    }))
    expect(bad.ok).toBe(false)
    if (!bad.ok) {
      expect(bad.errors).toHaveLength(3)
      expect(bad.errors[2]).toContain('"missing"')
    }
  })

  it('stretches the range to cover every planned date', () => {
    const f = parsed(file({
      range: { from: '2026-10-21', to: '2026-10-21' },
      plan: [{ date: '2026-10-19', slot: 'lunch', recipe_id: 'chili', portions: 0.5 }],
    }))
    expect([f.from, f.to]).toEqual(['2026-10-19', '2026-10-21'])
    expect(f.entries[0]).toMatchObject({ portions: 0.5 })
  })
})

describe('ingredient lines', () => {
  it('leaves out "piece" and unknown parts', () => {
    expect(ingredientLine({ name: 'salt', amount: null, unit: null, note: 'to taste' })).toBe('salt (to taste)')
    expect(ingredientLine({ name: 'milk', amount: 0.333333, unit: 'ml' })).toBe('0.33 ml milk')
    expect(ingredientLine({ amount: 2 })).toBeNull()
  })
})

describe('planning an import', () => {
  const existing: Recipe[] = [
    { id: 1, name: 'Chili', servings: 4, ingredients: '', steps: '', kcal: null, protein_g: null, carbs_g: null, fat_g: null, health_score: 5, created_at: '' },
    { id: 2, name: 'Old name', source_id: 'item:apple', servings: 1, ingredients: '', steps: '', kcal: 70, protein_g: null, carbs_g: null, fat_g: null, health_score: 3, created_at: '' },
  ]
  function item(id: number, date: string, eaten: boolean): MealPlanItem {
    return { id, date, meal_slot: 'dinner', recipe_id: 1, portions: 1, meal_entry_id: eaten ? 9 : null, points_given: eaten, created_at: '' }
  }

  it('matches by source id, then by name, and replaces only uneaten plans in range', () => {
    const plan = planImport(parsed(), existing, [
      item(10, '2026-10-19', false),
      item(11, '2026-10-20', true),
      item(12, '2026-10-26', false), // outside the range
    ])
    expect(plan.newRecipes).toHaveLength(0)
    expect(plan.updatedRecipes.map(u => [u.id, u.recipe.sourceId])).toEqual([[1, 'chili'], [2, 'item:apple']])
    expect(plan.replacedItemIds).toEqual([10])
    expect(plan.keptEatenCount).toBe(1)
  })

  it('mentions recipes without calories', () => {
    const f = parsed(file({ recipes: [{ id: 'chili', name: 'Chili' }], plan: [{ date: '2026-10-20', slot: 'dinner', recipe_id: 'chili' }] }))
    expect(planImport(f, [], []).warnings).toEqual(['1 recipe has no calories.'])
  })
})
