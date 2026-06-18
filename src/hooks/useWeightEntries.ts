import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'

export function useWeightEntries(dateRange?: { from: string; to: string }) {
  return useLiveQuery(() => {
    if (dateRange) {
      return db.weightEntries
        .where('date')
        .between(dateRange.from, dateRange.to, true, true)
        .sortBy('date')
    }
    return db.weightEntries.orderBy('date').toArray()
  }, [dateRange?.from, dateRange?.to])
}

export function useLatestWeight() {
  return useLiveQuery(() =>
    db.weightEntries.orderBy('logged_at').last()
  )
}

export async function addWeightEntry(
  value_kg: number,
  date?: string,
  is_backfill = false
) {
  await db.weightEntries.add({
    date: date ?? getLogicalDate(),
    value_kg,
    logged_at: nowISO(),
    is_backfill,
  })
}
