import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { startFast, endFast } from './useFasting'
import { getFastingSummary } from './useWeeklyReview'

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000)
const running = async () => (await db.fastingRecords.filter(r => r.end_time === null).first())!

describe('manual fasting timer', () => {
  beforeEach(clearDb)

  it('only runs one fast at a time', async () => {
    await startFast(16)
    await startFast(12)
    expect(await db.fastingRecords.count()).toBe(1)
  })

  it('gives points when the goal is reached', async () => {
    await startFast(16, hoursAgo(17))
    const result = await endFast(await running())
    expect(result.goalMet).toBe(true)
    expect(await db.pointsTransactions.filter(t => t.source_type === 'fasting_goal_met').count()).toBe(1)
  })

  it('a shorter fast is still saved, just without points', async () => {
    await startFast(16, hoursAgo(10))
    const result = await endFast(await running())
    expect(result).toEqual({ durationHours: 10, goalMet: false })
    expect(await db.pointsTransactions.count()).toBe(0)
    expect((await db.fastingRecords.toArray())[0].end_time).not.toBeNull()
  })

  it('the weekly review counts only finished fasts', async () => {
    await db.fastingRecords.bulkAdd([
      { date: '2026-10-13', start_time: '', end_time: 'x', duration_hours: 16, goal_hours: 16, goal_met: true, was_broken_early: false },
      { date: '2026-10-15', start_time: '', end_time: 'x', duration_hours: 12, goal_hours: 16, goal_met: false, was_broken_early: false },
      { date: '2026-10-16', start_time: '', end_time: null, duration_hours: 0, goal_hours: 16, goal_met: false, was_broken_early: false },
    ])
    expect(await getFastingSummary('2026-10-12', '2026-10-18')).toEqual({ totalHours: 28, avgHours: 14 })
  })
})
