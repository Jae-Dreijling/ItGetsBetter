import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { format, subDays, subMonths, subYears } from 'date-fns'
import { getLogicalDate } from '../lib/date'

export type TimeRange = '1w' | '1m' | '3m' | '6m' | '1y' | 'all'

function getFromDate(range: TimeRange): string | null {
  const today = new Date(getLogicalDate() + 'T12:00:00')
  switch (range) {
    case '1w': return format(subDays(today, 7), 'yyyy-MM-dd')
    case '1m': return format(subMonths(today, 1), 'yyyy-MM-dd')
    case '3m': return format(subMonths(today, 3), 'yyyy-MM-dd')
    case '6m': return format(subMonths(today, 6), 'yyyy-MM-dd')
    case '1y': return format(subYears(today, 1), 'yyyy-MM-dd')
    case 'all': return null
  }
}

export function useWeightGraphData(range: TimeRange) {
  const from = getFromDate(range)
  return useLiveQuery(async () => {
    let entries = from
      ? await db.weightEntries.where('date').aboveOrEqual(from).sortBy('date')
      : await db.weightEntries.orderBy('date').toArray()

    const byDate = new Map<string, number[]>()
    for (const e of entries) {
      const arr = byDate.get(e.date) ?? []
      arr.push(e.value_kg)
      byDate.set(e.date, arr)
    }

    const data: { date: string; weight: number; smoothed: number }[] = []
    let ema = 0
    let first = true
    for (const [date, values] of byDate) {
      const avg = values.reduce((s, v) => s + v, 0) / values.length
      if (first) { ema = avg; first = false }
      else { ema = 0.15 * avg + 0.85 * ema }
      data.push({ date, weight: Math.round(avg * 10) / 10, smoothed: Math.round(ema * 10) / 10 })
    }
    return data
  }, [from])
}

export function useMealScoreGraphData(range: TimeRange) {
  const from = getFromDate(range)
  return useLiveQuery(async () => {
    const entries = from
      ? await db.mealEntries.where('date').aboveOrEqual(from).sortBy('date')
      : await db.mealEntries.orderBy('date').toArray()

    const byDate = new Map<string, number[]>()
    for (const e of entries) {
      const arr = byDate.get(e.date) ?? []
      arr.push(e.health_score)
      byDate.set(e.date, arr)
    }

    return Array.from(byDate).map(([date, scores]) => ({
      date,
      avg: Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10,
    }))
  }, [from])
}

export function useWaterGraphData(range: TimeRange) {
  const from = getFromDate(range)
  return useLiveQuery(async () => {
    const entries = from
      ? await db.waterEntries.where('date').aboveOrEqual(from).sortBy('date')
      : await db.waterEntries.orderBy('date').toArray()

    const byDate = new Map<string, number>()
    for (const e of entries) {
      byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.amount_ml)
    }

    return Array.from(byDate).map(([date, total]) => ({
      date,
      ml: total,
      liters: Math.round(total / 100) / 10,
    }))
  }, [from])
}

export function useMoodGraphData(range: TimeRange) {
  const from = getFromDate(range)
  return useLiveQuery(async () => {
    const entries = from
      ? await db.moodEntries.where('date').aboveOrEqual(from).sortBy('date')
      : await db.moodEntries.orderBy('date').toArray()

    const byDate = new Map<string, number[]>()
    for (const e of entries) {
      const arr = byDate.get(e.date) ?? []
      arr.push(e.score)
      byDate.set(e.date, arr)
    }

    return Array.from(byDate).map(([date, scores]) => ({
      date,
      avg: Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10,
    }))
  }, [from])
}

export function useSleepGraphData(range: TimeRange) {
  const from = getFromDate(range)
  return useLiveQuery(async () => {
    const entries = from
      ? await db.sleepEntries.where('date').aboveOrEqual(from).sortBy('date')
      : await db.sleepEntries.orderBy('date').toArray()

    return entries.map(e => ({
      date: e.date,
      hours: e.hours_slept,
      quality: e.quality_rating,
    }))
  }, [from])
}

export function useExerciseGraphData(range: TimeRange) {
  const from = getFromDate(range)
  return useLiveQuery(async () => {
    const entries = from
      ? await db.exerciseEntries.where('date').aboveOrEqual(from).sortBy('date')
      : await db.exerciseEntries.orderBy('date').toArray()

    const byWeek = new Map<string, number>()
    for (const e of entries) {
      const d = new Date(e.date + 'T12:00:00')
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay() + 1)
      const key = format(weekStart, 'yyyy-MM-dd')
      byWeek.set(key, (byWeek.get(key) ?? 0) + 1)
    }

    return Array.from(byWeek).map(([week, count]) => ({
      week,
      sessions: count,
    }))
  }, [from])
}

export function useHabitGraphData(range: TimeRange) {
  const from = getFromDate(range)
  return useLiveQuery(async () => {
    const completions = from
      ? await db.habitCompletions.where('date').aboveOrEqual(from).sortBy('date')
      : await db.habitCompletions.orderBy('date').toArray()

    const activeCount = await db.habits.filter(h => h.is_active === true).count()
    if (activeCount === 0) return []

    const byDate = new Map<string, number>()
    for (const c of completions) {
      byDate.set(c.date, (byDate.get(c.date) ?? 0) + 1)
    }

    return Array.from(byDate).map(([date, done]) => ({
      date,
      percent: Math.round((done / activeCount) * 100),
    }))
  }, [from])
}

export function useMeasurementGraphData(range: TimeRange) {
  const from = getFromDate(range)
  return useLiveQuery(async () => {
    const entries = from
      ? await db.measurements.where('date').aboveOrEqual(from).sortBy('date')
      : await db.measurements.orderBy('date').toArray()

    return entries.map(e => ({
      date: e.date,
      neck: e.neck_cm,
      chest: e.chest_cm,
      hips: e.hips_cm,
      waist: e.waist_cm,
      arms: e.arms_cm,
      thighs: e.thighs_cm,
      ankles: e.ankles_cm,
      wrists: e.wrists_cm,
    }))
  }, [from])
}
