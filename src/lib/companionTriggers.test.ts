import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EXTRA_TRIGGERS, TRIGGERS, canSay, fillPlaceholders } from './companionTriggers'
import { EMPTY_MESSAGES, getCompanionMessage } from '../hooks/useCompanion'
import { pickFresh, rememberLine } from './recentLines'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
})

describe('the trigger registry', () => {
  it('lists every message category exactly once', () => {
    const keys = TRIGGERS.map(t => t.key)
    expect(new Set(keys).size).toBe(keys.length)
    expect([...keys].sort()).toEqual(Object.keys(EMPTY_MESSAGES).sort())
  })

  it('every new trigger has built-in lines, except the habit questions (they have their own)', () => {
    for (const key of EXTRA_TRIGGERS) {
      if (key === 'habit_settled' || key === 'habit_built') continue
      expect(TRIGGERS.find(t => t.key === key)!.defaults?.length, key).toBeGreaterThanOrEqual(3)
    }
  })

  it("built-in lines only use their trigger's own placeholders", () => {
    for (const t of TRIGGERS) {
      const values = Object.fromEntries((t.placeholders ?? []).map(p => [p, 'x']))
      for (const line of t.defaults ?? []) expect(canSay(line, values), `${t.key}: ${line}`).toBe(true)
    }
  })
})

describe('what the companion says', () => {
  beforeEach(() => store.clear())

  it('fills in placeholders, every time they appear', () => {
    expect(fillPlaceholders('{name}, {person}! {name}!', 'Jae', { person: 'Sam' })).toBe('Jae, Sam! Jae!')
  })

  it('uses its own lines first, then the built-in ones, then its general lines', () => {
    const own = { ...EMPTY_MESSAGES, saw_someone: ['Sam again, {name}? {person} is great.'], general: ['Hi'] }
    expect(getCompanionMessage(own, 'saw_someone', 'Jae', { person: 'Sam' })).toBe('Sam again, Jae? Sam is great.')
    const builtIn = getCompanionMessage({ ...EMPTY_MESSAGES, general: ['Hi'] }, 'saw_someone', 'Jae', { person: 'Sam' })
    expect(builtIn).toContain('Sam')
    expect(getCompanionMessage({ ...EMPTY_MESSAGES, general: ['Hi {name}'] }, 'habit_completed', 'Jae')).toBe('Hi Jae')
  })

  it('skips a line naming a placeholder the moment does not have', () => {
    const messages = { ...EMPTY_MESSAGES, saw_someone: ['With {person}!', 'Nice one, {name}.'] }
    for (let i = 0; i < 5; i++) expect(getCompanionMessage(messages, 'saw_someone', 'Jae')).toBe('Nice one, Jae.')
  })

  it('avoids the lines said most recently', () => {
    const pool = ['a', 'b', 'c']
    rememberLine('a')
    rememberLine('b')
    expect(pickFresh(pool, () => 0)).toBe('c')
    rememberLine('c')
    // All said: the one said longest ago.
    expect(pickFresh(pool, () => 0)).toBe('a')
  })
})
