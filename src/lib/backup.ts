import { db } from '../db'
import { GUILD_ROOMS } from './game'
import { BOSSES } from './bosses'
import { mergeQuotesIntoCompanions } from './quotesMigration'

// Backups cover every table in the database automatically: export and restore
// both loop over `db.tables`, so a table added in a future schema version is
// included without touching this file.
//
// Format history:
//   v6+  { version, exportedAt, tables: { [tableName]: rows[] }, ...localStorage extras }
//        Blobs (photos, avatars) anywhere in a row are stored as EncodedBlob.
//   ≤v5  every table at the top level; Blobs only in LEGACY_BLOB_FIELDS, as data URLs.
const BACKUP_VERSION = 6

type Row = Record<string, unknown>

interface EncodedBlob {
  __blob: true
  type: string
  base64: string
}

export interface BackupData {
  version: number
  exportedAt: string
  tables: Record<string, Row[]>
  guildRoomsBuilt: string[]
  bossesDefeated: string[]
}

// Blob fields in ≤v5 backups, which stored them as data URL strings.
const LEGACY_BLOB_FIELDS: Record<string, string> = {
  mealEntries: 'photo',
  rewards: 'image',
  progressPhotos: 'photo',
  companions: 'avatar',
  motivationNotes: 'photo',
}

// Rows that are useless without their Blob (a photo entry with no photo would
// crash the viewer), so they're dropped if the Blob can't be restored.
const REQUIRED_BLOB_FIELDS: Record<string, string> = {
  progressPhotos: 'photo',
}

// Restored rows skip Dexie's upgrade functions, so rows from older backups get
// the same defaults here that a schema upgrade would have given them.
const ROW_FIXUPS: Record<string, (row: Row) => Row> = {
  tasks: row => ({ ...row, show_in_today: row.show_in_today ?? true }),
}

// Tables that no longer exist but whose rows still matter: when an older
// backup contains them, their rows are folded into the restored data the same
// way the database upgrade that removed them did.
const REMOVED_TABLE_MERGES: Record<string, (restored: Record<string, Row[]>, rows: Row[]) => void> = {
  customQuotes: (restored, rows) => {
    restored.companions = mergeQuotesIntoCompanions(restored.companions ?? [], rows)
  },
}

function isEncodedBlob(value: unknown): value is EncodedBlob {
  return typeof value === 'object' && value !== null && (value as EncodedBlob).__blob === true
}

async function encodeBlob(blob: Blob): Promise<EncodedBlob> {
  return { __blob: true, type: blob.type, base64: arrayToBase64(new Uint8Array(await blob.arrayBuffer())) }
}

function decodeBlob(encoded: EncodedBlob): Blob {
  return new Blob([base64ToArray(encoded.base64) as Uint8Array<ArrayBuffer>], { type: encoded.type })
}

function dataURLToBlob(dataURL: string): Blob | null {
  const match = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(dataURL)
  if (!match) return null
  const [, type, isBase64, body] = match
  const bytes = isBase64 ? base64ToArray(body) : new TextEncoder().encode(decodeURIComponent(body))
  return new Blob([bytes as Uint8Array<ArrayBuffer>], { type })
}

// JSON.stringify silently turns Blobs into `{}`, so every top-level Blob field
// is encoded before export, whichever table or field it's in.
async function encodeRow(row: Row): Promise<Row> {
  const out: Row = {}
  for (const [key, value] of Object.entries(row)) {
    out[key] = value instanceof Blob ? await encodeBlob(value) : value
  }
  return out
}

function decodeRow(row: Row): Row {
  const out: Row = {}
  for (const [key, value] of Object.entries(row)) {
    out[key] = isEncodedBlob(value) ? decodeBlob(value) : value
  }
  return out
}

// ≤v5: data URL strings become Blobs again; anything else in a Blob field
// (including the `{}` left by very old backups) becomes null rather than a
// fake Blob that would crash on URL.createObjectURL.
function decodeLegacyRow(row: Row, blobField: string | undefined): Row {
  if (!blobField) return row
  const value = row[blobField]
  const blob = typeof value === 'string' && value.startsWith('data:') ? dataURLToBlob(value) : null
  return { ...row, [blobField]: blob }
}

export async function collectBackupData(): Promise<BackupData> {
  const tables: Record<string, Row[]> = {}
  for (const table of db.tables) {
    const rows = (await table.toArray()) as Row[]
    tables[table.name] = await Promise.all(rows.map(encodeRow))
  }

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tables,
    // Guild rooms built and defeated bosses live in localStorage, not IndexedDB.
    guildRoomsBuilt: GUILD_ROOMS.filter(r => localStorage.getItem(`igb_guild_${r.id}`) === '1').map(r => r.id),
    bossesDefeated: Object.keys(BOSSES).filter(id => localStorage.getItem(`igb_boss_${id}_won`) === '1'),
  }
}

