import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { awardPoints } from './usePoints'

export function useTodaysMood() {
  const today = getLogicalDate()
  return useLiveQuery(
    () => db.moodEntries.where('date').equals(today).sortBy('logged_at'),
    [today]
  )
}

export function useMoodHistory(limit: number = 30) {
  return useLiveQuery(() =>
    db.moodEntries.orderBy('date').reverse().limit(limit).toArray()
  , [limit])
}

export function useMoodTags() {
  return useLiveQuery(() => db.moodTags.toArray())
}

export async function addMoodEntry(score: number, tags: string[]) {
  await db.moodEntries.add({
    date: getLogicalDate(),
    score,
    tags,
    logged_at: nowISO(),
  })
  await awardPoints('mood_logged')
}

export async function addMoodTag(label: string) {
  const existing = await db.moodTags.filter(t => t.label.toLowerCase() === label.toLowerCase()).first()
  if (!existing) {
    await db.moodTags.add({ label, created_at: nowISO() })
  }
}

export async function deleteMoodTag(id: number) {
  await db.moodTags.delete(id)
}
