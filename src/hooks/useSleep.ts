import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { awardPoints } from './usePoints'

export function useTodaysSleep() {
  const today = getLogicalDate()
  return useLiveQuery(
    () => db.sleepEntries.where('date').equals(today).first(),
    [today]
  )
}

export function useSleepHistory(limit: number = 30) {
  return useLiveQuery(() =>
    db.sleepEntries.orderBy('date').reverse().limit(limit).toArray()
  , [limit])
}

export async function addSleepEntry(data: {
  hours_slept: number
  quality_rating: number
  wake_feeling: string | null
  date?: string
}) {
  await db.sleepEntries.add({
    date: data.date ?? getLogicalDate(),
    hours_slept: data.hours_slept,
    quality_rating: data.quality_rating,
    wake_feeling: data.wake_feeling,
    logged_at: nowISO(),
  })
  await awardPoints('sleep_logged')
}