// Replaces everything in the database with the backup's contents. Returns the
// names of tables in the backup that this version of the app doesn't have.
export async function applyBackupData(data: unknown): Promise<{ skippedTables: string[] }> {
  const raw = data as Record<string, unknown> | null
  if (!raw || typeof raw.version !== 'number') {
    throw new Error('Invalid backup file format')
  }

  const isLegacy = raw.version <= 5
  const sourceTables = (isLegacy ? raw : raw.tables) as Record<string, unknown> | undefined
  if (!sourceTables || !Array.isArray(sourceTables.userProfile)) {
    throw new Error('Invalid backup file format')
  }

  const knownTables = new Set(db.tables.map(t => t.name))
  const restored: Record<string, Row[]> = {}
  const removedTables: [string, Row[]][] = []
  const skippedTables: string[] = []

  for (const [name, value] of Object.entries(sourceTables)) {
    if (!Array.isArray(value)) continue // top-level metadata in ≤v5 files
    if (!knownTables.has(name)) {
      if (REMOVED_TABLE_MERGES[name]) removedTables.push([name, value as Row[]])
      else skippedTables.push(name)
      continue
    }
    let rows = (value as Row[]).map(row =>
      isLegacy ? decodeLegacyRow(row, LEGACY_BLOB_FIELDS[name]) : decodeRow(row),
    )
    const requiredField = REQUIRED_BLOB_FIELDS[name]
    if (requiredField) rows = rows.filter(row => row[requiredField] instanceof Blob)
    const fixup = ROW_FIXUPS[name]
    if (fixup) rows = rows.map(fixup)
    restored[name] = rows
  }
  for (const [name, rows] of removedTables) REMOVED_TABLE_MERGES[name](restored, rows)

  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear()
      const rows = restored[table.name]
      if (rows?.length) await table.bulkAdd(rows)
    }
  })

  const guildRoomsBuilt = Array.isArray(raw.guildRoomsBuilt) ? (raw.guildRoomsBuilt as string[]) : []
  const bossesDefeated = Array.isArray(raw.bossesDefeated) ? (raw.bossesDefeated as string[]) : []
  for (const room of GUILD_ROOMS) localStorage.removeItem(`igb_guild_${room.id}`)
  for (const id of guildRoomsBuilt) localStorage.setItem(`igb_guild_${id}`, '1')
  for (const id of Object.keys(BOSSES)) localStorage.removeItem(`igb_boss_${id}_won`)
  for (const id of bossesDefeated) localStorage.setItem(`igb_boss_${id}_won`, '1')

  return { skippedTables }
}

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function createBackup(password: string): Promise<Blob> {
  const json = JSON.stringify(await collectBackupData())
  const encoder = new TextEncoder()
  const plaintext = encoder.encode(json)

  const salt = new Uint8Array(16) as Uint8Array<ArrayBuffer>
  crypto.getRandomValues(salt)
  const iv = new Uint8Array(12) as Uint8Array<ArrayBuffer>
  crypto.getRandomValues(iv)
  const key = await deriveKey(password, salt)

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  )

  const payload = {
    salt: arrayToBase64(salt),
    iv: arrayToBase64(iv),
    ciphertext: arrayToBase64(new Uint8Array(ciphertext)),
  }

  return new Blob([JSON.stringify(payload)], { type: 'application/octet-stream' })
}

// Creates an encrypted backup and hands it to the browser as a download.
export async function downloadBackup(password: string): Promise<void> {
  const blob = await createBackup(password)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `itgetsbetter-backup-${new Date().toISOString().slice(0, 10)}.igb`
  a.click()
  URL.revokeObjectURL(url)
}

export async function restoreBackup(file: Blob, password: string): Promise<void> {
  const text = await file.text()
  const payload = JSON.parse(text)

  const salt = base64ToArray(payload.salt) as Uint8Array<ArrayBuffer>
  const iv = base64ToArray(payload.iv) as Uint8Array<ArrayBuffer>
  const ciphertext = base64ToArray(payload.ciphertext) as Uint8Array<ArrayBuffer>

  const key = await deriveKey(password, salt)

  let plaintext: ArrayBuffer
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )
  } catch {
    throw new Error('Wrong password or corrupted backup file')
  }

  const decoder = new TextDecoder()
  await applyBackupData(JSON.parse(decoder.decode(plaintext)))
}

// Built in chunks: String.fromCharCode(...bytes) on a multi-MB photo would
// overflow the call stack, and per-byte concatenation is very slow.
function arrayToBase64(arr: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < arr.length; i += chunkSize) {
    binary += String.fromCharCode(...arr.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function base64ToArray(base64: string): Uint8Array {
  const binary = atob(base64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i)
  }
  return arr
}
