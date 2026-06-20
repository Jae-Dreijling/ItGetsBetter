import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { awardPoints } from './usePoints'
import type { ExerciseEntry } from '../types'

export function useTodaysExercise() {
  const today = getLogicalDate()
  return useLiveQuery(
    () => db.exerciseEntries.where('date').equals(today).toArray(),
    [today]
  )
}

export function useExerciseHistory(limit: number = 30) {
  return useLiveQuery(() =>
    db.exerciseEntries.orderBy('date').reverse().limit(limit).toArray()
  , [limit])
}

export function useExerciseTypes() {
  return useLiveQuery(async () => {
    const entries = await db.exerciseEntries.toArray()
    const types = new Set(entries.map(e => e.exercise_type))
    return Array.from(types).sort()
  })
}

type ExerciseInput = Omit<ExerciseEntry, 'id' | 'date' | 'logged_at'>

export async function addExerciseEntry(data: ExerciseInput & { date?: string }) {
  const id = await db.exerciseEntries.add({
    date: data.date ?? getLogicalDate(),
    exercise_type: data.exercise_type,
    sets: data.sets ?? null,
    reps: data.reps ?? null,
    weight_used_kg: data.weight_used_kg ?? null,
    duration_minutes: data.duration_minutes ?? null,
    distance_km: data.distance_km ?? null,
    notes: data.notes ?? null,
    logged_at: nowISO(),
  })
  await awardPoints('exercise_logged', id as number)
}

export async function deleteExerciseEntry(id: number) {
  await db.exerciseEntries.delete(id)
}
