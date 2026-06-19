import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'

export function useAvailableRewards() {
  return useLiveQuery(() =>
    db.rewards.filter(r => r.is_available === true).toArray()
  )
}

export function useRewardClaims() {
  return useLiveQuery(() =>
    db.rewardClaims.orderBy('claimed_at').reverse().toArray()
  )
}

export async function addReward(name: string, pointCost: number, description?: string) {
  await db.rewards.add({
    name,
    description: description || null,
    point_cost: pointCost,
    is_available: true,
    created_at: nowISO(),
  })
}

export async function updateReward(id: number, changes: Partial<{ name: string; description: string | null; point_cost: number; is_available: boolean }>) {
  await db.rewards.update(id, changes)
}

export async function deleteReward(id: number) {
  await db.rewards.delete(id)
}

export async function claimReward(rewardId: number, pointCost: number) {
  await db.rewardClaims.add({
    reward_id: rewardId,
    points_spent: pointCost,
    claimed_at: nowISO(),
  })
}
