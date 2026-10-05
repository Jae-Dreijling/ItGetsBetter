import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { ensureDefaultCompanion } from './useCompanion'

describe('ensureDefaultCompanion', () => {
  beforeEach(clearDb)

  it('creates exactly one default companion, even when called concurrently', async () => {
    await Promise.all([ensureDefaultCompanion(), ensureDefaultCompanion(), ensureDefaultCompanion()])
    expect(await db.companions.filter(c => c.is_default === true).count()).toBe(1)
  })

  it('does nothing when a default companion already exists', async () => {
    await ensureDefaultCompanion()
    await ensureDefaultCompanion()
    expect(await db.companions.count()).toBe(1)
  })
})

describe('ensureDefaultCompanion with existing duplicates', () => {
  beforeEach(clearDb)

  it('keeps one default and turns the extras into deletable copies', async () => {
    const base = { avatar: null, is_active: true, personality_group_id: null, messages: {} as never, created_at: '2026-01-01' }
    await db.companions.bulkAdd([
      { ...base, name: 'ItGetsBetter', is_default: true },
      { ...base, name: 'ItGetsBetter', is_default: true, is_active: false },
    ])

    await ensureDefaultCompanion()

    const all = await db.companions.orderBy('id').toArray()
    expect(all).toHaveLength(2)
    expect(all.map(c => [c.name, c.is_default])).toEqual([
      ['ItGetsBetter', true],
      ['ItGetsBetter (copy)', false],
    ])
  })
})
