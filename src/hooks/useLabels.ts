import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'

export function useLabels() {
  return useLiveQuery(() => db.labels.toArray())
}

export async function addLabel(name: string, color: string) {
  return db.labels.add({ name, color, created_at: nowISO() })
}

export async function updateLabel(id: number, changes: { name?: string; color?: string }) {
  await db.labels.update(id, changes)
}

export async function deleteLabel(id: number) {
  await db.labels.delete(id)
}
