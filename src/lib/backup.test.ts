import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { collectBackupData, applyBackupData, createBackup, restoreBackup } from './backup'

// The test environment is Node, which has no localStorage.
const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
})

// One row per table, with a value for the table's primary key where it isn't
// auto-incremented (e.g. dayConfigs is keyed by date).
function sampleRow(tableName: string): Record<string, unknown> {
  const table = db.table(tableName)
  const pk = table.schema.primKey
  const row: Record<string, unknown> = { marker: `row-in-${tableName}` }
  if (!pk.auto && pk.keyPath) row[pk.keyPath as string] = `key-${tableName}`
  // Photo entries without a photo are dropped on restore by design.
  if (tableName === 'progressPhotos') row.photo = new Blob(['photo'], { type: 'image/jpeg' })
  return row
}

async function seedEveryTable() {
  for (const table of db.tables) {
    await table.add(sampleRow(table.name))
  }
}

// What actually lands in a backup file: JSON, which loses anything not encoded.
function throughJson<T>(data: T): unknown {
  return JSON.parse(JSON.stringify(data))
}

describe('backup', () => {
  beforeEach(async () => {
    await clearDb()
    store.clear()
  })

  it('exports every table in the database', async () => {
    const data = await collectBackupData()
    expect(Object.keys(data.tables).sort()).toEqual(db.tables.map(t => t.name).sort())
  })

  it('round-trips a row from every table', async () => {
    await seedEveryTable()
    const data = throughJson(await collectBackupData())
    await clearDb()

    await applyBackupData(data)

    for (const table of db.tables) {
      const rows = await table.toArray()
      expect(rows, table.name).toHaveLength(1)
      expect(rows[0].marker, table.name).toBe(`row-in-${table.name}`)
    }
  })

  it('round-trips Blobs in any field', async () => {
    const avatar = new Blob(['avatar-bytes'], { type: 'image/png' })
    await db.table('companions').add({ name: 'Pip', avatar })
    await db.table('progressPhotos').add({ date: '2026-10-05', photo: new Blob(['photo'], { type: 'image/jpeg' }) })
    const data = throughJson(await collectBackupData())
    await clearDb()

    await applyBackupData(data)

    const [companion] = await db.table('companions').toArray()
    expect(companion.avatar).toBeInstanceOf(Blob)
    expect(companion.avatar.type).toBe('image/png')
    expect(await companion.avatar.text()).toBe('avatar-bytes')
    const [photo] = await db.table('progressPhotos').toArray()
    expect(await photo.photo.text()).toBe('photo')
  })

  it('replaces existing data instead of merging', async () => {
    await db.table('weightEntries').add({ date: '2026-01-01', weight_kg: 90 })
    const data = throughJson(await collectBackupData())
    await db.table('weightEntries').add({ date: '2026-02-01', weight_kg: 88 })

    await applyBackupData(data)

    expect(await db.table('weightEntries').count()).toBe(1)
  })

  it('restores guild rooms and defeated bosses from localStorage', async () => {
    await db.table('userProfile').add({ display_name: 'Test' })
    const data = await collectBackupData()
    const withProgress = { ...data, guildRoomsBuilt: ['library'], bossesDefeated: ['nightmare_moon'] }

    await applyBackupData(throughJson(withProgress))

    expect(store.get('igb_guild_library')).toBe('1')
    expect(store.get('igb_boss_nightmare_moon_won')).toBe('1')
  })

  it('skips tables this version of the app does not have', async () => {
    const data = await collectBackupData()
    const withOldTable = { ...data, tables: { ...data.tables, someRemovedTable: [{ a: 1 }] } }

    const result = await applyBackupData(throughJson(withOldTable))

    expect(result.skippedTables).toEqual(['someRemovedTable'])
  })

  describe('legacy (≤v5) backups', () => {
    const pngDataURL = 'data:image/png;base64,' + btoa('legacy-photo')

    it('restores top-level tables and data URL Blobs', async () => {
      await applyBackupData({
        version: 5,
        exportedAt: '2026-07-01T00:00:00Z',
        userProfile: [{ id: 1, display_name: 'Old' }],
        companions: [{ id: 1, name: 'Pip', avatar: pngDataURL }],
        progressPhotos: [
          { id: 1, date: '2026-06-01', photo: pngDataURL },
          { id: 2, date: '2026-06-02', photo: {} }, // corrupted by a pre-fix backup
        ],
        mealEntries: [{ id: 1, photo: {} }],
        tasks: [{ id: 1, title: 'Old task' }],
        guildRoomsBuilt: [],
        bossesDefeated: [],
      })

      const [companion] = await db.table('companions').toArray()
      expect(companion.avatar).toBeInstanceOf(Blob)
      expect(await companion.avatar.text()).toBe('legacy-photo')
      const photos = await db.table('progressPhotos').toArray()
      expect(photos.map(p => p.id)).toEqual([1])
      const [meal] = await db.table('mealEntries').toArray()
      expect(meal.photo).toBeNull()
      const [task] = await db.table('tasks').toArray()
      expect(task.show_in_today).toBe(true)
    })
  })

  it('rejects files that are not backups', async () => {
    await expect(applyBackupData({ hello: 'world' })).rejects.toThrow('Invalid backup file format')
    await expect(applyBackupData({ version: 6, tables: {} })).rejects.toThrow('Invalid backup file format')
  })

  it('encrypts and decrypts a full backup', async () => {
    await db.table('userProfile').add({ display_name: 'Encrypted' })
    const file = await createBackup('correct horse')
    await clearDb()

    await restoreBackup(file, 'correct horse')

    const [profile] = await db.table('userProfile').toArray()
    expect(profile.display_name).toBe('Encrypted')
  })

  it('fails clearly on a wrong password', async () => {
    const file = await createBackup('right')
    await expect(restoreBackup(file, 'wrong')).rejects.toThrow('Wrong password or corrupted backup file')
  })
})
