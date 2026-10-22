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

// Also takes the label off every habit and task that had it.
export async function deleteLabel(id: number) {
  await db.transaction('rw', [db.labels, db.habits, db.tasks], async () => {
    await db.habits.filter(h => h.label_ids?.includes(id)).modify(h => { h.label_ids = h.label_ids.filter(l => l !== id) })
    await db.tasks.filter(t => t.label_ids?.includes(id)).modify(t => { t.label_ids = t.label_ids.filter(l => l !== id) })
    await db.labels.delete(id)
  })
}
