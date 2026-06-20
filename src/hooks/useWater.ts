import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'

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
  await db.waterEntries.add({
    date: getLogicalDate(),
    amount_ml,
    logged_at: nowISO(),
  })
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
