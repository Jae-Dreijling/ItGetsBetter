import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { awardPoints } from './usePoints'
import { triggerCompanionMessage } from '../lib/companionMessenger'
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

// undefined while loading, null when the habit doesn't exist.
export function useHabit(id: number) {
  return useLiveQuery(async () => (await db.habits.get(id)) ?? null, [id])
}

export function useTodaysCompletions() {
  const today = getLogicalDate()
  return useLiveQuery(
    () => db.habitCompletions.where('date').equals(today).toArray(),
    [today]
  )
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
  chain_id?: string | null
  chain_order?: number
  is_queued?: boolean
}) {
  await db.habits.add({
    title: data.title,
    label_ids: data.label_ids,
    frequency: data.frequency,
    custom_days: data.custom_days ?? [],
    cant_fail_description: data.cant_fail_description ?? null,
    progression: data.progression ?? null,
    chain_id: data.chain_id ?? null,
    chain_order: data.chain_order ?? 0,
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
  chain_id: string | null
  chain_order: number
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

export async function toggleHabitCompletion(habitId: number, cantFail: boolean = false) {
  const today = getLogicalDate()
  const existing = await db.habitCompletions
    .where('habit_id').equals(habitId)
    .and(c => c.date === today)
    .first()

  if (existing) {
    await db.habitCompletions.delete(existing.id!)
  } else {
    const wasFirstEver = (await db.habitCompletions.count()) === 0
    const id = await db.habitCompletions.add({
      habit_id: habitId,
      date: today,
      is_cant_fail: cantFail,
      logged_at: nowISO(),
    })
    await awardPoints(cantFail ? 'habit_cant_fail' : 'habit_completed', id as number)
    if (wasFirstEver) triggerCompanionMessage('first_milestone')
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

// Marks exactly these habits as the daily floor (see lib/floor).
export async function setFloorHabits(ids: number[]) {
  await db.transaction('rw', db.habits, async () => {
    const habits = await db.habits.toArray()
    for (const habit of habits) {
      const shouldBeFloor = ids.includes(habit.id!)
      if (!!habit.is_floor !== shouldBeFloor) await db.habits.update(habit.id!, { is_floor: shouldBeFloor })
    }
  })
}
