import { describe, it, expect, beforeEach, vi } from 'vitest'
import { gapDays, isDue, markTurn, nextTurn, turnsToday, PER_DAY } from './companionTurns'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
})
if (typeof window === 'undefined') vi.stubGlobal('window', { dispatchEvent: () => true })

const companions = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]

describe('companion turns', () => {
  beforeEach(() => localStorage.clear())

  it('each companion waits 2 or 3 days after its own turn, others are not affected', () => {
    markTurn(1, 'question', '2026-10-22')
    expect(isDue(1, 'question', '2026-10-23')).toBe(false)
    expect(isDue(2, 'question', '2026-10-23')).toBe(true)
    // Other kinds have their own clock too.
    expect(isDue(1, 'surprise', '2026-10-23')).toBe(true)
    const gap = gapDays(1, 'question', '2026-10-22')
    expect([2, 3]).toContain(gap)
    expect(isDue(1, 'question', gap === 2 ? '2026-10-24' : '2026-10-25')).toBe(true)
    expect(isDue(1, 'question', gap === 2 ? '2026-10-23' : '2026-10-24')).toBe(false)
  })

  it('the one with you goes first, then whoever waited longest, up to PER_DAY a day', () => {
    expect(nextTurn('question', '2026-10-22', companions, 3)?.id).toBe(3)
    markTurn(3, 'question', '2026-10-22')
    const second = nextTurn('question', '2026-10-22', companions, 3)
    expect(second).not.toBeNull()
    expect(second!.id).not.toBe(3)
    markTurn(second!.id!, 'question', '2026-10-22')
    expect(turnsToday('question', '2026-10-22')).toBe(PER_DAY)
    expect(nextTurn('question', '2026-10-22', companions, 3)).toBeNull()
    // A new day: the ones that haven't had a turn come first.
    const next = nextTurn('question', '2026-10-23', companions, null)
    expect([1, 2, 4]).toContain(next!.id)
  })
})
