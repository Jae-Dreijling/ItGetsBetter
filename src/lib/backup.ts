import { db } from '../db'
import { GUILD_ROOMS } from './game'
import { BOSSES } from './bosses'

// JSON.stringify silently turns Blob fields into `{}` — encode them as data
// URLs before stringifying, and decode them back to Blobs on restore.
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function dataURLToBlob(dataURL: string): Promise<Blob> {
  const res = await fetch(dataURL)
  return res.blob()
}

// `data` here is always dynamic (it comes from db.table().toArray() ahead of
// JSON.stringify, or from JSON.parse of an untrusted/legacy file on restore),
// so these operate on plain records rather than the strict entity types.
async function encodeBlobField(rows: Record<string, any>[], field: string): Promise<Record<string, any>[]> {
  return Promise.all(rows.map(async row => {
    const value = row[field]
    if (value instanceof Blob) return { ...row, [field]: await blobToDataURL(value) }
    return row
  }))
}

// Restores real Blobs from data URLs; any other value (including the `{}`
// left behind by backups made before this fix) is nulled out rather than
// carried forward as a fake Blob that would crash on URL.createObjectURL.
async function decodeBlobField(rows: Record<string, any>[], field: string): Promise<Record<string, any>[]> {
  return Promise.all(rows.map(async row => {
    const value = row[field]
    if (typeof value === 'string' && value.startsWith('data:')) {
      return { ...row, [field]: await dataURLToBlob(value) }
    }
    return { ...row, [field]: null }
  }))
}

