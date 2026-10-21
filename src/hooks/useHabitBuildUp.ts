import { useLiveQuery } from 'dexie-react-hooks'
import { addDays, format } from 'date-fns'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { pickHabitPrompt, WINDOW_DAYS, type HabitPrompt } from '../lib/habitBuildUp'
import type { Habit } from '../types'

// Building habits up slowly (lib/habitBuildUp): today's question, if any,
// and the answers to it.

export interface HabitPromptState {
  prompt: HabitPrompt | null
  // The longest-waiting habits in your queue, to offer as the next one.
  queue: Habit[]
}

export function useHabitPrompt() {
  const today = getLogicalDate()
  return useLiveQuery(async (): Promise<HabitPromptState> => {
    const from = format(addDays(new Date(`${today}T12:00:00`), -(2 * WINDOW_DAYS + 1)), 'yyyy-MM-dd')
    const [habits, completions] = await Promise.all([
      db.habits.toArray(),
      db.habitCompletions.where('date').aboveOrEqual(from).toArray(),
    ])
    const done = new Map<number, Set<string>>()
    for (const c of completions) {
      if (!done.has(c.habit_id)) done.set(c.habit_id, new Set())
      done.get(c.habit_id)!.add(c.date)
    }
    const queue = habits.filter(h => h.is_queued).sort((a, b) => a.created_at.localeCompare(b.created_at))
    return { prompt: pickHabitPrompt(habits, done, today), queue }
  }, [today])
}

export function useBuiltHabits() {
  return useLiveQuery(() => db.habits.filter(h => !!h.built_at && !h.is_active).toArray())
}

const later = (days: number) => format(addDays(new Date(`${getLogicalDate()}T12:00:00`), days), 'yyyy-MM-dd')

// "Take on another": this habit won't ask again; the picked one (if any)
// starts now.
export async function answerSettled(habitId: number, pickedId: number | null) {
  await db.transaction('rw', db.habits, async () => {
    await db.habits.update(habitId, { settled_at: nowISO() })
    if (pickedId !== null) await db.habits.update(pickedId, { is_active: true, is_queued: false, activated_at: nowISO() })
  })
}

// "Not yet" / "keep tracking": ask about this habit again after a while.
export async function snoozeHabitPrompt(habitId: number, days: number) {
  await db.habits.update(habitId, { prompt_snooze_until: later(days) })
}

// It's a real habit now: off Plan and Today, into Built habits, with a win
// in the jar.
export async function markHabitBuilt(habit: Habit) {
  await db.transaction('rw', db.habits, db.wins, async () => {
    await db.habits.update(habit.id!, { is_active: false, is_queued: false, is_floor: false, built_at: nowISO() })
    await db.wins.add({ date: getLogicalDate(), text: `Made “${habit.title}” a real habit`, source: 'milestone', logged_at: nowISO() })
  })
}

// It slipped (or you just want it back): tracking starts fresh.
export async function callBackHabit(id: number) {
  await db.habits.update(id, { is_active: true, is_queued: false, built_at: null, settled_at: null, prompt_snooze_until: null, activated_at: nowISO() })
}
