import type { HabitProgression } from '../types'

const TIME_UNITS = ['sec', 'secs', 'second', 'seconds', 's']
const MINUTE_UNITS = ['min', 'mins', 'minute', 'minutes', 'm']

export function formatProgressionValue(value: number, unit: string): string {
  const unitLower = unit.toLowerCase().trim()

  if (TIME_UNITS.includes(unitLower)) {
    if (value >= 3600) {
      const hours = Math.floor(value / 3600)
      const mins = Math.floor((value % 3600) / 60)
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
    }
    if (value >= 60) {
      const mins = Math.floor(value / 60)
      const secs = value % 60
      return secs > 0 ? `${mins}min ${secs}s` : `${mins}min`
    }
    return `${value}s`
  }

  if (MINUTE_UNITS.includes(unitLower)) {
    if (value >= 60) {
      const hours = Math.floor(value / 60)
      const mins = value % 60
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
    }
    return `${value}min`
  }

  return `${value} ${unit}`
}

export function getNextValue(progression: HabitProgression): number {
  const next = progression.current_value + progression.increment
  if (progression.cap !== null && next >= progression.cap) {
    return progression.cap
  }
  return next
}

export function shouldAdvance(
  progression: HabitProgression,
  completionsInPeriod: number,
  totalDaysInPeriod: number
): boolean {
  if (!progression.enabled || progression.paused || progression.is_mastered) return false

  if (totalDaysInPeriod < progression.interval_days) return false

  const consistency = completionsInPeriod / totalDaysInPeriod
  return consistency >= 0.75
}
