import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { getLogicalDate } from './date'
import type { Habit, Weekday } from '../types'

// Building habits up slowly (V2-PLAN step 10g, EIGHT-JOURNEYS-LESSONS §4.1).
// A habit is "settled" after a month at 70% or more: the companion then
// offers the next one from your queue. At 90% or more two months in a row
// it's "built": the companion suggests you stop tracking it. Both are only
// questions; nothing is ever blocked, and only what you did is counted.

export const WINDOW_DAYS = 30
export const SETTLED_RATE = 0.7
export const BUILT_RATE = 0.9
// "Not yet" waits this long before asking again; "keep tracking" longer.
export const SNOOZE_SETTLED_DAYS = 14
export const SNOOZE_BUILT_DAYS = 30

const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const shift = (date: string, days: number) => format(addDays(parseISO(date), days), 'yyyy-MM-dd')

export interface Score {
  done: number
  total: number
}

// How often the habit was done in the `days` days ending at `end`, counted
// per scheduled day: every day, the chosen weekdays, or (weekly) per week.
// Monthly habits are too rare to judge in a month, so they get null.
export function score(habit: Pick<Habit, 'frequency' | 'custom_days'>, doneDates: Set<string>, end: string, days = WINDOW_DAYS): Score | null {
  const dates = Array.from({ length: days }, (_, i) => shift(end, -i))
  if (habit.frequency === 'monthly') return null
  if (habit.frequency === 'weekly') {
    const weeks = Math.floor(days / 7)
    let done = 0
    for (let w = 0; w < weeks; w++) if (dates.slice(w * 7, w * 7 + 7).some(d => doneDates.has(d))) done++
    return { done, total: weeks }
  }
  const scheduled = habit.frequency === 'custom'
    ? dates.filter(d => habit.custom_days.includes(WEEKDAYS[parseISO(d).getDay()]))
    : dates
  if (scheduled.length === 0) return null
  return { done: scheduled.filter(d => doneDates.has(d)).length, total: scheduled.length }
}

const rate = (s: Score | null) => (s ? s.done / s.total : 0)

export interface HabitPrompt {
  kind: 'settled' | 'built'
  habit: Habit
  score: Score
}

// The one question to ask today, if any: "built" before "settled", the
// longest-running habit first. Today only counts once it's done, so an
// evening habit isn't judged in the morning.
export function pickHabitPrompt(habits: Habit[], doneByHabit: Map<number, Set<string>>, today: string): HabitPrompt | null {
  const candidates: HabitPrompt[] = []
  const running = habits
    .filter(h => h.is_active && h.activated_at && !h.built_at)
    .filter(h => !h.prompt_snooze_until || h.prompt_snooze_until <= today)
    .sort((a, b) => a.activated_at!.localeCompare(b.activated_at!))

  for (const habit of running) {
    const done = doneByHabit.get(habit.id!) ?? new Set<string>()
    const end = done.has(today) ? today : shift(today, -1)
    const age = differenceInCalendarDays(parseISO(end), parseISO(getLogicalDate(new Date(habit.activated_at!)))) + 1
    const last = score(habit, done, end)
    if (!last) continue
    if (age >= 2 * WINDOW_DAYS && rate(last) >= BUILT_RATE && rate(score(habit, done, shift(end, -WINDOW_DAYS))) >= BUILT_RATE) {
      candidates.push({ kind: 'built', habit, score: last })
    } else if (!habit.settled_at && age >= WINDOW_DAYS && rate(last) >= SETTLED_RATE) {
      candidates.push({ kind: 'settled', habit, score: last })
    }
  }
  return candidates.find(c => c.kind === 'built') ?? candidates[0] ?? null
}

// What the companion says. Each character can have its own lines (the
// habit_settled / habit_built categories); these are the built-in ones.
export const DEFAULT_PROMPT_LINES: Record<HabitPrompt['kind'], string[]> = {
  settled: [
    'Hey {name}! You did “{habit}” {done} out of {total} days. That’s such a good job! Want to take on another habit?',
    '{done} of the last {total} days of “{habit}”, {name}! It’s really settling in. Ready for a new one?',
    'Look at you, {name}: “{habit}” {done} out of {total} days. Shall we add one more habit?',
  ],
  built: [
    'Wow, {name}, you’ve turned “{habit}” into a real habit! Shall we stop tracking it and put it with your built habits? If it ever slips, you can just call it back.',
    '“{habit}” is part of you now, {name}. {done} of {total} days, two months running! Want to stop tracking it?',
  ],
}

export function fillLine(line: string, values: { name: string; habit: string; done: number; total: number }): string {
  return line
    .replaceAll('{name}', values.name)
    .replaceAll('{habit}', values.habit)
    .replaceAll('{done}', String(values.done))
    .replaceAll('{total}', String(values.total))
}
