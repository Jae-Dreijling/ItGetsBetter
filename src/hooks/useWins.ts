import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { triggerCompanionMessage } from '../lib/companionMessenger'

export function useWins() {
  return useLiveQuery(() => db.wins.toArray())
}

export async function addOwnWin(text: string) {
  if (!text.trim()) return
  await db.wins.add({ date: getLogicalDate(), text: text.trim(), source: 'own', logged_at: nowISO() })
  triggerCompanionMessage('win_added')
}

export async function deleteWin(id: number) {
  await db.wins.delete(id)
}
