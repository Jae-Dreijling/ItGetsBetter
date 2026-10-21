import { describe, it, expect, vi, afterEach } from 'vitest'
import { needsReminderToday } from './useMedicine'

describe('medicine reminders', () => {
  afterEach(() => vi.useRealTimers())

  it('reminds about daily medicines, never about "as needed" or inactive ones', () => {
    const created_at = '2026-10-01T09:00:00'
    expect(needsReminderToday({ frequency: 'daily', created_at })).toBe(true)
    expect(needsReminderToday({ frequency: 'as needed', created_at })).toBe(false)
    expect(needsReminderToday({ frequency: 'daily', created_at, is_active: false })).toBe(false)
  })

  it('only reminds about an every-other-day medicine on its days', () => {
    vi.useFakeTimers()
    const med = { frequency: 'every other day', created_at: '2026-10-01T09:00:00' }
    vi.setSystemTime(new Date('2026-10-21T14:00:00'))
    const day20 = needsReminderToday(med)
    vi.setSystemTime(new Date('2026-10-22T14:00:00'))
    const day21 = needsReminderToday(med)
    expect(day20).not.toBe(day21)
  })

  it('only reminds about a weekly medicine on its weekday', () => {
    vi.useFakeTimers()
    const med = { frequency: 'weekly', created_at: '2026-10-05T09:00:00' } // a Monday
    vi.setSystemTime(new Date('2026-10-19T14:00:00'))
    expect(needsReminderToday(med)).toBe(true)
    vi.setSystemTime(new Date('2026-10-21T14:00:00'))
    expect(needsReminderToday(med)).toBe(false)
  })
})
