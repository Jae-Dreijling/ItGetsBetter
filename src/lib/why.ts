import { differenceInCalendarDays, parseISO } from 'date-fns'
import { seededRandom } from './dailyCheck'
import type { MotivationNote } from '../types'

// Your "why" at the right moments (V2-PLAN §8, step 10b): a reason from the
// Motivation Vault in the craving flow, on a low-mood day and when you come
// back after a break. Only written reasons; nothing shows when there are none.

export const BREAK_DAYS = 3

// A reason from the preferred categories if there is one, else any. The
// seed keeps it the same while you're on that screen.
export function pickReason(notes: MotivationNote[], prefer: string[], seed: string): MotivationNote | null {
  const written = notes.filter(n => n.text.trim()).sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
  if (written.length === 0) return null
  const preferred = written.filter(n => prefer.includes(n.category))
  const pool = preferred.length ? preferred : written
  return pool[Math.floor(seededRandom(seed) * pool.length)]
}

// Whether today is the first visit after a break of BREAK_DAYS or more,
// judged by the last day the app was opened before today.
export function backAfterBreak(openDates: string[], today: string): boolean {
  const before = openDates.filter(d => d < today).sort()
  const last = before.at(-1)
  return !!last && differenceInCalendarDays(parseISO(today), parseISO(last)) >= BREAK_DAYS
}
