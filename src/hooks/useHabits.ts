import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { awardPoints } from './usePoints'
import { shouldAdvance, getNextValue } from '../lib/progression'
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
    const from = new Date()
    from.setDate(from.getDate() - days)
    from.setHours(12, 0, 0, 0)
    const fromStr = getLogicalDate(from)
    return db.habitCompletions
      .where('habit_id').equals(habitId)
      .and(c => c.date >= fromStr)
      .toArray()
  }, [habitId, days])
}

export function isTodayScheduled(habit: { frequency: HabitFrequency; custom_days?: Weekday[] }): boolean {
  if (habit.frequency === 'daily') return true
  if (habit.frequency === 'weekly') {
    return true
  }
  if (habit.frequency === 'monthly') {
    return true
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
  cant_fail_description?: string | null
  progression?: import('../types').HabitProgression | null
  is_queued?: boolean
}) {
  await db.habits.add({
    title: data.title,
    label_ids: data.label_ids,
    frequency: data.frequency,
    custom_days: data.custom_days ?? [],
    cant_fail_description: data.cant_fail_description ?? null,
    progression: data.progression ?? null,
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
  cant_fail_description: string | null
  progression: import('../types').HabitProgression | null
  is_active: boolean
  is_queued: boolean
}>) {
  await db.habits.update(id, changes)
}

export interface HabitFormationStatus {
  habitId: number
  habitTitle: string
  daysSinceActivation: number
  completionsInWindow: number
  requiredCompletions: number
  consistency: number
  isFormed: boolean
}

export async function getHabitFormationStatus(habitId: number): Promise<HabitFormationStatus | null> {
  const habit = await db.habits.get(habitId)
  if (!habit || !habit.is_active || !habit.activated_at) return null

  const activatedDate = new Date(habit.activated_at)
  const now = new Date()
  const daysSince = Math.floor((now.getTime() - activatedDate.getTime()) / (1000 * 60 * 60 * 24))
  const window = Math.min(daysSince, 30)

  if (window < 1) return { habitId: habit.id!, habitTitle: habit.title, daysSinceActivation: 0, completionsInWindow: 0, requiredCompletions: 23, consistency: 0, isFormed: false }

  const fromDate = new Date(now)
  fromDate.setDate(fromDate.getDate() - window)
  fromDate.setHours(12, 0, 0, 0)
  const fromStr = getLogicalDate(fromDate)

  const completions = await db.habitCompletions
    .where('habit_id').equals(habit.id!)
    .and(c => c.date >= fromStr)
    .toArray()

  const requiredCompletions = Math.ceil(30 * 0.75)
  const consistency = window > 0 ? Math.round((completions.length / window) * 100) : 0
  const isFormed = daysSince >= 30 && completions.length >= requiredCompletions

  return {
    habitId: habit.id!,
    habitTitle: habit.title,
    daysSinceActivation: daysSince,
    completionsInWindow: completions.length,
    requiredCompletions,
    consistency,
    isFormed,
  }
}

export async function canActivateInCategory(labelIds: number[]): Promise<{ allowed: boolean; blockingHabit?: string }> {
  const activeHabits = await db.habits
    .filter(h => h.is_active === true && h.activated_at !== null)
    .toArray()

  for (const habit of activeHabits) {
    const overlap = habit.label_ids.some(id => labelIds.includes(id))
    if (!overlap) continue

    const status = await getHabitFormationStatus(habit.id!)
    if (status && !status.isFormed) {
      return { allowed: false, blockingHabit: `"${habit.title}" needs ${30 - status.daysSinceActivation} more days (${status.consistency}% consistency)` }
    }
  }
  return { allowed: true }
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

export async function toggleHabitCompletion(habitId: number, cantFail: boolean = false) {
  const today = getLogicalDate()
  const existing = await db.habitCompletions
    .where('habit_id').equals(habitId)
    .and(c => c.date === today)
    .first()

  if (existing) {
    await db.habitCompletions.delete(existing.id!)
  } else {
    const id = await db.habitCompletions.add({
      habit_id: habitId,
      date: today,
      is_cant_fail: cantFail,
      logged_at: nowISO(),
    })
    await awardPoints(cantFail ? 'habit_cant_fail' : 'habit_completed', id as number)
  }
}

export async function checkProgressionAdvancements() {
  const habits = await db.habits.filter(h =>
    h.is_active === true && h.progression !== null && h.progression !== undefined
  ).toArray()

  for (const habit of habits) {
    const prog = habit.progression
    if (!prog || !prog.enabled || prog.paused || prog.is_mastered) continue

    const lastAdvanced = prog.last_advanced_at ? new Date(prog.last_advanced_at) : new Date(habit.activated_at ?? habit.created_at)
    const daysSinceAdvance = Math.floor((Date.now() - lastAdvanced.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceAdvance < prog.interval_days) continue

    const fromDate = new Date(lastAdvanced)
    fromDate.setHours(12, 0, 0, 0)
    const fromStr = getLogicalDate(fromDate)

    const completions = await db.habitCompletions
      .where('habit_id').equals(habit.id!)
      .and(c => c.date >= fromStr)
      .toArray()

    if (shouldAdvance(prog, completions.length, daysSinceAdvance)) {
      const nextValue = getNextValue(prog)
      const isMastered = prog.cap !== null && nextValue >= prog.cap

      await db.habits.update(habit.id!, {
        progression: {
          ...prog,
          current_value: nextValue,
          last_advanced_at: nowISO(),
          is_mastered: isMastered,
        },
      })
    }
  }
}
