import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getLogicalDate, nowISO } from '../lib/date'
import { awardPoints } from './usePoints'
import { triggerCompanionMessage } from '../lib/companionMessenger'
import type { FastingRecord } from '../types'

// Fasting is a timer you start and end yourself (V2-PLAN §3): it has no link
// to meal logging, so eating never silently starts or ends anything.

export const GOAL_OPTIONS = [12, 14, 16, 18, 20]
const DEFAULT_GOAL = 16

export function useRunningFast() {
  return useLiveQuery(async () => (await db.fastingRecords.filter(r => r.end_time === null).first()) ?? null)
}

export function useFastingHistory(limit = 14) {
  return useLiveQuery(async () =>
    (await db.fastingRecords.filter(r => r.end_time !== null).toArray())
      .sort((a, b) => b.start_time.localeCompare(a.start_time))
      .slice(0, limit), [limit])
}

// The goal you used last time, so starting is one tap.
export function useLastGoal() {
  return useLiveQuery(async () => {
    const all = await db.fastingRecords.toArray()
    return all.sort((a, b) => b.start_time.localeCompare(a.start_time))[0]?.goal_hours ?? DEFAULT_GOAL
  })
}

export async function startFast(goalHours: number, startedAt: Date = new Date()) {
  if (await db.fastingRecords.filter(r => r.end_time === null).count()) return
  await db.fastingRecords.add({
    date: getLogicalDate(startedAt),
    start_time: startedAt.toISOString(),
    end_time: null,
    duration_hours: 0,
    goal_hours: goalHours,
    goal_met: false,
    was_broken_early: false,
  })
  triggerCompanionMessage('fast_started', { hours: goalHours })
}

export async function updateRunningFast(id: number, changes: Pick<Partial<FastingRecord>, 'goal_hours' | 'start_time'>) {
  await db.fastingRecords.update(id, changes)
}

export function fastingMinutes(fast: FastingRecord, now: Date): number {
  const end = fast.end_time ? new Date(fast.end_time) : now
  return Math.max(0, Math.floor((end.getTime() - new Date(fast.start_time).getTime()) / 60_000))
}

// Ends the running fast. Reaching the goal earns points; ending sooner is
// just a shorter fast, never a "broken" one.
export async function endFast(fast: FastingRecord) {
  const end = new Date()
  const minutes = fastingMinutes(fast, end)
  const durationHours = Math.round((minutes / 60) * 10) / 10
  const goalMet = minutes >= fast.goal_hours * 60
  const previousBest = (await db.fastingRecords.filter(r => r.end_time !== null).toArray())
    .reduce((best, r) => Math.max(best, r.duration_hours), 0)

  await db.fastingRecords.update(fast.id!, { end_time: nowISO(), duration_hours: durationHours, goal_met: goalMet })

  if (goalMet) {
    await awardPoints('fasting_goal_met')
    triggerCompanionMessage('fasting_goal')
  } else {
    triggerCompanionMessage('fast_ended_short', { hours: durationHours })
  }
  if (previousBest > 0 && durationHours > previousBest) triggerCompanionMessage('personal_best')
  return { durationHours, goalMet }
}

export async function deleteFast(id: number) {
  await db.fastingRecords.delete(id)
}

export function formatFastingDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins}m`
}
