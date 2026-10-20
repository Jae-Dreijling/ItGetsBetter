import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { getLogicalDate } from '../lib/date'
import { shiftDate } from '../lib/mealPlan'
import { saveRecipe, addPlanItem, markEaten, unmarkEaten, deleteRecipe, copyPreviousWeek } from './useMealPlan'

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

  it('copies last week into this week', async () => {
    const recipeId = await chili()
    await addPlanItem('2026-10-13', 'dinner', recipeId)
    expect(await copyPreviousWeek('2026-10-19')).toBe(1)
    expect((await db.mealPlanItems.orderBy('date').last())!.date).toBe('2026-10-20')
  })
})
