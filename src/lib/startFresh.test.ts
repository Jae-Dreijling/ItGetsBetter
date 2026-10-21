import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { startFresh, freshAreas, areaContents, describeCount, PROFILE_AREA_ID } from './startFresh'
import { SEEDED_KEY } from '../hooks/usePersonalityGroups'

// The test environment is Node, which has no localStorage.
const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() { return store.size },
})

const all = () => new Set(freshAreas().map(a => a.id))
const allBut = (...ids: string[]) => new Set([...all()].filter(id => !ids.includes(id)))

async function seed() {
  await db.table('userProfile').add({ display_name: 'Me' })
  await db.table('weightEntries').add({ date: '2026-10-01', weight_kg: 90 })
  await db.table('weightEntries').add({ date: '2026-10-02', weight_kg: 89 })
  await db.table('habits').add({ name: 'Walk' })
  await db.table('companions').add({ name: 'Pip' })
  await db.table('personalityGroups').add({ name: 'The Coach' })
  await db.folders.add({ area: 'companions', name: 'Obey Me', emoji: '😈', created_at: '' })
  await db.folders.add({ area: 'recipes', name: 'Breakfast', emoji: '🍳', created_at: '' })
  store.set(SEEDED_KEY, '1')
  store.set('igb_pin_hash', 'abc')
  store.set('igb_guild_room', 'x')
}

describe('startFresh', () => {
  beforeEach(async () => {
    await clearDb()
    store.clear()
    await seed()
  })

  it('every table belongs to some part, so nothing goes unlisted', () => {
    const covered = new Set(freshAreas().flatMap(a => a.tables))
    for (const table of db.tables.map(t => t.name).filter(n => n !== 'folders')) expect(covered).toContain(table)
  })

  it('lists what each part holds', async () => {
    const contents = await areaContents()
    const weight = contents.find(c => c.area.id === 'weight')!
    expect(weight.counts.map(c => describeCount(c.table, c.count))).toEqual(['2 weigh-ins'])
    expect(contents.find(c => c.area.id === 'companions')!.folders).toBe(1)
  })

  it('wipes everything when everything is ticked', async () => {
    await startFresh(all())
    for (const table of db.tables) expect(await table.count()).toBe(0)
    expect(store.size).toBe(0)
  })

  it('keeps every unticked part, with its folders and settings', async () => {
    await startFresh(allBut('companions'))
    expect(await db.table('companions').count()).toBe(1)
    expect(await db.table('personalityGroups').count()).toBe(1)
    expect((await db.folders.toArray()).map(f => f.name)).toEqual(['Obey Me'])
    expect(await db.table('weightEntries').count()).toBe(0)
    expect(await db.table('userProfile').count()).toBe(0)
    expect([...store.keys()]).toEqual([SEEDED_KEY])
  })

  it('keeping the profile keeps settings, and removes only the ticked parts', async () => {
    await startFresh(new Set(['weight', 'journey']))
    expect(await db.table('weightEntries').count()).toBe(0)
    expect(await db.table('habits').count()).toBe(1)
    expect(await db.table('userProfile').count()).toBe(1)
    expect(store.get('igb_pin_hash')).toBe('abc')
    expect(store.has('igb_guild_room')).toBe(false)
  })

  it('the profile part takes your profile and settings', async () => {
    await startFresh(new Set([PROFILE_AREA_ID]))
    expect(await db.table('userProfile').count()).toBe(0)
    expect(store.has('igb_pin_hash')).toBe(false)
    expect(await db.table('weightEntries').count()).toBe(2)
  })
})
