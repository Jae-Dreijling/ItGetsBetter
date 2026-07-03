import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getQuestProgress } from '../lib/game'
import type { GameQuest } from '../types'

export function useGameState() {
  return useLiveQuery(() => db.gameState.toCollection().first())
}

export function useActiveQuests() {
  return useLiveQuery(() =>
    db.gameQuests.where('status').equals('active').toArray()
  )
}

export function useRecentlyClaimedQuests(limit = 5) {
  return useLiveQuery(() =>
    db.gameQuests.where('status').equals('claimed').reverse().limit(limit).toArray()
  )
}

export function useCustomQuestions() {
  return useLiveQuery(() => db.gameCustomQuestions.toArray())
}

export function useCompanionAffinities() {
  return useLiveQuery(() => db.gameCompanionAffinity.toArray())
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
