import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { awardPoints } from './usePoints'
import { registerCompanionMessageHandler } from '../lib/companionMessenger'
import { POINT_VALUES } from '../lib/points'
import type { CompanionEvent } from './useCompanion'

function captureCompanionEvents() {
  const events: CompanionEvent[] = []
  registerCompanionMessageHandler(e => events.push(e))
  return events
}

describe('awardPoints', () => {
  beforeEach(async () => {
    await clearDb()
    registerCompanionMessageHandler(null)
  })

  it('records a transaction with the correct point value for the source', async () => {
    await awardPoints('exercise_logged')
    const txns = await db.pointsTransactions.toArray()
    expect(txns).toHaveLength(1)
    expect(txns[0].amount).toBe(POINT_VALUES.exercise_logged)
    expect(txns[0].source_type).toBe('exercise_logged')
  })

  it('always fires the points_earned companion event', async () => {
    const events = captureCompanionEvents()
    await awardPoints('meal_logged')
    expect(events).toContain('points_earned')
  })

  it.each([
    ['habit_completed', 'habit_completed'],
    ['task_completed', 'task_completed'],
    ['exercise_logged', 'exercise_logged'],
    ['sleep_logged', 'sleep_logged'],
    ['water_goal_met', 'water_goal_met'],
  ] as const)('fires the %s companion event for that source', async (source, event) => {
    const events = captureCompanionEvents()
    await awardPoints(source)
    expect(events).toContain(event)
  })

  it('does not double-award a once-per-day source on the same day', async () => {
    await awardPoints('weight_logged')
    await awardPoints('weight_logged')
    const txns = await db.pointsTransactions.where('source_type').equals('weight_logged').toArray()
    expect(txns).toHaveLength(1)
  })

  it('allows a non-deduped source to be awarded multiple times per day', async () => {
    await awardPoints('meal_logged')
    await awardPoints('meal_logged')
    const txns = await db.pointsTransactions.where('source_type').equals('meal_logged').toArray()
    expect(txns).toHaveLength(2)
  })
})
