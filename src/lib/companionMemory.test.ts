import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { MEMORY_TOPICS, nextTopic, memoryReply, memoryValues } from './companionMemory'
import { onThisDay } from './onThisDay'
import { buildWeeklyNote } from './weeklyNote'
import { EMPTY_MESSAGES, getCompanionMessage } from '../hooks/useCompanion'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
})

describe('companion memory', () => {
  it('asks about things it does not know yet, until it knows them all', () => {
    const all = MEMORY_TOPICS.map(t => t.key)
    expect(nextTopic(all.slice(1), 5)!.key).toBe(all[0])
    expect(nextTopic(all, 5)).toBeNull()
  })

  it('answers with its own favourite when it has one', () => {
    expect(memoryReply('Sushi', 'gold coins')).toContain('Mine is gold coins')
    expect(memoryReply('Sushi', undefined)).toContain("I'll remember that")
  })

  it('only mentions what it remembers', () => {
    store.clear()
    const values = memoryValues([{ topic: 'food', answer: 'sushi' }])
    for (let i = 0; i < 6; i++) {
      const line = getCompanionMessage(EMPTY_MESSAGES, 'memory_mention', 'Jae', values)
      expect(line).toContain('sushi')
    }
  })
})

describe('on this day', () => {
  beforeEach(async () => {
    await clearDb()
    store.clear()
  })

  it('finds a win from a month ago today, once a day', async () => {
    await db.wins.add({ date: '2026-09-21', text: 'Walked to work', source: 'own', logged_at: '' })
    expect(await onThisDay('2026-10-21')).toEqual({ when: 'A month ago', text: 'Walked to work' })
    expect(await onThisDay('2026-10-21')).toBeNull()
  })
})

describe('weekly note', () => {
  const quiet = { habitTicks: 0, wins: 0, people: [], goalSteps: [], workouts: 0, cravingsPassed: 0, daysOpened: 1 }

  it("only lists what you did, in the companion's tone", () => {
    const note = buildWeeklyNote({ ...quiet, habitTicks: 9, people: ['Sam', 'Lisa'], goalSteps: ['Learn 4 chords'] }, 'sassy')
    expect(note[0]).toContain('weekly debrief')
    expect(note).toContain('You ticked off 9 habits.')
    expect(note).toContain('You spent time with Sam and Lisa.')
    expect(note.join(' ')).not.toMatch(/didn't|missed|only/)
  })

  it('is kind about a quiet week', () => {
    expect(buildWeeklyNote(quiet, null)).toContain('It was a quiet week, and quiet weeks count too. Resting is part of it.')
  })
})
