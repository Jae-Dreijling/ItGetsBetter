import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from 'date-fns'
import type { MealPlanItem, MealSlot, Recipe } from '../types'

// The meal planner (V2-PLAN §7): recipes planned into a week, Monday first.
// Values are entered once per recipe and added up here, so nobody counts.

export const PLAN_SLOTS: { value: MealSlot; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '🥪' },
  { value: 'dinner', label: 'Dinner', emoji: '🍲' },
  { value: 'snack', label: 'Snacks', emoji: '🍎' },
]

export interface NutritionTotals {
  kcal: number
  // Null when no item has a value, so "0 g" never stands in for "unknown".
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  // Items without a calorie value, so a total can say it's incomplete.
  unknownKcal: number
}

export function weekStartOf(date: string): string {
  return format(startOfWeek(parseISO(date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export function weekDays(weekStart: string): string[] {
  const start = parseISO(weekStart)
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'))
}

export function shiftDate(date: string, days: number): string {
  return format(addDays(parseISO(date), days), 'yyyy-MM-dd')
}

function scaled(value: number | null, portions: number): number | null {
  return value === null ? null : Math.round(value * portions)
}

// What one planned item adds up to, rounded to whole numbers.
export function itemNutrition(recipe: Recipe, portions: number) {
  return {
    kcal: scaled(recipe.kcal, portions),
    protein_g: scaled(recipe.protein_g, portions),
    carbs_g: scaled(recipe.carbs_g, portions),
    fat_g: scaled(recipe.fat_g, portions),
  }
}

export function sumNutrition(items: MealPlanItem[], recipes: Map<number, Recipe>): NutritionTotals {
  const add = (total: number | null, value: number | null) => (value === null ? total : (total ?? 0) + value)
  const totals: NutritionTotals = { kcal: 0, protein_g: null, carbs_g: null, fat_g: null, unknownKcal: 0 }
  for (const item of items) {
    const recipe = recipes.get(item.recipe_id)
    if (!recipe) continue
    const n = itemNutrition(recipe, item.portions)
    if (n.kcal === null) totals.unknownKcal++
    totals.kcal += n.kcal ?? 0
    totals.protein_g = add(totals.protein_g, n.protein_g)
    totals.carbs_g = add(totals.carbs_g, n.carbs_g)
    totals.fat_g = add(totals.fat_g, n.fat_g)
  }
  return totals
}

// Copies of a week's items moved to another week, as fresh plans (not eaten).
export function copyWeekItems(items: MealPlanItem[], fromStart: string, toStart: string, now: string): MealPlanItem[] {
  const offset = differenceInCalendarDays(parseISO(toStart), parseISO(fromStart))
  const lastDay = shiftDate(fromStart, 6)
  return items
    .filter(item => item.date >= fromStart && item.date <= lastDay)
    .map(item => ({
      date: shiftDate(item.date, offset),
      meal_slot: item.meal_slot,
      recipe_id: item.recipe_id,
      portions: item.portions,
      meal_entry_id: null,
      points_given: false,
      created_at: now,
    }))
}

export function formatPortions(portions: number): string {
  return portions === 0.5 ? '½' : String(portions)
}

// "450 kcal · 30 g protein · makes 4", leaving out what's unknown.
export function recipeSummary(recipe: Recipe): string {
  const parts: string[] = []
  if (recipe.kcal !== null) parts.push(`${Math.round(recipe.kcal)} kcal`)
  if (recipe.protein_g !== null) parts.push(`${Math.round(recipe.protein_g)} g protein`)
  if (recipe.servings > 1) parts.push(`makes ${recipe.servings}`)
  return parts.join(' · ')
}
