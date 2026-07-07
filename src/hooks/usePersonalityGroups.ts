import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
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
    messages: { ...EMPTY_MESSAGES },
    created_at: nowISO(),
  })
}

export async function updatePersonalityGroup(id: number, changes: Partial<{ name: string; messages: CompanionMessages }>) {
  await db.personalityGroups.update(id, changes)
}

export async function deletePersonalityGroup(id: number) {
  await db.transaction('rw', [db.personalityGroups, db.companions], async () => {
    await db.companions.where('personality_group_id').equals(id).modify({ personality_group_id: null })
    await db.personalityGroups.delete(id)
  })
}
