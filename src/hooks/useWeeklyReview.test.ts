import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { getWeightSummary } from './useWeeklyReview'

describe('weekly review weight', () => {
  beforeEach(clearDb)

  it('compares the trend, so one heavy day at the end barely counts', async () => {
    const days = ['2026-10-12', '2026-10-14', '2026-10-16', '2026-10-18']
    for (const [i, date] of days.entries()) {
      await db.weightEntries.add({ date, value_kg: i === 3 ? 82 : 80, logged_at: '', is_backfill: false })
    }
    await db.weightEntries.add({ date: '2026-10-08', value_kg: 80, logged_at: '', is_backfill: false })
    const summary = (await getWeightSummary('2026-10-12', '2026-10-18'))!
    expect(summary.start).toBe(80)
    // First vs last weigh-in would say +2 kg; the trend moved a fraction of that.
    expect(summary.delta).toBeLessThan(0.6)
    expect(summary.delta).toBeGreaterThan(0)
  })

  it('has nothing to say for a week without weigh-ins', async () => {
    await db.weightEntries.add({ date: '2026-10-01', value_kg: 80, logged_at: '', is_backfill: false })
    expect(await getWeightSummary('2026-10-12', '2026-10-18')).toBeNull()
  })
})
