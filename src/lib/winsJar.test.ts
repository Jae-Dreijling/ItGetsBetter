import { describe, it, expect } from 'vitest'
import { groupByMonth, winOfTheDay } from './winsJar'
import type { Win } from '../types'

const win = (id: number, date: string, text = `Win ${id}`): Win => ({ id, date, text, source: 'own', logged_at: `${date}T12:00:00Z` })

describe('wins jar', () => {
  it('groups by month, newest first', () => {
    const groups = groupByMonth([win(1, '2026-09-30'), win(2, '2026-10-21'), win(3, '2026-10-02')])
    expect(groups.map(g => [g.month, g.wins.map(w => w.id)])).toEqual([
      ['October 2026', [2, 3]],
      ['September 2026', [1]],
    ])
  })

  it('shows the same win all day and nothing for an empty jar', () => {
    const wins = [win(1, '2026-10-01'), win(2, '2026-10-02'), win(3, '2026-10-03')]
    expect(winOfTheDay(wins, '2026-10-21')).toEqual(winOfTheDay([...wins].reverse(), '2026-10-21'))
    expect(winOfTheDay([], '2026-10-21')).toBeNull()
  })
})
