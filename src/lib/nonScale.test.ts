import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { isCheckDue, winsFrom, summary } from './nonScale'
import { saveNonScaleCheck } from '../hooks/useNonScale'

describe('non-scale check-in', () => {
  it('is due about once a month', () => {
    expect(isCheckDue(null, '2026-10-21')).toBe(true)
    expect(isCheckDue('2026-10-01', '2026-10-21')).toBe(false)
    expect(isCheckDue('2026-09-23', '2026-10-21')).toBe(true)
  })

  it('turns every "better" and the note into wins, in order', () => {
    expect(winsFrom({ sleep: 'better', energy: 'better', clothes: 'same' }, '  Took the stairs at work ')).toEqual([
      'More energy', 'Sleeping better', 'Took the stairs at work',
    ])
    expect(summary({ energy: 'better', clothes: 'better' })).toBe('more energy · clothes fit better')
    expect(summary({ energy: 'same' })).toBeNull()
  })
})

describe('saving a check-in', () => {
  beforeEach(clearDb)

  it('adds wins and pays points once a month', async () => {
    await saveNonScaleCheck({ energy: 'better', mood: 'same' }, null)
    await saveNonScaleCheck({ clothes: 'better' }, 'Bought jeans a size down')
    expect(await db.nonScaleChecks.count()).toBe(2)
    expect((await db.wins.toArray()).map(w => [w.source, w.text])).toEqual([
      ['non_scale', 'More energy'],
      ['non_scale', 'Clothes fit better'],
      ['non_scale', 'Bought jeans a size down'],
    ])
    expect(await db.pointsTransactions.where('source_type').equals('non_scale_check').count()).toBe(1)
  })
})
