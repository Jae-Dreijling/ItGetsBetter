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
