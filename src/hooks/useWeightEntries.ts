import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { awardPoints } from './usePoints'
import { triggerCompanionMessage } from '../lib/companionMessenger'
import { trendSeries, trendChange, type WeightDisplay } from '../lib/weightTrend'
import { useProfile } from './useProfile'
import { checkAutoMilestones } from './useGoals'

export function useWeightEntries(dateRange?: { from: string; to: string }) {
  return useLiveQuery(() => {
    if (dateRange) {
      return db.weightEntries
        .where('date')
        .between(dateRange.from, dateRange.to, true, true)
        .sortBy('date')
    }
    return db.weightEntries.orderBy('date').toArray()
  }, [dateRange?.from, dateRange?.to])
}

// The smoothed trend (the main weight number) and how to show weigh-ins.
export function useWeightTrend() {
  const entries = useWeightEntries()
  const { profile } = useProfile()
  const series = trendSeries(entries ?? [])
  const latest = series.at(-1)
  return {
    loaded: entries !== undefined,
    series,
    latest,
    trend: latest?.trend ?? null,
    change: trendChange(series, getLogicalDate()),
    display: (profile?.weight_display ?? 'every') as WeightDisplay,
  }
}

export function useLatestWeight() {
  return useLiveQuery(() =>
    db.weightEntries.orderBy('logged_at').last()
  )
}

export async function addWeightEntry(
  value_kg: number,
  date?: string,
  is_backfill = false
) {
  const previous = await db.weightEntries.orderBy('logged_at').last()
  // value_kg isn't an indexed field, so orderBy() isn't available for it — scan
  // the (small) table in JS instead of adding a schema migration just for this.
  const allEntries = await db.weightEntries.toArray()
  const historicalLowest = allEntries.length > 0
    ? allEntries.reduce((min, e) => (e.value_kg < min.value_kg ? e : min))
    : undefined

  await db.weightEntries.add({
    date: date ?? getLogicalDate(),
    value_kg,
    logged_at: nowISO(),
    is_backfill,
  })

  // Weight steps in Goals may have been reached now (backfills move the trend too).
  await checkAutoMilestones()

  if (!is_backfill) {
    await awardPoints('weight_logged')
    // With daily numbers hidden, reacting to up or down would give them away.
    const profile = await db.userProfile.toCollection().first()
    const showsWeighIns = (profile?.weight_display ?? 'every') === 'every'
    if (!previous) {
      triggerCompanionMessage('first_milestone')
    } else if (showsWeighIns) {
      if (value_kg < previous.value_kg) triggerCompanionMessage('weight_loss')
      else if (value_kg > previous.value_kg) triggerCompanionMessage('weight_gain')
    }
    if (showsWeighIns && historicalLowest && value_kg < historicalLowest.value_kg) {
      triggerCompanionMessage('personal_best')
    }
  }
}
