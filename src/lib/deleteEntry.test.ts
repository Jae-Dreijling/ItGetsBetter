import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { deleteEntry } from './deleteEntry'

describe('deleting entries', () => {
  beforeEach(clearDb)

  it('deletes a weight entry and keeps points', async () => {
    const id = await db.weightEntries.add({ date: '2026-10-21', value_kg: 850, logged_at: '', is_backfill: false }) as number
    await db.pointsTransactions.add({ amount: 3, source_type: 'weight_logged', source_id: null, date: '2026-10-21', created_at: '' })
    await deleteEntry('weightEntries', id)
    expect(await db.weightEntries.count()).toBe(0)
    expect(await db.pointsTransactions.count()).toBe(1)
  })

  it('puts a planned meal back to planned when its meal log is deleted', async () => {
    const mealId = await db.mealEntries.add({ date: '2026-10-21', meal_slot: 'dinner', name: 'Chili', photo: null, health_score: 3, calories: 450, logged_at: '', is_backfill: false }) as number
    const itemId = await db.mealPlanItems.add({ date: '2026-10-21', meal_slot: 'dinner', recipe_id: 1, portions: 1, meal_entry_id: mealId, points_given: true, created_at: '' }) as number
    await deleteEntry('mealEntries', mealId)
    expect(await db.mealEntries.count()).toBe(0)
    expect((await db.mealPlanItems.get(itemId))!.meal_entry_id).toBeNull()
  })

  it('reopens a completed task instead of deleting it', async () => {
    const id = await db.tasks.add({ title: 'Call', project_id: null, parent_task_id: null, is_completed: true, due_date: null, priority: 'medium', label_ids: [], show_in_today: true, completed_at: '2026-10-21T10:00:00Z', created_at: '' }) as number
    await deleteEntry('taskCompletion', id)
    expect(await db.tasks.get(id)).toMatchObject({ is_completed: false, completed_at: null })
  })
})
