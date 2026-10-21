import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { holidayOn, yearsTogether, isBirthday, isShinyDay, weekMoment } from './calendarMoments'
import { expressionFor } from './companionExpressions'
import { pickSessionCompanion } from './sessionCompanion'
import { appOpenMoment } from './appOpenMoment'
import { getLogicalDate } from './date'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
})
vi.stubGlobal('sessionStorage', { getItem: () => null, setItem: () => {}, removeItem: () => {} })

describe('the calendar', () => {
  it('knows holidays, anniversaries and birthdays', () => {
    expect(holidayOn('2026-12-25')).toBe('Christmas')
    expect(holidayOn('2026-12-05')).toBe('Sinterklaas')
    expect(holidayOn('2026-03-03')).toBeNull()
    expect(yearsTogether('2025-10-21', '2026-10-21')).toBe(1)
    expect(yearsTogether('2025-10-21', '2026-10-22')).toBe(0)
    expect(isBirthday('11-29', '2026-11-29')).toBe(true)
    expect(isBirthday(null, '2026-11-29')).toBe(false)
  })

  it('a shiny day is rare, and the same all day', () => {
    const days = Array.from({ length: 2000 }, (_, i) => `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`)
    const shiny = days.filter((d, i) => isShinyDay(i, d)).length
    expect(shiny).toBeGreaterThan(0)
    expect(shiny).toBeLessThan(60)
    expect(isShinyDay(7, '2026-10-21')).toBe(isShinyDay(7, '2026-10-21'))
  })

  it('knows the start and end of the week', () => {
    expect(weekMoment(new Date(2026, 9, 19, 9))!.event).toBe('monday_morning')
    expect(weekMoment(new Date(2026, 9, 23, 18))!.event).toBe('friday_evening')
    expect(weekMoment(new Date(2026, 9, 24, 10))!.event).toBe('weekend_morning')
    expect(weekMoment(new Date(2026, 9, 21, 10))).toBeNull()
  })

  it('picks the expression that fits', () => {
    expect(expressionFor('goal_completed')).toBe('proud')
    expect(expressionFor('thrown')).toBe('surprised')
    expect(expressionFor('mood_low')).toBe('worried')
    expect(expressionFor('meal_logged')).toBeNull()
  })
})

describe('a companion birthday', () => {
  it('makes that companion the one with you all day', () => {
    const companions = [
      { id: 1, is_active: true, is_default: true },
      { id: 2, is_active: false, is_default: false, birthday: '11-29' },
    ]
    expect(pickSessionCompanion(companions, 1, () => 0, '2026-11-29')!.id).toBe(2)
    expect(pickSessionCompanion(companions, 1, () => 0, '2026-11-30')!.id).toBe(1)
  })

  beforeEach(async () => {
    await clearDb()
    store.clear()
  })

  it('gets said when the app opens, once', async () => {
    await db.companions.add({
      name: 'Mammon', avatar: null, is_default: false, is_active: true, personality_group_id: null,
      messages: {} as never, birthday: getLogicalDate().slice(5), created_at: '',
    })
    expect((await appOpenMoment())?.event).toBe('companion_birthday')
    expect((await appOpenMoment())?.event).not.toBe('companion_birthday')
  })
})
