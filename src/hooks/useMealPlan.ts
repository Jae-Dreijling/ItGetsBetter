import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { copyWeekItems, itemNutrition, shiftDate } from '../lib/mealPlan'
import { planImport, type ImportPlan, type ImportRecipe, type MealPlanFile } from '../lib/mealPlanImport'
import { addMealEntry } from './useMealEntries'
import type { MealSlot, Recipe } from '../types'

export type RecipeInput = Omit<Recipe, 'id' | 'created_at'>

export function useRecipes() {
  return useLiveQuery(() => db.recipes.orderBy('name').toArray())
}

export function usePlanItems(from: string, to: string) {
  return useLiveQuery(
    () => db.mealPlanItems.where('date').between(from, to, true, true).sortBy('created_at'),
    [from, to]
  )
}

export async function saveRecipe(data: RecipeInput, id?: number): Promise<number> {
  if (id !== undefined) {
    await db.recipes.update(id, data)
    return id
  }
  return await db.recipes.add({ ...data, created_at: nowISO() }) as number
}

// Removes the recipe and its plans. Meals already eaten stay in the meal log.
export async function deleteRecipe(id: number) {
  await db.transaction('rw', db.recipes, db.mealPlanItems, async () => {
    await db.mealPlanItems.where('recipe_id').equals(id).delete()
    await db.recipes.delete(id)
  })
}

export async function addPlanItem(date: string, slot: MealSlot, recipeId: number, portions = 1) {
  await db.mealPlanItems.add({
    date,
    meal_slot: slot,
    recipe_id: recipeId,
    portions,
    meal_entry_id: null,
    points_given: false,
    created_at: nowISO(),
  })
}

export async function setPlanPortions(id: number, portions: number) {
  await db.mealPlanItems.update(id, { portions })
}

export async function removePlanItem(id: number) {
  await db.mealPlanItems.delete(id)
}

// "Eaten": logs the planned portion as a normal meal, with its values.
export async function markEaten(itemId: number) {
  const item = await db.mealPlanItems.get(itemId)
  if (!item || item.meal_entry_id !== null || item.date > getLogicalDate()) return
  const recipe = await db.recipes.get(item.recipe_id)
  if (!recipe) return

  const n = itemNutrition(recipe, item.portions)
  const isBackfill = item.date !== getLogicalDate()
  const entryId = await addMealEntry({
    meal_slot: item.meal_slot,
    name: recipe.name,
    photo: null,
    health_score: recipe.health_score,
    calories: n.kcal,
    protein_g: n.protein_g,
    carbs_g: n.carbs_g,
    fat_g: n.fat_g,
    recipe_id: recipe.id,
    date: item.date,
    is_backfill: isBackfill,
    award_points: !item.points_given,
  })
  await db.mealPlanItems.update(itemId, {
    meal_entry_id: entryId,
    points_given: item.points_given || !isBackfill,
  })
}

// Undo for a mis-tap: removes the meal log again. Points already earned stay.
export async function unmarkEaten(itemId: number) {
  const item = await db.mealPlanItems.get(itemId)
  if (!item || item.meal_entry_id === null) return
  await db.mealEntries.delete(item.meal_entry_id)
  await db.mealPlanItems.update(itemId, { meal_entry_id: null })
}

// Removes planned meals between two dates. Eaten ones stay: they're in the meal log.
export async function clearPlan(from: string, to: string): Promise<number> {
  return db.mealPlanItems
    .where('date').between(from, to, true, true)
    .and(item => item.meal_entry_id === null)
    .delete()
}

export async function copyPreviousWeek(weekStart: string) {
  const fromStart = shiftDate(weekStart, -7)
  const items = await db.mealPlanItems.where('date').between(fromStart, shiftDate(fromStart, 6), true, true).toArray()
  const copies = copyWeekItems(items, fromStart, weekStart, nowISO())
  if (copies.length) await db.mealPlanItems.bulkAdd(copies)
  return copies.length
}

export async function previewImport(file: MealPlanFile): Promise<ImportPlan> {
  return planImport(file, await db.recipes.toArray(), await db.mealPlanItems.toArray())
}

// Imported values fill in or replace, but an empty value in the file never
// wipes something already known.
function recipeChanges(recipe: ImportRecipe, existing: Recipe): Partial<Recipe> {
  return {
    name: recipe.name,
    source_id: recipe.sourceId,
    servings: recipe.servings,
    ingredients: recipe.ingredients || existing.ingredients,
    steps: recipe.steps || existing.steps,
    kcal: recipe.kcal ?? existing.kcal,
    protein_g: recipe.protein_g ?? existing.protein_g,
    carbs_g: recipe.carbs_g ?? existing.carbs_g,
    fat_g: recipe.fat_g ?? existing.fat_g,
  }
}

export async function applyImport(plan: ImportPlan, dailyKcalTarget: number | null) {
  await db.transaction('rw', db.recipes, db.mealPlanItems, db.userProfile, async () => {
    const idBySource = new Map<string, number>()
    for (const { id, recipe } of plan.updatedRecipes) {
      const existing = await db.recipes.get(id)
      if (!existing) continue
      await db.recipes.update(id, recipeChanges(recipe, existing))
      idBySource.set(recipe.sourceId, id)
    }
    for (const recipe of plan.newRecipes) {
      const id = await db.recipes.add({
        name: recipe.name,
        source_id: recipe.sourceId,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        kcal: recipe.kcal,
        protein_g: recipe.protein_g,
        carbs_g: recipe.carbs_g,
        fat_g: recipe.fat_g,
        health_score: 3,
        created_at: nowISO(),
      }) as number
      idBySource.set(recipe.sourceId, id)
    }

    await db.mealPlanItems.bulkDelete(plan.replacedItemIds)
    const now = nowISO()
    await db.mealPlanItems.bulkAdd(plan.entries.map(entry => ({
      date: entry.date,
      meal_slot: entry.slot,
      recipe_id: idBySource.get(entry.sourceId)!,
      portions: entry.portions,
      meal_entry_id: null,
      points_given: false,
      created_at: now,
    })))

    if (dailyKcalTarget !== null) {
      const profile = await db.userProfile.toCollection().first()
      if (profile) await db.userProfile.update(profile.id!, { daily_kcal_target: dailyKcalTarget })
    }
  })
}
