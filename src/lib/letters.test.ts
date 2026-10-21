import { describe, it, expect } from 'vitest'
import { isReady, unlockLabel, DATE_PRESETS } from './letters'
import type { FutureLetter, GoalMilestone } from '../types'

const letter = (unlock: FutureLetter['unlock']): FutureLetter => ({ id: 1, text: 'Hi future me', unlock, opened_at: null, created_at: '' })
const step = (id: number, done: boolean): GoalMilestone => ({
  id, track_id: 1, text: '−5 kg from where I started', order: 0, done_at: done ? '2026-11-01T00:00:00Z' : null,
  aim_for: null, treat: null, points_given: done, created_at: '',
})

describe('letters to future you', () => {
  it('opens on its date', () => {
    const l = letter({ kind: 'date', date: '2026-11-21' })
    expect(isReady(l, '2026-11-20', new Map())).toBe(false)
    expect(isReady(l, '2026-11-21', new Map())).toBe(true)
    expect(unlockLabel(l, new Map())).toBe('Opens 21 November 2026')
  })

  it('opens when its goal step is reached, or if the step is gone', () => {
    const l = letter({ kind: 'milestone', milestone_id: 7 })
    expect(isReady(l, '2026-10-21', new Map([[7, step(7, false)]]))).toBe(false)
    expect(isReady(l, '2026-10-21', new Map([[7, step(7, true)]]))).toBe(true)
    expect(isReady(l, '2026-10-21', new Map())).toBe(true)
    expect(unlockLabel(l, new Map([[7, step(7, false)]]))).toBe('Opens when you reach: −5 kg from where I started')
  })

  it('offers date presets from a month to a year ahead', () => {
    const from = new Date(2026, 9, 21)
    expect(DATE_PRESETS.map(p => p.date(from).toDateString())).toEqual([
      new Date(2026, 10, 21).toDateString(), new Date(2027, 0, 21).toDateString(),
      new Date(2027, 3, 21).toDateString(), new Date(2027, 9, 21).toDateString(),
    ])
  })
})
