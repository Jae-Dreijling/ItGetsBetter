import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'

export function useMotivationNotes(category?: string) {
  return useLiveQuery(async () => {
    const all = await db.motivationNotes.orderBy('created_at').reverse().toArray()
    return category ? all.filter(n => n.category === category) : all
  }, [category])
}

export async function addMotivationNote(category: string, text: string) {
  await db.motivationNotes.add({ category, text, created_at: nowISO() })
}

export async function deleteMotivationNote(id: number) {
  await db.motivationNotes.delete(id)
}
