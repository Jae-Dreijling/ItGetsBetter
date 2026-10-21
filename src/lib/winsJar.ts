import { format, parseISO } from 'date-fns'
import { seededRandom } from './dailyCheck'
import type { Win } from '../types'

// The wins jar (V2-PLAN §8, step 10a): every win collected anywhere in the
// app, to look back on. Only ever grows by what you did.

export const SOURCE_EMOJI: Record<Win['source'], string> = {
  daily_check: '🗓️',
  milestone: '🎯',
  non_scale: '🌟',
  craving: '🌊',
  own: '✍️',
}

// Newest first, grouped by month ("October 2026").
export function groupByMonth(wins: Win[]): { month: string; wins: Win[] }[] {
  const sorted = [...wins].sort((a, b) => b.date.localeCompare(a.date) || b.logged_at.localeCompare(a.logged_at))
  const groups: { month: string; wins: Win[] }[] = []
  for (const win of sorted) {
    const month = format(parseISO(win.date), 'MMMM yyyy')
    const last = groups.at(-1)
    if (last?.month === month) last.wins.push(win)
    else groups.push({ month, wins: [win] })
  }
  return groups
}

// The same win all day on the Today card, a different one tomorrow.
export function winOfTheDay(wins: Win[], date: string): Win | null {
  if (wins.length === 0) return null
  const sorted = [...wins].sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
  return sorted[Math.floor(seededRandom(`win:${date}`) * sorted.length)]
}
