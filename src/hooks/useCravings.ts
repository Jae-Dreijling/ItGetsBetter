import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { isWin, MAX_POINTS_PER_DAY, type CravingOutcome } from '../lib/craving'
import { awardPoints } from './usePoints'
import { triggerCompanionMessage } from '../lib/companionMessenger'
import type { CravingEvent } from '../types'

export function useCravingEvents() {
  return useLiveQuery(() => db.cravingEvents.orderBy('date').toArray()) ?? []
}

// Finishing the flow: logged, a win for "passed" or "a portion", and points
// for checking in at all (a few times a day at most).
export async function finishCraving(data: Omit<CravingEvent, 'id' | 'date' | 'logged_at'>) {
  const today = getLogicalDate()
  await db.cravingEvents.add({ ...data, date: today, logged_at: nowISO() })
  if (isWin(data.outcome)) {
    await db.wins.add({ date: today, text: winText(data.outcome, data.trigger), source: 'craving', logged_at: nowISO() })
  }
  const paidToday = await db.pointsTransactions.where('date').equals(today).filter(t => t.source_type === 'craving_checked').count()
  if (paidToday < MAX_POINTS_PER_DAY) await awardPoints('craving_checked')
  if (data.outcome !== 'had_it') triggerCompanionMessage('achievement_unlocked')
}

function winText(outcome: CravingOutcome, trigger: string | null): string {
  const why = trigger && trigger !== 'something else' ? ` (${trigger})` : ''
  return outcome === 'passed' ? `Rode out a craving${why}` : `Had a portion on purpose${why}`
}

export async function addInsteadIdea(text: string) {
  const profile = await db.userProfile.toCollection().first()
  if (!profile?.id || !text.trim()) return
  const own = profile.craving_instead ?? []
  if (!own.includes(text.trim())) await db.userProfile.update(profile.id, { craving_instead: [text.trim(), ...own] })
}
