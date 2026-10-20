import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../../db'
import { clearDb } from '../../test/dbHelpers'
import { voiceFor, DEFAULT_LINES } from './voice'

const base = { avatar: null, is_default: false, is_active: true, personality_group_id: null, created_at: '2026-10-06' }

describe('notification voice', () => {
  beforeEach(clearDb)

  it("uses the companion's name and its own reminder lines", async () => {
    await db.companions.add({ ...base, name: 'Pip', messages: { reminder_daily_check: ['Psst {name}, check time!'] } as never })
    const voice = await voiceFor('daily_check', '2026-10-06', 'Jae')
    expect(voice).toEqual({ title: 'Pip', body: 'Psst Jae, check time!' })
  })

  it("falls back to the personality group's lines, then to the defaults", async () => {
    const groupId = await db.personalityGroups.add({ name: 'Coach', description: '', messages: { reminder_floor: ['Floor time, {name}.'] } as never, created_at: '' })
    await db.companions.add({ ...base, name: 'Rue', personality_group_id: groupId as number, messages: {} as never })
    expect((await voiceFor('floor', '2026-10-06', 'Jae')).body).toBe('Floor time, Jae.')
    const daily = await voiceFor('daily_check', '2026-10-06', 'Jae')
    expect(DEFAULT_LINES.daily_check.map(l => l.replaceAll('{name}', 'Jae'))).toContain(daily.body)
  })

  it('picks the same speaker all day, from active companions only', async () => {
    await db.companions.bulkAdd([
      { ...base, name: 'Pip', messages: {} as never },
      { ...base, name: 'Sol', is_active: false, messages: {} as never },
    ])
    for (const date of ['2026-10-06', '2026-10-07', '2026-10-08']) {
      expect((await voiceFor('floor', date, 'Jae')).title).toBe('Pip')
    }
  })

  it('still speaks without any companion', async () => {
    expect((await voiceFor('floor', '2026-10-06', 'Jae')).title).toBe('ItGetsBetter')
  })
})
