import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '../db'
import { clearDb } from '../test/dbHelpers'
import { updateLoverDialogue, setLoverStatus, getCompanionAffinityRecord, questPeriod, generateQuestsIfNeeded } from './game'

describe('quest board', () => {
  beforeEach(async () => {
    await clearDb()
    await db.gameState.add({ activated: true, activated_at: null, sparks: 0, gold: 0, current_region: 'ponyville', risk_action_count: 0, last_risk_at: null })
  })
  afterEach(() => { vi.useRealTimers() })
  // Midday, so the 3 AM day boundary doesn't matter.
  const on = (date: string) => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(`${date}T12:00:00`)) }

  it('periods are calendar weeks (Monday to Sunday) and whole months, in any time zone', () => {
    expect(questPeriod('2026-10-22', true)).toEqual({ start: '2026-10-19', end: '2026-10-25' })
    expect(questPeriod('2026-10-25', true)).toEqual({ start: '2026-10-19', end: '2026-10-25' })
    expect(questPeriod('2026-10-26', true)).toEqual({ start: '2026-10-26', end: '2026-11-01' })
    expect(questPeriod('2026-10-22', false)).toEqual({ start: '2026-10-01', end: '2026-10-31' })
    expect(questPeriod('2028-02-10', false)).toEqual({ start: '2028-02-01', end: '2028-02-29' })
  })

  it('fills the board by itself, no extra quests after finishing early, new ones next week', async () => {
    on('2026-10-22')
    await Promise.all([generateQuestsIfNeeded(), generateQuestsIfNeeded()])
    let quests = await db.gameQuests.toArray()
    expect(quests.filter(q => q.is_weekly)).toHaveLength(3)
    expect(quests.filter(q => !q.is_weekly)).toHaveLength(3)
    expect(quests.find(q => q.is_weekly)).toMatchObject({ start_date: '2026-10-19', end_date: '2026-10-25' })
    expect(quests.find(q => !q.is_weekly)).toMatchObject({ start_date: '2026-10-01', end_date: '2026-10-31' })

    // Finishing one this week doesn't bring a new one until Monday.
    const done = quests.find(q => q.is_weekly)!
    await db.gameQuests.update(done.id!, { status: 'claimed' })
    await generateQuestsIfNeeded()
    expect(await db.gameQuests.where('status').equals('active').count()).toBe(5)

    // Next Monday: last week's open quests close, three new weekly ones arrive.
    on('2026-10-26')
    await generateQuestsIfNeeded()
    quests = await db.gameQuests.toArray()
    expect(quests.filter(q => q.is_weekly && q.status === 'expired')).toHaveLength(2)
    expect(quests.filter(q => q.is_weekly && q.status === 'active').map(q => q.start_date)).toEqual(['2026-10-26', '2026-10-26', '2026-10-26'])
    expect(quests.filter(q => !q.is_weekly && q.status === 'active')).toHaveLength(3)
  })
})

describe('updateLoverDialogue', () => {
  beforeEach(clearDb)

  it('creates an affinity record when none exists yet (regression: used to silently no-op)', async () => {
    await updateLoverDialogue(42, ['Hello there'])
    const record = await getCompanionAffinityRecord(42)
    expect(record?.lover_dialogue).toEqual(['Hello there'])
  })

  it('updates lover_dialogue on an existing record without resetting other fields', async () => {
    await db.gameCompanionAffinity.add({
      companion_id: 7,
      affinity: 55,
      is_lover: true,
      lover_dialogue: ['old line'],
      home_region: 'ponyville',
      is_discovered: true,
      last_visit_at: null,
      created_at: new Date().toISOString(),
    })
    await updateLoverDialogue(7, ['new line 1', 'new line 2'])
    const record = await getCompanionAffinityRecord(7)
    expect(record?.lover_dialogue).toEqual(['new line 1', 'new line 2'])
    expect(record?.affinity).toBe(55)
    expect(record?.is_lover).toBe(true)
  })
})

describe('setLoverStatus', () => {
  beforeEach(clearDb)

  it('sets is_lover on an existing affinity record', async () => {
    await db.gameCompanionAffinity.add({
      companion_id: 3,
      affinity: 100,
      is_lover: false,
      lover_dialogue: [],
      home_region: 'ponyville',
      is_discovered: true,
      last_visit_at: null,
      created_at: new Date().toISOString(),
    })
    await setLoverStatus(3, true)
    const record = await getCompanionAffinityRecord(3)
    expect(record?.is_lover).toBe(true)
  })
})
