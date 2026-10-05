import { db } from '../db'
import { useProfile, updateProfile } from './useProfile'
import { withTier, type FeatureId, type FeatureTier, type FeatureTiers } from '../lib/features'

export function useFeatureTiers(): FeatureTiers | undefined {
  const { profile } = useProfile()
  return profile?.feature_tiers
}

// For code outside React (reminders, companion nudges, quest generation).
export async function getFeatureTiers(): Promise<FeatureTiers | undefined> {
  const profile = await db.userProfile.toCollection().first()
  return profile?.feature_tiers
}

// Returns false when the change isn't allowed (spotlight full, or a feature
// that has nothing to show on Today).
export async function setFeatureTier(id: FeatureId, tier: FeatureTier): Promise<boolean> {
  const profile = await db.userProfile.toCollection().first()
  if (!profile?.id) return false
  const next = withTier(profile.feature_tiers, id, tier)
  if (!next) return false
  await updateProfile(profile.id, { feature_tiers: next })
  return true
}

// Which features already have data, so the 2.0 picker can preselect them.
export async function getFeatureUsage(): Promise<Partial<Record<FeatureId, boolean>>> {
  const has = async (table: string) => (await db.table(table).count()) > 0
  const game = await db.gameState.toCollection().first()
  const [weight, meals, water, fasting, exercise, mood, sleep, medicine, measurements, photos, habits, tasks, insights, grocery, books, vault, rewards] =
    await Promise.all([
      has('weightEntries'), has('mealEntries'), has('waterEntries'), has('fastingRecords'), has('exerciseEntries'),
      has('moodEntries'), has('sleepEntries'), has('medicines'), has('measurements'), has('progressPhotos'),
      has('habits'), has('tasks'), has('healthInsights'), has('groceryLists'), has('books'), has('motivationNotes'),
      db.rewards.filter(r => !r.is_preset).count().then(n => n > 0),
    ])
  return {
    weight, meals, water, fasting, exercise, mood, sleep, medicine, measurements, photos, habits, tasks, insights, grocery, books,
    motivation_vault: vault,
    rewards,
    journey: !!game?.activated,
  }
}

export async function saveFeaturePicks(tiers: FeatureTiers | null): Promise<void> {
  const profile = await db.userProfile.toCollection().first()
  if (!profile?.id) return
  await updateProfile(profile.id, {
    ...(tiers ? { feature_tiers: tiers } : {}),
    features_picked_at: new Date().toISOString(),
  })
}
