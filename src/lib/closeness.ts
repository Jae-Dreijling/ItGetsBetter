import { db } from '../db'
import { nowISO } from './date'

// Closeness (COMPANION-PLAN 11c): how close you are with a companion. It's
// the same affinity the Journey uses (-100 to 200, a Lover above 100), so
// both grow it. Moments in the app can raise it to 100 at most; becoming a
// Lover stays a Journey thing.

export type ClosenessTier = 'new' | 'friend' | 'close' | 'lover'

export function closenessTier(affinity: number | null | undefined, isLover = false): ClosenessTier {
  if (isLover) return 'lover'
  const a = affinity ?? 0
  return a >= 60 ? 'close' : a >= 20 ? 'friend' : 'new'
}

export const TIER_LABELS: Record<ClosenessTier, string> = {
  new: 'Getting to know you',
  friend: 'Friends',
  close: 'Close',
  lover: 'Lovers',
}

const APP_CAP = 100

export async function changeCloseness(companionId: number, delta: number): Promise<number> {
  const existing = await db.gameCompanionAffinity.where('companion_id').equals(companionId).first()
  if (existing) {
    const raised = existing.affinity + delta
    // Gains stop at the cap, but never pull down what the Journey gave.
    const next = delta > 0 ? Math.max(existing.affinity, Math.min(APP_CAP, raised)) : Math.max(-100, raised)
    await db.gameCompanionAffinity.update(existing.id!, { affinity: next })
    return next
  }
  const start = Math.max(-100, Math.min(APP_CAP, delta))
  await db.gameCompanionAffinity.add({
    companion_id: companionId, affinity: start, is_lover: false, lover_dialogue: [], home_region: 'ponyville',
    is_discovered: false, last_visit_at: null, created_at: nowISO(),
  })
  return start
}
