import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'

export interface InsightResult {
  id?: number
  text: string
  correlationType: string
  isConfirmed: boolean | null
}

export function useInsights() {
  return useLiveQuery(async () => {
    const insights = await db.table('healthInsights').toArray() as any[]
    return insights as { id: number; insight_text: string; correlation_type: string; is_confirmed: boolean | null; is_rejected: boolean | null }[]
  })
}

export async function generateInsights(): Promise<{ text: string; correlationType: string }[]> {
  const insights: { text: string; correlationType: string }[] = []

  const meals = await db.mealEntries.toArray()
  const sleep = await db.sleepEntries.toArray()
  const moods = await db.moodEntries.toArray()
  const exercises = await db.exerciseEntries.toArray()

  if (meals.length < 14 && sleep.length < 7 && moods.length < 7) return insights

  if (sleep.length >= 7 && meals.length >= 14) {
    const sleepByDate = new Map(sleep.map(s => [s.date, s.hours_slept]))
    const mealsByDate = new Map<string, number[]>()
    for (const m of meals) {
      const arr = mealsByDate.get(m.date) ?? []
      arr.push(m.health_score)
      mealsByDate.set(m.date, arr)
    }

    let lowSleepScore = 0, lowSleepCount = 0
    let highSleepScore = 0, highSleepCount = 0
    for (const [date, hours] of sleepByDate) {
      const scores = mealsByDate.get(date)
      if (!scores) continue
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length
      if (hours < 6) { lowSleepScore += avg; lowSleepCount++ }
      else if (hours >= 7) { highSleepScore += avg; highSleepCount++ }
    }

    if (lowSleepCount >= 3 && highSleepCount >= 3) {
      const lowAvg = lowSleepScore / lowSleepCount
      const highAvg = highSleepScore / highSleepCount
      if (highAvg - lowAvg > 0.5) {
        insights.push({
          text: 'You seem to eat healthier on days you sleep 7+ hours. Could better sleep be helping your food choices?',
          correlationType: 'sleep_vs_meal_score',
        })
      }
    }
  }

  if (moods.length >= 7 && meals.length >= 14) {
    const moodByDate = new Map<string, number>()
    for (const m of moods) {
      const existing = moodByDate.get(m.date)
      moodByDate.set(m.date, existing ? (existing + m.score) / 2 : m.score)
    }
    const mealsByDate = new Map<string, number[]>()
    for (const m of meals) {
      const arr = mealsByDate.get(m.date) ?? []
      arr.push(m.health_score)
      mealsByDate.set(m.date, arr)
    }

    let lowMoodScore = 0, lowMoodCount = 0
    let highMoodScore = 0, highMoodCount = 0
    for (const [date, mood] of moodByDate) {
      const scores = mealsByDate.get(date)
      if (!scores) continue
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length
      if (mood <= 2) { lowMoodScore += avg; lowMoodCount++ }
      else if (mood >= 4) { highMoodScore += avg; highMoodCount++ }
    }

    if (lowMoodCount >= 3 && highMoodCount >= 3) {
      const lowAvg = lowMoodScore / lowMoodCount
      const highAvg = highMoodScore / highMoodCount
      if (highAvg - lowAvg > 0.5) {
        insights.push({
          text: 'Your meal scores tend to be lower on days when your mood is low. Is this something you notice?',
          correlationType: 'mood_vs_meal_score',
        })
      }
    }
  }

  if (exercises.length >= 5 && moods.length >= 7) {
    const exerciseDates = new Set(exercises.map(e => e.date))
    const moodByDate = new Map<string, number>()
    for (const m of moods) {
      const existing = moodByDate.get(m.date)
      moodByDate.set(m.date, existing ? (existing + m.score) / 2 : m.score)
    }

    let exerciseMood = 0, exerciseCount = 0
    let noExerciseMood = 0, noExerciseCount = 0
    for (const [date, mood] of moodByDate) {
      if (exerciseDates.has(date)) { exerciseMood += mood; exerciseCount++ }
      else { noExerciseMood += mood; noExerciseCount++ }
    }

    if (exerciseCount >= 3 && noExerciseCount >= 3) {
      const exAvg = exerciseMood / exerciseCount
      const noExAvg = noExerciseMood / noExerciseCount
      if (exAvg - noExAvg > 0.3) {
        insights.push({
          text: 'Your mood tends to be higher on days you exercise. Could movement be boosting how you feel?',
          correlationType: 'exercise_vs_mood',
        })
      }
    }
  }

  if (moods.length >= 7) {
    const tagMoodMap = new Map<string, { total: number; count: number }>()
    for (const m of moods) {
      for (const tag of m.tags) {
        const entry = tagMoodMap.get(tag) ?? { total: 0, count: 0 }
        entry.total += m.score
        entry.count++
        tagMoodMap.set(tag, entry)
      }
    }
    const overallAvg = moods.reduce((s, m) => s + m.score, 0) / moods.length
    for (const [tag, data] of tagMoodMap) {
      if (data.count < 3) continue
      const tagAvg = data.total / data.count
      if (tagAvg < overallAvg - 0.8) {
        insights.push({
          text: `Days tagged "${tag}" tend to have lower mood scores. Is "${tag}" something that affects how you feel?`,
          correlationType: `tag_${tag}_vs_mood`,
        })
      }
    }
  }

  return insights
}

export async function saveInsight(text: string, correlationType: string) {
  const existing = await (db.table('healthInsights') as any)
    .filter((i: any) => i.correlation_type === correlationType)
    .first()
  if (existing) return

  await db.table('healthInsights').add({
    insight_text: text,
    correlation_type: correlationType,
    is_confirmed: null,
    is_rejected: null,
    surfaced_at: nowISO(),
    responded_at: null,
  })
}

export async function respondToInsight(id: number, confirmed: boolean) {
  await db.table('healthInsights').update(id, {
    is_confirmed: confirmed,
    is_rejected: !confirmed,
    responded_at: nowISO(),
  })
}
