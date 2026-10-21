import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
import { EMPTY_MESSAGES } from './useCompanion'
import type { CompanionMessages } from '../types'


export function usePersonalityGroups() {
  return useLiveQuery(() => db.personalityGroups.toArray())
}


export async function addPersonalityGroup(name: string) {
  return db.personalityGroups.add({
    name,
    description: '',
    messages: { ...EMPTY_MESSAGES },
    created_at: nowISO(),
  })
}

export async function updatePersonalityGroup(id: number, changes: Partial<{ name: string; description: string; messages: CompanionMessages }>) {
  await db.personalityGroups.update(id, changes)
}

export async function deletePersonalityGroup(id: number) {
  await db.transaction('rw', [db.personalityGroups, db.companions], async () => {
    await db.companions.where('personality_group_id').equals(id).modify({ personality_group_id: null })
    await db.personalityGroups.delete(id)
  })
}

// Seeds a starter library of personality types (MLP Mane-Six-inspired archetypes
// plus a few originals) exactly once — deleting them afterward is respected,
// they won't come back on the next app open.
export const SEEDED_KEY = 'igb_personality_groups_seeded'

export async function ensureDefaultPersonalityGroups() {
  if (localStorage.getItem(SEEDED_KEY)) return
  localStorage.setItem(SEEDED_KEY, '1')

  // 44 KB of message text, only needed this once, so loaded on demand. If that
  // download fails, clear the flag so the next app start tries again.
  let DEFAULT_PERSONALITY_GROUPS
  try {
    ({ DEFAULT_PERSONALITY_GROUPS } = await import('../lib/defaultPersonalityGroups'))
  } catch (err) {
    localStorage.removeItem(SEEDED_KEY)
    throw err
  }
  for (const preset of DEFAULT_PERSONALITY_GROUPS) {
    await db.personalityGroups.add({
      name: preset.name,
      description: preset.description,
      messages: preset.messages,
      created_at: nowISO(),
    })
  }
}
