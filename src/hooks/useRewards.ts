import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
import type { Reward, RewardCategory, RewardType } from '../types/entities'

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

/** Map of rewardId → claimed_at of most recent claim. Used for cooldown checks. */
export function useLastClaimByReward() {
  return useLiveQuery(async () => {
    const claims = await db.rewardClaims.orderBy('claimed_at').toArray()
    const map = new Map<number, string>()
    for (const claim of claims) {
      map.set(claim.reward_id, claim.claimed_at)
    }
    return map
  })
}

export interface AddRewardParams {
  name: string
  pointCost: number
  description?: string | null
  icon?: string
  category?: RewardCategory | null
  type?: RewardType
  stock?: number | null
  cooldownDays?: number | null
  url?: string | null
  image?: Blob | null
  pinned?: boolean
  isPreset?: boolean
}

export async function addReward(params: AddRewardParams) {
  await db.rewards.add({
    name: params.name,
    description: params.description || null,
    point_cost: params.pointCost,
    icon: params.icon || null,
    category: params.category ?? null,
    type: params.type ?? 'recurring',
    stock: params.stock ?? null,
    cooldown_days: params.cooldownDays ?? null,
    url: params.url || null,
    image: params.image ?? null,
    is_available: true,
    is_preset: params.isPreset ?? false,
    pinned: params.pinned ?? false,
    is_savings_goal: false,
    created_at: nowISO(),
  })
}

export async function updateReward(id: number, changes: Partial<Omit<Reward, 'id' | 'created_at'>>) {
  await db.rewards.update(id, changes)
}

export async function deleteReward(id: number) {
  await db.rewards.delete(id)
}

export async function claimReward(rewardId: number, pointCost: number, note?: string) {
  const reward = await db.rewards.get(rewardId)
  if (!reward) return

  await db.rewardClaims.add({
    reward_id: rewardId,
    reward_name: reward.name,
    points_spent: pointCost,
    claimed_at: nowISO(),
    note: note || null,
  })

  if (reward.type === 'one_time') {
    await db.rewards.update(rewardId, { is_available: false, is_savings_goal: false })
  } else if (reward.type === 'limited' && reward.stock !== null) {
    const newStock = reward.stock - 1
    await db.rewards.update(rewardId, {
      stock: newStock,
      is_available: newStock > 0,
      ...(newStock <= 0 ? { is_savings_goal: false } : {}),
    })
  }
}

/** Sets one reward as the savings goal, clearing the flag from all others. */
export async function setSavingsGoal(rewardId: number | null) {
  await db.rewards.filter(r => r.is_savings_goal === true).modify({ is_savings_goal: false })
  if (rewardId !== null) {
    await db.rewards.update(rewardId, { is_savings_goal: true })
  }
}

const PRESETS: Array<{
  name: string; icon: string; category: RewardCategory; type: RewardType; point_cost: number
}> = [
  { name: 'Order takeout',     icon: '🍕', category: 'food',          type: 'recurring', point_cost: 150 },
  { name: 'Bakery treat',      icon: '🧁', category: 'food',          type: 'recurring', point_cost: 75  },
  { name: 'Chocolate bar',     icon: '🍫', category: 'food',          type: 'recurring', point_cost: 50  },
  { name: 'Watch a movie',     icon: '🎬', category: 'entertainment', type: 'recurring', point_cost: 75  },
  { name: 'Gaming session',    icon: '🎮', category: 'entertainment', type: 'recurring', point_cost: 60  },
  { name: 'Buy a book',        icon: '📚', category: 'shopping',      type: 'one_time',  point_cost: 200 },
  { name: 'Long bath',         icon: '🛁', category: 'self_care',     type: 'recurring', point_cost: 50  },
  { name: 'Nap without guilt', icon: '😴', category: 'rest',          type: 'recurring', point_cost: 50  },
  { name: 'Afternoon off',     icon: '☀️', category: 'rest',          type: 'recurring', point_cost: 120 },
  { name: 'Call a friend',     icon: '📞', category: 'social',        type: 'recurring', point_cost: 50  },
]

/** Seeds preset rewards, skipping any whose name already exists. Returns count added. */
export async function loadPresets(): Promise<number> {
  const existing = await db.rewards.toArray()
  const existingNames = new Set(existing.map(r => r.name.toLowerCase()))
  const toAdd = PRESETS.filter(p => !existingNames.has(p.name.toLowerCase()))
  if (toAdd.length === 0) return 0
  const now = nowISO()
  await db.rewards.bulkAdd(toAdd.map(p => ({
    name: p.name,
    description: null,
    point_cost: p.point_cost,
    icon: p.icon,
    category: p.category,
    type: p.type,
    stock: null,
    cooldown_days: null,
    url: null,
    image: null,
    is_available: true,
    is_preset: true,
    pinned: false,
    is_savings_goal: false,
    created_at: now,
  })))
  return toAdd.length
}
