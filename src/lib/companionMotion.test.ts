import { describe, it, expect } from 'vitest'
import { nextDelay, pickMove } from './companionMotion'

const bounds = { left: 0, right: 334, top: 56, bottom: 724 }
// Feeds pickMove a fixed list of "random" numbers.
const seq = (...values: number[]) => { let i = 0; return () => values[i++ % values.length] }

describe('companion wandering', () => {
  it('waits a random 30 s to 2 min when calm, 15-45 s when lively, never when still', () => {
    expect(nextDelay('calm', 0)).toBe(30_000)
    expect(nextDelay('calm', 1)).toBe(120_000)
    expect(nextDelay('calm', 0.5)).toBe(75_000)
    expect(nextDelay('lively', 0)).toBe(15_000)
    expect(nextDelay('lively', 1)).toBe(45_000)
    expect(nextDelay('still', 0.5)).toBeNull()
  })

  it('drifts up or down and turns around at an edge', () => {
    expect(pickMove({ x: 300, y: 400 }, bounds, 56, seq(0.1, 0.5, 0.2))).toEqual({ type: 'drift', y: 320 })
    // Near the top, an upward drift becomes a downward one.
    expect(pickMove({ x: 300, y: 70 }, bounds, 56, seq(0.1, 0.5, 0.2))).toEqual({ type: 'drift', y: 150 })
  })

  it('peeks towards the middle from either side', () => {
    expect(pickMove({ x: 300, y: 400 }, bounds, 56, seq(0.6))).toEqual({ type: 'peek', x: 272 })
    expect(pickMove({ x: 10, y: 400 }, bounds, 56, seq(0.6))).toEqual({ type: 'peek', x: 38 })
  })

  it('leaves by the nearest side and comes back on the other', () => {
    expect(pickMove({ x: 300, y: 400 }, bounds, 56, seq(0.9))).toEqual({ type: 'wrap', exitX: 390, enterX: -56, endX: 0 })
    expect(pickMove({ x: 10, y: 400 }, bounds, 56, seq(0.9))).toEqual({ type: 'wrap', exitX: -56, enterX: 390, endX: 334 })
  })
})
