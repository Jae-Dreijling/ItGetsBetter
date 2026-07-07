import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { awardPoints } from './usePoints'
import { triggerCompanionMessage } from '../lib/companionMessenger'
import type { MealSlot } from '../types'

export function useTodaysMeals() {
  const today = getLogicalDate()
  return useLiveQuery(
    () => db.mealEntries.where('date').equals(today).sortBy('logged_at'),
    [today]
  )
}

export function useMealEntries(dateRange?: { from: string; to: string }) {
  return useLiveQuery(() => {
    if (dateRange) {
      return db.mealEntries
        .where('date')
        .between(dateRange.from, dateRange.to, true, true)
        .sortBy('date')
    }
    return db.mealEntries.orderBy('date').toArray()
  }, [dateRange?.from, dateRange?.to])
}

export async function addMealEntry(data: {
  meal_slot: MealSlot
  name: string | null
  photo: Blob | null
  health_score: number
  calories?: number | null
  date?: string
  is_backfill?: boolean
}) {
  const wasFirstEver = (await db.mealEntries.count()) === 0

  const id = await db.mealEntries.add({
    date: data.date ?? getLogicalDate(),
    meal_slot: data.meal_slot,
    name: data.name,
    photo: data.photo,
    health_score: data.health_score,
    calories: data.calories ?? null,
    logged_at: nowISO(),
    is_backfill: data.is_backfill ?? false,
  })
  if (!data.is_backfill) {
    await awardPoints('meal_logged', id as number)
    if (wasFirstEver) triggerCompanionMessage('first_milestone')
  }
}
