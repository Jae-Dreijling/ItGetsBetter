import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { triggerCompanionMessage } from '../lib/companionMessenger'
import { isReady } from '../lib/letters'
import type { FutureLetter } from '../types'

export function useLetters() {
  return useLiveQuery(() => db.futureLetters.orderBy('created_at').reverse().toArray())
}

// Letters that can be opened now and haven't been yet.
export function useReadyLetterCount() {
  return useLiveQuery(async () => {
    const letters = await db.futureLetters.filter(l => !l.opened_at).toArray()
    if (letters.length === 0) return 0
    const milestones = new Map((await db.goalMilestones.toArray()).map(m => [m.id!, m]))
    return letters.filter(l => isReady(l, getLogicalDate(), milestones)).length
  }) ?? 0
}

export async function writeLetter(text: string, unlock: FutureLetter['unlock']) {
  await db.futureLetters.add({ text: text.trim(), unlock, opened_at: null, created_at: nowISO() })
  triggerCompanionMessage('letter_sealed')
}

export async function openLetter(id: number) {
  await db.futureLetters.update(id, { opened_at: nowISO() })
  triggerCompanionMessage('letter_opened')
}

export async function deleteLetter(id: number) {
  await db.futureLetters.delete(id)
}
