import { describe, it, expect } from 'vitest'
import { tierOf, isOn, withTier, spotlightCount, isPathOn, isQuestObjectiveOn, SPOTLIGHT_CAP, FEATURES } from './features'

describe('feature tiers', () => {
  it('defaults every feature to available', () => {
    expect(tierOf(undefined, 'water')).toBe('available')
    expect(isOn({}, 'books')).toBe(true)
  })

  it('caps the spotlight', () => {
    let tiers = withTier({}, 'water', 'spotlight')!
    tiers = withTier(tiers, 'habits', 'spotlight')!
    tiers = withTier(tiers, 'medicine', 'spotlight')!
    expect(spotlightCount(tiers)).toBe(SPOTLIGHT_CAP)
    expect(withTier(tiers, 'sleep', 'spotlight')).toBeNull()
    // Re-selecting something already in the spotlight is fine.
    expect(withTier(tiers, 'water', 'spotlight')).not.toBeNull()
    // Freeing a slot makes room again.
    const freed = withTier(tiers, 'water', 'available')!
    expect(withTier(freed, 'sleep', 'spotlight')).not.toBeNull()
  })

  it("won't spotlight features with nothing to show on Today", () => {
    expect(withTier({}, 'graphs', 'spotlight')).toBeNull()
    expect(tierOf({ graphs: 'spotlight' }, 'graphs')).toBe('available')
  })

  it('hides pages of switched-off features, including their sub-pages', () => {
    const tiers = { journey: 'off' as const, water: 'off' as const }
    expect(isPathOn(tiers, '/log/water')).toBe(false)
    expect(isPathOn(tiers, '/journey/map')).toBe(false)
    expect(isPathOn(tiers, '/log/weight')).toBe(true)
    expect(isPathOn(tiers, '/settings')).toBe(true)
  })

  it('drops quests about switched-off features', () => {
    expect(isQuestObjectiveOn({ water: 'off' }, 'log_water')).toBe(false)
    expect(isQuestObjectiveOn({ water: 'off' }, 'log_sleep')).toBe(true)
  })

  it('has unique ids and paths', () => {
    const ids = FEATURES.map(f => f.id)
    const paths = FEATURES.flatMap(f => f.paths)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(paths).size).toBe(paths.length)
  })
})
