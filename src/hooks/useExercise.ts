import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { awardPoints } from './usePoints'
import type { ExerciseEntry } from '../types'

export const DEFAULT_KCAL_PER_MIN: Record<string, number> = {
  'Running':       9.8,
  'Walking':       3.9,
  'Weight Lifting': 4.7,
  'Boxing':        8.3,
  'Dancing':       5.3,
  'Swimming':      8.3,
  'Cycling':       6.8,
  'Home Workout':  5.8,
  'Planking':      3.8,
}

function getCustomKcalMap(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem('igb_exercise_kcal') ?? '{}') } catch { return {} }
}

export function saveCustomKcal(exerciseType: string, kcalPerMin: number) {
  const map = getCustomKcalMap()
  localStorage.setItem('igb_exercise_kcal', JSON.stringify({ ...map, [exerciseType]: kcalPerMin }))
}

export function getKcalPerMin(exerciseType: string): number | null {
  return DEFAULT_KCAL_PER_MIN[exerciseType] ?? getCustomKcalMap()[exerciseType] ?? null
}

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

type ExerciseInput = Omit<ExerciseEntry, 'id' | 'date' | 'logged_at' | 'calories_burned'>

export async function addExerciseEntry(data: ExerciseInput & { date?: string }) {
  let calories_burned: number | null = null

  if (data.duration_minutes && data.duration_minutes > 0) {
    const kcalPerMin = getKcalPerMin(data.exercise_type)
    if (kcalPerMin) {
      const latestWeight = await db.weightEntries.orderBy('date').last()
      if (latestWeight) {
        calories_burned = Math.round((kcalPerMin * latestWeight.value_kg / 70) * data.duration_minutes)
      }
    }
  }

  const id = await db.exerciseEntries.add({
    date: data.date ?? getLogicalDate(),
    exercise_type: data.exercise_type,
    sets: data.sets ?? null,
    reps: data.reps ?? null,
    weight_used_kg: data.weight_used_kg ?? null,
    duration_minutes: data.duration_minutes ?? null,
    distance_km: data.distance_km ?? null,
    calories_burned,
    notes: data.notes ?? null,
    logged_at: nowISO(),
  })
  await awardPoints('exercise_logged', id as number)
}

export async function deleteExerciseEntry(id: number) {
  await db.exerciseEntries.delete(id)
}
