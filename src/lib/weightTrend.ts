import { differenceInCalendarDays, format, parseISO, startOfWeek, subDays } from 'date-fns'

// The weight trend (V2-PLAN §7, step 9a). A single weigh-in is mostly noise
// (water, salt, a big meal, the cycle, sleep), so the main number is a
// smoothed trend: an exponential moving average, Hacker's Diet style, that
// takes the days between weigh-ins into account (weigh-ins are irregular,
// e.g. 2-3 a week via the Daily Check).

// Per day, today's weigh-in moves the trend 10% of the way.
const DAILY_SMOOTHING = 0.1
// A weigh-in this far from the trend gets an explanation.
const JUMP_KG = 1

export type WeightDisplay = 'every' | 'weekly' | 'hidden'

export interface TrendPoint {
  date: string
  // The day's weigh-in (average of that day's entries).
  weight: number
  trend: number
}

const round1 = (n: number) => Math.round(n * 10) / 10

// One point per day that has a weigh-in, oldest first.
export function trendSeries(entries: { date: string; value_kg: number }[]): TrendPoint[] {
  const byDay = new Map<string, number[]>()
  for (const e of entries) byDay.set(e.date, [...(byDay.get(e.date) ?? []), e.value_kg])
  const days = [...byDay.keys()].sort()

  const points: TrendPoint[] = []
  let trend = 0
  let previous: string | null = null
  for (const date of days) {
    const values = byDay.get(date)!
    const weight = values.reduce((a, b) => a + b, 0) / values.length
    if (previous === null) trend = weight
    else {
      // A gap of d days counts as d days of smoothing.
      const gap = Math.max(1, differenceInCalendarDays(parseISO(date), parseISO(previous)))
      const alpha = 1 - (1 - DAILY_SMOOTHING) ** gap
      trend = trend + alpha * (weight - trend)
    }
    points.push({ date, weight: round1(weight), trend: round1(trend) })
    previous = date
  }
  return points
}

// The trend on a date: the last point on or before it.
export function trendOn(series: TrendPoint[], date: string): number | null {
  const before = series.filter(p => p.date <= date)
  return before.length ? before[before.length - 1].trend : null
}

// How the trend moved over the last `days` days, or null without enough history.
export function trendChange(series: TrendPoint[], today: string, days = 14): number | null {
  const now = trendOn(series, today)
  const then = trendOn(series, format(subDays(parseISO(today), days), 'yyyy-MM-dd'))
  return now === null || then === null ? null : round1(now - then)
}

// A calm explanation when a weigh-in is far from the trend; null otherwise.
export function jumpNote(point: TrendPoint | undefined): string | null {
  if (!point) return null
  const diff = point.weight - point.trend
  if (diff >= JUMP_KG) return 'A weigh-in above your trend is usually water: salt, a big meal, your cycle, less sleep. The trend barely moved.'
  if (diff <= -JUMP_KG) return "A low day. Nice, but it's mostly water too; the trend moves slowly, and that's the number that counts."
  return null
}

// "−0.8 kg in 2 weeks" / "steady over 2 weeks"; never framed as failing.
export function changeText(change: number | null): string | null {
  if (change === null) return null
  if (Math.abs(change) < 0.2) return 'Steady over 2 weeks'
  return `${change > 0 ? '+' : '−'}${Math.abs(change).toFixed(1)} kg in 2 weeks`
}

export interface WeekAverage {
  weekStart: string
  average: number
  weighIns: number
}

// Weekly averages, newest first, for the "weekly only" display.
export function weeklyAverages(entries: { date: string; value_kg: number }[]): WeekAverage[] {
  const byWeek = new Map<string, number[]>()
  for (const e of entries) {
    const week = format(startOfWeek(parseISO(e.date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    byWeek.set(week, [...(byWeek.get(week) ?? []), e.value_kg])
  }
  return [...byWeek.entries()]
    .map(([weekStart, values]) => ({ weekStart, average: round1(values.reduce((a, b) => a + b, 0) / values.length), weighIns: values.length }))
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
}
