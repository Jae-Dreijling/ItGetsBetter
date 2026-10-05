import type { GameQuestObjective } from '../types'

// The feature system (Rulebook 2.4): lots of features, all optional, few
// asking for attention. Every optional feature has a tier:
//   spotlight: on the Today screen, may remind or nudge (max SPOTLIGHT_CAP)
//   available: reachable in the tabs and menus, but quiet
//   off:       hidden everywhere (menus, reminders, quests); data is kept
// The core (Today, Daily Check, companion, settings) is not in this list and
// can't be switched off.

export type FeatureTier = 'spotlight' | 'available' | 'off'

export type FeatureId =
  | 'weight' | 'meals' | 'water' | 'fasting' | 'exercise' | 'mood' | 'sleep' | 'medicine' | 'measurements' | 'photos'
  | 'habits' | 'tasks' | 'focus_timer'
  | 'timeline' | 'insights' | 'graphs' | 'weekly_review' | 'achievements'
  | 'meditation' | 'grocery' | 'books' | 'motivation_vault'
  | 'journey' | 'rewards'

export type FeatureGroup = 'Tracking' | 'Planning' | 'Progress' | 'Tools' | 'Fun'

export interface Feature {
  id: FeatureId
  name: string
  emoji: string
  description: string
  group: FeatureGroup
  // Pages that belong to the feature, used to hide menu entries when it's off.
  paths: string[]
  // Whether it has something worth showing on the Today screen.
  canSpotlight: boolean
  questObjectives?: GameQuestObjective[]
}

export type FeatureTiers = Partial<Record<FeatureId, FeatureTier>>

export const SPOTLIGHT_CAP = 3
export const FEATURE_GROUPS: FeatureGroup[] = ['Tracking', 'Planning', 'Progress', 'Tools', 'Fun']

export const FEATURES: Feature[] = [
  { id: 'weight', name: 'Weight', emoji: '⚖️', description: 'Weigh-ins and your trend', group: 'Tracking', paths: ['/log/weight'], canSpotlight: true, questObjectives: ['log_weight'] },
  { id: 'meals', name: 'Meals', emoji: '🍽️', description: 'What you eat', group: 'Tracking', paths: ['/log/meal'], canSpotlight: true, questObjectives: ['log_meals'] },
  { id: 'water', name: 'Water', emoji: '💧', description: 'How much you drink', group: 'Tracking', paths: ['/log/water'], canSpotlight: true, questObjectives: ['log_water'] },
  { id: 'fasting', name: 'Fasting', emoji: '⏱️', description: 'Fasting timer', group: 'Tracking', paths: ['/log/fasting'], canSpotlight: true },
  { id: 'exercise', name: 'Exercise', emoji: '🏃', description: 'Workouts and movement', group: 'Tracking', paths: ['/log/exercise'], canSpotlight: true, questObjectives: ['log_exercise'] },
  { id: 'mood', name: 'Mood', emoji: '🙂', description: 'How you feel', group: 'Tracking', paths: ['/log/mood'], canSpotlight: true, questObjectives: ['log_mood'] },
  { id: 'sleep', name: 'Sleep', emoji: '😴', description: "Last night's sleep", group: 'Tracking', paths: ['/log/sleep'], canSpotlight: true, questObjectives: ['log_sleep'] },
  { id: 'medicine', name: 'Medicine', emoji: '💊', description: 'Medication and reminders', group: 'Tracking', paths: ['/log/medicine'], canSpotlight: true, questObjectives: ['log_medicine'] },
  { id: 'measurements', name: 'Body measurements', emoji: '📏', description: 'Waist, chest and more', group: 'Tracking', paths: ['/me/measurements'], canSpotlight: false },
  { id: 'photos', name: 'Progress photos', emoji: '📸', description: 'Before and after', group: 'Tracking', paths: ['/me/photos'], canSpotlight: false },
  { id: 'habits', name: 'Habits', emoji: '✅', description: 'Small daily routines', group: 'Planning', paths: ['/todo/habits'], canSpotlight: true, questObjectives: ['complete_habits'] },
  { id: 'tasks', name: 'Tasks', emoji: '📝', description: 'One-off to-dos', group: 'Planning', paths: ['/todo/tasks'], canSpotlight: true },
  { id: 'focus_timer', name: 'Focus timer', emoji: '🍅', description: 'Pomodoro sessions', group: 'Planning', paths: ['/todo/pomodoro'], canSpotlight: false },
  { id: 'timeline', name: 'My Day', emoji: '🕒', description: 'Everything you logged, in order', group: 'Progress', paths: ['/me/timeline'], canSpotlight: false },
  { id: 'insights', name: 'Health insights', emoji: '💡', description: 'Patterns in your data', group: 'Progress', paths: ['/me/insights'], canSpotlight: false },
  { id: 'graphs', name: 'Graphs', emoji: '📈', description: 'Charts and trends', group: 'Progress', paths: ['/me/graphs'], canSpotlight: false },
  { id: 'weekly_review', name: 'Weekly review', emoji: '🗓️', description: 'Your week at a glance', group: 'Progress', paths: ['/me/review'], canSpotlight: false },
  { id: 'achievements', name: 'Achievements', emoji: '🏆', description: 'Milestones and victories', group: 'Progress', paths: ['/me/achievements'], canSpotlight: false },
  { id: 'meditation', name: 'Meditation', emoji: '🧘', description: 'Timed calm sessions', group: 'Tools', paths: ['/me/meditation'], canSpotlight: false },
  { id: 'grocery', name: 'Grocery lists', emoji: '🛒', description: 'Shopping lists and templates', group: 'Tools', paths: ['/me/grocery'], canSpotlight: false },
  { id: 'books', name: 'Books', emoji: '📚', description: "What you're reading", group: 'Tools', paths: ['/me/books'], canSpotlight: false },
  { id: 'motivation_vault', name: 'Motivation vault', emoji: '🔥', description: 'Your reasons why', group: 'Tools', paths: ['/me/vault'], canSpotlight: false },
  { id: 'journey', name: 'Journey', emoji: '🗺️', description: 'The adventure game: quests, bosses, character', group: 'Fun', paths: ['/journey', '/me/character'], canSpotlight: true },
  { id: 'rewards', name: 'Reward shop', emoji: '🎁', description: 'Spend points on treats', group: 'Fun', paths: ['/me/rewards'], canSpotlight: false },
]

