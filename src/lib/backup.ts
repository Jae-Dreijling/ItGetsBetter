import { db } from '../db'

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
    version: 3,
    exportedAt: new Date().toISOString(),
    userProfile: await db.userProfile.toArray(),
    weightEntries: await db.weightEntries.toArray(),
    mealEntries: await db.mealEntries.toArray(),
    measurements: await db.measurements.toArray(),
    appOpenLog: await db.appOpenLog.toArray(),
    labels: await db.labels.toArray(),
    habits: await db.habits.toArray(),
    habitCompletions: await db.habitCompletions.toArray(),
    tasks: await db.tasks.toArray(),
    projects: await db.projects.toArray(),
    waterEntries: await db.waterEntries.toArray(),
    exerciseEntries: await db.exerciseEntries.toArray(),
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

  return new Blob([JSON.stringify(payload)], { type: 'application/json' })
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

  await db.transaction('rw',
    [db.userProfile, db.weightEntries, db.mealEntries, db.measurements, db.appOpenLog, db.labels, db.habits, db.habitCompletions, db.tasks, db.projects, db.waterEntries, db.exerciseEntries],
    async () => {
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
    }
  )
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
