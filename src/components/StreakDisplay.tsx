import type { HabitFrequency, Weekday } from '../types'

interface StreakDisplayProps {
  completedCount: number
  frequency: HabitFrequency
  customDays?: Weekday[]
  lookbackDays?: number
}

function getExpectedCount(frequency: HabitFrequency, customDays: Weekday[], lookbackDays: number): { expected: number; unit: string } {
  if (frequency === 'daily') {
    return { expected: lookbackDays, unit: 'days' }
  }
  if (frequency === 'weekly') {
    const weeks = Math.floor(lookbackDays / 7)
    return { expected: weeks, unit: 'weeks' }
  }
  if (frequency === 'monthly') {
    const months = Math.floor(lookbackDays / 30)
    return { expected: Math.max(months, 1), unit: 'months' }
  }
  if (frequency === 'custom' && customDays.length > 0) {
    const scheduledPerWeek = customDays.length
    const weeks = lookbackDays / 7
    const expected = Math.round(scheduledPerWeek * weeks)
    return { expected, unit: 'days' }
  }
  return { expected: lookbackDays, unit: 'days' }
}

export default function StreakDisplay({ completedCount, frequency, customDays = [], lookbackDays = 21 }: StreakDisplayProps) {
  const { expected, unit } = getExpectedCount(frequency, customDays, lookbackDays)

  return (
    <span className="text-xs text-muted">
      {completedCount} of {expected} {unit}
    </span>
  )
}
