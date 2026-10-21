import { addMonths, addYears, format, parseISO } from 'date-fns'
import type { FutureLetter, GoalMilestone } from '../types'

// Letters to your future self (V2-PLAN §8, step 10c): written now, sealed
// until a date or until a goal step is reached. Opening early is allowed
// (with a second tap): nothing here is meant to lock you out.

export const DATE_PRESETS: { label: string; date: (from: Date) => Date }[] = [
  { label: 'In a month', date: d => addMonths(d, 1) },
  { label: 'In 3 months', date: d => addMonths(d, 3) },
  { label: 'In 6 months', date: d => addMonths(d, 6) },
  { label: 'In a year', date: d => addYears(d, 1) },
]

// Ready to open: its date has come, or its goal step was reached. A step
// that no longer exists makes the letter ready rather than sealing it forever.
export function isReady(letter: FutureLetter, today: string, milestones: Map<number, GoalMilestone>): boolean {
  if (letter.unlock.kind === 'date') return letter.unlock.date <= today
  const step = milestones.get(letter.unlock.milestone_id)
  return !step || !!step.done_at
}

export function unlockLabel(letter: FutureLetter, milestones: Map<number, GoalMilestone>): string {
  if (letter.unlock.kind === 'date') return `Opens ${format(parseISO(letter.unlock.date), 'd MMMM yyyy')}`
  const step = milestones.get(letter.unlock.milestone_id)
  return step ? `Opens when you reach: ${step.text}` : 'Its goal step is gone, so it can be opened'
}
