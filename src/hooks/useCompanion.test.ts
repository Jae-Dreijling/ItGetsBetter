import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { ensureDefaultCompanion, deleteCompanion } from './useCompanion'

// The test environment is Node, which has no sessionStorage.
const session = new Map<string, string>()
vi.stubGlobal('sessionStorage', {
  getItem: (k: string) => session.get(k) ?? null,
  setItem: (k: string, v: string) => void session.set(k, v),
  removeItem: (k: string) => void session.delete(k),
})

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

describe('removing companions', () => {
  const base = { avatar: null, personality_group_id: null, messages: {} as never, created_at: '2026-10-06' }

  beforeEach(async () => {
    await clearDb()
    session.clear()
  })

  it("doesn't bring the built-in companion back once it was removed", async () => {
    await db.companions.add({ ...base, name: 'Pip', is_default: false, is_active: true })
    await ensureDefaultCompanion()
    expect((await db.companions.toArray()).map(c => c.name)).toEqual(['Pip'])
  })

  it('can remove the built-in companion when another exists', async () => {
    const builtIn = await db.companions.add({ ...base, name: 'ItGetsBetter', is_default: true, is_active: true }) as number
    await db.companions.add({ ...base, name: 'Pip', is_default: false, is_active: false })

    await deleteCompanion(builtIn)

    const left = await db.companions.toArray()
    expect(left.map(c => c.name)).toEqual(['Pip'])
    // It was the only active one, so Pip is switched on.
    expect(left[0].is_active).toBe(true)
  })

  it('never removes the last companion', async () => {
    const only = await db.companions.add({ ...base, name: 'ItGetsBetter', is_default: true, is_active: true }) as number
    await deleteCompanion(only)
    expect(await db.companions.count()).toBe(1)
  })
})
