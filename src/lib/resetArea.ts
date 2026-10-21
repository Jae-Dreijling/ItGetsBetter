import { db } from '../db'
import { SEEDED_KEY } from '../hooks/usePersonalityGroups'
import type { Folder } from '../types'

// Reset one part of the app (Settings → Reset parts of the app) instead of
// everything (Start fresh). Each area lists exactly which tables and stored
// keys it clears; the profile, settings and every other area stay as they are.

export interface ResetArea {
  id: string
  name: string
  emoji: string
  // What goes, in plain words.
  removes: string
  tables: string[]
  // localStorage keys (exact, or prefixes ending in "_") that go with it.
  storage?: string[]
  // The app sets this area up again on start (e.g. the built-in companion).
  reloadAfter?: boolean
  // This list's folders go too (the folders table is shared between lists).
  folders?: Folder['area']
}

export const RESET_AREAS: ResetArea[] = [
  { id: 'weight', name: 'Weight', emoji: '⚖️', removes: 'every weigh-in (your trend starts over)', tables: ['weightEntries'] },
  { id: 'meals', name: 'Meals', emoji: '🍽️', removes: 'every logged meal', tables: ['mealEntries'] },
  { id: 'meal_prep', name: 'Meal prep', emoji: '🥗', removes: 'your recipes and meal plans', tables: ['recipes', 'mealPlanItems'], folders: 'recipes' },
  { id: 'water', name: 'Water', emoji: '💧', removes: 'every water entry', tables: ['waterEntries'] },
  { id: 'exercise', name: 'Exercise', emoji: '🏃', removes: 'every workout', tables: ['exerciseEntries'] },
  { id: 'mood', name: 'Mood', emoji: '🙂', removes: 'every mood entry and your mood tags', tables: ['moodEntries', 'moodTags'] },
  { id: 'sleep', name: 'Sleep', emoji: '😴', removes: 'every sleep entry', tables: ['sleepEntries'] },
  { id: 'medicine', name: 'Medicine', emoji: '💊', removes: 'your medicines and every dose taken', tables: ['medicines', 'medicineLogs'] },
  { id: 'measurements', name: 'Body measurements', emoji: '📏', removes: 'every measurement', tables: ['measurements'] },
  { id: 'photos', name: 'Progress photos', emoji: '📸', removes: 'every progress photo', tables: ['progressPhotos'] },
  { id: 'fasting', name: 'Fasting', emoji: '⏱️', removes: 'your fasting history', tables: ['fastingRecords'] },
  { id: 'habits', name: 'Habits', emoji: '✅', removes: 'your habits and every tick', tables: ['habits', 'habitCompletions'] },
  { id: 'tasks', name: 'Tasks', emoji: '📝', removes: 'your tasks and projects', tables: ['tasks', 'projects'] },
  { id: 'goals', name: 'Goals', emoji: '🎯', removes: 'your goals and their milestones', tables: ['goalTracks', 'goalMilestones'] },
  { id: 'abstinence', name: 'Abstinence', emoji: '🌿', removes: 'your counters and their history', tables: ['abstinenceCounters', 'abstinenceEvents'] },
  { id: 'social', name: 'Social', emoji: '🫂', removes: 'the people on your list and your times together', tables: ['people', 'socialContacts'] },
  { id: 'wins', name: 'Wins jar', emoji: '🏅', removes: 'every win you collected', tables: ['wins'] },
  { id: 'cravings', name: 'Cravings', emoji: '🌊', removes: 'your craving check-ins (your own "instead" ideas are kept)', tables: ['cravingEvents'] },
  { id: 'non_scale', name: 'Beyond the scale', emoji: '🌟', removes: 'your monthly non-scale check-ins', tables: ['nonScaleChecks'] },
  { id: 'letters', name: 'Letters to future you', emoji: '💌', removes: 'every letter, opened or sealed', tables: ['futureLetters'] },
  { id: 'books', name: 'Books', emoji: '📚', removes: 'your books', tables: ['books'] },
  { id: 'grocery', name: 'Grocery lists', emoji: '🛒', removes: 'your lists and templates', tables: ['groceryLists', 'groceryItems'] },
  { id: 'vault', name: 'Motivation vault', emoji: '🔥', removes: 'your notes and photos in the vault', tables: ['motivationNotes'], storage: ['igb_vault_companion_cats'] },
  { id: 'achievements', name: 'Achievements', emoji: '🏆', removes: 'every unlocked achievement (they can be earned again)', tables: ['achievements'] },
  { id: 'points', name: 'Points & reward shop', emoji: '⭐', removes: 'your points, your rewards and what you claimed', tables: ['pointsTransactions', 'rewards', 'rewardClaims'] },
  {
    id: 'journey', name: 'Journey', emoji: '🗺️',
    removes: 'your character, quests, gold, bosses, guild rooms and companion affinity (the game starts over)',
    tables: ['gameState', 'gameQuests', 'gameCompanionAffinity', 'gameCustomQuestions'],
    storage: ['igb_guild_', 'igb_boss_', 'igb_char_class', 'igb_char_level', 'igb_encounter_date', 'igb_fortune_week', 'igb_game_beg_date', 'igb_game_performs'],
  },
  {
    id: 'companions', name: 'Companions', emoji: '💬',
    removes: 'every companion and personality group you made or changed; the built-in companion and the default groups come back',
    tables: ['companions', 'personalityGroups', 'gameCompanionAffinity'],
    folders: 'companions',
    storage: [SEEDED_KEY, 'igb_session_companion_id'],
    reloadAfter: true,
  },
]

function storageKeysFor(patterns: string[]): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && patterns.some(p => (p.endsWith('_') ? key.startsWith(p) : key === p))) keys.push(key)
  }
  return keys
}

export async function resetArea(id: string): Promise<ResetArea> {
  const area = RESET_AREAS.find(a => a.id === id)
  if (!area) throw new Error(`Unknown area: ${id}`)
  await db.transaction('rw', [...area.tables.map(t => db.table(t)), db.folders], async () => {
    for (const t of area.tables) await db.table(t).clear()
    if (area.folders) await db.folders.where('area').equals(area.folders).delete()
  })
  try {
    for (const key of storageKeysFor(area.storage ?? [])) localStorage.removeItem(key)
  } catch { /* storage unavailable: nothing stored to clear */ }
  return area
}
