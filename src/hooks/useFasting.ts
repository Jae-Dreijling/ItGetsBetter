import { useLiveQuery } from 'dexie-react-hooks'
import { useState, useEffect, useCallback } from 'react'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { format, subDays } from 'date-fns'
import { awardPoints } from './usePoints'
import { triggerCompanionMessage } from '../lib/companionMessenger'

export interface FastingState {
  status: 'fasting' | 'dismissed' | 'no_data'
  lastMealAt: Date | null
  lastMealLoggedAt: string | null
  fastingMinutes: number
  goalHours: number
  goalMet: boolean
}

const DISMISSED_KEY = 'igb_dismissed_fast'

export function useCurrentFast(goalHours: number = 16) {
  const [now, setNow] = useState(new Date())
  const [dismissedAt, setDismissedAt] = useState(() => localStorage.getItem(DISMISSED_KEY))

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const lastMeal = useLiveQuery(async () => {
    const entry = await db.mealEntries.orderBy('logged_at').last()
    return entry ?? null
  })

  const dismiss = useCallback(() => {
    if (lastMeal) {
      localStorage.setItem(DISMISSED_KEY, lastMeal.logged_at)
      setDismissedAt(lastMeal.logged_at)
    }
  }, [lastMeal])

  if (lastMeal === undefined || lastMeal === null) {
    const state: FastingState = { status: 'no_data', lastMealAt: null, lastMealLoggedAt: null, fastingMinutes: 0, goalHours, goalMet: false }
    return { ...state, dismiss }
  }

  const lastMealTime = new Date(lastMeal.logged_at)

  if (dismissedAt === lastMeal.logged_at) {
    const state: FastingState = { status: 'dismissed', lastMealAt: lastMealTime, lastMealLoggedAt: lastMeal.logged_at, fastingMinutes: 0, goalHours, goalMet: false }
    return { ...state, dismiss }
  }

  if (dismissedAt && dismissedAt !== lastMeal.logged_at) {
    localStorage.removeItem(DISMISSED_KEY)
  }

  const diffMs = now.getTime() - lastMealTime.getTime()
  const fastingMinutes = Math.max(0, Math.floor(diffMs / 60_000))
  const goalMet = fastingMinutes >= goalHours * 60

  const state: FastingState = {
    status: 'fasting',
    lastMealAt: lastMealTime,
    lastMealLoggedAt: lastMeal.logged_at,
    fastingMinutes,
    goalHours,
    goalMet,
  }
  return { ...state, dismiss }
}

export async function breakFast(lastMealAt: Date, fastingMinutes: number, goalHours: number) {
  const durationHours = Math.round((fastingMinutes / 60) * 10) / 10

  await db.table('fastingRecords').add({
    date: getLogicalDate(),
    start_time: lastMealAt.toISOString(),
    end_time: nowISO(),
    duration_hours: durationHours,
    goal_hours: goalHours,
    goal_met: fastingMinutes >= goalHours * 60,
    was_broken_early: false,
  })

  if (fastingMinutes >= goalHours * 60) {
    await awardPoints('fasting_goal_met')
    triggerCompanionMessage('fasting_goal')
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

      if (diffHours > 0 && diffHours < 36) {
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
