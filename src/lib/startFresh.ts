import { db } from '../db'
import { SEEDED_KEY } from '../hooks/usePersonalityGroups'

// Custom companions take a lot of writing to set up, so starting fresh can
// keep them (and the personality groups they draw messages from).
const COMPANION_TABLES = ['companions', 'personalityGroups']

// localStorage keys that belong to those tables. Without the seeded flag, the
// default personality groups the user deleted would be added back.
const COMPANION_STORAGE_KEYS = [SEEDED_KEY]

export async function startFresh({ keepCompanions }: { keepCompanions: boolean }): Promise<void> {
  const keptTables = new Set(keepCompanions ? COMPANION_TABLES : [])
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      if (!keptTables.has(table.name)) await table.clear()
    }
  })

  const keptStorage = keepCompanions
    ? COMPANION_STORAGE_KEYS.map(key => [key, localStorage.getItem(key)] as const)
    : []
  localStorage.clear()
  for (const [key, value] of keptStorage) {
    if (value !== null) localStorage.setItem(key, value)
  }
}
