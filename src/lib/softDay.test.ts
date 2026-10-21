import { describe, it, expect, vi } from 'vitest'
import { isQuietToday, setQuietToday, speaksWhenQuiet } from './softDay'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
})

describe('quiet today', () => {
  it('lasts until tomorrow', () => {
    setQuietToday(true, '2026-10-21')
    expect(isQuietToday('2026-10-21')).toBe(true)
    expect(isQuietToday('2026-10-22')).toBe(false)
    setQuietToday(false, '2026-10-21')
    expect(isQuietToday('2026-10-21')).toBe(false)
  })

  it('still answers your own taps, nothing else', () => {
    expect(speaksWhenQuiet('general')).toBe(true)
    expect(speaksWhenQuiet('tapped_a_lot')).toBe(true)
    expect(speaksWhenQuiet('meal_logged')).toBe(false)
    expect(speaksWhenQuiet('idle')).toBe(false)
  })
})