// For fields that must always be a real Blob (e.g. progress photos): rows
// that can't be decoded (corrupted by a pre-fix backup) are dropped instead
// of being kept around with a null/fake photo that would crash the viewer.
async function decodeRequiredBlobField(rows: Record<string, any>[], field: string): Promise<Record<string, any>[]> {
  const decoded = await Promise.all(rows.map(async row => {
    const value = row[field]
    if (typeof value === 'string' && value.startsWith('data:')) {
      return { ...row, [field]: await dataURLToBlob(value) }
    }
    return null
  }))
  return decoded.filter((row): row is Record<string, any> => row !== null)
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
  const data = {
    version: 5,
    exportedAt: new Date().toISOString(),
    userProfile: await db.userProfile.toArray(),
    weightEntries: await db.weightEntries.toArray(),
    mealEntries: await encodeBlobField(await db.mealEntries.toArray(), 'photo'),
    measurements: await db.measurements.toArray(),
    appOpenLog: await db.appOpenLog.toArray(),
    labels: await db.labels.toArray(),
    habits: await db.habits.toArray(),
    habitCompletions: await db.habitCompletions.toArray(),
    tasks: await db.tasks.toArray(),
    projects: await db.projects.toArray(),
    waterEntries: await db.waterEntries.toArray(),
    exerciseEntries: await db.exerciseEntries.toArray(),
    moodEntries: await db.moodEntries.toArray(),
    moodTags: await db.moodTags.toArray(),
    sleepEntries: await db.sleepEntries.toArray(),
    medicines: await db.medicines.toArray(),
    medicineLogs: await db.medicineLogs.toArray(),
    pointsTransactions: await db.pointsTransactions.toArray(),
    rewards: await db.rewards.toArray(),
    rewardClaims: await db.rewardClaims.toArray(),
    achievements: await db.achievements.toArray(),
    progressPhotos: await encodeBlobField(await db.progressPhotos.toArray(), 'photo'),
    healthInsights: await db.table('healthInsights').toArray(),
    customQuotes: await db.table('customQuotes').toArray(),
    scheduleProfiles: await db.table('scheduleProfiles').toArray(),
    dayConfigs: await db.table('dayConfigs').toArray(),
    groceryLists: await db.groceryLists.toArray(),
    groceryItems: await db.groceryItems.toArray(),
    books: await db.books.toArray(),
    companions: await encodeBlobField(await db.companions.toArray(), 'avatar'),
    motivationNotes: await encodeBlobField(await db.motivationNotes.toArray(), 'photo'),
    gameState: await db.gameState.toArray(),
    gameQuests: await db.gameQuests.toArray(),
    gameCompanionAffinity: await db.gameCompanionAffinity.toArray(),
    gameCustomQuestions: await db.gameCustomQuestions.toArray(),
    fastingRecords: await db.fastingRecords.toArray(),
    personalityGroups: await db.personalityGroups.toArray(),
    guildRoomsBuilt: GUILD_ROOMS.filter(r => localStorage.getItem(`igb_guild_${r.id}`) === '1').map(r => r.id),
    bossesDefeated: Object.keys(BOSSES).filter(id => localStorage.getItem(`igb_boss_${id}_won`) === '1'),
  }

  const json = JSON.stringify(data)
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

export async function restoreBackup(file: File, password: string): Promise<void> {
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
  const json = decoder.decode(plaintext)
  const data = JSON.parse(json)

  if (!data.version || !data.userProfile) {
    throw new Error('Invalid backup file format')
  }

  if (data.mealEntries?.length) data.mealEntries = await decodeBlobField(data.mealEntries, 'photo')
  if (data.progressPhotos?.length) data.progressPhotos = await decodeRequiredBlobField(data.progressPhotos, 'photo')
  if (data.companions?.length) data.companions = await decodeBlobField(data.companions, 'avatar')
  if (data.motivationNotes?.length) data.motivationNotes = await decodeBlobField(data.motivationNotes, 'photo')

  const allTables = [db.userProfile, db.weightEntries, db.mealEntries, db.measurements, db.appOpenLog, db.labels, db.habits, db.habitCompletions, db.tasks, db.projects, db.waterEntries, db.exerciseEntries, db.moodEntries, db.moodTags, db.sleepEntries, db.medicines, db.medicineLogs, db.pointsTransactions, db.rewards, db.rewardClaims, db.achievements, db.progressPhotos, db.table('healthInsights'), db.table('customQuotes'), db.table('scheduleProfiles'), db.table('dayConfigs'), db.groceryLists, db.groceryItems, db.books, db.companions, db.motivationNotes, db.gameState, db.gameQuests, db.gameCompanionAffinity, db.gameCustomQuestions, db.fastingRecords, db.personalityGroups]

  await db.transaction('rw', allTables, async () => {
      await db.userProfile.clear()
      await db.weightEntries.clear()
      await db.mealEntries.clear()
      await db.measurements.clear()
      await db.appOpenLog.clear()
      await db.labels.clear()
      await db.habits.clear()
      await db.habitCompletions.clear()
      await db.tasks.clear()
      await db.projects.clear()
      await db.waterEntries.clear()
      await db.exerciseEntries.clear()
      await db.moodEntries.clear()
      await db.moodTags.clear()
      await db.sleepEntries.clear()
      await db.medicines.clear()
      await db.medicineLogs.clear()
      await db.pointsTransactions.clear()
      await db.rewards.clear()
      await db.rewardClaims.clear()
      await db.achievements.clear()
      await db.progressPhotos.clear()
      await db.table('healthInsights').clear()
      await db.table('customQuotes').clear()
      await db.table('scheduleProfiles').clear()
      await db.table('dayConfigs').clear()
      await db.groceryLists.clear()
      await db.groceryItems.clear()
      await db.books.clear()
      await db.companions.clear()
      await db.motivationNotes.clear()
      await db.gameState.clear()
      await db.gameQuests.clear()
      await db.gameCompanionAffinity.clear()
      await db.gameCustomQuestions.clear()
      await db.fastingRecords.clear()
      await db.personalityGroups.clear()

      if (data.userProfile?.length) await db.userProfile.bulkAdd(data.userProfile)
      if (data.weightEntries?.length) await db.weightEntries.bulkAdd(data.weightEntries)
      if (data.mealEntries?.length) await db.mealEntries.bulkAdd(data.mealEntries)
      if (data.measurements?.length) await db.measurements.bulkAdd(data.measurements)
      if (data.appOpenLog?.length) await db.appOpenLog.bulkAdd(data.appOpenLog)
      if (data.labels?.length) await db.labels.bulkAdd(data.labels)
      if (data.habits?.length) await db.habits.bulkAdd(data.habits)
      if (data.habitCompletions?.length) await db.habitCompletions.bulkAdd(data.habitCompletions)
      if (data.tasks?.length) {
        const tasks = data.tasks.map((t: any) => ({ ...t, show_in_today: t.show_in_today ?? true }))
        await db.tasks.bulkAdd(tasks)
      }
      if (data.projects?.length) await db.projects.bulkAdd(data.projects)
      if (data.waterEntries?.length) await db.waterEntries.bulkAdd(data.waterEntries)
      if (data.exerciseEntries?.length) await db.exerciseEntries.bulkAdd(data.exerciseEntries)
      if (data.moodEntries?.length) await db.moodEntries.bulkAdd(data.moodEntries)
      if (data.moodTags?.length) await db.moodTags.bulkAdd(data.moodTags)
      if (data.sleepEntries?.length) await db.sleepEntries.bulkAdd(data.sleepEntries)
      if (data.medicines?.length) await db.medicines.bulkAdd(data.medicines)
      if (data.medicineLogs?.length) await db.medicineLogs.bulkAdd(data.medicineLogs)
      if (data.pointsTransactions?.length) await db.pointsTransactions.bulkAdd(data.pointsTransactions)
      if (data.rewards?.length) await db.rewards.bulkAdd(data.rewards)
      if (data.rewardClaims?.length) await db.rewardClaims.bulkAdd(data.rewardClaims)
      if (data.achievements?.length) await db.achievements.bulkAdd(data.achievements)
      if (data.progressPhotos?.length) await db.progressPhotos.bulkAdd(data.progressPhotos)
      if (data.healthInsights?.length) await db.table('healthInsights').bulkAdd(data.healthInsights)
      if (data.customQuotes?.length) await db.table('customQuotes').bulkAdd(data.customQuotes)
      if (data.scheduleProfiles?.length) await db.table('scheduleProfiles').bulkAdd(data.scheduleProfiles)
      if (data.dayConfigs?.length) await db.table('dayConfigs').bulkAdd(data.dayConfigs)
      if (data.groceryLists?.length) await db.groceryLists.bulkAdd(data.groceryLists)
      if (data.groceryItems?.length) await db.groceryItems.bulkAdd(data.groceryItems)
      if (data.books?.length) await db.books.bulkAdd(data.books)
      if (data.companions?.length) await db.companions.bulkAdd(data.companions)
      if (data.motivationNotes?.length) await db.motivationNotes.bulkAdd(data.motivationNotes)
      if (data.gameState?.length) await db.gameState.bulkAdd(data.gameState)
      if (data.gameQuests?.length) await db.gameQuests.bulkAdd(data.gameQuests)
      if (data.gameCompanionAffinity?.length) await db.gameCompanionAffinity.bulkAdd(data.gameCompanionAffinity)
      if (data.gameCustomQuestions?.length) await db.gameCustomQuestions.bulkAdd(data.gameCustomQuestions)
      if (data.fastingRecords?.length) await db.fastingRecords.bulkAdd(data.fastingRecords)
      if (data.personalityGroups?.length) await db.personalityGroups.bulkAdd(data.personalityGroups)
    }
  )

  // Guild rooms built and defeated bosses live in localStorage, not IndexedDB.
  for (const room of GUILD_ROOMS) localStorage.removeItem(`igb_guild_${room.id}`)
  for (const id of data.guildRoomsBuilt ?? []) localStorage.setItem(`igb_guild_${id}`, '1')
  for (const id of Object.keys(BOSSES)) localStorage.removeItem(`igb_boss_${id}_won`)
  for (const id of data.bossesDefeated ?? []) localStorage.setItem(`igb_boss_${id}_won`, '1')
}

function arrayToBase64(arr: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i])
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
