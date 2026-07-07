import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { awardPoints } from './usePoints'

const WATER_GOAL_ML = 2000

export function useTodaysWater() {
  const today = getLogicalDate()
  return useLiveQuery(
    () => db.waterEntries.where('date').equals(today).sortBy('logged_at'),
    [today]
  )
}

export function useTodaysWaterTotal() {
  const entries = useTodaysWater()
  if (entries === undefined) return undefined
  if (entries.length === 0) return null
  return entries.reduce((sum, e) => sum + e.amount_ml, 0)
}

export async function addWaterEntry(amount_ml: number) {
  const today = getLogicalDate()
  const beforeTotal = (await db.waterEntries.where('date').equals(today).toArray())
    .reduce((sum, e) => sum + e.amount_ml, 0)

  await db.waterEntries.add({
    date: today,
    amount_ml,
    logged_at: nowISO(),
  })

  if (beforeTotal < WATER_GOAL_ML && beforeTotal + amount_ml >= WATER_GOAL_ML) {
    await awardPoints('water_goal_met')
  }
}

export async function undoLastWaterEntry() {
  const today = getLogicalDate()
  const entries = await db.waterEntries
    .where('date').equals(today)
    .sortBy('logged_at')

  if (entries.length > 0) {
    const last = entries[entries.length - 1]
    await db.waterEntries.delete(last.id!)
  }
}
