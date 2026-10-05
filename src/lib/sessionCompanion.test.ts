import { describe, it, expect, beforeEach, vi } from 'vitest'
import { pickSessionCompanion, getSessionCompanionId, setSessionCompanionId, subscribeSessionCompanion } from './sessionCompanion'

// The test environment is Node, which has no sessionStorage.
const store = new Map<string, string>()
vi.stubGlobal('sessionStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
})

const pip = { id: 1, is_active: true, is_default: true }
const rue = { id: 2, is_active: true, is_default: false }
const sol = { id: 3, is_active: false, is_default: false }

describe('pickSessionCompanion', () => {
  it('keeps the current companion for the session, even a switched-off one that was tapped', () => {
    expect(pickSessionCompanion([pip, rue, sol], 2)).toBe(rue)
    expect(pickSessionCompanion([pip, rue, sol], 3)).toBe(sol)
  })

  it('picks a random active companion when none is current', () => {
    expect(pickSessionCompanion([pip, rue, sol], null, () => 0)).toBe(pip)
    expect(pickSessionCompanion([pip, rue, sol], null, () => 0.99)).toBe(rue)
  })

  it('picks again when the current companion was deleted', () => {
    expect(pickSessionCompanion([pip, sol], 2, () => 0)).toBe(pip)
  })

  it('falls back to the default companion when none are active', () => {
    const off = { ...pip, is_active: false }
    expect(pickSessionCompanion([off, sol], null)).toBe(off)
  })
})

describe('session companion store', () => {
  beforeEach(() => store.clear())

  it('stores the pick and notifies listeners only on change', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeSessionCompanion(listener)

    setSessionCompanionId(2)
    setSessionCompanionId(2)
    expect(getSessionCompanionId()).toBe(2)
    expect(listener).toHaveBeenCalledTimes(1)

    setSessionCompanionId(null)
    expect(getSessionCompanionId()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    setSessionCompanionId(1)
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
