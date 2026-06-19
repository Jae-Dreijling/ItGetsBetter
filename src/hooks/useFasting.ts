import { useLiveQuery } from 'dexie-react-hooks'
import { useState, useEffect } from 'react'
import { db } from '../db'
import { getLogicalDate } from '../lib/date'
import { format, subDays } from 'date-fns'

export interface FastingState {
  status: 'fasting' | 'eating' | 'no_data'
  lastMealAt: Date | null
  fastingMinutes: number
  goalHours: number
  goalMet: boolean
}

export function useCurrentFast(goalHours: number = 16): FastingState {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const lastMeal = useLiveQuery(async () => {
    const entries = await db.mealEntries.orderBy('logged_at').last()
    return entries ?? null
  })

  if (lastMeal === undefined) {
    return { status: 'no_data', lastMealAt: null, fastingMinutes: 0, goalHours, goalMet: false }
  }

  if (lastMeal === null) {
    return { status: 'no_data', lastMealAt: null, fastingMinutes: 0, goalHours, goalMet: false }
  }

  const lastMealTime = new Date(lastMeal.logged_at)
  const diffMs = now.getTime() - lastMealTime.getTime()
  const fastingMinutes = Math.max(0, Math.floor(diffMs / 60_000))
  const goalMet = fastingMinutes >= goalHours * 60

  return {
    status: 'fasting',
    lastMealAt: lastMealTime,
    fastingMinutes,
    goalHours,
    goalMet,
  }
}

export function useFastingHistory(days: number = 14) {
  return useLiveQuery(async () => {
    const today = getLogicalDate()
    const from = format(subDays(new Date(today + 'T12:00:00'), days), 'yyyy-MM-dd')

    const meals = await db.mealEntries
      .where('date')
      .between(from, today, true, true)
      .sortBy('logged_at')

    const byDate = new Map<string, { first: string; last: string }>()
    for (const meal of meals) {
      const existing = byDate.get(meal.date)
      if (!existing) {
        byDate.set(meal.date, { first: meal.logged_at, last: meal.logged_at })
      } else {
        if (meal.logged_at < existing.first) existing.first = meal.logged_at
        if (meal.logged_at > existing.last) existing.last = meal.logged_at
      }
    }

    const records: { date: string; durationHours: number }[] = []
    const dates = Array.from(byDate.keys()).sort()

    for (let i = 1; i < dates.length; i++) {
      const prevDay = byDate.get(dates[i - 1])!
      const currDay = byDate.get(dates[i])!
      const lastMealPrev = new Date(prevDay.last)
      const firstMealCurr = new Date(currDay.first)
      const diffHours = (firstMealCurr.getTime() - lastMealPrev.getTime()) / (1000 * 60 * 60)

      if (diffHours > 0 && diffHours < 48) {
        records.push({ date: dates[i], durationHours: Math.round(diffHours * 10) / 10 })
      }
    }

    return records
  }, [days])
}

export function formatFastingDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins}m`
}
