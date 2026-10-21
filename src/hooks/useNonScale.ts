import { useLiveQuery } from 'dexie-react-hooks'
import { subDays, format, parseISO } from 'date-fns'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { winsFrom, CHECK_EVERY_DAYS, type NonScaleAnswer } from '../lib/nonScale'
import { awardPoints } from './usePoints'
import { triggerCompanionMessage } from '../lib/companionMessenger'

export function useLastNonScaleCheck() {
  return useLiveQuery(async () => (await db.nonScaleChecks.orderBy('date').last()) ?? null)
}

// Saves a check-in: each "better" (and the note) becomes a win, points once
// per month, and the companion celebrates.
export async function saveNonScaleCheck(answers: Record<string, NonScaleAnswer>, note: string | null) {
  const today = getLogicalDate()
  await db.nonScaleChecks.add({ date: today, answers, note: note?.trim() || null, logged_at: nowISO() })
  for (const text of winsFrom(answers, note)) {
    await db.wins.add({ date: today, text, source: 'non_scale', logged_at: nowISO() })
  }
  const since = format(subDays(parseISO(today), CHECK_EVERY_DAYS - 1), 'yyyy-MM-dd')
  const paidRecently = await db.pointsTransactions
    .where('date').aboveOrEqual(since)
    .filter(t => t.source_type === 'non_scale_check')
    .count()
  if (!paidRecently) await awardPoints('non_scale_check')
  triggerCompanionMessage('achievement_unlocked')
}
