import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
import { changeCloseness } from '../lib/closeness'
import { ACCESSORIES, GIFTS_FOR_COMPANIONS } from '../lib/companionFun'
import type { Companion } from '../types'

// Gifts, the gift safe and accessories (COMPANION-PLAN 11h). Spending goes
// through reward claims, so it shows in your claim history like any treat.

export function useGiftSafe() {
  return useLiveQuery(() => db.companionGifts.orderBy('received_at').reverse().toArray())
}

export async function receiveGift(companion: Pick<Companion, 'id' | 'name'>, gift: { emoji: string; name: string }) {
  await db.companionGifts.add({ companion_id: companion.id!, companion_name: companion.name, emoji: gift.emoji, name: gift.name, received_at: nowISO() })
}

async function balance(): Promise<number> {
  const earned = (await db.pointsTransactions.toArray()).reduce((sum, t) => sum + t.amount, 0)
  const spent = (await db.rewardClaims.toArray()).reduce((sum, c) => sum + c.points_spent, 0)
  return earned - spent
}

async function spend(what: string, cost: number): Promise<boolean> {
  if ((await balance()) < cost) return false
  await db.rewardClaims.add({ reward_id: 0, reward_name: what, points_spent: cost, claimed_at: nowISO(), note: null })
  return true
}

// Gives a companion a gift; false when there aren't enough points.
export async function giveGift(companion: Pick<Companion, 'id' | 'name'>, giftId: string): Promise<boolean> {
  const gift = GIFTS_FOR_COMPANIONS.find(g => g.id === giftId)
  if (!gift || !(await spend(`${gift.emoji} ${gift.name} for ${companion.name}`, gift.cost))) return false
  await changeCloseness(companion.id!, gift.closeness)
  return true
}

// Buys an accessory once; after that any companion can wear it.
export async function buyAccessory(id: string): Promise<boolean> {
  const accessory = ACCESSORIES.find(a => a.id === id)
  const profile = await db.userProfile.toCollection().first()
  if (!accessory || !profile) return false
  if (profile.owned_accessories?.includes(id)) return true
  if (!(await spend(`${accessory.emoji} ${accessory.name} (accessory)`, accessory.cost))) return false
  await db.userProfile.update(profile.id!, { owned_accessories: [...(profile.owned_accessories ?? []), id] })
  return true
}

export async function wearAccessory(companionId: number, id: string | null) {
  await db.companions.update(companionId, { accessory: id })
}
