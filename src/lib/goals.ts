import { format, parseISO } from 'date-fns'
import type { GoalMilestone } from '../types'

// Mini-goals (V2-PLAN §14, step 8): your own tracks of milestones, ticked off
// by hand. Only the next step is shown big. No deadlines by default; an "aim
// for" date is a hint, and passing it changes nothing (Rulebook 5.2).

export interface GoalTemplate {
  name: string
  emoji: string
  milestones: string[]
}

export const TEMPLATES: GoalTemplate[] = [
  { name: 'Guitar', emoji: '🎸', milestones: ['Learn 4 basic chords', 'Play a full song', 'Play with a strum pattern', 'Learn barre chords', 'Play for a friend'] },
  { name: 'Sleep', emoji: '😴', milestones: ['In bed before midnight three nights', 'A full week in bed before midnight', 'Phone out of the bedroom for a week'] },
  { name: 'Strength', emoji: '💪', milestones: ['10 push-ups on your knees', 'Hold a plank for 30 seconds', '10 full push-ups', 'Three workouts in one week', 'Hold a plank for a minute'] },
  { name: 'Reading', emoji: '📚', milestones: ['Read 10 pages a day for a week', 'Finish a book', 'Finish three books', 'Read something from a new genre'] },
  { name: 'Dance', emoji: '💃', milestones: ['Survive a full class without a break', 'Learn a full routine', 'Go to a social'] },
]

// Weight steps relative to where you started, ending in a reassess.
export function weightTemplate(): GoalTemplate {
  return { name: 'Weight', emoji: '⚖️', milestones: ['−2 kg from where I started', '−5 kg from where I started', 'First smaller clothing size', 'Reassess and pick my next goal'] }
}

export function sortMilestones(milestones: GoalMilestone[]): GoalMilestone[] {
  return [...milestones].sort((a, b) => a.order - b.order)
}

// The first milestone in order that isn't done yet.
export function nextMilestone(milestones: GoalMilestone[]): GoalMilestone | null {
  return sortMilestones(milestones).find(m => !m.done_at) ?? null
}

export function progress(milestones: GoalMilestone[]): { done: number; total: number } {
  return { done: milestones.filter(m => m.done_at).length, total: milestones.length }
}

// New orders after moving one milestone up or down a place (0, 1, 2, ...).
export function reorder(milestones: GoalMilestone[], id: number, direction: -1 | 1): Map<number, number> {
  const list = sortMilestones(milestones)
  const i = list.findIndex(m => m.id === id)
  const j = i + direction
  if (i >= 0 && j >= 0 && j < list.length) [list[i], list[j]] = [list[j], list[i]]
  return new Map(list.map((m, index) => [m.id!, index]))
}

// "Aim for 3 Nov · Treat: new strings", or nothing.
export function milestoneExtras(milestone: GoalMilestone): string {
  return [
    milestone.done_at ? `Reached ${format(new Date(milestone.done_at), 'd MMM')}` : milestone.aim_for ? `Aim for ${format(parseISO(milestone.aim_for), 'd MMM')}` : null,
    milestone.treat ? `Treat: ${milestone.treat}` : null,
  ].filter(Boolean).join(' · ')
}
