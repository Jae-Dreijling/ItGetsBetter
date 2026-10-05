import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { POINT_VALUES, type PointSource } from '../lib/points'
import { emitPointsEarned } from '../lib/pointsEvents'
import { awardSparks } from '../lib/game'
import { triggerCompanionMessage } from '../lib/companionMessenger'

export function usePointsBalance() {
  return useLiveQuery(async () => {
    const transactions = await db.pointsTransactions.toArray()
    const earned = transactions.reduce((sum, t) => sum + t.amount, 0)
    const claims = await db.rewardClaims.toArray()
    const spent = claims.reduce((sum, c) => sum + c.points_spent, 0)
    return earned - spent
  })
}

export function useTodaysPoints() {
  const today = getLogicalDate()
  return useLiveQuery(
    () => db.pointsTransactions.where('date').equals(today).toArray(),
    [today]
  )
}

export function usePointsHistory(limit: number = 30) {
  return useLiveQuery(() =>
    db.pointsTransactions.orderBy('date').reverse().limit(limit).toArray()
  , [limit])
}

export async function awardPoints(source: PointSource, sourceId?: number) {
  const today = getLogicalDate()

  const alreadyAwarded = await db.pointsTransactions
    .where('date').equals(today)
    .and(t => t.source_type === source && (sourceId === undefined || t.source_id === sourceId))
    .first()

  if (alreadyAwarded && ['weight_logged', 'sleep_logged', 'water_goal_met', 'fasting_goal_met'].includes(source)) {
    return
  }

  const amount = POINT_VALUES[source]
  await db.pointsTransactions.add({
    amount,
    source_type: source,
    source_id: sourceId ?? null,
    date: today,
    created_at: nowISO(),
  })
  emitPointsEarned(amount, source)
  await awardSparks(source)
  triggerCompanionMessage('points_earned')
  if (source === 'habit_completed') triggerCompanionMessage('habit_completed')
  if (source === 'task_completed') triggerCompanionMessage('task_completed')
  if (source === 'exercise_logged') triggerCompanionMessage('exercise_logged')
  if (source === 'sleep_logged') triggerCompanionMessage('sleep_logged')
  if (source === 'water_goal_met') triggerCompanionMessage('water_goal_met')
}

export async function awardStreakBonus(streakDays: number) {
  const today = getLogicalDate()
  const alreadyAwarded = await db.pointsTransactions
    .where('date').equals(today)
    .and(t => t.source_type === 'streak_bonus_per_day')
    .first()

  if (alreadyAwarded) return

  const bonus = Math.min(streakDays, 21) * POINT_VALUES.streak_bonus_per_day
  if (bonus <= 0) return

  await db.pointsTransactions.add({
    amount: bonus,
    source_type: 'streak_bonus_per_day',
    source_id: null,
    date: today,
    created_at: nowISO(),
  })
}
