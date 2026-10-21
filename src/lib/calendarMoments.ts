import { parseISO } from 'date-fns'
import type { CompanionEvent } from '../hooks/useCompanion'
import type { TriggerValues } from './companionTriggers'

// Time and calendar (COMPANION-PLAN 11g): holidays, a year together, the
// start and end of the week, a companion's birthday and rare shiny days.
// Pure; appOpenMoment decides when to say them (once a day).

export const HOLIDAYS: Record<string, string> = {
  '01-01': 'New Year',
  '02-14': "Valentine's Day",
  '04-27': "King's Day",
  '10-31': 'Halloween',
  '12-05': 'Sinterklaas',
  '12-24': 'Christmas Eve',
  '12-25': 'Christmas',
  '12-31': "New Year's Eve",
}

const mmdd = (date: string) => date.slice(5)

export function holidayOn(date: string): string | null {
  return HOLIDAYS[mmdd(date)] ?? null
}

// Full years since you started, on the day itself.
export function yearsTogether(startedOn: string, date: string): number {
  if (mmdd(startedOn) !== mmdd(date)) return 0
  return Math.max(0, parseISO(date).getFullYear() - parseISO(startedOn).getFullYear())
}

export function isBirthday(birthday: string | null | undefined, date: string): boolean {
  return !!birthday && birthday === mmdd(date)
}

// About one day in a hundred, per companion, the same all day.
export function isShinyDay(companionId: number, date: string): boolean {
  let h = companionId
  for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(h) % 100 === 0
}

// Monday mornings, Friday evenings and weekend mornings.
export function weekMoment(now: Date): { event: CompanionEvent; values: TriggerValues } | null {
  const day = now.getDay()
  const hour = now.getHours()
  if (day === 1 && hour < 12) return { event: 'monday_morning', values: {} }
  if (day === 5 && hour >= 17) return { event: 'friday_evening', values: {} }
  if ((day === 0 || day === 6) && hour < 12) return { event: 'weekend_morning', values: {} }
  return null
}
