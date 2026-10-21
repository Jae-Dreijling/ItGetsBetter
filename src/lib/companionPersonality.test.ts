import { describe, it, expect, vi } from 'vitest'
import {
  traitsOf, dominantTrait, closenessOf, refusesPickup, isThrow, tapsInWindow, jumpsAtFinger, startsPrank, rollsIn, isCalmPlace, cooledDown,
  allows, forcedOn,
} from './companionPersonality'
import { surpriseKinds, surpriseFor, ROMANTIC_COMPLIMENTS } from './companionFun'
import { EMPTY_MESSAGES, getCompanionMessage } from '../hooks/useCompanion'
import { triggerInfo } from './companionTriggers'

vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} })

const traits = (t: Partial<ReturnType<typeof traitsOf>>) => traitsOf({ traits: t })

describe('companion personality', () => {
  it('fills in missing traits with the defaults', () => {
    expect(traitsOf(undefined)).toEqual({ playful: 1, proud: 0, shy: 0, sassy: 0, romantic: 0, nerdy: 0, caring: 1 })
    expect(traits({ proud: 2 }).proud).toBe(2)
  })

  it('picks the strongest trait, sassy and proud first on a tie', () => {
    expect(dominantTrait(traits({ playful: 2, sassy: 2 }))).toBe('sassy')
    expect(dominantTrait(traits({ playful: 0, caring: 0 }))).toBeNull()
    expect(dominantTrait(traits({ romantic: 2, playful: 2 }))).toBe('romantic')
  })

  it('a proud one refuses being moved, less the closer you are', () => {
    const proud = traits({ proud: 2 })
    expect(refusesPickup(proud, 0, 0.4)).toBe(true)
    expect(refusesPickup(proud, 1, 0.4)).toBe(false)
    expect(refusesPickup(traits({}), 0, 0.01)).toBe(false)
  })

  it('knows a throw, quick taps, and when playful things may happen', () => {
    expect(isThrow({ x: 1200, y: 900 })).toBe(true)
    expect(isThrow({ x: 300, y: 200 })).toBe(false)
    expect(tapsInWindow([1000, 2500, 3000, 3100], 3200)).toEqual([2500, 3000, 3100])
    expect(jumpsAtFinger(traits({ playful: 0 }), 1, 0)).toBe(false)
    expect(jumpsAtFinger(traits({ playful: 2 }), 0.5, 0.01)).toBe(true)
    expect(startsPrank(traits({ playful: 1 }), 0.001)).toBe(false)
    expect(startsPrank(traits({ sassy: 2 }), 0.01)).toBe(true)
    expect(rollsIn(traits({ playful: 1 }), true, 0)).toBe(false)
    expect(rollsIn(traits({ sassy: 1 }), true, 0.1)).toBe(true)
    expect(isCalmPlace('/log/craving')).toBe(true)
    expect(isCalmPlace('/me')).toBe(false)
    expect(closenessOf(-40)).toBe(0)
    expect(cooledDown(undefined, 'prank', 0)).toBe(true)
    expect(cooledDown(Date.now(), 'jump', Date.now() + 60_000)).toBe(false)
  })

  it('personal options: its personality decides, unless you set them', () => {
    const lucifer = { traits: { playful: 0, proud: 2, sassy: 0, nerdy: 0, caring: 0 } as const }
    expect(allows(lucifer, 'pranks')).toBe(false)
    expect(allows({ ...lucifer, options: { pranks: true } }, 'pranks')).toBe(true)
    expect(forcedOn({ ...lucifer, options: { pranks: true } }, 'pranks')).toBe(true)
    expect(allows({ traits: { sassy: 1 }, options: { pranks: false } }, 'pranks')).toBe(false)
    expect(allows(lucifer, 'requests')).toBe(false)
    expect(allows(lucifer, 'visits')).toBe(true)
    // Switched on by hand, a prank still happens now and then.
    expect(startsPrank(traitsOf(lucifer), 0.03, true)).toBe(true)
  })

  it('surprises fit the personality: no silly facts from a proud one', () => {
    expect(surpriseKinds(traits({ playful: 0, proud: 2, caring: 0 }), false)).toEqual(['fortune'])
    expect(surpriseKinds(traits({ nerdy: 2 }), true)).toContain('fact')
    expect(surpriseKinds(traits({ romantic: 1 }), true)).toContain('compliment')
    const love = surpriseFor(4, ['compliment'], true)
    expect(love.kind === 'compliment' && ROMANTIC_COMPLIMENTS.includes(love.text)).toBe(true)
  })

  it('handling lines fit the strongest trait unless the companion has its own', () => {
    const proud = traits({ proud: 2 })
    const said = getCompanionMessage(EMPTY_MESSAGES, 'pickup_refused', 'Jae', {}, proud)
    expect(triggerInfo('pickup_refused')!.traitDefaults!.proud!.map(l => l.replace('{name}', 'Jae'))).toContain(said)
    expect(getCompanionMessage({ ...EMPTY_MESSAGES, pickup_refused: ['Mine!'] }, 'pickup_refused', 'Jae', {}, proud)).toBe('Mine!')
  })
})
