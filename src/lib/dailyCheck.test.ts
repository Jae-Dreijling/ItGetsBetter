import { describe, it, expect } from 'vitest'
import { pickCheck, checkWeights, seededRandom, CHECKS, type CheckKind } from './dailyCheck'

const ALL = CHECKS.map(c => c.kind)

function datesIn(year: number): string[] {
  const out: string[] = []
  for (let d = new Date(Date.UTC(year, 0, 1)); d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

function share(kind: CheckKind, picks: (CheckKind | null)[]) {
  return picks.filter(p => p === kind).length / picks.length
}

describe('daily check', () => {
  it('picks the same question for the same day', () => {
    expect(pickCheck('2026-10-05', ALL, {})).toBe(pickCheck('2026-10-05', ALL, {}))
    expect(seededRandom('a')).toBe(seededRandom('a'))
  })

  it('only asks about eligible checks', () => {
    for (const date of datesIn(2026).slice(0, 60)) {
      expect(['mood', 'win']).toContain(pickCheck(date, ['mood', 'win'], {}))
    }
    expect(pickCheck('2026-10-05', [], {})).toBeNull()
  })

  it('makes recently logged things less likely and long gaps more likely', () => {
    const fresh = Object.fromEntries(ALL.map(k => [k, 2])) as Record<CheckKind, number>
    const weights = checkWeights(ALL, { ...fresh, weight: 0, sleep: 10 })
    const byKind = Object.fromEntries(weights.map(w => [w.kind, w.weight]))
    expect(byKind.weight).toBeCloseTo(35 * 0.3)
    expect(byKind.sleep).toBe(20 * 2)
    expect(byKind.mood).toBe(20)
  })

  it('roughly follows the chances over a year', () => {
    const fresh = Object.fromEntries(ALL.map(k => [k, 2]))
    const picks = datesIn(2026).map(d => pickCheck(d, ALL, fresh))
    // weight is 35% of the base chances; allow sampling noise
    expect(share('weight', picks)).toBeGreaterThan(0.25)
    expect(share('weight', picks)).toBeLessThan(0.45)
    expect(share('photo', picks)).toBeLessThan(0.12)
    expect(new Set(picks).size).toBe(ALL.length)
  })
})
