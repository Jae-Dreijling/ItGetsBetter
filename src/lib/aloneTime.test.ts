import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ALONE_MS, isAloneTime, startAloneTime, overAloneZone } from './aloneTime'
import { pickAnotherCompanion } from './sessionCompanion'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
})

describe('alone time', () => {
  beforeEach(() => store.clear())

  it('lasts three minutes', () => {
    expect(isAloneTime(1000)).toBe(false)
    startAloneTime(1000)
    expect(isAloneTime(1000 + ALONE_MS - 1)).toBe(true)
    expect(isAloneTime(1000 + ALONE_MS)).toBe(false)
  })

  it('counts as dropped on the ✕ only inside its circle', () => {
    const zone = { x: 200, y: 700, radius: 44 }
    expect(overAloneZone(210, 690, zone)).toBe(true)
    expect(overAloneZone(200, 650, zone)).toBe(false)
  })

  it('a different switched-on companion comes back, or the same one when it is the only one', () => {
    const companions = [{ id: 1, is_active: true }, { id: 2, is_active: false }, { id: 3, is_active: true }]
    expect(pickAnotherCompanion(companions, 1, () => 0)?.id).toBe(3)
    expect(pickAnotherCompanion([{ id: 1, is_active: true }], 1)?.id).toBe(1)
  })
})
