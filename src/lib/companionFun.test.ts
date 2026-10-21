import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { seasonOn, wornAccessory, surpriseFor } from './companionFun'
import { giveGift, buyAccessory, wearAccessory, receiveGift } from '../hooks/useCompanionFun'

describe('seasons and accessories', () => {
  it('knows themed weeks, also across the new year', () => {
    expect(seasonOn('2026-10-28')!.emoji).toBe('🎃')
    expect(seasonOn('2026-12-31')!.emoji).toBe('🎉')
    expect(seasonOn('2027-01-01')!.emoji).toBe('🎉')
    expect(seasonOn('2026-08-10')).toBeNull()
  })

  it("wears its own accessory, else the season's", () => {
    expect(wornAccessory('crown', '2026-10-28')).toBe('👑')
    expect(wornAccessory(null, '2026-10-28')).toBe('🎃')
    expect(wornAccessory(null, '2026-08-10')).toBeNull()
  })
})

describe('the daily surprise', () => {
  it('comes in every kind', () => {
    const kinds = new Set(Array.from({ length: 50 }, (_, i) => surpriseFor(i * 13).kind))
    expect([...kinds].sort()).toEqual(['compliment', 'fact', 'fortune', 'gift', 'would_you_rather'])
  })
})

describe('spending points on companions', () => {
  beforeEach(async () => {
    await clearDb()
    await db.userProfile.add({ display_name: 'Jae' } as never)
    await db.pointsTransactions.add({ amount: 100, source_type: 'test', source_id: null, date: '2026-10-21', created_at: '' })
  })

  it('a gift costs points and brings you closer; too expensive does nothing', async () => {
    const companion = { id: 7, name: 'Mammon' }
    expect(await giveGift(companion, 'cake')).toBe(true)
    expect((await db.rewardClaims.toArray()).map(c => c.points_spent)).toEqual([80])
    expect((await db.gameCompanionAffinity.where('companion_id').equals(7).first())!.affinity).toBe(9)
    expect(await giveGift(companion, 'plushie')).toBe(false)
    expect(await db.rewardClaims.count()).toBe(1)
  })

  it('an accessory is bought once, then worn by anyone', async () => {
    expect(await buyAccessory('bow')).toBe(true)
    expect(await buyAccessory('bow')).toBe(true)
    expect(await db.rewardClaims.count()).toBe(1)
    const id = await db.companions.add({ name: 'Pip', avatar: null, is_default: false, is_active: true, personality_group_id: null, messages: {} as never, created_at: '' }) as number
    await wearAccessory(id, 'bow')
    expect((await db.companions.get(id))!.accessory).toBe('bow')
  })

  it('gifts you receive go into the gift safe', async () => {
    await receiveGift({ id: 3, name: 'Lucifer' }, { emoji: '🍪', name: 'a cookie' })
    expect(await db.companionGifts.toArray()).toMatchObject([{ companion_name: 'Lucifer', emoji: '🍪' }])
  })
})
