import { db } from '../db'

// Deleting a logged entry (a mistyped weight, a double-logged glass of
// water), from its own page or from My Day. Points already earned stay, like
// unticking a habit. A few entries are tied to something else:
// - a meal eaten from the meal planner goes back to "planned"
// - a completed task becomes open again instead of disappearing

export type EntryKind =
  | 'weightEntries' | 'mealEntries' | 'waterEntries' | 'exerciseEntries' | 'moodEntries'
  | 'sleepEntries' | 'medicineLogs' | 'habitCompletions' | 'measurements' | 'taskCompletion'

export async function deleteEntry(kind: EntryKind, id: number) {
  if (kind === 'taskCompletion') {
    await db.tasks.update(id, { is_completed: false, completed_at: null })
    return
  }
  if (kind === 'mealEntries') {
    await db.mealPlanItems.filter(item => item.meal_entry_id === id).modify({ meal_entry_id: null })
  }
  await db.table(kind).delete(id)
}
