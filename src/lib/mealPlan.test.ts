import { describe, it, expect } from 'vitest'
import { weekStartOf, weekDays, itemNutrition, sumNutrition, copyWeekItems } from './mealPlan'
import type { MealPlanItem, Recipe } from '../types'

function recipe(id: number, values: Partial<Recipe> = {}): Recipe {
  return {
    id, name: `Recipe ${id}`, servings: 1, ingredients: '', steps: '',
    kcal: null, protein_g: null, carbs_g: null, fat_g: null,
    health_score: 3, created_at: '2026-10-01T00:00:00Z', ...values,
  }
}

function item(date: string, recipeId: number, portions = 1, values: Partial<MealPlanItem> = {}): MealPlanItem {
  return {
    date, meal_slot: 'dinner', recipe_id: recipeId, portions,
    meal_entry_id: null, points_given: false, created_at: '2026-10-01T00:00:00Z', ...values,
  }
}

describe('meal plan weeks', () => {
  it('starts weeks on Monday', () => {
    expect(weekStartOf('2026-10-20')).toBe('2026-10-19') // Tuesday
    expect(weekStartOf('2026-10-19')).toBe('2026-10-19') // Monday
    expect(weekStartOf('2026-10-25')).toBe('2026-10-19') // Sunday
  })

  it('lists seven days, across a month boundary too', () => {
    expect(weekDays('2026-10-26')).toEqual([
      '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01',
    ])
  })
})

describe('meal plan nutrition', () => {
  it('scales per-portion values by portions and rounds', () => {
    const r = recipe(1, { kcal: 333, protein_g: 20.4, carbs_g: null, fat_g: 10 })
    expect(itemNutrition(r, 1.5)).toEqual({ kcal: 500, protein_g: 31, carbs_g: null, fat_g: 15 })
  })

  it('adds up a day, counts items without calories and keeps unknown values unknown', () => {
    const recipes = new Map([
      [1, recipe(1, { kcal: 400, protein_g: 30 })],
      [2, recipe(2)],
    ])
    const totals = sumNutrition([item('2026-10-20', 1, 2), item('2026-10-20', 2), item('2026-10-20', 99)], recipes)
    expect(totals).toEqual({ kcal: 800, protein_g: 60, carbs_g: null, fat_g: null, unknownKcal: 1 })
  })
})

describe('copying a week', () => {
  it('moves only that week to the new week, as fresh uneaten plans', () => {
    const items = [
      item('2026-10-12', 1, 1, { meal_entry_id: 5, points_given: true }),
      item('2026-10-18', 2, 2),
      item('2026-10-19', 3), // next week, not copied
    ]
    const copies = copyWeekItems(items, '2026-10-12', '2026-10-19', 'now')
    expect(copies.map(c => [c.date, c.recipe_id, c.portions, c.meal_entry_id, c.points_given])).toEqual([
      ['2026-10-19', 1, 1, null, false],
      ['2026-10-25', 2, 2, null, false],
    ])
    expect(copies.every(c => c.id === undefined)).toBe(true)
  })
})
