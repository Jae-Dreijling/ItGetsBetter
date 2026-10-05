import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
import { DEFAULT_PERSONALITY_GROUPS } from '../lib/defaultPersonalityGroups'
import type { CompanionMessages } from '../types'

const EMPTY_MESSAGES: CompanionMessages = {
  general: [], morning_greeting: [], welcome_back: [], achievement_unlocked: [],
  habit_completed: [], task_completed: [], mood_low: [], fasting_goal: [], streak_milestone: [],
  phone_free: [], points_earned: [], weight_loss: [], weight_gain: [], exercise_logged: [],
  water_goal_met: [], sleep_logged: [], personal_best: [], level_up: [], boss_defeated: [],
  goodnight: [], first_milestone: [], idle: [],
}

export function usePersonalityGroups() {
  return useLiveQuery(() => db.personalityGroups.toArray())
}

export function usePersonalityGroup(id: number | null) {
  return useLiveQuery(() => id == null ? undefined : db.personalityGroups.get(id), [id])
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

  for (const preset of DEFAULT_PERSONALITY_GROUPS) {
    await db.personalityGroups.add({
      name: preset.name,
      description: preset.description,
      messages: preset.messages,
      created_at: nowISO(),
    })
  }
}
