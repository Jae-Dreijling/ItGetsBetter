import { describe, it, expect, beforeEach, vi } from 'vitest'
import { pickVisitor, readVisit, startVisit, knockCooledDown, markKnock, VISIT_MS, KNOCK_COOLDOWN_MS } from './companionVisits'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
})

describe('visits', () => {
  beforeEach(() => store.clear())

  it('close companions knock more often, and get picked more', () => {
    const rolls = (n: number) => Array.from({ length: n }, (_, i) => (i * 0.6180339) % 1)
    const knocks = (affinity: number) => rolls(400).filter((r, i) => pickVisitor([{ id: 1, affinity }], () => (i % 2 ? r : rolls(400)[i])) !== null).length
    expect(knocks(90)).toBeGreaterThan(knocks(0))
    // With a sure knock, the close one wins most picks.
    let seq = 0
    const sure = () => (seq++ % 2 === 0 ? 0 : (seq * 0.37) % 1)
    const picks = Array.from({ length: 200 }, () => pickVisitor([{ id: 1, affinity: 0 }, { id: 2, affinity: 100 }], sure))
    expect(picks.filter(p => p === 2).length).toBeGreaterThan(picks.filter(p => p === 1).length)
    expect(pickVisitor([], Math.random)).toBeNull()
  })

  it('a visit lasts its time, and knocking has a cooldown', () => {
    const now = 1_000_000
    startVisit(5, now)
    expect(readVisit(now + VISIT_MS - 1)?.companionId).toBe(5)
    expect(readVisit(now + VISIT_MS + 1)).toBeNull()
    markKnock(now)
    expect(knockCooledDown(now + 1000)).toBe(false)
    expect(knockCooledDown(now + KNOCK_COOLDOWN_MS)).toBe(true)
  })
})
