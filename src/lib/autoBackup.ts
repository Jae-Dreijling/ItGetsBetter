import { isNativeApp } from './platform'
import { createBackup } from './backup'
import { blobToBase64 } from './saveFile'

// Automatic weekly backups in the Android app (step 4). Uninstalling the app
// deletes its data, so backups go to the shared Documents folder, which
// survives that. They're encrypted with a password chosen once and kept in the
// app's own storage (never in a backup). Restoring works through the normal
// restore picker on the Backup page.

export const AUTO_BACKUP_FOLDER = 'ItGetsBetter'
export const AUTO_BACKUP_KEEP = 4
const INTERVAL_DAYS = 7
const PASSWORD_KEY = 'igb_auto_backup_password'
const LAST_KEY = 'igb_auto_backup_last'
const FILE_PREFIX = 'itgetsbetter-auto-'

function read(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

export function isAutoBackupOn(): boolean {
  return !!read(PASSWORD_KEY)
}

export function lastAutoBackup(): string | null {
  return read(LAST_KEY)
}

export function enableAutoBackup(password: string) {
  localStorage.setItem(PASSWORD_KEY, password)
}

export function disableAutoBackup() {
  localStorage.removeItem(PASSWORD_KEY)
  localStorage.removeItem(LAST_KEY)
}

export function isBackupDue(lastISO: string | null, now: Date): boolean {
  if (!lastISO) return true
  const last = new Date(lastISO).getTime()
  return Number.isNaN(last) || now.getTime() - last >= INTERVAL_DAYS * 24 * 60 * 60 * 1000
}

export function autoBackupFilename(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${FILE_PREFIX}${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.igb`
}

// Our automatic backups beyond the newest `keep`. Dated names sort by date.
export function backupsToRemove(filenames: string[], keep = AUTO_BACKUP_KEEP): string[] {
  return filenames
    .filter(name => name.startsWith(FILE_PREFIX) && name.endsWith('.igb'))
    .sort()
    .reverse()
    .slice(keep)
}

async function filesystem() {
  return import('@capacitor/filesystem')
}

// Writes a backup now, then tidies up older ones. Throws if it can't write.
export async function runAutoBackup(now = new Date()) {
  const password = read(PASSWORD_KEY)
  if (!isNativeApp() || !password) return
  const { Filesystem, Directory } = await filesystem()
  const blob = await createBackup(password)
  await Filesystem.writeFile({
    path: `${AUTO_BACKUP_FOLDER}/${autoBackupFilename(now)}`,
    data: await blobToBase64(blob),
    directory: Directory.Documents,
    recursive: true,
  })
  localStorage.setItem(LAST_KEY, now.toISOString())

  const { files } = await Filesystem.readdir({ path: AUTO_BACKUP_FOLDER, directory: Directory.Documents })
  for (const name of backupsToRemove(files.map(f => f.name))) {
    await Filesystem.deleteFile({ path: `${AUTO_BACKUP_FOLDER}/${name}`, directory: Directory.Documents })
  }
}

let running = false

// Called on app start and resume: backs up when a week has passed. Quiet on
// failure; the Backup page shows when the last one was made.
export function backupIfDue() {
  if (running || !isNativeApp() || !isAutoBackupOn() || !isBackupDue(lastAutoBackup(), new Date())) return
  running = true
  runAutoBackup()
    .catch(err => console.warn('Automatic backup failed', err))
    .finally(() => { running = false })
}
