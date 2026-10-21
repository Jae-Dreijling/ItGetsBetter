import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { changeCloseness, closenessTier } from './closeness'
import { nicknameFor, speakingName } from './nicknames'
import { closenessChange, pickQuestion, asksToday, QUESTIONS } from './companionQuestions'
import { traitsOf } from './companionPersonality'
import { EMPTY_MESSAGES } from '../hooks/useCompanion'

const traits = (t: Parameters<typeof traitsOf>[0]) => traitsOf(t)

describe('closeness', () => {
  beforeEach(clearDb)

  it('grows from nothing, stops at 100, and never undoes what the Journey gave', async () => {
    expect(await changeCloseness(1, 5)).toBe(5)
    await db.gameCompanionAffinity.where('companion_id').equals(1).modify({ affinity: 98 })
    expect(await changeCloseness(1, 5)).toBe(100)
    await db.gameCompanionAffinity.where('companion_id').equals(1).modify({ affinity: 140 })
    expect(await changeCloseness(1, 3)).toBe(140)
    expect(await changeCloseness(1, -1)).toBe(139)
  })

  it('has tiers', () => {
    expect([closenessTier(0), closenessTier(25), closenessTier(70), closenessTier(10, true)]).toEqual(['new', 'friend', 'close', 'lover'])
  })
})

describe('nicknames', () => {
  it('uses your name at first, then its own nicknames, else ones that fit its character', () => {
    const sassy = traits({ traits: { sassy: 2 } })
    expect(nicknameFor(EMPTY_MESSAGES, sassy, 'new', 1)).toBeNull()
    expect(['trouble', 'dork']).toContain(nicknameFor(EMPTY_MESSAGES, sassy, 'friend', 1))
    expect(nicknameFor({ ...EMPTY_MESSAGES, nickname_close: ['Your Majesty'] }, sassy, 'close', 7)).toBe('Your Majesty')
    // Always the same one for the same companion.
    expect(nicknameFor(EMPTY_MESSAGES, sassy, 'friend', 3)).toBe(nicknameFor(EMPTY_MESSAGES, sassy, 'friend', 3))
  })

  it('calls you by it about half the time', () => {
    expect(speakingName('Jae', 'dork', 0.2)).toBe('dork')
    expect(speakingName('Jae', 'dork', 0.8)).toBe('Jae')
    expect(speakingName('Jae', null, 0.2)).toBe('Jae')
  })
})

describe('replies', () => {
  it('lands differently per character', () => {
    expect(closenessChange('blunt', traits(undefined))).toBeLessThan(0)
    expect(closenessChange('blunt', traits({ traits: { sassy: 2 } }))).toBeGreaterThanOrEqual(closenessChange('warm', traits(undefined)))
    expect(closenessChange('blunt', traits({ traits: { shy: 2 } }))).toBeLessThan(closenessChange('blunt', traits(undefined)))
    expect(closenessChange('playful', traits({ traits: { playful: 2 } }))).toBe(4)
  })

  it('asks on about three days in five, and not the same question again soon', () => {
    const asked = Array.from({ length: 1000 }, (_, i) => asksToday(i * 7919)).filter(Boolean).length
    expect(asked).toBeGreaterThan(500)
    expect(asked).toBeLessThan(700)
    const recent = QUESTIONS.slice(0, QUESTIONS.length - 1).map(q => q.id)
    expect(pickQuestion(12345, recent).id).toBe(QUESTIONS.at(-1)!.id)
  })
})
