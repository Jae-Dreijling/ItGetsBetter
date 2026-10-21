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



export async function awardPoints(source: PointSource, sourceId?: number) {
  const today = getLogicalDate()

  const alreadyAwarded = await db.pointsTransactions
    .where('date').equals(today)
    .and(t => t.source_type === source && (sourceId === undefined || t.source_id === sourceId))
    .first()

  if (alreadyAwarded && ['weight_logged', 'sleep_logged', 'water_goal_met', 'fasting_goal_met', 'daily_check', 'floor_complete'].includes(source)) {
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

