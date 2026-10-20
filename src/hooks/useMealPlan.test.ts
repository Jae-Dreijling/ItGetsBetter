import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { getLogicalDate } from '../lib/date'
import { shiftDate } from '../lib/mealPlan'
import { saveRecipe, addPlanItem, markEaten, unmarkEaten, deleteRecipe, copyPreviousWeek, previewImport, applyImport, clearPlan } from './useMealPlan'
import { parseMealPlanFile } from '../lib/mealPlanImport'

const today = getLogicalDate()

async function chili() {
  return saveRecipe({
    name: 'Chili', servings: 4, ingredients: 'beans\nrice', steps: '',
    kcal: 450, protein_g: 30, carbs_g: 50, fat_g: 12, health_score: 4,
  })
}

async function onlyItem() {
  return (await db.mealPlanItems.toArray())[0]
}

describe('meal plan: eaten', () => {
  beforeEach(clearDb)

  it('logs the planned portions as a meal and pays points', async () => {
    const recipeId = await chili()
    await addPlanItem(today, 'dinner', recipeId, 2)
    await markEaten((await onlyItem()).id!)

    const meals = await db.mealEntries.toArray()
    expect(meals).toHaveLength(1)
    expect(meals[0]).toMatchObject({
      name: 'Chili', meal_slot: 'dinner', date: today, calories: 900, protein_g: 60,
      health_score: 4, recipe_id: recipeId, is_backfill: false,
    })
    const item = await onlyItem()
    expect(item.meal_entry_id).toBe(meals[0].id)
    expect(item.points_given).toBe(true)
    expect(await db.pointsTransactions.where('source_type').equals('meal_logged').count()).toBe(1)
  })

  it('undo removes the meal, and eating again pays no second time', async () => {
    await addPlanItem(today, 'lunch', await chili())
    const id = (await onlyItem()).id!
    await markEaten(id)
    await unmarkEaten(id)
    expect(await db.mealEntries.count()).toBe(0)
    expect((await onlyItem()).meal_entry_id).toBeNull()

    await markEaten(id)
    expect(await db.mealEntries.count()).toBe(1)
    expect(await db.pointsTransactions.where('source_type').equals('meal_logged').count()).toBe(1)
  })

  it('logs past days as backfill without points, and ignores future days', async () => {
    const recipeId = await chili()
    await addPlanItem(shiftDate(today, -1), 'dinner', recipeId)
    await addPlanItem(shiftDate(today, 1), 'dinner', recipeId)
    const [past, future] = await db.mealPlanItems.orderBy('date').toArray()
    await markEaten(past.id!)
    await markEaten(future.id!)

    const meals = await db.mealEntries.toArray()
    expect(meals).toHaveLength(1)
    expect(meals[0].is_backfill).toBe(true)
    expect(await db.pointsTransactions.count()).toBe(0)
  })

  it('deleting a recipe drops its plans but keeps eaten meals', async () => {
    const recipeId = await chili()
    await addPlanItem(today, 'dinner', recipeId)
    await markEaten((await onlyItem()).id!)
    await deleteRecipe(recipeId)
    expect(await db.recipes.count()).toBe(0)
    expect(await db.mealPlanItems.count()).toBe(0)
    expect(await db.mealEntries.count()).toBe(1)
  })

  it('clearing a range removes planned meals but keeps eaten ones', async () => {
    const recipeId = await chili()
    await addPlanItem(today, 'breakfast', recipeId)
    await addPlanItem(today, 'dinner', recipeId)
    await addPlanItem(shiftDate(today, 3), 'dinner', recipeId)
    const [first] = await db.mealPlanItems.toArray()
    await markEaten(first.id!)

    expect(await clearPlan(today, today)).toBe(1)
    const left = await db.mealPlanItems.toArray()
    expect(left.map(i => i.id)).toContain(first.id)
    expect(left).toHaveLength(2)
    expect(await db.mealEntries.count()).toBe(1)
  })

  it('copies last week into this week', async () => {
    const recipeId = await chili()
    await addPlanItem('2026-10-13', 'dinner', recipeId)
    expect(await copyPreviousWeek('2026-10-19')).toBe(1)
    expect((await db.mealPlanItems.orderBy('date').last())!.date).toBe('2026-10-20')
  })
})

describe('meal plan: import', () => {
  beforeEach(clearDb)

  function importFile(kcal: number | null) {
    const result = parseMealPlanFile(JSON.stringify({
      format: 'itgetsbetter-meal-plan', version: 1,
      range: { from: '2026-10-19', to: '2026-10-25' },
      recipes: [{ id: 'chili', name: 'Chili', servings: 3, nutrition_per_portion: { kcal }, ingredients: [], steps: [] }],
      plan: [{ date: '2026-10-20', slot: 'dinner', portions: 1, recipe_id: 'chili' }],
    }))
    if (!result.ok) throw new Error(result.errors.join())
    return result.file
  }

  it('adds recipes and plans, and a re-import updates instead of duplicating', async () => {
    await applyImport(await previewImport(importFile(450)), null)
    expect(await db.recipes.count()).toBe(1)
    expect(await onlyItem()).toMatchObject({ date: '2026-10-20', meal_slot: 'dinner', portions: 1 })

    // Hand-edited, then imported again with calories missing.
    const recipe = (await db.recipes.toArray())[0]
    await db.recipes.update(recipe.id!, { health_score: 5 })
    await applyImport(await previewImport(importFile(null)), null)

    const recipes = await db.recipes.toArray()
    expect(recipes).toHaveLength(1)
    expect(recipes[0]).toMatchObject({ kcal: 450, health_score: 5, source_id: 'chili' })
    expect(await db.mealPlanItems.count()).toBe(1)
  })

  it('never replaces a meal that was already eaten', async () => {
    const recipeId = await chili()
    await addPlanItem(today, 'lunch', recipeId)
    await markEaten((await onlyItem()).id!)
    const f = importFile(450)
    f.from = shiftDate(today, -1)
    f.to = shiftDate(today, 1)
    await applyImport(await previewImport(f), null)
    const items = await db.mealPlanItems.toArray()
    expect(items).toHaveLength(2)
    expect(items.filter(i => i.meal_entry_id !== null)).toHaveLength(1)
  })
})
