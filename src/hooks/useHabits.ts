import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import type { HabitFrequency, Weekday } from '../types'

export function useActiveHabits() {
  return useLiveQuery(() =>
    db.habits.filter(h => h.is_active === true).toArray()
  )
}

export function useQueuedHabits() {
  return useLiveQuery(() =>
    db.habits.filter(h => h.is_queued === true).toArray()
  )
}

export function useInactiveHabits() {
  return useLiveQuery(() =>
    db.habits.filter(h => h.is_active === false && h.is_queued === false).toArray()
  )
}

export function useAllHabits() {
  return useLiveQuery(() => db.habits.toArray())
}

export function useTodaysCompletions() {
  const today = getLogicalDate()
  return useLiveQuery(
    () => db.habitCompletions.where('date').equals(today).toArray(),
    [today]
  )
}

export function useHabitCompletions(habitId: number, days: number = 21) {
  return useLiveQuery(() => {
    const now = new Date()
    const from = new Date(now)
    from.setDate(from.getDate() - days)
    const fromStr = from.toISOString().slice(0, 10)
    return db.habitCompletions
      .where('habit_id').equals(habitId)
      .and(c => c.date >= fromStr)
      .toArray()
  }, [habitId, days])
}

export function isTodayScheduled(habit: { frequency: HabitFrequency; custom_days?: Weekday[] }): boolean {
  if (habit.frequency === 'daily') return true
  if (habit.frequency === 'weekly') {
    const dayOfWeek = new Date().getDay()
    return dayOfWeek === 1
  }
  if (habit.frequency === 'monthly') {
    return new Date().getDate() === 1
  }
  if (habit.frequency === 'custom' && habit.custom_days) {
    const dayMap: Record<number, Weekday> = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' }
    const today = dayMap[new Date().getDay()]
    return habit.custom_days.includes(today)
  }
  return true
}

export async function addHabit(data: {
  title: string
  label_ids: number[]
  frequency: HabitFrequency
  custom_days?: Weekday[]
  is_queued?: boolean
}) {
  await db.habits.add({
    title: data.title,
    label_ids: data.label_ids,
    frequency: data.frequency,
    custom_days: data.custom_days ?? [],
    is_active: !data.is_queued,
    is_queued: data.is_queued ?? false,
    activated_at: data.is_queued ? null : nowISO(),
    created_at: nowISO(),
  })
}

export async function updateHabit(id: number, changes: Partial<{
  title: string
  label_ids: number[]
  frequency: HabitFrequency
  custom_days: Weekday[]
  is_active: boolean
  is_queued: boolean
}>) {
  await db.habits.update(id, changes)
}

export async function activateHabit(id: number) {
  await db.habits.update(id, { is_active: true, is_queued: false, activated_at: nowISO() })
}

export async function deactivateHabit(id: number) {
  await db.habits.update(id, { is_active: false, is_queued: false })
}

export async function deleteHabit(id: number) {
  await db.transaction('rw', [db.habits, db.habitCompletions], async () => {
    await db.habitCompletions.where('habit_id').equals(id).delete()
    await db.habits.delete(id)
  })
}

export async function toggleHabitCompletion(habitId: number) {
  const today = getLogicalDate()
  const existing = await db.habitCompletions
    .where('habit_id').equals(habitId)
    .and(c => c.date === today)
    .first()

  if (existing) {
    await db.habitCompletions.delete(existing.id!)
  } else {
    await db.habitCompletions.add({
      habit_id: habitId,
      date: today,
      logged_at: nowISO(),
    })
  }
}
