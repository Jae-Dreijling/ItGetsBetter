import { describe, it, expect } from 'vitest'
import { floorHabits, floorProgress, toggleFloorPick, FLOOR_MAX } from './floor'

const habits = [
  { id: 1, is_active: true, is_floor: true },
  { id: 2, is_active: true, is_floor: false },
  { id: 3, is_active: false, is_floor: true },
  { id: 4, is_active: true, is_floor: true },
  { id: 5, is_active: true },
]

describe('daily floor', () => {
  it('uses active habits marked as floor', () => {
    expect(floorHabits(habits).map(h => h.id)).toEqual([1, 4])
  })

  it('is complete when every floor habit is done today', () => {
    const floor = floorHabits(habits)
    expect(floorProgress(floor, new Set([1]))).toEqual({ done: 1, total: 2, complete: false })
    expect(floorProgress(floor, new Set([1, 4, 2]))).toEqual({ done: 2, total: 2, complete: true })
    expect(floorProgress([], new Set()).complete).toBe(false)
  })

  it(`allows at most ${FLOOR_MAX} habits`, () => {
    let picked: number[] = []
    for (const id of [1, 2, 3, 4]) picked = toggleFloorPick(picked, id)
    expect(picked).toEqual([1, 2, 3])
    expect(toggleFloorPick(picked, 2)).toEqual([1, 3])
  })
})
