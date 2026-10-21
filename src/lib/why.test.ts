import { describe, it, expect } from 'vitest'
import { pickReason, backAfterBreak } from './why'
import type { MotivationNote } from '../types'

const note = (id: number, category: string, text: string): MotivationNote => ({ id, category, text, photo: null, created_at: '' })

describe('your why', () => {
  it('prefers the asked-for categories, falls back to any, and skips photo-only notes', () => {
    const notes = [note(1, 'general', 'For my future self'), note(2, 'weight', 'To feel light on stairs'), note(3, 'health', '  ')]
    expect(pickReason(notes, ['weight'], 'x')?.id).toBe(2)
    expect(pickReason(notes, ['exercise'], 'x')).not.toBeNull()
    expect(pickReason([note(4, 'weight', '')], ['weight'], 'x')).toBeNull()
  })

  it('stays the same for the same seed', () => {
    const notes = [note(1, 'general', 'a'), note(2, 'general', 'b'), note(3, 'general', 'c')]
    expect(pickReason(notes, [], 'craving:5')).toEqual(pickReason([...notes].reverse(), [], 'craving:5'))
  })

  it('notices coming back after three or more days, judged by the last open before today', () => {
    expect(backAfterBreak(['2026-10-17', '2026-10-21'], '2026-10-21')).toBe(true)
    expect(backAfterBreak(['2026-10-19', '2026-10-21'], '2026-10-21')).toBe(false)
    expect(backAfterBreak(['2026-10-21'], '2026-10-21')).toBe(false)
  })
})
