import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { nowISO } from '../lib/date'
import { ACHIEVEMENT_LIBRARY } from '../lib/achievements'
import { triggerCompanionMessage } from '../lib/companionMessenger'

export function useAchievements() {
  return useLiveQuery(() => db.achievements.toArray())
}

export function useUnlockedAchievements() {
  return useLiveQuery(() =>
    db.achievements.filter(a => a.is_unlocked === true).toArray()
  )
}

export async function checkAndUnlockAchievements(): Promise<string[]> {
  const stats = await gatherStats()
  const existing = await db.achievements.toArray()
  const existingIds = new Set(existing.map(a => a.trigger_type + ':' + a.trigger_value))
  const newlyUnlocked: string[] = []

  for (const def of ACHIEVEMENT_LIBRARY) {
    const key = def.trigger_type + ':' + def.trigger_value
    if (existingIds.has(key)) continue

    const currentValue = stats[def.trigger_type] ?? 0
    if (currentValue >= def.trigger_value) {
      await db.achievements.add({
        name: def.name,
        description: def.description,
        trigger_type: def.trigger_type,
        trigger_value: def.trigger_value,
        is_unlocked: true,
        unlocked_at: nowISO(),
      })
      newlyUnlocked.push(def.name)
    }
  }

  if (newlyUnlocked.length > 0) triggerCompanionMessage('achievement_unlocked')

  return newlyUnlocked
}

async function gatherStats(): Promise<Record<string, number>> {
  const [meals, weights, exercises, waterGoals, points, appDays] = await Promise.all([
    db.mealEntries.count(),
    db.weightEntries.count(),
    db.exerciseEntries.count(),
    countWaterGoalsMet(),
    getTotalPointsEarned(),
    countUniqueAppOpenDays(),
  ])

  const weightLost = await getWeightLost()

  return {
    meals_logged: meals,
    weights_logged: weights,
    exercises_logged: exercises,
    water_goals_met: waterGoals,
    total_points: points,
    app_open_days: appDays,
    weight_lost: weightLost,
  }
}

async function getWeightLost(): Promise<number> {
  const profile = await db.userProfile.toCollection().first()
  if (!profile) return 0
  const latest = await db.weightEntries.orderBy('logged_at').last()
  if (!latest) return 0
  return Math.max(0, profile.starting_weight_kg - latest.value_kg)
}

async function countWaterGoalsMet(): Promise<number> {
  const entries = await db.waterEntries.toArray()
  const byDate = new Map<string, number>()
  for (const e of entries) {
    byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.amount_ml)
  }
  let count = 0
  for (const total of byDate.values()) {
    if (total >= 2000) count++
  }
  return count
}

async function getTotalPointsEarned(): Promise<number> {
  const transactions = await db.pointsTransactions.toArray()
  return transactions.reduce((sum, t) => sum + t.amount, 0)
}

async function countUniqueAppOpenDays(): Promise<number> {
  const logs = await db.appOpenLog.toArray()
  const uniqueDates = new Set(logs.map(l => l.date))
  return uniqueDates.size
}
