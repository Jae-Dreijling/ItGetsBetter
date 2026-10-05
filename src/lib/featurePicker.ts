import { FEATURES, SPOTLIGHT_CAP, getFeature, type FeatureId, type FeatureTiers } from './features'

// The one-time "what would you like to use?" picker shown when 2.0 first
// opens. Features the user already has data in start selected, so an existing
// user mostly deselects; a new user starts from a small, calm starter set.

export const STARTER_FEATURES: FeatureId[] = ['weight', 'mood', 'sleep', 'habits', 'tasks', 'timeline', 'achievements']

// Features that track nothing themselves (views and tools): selected for an
// existing user, since they work on top of the data that's already there.
const NO_DATA_OF_THEIR_OWN: FeatureId[] = ['focus_timer', 'timeline', 'insights', 'graphs', 'weekly_review', 'achievements', 'meditation']

export function initialSelection(used: Partial<Record<FeatureId, boolean>>): Set<FeatureId> {
  const hasAnyData = Object.values(used).some(Boolean)
  if (!hasAnyData) return new Set(STARTER_FEATURES)
  return new Set(FEATURES.map(f => f.id).filter(id => used[id] || NO_DATA_OF_THEIR_OWN.includes(id)))
}

// Selected features become on (or spotlight), everything else off.
export function picksToTiers(selected: Set<FeatureId>, spotlight: Set<FeatureId>): FeatureTiers {
  const tiers: FeatureTiers = {}
  let spotlit = 0
  for (const feature of FEATURES) {
    if (!selected.has(feature.id)) {
      tiers[feature.id] = 'off'
    } else if (spotlight.has(feature.id) && getFeature(feature.id).canSpotlight && spotlit < SPOTLIGHT_CAP) {
      tiers[feature.id] = 'spotlight'
      spotlit++
    } else {
      tiers[feature.id] = 'available'
    }
  }
  return tiers
}
