import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { EMPTY_MESSAGES } from '../hooks/useCompanion'
import { isMinor, slipsNow } from './ageGroup'
import { closenessTier, tierLabel } from './closeness'
import { traitsOf } from './companionPersonality'
import { setLoverStatus, getCompanionAffinityRecord } from './game'
import { parseCompanionFile, planCompanionImport, applyCompanionImport } from './companionTransfer'

describe('minors', () => {
  beforeEach(clearDb)

  it('are never Lovers: their top levels are Besties and Family', () => {
    expect(closenessTier(95, true, true)).toBe('family')
    expect(closenessTier(70, false, true)).toBe('close')
    expect(tierLabel('close', true)).toBe('Besties')
    expect(tierLabel('close', false)).toBe('Close')
    expect(closenessTier(95, true, false)).toBe('lover')
  })

  it('have no romantic trait, whatever was set', () => {
    expect(traitsOf({ traits: { romantic: 2 }, age_group: 'minor' }).romantic).toBe(0)
    expect(traitsOf({ traits: { romantic: 2 } }).romantic).toBe(2)
  })

  it('slip only when close or family, only on warm moments', () => {
    expect(slipsNow(true, 'close', 'habit_completed', 0.01)).toBe(true)
    expect(slipsNow(true, 'friend', 'habit_completed', 0.01)).toBe(false)
    expect(slipsNow(true, 'family', 'mood_low', 0.01)).toBe(false)
    expect(slipsNow(false, 'close', 'habit_completed', 0.01)).toBe(false)
  })

  it('cannot be made a Lover in the Journey', async () => {
    const kid = await db.companions.add({ name: 'Morty', avatar: null, is_default: false, is_active: true, personality_group_id: null, messages: EMPTY_MESSAGES, age_group: 'minor', created_at: '' }) as number
    await db.gameCompanionAffinity.add({ companion_id: kid, affinity: 120, is_lover: false, lover_dialogue: [], home_region: 'ponyville', is_discovered: true, last_visit_at: null, created_at: '' })
    await setLoverStatus(kid, true)
    expect((await getCompanionAffinityRecord(kid))?.is_lover).toBe(false)
  })

  it('companion files carry the age group, and re-importing sets it', async () => {
    const id = await db.companions.add({ name: 'Spike', avatar: null, is_default: false, is_active: true, personality_group_id: null, messages: EMPTY_MESSAGES, created_at: '' }) as number
    await db.gameCompanionAffinity.add({ companion_id: id, affinity: 30, is_lover: true, lover_dialogue: ['old lover line'], home_region: 'ponyville', is_discovered: true, last_visit_at: null, created_at: '' })
    expect(isMinor(await db.companions.get(id))).toBe(false)
    const file = parseCompanionFile(JSON.stringify({
      format: 'itgetsbetter-companions', version: 1, exported_at: '', personality_groups: [],
      companions: [{ name: 'Spike', avatar: null, personality_group: null, messages: {}, lover_dialogue: [], home_region: null, age_group: 'minor' }],
    }))
    if (!file.ok) throw new Error(file.error)
    await applyCompanionImport(planCompanionImport(file.file, await db.companions.toArray(), []), { update: true })
    expect(isMinor(await db.companions.get(id))).toBe(true)
    // Lover lines and status from an older import are cleared.
    expect(await getCompanionAffinityRecord(id)).toMatchObject({ lover_dialogue: [], is_lover: false })
  })
})
