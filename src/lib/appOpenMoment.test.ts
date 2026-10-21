import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { appOpenMoment } from './appOpenMoment'
import { getLogicalDate } from './date'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
})

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString()

describe('what to say when the app opens', () => {
  beforeEach(async () => {
    await clearDb()
    store.clear()
  })

  it("names today's birthday once a day", async () => {
    const mmdd = getLogicalDate().slice(5)
    await db.people.add({ name: 'Sam', emoji: '🙂', group: 'friend', birthday: mmdd, birth_year: null, notes: null, rhythm_days: null, prefer: 'either', archived: false, created_at: '' })
    expect(await appOpenMoment()).toEqual({ event: 'birthday_today', values: { person: 'Sam' } })
    expect(await appOpenMoment()).toBeNull()
  })

  it('announces a new abstinence milestone, but not the old ones it finds the first time', async () => {
    const id = await db.abstinenceCounters.add({ name: 'energy drinks', emoji: '☕', started_at: daysAgo(10), why: null, cost_per_day: null, archived: false, created_at: '' }) as number
    expect(await appOpenMoment()).toBeNull()
    // Four days later the two-week milestone is new.
    await db.abstinenceCounters.update(id, { started_at: daysAgo(15) })
    expect(await appOpenMoment()).toEqual({ event: 'abstinence_milestone', values: { thing: 'energy drinks', days: '2 weeks' } })
    expect(await appOpenMoment()).toBeNull()
  })
})
