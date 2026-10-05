import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { startFresh } from './startFresh'
import { SEEDED_KEY } from '../hooks/usePersonalityGroups'

// The test environment is Node, which has no localStorage.
const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
})

async function seed() {
  await db.table('userProfile').add({ display_name: 'Me' })
  await db.table('weightEntries').add({ date: '2026-10-01', weight_kg: 90 })
  await db.table('habits').add({ name: 'Walk' })
  await db.table('companions').add({ name: 'Pip' })
  await db.table('personalityGroups').add({ name: 'The Coach' })
  store.set(SEEDED_KEY, '1')
  store.set('igb_pin_hash', 'abc')
  store.set('igb_current_focus', 'weight')
}

describe('startFresh', () => {
  beforeEach(async () => {
    await clearDb()
    store.clear()
    await seed()
  })

  it('wipes everything when not keeping companions', async () => {
    await startFresh({ keepCompanions: false })

    for (const table of db.tables) {
      expect(await table.count(), table.name).toBe(0)
    }
    expect(store.size).toBe(0)
  })

  it('keeps companions and personality groups when asked', async () => {
    await startFresh({ keepCompanions: true })

    expect(await db.table('companions').count()).toBe(1)
    expect(await db.table('personalityGroups').count()).toBe(1)
    expect(await db.table('userProfile').count()).toBe(0)
    expect(await db.table('weightEntries').count()).toBe(0)
    expect(await db.table('habits').count()).toBe(0)
  })

  it('keeps only the companion-related settings when keeping companions', async () => {
    await startFresh({ keepCompanions: true })

    expect(store.get(SEEDED_KEY)).toBe('1')
    expect(store.has('igb_pin_hash')).toBe(false)
    expect(store.has('igb_current_focus')).toBe(false)
  })
})
