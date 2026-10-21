import { differenceInCalendarDays, parseISO } from 'date-fns'

// Non-scale wins (V2-PLAN §7 step 9c, Eight Journeys 5.2): a monthly
// check-in on what's changed beyond the scale, shown next to the weight
// trend. Each item is "better" or "about the same" (or skipped); there's no
// "worse", so nothing is framed as failing. Every "better" becomes a win.

export type NonScaleAnswer = 'better' | 'same'

export const NON_SCALE_ITEMS: { key: string; emoji: string; label: string; win: string }[] = [
  { key: 'energy', emoji: '⚡', label: 'Energy', win: 'More energy' },
  { key: 'clothes', emoji: '👕', label: 'How clothes fit', win: 'Clothes fit better' },
  { key: 'moving', emoji: '🚶', label: 'Moving: stairs, walks, dancing', win: 'Moving feels easier' },
  { key: 'sleep', emoji: '😴', label: 'Sleep', win: 'Sleeping better' },
  { key: 'cravings', emoji: '🍪', label: 'Cravings and comfort eating', win: 'Cravings feel more manageable' },
  { key: 'mood', emoji: '🙂', label: 'Mood and confidence', win: 'Feeling better about myself' },
]

// About once a month.
export const CHECK_EVERY_DAYS = 28

export function isCheckDue(lastDate: string | null, today: string): boolean {
  return !lastDate || differenceInCalendarDays(parseISO(today), parseISO(lastDate)) >= CHECK_EVERY_DAYS
}

// The wins a check-in adds to the wins jar, in item order, plus the note.
export function winsFrom(answers: Record<string, NonScaleAnswer>, note: string | null): string[] {
  const wins = NON_SCALE_ITEMS.filter(item => answers[item.key] === 'better').map(item => item.win)
  if (note?.trim()) wins.push(note.trim())
  return wins
}

// "more energy · clothes fit better", or null when nothing was better.
export function summary(answers: Record<string, NonScaleAnswer>): string | null {
  const better = NON_SCALE_ITEMS.filter(item => answers[item.key] === 'better').map(item => item.win.toLowerCase())
  return better.length ? better.join(' · ') : null
}
