import { describe, it, expect } from 'vitest'
import { planReminders, reminderId, type DayWindow, type NotificationPrefs } from './plan'

const days = (n: number, overrides: Partial<DayWindow>[] = []): DayWindow[] =>
  Array.from({ length: n }, (_, i) => ({
    date: `2026-10-${String(6 + i).padStart(2, '0')}`,
    startMinute: 8 * 60,
    endMinute: 22 * 60,
    quiet: false,
    ...overrides[i],
  }))

const morning = new Date(2026, 9, 6, 9, 0)
const both: NotificationPrefs = { daily_check: { on: true, time: '19:00' }, floor: { on: true, time: '20:30' } }
const fresh = { dailyCheckDone: false, hasFloor: true, floorComplete: false }

describe('planReminders', () => {
  it('plans nothing unless switched on', () => {
    expect(planReminders(morning, days(7), undefined, fresh)).toEqual([])
    expect(planReminders(morning, days(7), { daily_check: { on: false, time: '19:00' } }, fresh)).toEqual([])
  })

  it('plans each switched-on reminder for every day, at its time', () => {
    const plan = planReminders(morning, days(7), both, fresh)
    expect(plan).toHaveLength(14)
    expect(plan[0]).toMatchObject({ kind: 'daily_check', date: '2026-10-06' })
    expect(plan[0].at.getHours()).toBe(19)
    expect(plan[1].at.getHours()).toBe(20)
    expect(plan[1].at.getMinutes()).toBe(30)
  })

  it("skips today's reminder once it's done, but keeps the coming days", () => {
    const plan = planReminders(morning, days(3), both, { dailyCheckDone: true, hasFloor: true, floorComplete: true })
    expect(plan.map(p => p.date)).not.toContain('2026-10-06')
    expect(plan).toHaveLength(4)
  })

  it('has no floor reminder without a floor', () => {
    const plan = planReminders(morning, days(2), both, { ...fresh, hasFloor: false })
    expect(plan.every(p => p.kind === 'daily_check')).toBe(true)
  })

  it('respects calm hours: early times move to the window start, late ones are dropped', () => {
    const prefs: NotificationPrefs = { daily_check: { on: true, time: '06:00' }, floor: { on: true, time: '23:30' } }
    const plan = planReminders(morning, days(2), prefs, fresh)
    expect(plan).toHaveLength(1) // today's 08:00 is already past at 09:00; tomorrow 08:00 stays
    expect(plan[0].date).toBe('2026-10-07')
    expect(plan[0].at.getHours()).toBe(8)
  })

  it('skips quiet-mode days and moments already past', () => {
    const evening = new Date(2026, 9, 6, 19, 30)
    const plan = planReminders(evening, days(3, [{}, { quiet: true }]), both, fresh)
    expect(plan.map(p => `${p.date} ${p.kind}`)).toEqual([
      '2026-10-06 floor',
      '2026-10-08 daily_check',
      '2026-10-08 floor',
    ])
  })

  it('uses stable ids per day and kind', () => {
    expect(reminderId(0, 'daily_check')).not.toBe(reminderId(0, 'floor'))
    expect(reminderId(1, 'daily_check')).not.toBe(reminderId(0, 'daily_check'))
    const ids = planReminders(morning, days(7), both, fresh).map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
