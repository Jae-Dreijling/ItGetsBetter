import { describe, it, expect } from 'vitest'
import { initialSelection, picksToTiers, STARTER_FEATURES } from './featurePicker'
import { FEATURES } from './features'

describe('feature picker', () => {
  it('starts a new user with the starter set', () => {
    expect([...initialSelection({})].sort()).toEqual([...STARTER_FEATURES].sort())
  })

  it('preselects what an existing user already uses, plus views over their data', () => {
    const selected = initialSelection({ weight: true, books: true, water: false })
    expect(selected.has('weight')).toBe(true)
    expect(selected.has('books')).toBe(true)
    expect(selected.has('water')).toBe(false)
    expect(selected.has('graphs')).toBe(true)
    expect(selected.has('grocery')).toBe(false)
  })

  it('turns picks into tiers: selected on, spotlight starred, the rest off', () => {
    const tiers = picksToTiers(new Set(['weight', 'sleep', 'graphs']), new Set(['sleep']))
    expect(tiers.weight).toBe('available')
    expect(tiers.sleep).toBe('spotlight')
    expect(tiers.graphs).toBe('available')
    expect(tiers.water).toBe('off')
    expect(Object.keys(tiers)).toHaveLength(FEATURES.length)
  })

  it('never spotlights more than the cap or unselected features', () => {
    const all = new Set(FEATURES.map(f => f.id))
    const tiers = picksToTiers(new Set(['weight', 'sleep', 'mood', 'water']), all)
    expect(Object.values(tiers).filter(t => t === 'spotlight')).toHaveLength(3)
    expect(tiers.journey).toBe('off')
  })
})
