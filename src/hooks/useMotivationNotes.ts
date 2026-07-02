import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'

const COMPANION_CATS_KEY = 'igb_vault_companion_cats'

export function getCompanionVaultCats(): string[] {
  try { return JSON.parse(localStorage.getItem(COMPANION_CATS_KEY) ?? '[]') } catch { return [] }
}

export function setCompanionVaultCats(cats: string[]) {
  localStorage.setItem(COMPANION_CATS_KEY, JSON.stringify(cats))
}

export async function tryGetMotivationMessage(): Promise<string | null> {
  const enabled = getCompanionVaultCats()
  if (!enabled.length) return null
  const notes = await db.motivationNotes.toArray()
  const eligible = notes.filter(n => enabled.includes(n.category) && n.text.trim())
  if (!eligible.length) return null
  return eligible[Math.floor(Math.random() * eligible.length)].text
}

export function useMotivationNotes(category?: string) {
  return useLiveQuery(async () => {
    const all = await db.motivationNotes.toArray()
    all.sort((a, b) => b.created_at.localeCompare(a.created_at))
    return category ? all.filter(n => n.category === category) : all
  }, [category])
}

export async function addMotivationNote(category: string, text: string, photo: Blob | null = null) {
  await db.motivationNotes.add({ category, text, photo, created_at: nowISO() })
}

export async function deleteMotivationNote(id: number) {
  await db.motivationNotes.delete(id)
}
