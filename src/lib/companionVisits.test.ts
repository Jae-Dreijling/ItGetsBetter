import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  pickVisitor, readVisits, startVisit, endVisit, knockCooledDown, markKnock, VISIT_MS, KNOCK_COOLDOWN_MS,
  supportKnockAllowed, markSupportKnock, pickSupporter, SUPPORT_GAP_MS,
} from './companionVisits'

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

  it('on a hard day, up to three support visits, half an hour apart, caring ones first', () => {
    const now = 5_000_000
    expect(supportKnockAllowed('2026-10-21', now)).toBe(true)
    markSupportKnock('2026-10-21', now)
    expect(supportKnockAllowed('2026-10-21', now + 1000)).toBe(false)
    expect(supportKnockAllowed('2026-10-21', now + SUPPORT_GAP_MS)).toBe(true)
    markSupportKnock('2026-10-21', now + SUPPORT_GAP_MS)
    markSupportKnock('2026-10-21', now + 2 * SUPPORT_GAP_MS)
    expect(supportKnockAllowed('2026-10-21', now + 5 * SUPPORT_GAP_MS)).toBe(false)
    expect(supportKnockAllowed('2026-10-22', now + 5 * SUPPORT_GAP_MS)).toBe(true)
    let i = 0
    const picks = Array.from({ length: 300 }, () => pickSupporter([{ id: 1, care: 0 }, { id: 2, care: 4 }], () => ((i++ * 0.618) % 1)))
    expect(picks.filter(p => p === 2).length).toBeGreaterThan(picks.filter(p => p === 1).length * 2)
    expect(startVisit(9, now, true).support).toBe(true)
  })

  it('a visit lasts its time, and knocking has a cooldown', () => {
    const now = 1_000_000
    startVisit(5, now)
    expect(readVisits(now + VISIT_MS - 1).map(v => v.companionId)).toEqual([5])
    expect(readVisits(now + VISIT_MS + 1)).toEqual([])
    markKnock(now)
    expect(knockCooledDown(now + 1000)).toBe(false)
    expect(knockCooledDown(now + KNOCK_COOLDOWN_MS)).toBe(true)
  })

  it('several can visit at once and leave one by one; an old single visit still reads', () => {
    // endVisit reads the visits at the real time.
    const now = Date.now()
    startVisit(1, now, true)
    startVisit(2, now + 1000, true)
    expect(readVisits(now + 2000).map(v => v.companionId)).toEqual([1, 2])
    endVisit(1)
    expect(readVisits(now + 2000).map(v => v.companionId)).toEqual([2])
    store.set('igb_visit', JSON.stringify({ companionId: 7, until: now + VISIT_MS }))
    expect(readVisits(now).map(v => v.companionId)).toEqual([7])
  })
})
