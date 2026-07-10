import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { awardPoints } from './usePoints'
import { triggerCompanionMessage } from '../lib/companionMessenger'

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
  const previous = await db.weightEntries.orderBy('logged_at').last()
  // value_kg isn't an indexed field, so orderBy() isn't available for it — scan
  // the (small) table in JS instead of adding a schema migration just for this.
  const allEntries = await db.weightEntries.toArray()
  const historicalLowest = allEntries.length > 0
    ? allEntries.reduce((min, e) => (e.value_kg < min.value_kg ? e : min))
    : undefined

  await db.weightEntries.add({
    date: date ?? getLogicalDate(),
    value_kg,
    logged_at: nowISO(),
    is_backfill,
  })

  if (!is_backfill) {
    await awardPoints('weight_logged')
    if (previous) {
      if (value_kg < previous.value_kg) triggerCompanionMessage('weight_loss')
      else if (value_kg > previous.value_kg) triggerCompanionMessage('weight_gain')
    } else {
      triggerCompanionMessage('first_milestone')
    }
    if (historicalLowest && value_kg < historicalLowest.value_kg) {
      triggerCompanionMessage('personal_best')
    }
  }
}
