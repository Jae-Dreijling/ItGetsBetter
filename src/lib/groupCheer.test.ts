import { describe, it, expect, beforeEach, vi } from 'vitest'
import { groupCheerers, groupCheerCooledDown, markGroupCheer, COOLDOWN_MS } from './groupCheer'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
})

describe('group cheers', () => {
  beforeEach(() => store.clear())

  it('everyone switched on cheers, except the ones already on screen', () => {
    const companions = [{ id: 1, is_active: true }, { id: 2, is_active: true }, { id: 3, is_active: false }, { id: 4, is_active: true }]
    expect(groupCheerers(companions, [1, 4]).map(c => c.id)).toEqual([2])
  })

  it('at most once every 20 minutes', () => {
    expect(groupCheerCooledDown(1000)).toBe(true)
    markGroupCheer(1000)
    expect(groupCheerCooledDown(1000 + COOLDOWN_MS - 1)).toBe(false)
    expect(groupCheerCooledDown(1000 + COOLDOWN_MS)).toBe(true)
  })
})
