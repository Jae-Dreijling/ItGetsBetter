import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { getLogicalDate } from './date'

// Abstinence counters (V2-PLAN §9). A slip never resets anything that counts:
// the main number is free days in the last 30 ("27 of 30"), and the longest
// run, total free days and milestones only ever grow. This counters the
// "I've ruined it anyway" spiral (the abstinence violation effect).

export const WINDOW_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

export const MILESTONES: { days: number; label: string }[] = [
  { days: 1, label: '1 day' },
  { days: 3, label: '3 days' },
  { days: 7, label: '1 week' },
  { days: 14, label: '2 weeks' },
  { days: 30, label: '1 month' },
  { days: 60, label: '2 months' },
  { days: 90, label: '3 months' },
  { days: 182, label: '6 months' },
  { days: 365, label: '1 year' },
]

export const SLIP_CONTEXTS = ['stressed', 'bored', 'social', 'tired', 'hungry', 'sad'] as const

export interface AbstinenceStats {
  currentRunMs: number
  longestRunMs: number
  // Free days in the window, and how many days the window covers (fewer
  // than 30 when the counter is newer than that).
  freeInWindow: number
  windowDays: number
  totalFreeDays: number
  milestonesReached: number
}

// Days are logical dates (3 AM boundary), so a slip at 1 AM belongs to the night before.
function dayOf(iso: string): string {
  return getLogicalDate(new Date(iso))
}

function daysBetween(from: string, to: string): string[] {
  const n = differenceInCalendarDays(parseISO(to), parseISO(from))
  return Array.from({ length: Math.max(0, n + 1) }, (_, i) => format(addDays(parseISO(from), i), 'yyyy-MM-dd'))
}

// Stats for a counter started at `startedAt`, with slips at the given times.
// Slips before the start are ignored.
export function abstinenceStats(startedAt: string, slipTimes: string[], now: Date): AbstinenceStats {
  const start = new Date(startedAt).getTime()
  const slips = slipTimes
    .map(t => new Date(t).getTime())
    .filter(t => t >= start && t <= now.getTime())
    .sort((a, b) => a - b)

  // Runs are the gaps between start, each slip and now.
  const points = [start, ...slips, now.getTime()]
  let longestRunMs = 0
  for (let i = 1; i < points.length; i++) longestRunMs = Math.max(longestRunMs, points[i] - points[i - 1])
  const currentRunMs = now.getTime() - points[points.length - 2]

  const today = getLogicalDate(now)
  const firstDay = dayOf(startedAt)
  const slipDays = new Set(slips.map(t => dayOf(new Date(t).toISOString())))
  const allDays = daysBetween(firstDay, today)
  const windowDays = allDays.slice(-WINDOW_DAYS)

  return {
    currentRunMs,
    longestRunMs,
    freeInWindow: windowDays.filter(d => !slipDays.has(d)).length,
    windowDays: windowDays.length,
    totalFreeDays: allDays.filter(d => !slipDays.has(d)).length,
    milestonesReached: MILESTONES.filter(m => longestRunMs >= m.days * DAY_MS).length,
  }
}

// "12 days, 4 hours" / "3 hours, 20 min" / "5 min".
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const mins = minutes % 60
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
  if (days > 0) return `${plural(days, 'day')}, ${plural(hours, 'hour')}`
  if (hours > 0) return `${plural(hours, 'hour')}, ${mins} min`
  return `${mins} min`
}

export function wholeDays(ms: number): number {
  return Math.floor(ms / DAY_MS)
}

// What to say right after "it happened": the good days first.
export function slipMessage(stats: AbstinenceStats): string {
  const good = stats.freeInWindow
  if (stats.windowDays <= 1) return "Logged. That took honesty. The timer's running again."
  return `${good} of ${stats.windowDays} is still ${good} good day${good === 1 ? '' : 's'}. The timer's running again.`
}

// How often each context came up, most common first.
export function contextCounts(contexts: (string | null)[]): [string, number][] {
  const counts = new Map<string, number>()
  for (const c of contexts) if (c) counts.set(c, (counts.get(c) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}
