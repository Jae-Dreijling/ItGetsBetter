import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns'

export interface WeeklyReviewData {
  weekStart: string
  weekEnd: string
  weight: { start: number | null; end: number | null; delta: number | null } | null
  meals: { count: number; avgScore: number } | null
  water: { avgMl: number; goalMetDays: number } | null
  fasting: { totalHours: number; avgHours: number } | null
  habits: { completionRate: number; totalCompleted: number } | null
  mood: { avg: number; topTags: string[] } | null
  sleep: { avgHours: number; avgQuality: number } | null
  exercise: { sessions: number; types: string[] } | null
  points: { earned: number } | null
  medicineDays: number | null
}

export function useWeeklyReview(weeksAgo: number = 0) {
  return useLiveQuery(async () => {
    const refDate = subWeeks(new Date(), weeksAgo)
    const ws = startOfWeek(refDate, { weekStartsOn: 1 })
    const we = endOfWeek(refDate, { weekStartsOn: 1 })
    const weekStart = format(ws, 'yyyy-MM-dd')
    const weekEnd = format(we, 'yyyy-MM-dd')

    const [weightData, mealData, waterData, mealTimestamps, habitData, moodData, sleepData, exerciseData, pointsData, medData] = await Promise.all([
      getWeightSummary(weekStart, weekEnd),
      getMealSummary(weekStart, weekEnd),
      getWaterSummary(weekStart, weekEnd),
      getMealTimestamps(weekStart, weekEnd),
      getHabitSummary(weekStart, weekEnd),
      getMoodSummary(weekStart, weekEnd),
      getSleepSummary(weekStart, weekEnd),
      getExerciseSummary(weekStart, weekEnd),
      getPointsSummary(weekStart, weekEnd),
      getMedicineSummary(weekStart, weekEnd),
    ])

    const fastingData = computeFasting(mealTimestamps)

    return {
      weekStart,
      weekEnd,
      weight: weightData,
      meals: mealData,
      water: waterData,
      fasting: fastingData,
      habits: habitData,
      mood: moodData,
      sleep: sleepData,
      exercise: exerciseData,
      points: pointsData,
      medicineDays: medData,
    } as WeeklyReviewData
  }, [weeksAgo])
}

async function getWeightSummary(from: string, to: string) {
  const entries = await db.weightEntries.where('date').between(from, to, true, true).sortBy('date')
  if (entries.length === 0) return null
  const start = entries[0].value_kg
  const end = entries[entries.length - 1].value_kg
  return { start, end, delta: Math.round((end - start) * 10) / 10 }
}

async function getMealSummary(from: string, to: string) {
  const entries = await db.mealEntries.where('date').between(from, to, true, true).toArray()
  if (entries.length === 0) return null
  const avg = entries.reduce((s, e) => s + e.health_score, 0) / entries.length
  return { count: entries.length, avgScore: Math.round(avg * 10) / 10 }
}

async function getWaterSummary(from: string, to: string) {
  const entries = await db.waterEntries.where('date').between(from, to, true, true).toArray()
  if (entries.length === 0) return null
  const byDate = new Map<string, number>()
  for (const e of entries) byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.amount_ml)
  const days = byDate.size
  const total = Array.from(byDate.values()).reduce((s, v) => s + v, 0)
  const goalMet = Array.from(byDate.values()).filter(v => v >= 2000).length
  return { avgMl: Math.round(total / days), goalMetDays: goalMet }
}

async function getMealTimestamps(from: string, to: string) {
  return db.mealEntries.where('date').between(from, to, true, true).sortBy('logged_at')
}

function computeFasting(meals: { date: string; logged_at: string }[]) {
  if (meals.length < 2) return null
  const byDate = new Map<string, { first: string; last: string }>()
  for (const m of meals) {
    const e = byDate.get(m.date)
    if (!e) byDate.set(m.date, { first: m.logged_at, last: m.logged_at })
    else {
      if (m.logged_at < e.first) e.first = m.logged_at
      if (m.logged_at > e.last) e.last = m.logged_at
    }
  }
  const dates = Array.from(byDate.keys()).sort()
  let totalHours = 0
  let count = 0
  for (let i = 1; i < dates.length; i++) {
    const prev = byDate.get(dates[i - 1])!
    const curr = byDate.get(dates[i])!
    const h = (new Date(curr.first).getTime() - new Date(prev.last).getTime()) / 3600000
    if (h > 0 && h < 48) { totalHours += h; count++ }
  }
  if (count === 0) return null
  return { totalHours: Math.round(totalHours * 10) / 10, avgHours: Math.round((totalHours / count) * 10) / 10 }
}

async function getHabitSummary(from: string, to: string) {
  const completions = await db.habitCompletions.where('date').between(from, to, true, true).toArray()
  if (completions.length === 0) return null
  const activeCount = await db.habits.filter(h => h.is_active === true).count()
  if (activeCount === 0) return null
  const uniqueDays = new Set(completions.map(c => c.date)).size
  const rate = Math.round((completions.length / (activeCount * Math.max(uniqueDays, 1))) * 100)
  return { completionRate: Math.min(rate, 100), totalCompleted: completions.length }
}

async function getMoodSummary(from: string, to: string) {
  const entries = await db.moodEntries.where('date').between(from, to, true, true).toArray()
  if (entries.length === 0) return null
  const avg = entries.reduce((s, e) => s + e.score, 0) / entries.length
  const tagCounts = new Map<string, number>()
  for (const e of entries) for (const t of e.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
  const topTags = Array.from(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t)
  return { avg: Math.round(avg * 10) / 10, topTags }
}

async function getSleepSummary(from: string, to: string) {
  const entries = await db.sleepEntries.where('date').between(from, to, true, true).toArray()
  if (entries.length === 0) return null
  const avgH = entries.reduce((s, e) => s + e.hours_slept, 0) / entries.length
  const avgQ = entries.reduce((s, e) => s + e.quality_rating, 0) / entries.length
  return { avgHours: Math.round(avgH * 10) / 10, avgQuality: Math.round(avgQ * 10) / 10 }
}

async function getExerciseSummary(from: string, to: string) {
  const entries = await db.exerciseEntries.where('date').between(from, to, true, true).toArray()
  if (entries.length === 0) return null
  const types = [...new Set(entries.map(e => e.exercise_type))]
  return { sessions: entries.length, types }
}

async function getPointsSummary(from: string, to: string) {
  const entries = await db.pointsTransactions.where('date').between(from, to, true, true).toArray()
  if (entries.length === 0) return null
  return { earned: entries.reduce((s, e) => s + e.amount, 0) }
}

async function getMedicineSummary(from: string, to: string) {
  const logs = await db.medicineLogs.where('date').between(from, to, true, true).toArray()
  if (logs.length === 0) return null
  return new Set(logs.map(l => l.date)).size
}
