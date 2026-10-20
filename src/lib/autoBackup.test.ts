import { describe, it, expect } from 'vitest'
import { isBackupDue, autoBackupFilename, backupsToRemove } from './autoBackup'

describe('automatic backups', () => {
  it('is due without a previous backup, and again after a week', () => {
    const now = new Date('2026-10-20T12:00:00')
    expect(isBackupDue(null, now)).toBe(true)
    expect(isBackupDue('garbage', now)).toBe(true)
    expect(isBackupDue(new Date('2026-10-14T12:00:01').toISOString(), now)).toBe(false)
    expect(isBackupDue(new Date('2026-10-13T12:00:00').toISOString(), now)).toBe(true)
  })

  it('names files by local date', () => {
    expect(autoBackupFilename(new Date('2026-03-05T23:30:00'))).toBe('itgetsbetter-auto-2026-03-05.igb')
  })

  it('keeps the newest four and never touches other files', () => {
    const names = [
      'itgetsbetter-auto-2026-09-01.igb',
      'itgetsbetter-auto-2026-10-20.igb',
      'itgetsbetter-auto-2026-09-22.igb',
      'itgetsbetter-auto-2026-10-13.igb',
      'itgetsbetter-auto-2026-09-29.igb',
      'itgetsbetter-backup-2026-01-01.igb',
      'notes.txt',
    ]
    expect(backupsToRemove(names)).toEqual(['itgetsbetter-auto-2026-09-01.igb'])
  })
})
