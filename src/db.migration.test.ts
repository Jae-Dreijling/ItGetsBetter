import { describe, it, expect } from 'vitest'
import Dexie from 'dexie'
import { ItGetsBetterDB } from './db'

// Creates a database as an older app version left it, then opens it with the
// current schema so the real upgrade functions run.
async function createV15(name: string, seed: (db: Dexie) => Promise<void>) {
  const old = new Dexie(name)
  old.version(15).stores({ companions: '++id', customQuotes: '++id' })
  await old.open()
  await seed(old)
  old.close()
}

describe('database upgrades', () => {
  it('v16 moves My Quotes into the default companion and removes the table', async () => {
    const name = `migration-${crypto.randomUUID()}`
    await createV15(name, async old => {
      await old.table('companions').bulkAdd([
        { name: 'Rue', is_default: false, messages: { general: [] } },
        { name: 'ItGetsBetter', is_default: true, messages: { general: ['Hi {name}'] } },
      ])
      await old.table('customQuotes').bulkAdd([
        { text: 'Keep going', created_at: '2026-06-01' },
        { text: 'One step at a time', created_at: '2026-06-02' },
      ])
    })

    const db = new ItGetsBetterDB(name)
    await db.open()

    expect(db.tables.map(t => t.name)).not.toContain('customQuotes')
    const companions = await db.companions.orderBy('id').toArray()
    expect(companions[0].messages.general).toEqual([])
    expect(companions[1].messages.general).toEqual(['Hi {name}', 'Keep going', 'One step at a time'])
    db.close()
  })

  it('v16 leaves companions alone when there were no quotes', async () => {
    const name = `migration-${crypto.randomUUID()}`
    await createV15(name, async old => {
      await old.table('companions').add({ name: 'ItGetsBetter', is_default: true, messages: { general: ['Hi'] } })
    })

    const db = new ItGetsBetterDB(name)
    await db.open()

    const [companion] = await db.companions.toArray()
    expect(companion.messages.general).toEqual(['Hi'])
    db.close()
  })
})
