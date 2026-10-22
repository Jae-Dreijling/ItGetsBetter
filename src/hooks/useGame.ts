import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getQuestProgress, questPeriod } from '../lib/game'
import { getLogicalDate } from '../lib/date'
import type { GameQuest } from '../types'

export function useGameState() {
  return useLiveQuery(() => db.gameState.toCollection().first())
}

export function useActiveQuests() {
  return useLiveQuery(() =>
    db.gameQuests.where('status').equals('active').toArray()
  )
}

// Finished quests: all time, this week's and this month's.
export function useFinishedQuests() {
  return useLiveQuery(async () => {
    const today = getLogicalDate()
    const week = questPeriod(today, true)
    const month = questPeriod(today, false)
    const claimed = await db.gameQuests.where('status').equals('claimed').toArray()
    return {
      total: claimed.length,
      week: claimed.filter(q => q.is_weekly && q.end_date >= week.start).length,
      month: claimed.filter(q => !q.is_weekly && q.end_date >= month.start).length,
    }
  })
}

export function useCustomQuestions() {
  return useLiveQuery(() => db.gameCustomQuestions.toArray())
}

export function useCompanionAffinities() {
  return useLiveQuery(() => db.gameCompanionAffinity.toArray())
}

export function useCompanionAffinityFor(companionId: number | undefined) {
  return useLiveQuery(async () => {
    if (companionId === undefined) return undefined
    return db.gameCompanionAffinity.where('companion_id').equals(companionId).first()
  }, [companionId])
}

export function useCompanions() {
  return useLiveQuery(() => db.companions.toArray())
}

// Reactive progress for a single quest — re-runs whenever relevant entries change
export function useQuestProgress(quest: GameQuest | undefined) {
  return useLiveQuery(async () => {
    if (!quest) return 0
    return getQuestProgress(quest)
  }, [quest?.id, quest?.objective_type, quest?.start_date, quest?.end_date])
}
