import type { FeatureId } from './features'

// The Daily Check: one tracking question a day on the Today screen, picked by
// weighted chance ("surprise me"). Recently logged things are less likely,
// long gaps more likely. The pick is seeded by the date, then stored for the
// day, so it never changes after the user logs something.

export type CheckKind = 'weight' | 'sleep' | 'mood' | 'water' | 'measurements' | 'photo' | 'win'

export interface CheckDefinition {
  kind: CheckKind
  // The feature it belongs to; a switched-off feature is never asked about.
  feature: FeatureId | null
  // Base chance relative to the others.
  weight: number
  // After this many days without an entry, the chance doubles.
  staleAfterDays: number
}

export const CHECKS: CheckDefinition[] = [
  { kind: 'weight', feature: 'weight', weight: 35, staleAfterDays: 4 },
  { kind: 'sleep', feature: 'sleep', weight: 20, staleAfterDays: 3 },
  { kind: 'mood', feature: 'mood', weight: 20, staleAfterDays: 3 },
  { kind: 'water', feature: 'water', weight: 10, staleAfterDays: 3 },
  { kind: 'measurements', feature: 'measurements', weight: 5, staleAfterDays: 28 },
  { kind: 'photo', feature: 'photos', weight: 5, staleAfterDays: 28 },
  { kind: 'win', feature: null, weight: 5, staleAfterDays: 7 },
]

const RECENT_FACTOR = 0.3
const STALE_FACTOR = 2

// Deterministic 0..1 random number per day (FNV-1a hash into mulberry32).
export function seededRandom(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let t = (h + 0x6d2b79f5) >>> 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// daysSince: days since the last entry of each kind (null = never logged).
export function checkWeights(
  eligible: CheckKind[],
  daysSince: Partial<Record<CheckKind, number | null>>,
): { kind: CheckKind; weight: number }[] {
  return CHECKS.filter(c => eligible.includes(c.kind)).map(c => {
    const days = daysSince[c.kind]
    let weight = c.weight
    if (days !== null && days !== undefined && days <= 1) weight *= RECENT_FACTOR
    else if (days === null || days === undefined || days >= c.staleAfterDays) weight *= STALE_FACTOR
    return { kind: c.kind, weight }
  })
}

export function pickCheck(
  date: string,
  eligible: CheckKind[],
  daysSince: Partial<Record<CheckKind, number | null>>,
): CheckKind | null {
  const weights = checkWeights(eligible, daysSince)
  const total = weights.reduce((sum, w) => sum + w.weight, 0)
  if (total === 0) return null
  let roll = seededRandom(`daily-check:${date}`) * total
  for (const w of weights) {
    roll -= w.weight
    if (roll < 0) return w.kind
  }
  return weights[weights.length - 1].kind
}