const BY_ID = new Map(FEATURES.map(f => [f.id, f]))

export function getFeature(id: FeatureId): Feature {
  return BY_ID.get(id)!
}

export function tierOf(tiers: FeatureTiers | undefined, id: FeatureId): FeatureTier {
  const tier = tiers?.[id] ?? 'available'
  // A stored spotlight on a feature that can't be spotlighted counts as on.
  return tier === 'spotlight' && !getFeature(id).canSpotlight ? 'available' : tier
}

export function isOn(tiers: FeatureTiers | undefined, id: FeatureId): boolean {
  return tierOf(tiers, id) !== 'off'
}

export function isSpotlight(tiers: FeatureTiers | undefined, id: FeatureId): boolean {
  return tierOf(tiers, id) === 'spotlight'
}

export function spotlightCount(tiers: FeatureTiers | undefined): number {
  return FEATURES.filter(f => isSpotlight(tiers, f.id)).length
}

// Returns the new tiers, or null when the spotlight is already full.
export function withTier(tiers: FeatureTiers | undefined, id: FeatureId, tier: FeatureTier): FeatureTiers | null {
  if (tier === 'spotlight') {
    if (!getFeature(id).canSpotlight) return null
    if (!isSpotlight(tiers, id) && spotlightCount(tiers) >= SPOTLIGHT_CAP) return null
  }
  return { ...tiers, [id]: tier }
}

// Whether a page should appear in menus. Pages that belong to no feature
// (settings, companions, ...) are always shown.
export function isPathOn(tiers: FeatureTiers | undefined, path: string): boolean {
  const feature = FEATURES.find(f => f.paths.some(p => path === p || path.startsWith(p + '/')))
  return !feature || isOn(tiers, feature.id)
}

// Game quests may only be about features that are on (Rulebook 2.4).
export function isQuestObjectiveOn(tiers: FeatureTiers | undefined, objective: GameQuestObjective): boolean {
  const feature = FEATURES.find(f => f.questObjectives?.includes(objective))
  return !feature || isOn(tiers, feature.id)
}
