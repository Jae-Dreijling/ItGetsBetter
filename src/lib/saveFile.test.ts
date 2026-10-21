import { describe, it, expect } from 'vitest'
import { withTime } from './saveFile'

describe('saveFile fallback name', () => {
  it('adds the time before the extension', () => {
    const at = new Date(2026, 9, 20, 9, 5)
    expect(withTime('itgetsbetter-backup-2026-10-20.igb', at)).toBe('itgetsbetter-backup-2026-10-20-0905.igb')
    expect(withTime('notes', at)).toBe('notes-0905')
  })
})
