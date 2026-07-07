import { db } from '../db'
import { getLogicalDate } from './date'

// Occasionally the companion should notice something real about your day
// instead of showing pure canned idle text. Returns null when nothing
// relevant applies, so the caller can fall back to a normal idle message.
export async function getDataAwareNudge(name: string): Promise<string | null> {
  const today = getLogicalDate()
  const hour = new Date().getHours()

  const overdueTasks = await db.tasks
    .filter(t => !t.is_completed && !!t.due_date && (t.due_date as string) < today)
    .count()
  if (overdueTasks > 0) {
    return `${name}, you have ${overdueTasks} overdue ${overdueTasks === 1 ? 'task' : 'tasks'} whenever you're ready for them.`
  }

  if (hour >= 14) {
    const waterToday = await db.waterEntries.where('date').equals(today).toArray()
    const waterTotal = waterToday.reduce((sum, e) => sum + e.amount_ml, 0)
    if (waterTotal < 500) {
      return `Hey ${name}, not much water logged today. Maybe grab a glass?`
    }
  }

  if (hour >= 15) {
    const mealsToday = await db.mealEntries.where('date').equals(today).count()
    if (mealsToday === 0) {
      return `${name}, no meals logged yet today. No judgment — just checking in.`
    }
  }

  return null
}
